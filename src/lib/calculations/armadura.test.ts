import {
	areaAcoCamadaArmadura,
	calculaDLinha,
	descricaoArmadura,
	descricaoCamadaArmadura,
	type Armadura
} from '$lib/calculations/armadura';
import { describe, expect, it } from 'vitest';

describe('Armadura', () => {
	it('calcula área de armadura corretamente', () => {
		const a1 = areaAcoCamadaArmadura({ bitola: 0, quantidade: 0 });
		const a2 = areaAcoCamadaArmadura({ bitola: 10, quantidade: 1 });
		const a3 = areaAcoCamadaArmadura({ bitola: 10, quantidade: 4 });
		const a4 = areaAcoCamadaArmadura({ bitola: 32, quantidade: 1 });
		const a5 = areaAcoCamadaArmadura({ bitola: 32, quantidade: 5 });

		expect(a1.toFixed(3)).toBe('0.000');
		expect(a2.toFixed(3)).toBe('0.785');
		expect(a3.toFixed(3)).toBe('3.142');
		expect(a4.toFixed(3)).toBe('8.042');
		expect(a5.toFixed(3)).toBe('40.212');
	});

	it('gera descrição de uma camada de armadura corretamente', () => {
		expect(descricaoCamadaArmadura({ quantidade: 5, bitola: 20 })).toBe('5Φ20');
		expect(descricaoCamadaArmadura({ quantidade: 6, bitola: 20.1 })).toBe('6Φ20,1');
	});

	it('gera descrição da armadura corretamente', () => {
		const armadura1: Armadura = {
			espacamento: 5,
			camadas: []
		};
		const armadura2: Armadura = {
			espacamento: 4,
			camadas: [
				{
					bitola: 20,
					quantidade: 5
				}
			]
		};
		const armadura3: Armadura = {
			espacamento: 4,
			camadas: [
				{
					bitola: 20,
					quantidade: 5
				},
				{
					bitola: 20,
					quantidade: 5
				}
			]
		};
		const armadura4: Armadura = {
			espacamento: 4,
			camadas: [
				{
					bitola: 20,
					quantidade: 5
				},
				{
					bitola: 10,
					quantidade: 3
				}
			]
		};

		expect(descricaoArmadura(armadura1)).toBe('-');
		expect(descricaoArmadura(armadura2)).toBe('5Φ20');
		expect(descricaoArmadura(armadura3)).toBe('2 camadas: 5Φ20');
		expect(descricaoArmadura(armadura4)).toBe('5Φ20 | 3Φ10');
	});

	it("calcula d' corretamente sem armadura", () => {
		const dLinha1 = calculaDLinha(4, {
			inferior: {
				camadas: [],
				espacamento: 5
			}
		});

		expect(dLinha1.inferior).toBe(4);
		expect(dLinha1.superior).toBe(4);
	});

	it("calcula d' corretamente", () => {
		const dLinha1 = calculaDLinha(4, {
			inferior: {
				camadas: [
					{
						bitola: 10,
						quantidade: 5
					},
					{
						bitola: 10,
						quantidade: 5
					}
				],
				espacamento: 5
			},
			superior: {
				camadas: [
					{
						bitola: 10,
						quantidade: 10
					}
				],
				espacamento: 5
			},
			estribo: {
				bitola: 5
			}
		});

		expect(dLinha1.inferior).toBe(7.5);
		expect(dLinha1.superior).toBe(5);
	});

	it("calcula d' corretamente para camadas diferentes", () => {
		const dLinha1 = calculaDLinha(4, {
			inferior: {
				camadas: [
					{
						bitola: 10,
						quantidade: 5
					},
					{
						bitola: 10,
						quantidade: 10
					}
				],
				espacamento: 5
			},
			estribo: {
				bitola: 5
			}
		});

		expect(dLinha1.inferior).toBeCloseTo(8.33);
		expect(dLinha1.superior).toBe(4.5);
	});
});
