<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EditorSecao from '$lib/components/EditorSecao.svelte';
	import type { DadosSecao } from '$lib/project/projeto';
	import { projeto } from '$lib/stores/projeto';
	import { onMount } from 'svelte';

	let secaoAtual: DadosSecao | undefined;

	onMount(() => {
		const id = Number($page.url.searchParams.get('id'));
		secaoAtual = $projeto.secoes.find((secao) => secao.id === id);

		if (!secaoAtual) {
			goto('/');
		}
	});

	$: {
		secaoAtual;
		$projeto = $projeto;
	}
</script>

{#if secaoAtual}
	<EditorSecao bind:dados={secaoAtual} />
{/if}
