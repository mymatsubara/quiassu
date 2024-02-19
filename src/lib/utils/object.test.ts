import { deepMap } from '$lib/utils/object';
import { isNumeric } from '$lib/utils/string';
import { describe, expect, it } from 'vitest';

describe('Object utils', () => {
	it('should deep map correctly', () => {
		const obj = {
			geometria: {
				tipo: 'retangulo',
				largura: '14',
				altura: 40
			},
			fck: 25,
			dLinha: 4,
			fy: 500,
			es: '210',
			mskx: '28.57',
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: '1.15',
			gamaf: 1.4
		};

		const deepMapped = deepMap(obj, (_, value) =>
			typeof value === 'string' && isNumeric(value) ? Number(value) : value
		);

		expect(deepMapped).toStrictEqual({
			geometria: {
				tipo: 'retangulo',
				largura: 14,
				altura: 40
			},
			fck: 25,
			dLinha: 4,
			fy: 500,
			es: 210,
			mskx: 28.57,
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: 1.15,
			gamaf: 1.4
		});
	});
});
