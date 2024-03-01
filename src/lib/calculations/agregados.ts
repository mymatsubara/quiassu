export type TipoAgregadoGraudo = (typeof tiposAgregadosGraudo)[number];
type DimensoesAgregado = {
	min: number;
	max: number;
};

export const tiposAgregadosGraudo = [
	'Brita 0',
	'Brita 1',
	'Brita 2',
	'Brita 3',
	'Brita 4'
] as const;

// Dimensões dos agregados graúdos em mm (NBR7211)
export const dimensoesAgregadoGraudoMm = {
	'Brita 0': {
		min: 6.3,
		max: 9.5
	},
	'Brita 1': {
		min: 12.5,
		max: 19
	},
	'Brita 2': {
		min: 19,
		max: 25
	},
	'Brita 3': {
		min: 25,
		max: 38
	},
	'Brita 4': {
		min: 38,
		max: 64
	}
} as const satisfies Record<TipoAgregadoGraudo, DimensoesAgregado>;

export function calculaCobrimentoMinimo(agregadoGraudo: TipoAgregadoGraudo) {
	const dimensoes = dimensoesAgregadoGraudoMm[agregadoGraudo];

	return (dimensoes?.max ?? 0) / (10 * 1.2);
}
