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
}

export interface CustomPath {
	getPath: () => Path2D;
	getBoundingBox: () => BoundingBox;
}

export function joinPaths(...paths: (CustomPath | CustomPath[])[]) {
	const result = new Path2D();

	for (let path of paths) {
		if (Array.isArray(path)) {
			if (path.length > 0) {
				const p = joinPaths(...path);
				result.addPath(p);
			}
		} else {
			result.addPath(path.getPath());
		}
	}

	return result;
}

export function mergePathsBoundingBoxes(...paths: (CustomPath | CustomPath[] | undefined)[]) {
	return mergeBoundingBoxes(
		...paths.map((path) =>
			Array.isArray(path)
				? path.map((p) => p.getBoundingBox())
				: path?.getBoundingBox() ?? { maxX: 0, minX: 0, maxY: 0, minY: 0 }
		)
	);
}

export function mergeBoundingBoxes(...boundingBoxes: (BoundingBox | BoundingBox[])[]) {
	let maxX = 0;
	let minX = 0;
	let maxY = 0;
	let minY = 0;

	for (let boundingBox of boundingBoxes) {
		if (Array.isArray(boundingBox)) {
			if (boundingBox.length > 0) {
				const bb = mergeBoundingBoxes(...boundingBox);
				maxX = Math.max(maxX, bb.maxX);
				minX = Math.min(minX, bb.minY);
				maxY = Math.max(maxY, bb.maxY);
				minY = Math.min(minY, bb.minY);
			}
		} else {
			maxX = Math.max(maxX, boundingBox.maxX);
			minX = Math.min(minX, boundingBox.minY);
			maxY = Math.max(maxY, boundingBox.maxY);
			minY = Math.min(minY, boundingBox.minY);
		}
	}

	return {
		maxX,
		minX,
		minY,
		maxY
	};
}

export class Rectangle implements CustomPath {
	constructor(
		public width: number,
		public height: number,
		public x: number = 0,
		public y: number = 0,
		public borderRadius: number = 0
	) {}

	getPath(): Path2D {
		const path = new Path2D();

		if (this.borderRadius > 0) {
			path.roundRect(this.x, this.y, this.width, this.height, this.borderRadius);
		} else {
			path.rect(this.x, this.y, this.width, this.height);
		}

		return path;
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

export class Circle implements CustomPath {
	constructor(public radius: number, public x: number = 0, public y: number = 0) {}

	getPath(): Path2D {
		const path = new Path2D();
		path.moveTo(this.x + this.radius, this.y);
		path.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

		return path;
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

export class Polygon implements CustomPath {
	constructor(public points: Vec2[]) {}

	getPath(): Path2D {
		const path = new Path2D();

		const start = this.points[0];
		path.moveTo(start.x, start.y);

		for (let i = 1; i < this.points.length; i++) {
			const point = this.points[i];
			path.lineTo(point.x, point.y);
		}

		path.closePath();

		return path;
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
