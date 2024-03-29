import type { TipoAgregadoGraudo } from '$lib/calculations/agregados';
import { convertStress, convertToque } from '$lib/calculations/units';
import type { GeometriaSecao } from '$lib/geometry/secao';

export interface Secao {
	geometria: GeometriaSecao;

	// Cobrimento
	cobrimento: number;

	// Concreto
	fck: number;
	gamac: number;
	agregadoGraudo: TipoAgregadoGraudo;

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

interface DominioInput {
	x: number;
	d: number;
	ecu: number;
	es: number;
	fyd: number;
	h: number;
}

type Dominio = ReturnType<typeof calculaDominio>;

interface ResultadoDimensionamentoSecao {
	x: number;
	dominio: Dominio;
	as?: number;
	asLinha?: number;
	valido: boolean;
}

export function dimensionaSecao(secao: Secao, dLinhaInf: number, dLinhaSup: number) {
	const fcd = convertStress(secao.fck, 'MPa', 'KN/cm2') / secao.gamac;
	const fyd = convertStress(secao.fy, 'MPa', 'KN/cm2') / secao.gamas;
	const msdx = secao.gamaf * convertToque(secao.mskx, 'KNm', 'KNcm');
	const nsd = secao.gamaf * secao.nsd;
	const { xLimRel, alfac, lambda, ecu } = parametrosDimensionamento(secao.fck);
	const es = convertStress(secao.es, 'GPa', 'KN/cm2');

	switch (secao.geometria.tipo) {
		case 'retangulo':
			const d = secao.geometria.altura - dLinhaInf;
			const b = secao.geometria.largura;
			const h = secao.geometria.altura;
			const xLim = d * xLimRel;
			const maxX = h / lambda;

			const variaveis = { fcd, fyd, msdx, nsd, es, b, d, h };

			// Calcular A's and As em compressão e para FNC com pequena excentricidade
			const fnc = FNC.PequenaExcentricidade.ArmaduraDupla.areaAco({
				es,
				alfac,
				dLinhaInf,
				dLinhaSup,
				b,
				h,
				msd: msdx,
				nsd: nsd,
				fcd
			});

			if (fnc.as > 0 && fnc.asLinha > 0) {
				const x = maxX;
				const dominio = calculaDominio({ x, d, ecu, es, fyd, h });

				return {
					as: fnc.as,
					asLinha: fnc.asLinha,
					x,
					dominio,
					valido: true,
					variaveis
				};
			}

			// Apenas A's comprimida, considerar armadura simples
			if (fnc.as < 0 && fnc.asLinha > 0) {
				const x = FNC.PequenaExcentricidade.ArmaduraSimples.linhaNeutraRec({
					b,
					dLinha: dLinhaInf,
					fcd,
					lambda,
					alfac,
					h,
					msd: msdx,
					nsd
				});
				const dominio = calculaDominio({ x, d, ecu, es, fyd, h });

				if (x > maxX || isNaN(x)) {
					return {
						x,
						dominio,
						valido: false,
						variaveis
					};
				}

				const sigmaSdLinha = FNC.PequenaExcentricidade.ArmaduraSimples.sigmaSdLinha({
					x,
					d,
					es,
					fyd,
					ecu,
					h
				});
				const asLinha = FNC.PequenaExcentricidade.ArmaduraSimples.areaAco({
					alfac,
					b,
					fcd,
					lambda,
					nsd,
					sigmaSdLinha,
					x
				});

				return {
					asLinha,
					x,
					dominio,
					valido: true,
					variaveis
				};
			}

			// Fazer cálculo para FNC com grande excentricidade
			let x = FNC.GrandeExcentricidade.linhaNeutraRec({
				b,
				d,
				fcd,
				lambda,
				alfac,
				h,
				nsd,
				msd: msdx
			});
			const dominio = calculaDominio({ x, d, ecu, es, fyd, h });

			if (dominio === '1') {
				const flexotracao = FNC.PequenaExcentricidade.FlexoTracao.areaAco({
					fyd,
					msd: msdx,
					nsd,
					h,
					dLinhaSup,
					dLinhaInf
				});

				return {
					as: flexotracao.as,
					asLinha: flexotracao.asLinha,
					x,
					dominio,
					valido: true,
					variaveis
				};
			}

			const precisaArmaduraDupla = x > xLim;
			if (precisaArmaduraDupla) {
				x = xLim;
				const dominio = calculaDominio({ x, d, ecu, es, fyd, h });
				const msd = msdx + nsd * (h / 2 - dLinhaInf);

				const msdLinha = FNC.GrandeExcentricidade.ArmaduraDupla.msdLinha({
					fcd,
					b,
					d,
					alfac,
					lambda,
					x
				});
				const deltaMsd = FNC.GrandeExcentricidade.ArmaduraDupla.deltaMsd(msd, msdLinha);
				const sigmaSdLinha = FNC.GrandeExcentricidade.ArmaduraDupla.sigmaSd({
					fyd,
					x,
					dLinha: dLinhaSup,
					ecu,
					es
				});
				const asLinha = FNC.GrandeExcentricidade.ArmaduraDupla.areaAcoSecundaria({
					deltaMsd,
					sigmasd: sigmaSdLinha,
					d,
					dLinha: dLinhaSup
				});
				const as = FNC.GrandeExcentricidade.ArmaduraDupla.areaAco({
					d,
					deltaMsd,
					dLinha: dLinhaSup,
					fyd,
					lambda,
					msdLinha,
					x,
					nsd
				});

				return {
					x,
					dominio,
					as,
					asLinha,
					valido: true,
					variaveis
				};
			} else {
				const as = FNC.GrandeExcentricidade.ArmaduraSimples.areaAco({
					msd: msdx,
					d,
					sigmasd: fyd,
					x,
					lambda,
					nsd,
					h
				});

				return {
					x,
					dominio,
					as,
					valido: true,
					variaveis
				};
			}

		default:
			alert(`Seção do tipo "${secao.geometria.tipo}" não implementada`);
			return {
				dominio: '1',
				x: 0,
				valido: false
			};
	}
}

export function calcularAreaAcoMin(secao: Secao) {
	const taxaMin = taxaArmaduraMin(secao.fck);
	const geometria = secao.geometria;
	if (geometria.tipo === 'retangulo') {
		const area = geometria.altura * geometria.largura;
		return area * taxaMin;
	} else {
		throw new Error('Seção poligonar não implementada');
	}
}

function taxaArmaduraMin(fck: number) {
	if (fck <= 30) {
		return 0.0015;
	} else if (fck <= 35) {
		return 0.00164;
	} else if (fck <= 40) {
		return 0.00179;
	} else if (fck <= 45) {
		return 0.00194;
	} else if (fck <= 50) {
		return 0.00208;
	} else if (fck <= 55) {
		return 0.00211;
	} else if (fck <= 60) {
		return 0.00219;
	} else if (fck <= 65) {
		return 0.00226;
	} else if (fck <= 70) {
		return 0.00233;
	} else if (fck <= 75) {
		return 0.00239;
	} else if (fck <= 80) {
		return 0.00245;
	} else if (fck <= 85) {
		return 0.00251;
	} else if (fck <= 90) {
		return 0.00256;
	} else {
		throw new Error('fck acima de 90MPa não implementado');
	}
}

export function calculaDominio({ x, d, ecu, es, fyd, h }: DominioInput) {
	const eyd = fyd / es;
	const lim2 = ecu / (0.01 + eyd);
	const lim3 = ecu / (ecu + eyd);
	const lim3a = ecu > 0.0035 ? 0.35 : 0.45;

	const xd = x / d;
	if (xd <= 0) {
		return '1';
	} else if (xd <= lim2) {
		return '2';
	} else if (xd <= lim3a) {
		return '3a';
	} else if (xd <= lim3) {
		return '3b';
	} else if (x <= h) {
		return '4';
	} else {
		return '5';
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

module FNC {
	export module GrandeExcentricidade {
		interface LinhaNeutralRecInput {
			b: number;
			d: number;
			fcd: number;
			msd: number;
			alfac: number;
			lambda: number;
			nsd: number;
			h: number;
		}

		export function linhaNeutraRec({
			b,
			d,
			fcd,
			msd,
			alfac,
			lambda,
			h,
			nsd
		}: LinhaNeutralRecInput) {
			const dLinha = h - d;
			return (
				(d / lambda) *
				(1 - Math.sqrt(1 - (msd + nsd * (h / 2 - dLinha)) / (0.5 * alfac * b * d ** 2 * fcd)))
			);
		}

		export module ArmaduraSimples {
			interface AreaAcoInput {
				msd: number;
				sigmasd: number;
				d: number;
				x: number;
				h: number;
				lambda: number;
				nsd: number;
			}

			export function areaAco({ msd, sigmasd, d, x, lambda, h, nsd }: AreaAcoInput) {
				const dLinha = h - d;

				return (1 / sigmasd) * ((msd + nsd * (h / 2 - dLinha)) / (d - 0.5 * lambda * x) - nsd);
			}
		}

		export module ArmaduraDupla {
			interface MsdLinhaInput {
				alfac: number;
				fcd: number;
				b: number;
				lambda: number;
				x: number;
				d: number;
			}

			export function msdLinha({ fcd, b, x, d, alfac, lambda }: MsdLinhaInput) {
				return alfac * fcd * b * lambda * x * (d - 0.5 * lambda * x);
			}

			export function deltaMsd(msd: number, msdLinha: number) {
				return msd - msdLinha;
			}

			interface AreaAcoSecundariaInput {
				deltaMsd: number;
				sigmasd: number;
				d: number;
				dLinha: number;
			}

			export function areaAcoSecundaria({ deltaMsd, sigmasd, d, dLinha }: AreaAcoSecundariaInput) {
				return deltaMsd / (sigmasd * (d - dLinha));
			}

			interface AreaAcoInput {
				fyd: number;
				msdLinha: number;
				d: number;
				lambda: number;
				x: number;
				deltaMsd: number;
				dLinha: number;
				nsd: number;
			}

			export function areaAco({
				fyd,
				msdLinha,
				d,
				lambda,
				x,
				deltaMsd,
				dLinha,
				nsd
			}: AreaAcoInput) {
				return (1 / fyd) * (msdLinha / (d - 0.5 * lambda * x) + deltaMsd / (d - dLinha) - nsd);
			}

			interface SigmaSdInput {
				x: number;
				dLinha: number;
				ecu: number;
				es: number;
				fyd: number;
			}

			export function sigmaSd({ fyd, x, dLinha, ecu, es }: SigmaSdInput) {
				const esd = ((x - dLinha) / x) * ecu;
				const eyd = fyd / es;

				return esd < eyd ? es * esd : fyd;
			}
		}
	}
	export module PequenaExcentricidade {
		export module ArmaduraDupla {
			interface AreaAcoInput {
				es: number;
				msd: number;
				dLinhaInf: number;
				dLinhaSup: number;
				nsd: number;
				h: number;
				b: number;
				fcd: number;
				alfac: number;
			}

			export function areaAco({
				es,
				msd,
				dLinhaInf,
				dLinhaSup,
				nsd,
				h,
				b,
				alfac,
				fcd
			}: AreaAcoInput) {
				const rcd = alfac * h * b * fcd;
				const sigmaSd = es * 0.002;
				const rLinhaSd = (msd + (nsd - rcd) * (h / 2 - dLinhaInf)) / (h - dLinhaInf - dLinhaSup);
				const rsd = nsd - rcd - rLinhaSd;

				return {
					asLinha: rLinhaSd / sigmaSd,
					as: rsd / sigmaSd
				};
			}
		}

		export module ArmaduraSimples {
			interface AreaAco {
				alfac: number;
				lambda: number;
				x: number;
				fcd: number;
				b: number;
				nsd: number;
				sigmaSdLinha: number;
			}

			export function areaAco({ alfac, b, fcd, lambda, nsd, sigmaSdLinha, x }: AreaAco) {
				const rcd = alfac * lambda * b * x * fcd;
				return (nsd - rcd) / sigmaSdLinha;
			}

			interface SigmaSdInput {
				x: number;
				d: number;
				es: number;
				fyd: number;
				ecu: number;
				h: number;
			}

			export function sigmaSdLinha({ x, d, es, fyd, ecu, h }: SigmaSdInput) {
				const dominio = calculaDominio({ d, ecu, es, fyd, x, h });
				const dLinha = h - d;

				let esd: number;
				if (dominio === '2' || dominio === '1') {
					esd = ((x - dLinha) / (d - x)) * 0.01;
				} else if (dominio === '3a' || dominio === '3b' || dominio === '4') {
					esd = ((x - dLinha) / x) * 0.0035;
				} else {
					esd = ((x - dLinha) / (x - (3 / 7) * h)) * 0.002;
				}
				const eyd = fyd / es;

				return esd < eyd ? es * esd : fyd;
			}

			interface LinhaNeutraInput {
				lambda: number;
				alfac: number;
				dLinha: number;
				h: number;
				b: number;
				fcd: number;
				msd: number;
				nsd: number;
			}
			export function linhaNeutraRec({
				alfac,
				b,
				dLinha,
				fcd,
				h,
				lambda,
				msd,
				nsd
			}: LinhaNeutraInput) {
				return (
					(dLinha / lambda) *
					(1 +
						Math.sqrt(1 - (msd - nsd * (h / 2 - dLinha)) / (0.5 * alfac * b * dLinha ** 2 * fcd)))
				);
			}
		}

		export module FlexoTracao {
			interface AreaAcoInput {
				fyd: number;
				msd: number;
				nsd: number;
				h: number;
				dLinhaInf: number;
				dLinhaSup: number;
			}

			export function areaAco({ fyd, msd, nsd, h, dLinhaInf, dLinhaSup }: AreaAcoInput) {
				const rLinhaSd = (-msd - nsd * (h / 2 - dLinhaInf)) / (h - dLinhaInf - dLinhaSup);
				const rsd = -nsd - rLinhaSd;

				return {
					asLinha: rLinhaSd / fyd,
					as: rsd / fyd
				};
			}
		}
	}
}
