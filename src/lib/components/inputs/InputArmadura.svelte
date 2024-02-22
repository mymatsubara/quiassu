<script lang="ts">
	import NumberInput from '$lib/components/inputs/NumberInput.svelte';
	import SelectBitola from '$lib/components/inputs/SelectBitola.svelte';

	export let quantidade: number | undefined;
	export let bitola: number | undefined;

	$: quantidade = quantidade !== undefined ? Number(quantidade) : undefined;

	const rand = Math.random();
</script>

<div class="flex items-baseline gap-2">
	<NumberInput
		bind:value={quantidade}
		placeholder="Quantidade"
		type="number"
		step="1"
		min="0"
		class="h-8"
		id="quantidade-{rand}"
	/>
	<div>x</div>
	<SelectBitola bind:bitola />
</div>
