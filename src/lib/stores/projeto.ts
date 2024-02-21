import type { Projeto } from '$lib/project/projeto';
import { writable } from 'svelte/store';

export let projeto = writable<Projeto>({
	nome: '',
	secoes: [
		{
			id: 1,
			nome: '',
			armaduras: {
				estribo: { bitola: 5 },
				inferior: { bitola: undefined as any, quantidade: undefined as any },
				superior: { bitola: undefined as any, quantidade: undefined as any }
			},
			secao: {
				// Secao
				geometria: { tipo: 'retangulo', altura: 40, largura: 20 },
				cobrimento: 4,

				// Concreto
				fck: 20,
				gamac: 1.4,

				// Aço
				fy: 500,
				es: 210,
				gamas: 1.15,

				gamaf: 1.4,

				// Esforços
				mskx: 0,
				msky: 0,
				nsd: 0
			},
			ultimaModificao: new Date()
		}
	]
});
