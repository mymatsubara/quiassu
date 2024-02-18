import { areaAcoArmadura } from '$lib/calculations/armadura';
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
});
