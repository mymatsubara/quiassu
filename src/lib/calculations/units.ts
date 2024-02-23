type StressUnit = 'GPa' | 'Pa' | 'MPa' | 'KN/cm2';
const toPascal = {
	Pa: 1,
	MPa: 1_000_000,
	GPa: 1_000_000_000,
	'KN/cm2': 10_000_000
} satisfies Record<StressUnit, number>;

type TorqueUnit = 'KNcm' | 'KNm' | 'Nm' | 'Ncm';
const toNewtonMeter = {
	Nm: 1,
	Ncm: 0.01,
	KNm: 1_000,
	KNcm: 10
};

type ForceUnit = 'MN' | 'KN' | 'N';
const toNewton = {
	N: 1,
	KN: 1_000,
	MN: 1_000_000
};

export function convertStress(value: number, from: StressUnit, to: StressUnit) {
	return (value * toPascal[from]) / toPascal[to];
}

export function convertToque(value: number, from: TorqueUnit, to: TorqueUnit) {
	return (value * toNewtonMeter[from]) / toNewtonMeter[to];
}

export function convertForce(value: number, from: ForceUnit, to: ForceUnit) {
	return (value * toNewton[from]) / toNewton[to];
}
