export function deepMap<T extends object>(obj: T, pred: (key: string, value: any) => any): T {
	const result: any = {};

	for (let [key, value] of Object.entries(obj)) {
		const type = typeof value;
		if (type === 'object') {
			result[key] = deepMap(value, pred);
		} else {
			result[key] = pred(key, value);
		}
	}

	return result;
}

export function isDeepEqual(a: any, b: any) {
	const typeA = typeof a;
	const typeB = typeof b;

	if (typeA !== typeB) {
		return false;
	}

	if (typeA === 'object') {
		const objKeys1 = Object.keys(a);
		const objKeys2 = Object.keys(b);

		if (objKeys1.length !== objKeys2.length) return false;

		for (var key of objKeys1) {
			const value1 = (a as any)[key];
			const value2 = (b as any)[key];

			if (!isDeepEqual(value1, value2)) {
				return false;
			}
		}

		return true;
	} else {
		return a === b;
	}
}

export function isObject(value: any): value is object {
	return value != null && typeof value === 'object';
}
