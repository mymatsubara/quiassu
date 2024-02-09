import { dimensionaSecao, parametrosDimensionamento } from '$lib/calculations/nbr6118';
import { describe, expect, it } from 'vitest';

describe('NBR6118', () => {
	it('calcula parâmetros de dimensionamento para fck 60MPa', () => {
		const fck = 60;
		const parametros = parametrosDimensionamento(fck);

		expect(parametros.ec2.toFixed(5)).toBe('0.00229');
		expect(parametros.ecu.toFixed(7)).toBe('0.0028835');
		expect(parametros.n.toFixed(2)).toBe('1.59');
		expect(parametros.alfac.toFixed(4)).toBe('0.8075');
		expect(parametros.lambda.toFixed(3)).toBe('0.775');
	});

	it('calcula parâmetros de dimensionamento para fck 90MPa', () => {
		const fck = 90;
		const parametros = parametrosDimensionamento(fck);

		expect(parametros.ec2.toFixed(4)).toBe('0.0026');
		expect(parametros.ecu.toFixed(4)).toBe('0.0026');
		expect(parametros.n.toFixed(1)).toBe('1.4');
		expect(parametros.alfac.toFixed(2)).toBe('0.68');
		expect(parametros.lambda.toFixed(1)).toBe('0.7');
	});

	it('calcula FNS (Flexão Normal Simples) com armadura simples', () => {
		const result = dimensionaSecao({
			geometria: {
				type: 'rectangle',
				width: 14,
				height: 40
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

		expect(result?.x?.toFixed(2)).toBe('7.09');
		expect(result?.as?.toFixed(2)).toBe('2.77');
		expect(result?.asLinha).toBe(undefined);
	});

	it('calcula FNS (Flexão Normal Simples) com armadura dupla', () => {
		const result = dimensionaSecao({
			geometria: {
				type: 'rectangle',
				width: 14,
				height: 40
			},
			fck: 25,
			dLinha: 4,
			fy: 500,
			es: 210,
			mskx: 83.57,
			msky: 0,
			nsd: 0,
			gamac: 1.4,
			gamas: 1.15,
			gamaf: 1.4
		});

		expect(result?.x?.toFixed(2)).toBe('16.20');
		expect(result?.as?.toFixed(2)).toBe('8.90');
		expect(result?.asLinha?.toFixed(2)).toBe('2.57');
	});

	it('calcula FNS (Flexão Normal Simples) com armadura simples e concreto de alta resistência', () => {
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

	it('calcula FNS (Flexão Normal Simples) com armadura dupla e concreto de alta resistência', () => {
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

		expect(result?.x?.toFixed(2)).toBe('15.75');
		expect(result?.as?.toFixed(2)).toBe('24.62');
		expect(result?.asLinha?.toFixed(2)).toBe('4.38');
	});
});
