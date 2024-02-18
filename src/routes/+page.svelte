<script lang="ts">
	import { areaAcoArmadura, type Armaduras } from '$lib/calculations/armadura';
	import { dimensionaSecao, type Secao } from '$lib/calculations/nbr6118';
	import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
	import InputArmadura from '$lib/components/InputArmadura.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { obtemDesenhoDaSecaoComArmaduras, type TipoSecao } from '$lib/geometry/secao';
	import { PenTool, Square } from 'lucide-svelte';

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

	let tipoSecao: TipoSecao = 'retangulo';
	$: resultados = dimensionaSecao(secao);

	function changeHeight(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (secao.geometria.tipo === 'retangulo') {
			secao.geometria.altura = Number(value);
		}
	}

	function changeWidth(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (secao.geometria.tipo === 'retangulo') {
			secao.geometria.largura = Number(value);
		}
	}
</script>

<div class="flex h-full">
	<div class="min-w-80 overflow-y-auto border-r p-4">
		<div class="grid gap-5">
			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Seção</h4>

				<Tabs.Root bind:value={tipoSecao}>
					<Tabs.List class="grid grid-cols-2">
						<Tabs.Trigger value="retangulo"><Square class="h-5 w-5" /></Tabs.Trigger>
						<Tabs.Trigger value="poligono"><PenTool class="h-5 w-5" /></Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="retangulo">
						{#if secao.geometria.tipo === 'retangulo'}
							{@const largura = secao.geometria.largura}
							{@const altura = secao.geometria.altura}
							<div class="mt-4 grid gap-2">
								<div class="grid grid-cols-2 items-center gap-4">
									<Label for="largura">Largura (cm)</Label>
									<Input
										value={largura}
										type="number"
										id="largura"
										class="h-8"
										on:change={changeWidth}
									/>
								</div>
								<div class="grid grid-cols-2 items-center gap-4">
									<Label for="altura">Altura (cm)</Label>
									<Input
										value={altura}
										type="number"
										id="altura"
										class="h-8"
										on:change={changeHeight}
									/>
								</div>
							</div>
						{/if}
					</Tabs.Content>
					<Tabs.Content value="polygon"
						><span class="text-red-600">Não implementado ainda</span></Tabs.Content
					>
				</Tabs.Root>
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="dLinha">d' (cm)</Label>
					<Input bind:value={secao.dLinha} type="number" id="dLinha" class="h-8" />
				</div>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Esforços</h4>

				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="mskx">M<sub>sk,x</sub> (KNm)</Label>
					<Input bind:value={secao.mskx} type="number" id="mskx" class="h-8" />
				</div>
				<!-- <div class="grid grid-cols-2 items-center gap-4">
					<Label for="msky">M<sub>sk,y</sub> (KNm)</Label>
					<Input bind:value={secao.msky} type="number" id="msky" class="h-8" />
				</div> -->
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="nsd">N<sub>sd</sub> (KN)</Label>
					<Input bind:value={secao.nsd} type="number" id="nsd" class="h-8" />
				</div>
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="gamaf">γ<sub>f</sub></Label>
					<Input bind:value={secao.gamaf} type="number" id="gamaf" class="h-8" />
				</div>
			</div>

			<Separator />

			<div>
				<h3 class="mb-4 font-medium leading-none">Armadura inferior - A<sub>s</sub></h3>
				<InputArmadura
					bind:quantidade={armaduras.inferior.quantidade}
					bind:bitola={armaduras.inferior.bitola}
				/>
			</div>

			<Separator />

			<div>
				<h3 class="mb-4 font-medium leading-none">Armadura superior - A'<sub>s</sub></h3>
				<InputArmadura
					bind:quantidade={armaduras.superior.quantidade}
					bind:bitola={armaduras.superior.bitola}
				/>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Concreto</h4>

				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="fck">f<sub>ck</sub> (MPa)</Label>
					<Input bind:value={secao.fck} type="number" id="fck" class="h-8" />
				</div>
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="gamac">γ<sub>c</sub></Label>
					<Input bind:value={secao.gamac} type="number" id="gamac" class="h-8" />
				</div>
			</div>

			<Separator />

			<div class="grid gap-2">
				<h4 class="font-medium leading-none">Aço</h4>

				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="fy">f<sub>y</sub> (MPa)</Label>
					<Input bind:value={secao.fy} type="number" id="fy" class="h-8" />
				</div>
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="es">E<sub>s</sub> (GPa)</Label>
					<Input bind:value={secao.es} type="number" id="es" class="h-8" />
				</div>
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="gamas">γ<sub>s</sub></Label>
					<Input bind:value={secao.gamas} type="number" id="gamas" class="h-8" />
				</div>
			</div>
		</div>
	</div>

	<DrawingCanvas drawings={obtemDesenhoDaSecaoComArmaduras(secao, armaduras)}
		>Desenho da seção transversal</DrawingCanvas
	>

	<div class="min-w-80 border-l">
		<div class="flex flex-col gap-2 border-t p-4">
			<h3 class="mb-2 text-lg font-medium leading-none">Resultados</h3>

			{#if resultados}
				{#if !resultados.valido || isNaN(resultados.x)}
					<span class="text-red-600"
						>Aumente as dimensões da seção ou a resistência do concreto</span
					>
				{:else}
					{@const asAdotado = areaAcoArmadura(armaduras.inferior)}
					{@const asLinhaAdotado = areaAcoArmadura(armaduras.superior)}

					<div class="font-medium">Domínio {resultados.dominio}</div>

					<Separator />
					<h4 class="font-medium leading-none">Armadura - ELU</h4>

					{#if resultados.as !== undefined}
						<div class="grid grid-cols-2 items-center gap-4">
							<div class="font-medium">A<sub>s<sub>min</sub></sub></div>
							<div>{isNaN(resultados.as) ? '0.0' : resultados.as.toFixed(2)} cm/2</div>
						</div>
					{/if}

					{#if asAdotado || resultados.as}
						<div
							class="grid grid-cols-2 items-center gap-4 {asAdotado < (resultados.as ?? 0)
								? 'text-red-500'
								: 'text-green-700'}"
						>
							<div class="font-medium">A<sub>s<sub>adotado</sub></sub></div>
							<div>{asAdotado.toFixed(2)} cm/2</div>
						</div>
					{/if}

					{#if resultados.asLinha}
						<div class="grid grid-cols-2 items-center gap-4">
							<div class="font-medium">A'<sub>s<sub>min</sub></sub></div>
							<div>{isNaN(resultados.asLinha) ? '0.0' : resultados.asLinha.toFixed(2)} cm/2</div>
						</div>
					{/if}

					{#if asLinhaAdotado || resultados.asLinha}
						<div
							class="grid grid-cols-2 items-center gap-4 {asLinhaAdotado < (resultados.asLinha ?? 0)
								? 'text-red-500'
								: 'text-green-700'}"
						>
							<div class="font-medium">A'<sub>s<sub>adotado</sub></sub></div>
							<div>{asLinhaAdotado.toFixed(2)} cm/2</div>
						</div>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>
