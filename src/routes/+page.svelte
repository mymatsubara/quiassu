<script lang="ts">
	import { dimensionaSecao, type Secao } from '$lib/calculations/nbr6118';
	import SectionDrawing from '$lib/components/SectionDrawing.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { getSectionPoints, type SectionType } from '$lib/geometry/section';
	import { Pencil, Square } from 'lucide-svelte';

	let secao: Secao = {
		// Secao
		geometria: { type: 'rectangle', height: 0, width: 0 },
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

	let tipoSecao: SectionType = 'rectangle';
	$: resultados = dimensionaSecao(secao);

	function changeHeight(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (secao.geometria.type === 'rectangle') {
			secao.geometria.height = Number(value);
		}
	}

	function changeWidth(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (secao.geometria.type === 'rectangle') {
			secao.geometria.width = Number(value);
		}
	}
</script>

<div class="flex h-full">
	<div class="min-w-80 border-r p-4">
		<div class="grid gap-5">
			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Seção</h4>

				<Tabs.Root bind:value={tipoSecao}>
					<Tabs.List class="grid grid-cols-2">
						<Tabs.Trigger value="rectangle"><Square class="h-5 w-5" /></Tabs.Trigger>
						<Tabs.Trigger value="polygon"><Pencil class="h-5 w-5" /></Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="rectangle">
						<div class="mt-4 grid gap-2">
							<div class="grid grid-cols-3 items-center gap-4">
								<Label for="width">Largura (cm)</Label>
								<Input type="number" id="width" class="col-span-2 h-8" on:change={changeWidth} />
							</div>
							<div class="grid grid-cols-3 items-center gap-4">
								<Label for="height">Altura (cm)</Label>
								<Input type="number" id="height" class="col-span-2 h-8" on:change={changeHeight} />
							</div>
						</div>
					</Tabs.Content>
					<Tabs.Content value="polygon">Adicione os pontos da seção</Tabs.Content>
				</Tabs.Root>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="dLinha">d' (cm)</Label>
					<Input bind:value={secao.dLinha} type="number" id="dLinha" class="col-span-2 h-8" />
				</div>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Esforços</h4>

				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="mskx">M<sub>sk,x</sub> (KNm)</Label>
					<Input bind:value={secao.mskx} type="number" id="mskx" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="msky">M<sub>sk,y</sub> (KNm)</Label>
					<Input bind:value={secao.msky} type="number" id="msky" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="nsd">N<sub>sd</sub> (KN)</Label>
					<Input bind:value={secao.nsd} type="number" id="nsd" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="gamaf">γ<sub>f</sub></Label>
					<Input bind:value={secao.gamaf} type="number" id="gamaf" class="col-span-2 h-8" />
				</div>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Concreto</h4>

				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="fck">f<sub>ck</sub> (MPa)</Label>
					<Input bind:value={secao.fck} type="number" id="fck" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="gamac">γ<sub>c</sub></Label>
					<Input bind:value={secao.gamac} type="number" id="gamac" class="col-span-2 h-8" />
				</div>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Aço</h4>

				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="fy">f<sub>y</sub> (MPa)</Label>
					<Input bind:value={secao.fy} type="number" id="fy" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="es">E<sub>s</sub> (GPa)</Label>
					<Input bind:value={secao.es} type="number" id="es" class="col-span-2 h-8" />
				</div>
				<div class="grid grid-cols-3 items-center gap-4">
					<Label for="gamas">γ<sub>s</sub></Label>
					<Input bind:value={secao.gamas} type="number" id="gamas" class="col-span-2 h-8" />
				</div>
			</div>
		</div>
	</div>

	<SectionDrawing points={getSectionPoints(secao.geometria)}
		>Desenho da seção transversal</SectionDrawing
	>
	<div class="min-w-80 border-l p-4">
		<div class="grid gap-2">
			<h4 class="mb-2 text-lg font-medium leading-none">Resultados</h4>

			{#if resultados}
				<div class="font-medium">Domínio {resultados.dominio}</div>
				<div class="grid grid-cols-2 items-center gap-4">
					<div class="font-medium">A<sub>s</sub></div>
					<div>{isNaN(resultados.as) ? '0.0' : resultados.as.toFixed(2)} cm/2</div>
				</div>
			{/if}
		</div>
	</div>
</div>
