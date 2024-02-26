import { Vec2 } from '$lib/geometry/vec2';

export class Mat2 {
	constructor(private value: number[][]) {
		if (value.length < 2 || value[0].length < 2) {
			throw new Error('Mat2 of invalid size');
		}
	}

	multVec(vec: Vec2) {
		return new Vec2(
			this.value[0][0] * vec.x + this.value[0][1] * vec.y,
			this.value[1][0] * vec.x + this.value[1][1] * vec.y
		);
	}

	static rotation(angle: number): Mat2 {
		return new Mat2([
			[Math.cos(angle), -Math.sin(angle)],
			[Math.sin(angle), Math.cos(angle)]
		]);
	}
}
