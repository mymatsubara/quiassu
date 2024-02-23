import { areaAcoArmadura, calculaEspacamento, descricaoArmadura } from '$lib/calculations/armadura';
import { describe, expect, it } from 'vitest';

describe('Armadura', () => {
	it('calcula área de armadura corretamente', () => {
		const a1 = areaAcoArmadura({ bitola: 0, quantidade: 0 });
		const a2 = areaAcoArmadura({ bitola: 10, quantidade: 1 });
		const a3 = areaAcoArmadura({ bitola: 10, quantidade: 4 });
		const a4 = areaAcoArmadura({ bitola: 32, quantidade: 1 });
		const a5 = areaAcoArmadura({ bitola: 32, quantidade: 5 });

		expect(a1.toFixed(3)).toBe('0.000');
		expect(a2.toFixed(3)).toBe('0.785');
		expect(a3.toFixed(3)).toBe('3.142');
		expect(a4.toFixed(3)).toBe('8.042');
		expect(a5.toFixed(3)).toBe('40.212');
	});

	it('calcula espacemento corretamente', () => {
		const largura = 40;
		const cobrimento = 4;

		const espacamento1 = calculaEspacamento(largura, cobrimento, {
			inferior: { bitola: 10, quantidade: 6 },
			estribo: { bitola: 5 }
		});
		const espacamento2 = calculaEspacamento(largura, cobrimento, {
			superior: { bitola: 20, quantidade: 5 },
			estribo: { bitola: 10 }
		});

		expect(espacamento1).toStrictEqual({
			inferior: 6,
			superior: undefined
		});
		expect(espacamento2).toStrictEqual({
			inferior: undefined,
			superior: 7
		});
	});

	it('gera descrição da armadura corretamente', () => {
		expect(descricaoArmadura({ quantidade: 5, bitola: 20 })).toBe('5Φ20');
		expect(descricaoArmadura({ quantidade: 6, bitola: 20.1 })).toBe('6Φ20,1');
	});
});
