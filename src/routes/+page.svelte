<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import SaveProjectButton from '$lib/components/buttons/SaveProjectButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { obtemDesenhoDaSecaoComArmaduras } from '$lib/geometry/secao';
	import { criaNovaSecao, projetoVazio, type DadosSecao } from '$lib/project/projeto';
	import { arquivoProjeto, projeto } from '$lib/stores/projeto';
	import {
		FolderInput,
		MoreVertical,
		PenLine,
		Plus,
		SaveAll,
		SquareStackIcon,
		X
	} from 'lucide-svelte';

	function adicionaNovaSecao() {
		const novaSecao = criaNovaSecao($projeto);
		$projeto.secoes.unshift(novaSecao);
		$projeto = $projeto;
		goto(`${base}/secao?id=${novaSecao.id}`);
	}

	function removeSecao(secao: DadosSecao) {
		$projeto.secoes = $projeto.secoes.filter((s) => s.id !== secao.id);
		$projeto = $projeto;
	}
</script>

<div class="flex h-full flex-col">
	<nav class="border-b">
		<div class="container">
			<div class="flex h-16 items-center justify-between gap-2 py-4">
				<label class="flex w-full items-center gap-2">
					<PenLine class="h-5 w-5 cursor-pointer text-muted-foreground" />
					<input
						placeholder="Projeto sem nome"
						class="w-full overflow-hidden text-ellipsis whitespace-nowrap border-0 text-lg font-semibold focus:outline-0 sm:text-xl"
						type="text"
						title={$projeto.nome}
						bind:value={$projeto.nome}
					/>
				</label>

				<div class="ml-auto flex w-full justify-end gap-3">
					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<SaveProjectButton builders={[builder]} />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Salvar <DropdownMenu.Shortcut>(Ctrl+S)</DropdownMenu.Shortcut></p>
						</Tooltip.Content>
					</Tooltip.Root>

					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								class="rounded-full"
								variant="secondary"
								size="icon"
								on:click={async () => {
									if ('showOpenFilePicker' in window) {
										const [fileHandle] = await window.showOpenFilePicker({
											types: [{ description: 'JSON file', accept: { 'text/json': ['.json'] } }],
											multiple: false
										});
										try {
											$arquivoProjeto = fileHandle;
											const file = await fileHandle.getFile();
											const textData = await file.text();
											const data = JSON.parse(textData);

											$projeto = { ...projetoVazio(), ...data };
											console.log({ projeto });
										} catch (e) {
											alert('Arquivo inválido');
										}
									} else {
										alert('Não implementado ainda');
									}
								}}><FolderInput class="h-5 w-5" /></Button
							>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Abrir projeto <DropdownMenu.Shortcut>(Ctrl+O)</DropdownMenu.Shortcut></p>
						</Tooltip.Content>
					</Tooltip.Root>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="secondary" builders={[builder]} size="icon"
								><MoreVertical class="h-5 w-5" /></Button
							>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-60">
							<DropdownMenu.Label>Mais opções</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item>
									<SaveAll class="mr-2 h-4 w-4" />
									<span>Salvar como...</span>
									<DropdownMenu.Shortcut>Ctrl+Shift+S</DropdownMenu.Shortcut>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
			<div class="flex">
				<span class="border-b-2 border-b-slate-600 px-8 py-3 font-semibold">Seções</span>
				<!-- <span class="px-8 py-3">Resultados</span> -->
			</div>
		</div>
	</nav>

	<div class="container mt-10 pb-5">
		<div class="flex h-10 items-center justify-between gap-5">
			<Input type="search" placeholder="Pesquisar seção" class="h-full max-w-xs bg-gray-50" />
			<Button class="flex h-full items-center" on:click={() => adicionaNovaSecao()}
				><Plus class="mr-1 h-5 w-5" /> Nova seção</Button
			>
		</div>

		{#if $projeto.secoes.length === 0}
			<div class="mt-20 flex flex-col items-center justify-center gap-5">
				<SquareStackIcon strokeWidth={1} class="h-48 w-48" />
				<div class="max-w mb-1 text-center text-muted-foreground">
					O projeto ainda não contém nenhuma seção
				</div>
				<Button class="text-md" on:click={() => adicionaNovaSecao()} size="lg"
					><Plus class="mr-2 h-6 w-6" /> Adicionar nova seção</Button
				>
			</div>
		{/if}

		<div
			class="mt-8 grid gap-6 min-[550px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
		>
			{#each $projeto.secoes as secao (secao.id)}
				{@const href = `${base}/secao?id=${secao.id}`}
				<Card.Root class="h-max w-full shadow">
					<Card.Content class="flex w-full flex-col items-start p-4">
						<div class="aspect-square w-full">
							<Button class="h-full w-full" variant="ghost" {href}>
								<DrawingCanvas
									offset={0.9}
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
									<!-- <DropdownMenu.Label>Mais</DropdownMenu.Label>
										<DropdownMenu.Separator /> -->
									<DropdownMenu.Group>
										<DropdownMenu.Item on:click={() => removeSecao(secao)}>
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
	</div>
</div>
