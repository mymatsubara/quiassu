import { dimensionaSecao } from '$lib/calculations/nbr6118';
import { describe, expect, it } from 'vitest';

describe('NBR6118', () => {
	it('should calculate FNS (Flexão Normal Simple) with simple reinforcement and high resistance concrete', () => {
		const result = dimensionaSecao({
			geometria: {
				type: 'rectangle',
				width: 20,
				height: 50
			},
			fck: 70,
			dLinha: 5,
			fy: 500,
			es: 210,
			mskx: 200,
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: 1.15,
			gamaf: 1.4
		});

		expect(result?.x?.toFixed(2)).toBe('12.06');
		expect(result?.as?.toFixed(1)).toBe('15.9');
		expect(result?.asLinha).toBe(undefined);
	});

	it('should calculate FNS (Flexão Normal Simple) with double reinforcement and high resistance concrete', () => {
		const result = dimensionaSecao({
			geometria: {
				type: 'rectangle',
				width: 20,
				height: 50
			},
			fck: 70,
			dLinha: 5,
			fy: 500,
			es: 210,
			mskx: 300,
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: 1.15,
			gamaf: 1.4
		});

		expect(result?.x?.toFixed(2)).toBe('19.41');
		expect(result?.as?.toFixed(2)).toBe('25.33');
		expect(result?.asLinha?.toFixed(2)).toBe('5.20');
	});
});
