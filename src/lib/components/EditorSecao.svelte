<script lang="ts">
	import { goto } from '$app/navigation';
	import DisplayResultados from '$lib/components/DisplayResultados.svelte';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import FuncoesProjeto from '$lib/components/FuncoesProjeto.svelte';
	import InputNomeSecao from '$lib/components/inputs/InputNomeSecao.svelte';
	import InputSecao from '$lib/components/inputs/InputSecao.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { obtemDesenhoDaSecaoComArmaduras } from '$lib/geometry/secao';
	import type { DadosSecao } from '$lib/project/projeto';
	import { isDeepEqual } from '$lib/utils/object';
	import { ArrowLeft, PencilRuler, Save } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let dados: DadosSecao;

	let inputNome: HTMLInputElement;
	let innerWidth: number;
	let loaded = false;
	let prevDados: DadosSecao = structuredClone(dados);

	$: {
		if (loaded || (prevDados !== undefined && !isDeepEqual(dados, prevDados))) {
			dados.ultimaModificao = Date.now();
			loaded = true;
		}
	}

	let salvarProjeto: FuncoesProjeto['salvarProjeto'];

	function voltar() {
		if (history.length <= 2) {
			goto('/');
		} else {
			history.back();
		}
	}

	onMount(() => {
		if (!dados.nome) {
			inputNome?.focus();
		}
	});
</script>

<FuncoesProjeto bind:salvarProjeto />
<svelte:window bind:innerWidth />

<div class="flex h-full">
	<div class="min-w-80 overflow-y-auto border-r max-md:hidden">
		<div class="sticky top-0 z-10 flex items-start justify-between bg-background px-4 pt-4">
			<Button class="p-0 pr-2 text-base hover:bg-transparent" variant="ghost" on:click={voltar}
				><ArrowLeft class="mr-1 h-5 w-5" /> Voltar</Button
			>

			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						class="rounded-full"
						variant="ghost"
						size="icon"
						on:click={() => salvarProjeto()}
					>
						<Save class="h-5 w-5" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Salvar <DropdownMenu.Shortcut>(Ctrl+S)</DropdownMenu.Shortcut></p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>

		<div class="p-4">
			<div class="mb-3">
				<InputNomeSecao bind:value={dados.nome} bind:inputElement={inputNome} />
			</div>

			<InputSecao bind:secao={dados.secao} bind:armaduras={dados.armaduras} />
		</div>
	</div>

	<div class="relative w-full">
		<DrawingCanvas
			drawing={obtemDesenhoDaSecaoComArmaduras(dados.secao, dados.armaduras)}
			offset={innerWidth > 768 ? 0.8 : 0.7}>Desenho da seção transversal</DrawingCanvas
		>

		<div class="md:hidden">
			<div class="absolute top-0 z-10 flex w-full items-center gap-2 p-4">
				<Button class="h-14 w-14 rounded-full" variant="ghost" on:click={voltar}
					><ArrowLeft class="h-5 w-5" /></Button
				>
				<InputNomeSecao bind:value={dados.nome} />

				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							class="rounded-full px-2 hover:bg-transparent"
							variant="ghost"
							size="icon"
							on:click={() => salvarProjeto()}
						>
							<Save class="h-5 w-5" />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Salvar <DropdownMenu.Shortcut>(Ctrl+S)</DropdownMenu.Shortcut></p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>

			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						class="absolute bottom-4 right-4 z-10 h-16 w-16 rounded-full"
						variant="secondary"
					>
						<PencilRuler class="h-5 w-5" />
					</Button>
				</Sheet.Trigger>
				<Sheet.Content class="p-0" side="right">
					<div class="grid h-full grid-rows-[60vh_1fr]">
						<div class="mt-10 overflow-y-auto px-4">
							<div class="mb-4">
								<InputSecao bind:secao={dados.secao} bind:armaduras={dados.armaduras} />
							</div>
						</div>

						<div class="overflow-y-auto border-t-4 px-4 pt-4">
							<h2 class="sticky mb-4 text-lg font-medium leading-none">Resultados</h2>

							<div class="pb-6">
								<DisplayResultados secao={dados.secao} armaduras={dados.armaduras} />
							</div>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<div class="min-w-80 border-l max-md:hidden">
		<div class="flex h-full flex-col gap-2 overflow-y-auto border-t">
			<h2 class="sticky top-0 bg-background p-4 pb-2 text-lg font-medium leading-none">
				Resultados
			</h2>

			<div class="p-4 pt-0">
				<DisplayResultados secao={dados.secao} armaduras={dados.armaduras} />
			</div>
		</div>
	</div>
</div>
