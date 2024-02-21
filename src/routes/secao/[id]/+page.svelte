<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EditorSecao from '$lib/components/EditorSecao.svelte';
	import { projeto } from '$lib/stores/projeto';

	const id = Number($page.params.id);
	let secaoAtual = $projeto.secoes.find((secao) => secao.id === id);

	if (!secaoAtual) {
		goto('/');
	}

	$: {
		secaoAtual;
		$projeto = $projeto;
	}
</script>

{#if secaoAtual}
	<EditorSecao bind:dados={secaoAtual} onBack={() => (secaoAtual = undefined)} />
{/if}
