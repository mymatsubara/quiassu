import { calculaCobrimentoMinimo, dimensoesAgregadoGraudoMm } from '$lib/calculations/agregados';
import {
	calculaEspacamentoLivreCamada,
	type Armaduras,
	type CamadaArmadura
} from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';

type Verificacao =
	| { tipo: 'cobrimento'; cobrimentoMinimo: number }
	| {
			tipo: 'espaçamento armadura';
			minimo: number;
			observado: number;
			armadura: 'tração' | 'compressão';
			direcao: 'horizontal' | 'vertical';
	  };

export function verificaSecao(secao: Secao, armaduras: Armaduras): Verificacao[] {
	let verificacoes: Verificacao[] = [];

	// Cobrimento
	const cobrimentoMinimo = calculaCobrimentoMinimo(secao.agregadoGraudo);

	if (secao.cobrimento <= cobrimentoMinimo) {
		verificacoes.push({
			tipo: 'cobrimento',
			cobrimentoMinimo
		});
	}

	if (secao.geometria.tipo === 'retangulo') {
		const largura = secao.geometria.largura;
		const cobrimento = secao.cobrimento;
		const bitolaEstribo = armaduras.estribo?.bitola ?? 0;

		// Espaçamento horizontal
		const dimensaoAgregado = dimensoesAgregadoGraudoMm[secao.agregadoGraudo];
		const dimensaoMaxAgregadoGraudo = (dimensaoAgregado?.max ?? 0) / 10;

		const verificaoHorizontal = {
			tracao: verificaEspacamentoHorizontalCamadas(
				armaduras.inferior?.camadas,
				'tração',
				largura,
				cobrimento,
				bitolaEstribo,
				dimensaoMaxAgregadoGraudo
			),
			compressao: verificaEspacamentoHorizontalCamadas(
				armaduras.superior?.camadas,
				'compressão',
				largura,
				cobrimento,
				bitolaEstribo,
				dimensaoMaxAgregadoGraudo
			)
		};

		verificaoHorizontal.tracao && verificacoes.push(verificaoHorizontal.tracao);
		verificaoHorizontal.compressao && verificacoes.push(verificaoHorizontal.compressao);

		// Espaçamento vertical
		const verificaoVertical = {
			tracao: verificaEspacamentoVerticalCamadas(
				armaduras.inferior?.camadas,
				'tração',
				armaduras.inferior?.espacamento ?? 0,
				dimensaoMaxAgregadoGraudo
			),
			compressao: verificaEspacamentoVerticalCamadas(
				armaduras.superior?.camadas,
				'compressão',
				armaduras.superior?.espacamento ?? 0,
				dimensaoMaxAgregadoGraudo
			)
		};

		verificaoVertical.tracao && verificacoes.push(verificaoVertical.tracao);
		verificaoVertical.compressao && verificacoes.push(verificaoVertical.compressao);
	}

	return verificacoes;
}

function calculaEspacamentoHorizontalMinimo(
	bitolaArmaduraMm: number,
	dimensaoMaxAgregadoGraudo: number
) {
	return Math.max(2, bitolaArmaduraMm / 10, 1.2 * dimensaoMaxAgregadoGraudo);
}

function calculaEspacamentoVerticalMinimo(
	bitolaArmaduraMm: number,
	dimensaoMaxAgregadoGraudo: number
) {
	return Math.max(2, bitolaArmaduraMm / 10, 0.5 * dimensaoMaxAgregadoGraudo);
}

function verificaEspacamentoHorizontalCamadas(
	camadas: CamadaArmadura[] | undefined,
	tipoArmadura: 'compressão' | 'tração',
	largura: number,
	cobrimento: number,
	bitolaEstribo: number,
	dimensaoMaxAgregadoGraudo: number
): Verificacao | undefined {
	if (camadas?.length) {
		for (const [i, camada] of camadas.entries()) {
			if (!camada.bitola || !camada.quantidade) {
				continue;
			}

			const espacamentoMinimo = calculaEspacamentoHorizontalMinimo(
				camada.bitola,
				dimensaoMaxAgregadoGraudo
			);
			const espacamento = calculaEspacamentoLivreCamada(largura, cobrimento, bitolaEstribo, camada);

			if (espacamento < espacamentoMinimo) {
				return {
					tipo: 'espaçamento armadura',
					minimo: espacamentoMinimo,
					observado: espacamento,
					armadura: tipoArmadura,
					direcao: 'horizontal'
				};
			}
		}
	}
}

function verificaEspacamentoVerticalCamadas(
	camadas: CamadaArmadura[] | undefined,
	tipoArmadura: 'compressão' | 'tração',
	espacamento: number,
	dimensaoMaxAgregadoGraudo: number
): Verificacao | undefined {
	if (camadas) {
		for (let i = 0; i < camadas.length - 1; i++) {
			const camadaInferior = camadas[i];
			const camadaSuperior = camadas[i + 1];
			const bitolaInferior = camadaInferior.bitola ?? 0;
			const bitolaSuperior = camadaSuperior.bitola ?? 0;

			const espacamentoLivre = espacamento - bitolaInferior / 20 - bitolaSuperior / 20;
			const espacamentoMinimo = calculaEspacamentoVerticalMinimo(
				Math.max(bitolaInferior, bitolaSuperior),
				dimensaoMaxAgregadoGraudo
			);

			if (espacamentoLivre < espacamentoMinimo) {
				return {
					tipo: 'espaçamento armadura',
					minimo: espacamentoMinimo,
					observado: espacamentoLivre,
					armadura: tipoArmadura,
					direcao: 'vertical'
				};
			}
		}
	}
}
