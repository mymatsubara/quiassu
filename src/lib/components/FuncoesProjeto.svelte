<script lang="ts">
	import { projetoVazio } from '$lib/project/projeto';
	import { arquivoProjeto, projeto } from '$lib/stores/projeto';
	import { saveToFile, saveToFileOld } from '$lib/utils/file';
	import { toast } from 'svelte-sonner';

	export async function abrirProjeto() {
		if ('showOpenFilePicker' in window) {
			const [fileHandle] = await window.showOpenFilePicker({
				types: [{ description: 'JSON file', accept: { 'text/json': ['.json'] } }],
				multiple: false
			});

			try {
				$arquivoProjeto = fileHandle;
				const file = await fileHandle.getFile();
				const textData = await file.text();
				carregaProjeto(textData);
			} catch (e) {
				alert('Arquivo inválido');
			}
		} else {
			const fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', '.json');
			fileInput.click();

			fileInput.addEventListener('change', async (e) => {
				const files = fileInput.files;

				if (!files?.length) {
					return;
				}

				const [file] = files;
				const textData = await file.text();
				carregaProjeto(textData);
			});
		}
	}

	function carregaProjeto(textData: string) {
		const data = JSON.parse(textData);
		$projeto = { ...projetoVazio(), ...data };
	}

	export async function salvarProjeto(salvaComo: boolean = false) {
		const data = JSON.stringify($projeto, null, 2);
		const filename = ($projeto.nome || 'Projeto sem nome') + '.json';

		if ('showSaveFilePicker' in window) {
			if (!$arquivoProjeto || salvaComo) {
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

		toast.success('Projeto salvo');
	}
</script>
