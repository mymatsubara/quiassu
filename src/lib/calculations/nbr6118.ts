import { convertStress, convertToque } from '$lib/calculations/units';
import type { SectionGeometry } from '$lib/geometry/section';

export interface Secao {
	geometria: SectionGeometry;

	// Cobrimento
	dlinha: number;

	// Concreto
	fck: number;
	gamac: number;

	// Aço
	fy: number;
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
	md: number;
}

interface AreaAcoInput {
	md: number;
	fyd: number;
	d: number;
	x: number;
}

export function areaAcoSecao(secao: Secao) {
	const fcd = convertStress(secao.fck, 'MPa', 'KN/cm2') / secao.gamac;
	const fyd = convertStress(secao.fy, 'MPa', 'KN/cm2') / secao.gamas;
	const mdx = secao.gamaf * convertToque(secao.mskx, 'Nm', 'Ncm');

	switch (secao.geometria.type) {
		case 'rectangle':
			const d = secao.geometria.height - secao.dlinha;

			const x = linhaNeutraRec({
				b: secao.geometria.width,
				md: mdx,
				d,
				fcd
			});

			const as = areaAcoRec({ md: mdx, d, fyd, x });

			console.log({
				b: secao.geometria.width,
				md: mdx,
				d,
				fcd,
				fyd,
				x
			});

			return {
				x,
				dominio: dominio(x, d),
				as
			};
		default:
			alert(`Seção do tipo "${secao.geometria.type}" não implementada`);
			return;
	}
}

function linhaNeutraRec({ b, d, fcd, md }: LinhaNeutralRecInput) {
	return 1.25 * d * (1 - Math.sqrt(1 - md / (0.425 * b * d ** 2 * fcd)));
}

function areaAcoRec({ md, fyd, d, x }: AreaAcoInput) {
	return md / (fyd * (d - 0.4 * x));
}

export function dominio(x: number, d: number) {
	const xd = x / d;
	if (xd < 0) {
		return '1';
	}
	if (xd < 0.259) {
		return '2';
	} else if (xd < 0.45) {
		return '3a';
	} else if (xd < 0.628) {
		return '3b';
	} else {
		return '4/5';
	}
}
