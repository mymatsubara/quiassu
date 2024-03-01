import type { Armadura, Armaduras } from '$lib/calculations/armadura';
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
		versao: 2
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
			agregadoGraudo: 'Brita 1',

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
		case 1:
			type ArmadurasV1 = {
				estribo: { bitola: number };
				inferior: ArmaduraV1;
				superior: ArmaduraV1;
			};
			type ArmaduraV1 = { quantidade: number; bitola: number };
			const mapeiaArmaduraV1: (a: ArmaduraV1) => Armadura = (armadura) => {
				return {
					camadas: [{ bitola: armadura?.bitola, quantidade: armadura?.quantidade }],
					espacamento: 5
				};
			};

			projeto.secoes = projeto.secoes.map((secao) => {
				const armadurasV1 = secao.armaduras as any as ArmadurasV1;

				return {
					...secao,
					armaduras: {
						estribo: armadurasV1?.estribo,
						inferior: mapeiaArmaduraV1(armadurasV1?.inferior),
						superior: mapeiaArmaduraV1(armadurasV1?.superior)
					}
				};
			});
			projeto.versao = 2;
	}

	return projeto;
}
