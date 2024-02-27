export class Vec2 {
	constructor(public x: number, public y: number) {}

	add(other: Vec2) {
		return new Vec2(this.x + other.x, this.y + other.y);
	}

	sub(other: Vec2) {
		return new Vec2(this.x - other.x, this.y - other.y);
	}

	mult(scalar: number) {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

	div(scalar: number) {
		return new Vec2(this.x / scalar, this.y / scalar);
	}

	length() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	normalize() {
		return this.div(this.length());
	}
}
