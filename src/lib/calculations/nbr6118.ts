import { convertStress, convertToque } from '$lib/calculations/units';
import type { SectionGeometry } from '$lib/geometry/section';

export interface Secao {
	geometria: SectionGeometry;

	// Cobrimento
	dLinha: number;

	// Concreto
	fck: number;
	gamac: number;

	// Aço
	fy: number;
	es: number;
	gamas: number;

	// Esforços
	mskx: number;
	msky: number;
	nsd: number;
	gamaf: number;
}

interface LinhaNeutralRecInput {
	b: number;
	d: number;
	fcd: number;
	msd: number;
	alfac: number;
	lambda: number;
}

interface DominioInput {
	x: number;
	d: number;
	ecu: number;
	es: number;
	fyd: number;
}

export function dimensionaSecao(secao: Secao) {
	const fcd = convertStress(secao.fck, 'MPa', 'KN/cm2') / secao.gamac;
	const fyd = convertStress(secao.fy, 'MPa', 'KN/cm2') / secao.gamas;
	const msdx = secao.gamaf * convertToque(secao.mskx, 'Nm', 'Ncm');
	const { xLimRel, alfac, lambda, ecu } = parametrosDimensionamento(secao.fck);
	const es = convertStress(secao.es, 'GPa', 'KN/cm2');

	switch (secao.geometria.type) {
		case 'rectangle':
			const d = secao.geometria.height - secao.dLinha;
			const dLinha = secao.dLinha;
			const b = secao.geometria.width;
			const xLim = d * xLimRel;

			let x = linhaNeutraRec({
				b,
				msd: msdx,
				d,
				fcd,
				lambda,
				alfac
			});
			const dominio = calculaDominio({ x, d, ecu, es, fyd });

			const precisaArmaduraDupla = x > xLim;
			if (precisaArmaduraDupla) {
				const xLinha = xLim;

				const msdLinha = ArmaduraDupla.msdLinha({ fcd, b, d, alfac, lambda, x, xLinha });
				const deltaMsd = ArmaduraDupla.deltaMsd(msdx, msdLinha);
				const sigmaSdLinha = ArmaduraDupla.sigmaSd({ fyd, x: xLinha, dLinha, ecu, es });
				const asLinha = ArmaduraDupla.areaAcoSecundaria({
					deltaMsd,
					sigmasd: sigmaSdLinha,
					d,
					dLinha
				});
				const as = ArmaduraDupla.areaAco({ d, deltaMsd, dLinha, fyd, lambda, msdLinha, x });

				return {
					x,
					dominio,
					as,
					asLinha
				};
			} else {
				const as = ArmaduraSimple.areaAco({ msd: msdx, d, sigmasd: fyd, x, lambda });

				return {
					x,
					dominio,
					as
				};
			}

		default:
			alert(`Seção do tipo "${secao.geometria.type}" não implementada`);
			return;
	}
}

function linhaNeutraRec({ b, d, fcd, msd, alfac, lambda }: LinhaNeutralRecInput) {
	return (d / lambda) * (1 - Math.sqrt(1 - (2 * msd) / (alfac * b * d ** 2 * fcd)));
}

export function calculaDominio({ x, d, ecu, es, fyd }: DominioInput) {
	const eyd = es / fyd;
	const lim2 = ecu / (0.01 + eyd);
	const lim3 = ecu / (ecu + eyd);

	const xd = x / d;
	if (xd <= 0) {
		return '1';
	} else if (xd <= lim2) {
		return '2';
	} else if (xd <= 0.45) {
		return '3a';
	} else if (xd <= lim3) {
		return '3b';
	} else {
		return '4/5';
	}
}

export function parametrosDimensionamento(fck: number) {
	if (fck <= 50) {
		return {
			ec2: 0.002,
			ecu: 0.0035,
			n: 2,
			alfac: 0.85,
			lambda: 0.8,
			xLimRel: 0.45
		};
	} else if (fck <= 90) {
		const ec2 = 0.002 + 0.000085 * (fck - 50) ** 0.53;
		const ecu = 0.0026 + 0.035 * ((90 - fck) / 100) ** 4;
		const n = 1.4 + 23.4 * ((90 - fck) / 100) ** 4;
		const alfac = 0.85 * (1 - (fck - 50) / 200);
		const lambda = 0.8 - (fck - 50) / 400;

		return {
			ec2,
			ecu,
			n,
			alfac,
			lambda,
			xLimRel: 0.35
		};
	} else {
		throw new Error(
			'A norma NBR6118 não define parâmetros para concreto com resistência maior do que 90 MPa'
		);
	}
}

module ArmaduraSimple {
	interface AreaAcoInput {
		msd: number;
		sigmasd: number;
		d: number;
		x: number;
		lambda: number;
	}

	export function areaAco({ msd, sigmasd, d, x, lambda }: AreaAcoInput) {
		return msd / (sigmasd * (d - 0.5 * lambda * x));
	}
}

module ArmaduraDupla {
	interface MsdLinhaInput {
		alfac: number;
		fcd: number;
		b: number;
		lambda: number;
		x: number;
		xLinha: number;
		d: number;
	}

	interface AreaAcoSecundariaInput {
		deltaMsd: number;
		sigmasd: number;
		d: number;
		dLinha: number;
	}

	interface AreaAcoInput {
		fyd: number;
		msdLinha: number;
		d: number;
		lambda: number;
		x: number;
		deltaMsd: number;
		dLinha: number;
	}

	interface DeformacaoLinhaSdInput {
		x: number;
		dLinha: number;
		ecu: number;
	}

	interface SigmaSdInput {
		x: number;
		dLinha: number;
		ecu: number;
		es: number;
		fyd: number;
	}

	export function msdLinha({ fcd, b, x, d, alfac, lambda, xLinha }: MsdLinhaInput) {
		return alfac * fcd * b * lambda * xLinha * (d - 0.5 * lambda * x);
	}

	export function deltaMsd(msd: number, msdLinha: number) {
		return msd - msdLinha;
	}

	export function areaAcoSecundaria({ deltaMsd, sigmasd, d, dLinha }: AreaAcoSecundariaInput) {
		return deltaMsd / (sigmasd * (d - dLinha));
	}

	export function areaAco({ fyd, msdLinha, d, lambda, x, deltaMsd, dLinha }: AreaAcoInput) {
		return (1 / fyd) * (msdLinha / (d - 0.5 * lambda * x) + deltaMsd / (d - dLinha));
	}

	export function sigmaSd({ fyd, x, dLinha, ecu, es }: SigmaSdInput) {
		const esd = ((x - dLinha) / x) * ecu;
		const eyd = fyd / es;

		return esd < eyd ? es * esd : fyd;
	}
}
