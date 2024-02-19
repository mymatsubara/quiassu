import type { Vec2 } from '$lib/geometry/vec2';

interface BoundingBox {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface Drawing {
	draw: (ctx: CanvasRenderingContext2D) => void;
	getBoundingBox: () => BoundingBox;
	fill: boolean;
}

export class Rectangle implements Drawing {
	constructor(
		public width: number,
		public height: number,
		public x: number = 0,
		public y: number = 0,
		public fill = false
	) {}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.fill) {
			ctx.fillRect(this.x, this.y, this.width, this.height);
		} else {
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}

	getBoundingBox(): BoundingBox {
		return {
			minX: this.x,
			minY: this.y,
			maxX: this.x + this.width,
			maxY: this.y + this.height
		};
	}
}

export class Circle implements Drawing {
	constructor(
		public radius: number,
		public x: number = 0,
		public y: number = 0,
		public fill = false
	) {}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.moveTo(this.x + this.radius, this.y);
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	}

	getBoundingBox(): BoundingBox {
		return {
			minX: this.x - this.radius,
			minY: this.y - this.radius,
			maxX: this.x + this.radius,
			maxY: this.y + this.radius
		};
	}
}

export class Polygon implements Drawing {
	constructor(public points: Vec2[], public fill = false) {}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.points.length === 0) {
			return;
		}

		const start = this.points[0];
		ctx.moveTo(start.x, start.y);

		for (let i = 1; i < this.points.length; i++) {
			const point = this.points[i];
			ctx.lineTo(point.x, point.y);
		}

		ctx.closePath();
	}

	getBoundingBox(): BoundingBox {
		let maxX = 0;
		let minX = 0;
		let maxY = 0;
		let minY = 0;

		for (let point of this.points) {
			maxX = Math.max(maxX, point.x);
			minX = Math.min(minX, point.x);
			maxY = Math.max(maxY, point.y);
			minY = Math.min(minY, point.y);
		}

		return {
			maxX,
			minX,
			minY,
			maxY
		};
	}
}
