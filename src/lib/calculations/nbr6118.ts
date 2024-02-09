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
					dominio: dominio(x, d),
					as,
					asLinha
				};
			} else {
				const as = ArmaduraSimple.areaAco({ msd: msdx, d, sigmasd: fyd, x, lambda });

				return {
					x,
					dominio: dominio(x, d),
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

export function dominio(x: number, d: number) {
	const xd = x / d;
	if (xd <= 0) {
		return '1';
	}
	if (xd <= 0.259) {
		return '2';
	} else if (xd <= 0.45) {
		return '3a';
	} else if (xd <= 0.628) {
		return '3b';
	} else {
		return '4/5';
	}
}

function parametrosDimensionamento(fck: number) {
	if (fck <= 50) {
		return {
			ec2: 0.002,
			ecu: 0.0035,
			n: 2,
			alfac: 0.85,
			lambda: 0.8,
			limDominio2: 0.259,
			limDominio3: 0.628,
			xLimRel: 0.45
		};
	} else if (fck <= 55) {
		return {
			ec2: 0.0022,
			ecu: 0.003125,
			n: 1.751,
			alfac: 0.829,
			lambda: 0.788,
			limDominio2: 0.238,
			limDominio3: 0.602,
			xLimRel: 0.35
		};
	} else if (fck <= 60) {
		return {
			ec2: 0.00229,
			ecu: 0.002884,
			n: 1.59,
			alfac: 0.808,
			lambda: 0.775,
			limDominio2: 0.224,
			limDominio3: 0.582,
			xLimRel: 0.35
		};
	} else if (fck <= 65) {
		return {
			ec2: 0.00236,
			ecu: 0.002737,
			n: 1.491,
			alfac: 0.786,
			lambda: 0.763,
			limDominio2: 0.215,
			limDominio3: 0.569,
			xLimRel: 0.35
		};
	} else if (fck <= 70) {
		return {
			ec2: 0.00242,
			ecu: 0.002656,
			n: 1.437,
			alfac: 0.765,
			lambda: 0.75,
			limDominio2: 0.21,
			limDominio3: 0.562,
			xLimRel: 0.35
		};
	} else if (fck <= 75) {
		return {
			ec2: 0.00247,
			ecu: 0.002618,
			n: 1.412,
			alfac: 0.744,
			lambda: 0.738,
			limDominio2: 0.207,
			limDominio3: 0.558,
			xLimRel: 0.35
		};
	} else if (fck <= 80) {
		return {
			ec2: 0.00252,
			ecu: 0.002604,
			n: 1.402,
			alfac: 0.723,
			lambda: 0.725,
			limDominio2: 0.207,
			limDominio3: 0.557,
			xLimRel: 0.35
		};
	} else if (fck <= 85) {
		return {
			ec2: 0.00256,
			ecu: 0.0026,
			n: 1.4,
			alfac: 0.701,
			lambda: 0.713,
			limDominio2: 0.206,
			limDominio3: 0.557,
			xLimRel: 0.35
		};
	} else if (fck <= 90) {
		return {
			ec2: 0.0026,
			ecu: 0.0026,
			n: 1.4,
			alfac: 0.68,
			lambda: 0.7,
			limDominio2: 0.206,
			limDominio3: 0.557,
			xLimRel: 0.35
		};
	} else {
		return {
			ec2: 0.0026,
			ecu: 0.0026,
			n: 1.4,
			alfac: 0.68,
			lambda: 0.7,
			limDominio2: 0.206,
			limDominio3: 0.557,
			xLimRel: 0.35
		};
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
