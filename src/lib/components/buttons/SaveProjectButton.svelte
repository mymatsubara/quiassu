<script lang="ts">
	import { arquivoProjeto, projeto } from '$lib/stores/projeto';
	import { saveToFile, saveToFileOld } from '$lib/utils/file';
	import { Save } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';
	import { Button, type ButtonProps } from '../ui/button';

	export let builders: ButtonProps['builders'] = [];
	export let variant: ButtonProps['variant'] = 'secondary';
	export let size: ButtonProps['size'] = 'icon';

	// function handleShortcut(e: KeyboardEvent) {
	// 	if (e.ctrlKey && e.key === 's') {
	// 		e.preventDefault();
	// 		salvarProjeto();
	// 	}
	// }

	// onMount(() => {
	// 	document.removeEventListener('keydown', handleShortcut);
	// 	document.addEventListener('keydown', handleShortcut);
	// });

	async function salvarProjeto() {
		const data = JSON.stringify($projeto, null, 2);
		const filename = ($projeto.nome || 'Projeto sem nome') + '.json';

		if ('showSaveFilePicker' in window) {
			if (!$arquivoProjeto) {
				$arquivoProjeto = await window.showSaveFilePicker({
					types: [
						{
							description: 'JSON file',
							accept: {
								'text/json': ['.json']
							}
						}
					],
					excludeAcceptAllOption: true,
					suggestedName: filename
				});
			}

			saveToFile($arquivoProjeto, data);
		} else {
			const blob = new Blob([data], { type: 'text/json' });
			saveToFileOld(filename, blob);
		}

		$projeto.salvo = true;
		$projeto = $projeto;
	}
</script>

<Button
	{builders}
	class={twMerge('rounded-full', $$restProps.class)}
	{variant}
	{size}
	disabled={$projeto.salvo}
	on:click={salvarProjeto}
>
	<Save class="h-5 w-5" />
</Button>
