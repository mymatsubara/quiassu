<script lang="ts">
	import { areaAcoArmadura, type Armaduras } from '$lib/calculations/armadura';
	import { calcularELSW } from '$lib/calculations/nbr6118-els';
	import { calcularAreaAcoMin, dimensionaSecao, type Secao } from '$lib/calculations/nbr6118-elu';
	import { Separator } from '$lib/components/ui/select';

	export let secao: Secao;
	export let armaduras: Armaduras;

	$: resultados = dimensionaSecao(secao);
</script>

{#if resultados}
	{#if !resultados.valido || isNaN(resultados.x)}
		<span class="text-red-600">Aumente as dimensões da seção ou a resistência do concreto</span>
	{:else if secao.geometria.tipo === 'retangulo' && secao.geometria.altura === 2 * secao.dLinha}
		<span class="text-red-600"
			>As armaduras inferiores e superiores podem coincidir. Ajuste o valor de d' ou a altura da
			seção.</span
		>
	{:else}
		{@const asAdotado = areaAcoArmadura(armaduras.inferior)}
		{@const asLinhaAdotado = areaAcoArmadura(armaduras.superior)}
		{@const elsw = calcularELSW(secao, armaduras)}
		{@const asMin = calcularAreaAcoMin(secao)}

		<div class="flex flex-col gap-4">
			<div class="font-medium">Domínio {resultados.dominio}</div>

			<Separator />

			<div>
				<h4 class="mb-2 font-medium leading-none">Armadura inferior</h4>

				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">
						A<sub>s<sub>mín</sub></sub>
					</div>
					<div>{asMin} cm<sup>2</sup></div>
				</div>

				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">
						A<sub>s<sub>calc</sub></sub>
					</div>
					<div>{resultados.as?.toFixed(2) ?? '0.00'} cm<sup>2</sup></div>
				</div>

				<div
					class="grid grid-cols-2 items-center gap-4 {asAdotado < (resultados.as ?? 0) ||
					asAdotado < asMin
						? 'text-red-500'
						: 'text-green-700'} font-medium"
				>
					<div class="text-sm">A<sub>s<sub>adotado</sub></sub></div>
					<div>{asAdotado.toFixed(2)} cm<sup>2</sup></div>
				</div>
				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">Cobrimento</div>
					<div>
						{(secao.dLinha - (armaduras.inferior?.bitola ?? 0) / 10).toFixed(2)} cm
					</div>
				</div>
			</div>

			<Separator />

			<div>
				<h4 class="mb-2 font-medium leading-none">Armadura superior</h4>

				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div>
						A'<sub>s<sub>calc</sub></sub>
					</div>
					<div>{resultados.asLinha?.toFixed(2) ?? '0.00'} cm<sup>2</sup></div>
				</div>

				<div
					class="grid grid-cols-2 items-center gap-4 {asLinhaAdotado < (resultados.asLinha ?? 0)
						? 'text-red-500'
						: 'text-green-700'} font-medium"
				>
					<div>A'<sub>s<sub>adotado</sub></sub></div>
					<div>{asLinhaAdotado.toFixed(2)} cm<sup>2</sup></div>
				</div>
				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">Cobrimento</div>
					<div>
						{(secao.dLinha - (armaduras.superior?.bitola ?? 0) / 10).toFixed(2)} cm
					</div>
				</div>
			</div>

			{#if elsw}
				<Separator />

				<div>
					<h3 class="mb-2 font-medium">ELS-W (Fissuração)</h3>

					<div class="grid grid-cols-2 items-center gap-4 font-medium">
						<div>
							w<sub>k1</sub>
						</div>
						<div>{elsw.wk1.toFixed(2)} mm</div>
					</div>
					<div class="grid grid-cols-2 items-center gap-4 font-medium">
						<div>
							w<sub>k2</sub>
						</div>
						<div>{elsw.wk2.toFixed(2)} mm</div>
					</div>
					<div class="grid grid-cols-2 items-center gap-4 font-medium">
						<div>
							w<sub>k</sub>
						</div>
						<div>{elsw.wk.toFixed(2)} mm</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/if}
