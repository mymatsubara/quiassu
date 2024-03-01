export interface Armaduras {
	superior?: Armadura;
	inferior?: Armadura;
	estribo?: Estribo;
}

export interface Armadura {
	camadas: CamadaArmadura[];
	espacamento: number;
}

export interface CamadaArmadura {
	quantidade?: number;
	bitola?: number; // em mm
}

export interface Estribo {
	bitola: number; // em mm
}

export function areaAcoArmadura(armadura: Armadura) {
	return armadura.camadas.reduce((total, camada) => total + areaAcoCamadaArmadura(camada), 0);
}

export function areaAcoCamadaArmadura({ quantidade, bitola }: CamadaArmadura) {
	return bitola && quantidade ? quantidade * areaBitola(bitola) : 0;
}

export function areaBitola(bitola: number) {
	const raio = bitola / (2 * 10);
	return Math.PI * raio ** 2;
}

export function calculaDLinha(cobrimento: number, armaduras: Armaduras) {
	const bitolaEstribo = (armaduras.estribo?.bitola ?? 0) / 10; // converte para cm

	return {
		inferior: Number(calculaDLinhaDireto(cobrimento, bitolaEstribo, armaduras.inferior)),
		superior: Number(calculaDLinhaDireto(cobrimento, bitolaEstribo, armaduras.superior))
	};
}

function calculaDLinhaDireto(cobrimento: number, bitolaEstribo: number, armadura?: Armadura) {
	const alturaMediaArmadura = armadura ? calculaAlturaMediaArmadura(armadura) : 0;

	return cobrimento + bitolaEstribo + alturaMediaArmadura;
}

function calculaAlturaMediaArmadura(armadura: Armadura) {
	if (!armadura.camadas?.length) {
		return 0;
	}

	let alturaPonderada = 0;
	let areaTotal = 0;
	let altura = (armadura.camadas[0].bitola ?? 0) / (2 * 10); // converte para cm
	const espacamento = armadura.espacamento;

	for (const camada of armadura.camadas) {
		const area = areaAcoCamadaArmadura(camada);

		alturaPonderada += altura * area;
		areaTotal += area;
		altura += espacamento;
	}

	return areaTotal > 0 ? alturaPonderada / areaTotal : 0;
}

function calculaEspacamentoCamadaNum(
	largura: number,
	cobrimento: number,
	bitolaEstribo: number,
	armadura: CamadaArmadura
) {
	const bitola = armadura?.bitola ?? 0;
	const quantidade = armadura?.quantidade ?? 0;
	const dLinha = cobrimento + bitolaEstribo / 10 + bitola / (2 * 10);
	const larguraUtil = largura - 2 * dLinha;

	return quantidade > 1 ? larguraUtil / (quantidade - 1) : larguraUtil;
}

export function descricaoArmadura(armadura: Armadura) {
	const descricoes = armadura.camadas
		.filter((camada) => camada.bitola && camada.quantidade)
		.map(descricaoCamadaArmadura);
	if (descricoes.length === 0) {
		return '-';
	}

	const primeiraCamada = descricoes[0];
	if (descricoes.length === 1) {
		return primeiraCamada;
	}

	const todasCamadaIguais = descricoes.every((desc) => desc === primeiraCamada);
	if (todasCamadaIguais) {
		return `${descricoes.length} camadas: ${primeiraCamada}`;
	}

	return descricoes.join(' | ');
}

export function descricaoCamadaArmadura(armadura: CamadaArmadura) {
	return `${armadura.quantidade ?? 0}Φ${armadura.bitola?.toLocaleString('pt-BR') ?? 0}`;
}

export function calculaEspacamentoLivreCamada(
	largura: number,
	cobrimento: number,
	bitolaEstriboMm: number,
	camada: CamadaArmadura
) {
	return (
		calculaEspacamentoCamadaNum(largura, cobrimento, bitolaEstriboMm, camada) -
		(camada?.bitola ?? 0) / 10
	);
}
