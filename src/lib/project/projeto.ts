import type { Armaduras } from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { max } from '$lib/utils/array';

export interface Projeto {
	nome: string;
	secoes: DadosSecao[];
	versao: number;
}

export interface DadosSecao {
	id: number;
	nome: string;
	secao: Secao;
	armaduras: Armaduras;
	ultimaModificao: number;
}

export function projetoVazio() {
	return {
		nome: '',
		secoes: [],
		versao: 1
	};
}

export function criaNovaSecao(projeto: Projeto): DadosSecao {
	const secaoComMaiorId = max(projeto.secoes, (secao) => secao.id);
	const secaoMaisRecente = max(projeto.secoes, (secao) => secao.ultimaModificao);

	const novaSecao: DadosSecao = {
		id: (secaoComMaiorId?.id ?? 0) + 1,
		nome: '',
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

			...structuredClone(secaoMaisRecente),

			// Esforços
			mskx: 0,
			msky: 0,
			nsd: 0
		},
		armaduras: {
			estribo: {
				bitola: secaoMaisRecente?.armaduras?.estribo?.bitola ?? 5
			},
			inferior: {
				camadas: [
					{
						bitola: undefined as any,
						quantidade: undefined as any
					}
				],
				espacamento: 5
			},
			superior: {
				camadas: [
					{
						bitola: undefined as any,
						quantidade: undefined as any
					}
				],
				espacamento: 5
			}
		},
		ultimaModificao: Date.now()
	};

	return novaSecao;
}

export function parseProjeto(jsonText: string): Projeto {
	const data = converteVersao(JSON.parse(jsonText));

	return { ...projetoVazio(), ...data };
}

function converteVersao(projeto: Projeto) {
	switch (projeto.versao) {
		case undefined:
			projeto.versao = 1;
	}

	return projeto;
}
