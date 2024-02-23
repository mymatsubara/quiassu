<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';

	export let nome: string;
	export let id: number;
</script>

<Button variant="ghost" href="/secao?id={id}">{nome}</Button>
