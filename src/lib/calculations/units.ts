type StressUnit = "Pa" | "MPa" | "KN/cm2";
const toPascal = {
    "Pa": 1,
    "MPa": 1_000_000,
    "KN/cm2": 10_000_000,
} satisfies Record<StressUnit, number>;

type TorqueUnit = "Nm" | "Ncm";
const toNewtonMeter = {
    "Nm": 1,
    "Ncm": 0.01
}


export function convertStress(value: number, from: StressUnit, to: StressUnit) {
    return value * toPascal[from] / toPascal[to];
}

export function convertToque(value: number, from: TorqueUnit, to: TorqueUnit) {
    return value * toNewtonMeter[from] / toNewtonMeter[to];
}

