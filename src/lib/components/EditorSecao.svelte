<script lang="ts">
	import DisplayResultados from '$lib/components/DisplayResultados.svelte';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import InputSecao from '$lib/components/inputs/InputSecao.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { obtemDesenhoDaSecaoComArmaduras } from '$lib/geometry/secao';
	import type { DadosSecao } from '$lib/project/projeto';
	import { ArrowLeft, PencilRuler } from 'lucide-svelte';

	export let dados: DadosSecao;
	export let onBack: () => void = () => {};

	$: {
		if (dados) {
			dados.ultimaModificao = new Date();
		}
	}
</script>

<div class="flex h-full">
	<div class="min-w-80 overflow-y-auto border-r p-4 max-md:hidden">
		<Button class="mb-4 pl-0 text-base hover:bg-transparent" variant="ghost" on:click={onBack}
			><ArrowLeft class="mr-1 h-5 w-5" /> Voltar</Button
		>
		<InputSecao bind:secao={dados.secao} bind:armaduras={dados.armaduras} />
	</div>

	<div class="relative w-full">
		<DrawingCanvas drawing={obtemDesenhoDaSecaoComArmaduras(dados.secao, dados.armaduras)}
			>Desenho da seção transversal</DrawingCanvas
		>

		<div class="md:hidden">
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						class="absolute bottom-5 right-5  h-16 w-16 rounded-full"
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
