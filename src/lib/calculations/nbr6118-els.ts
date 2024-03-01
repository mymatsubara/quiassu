import {
	areaAcoArmadura,
	areaBitola,
	calculaDLinha,
	type Armaduras,
	type CamadaArmadura
} from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { convertStress, convertToque } from '$lib/calculations/units';

export function calcularELSW(secao: Secao, armaduras: Armaduras) {
	const armadura = armaduras.inferior;
	const as = armadura ? areaAcoArmadura(armadura) : 0;
	if (!as || secao.geometria.tipo !== 'retangulo') {
		return;
	}

	const dLinha = calculaDLinha(secao.cobrimento, armaduras);
	const alfa = 1.5; // seção retangular
	const eta1 = 2.25; // constante para barra nervuradas
	const b = secao.geometria.largura;
	const h = secao.geometria.altura;
	const d = secao.geometria.altura - dLinha.inferior;
	const Es = convertStress(secao.es, 'GPa', 'KN/cm2');
	const Ecs = convertStress(0.85 * 5600 * Math.sqrt(secao.fck), 'MPa', 'KN/cm2');
	const fctm = convertStress(0.3 * secao.fck ** (2 / 3), 'MPa', 'KN/cm2');
	const Mdserv = convertToque(secao.mskx, 'KNm', 'KNcm');
	const fctInf = 0.7 * fctm;
	const Ic = (b * h ** 3) / 12;
	const yt = h / 2;
	const alfae = Es / Ecs;

	const x = linhaNeutraEstadioII({ alfae, as, b, d });
	const Mr = (alfa * fctInf * Ic) / yt;
	const Mres = Mdserv / (d - x / 3);
	const sigmas = Mres / as;
	const sigmac = (2 * Mres) / (b * x);
	const cobrimento = secao.cobrimento;
	const bitolaEstribo = armaduras.estribo?.bitola ?? 0;

	let wk1 = 0;
	let wk2 = 0;
	let acri = 0;

	const camadas = armadura?.camadas ?? [];
	for (const [i, camada] of camadas.entries()) {
		if (!camada.bitola || !camada.quantidade) {
			continue;
		}

		let tipoCamada;
		if (camadas.length === 1) {
			tipoCamada = 'unica' as const;
		} else if (i === 0) {
			tipoCamada = 'inferior' as const;
		} else if (i === camadas.length - 1) {
			tipoCamada = 'superior' as const;
		} else {
			tipoCamada = 'meio' as const;
		}

		const fi1 = camada.bitola / 10;
		const coef = ((fi1 * sigmas) / (12.5 * eta1 * Es)) * 10; // converte para mm
		const dLinhaCamada = cobrimento + (bitolaEstribo + camada.bitola / 2) / 10;
		const acoConcreto = relacaoAcoConcretoTirante(
			secao,
			camada,
			dLinhaCamada,
			tipoCamada,
			armadura?.espacamento ?? 0
		);

		const wk1Camada = coef * ((3 * sigmas) / fctm);
		const wk2Camada = coef * (4 / acoConcreto.ro + 45);

		wk1 = Math.max(wk1Camada, wk1);
		if (wk2Camada > wk2) {
			wk2 = wk2Camada;
			acri = acoConcreto.acri;
		}
	}

	const wk = Math.min(wk1, wk2);

	const variaveis = { acri, ecs: Ecs, es: Es, mdserv: Mdserv };

	return {
		wk1,
		wk2,
		wk,
		variaveis
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

function relacaoAcoConcretoTirante(
	secao: Secao,
	armadura: CamadaArmadura,
	dLinha: number,
	tipoCamada: 'inferior' | 'meio' | 'superior' | 'unica',
	espacamentoCamadas: number
) {
	if (secao.geometria.tipo !== 'retangulo') {
		throw new Error('Relação aço concreto não implementada para seção não retangular');
	}

	if (!armadura.bitola || !armadura.quantidade) {
		return { ro: 0, acri: 0 };
	}

	const fi = armadura.bitola / 10; // converte para cm
	const larguraUtil = secao.geometria.largura - 2 * dLinha;
	const h = secao.geometria.altura;
	const areaBarra = areaBitola(armadura.bitola);
	const espacamento =
		armadura.quantidade !== 1
			? larguraUtil / (armadura.quantidade - 1)
			: secao.geometria.largura / 2;

	const calculo = (limiteInf: number, limiteSup: number) => {
		// Situação 1: barra de borda
		const b1 = Math.min(7.5 * fi, dLinha);
		const b2 = Math.min(7.5 * fi, espacamento / 2);
		const h1 = Math.min(7.5 * fi, limiteInf);
		const h2 = Math.min(7.5 * fi, limiteSup);

		const areaConcretoBarra1 = (b1 + b2) * (h1 + h2);
		const ro1 = areaBarra / areaConcretoBarra1;

		if ((armadura?.quantidade ?? 0) > 2) {
			// Situação 2: barra interna
			const areaConcretoBarra2 = (b2 + b2) * (h1 + h2);
			const ro2 = areaBarra / areaConcretoBarra2;

			const ro = Math.min(ro1, ro2);
			const acri = ro === ro1 ? areaConcretoBarra1 : areaConcretoBarra2;
			return { ro, acri };
		} else {
			return { ro: ro1, acri: areaConcretoBarra1 };
		}
	};

	switch (tipoCamada) {
		case 'unica':
			return calculo(dLinha, h - dLinha);
		case 'inferior':
			return calculo(dLinha, espacamentoCamadas / 2);
		case 'meio':
			return calculo(espacamentoCamadas / 2, espacamentoCamadas / 2);
		case 'superior':
			return calculo(espacamentoCamadas / 2, h - dLinha);
	}
}
