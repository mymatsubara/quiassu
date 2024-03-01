import { calculaCobrimentoMinimo } from '$lib/calculations/agregados';
import type { Armaduras } from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';

type Verificacao = { tipo: 'cobrimento'; cobrimentoMinimo: number };

export function verificaSecao(secao: Secao, armaduras: Armaduras): Verificacao[] {
	const verificacoes: Verificacao[] = [];
	const cobrimentoMinimo = calculaCobrimentoMinimo(secao.agregadoGraudo);

	if (secao.cobrimento <= cobrimentoMinimo) {
		verificacoes.push({
			tipo: 'cobrimento',
			cobrimentoMinimo
		});
	}

	return verificacoes;
}
