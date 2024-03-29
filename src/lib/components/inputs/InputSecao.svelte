<script lang="ts">
	import type { Armaduras } from '$lib/calculations/armadura';
	import type { Secao } from '$lib/calculations/nbr6118-elu';
	import InputArmadura from '$lib/components/inputs/InputArmadura.svelte';
	import NumberInput from '$lib/components/inputs/NumberInput.svelte';
	import SelectAgregadoGraudo from '$lib/components/selects/SelectAgregadoGraudo.svelte';
	import SelectBitola from '$lib/components/selects/SelectBitola.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { TipoSecao } from '$lib/geometry/secao';
	import { deepMap } from '$lib/utils/object';
	import { isNumeric } from '$lib/utils/string';
	import { PenTool, Square } from 'lucide-svelte';

	export let secao: Secao;
	export let armaduras: Armaduras;

	let tipoSecao: TipoSecao = secao.geometria.tipo;
	const rand = Math.random();

	function cast(secao: Secao): Secao {
		return deepMap(secao, (_, value) =>
			typeof value === 'string' && isNumeric(value) ? Number(value) : value
		);
	}
</script>

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
					<div class="mt-4 grid gap-2">
						<div class="grid grid-cols-2 items-center gap-4">
							<Label for="largura-{rand}">Largura (cm)</Label>
							<NumberInput
								bind:value={secao.geometria.largura}
								type="number"
								id="largura-{rand}"
								class="h-8"
							/>
						</div>
						<div class="grid grid-cols-2 items-center gap-4">
							<Label for="altura-{rand}">Altura (cm)</Label>
							<NumberInput
								bind:value={secao.geometria.altura}
								type="number"
								id="altura-{rand}"
								class="h-8"
							/>
						</div>
					</div>
				{/if}
			</Tabs.Content>
			<Tabs.Content value="poligono"
				><span class="text-red-600">Não implementado ainda</span></Tabs.Content
			>
		</Tabs.Root>
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="cobrimento-{rand}">Cobrimento (cm)</Label>
			<NumberInput bind:value={secao.cobrimento} type="number" id="cobrimento-{rand}" class="h-8" />
		</div>
	</div>

	<Separator />

	<div class="grid gap-2">
		<h4 class="font-medium leading-none">Esforços</h4>

		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="mskx-{rand}">M<sub>sk,x</sub> (KNm)</Label>
			<NumberInput bind:value={secao.mskx} type="number" id="mskx-{rand}" class="h-8" />
		</div>
		<!-- <div class="grid grid-cols-2 items-center gap-4">
					<Label for="msky-{rand}">M<sub>sk,y</sub> (KNm)</Label>
					<NumberInput bind:value={secao.msky} type="number" id="msky-{rand}" class="h-8" />
				</div> -->
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="nsd-{rand}">N<sub>sd</sub> (KN)</Label>
			<NumberInput bind:value={secao.nsd} type="number" id="nsd-{rand}" class="h-8" />
		</div>
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="gamaf-{rand}">γ<sub>f</sub></Label>
			<NumberInput bind:value={secao.gamaf} type="number" id="gamaf-{rand}" class="h-8" />
		</div>
	</div>

	<Separator />

	<div>
		<h3 class="mb-4 font-medium leading-none">Estribo</h3>

		<div class="grid grid-cols-2">
			<div class="flex h-8 items-center space-x-2">
				<Checkbox
					id="possui-estribo-{rand}"
					aria-labelledby="Possui estribo?"
					checked={!!armaduras.estribo}
					onCheckedChange={(value) => {
						if (value) {
							armaduras.estribo = { bitola: 5 };
						} else {
							armaduras.estribo = undefined;
						}
					}}
				/>
				<Label
					for="possui-estribo-{rand}"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>Possui estribo?</Label
				>
			</div>

			{#if armaduras.estribo}
				<SelectBitola bind:bitola={armaduras.estribo.bitola} />
			{/if}
		</div>
	</div>

	<Separator />

	<div>
		<h3 class="mb-4 font-medium leading-none">Armadura de tração - A<sub>s</sub></h3>
		{#if armaduras.inferior}
			<InputArmadura bind:armadura={armaduras.inferior} />
		{/if}
	</div>

	<Separator />

	<div>
		<h3 class="mb-4 font-medium leading-none">Armadura de compressão - A'<sub>s</sub></h3>
		{#if armaduras.superior}
			<InputArmadura bind:armadura={armaduras.superior} />
		{/if}
	</div>

	<Separator />

	<div class="grid gap-2">
		<h4 class="font-medium leading-none">Concreto</h4>

		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="fck-{rand}">f<sub>ck</sub> (MPa)</Label>
			<NumberInput bind:value={secao.fck} type="number" id="fck-{rand}" class="h-8" />
		</div>
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="gamac-{rand}">γ<sub>c</sub></Label>
			<NumberInput bind:value={secao.gamac} type="number" id="gamac-{rand}" class="h-8" />
		</div>
		<Label class="grid grid-cols-2 items-center gap-4">
			<span>Agregado graúdo</span>
			<SelectAgregadoGraudo bind:value={secao.agregadoGraudo} />
		</Label>
	</div>

	<Separator />

	<div class="grid gap-2">
		<h4 class="font-medium leading-none">Aço</h4>

		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="fy-{rand}">f<sub>y</sub> (MPa)</Label>
			<NumberInput bind:value={secao.fy} type="number" id="fy-{rand}" class="h-8" />
		</div>
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="es-{rand}">E<sub>s</sub> (GPa)</Label>
			<NumberInput bind:value={secao.es} type="number" id="es-{rand}" class="h-8" />
		</div>
		<div class="grid grid-cols-2 items-center gap-4">
			<Label for="gamas-{rand}">γ<sub>s</sub></Label>
			<NumberInput bind:value={secao.gamas} type="number" id="gamas-{rand}" class="h-8" />
		</div>
	</div>
</div>
