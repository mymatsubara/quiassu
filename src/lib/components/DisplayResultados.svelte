<script lang="ts">
	import { areaAcoArmadura, calculaDLinha, type Armaduras } from '$lib/calculations/armadura';
	import { calcularELSW } from '$lib/calculations/nbr6118-els';
	import { calcularAreaAcoMin, dimensionaSecao, type Secao } from '$lib/calculations/nbr6118-elu';
	import { verificaSecao } from '$lib/calculations/verificacoes';
	import { Separator } from '$lib/components/ui/select';

	export let secao: Secao;
	export let armaduras: Armaduras;

	$: dLinha = calculaDLinha(secao.cobrimento, armaduras);
	$: resultados = dimensionaSecao(secao, dLinha.inferior, dLinha.superior);
</script>

{#if resultados}
	{#if !resultados.valido || isNaN(resultados.x)}
		<span class="text-red-600">Aumente as dimensões da seção ou a resistência do concreto</span>
	{:else if secao.geometria.tipo === 'retangulo' && secao.geometria.altura <= 2 * secao.cobrimento}
		<span class="text-red-600">O cobrimento excede os limites. Tente reduzir ele.</span>
	{:else}
		{@const asAdotado = armaduras.inferior ? areaAcoArmadura(armaduras.inferior) : 0}
		{@const asLinhaAdotado = armaduras.superior ? areaAcoArmadura(armaduras.superior) : 0}
		{@const elsw = calcularELSW(secao, armaduras)}
		{@const asMin = calcularAreaAcoMin(secao)}
		{@const verificacoes = verificaSecao(secao, armaduras)}

		<div class="flex flex-col gap-4">
			<div class="font-medium">
				Domínio {resultados.dominio}
				<span class="ml-1 text-sm font-normal"
					>(x/d = {(resultados.x / (resultados.variaveis?.d ?? 1)).toFixed(2)} | x = {resultados.x.toFixed(
						2
					)} cm)</span
				>
			</div>

			<Separator />

			<div>
				<h4 class="mb-2 font-medium leading-none">Armadura de tração</h4>

				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">d'</div>
					<div>{dLinha.inferior?.toFixed(2)} cm</div>
				</div>
				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div class="text-sm">
						A<sub>s<sub>mín</sub></sub>
					</div>
					<div>{asMin.toFixed(2)} cm<sup>2</sup></div>
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
						: 'text-green-600'} font-medium"
				>
					<div class="text-sm">A<sub>s<sub>adotado</sub></sub></div>
					<div>{asAdotado.toFixed(2)} cm<sup>2</sup></div>
				</div>
			</div>

			<Separator />

			<div>
				<h4 class="mb-2 font-medium leading-none">Armadura de compressão</h4>

				<div class="grid grid-cols-2 items-center gap-4 font-medium">
					<div>
						A'<sub>s<sub>calc</sub></sub>
					</div>
					<div>{resultados.asLinha?.toFixed(2) ?? '0.00'} cm<sup>2</sup></div>
				</div>

				<div
					class="grid grid-cols-2 items-center gap-4 {asLinhaAdotado < (resultados.asLinha ?? 0)
						? 'text-red-500'
						: 'text-green-600'} font-medium"
				>
					<div>A'<sub>s<sub>adotado</sub></sub></div>
					<div>{asLinhaAdotado.toFixed(2)} cm<sup>2</sup></div>
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

			{#if verificacoes.length > 0}
				<Separator />

				<div>
					<h3 class="mb-2 font-medium">Verificações</h3>

					<ul class="list-inside list-disc space-y-1 text-red-500">
						{#each verificacoes as verificacao}
							{#if verificacao.tipo === 'cobrimento'}
								<li>
									O cobrimento deve ser maior do que <b
										>{verificacao.cobrimentoMinimo.toFixed(2)} cm</b
									>
									por conta do agregado graúdo selecionado ({secao.agregadoGraudo}).
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
{/if}
