import { max } from '$lib/utils/array';
import { describe, expect, it } from 'vitest';

describe('Array utils', () => {
	it('should get value from array', () => {
		const array1 = [1, 2, 4, 5, 3, 2, 1];
		const array2 = [{ a: 2, b: 1 }, { c: 2, b: 1, a: 1 }, { a: 1000 }];
		const array3 = [new Date('2024-01-02'), new Date('2025-02-04'), new Date('2000-01-01')];

		expect(max(array1, (v) => v)).toBe(5);
		expect(max(array2, (v) => v.a)).toStrictEqual({ a: 1000 });
		expect(max(array3, (v) => v)).toStrictEqual(new Date('2025-02-04'));
	});
});
