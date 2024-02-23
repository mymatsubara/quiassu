<script lang="ts">
	type Tab = { href: string; label: string };
	export let tabs: Tab[];
	export let curPathname: string;
</script>

<div class="flex">
	{#each tabs as tab}
		<a
			class="border-b border-b-transparent px-8 py-3 transition-all hover:border-b-gray-400 {tab.href ===
			curPathname
				? 'border-b !border-b-primary font-semibold'
				: ''}"
			href={tab.href}>{tab.label}</a
		>
	{/each}
</div>
