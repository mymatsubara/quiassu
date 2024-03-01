<script lang="ts">
	import NumberInput from '$lib/components/inputs/NumberInput.svelte';
	import SelectBitola from '$lib/components/selects/SelectBitola.svelte';

	export let quantidade: number | undefined;
	export let bitola: number | undefined;
</script>

<div class="flex items-baseline gap-2">
	<NumberInput
		bind:value={quantidade}
		placeholder="Quantidade"
		type="number"
		step="1"
		min="0"
		class="h-8"
	/>
	<div>x</div>
	<SelectBitola bind:bitola />
</div>
