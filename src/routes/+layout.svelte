<script lang="ts">
	import { browser } from '$app/environment';
	import FuncoesProjeto from '$lib/components/FuncoesProjeto.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { onDestroy, onMount } from 'svelte';
	import '../app.pcss';

	let salvarProjeto: FuncoesProjeto['salvarProjeto'];
	let abrirProjeto: FuncoesProjeto['abrirProjeto'];

	// Shortcuts
	function handleShortcuts(e: KeyboardEvent) {
		if (e.ctrlKey) {
			switch (e.key.toLowerCase()) {
				case 's':
					e.preventDefault();
					salvarProjeto();
					return;
				case 'o':
					e.preventDefault();
					abrirProjeto();
					return;
			}

			if (e.shiftKey) {
				switch (e.code.toUpperCase()) {
					case 'KEYS':
						e.preventDefault();
						salvarProjeto(true);
						return;
				}
			}
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleShortcuts);
	});

	onDestroy(() => {
		browser && document.removeEventListener('keydown', handleShortcuts);
	});
</script>

<FuncoesProjeto bind:salvarProjeto bind:abrirProjeto />
<Toaster closeButton />

<slot />
