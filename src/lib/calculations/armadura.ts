export interface Armaduras {
	superior: Armadura;
	inferior: Armadura;
}

export interface Armadura {
	quantidade?: number;
	bitola?: number;
}

export function areaAcoArmadura({ quantidade, bitola }: Armadura) {
	return bitola && quantidade ? quantidade * areaBitola(bitola) : 0;
}

function areaBitola(bitola: number) {
	const raio = bitola / (2 * 10);
	return Math.PI * raio ** 2;
}
