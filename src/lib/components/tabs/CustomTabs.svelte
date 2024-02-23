<script lang="ts" generics="T extends string">
	export let tabs: readonly T[];
	export let selected: T;
</script>

<div class="flex">
	{#each tabs as tab (tab)}
		<button
			class="border-b border-b-transparent px-8 py-3 transition-all hover:border-b-gray-400 {tab ===
			selected
				? 'border-b !border-b-primary font-semibold'
				: ''}"
			on:click={() => {
				selected = tab;
			}}>{tab}</button
		>
	{/each}
</div>
