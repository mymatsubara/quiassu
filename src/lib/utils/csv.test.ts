import { toCsv } from '$lib/utils/csv';
import { describe, expect, it } from 'vitest';

describe('Csv utils', () => {
	it('should generate a correct csv file', () => {
		const data = [
			{ number: 1, string: 'abc', escapedString: 'abc"', undefined: undefined, null: null },
			{ number: 3, string: 'xyz', escapedString: 'xyz"', undefined: undefined, null: null }
		];

		const expected =
			`number,string,escapedString,undefined,null\r\n` +
			`1,abc,"abc""",,\r\n` +
			`3,xyz,"xyz""",,\r\n`;

		expect(toCsv(data)).toBe(expected);
	});
});
