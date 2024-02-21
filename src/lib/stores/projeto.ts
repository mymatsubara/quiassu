import type { Projeto } from '$lib/project/projeto';
import { isDeepEqual } from '$lib/utils/object';
import { writable } from 'svelte/store';

export let projeto = writable<Projeto>({
	nome: '',
	secoes: [],
	salvo: true
});
let prevState: Projeto;

export let arquivoProjeto = writable<FileSystemFileHandle>();

// Indica que o estado do projeto foi modificado
projeto.subscribe((proj) => {
	if (proj.salvo) {
		let { salvo: s1, ...p0 } = prevState ?? {};
		let { salvo: s2, ...p1 } = proj;

		const foiModificado = !isDeepEqual(p0, p1);

		if (foiModificado) {
			projeto.update((proj) => {
				proj.salvo = false;
				prevState = structuredClone(proj);
				return proj;
			});
		}
	}
});
