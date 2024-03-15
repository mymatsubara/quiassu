type CsvOptions<T extends object> = {
	hasHeaders?: boolean;
	labels?: Labels<T>;
	cols?: (keyof T)[];
	separator?: string;
	newLineSeparator?: string;
};

type Labels<T extends object> = {
	[value in keyof T]?: string;
};

export function toCsv<T extends object>(data: T[], options?: CsvOptions<T>) {
	const opts: Required<CsvOptions<T>> = {
		hasHeaders: true,
		cols: Object.keys(data[0] ?? {}) as (keyof T)[],
		newLineSeparator: '\r\n',
		separator: ',',
		labels: {},
		...options
	};

	return [buildHeaders(opts), ...data.map((rowData) => buildRow(rowData, opts)), ''].join(
		opts.newLineSeparator
	);
}

function buildHeaders<T extends object>(options: Required<CsvOptions<T>>) {
	return options.cols
		.map((col) => {
			const label = options.labels[col] ?? col;
			return displayValue(label, options.separator);
		})
		.join(options.separator);
}

function buildRow<T extends object>(data: T, options: Required<CsvOptions<T>>) {
	return options.cols
		.map((col) => displayValue(data[col], options.separator))
		.join(options.separator);
}

function displayValue(value: any, separator: string) {
	switch (typeof value) {
		case 'string':
			if (value.includes('"') || value.includes(separator)) {
				return `"${value.replaceAll('"', '""')}"`;
			} else {
				return value;
			}
		default:
			return value?.toString() ?? '';
	}
}
