<script lang="ts">
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
	import { projeto } from '$lib/stores/projeto';
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

	onMount(() => {
		if (!dados.nome) {
			inputNome?.focus();
		}
	});
</script>

<FuncoesProjeto bind:salvarProjeto />
<svelte:window bind:innerWidth />

<div class="flex h-full">
	<div class="min-w-80 overflow-y-auto border-r p-4 max-md:hidden">
		<div class="mb-3 flex items-start justify-between">
			<Button class="p-0 pr-2 text-base hover:bg-transparent" variant="ghost" href="/"
				><ArrowLeft class="mr-1 h-5 w-5" /> Voltar</Button
			>

			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						class="rounded-full"
						variant="ghost"
						size="icon"
						disabled={$projeto.salvo}
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

		<div class="mb-3">
			<InputNomeSecao bind:value={dados.nome} bind:inputElement={inputNome} />
		</div>

		<InputSecao bind:secao={dados.secao} bind:armaduras={dados.armaduras} />
	</div>

	<div class="relative w-full">
		<DrawingCanvas
			drawing={obtemDesenhoDaSecaoComArmaduras(dados.secao, dados.armaduras)}
			offset={innerWidth > 768 ? 0.8 : 0.7}>Desenho da seção transversal</DrawingCanvas
		>

		<div class="md:hidden">
			<div class="absolute top-0 z-10 flex w-full items-center gap-2 p-4">
				<Button class="h-14 w-14 rounded-full" variant="ghost" href="/"
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
							disabled={$projeto.salvo}
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
					<div class="grid h-full grid-rows-[70vh_1fr]">
						<div class="mt-10 overflow-y-auto px-4">
							<div class="mb-4">
								<InputSecao bind:secao={dados.secao} bind:armaduras={dados.armaduras} />
							</div>
						</div>

						<div class="mb-4 overflow-y-auto border-t px-4 pt-2">
							<h2 class="mb-4 text-lg font-medium leading-none">Resultados</h2>

							<div class="h-full">
								<DisplayResultados secao={dados.secao} armaduras={dados.armaduras} />
							</div>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<div class="min-w-80 border-l max-md:hidden">
		<div class="flex flex-col gap-2 border-t p-4">
			<h2 class="mb-2 text-lg font-medium leading-none">Resultados</h2>

			<DisplayResultados secao={dados.secao} armaduras={dados.armaduras} />
		</div>
	</div>
</div>
