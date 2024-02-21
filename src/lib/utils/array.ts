export function max<T>(array: T[], pred: (v: T) => any): T | undefined {
	const len = array.length;
	if (len === 0) {
		return;
	}

	let result = array[0];
	let maxValue = pred(result);

	for (let i = 1; i < len; i++) {
		const element = array[i];
		const value = pred(element);
		if (value > maxValue) {
			result = element;
			maxValue = value;
		}
	}

	return result;
}
