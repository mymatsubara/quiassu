export function isNumeric(str: string) {
	return !isNaN(str as any) && !isNaN(parseFloat(str));
}
