import {
	areaAcoArmadura,
	areaBitola,
	type Armadura,
	type Armaduras
} from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { convertStress, convertToque } from '$lib/calculations/units';

export function calcularELSW(secao: Secao, armaduras: Armaduras) {
	const armadura = armaduras.inferior;
	if (!armadura.bitola || !armadura.quantidade || secao.geometria.tipo !== 'retangulo') {
		return;
	}

	const alfa = 1.5; // seção retangular
	const eta1 = 2.25; // constante para barra nervuradas
	const as = areaAcoArmadura(armadura);
	const b = secao.geometria.largura;
	const h = secao.geometria.altura;
	const d = secao.geometria.altura - secao.dLinha;
	const Es = convertStress(secao.es, 'GPa', 'KN/cm2');
	const Ecs = convertStress(0.85 * 5600 * Math.sqrt(secao.fck), 'MPa', 'KN/cm2');
	const fctm = convertStress(0.3 * secao.fck ** (2 / 3), 'MPa', 'KN/cm2');
	const Mdserv = convertToque(secao.mskx, 'KNm', 'KNcm');
	const fctInf = 0.7 * fctm;
	const Ic = (b * h ** 3) / 12;
	const yt = h / 2;
	const alfae = Es / Ecs;
	const fi1 = armadura.bitola / 10;

	const x = linhaNeutraEstadioII({ alfae, as, b, d });
	const Mr = (alfa * fctInf * Ic) / yt;
	const Mres = Mdserv / (d - x / 3);
	const sigmas = Mres / as;
	const sigmac = (2 * Mres) / (b * x);

	// Para apenas barra da armadura
	const coef = ((fi1 * sigmas) / (12.5 * eta1 * Es)) * 10; // converte para mm
	const ro = relacaoAcoConcretoTirante(secao, armadura);

	const wk1 = coef * ((3 * sigmas) / fctm);
	const wk2 = coef * (4 / ro + 45);
	const wk = Math.min(wk1, wk2);

	return {
		wk1,
		wk2,
		wk
	};
}

interface LinhaNeutraEstadioIIInput {
	alfae: number;
	as: number;
	b: number;
	d: number;
}

function linhaNeutraEstadioII({ alfae, as, b, d }: LinhaNeutraEstadioIIInput) {
	const coefB = (2 * alfae * as) / b;
	const coefC = -coefB * d;

	return (-coefB + Math.sqrt(coefB ** 2 - 4 * coefC)) / 2;
}

interface MomentoFletorFissuracaoInput {
	fctkInf: number;
	ic: number;
	alfa: number;
	yt: number;
}

function relacaoAcoConcretoTirante(secao: Secao, armadura: Armadura) {
	if (secao.geometria.tipo !== 'retangulo') {
		throw new Error('Relação aço concreto não implementada para seção não retangular');
	}

	if (!armadura.bitola || !armadura.quantidade) {
		return 0;
	}

	const dLinha = secao.dLinha;
	const fi = armadura.bitola / 10; // converte para cm
	const larguraUtil = secao.geometria.largura - 2 * dLinha;
	const h = secao.geometria.altura;
	const areaBarra = areaBitola(armadura.bitola);
	const espacamento =
		armadura.quantidade !== 1
			? larguraUtil / (armadura.quantidade - 1)
			: secao.geometria.largura / 2;

	// Situação 1: barra de borda
	const b1 = Math.min(7.5 * fi, dLinha);
	const b2 = Math.min(7.5 * fi, espacamento / 2);
	const h1 = Math.min(7.5 * fi, dLinha);
	const h2 = Math.min(7.5 * fi, h - dLinha);
	const areaConcretoBarra = (b1 + b2) * (h1 + h2);
	const ro1 = areaBarra / areaConcretoBarra;

	if (armadura.quantidade > 2) {
		// Situação 2: barra interna
		const areaConcretoBarra = (b2 + b2) * (h1 + h2);
		const ro2 = areaBarra / areaConcretoBarra;

		return Math.min(ro1, ro2);
	} else {
		return ro1;
	}
}
