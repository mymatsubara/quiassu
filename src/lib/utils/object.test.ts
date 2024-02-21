import { deepMap, isDeepEqual } from '$lib/utils/object';
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

	it('should check deep equality', () => {
		const person1 = {
			firstName: 'John',
			lastName: 'Doe',
			age: 35,
			children: [
				{
					firstName: 'John',
					lastName: 'Doe Jr 1',
					age: 10
				},
				{
					firstName: 'John',
					lastName: 'Doe Jr 2',
					age: 5
				}
			]
		};

		const person2 = {
			firstName: 'John',
			lastName: 'Doe',
			age: 35,
			children: [
				{
					firstName: 'John',
					lastName: 'Doe Jr 1',
					age: 10
				},
				{
					firstName: 'John',
					lastName: 'Doe Jr 2',
					age: 5
				}
			]
		};

		const array1 = [1, 2, 3, 4];
		const array2 = [1, 2, 3, 4];
		const array3 = [1, 2, 5, 4];

		expect(isDeepEqual(person1, person2)).toBeTruthy();
		expect(isDeepEqual(array1, array2)).toBeTruthy();
		expect(isDeepEqual(array1, array3)).toBeFalsy();
	});
});
