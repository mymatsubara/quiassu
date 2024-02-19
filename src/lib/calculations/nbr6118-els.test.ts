import type { Armaduras } from '$lib/calculations/armadura';
import { calcularELSW } from '$lib/calculations/nbr6118-els';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { describe, expect, it } from 'vitest';

describe('NBR6118 - ELS', () => {
	it('calcula ELS-W', () => {
		const secao: Secao = {
			geometria: {
				tipo: 'retangulo',
				largura: 20,
				altura: 50
			},
			cobrimento: 4.2,
			fck: 20,
			fy: 500,
			es: 210,
			mskx: 62.5,
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: 1.15,
			gamaf: 1.4
		};

		const armaduras: Armaduras = {
			inferior: {
				bitola: 16,
				quantidade: 5
			}
		};

		const elsw = calcularELSW(secao, armaduras);

		expect(elsw?.wk1.toFixed(3)).toBe('0.091');
		expect(elsw?.wk2.toFixed(3)).toBe('0.110');
		expect(elsw?.wk.toFixed(3)).toBe('0.091');
	});
});
