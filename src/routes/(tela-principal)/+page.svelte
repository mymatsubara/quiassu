<script lang="ts">
	import { goto } from '$app/navigation';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { obtemDesenhoDaSecaoComArmaduras } from '$lib/geometry/secao';
	import { criaNovaSecao, type DadosSecao } from '$lib/project/projeto';
	import { projeto } from '$lib/stores/projeto';
	import Fuse from 'fuse.js';
	import { HelpCircle, MoreVertical, Plus, SquareStackIcon, X } from 'lucide-svelte';

	// Seções
	let pesquisaSecao: string = '';
	let secoesFiltradas: DadosSecao[] = [];

	$: {
		if (pesquisaSecao) {
			const secoes = $projeto.secoes.map((secao) => ({
				...secao,
				nome: secao.nome || 'Seção sem nome'
			}));
			const fuse = new Fuse(secoes, {
				keys: ['nome'],
				threshold: 0.4
			});
			secoesFiltradas = fuse.search(pesquisaSecao).map((r) => r.item);
		} else {
			secoesFiltradas = $projeto.secoes;
		}
	}

	function adicionaNovaSecao() {
		const novaSecao = criaNovaSecao($projeto);
		$projeto.secoes.unshift(novaSecao);
		$projeto = $projeto;
		goto(`/secao?id=${novaSecao.id}`);
	}

	function removeSecao(secao: DadosSecao) {
		$projeto.secoes = $projeto.secoes.filter((s) => s.id !== secao.id);
		$projeto = $projeto;
	}
</script>

<div class="flex h-10 items-center justify-between gap-2">
	<Input
		type="search"
		placeholder="Pesquisar seções"
		bind:value={pesquisaSecao}
		class="h-full max-w-xs bg-gray-50"
	/>
	<Button class="flex h-full items-center" on:click={() => adicionaNovaSecao()}
		><Plus class="mr-1 h-5 w-5" /> Nova seção</Button
	>
</div>

{#if $projeto.secoes.length === 0}
	<div class="mt-20 flex flex-col items-center justify-center gap-5">
		<SquareStackIcon strokeWidth={0.5} class="h-48 w-48 text-gray-800" />
		<div class="max-w mb-1 text-center text-muted-foreground">
			O projeto ainda não contém nenhuma seção
		</div>
		<Button class="text-md" on:click={() => adicionaNovaSecao()} size="lg"
			><Plus class="mr-2 h-6 w-6" /> Adicionar nova seção</Button
		>
	</div>
{:else if secoesFiltradas.length === 0}
	<div class="mt-20 flex flex-col items-center justify-center gap-5">
		<HelpCircle strokeWidth={0.5} class="h-48 w-48 text-gray-800" />
		<div class="max-w mb-1 text-center text-muted-foreground">
			Nenhuma seção encontrada para o filtro: '{pesquisaSecao}'
		</div>
	</div>
{:else}
	<div class="mt-8 grid gap-6 min-[550px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
		{#each secoesFiltradas as secao (secao.id)}
			{@const href = `/secao?id=${secao.id}`}
			<Card.Root class="h-max w-full shadow">
				<Card.Content class="flex w-full flex-col items-start p-4">
					<div class="aspect-square w-full">
						<Button class="h-full w-full" variant="ghost" {href}>
							<DrawingCanvas
								offset={0.95}
								drawing={obtemDesenhoDaSecaoComArmaduras(secao.secao, secao.armaduras)}
							/>
						</Button>
					</div>

					<div class="mt-1 flex w-full items-end justify-between px-2 pb-1">
						<div class="ml-1 flex flex-col gap-1">
							<a class="cursor-pointer text-base font-semibold" {href}>
								{secao.nome || 'Seção sem nome'}
							</a>
							<div class="text-xs font-medium text-muted-foreground">
								{new Date(secao.ultimaModificao).toLocaleTimeString('pt-BR', {
									day: 'numeric',
									month: 'numeric',
									year: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
									second: 'numeric'
								})}
							</div>
						</div>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="ghost" builders={[builder]} size="icon"
									><MoreVertical class="h-5 w-5" /></Button
								>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-40">
								<DropdownMenu.Group>
									<DropdownMenu.Item class="cursor-pointer" on:click={() => removeSecao(secao)}>
										<X class="mr-2 h-4 w-4" />
										<span>Remover</span>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}
