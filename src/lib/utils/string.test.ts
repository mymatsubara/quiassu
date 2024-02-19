import { isNumeric } from '$lib/utils/string';
import { describe, expect, it } from 'vitest';

describe('String utils', () => {
	it('should check if is numeric', () => {
		expect(isNumeric('0')).toBeTruthy();
		expect(isNumeric('010')).toBeTruthy();
		expect(isNumeric('010   ')).toBeTruthy();
		expect(isNumeric('1.10')).toBeTruthy();
		expect(isNumeric('ab')).toBeFalsy();
		expect(isNumeric('1a2')).toBeFalsy();
	});
});
