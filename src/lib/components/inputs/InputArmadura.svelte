<script lang="ts">
	import type { Armadura } from '$lib/calculations/armadura';
	import InputCamadaArmadura from '$lib/components/inputs/InputCamadaArmadura.svelte';
	import NumberInput from '$lib/components/inputs/NumberInput.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Copy, Layers, Plus, XIcon } from 'lucide-svelte';

	type TipoInput = 'padrão' | 'manual';
	type InputPadrao = typeof inputPadrao;

	export let armadura: Armadura;

	let tipoInput: TipoInput = tipoInputArmadura(armadura);
	const rand = Math.random();

	let inputPadrao = {
		quantidade: armadura.camadas[0]?.quantidade,
		bitola: armadura.camadas[0]?.bitola,
		camadas: armadura.camadas.length,
		espacamento: armadura.espacamento
	};

	$: armadura = tipoInput === 'padrão' ? transformaInputPadrao(inputPadrao) : armadura;

	function tipoInputArmadura(armadura: Armadura): TipoInput {
		if (armadura.camadas.length < 2) {
			return 'padrão';
		}

		const primeiraCamada = armadura.camadas[0];
		const todasCamadaIguais = armadura.camadas.every(
			(camada) =>
				camada.bitola === primeiraCamada.bitola && camada.quantidade === primeiraCamada.quantidade
		);
		return todasCamadaIguais ? 'padrão' : 'manual';
	}

	function transformaInputPadrao(input: InputPadrao): Armadura {
		const camadas = input.camadas > 0 ? input.camadas : 1;

		return {
			camadas: new Array(camadas).fill(0).map(() => ({
				bitola: input.bitola,
				quantidade: input.quantidade
			})),
			espacamento: input.espacamento
		};
	}
</script>

<Tabs.Root bind:value={tipoInput}>
	<Tabs.List class="mb-4 grid grid-cols-2">
		<Tabs.Trigger value="padrão"><Copy class="size-5" /></Tabs.Trigger>
		<Tabs.Trigger value="manual"><Layers class="size-5" /></Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="padrão">
		<div class="flex flex-col gap-2">
			<InputCamadaArmadura
				bind:quantidade={inputPadrao.quantidade}
				bind:bitola={inputPadrao.bitola}
			/>

			<div class="grid grid-cols-2 items-center gap-4">
				<Label for="camadas-{rand}">Camadas</Label>
				<NumberInput
					bind:value={inputPadrao.camadas}
					type="number"
					id="camadas-{rand}"
					class="h-8"
					min={1}
				/>
			</div>

			{#if inputPadrao.camadas > 1}
				<div class="grid grid-cols-2 items-center gap-4">
					<Label for="espacamento-{rand}">Espaçamento (cm)</Label>
					<NumberInput
						bind:value={inputPadrao.espacamento}
						type="number"
						id="espacamento-{rand}"
						class="h-8"
						min={0}
					/>
				</div>
			{/if}
		</div>
	</Tabs.Content>

	<Tabs.Content value="manual">
		<div class="space-y-2">
			{#each armadura.camadas as camada, i (`${i}-${camada.quantidade}-${camada.bitola}`)}
				<div class="flex gap-1">
					<InputCamadaArmadura bind:quantidade={camada.quantidade} bind:bitola={camada.bitola} />
					{#if armadura.camadas.length > 1}
						<Button
							class="h-8"
							size="icon"
							variant="ghost"
							on:click={() => {
								armadura.camadas.splice(i, 1);
								armadura = armadura;
							}}><XIcon class="size-4" /></Button
						>
					{/if}
				</div>
			{/each}

			<Button
				class="mt-2 w-full"
				size="sm"
				variant="secondary"
				on:click={() => {
					const ultimaCamada = structuredClone(armadura.camadas.at(-1)) ?? {
						bitola: 5,
						quantidade: 2
					};
					armadura.camadas.push(ultimaCamada);
					armadura = armadura;
				}}><Plus class="mr-1 size-4" /> Adicionar camada</Button
			>
		</div>
	</Tabs.Content>
</Tabs.Root>
