<script lang="ts">
	import { type Armaduras } from '$lib/calculations/armadura';
	import { type Secao } from '$lib/calculations/nbr6118-elu';
	import DisplayResultados from '$lib/components/DisplayResultados.svelte';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import InputSecao from '$lib/components/InputSecao.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { obtemDesenhoDaSecaoComArmaduras } from '$lib/geometry/secao';
	import { PencilRuler } from 'lucide-svelte';

	let secao: Secao = {
		// Secao
		geometria: { tipo: 'retangulo', altura: 0, largura: 0 },
		dLinha: 5,

		// Concreto
		fck: 20,
		gamac: 1.4,

		// Aço
		fy: 500,
		es: 210,
		gamas: 1.15,

		// Esforços
		mskx: 0,
		msky: 0,
		nsd: 0,
		gamaf: 1.4
	};

	let armaduras: Armaduras = {
		superior: {},
		inferior: {}
	};
</script>

<div class="flex h-full">
	<div class="min-w-80 overflow-y-auto border-r p-4 max-md:hidden">
		<InputSecao bind:secao bind:armaduras />
	</div>

	<div class="relative w-full">
		<DrawingCanvas drawings={obtemDesenhoDaSecaoComArmaduras(secao, armaduras)}
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
								<InputSecao bind:secao bind:armaduras />
							</div>
						</div>

						<div class="mb-4 overflow-y-auto border-t px-4 pt-2">
							<h2 class="mb-4 text-lg font-medium leading-none">Resultados</h2>

							<div class="h-full">
								<DisplayResultados {secao} {armaduras} />
							</div>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>

	<div class="min-w-64 border-l max-md:hidden">
		<div class="flex flex-col gap-2 border-t p-4">
			<h2 class="mb-2 text-lg font-medium leading-none">Resultados</h2>

			<DisplayResultados {secao} {armaduras} />
		</div>
	</div>
</div>
