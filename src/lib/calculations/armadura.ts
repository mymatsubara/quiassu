import type { Secao } from '$lib/calculations/nbr6118-elu';

export interface Armaduras {
	superior?: Armadura;
	inferior?: Armadura;
	estribo?: Estribo;
}

export interface Armadura {
	quantidade: number;
	bitola: number; // em mm
}

export interface Estribo {
	bitola: number; // em mm
}

export function areaAcoArmadura({ quantidade, bitola }: Armadura) {
	return bitola && quantidade ? quantidade * areaBitola(bitola) : 0;
}

export function areaBitola(bitola: number) {
	const raio = bitola / (2 * 10);
	return Math.PI * raio ** 2;
}

export function calculaDLinha(secao: Secao, armaduras: Armaduras) {
	const cobrimento = secao.cobrimento ?? 0;
	const bitolaEstribo = (armaduras.estribo?.bitola ?? 0) / 10;
	const bitolaInferior = (armaduras.inferior?.bitola ?? 0) / 10; // converte para cm
	const bitolaSuperior = (armaduras.superior?.bitola ?? 0) / 10; // converte para cm

	return {
		inferior: Number(calculaDLinhaDireto(cobrimento, bitolaEstribo, bitolaInferior)),
		superior: Number(calculaDLinhaDireto(cobrimento, bitolaEstribo, bitolaSuperior))
	};
}

function calculaDLinhaDireto(cobrimento: number, bitolaEstribo: number, bitolaArmadura: number) {
	return cobrimento + bitolaEstribo + bitolaArmadura / 2;
}

export function calculaEspacamento(largura: number, cobrimento: number, armaduras: Armaduras) {
	const bitolaEstribo = armaduras.estribo?.bitola ?? 0;

	return {
		inferior: armaduras.inferior
			? calculaEspacamentoNum(largura, cobrimento, bitolaEstribo, armaduras.inferior)
			: undefined,
		superior: armaduras.superior
			? calculaEspacamentoNum(largura, cobrimento, bitolaEstribo, armaduras.superior)
			: undefined
	};
}

function calculaEspacamentoNum(
	largura: number,
	cobrimento: number,
	bitolaEstribo: number,
	armadura: Armadura
) {
	const dLinha = cobrimento + bitolaEstribo / 10 + armadura.bitola / (2 * 10);
	const larguraUtil = largura - 2 * dLinha;

	return armadura.quantidade > 1 ? larguraUtil / (armadura.quantidade - 1) : larguraUtil;
}

export function descricaoArmadura(armadura: Armadura) {
	return `${armadura.quantidade}Φ${armadura.bitola.toLocaleString('pt-BR')}`;
}
