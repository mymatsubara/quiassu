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
