import { Vec2 } from '$lib/geometry/vec2';

export interface BoundingBox {
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
	let maxX;
	let minX;
	let maxY;
	let minY;

	const first = boundingBoxes[0];
	if (Array.isArray(first)) {
		maxX = first[0].maxX;
		minX = first[0].minX;
		maxY = first[0].maxY;
		minY = first[0].minY;
	} else {
		maxX = first.maxX;
		minX = first.minX;
		maxY = first.maxY;
		minY = first.minY;
	}

	for (let boundingBox of boundingBoxes) {
		if (Array.isArray(boundingBox)) {
			if (boundingBox.length > 0) {
				const bb = mergeBoundingBoxes(...boundingBox);
				maxX = Math.max(maxX, bb.maxX);
				minX = Math.min(minX, bb.minX);
				maxY = Math.max(maxY, bb.maxY);
				minY = Math.min(minY, bb.minY);
			}
		} else {
			maxX = Math.max(maxX, boundingBox.maxX);
			minX = Math.min(minX, boundingBox.minX);
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

export function getPointsBoundingBox(...points: Vec2[]) {
	let maxX = points[0]?.x;
	let minX = points[0]?.x;
	let maxY = points[0]?.y;
	let minY = points[0]?.y;

	for (let point of points) {
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

export function getBoundingBoxDimensions(boundingBox: BoundingBox) {
	return {
		width: Math.abs(boundingBox.maxX - boundingBox.minX),
		height: Math.abs(boundingBox.maxY - boundingBox.minY)
	};
}

export function translateBoundingBox(bb: BoundingBox, vec: Vec2): BoundingBox {
	return {
		minX: bb.minX + vec.x,
		maxX: bb.maxX + vec.x,
		minY: bb.minY + vec.y,
		maxY: bb.maxY + vec.y
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

export class Polyline implements CustomPath {
	constructor(public points: Vec2[]) {}

	getPath(): Path2D {
		const path = new Path2D();

		const start = this.points[0];
		path.moveTo(start.x, start.y);

		for (let i = 1; i < this.points.length; i++) {
			const point = this.points[i];
			path.lineTo(point.x, point.y);
		}

		return path;
	}

	getBoundingBox(): BoundingBox {
		const points = this.points;
		let maxX = points[0].x;
		let minX = points[0].x;
		let maxY = points[0].y;
		let minY = points[0].y;

		for (let point of points) {
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

export class Polygon implements CustomPath {
	constructor(public points: Vec2[]) {}

	getPath(): Path2D {
		const path = new Polyline(this.points).getPath();
		path.closePath();
		return path;
	}

	getBoundingBox(): BoundingBox {
		return new Polyline(this.points).getBoundingBox();
	}
}

export class Measurement implements Drawing {
	constructor(
		public from: Vec2,
		public to: Vec2,
		public label: string,
		public scale = 1,
		public offset = 1
	) {}

	draw(ctx: CanvasRenderingContext2D) {
		const line = this.getLine();

		// desenha linha
		ctx.save();
		const path = line.getPath();
		ctx.strokeStyle = 'gray';
		ctx.stroke(path);
		ctx.restore();

		const text = this.getTextParams(line);

		// desenha o texto
		ctx.save();
		ctx.textAlign = 'center';
		ctx.translate(text.position.x, text.position.y);
		ctx.rotate(text.rotation);
		ctx.scale(text.scale, -text.scale);
		ctx.fillText(text.content, 0, 0);
		ctx.restore();
	}

	getLine() {
		const offset = 15 * this.scale * this.offset;
		const dentSize = 3 * this.scale;
		return new MeasureLine(this.from, this.to, offset, dentSize);
	}

	getTextParams(line: MeasureLine) {
		const { p0, p1, offsetDir } = line.calculateMainLine();
		const lineDir = p1.sub(p0).normalize();

		const rightText = lineDir.x >= -0.001;
		let rotation = Math.asin(rightText ? lineDir.y : -lineDir.y);

		const scale = 0.7 * this.scale;
		const offset = (rightText ? 3 : 5) * this.scale;
		const position = p0.add(p1).div(2).add(offsetDir.mult(offset));
		const size = p1.sub(p0).length();

		return {
			rotation,
			scale,
			position,
			content: `${this.label} = ${size.toLocaleString('pt-BR')} cm`,
			offsetDir
		};
	}

	getBoundingBox(): BoundingBox {
		const line = this.getLine();
		const text = this.getTextParams(line);
		const textPoint = text.position.add(text.offsetDir.mult(7 * this.scale));

		return mergeBoundingBoxes(line.getBoundingBox(), {
			maxX: textPoint.x,
			minX: textPoint.x,
			maxY: textPoint.y,
			minY: textPoint.y
		});
	}
}

export class MeasureLine implements CustomPath {
	constructor(
		public from: Vec2,
		public to: Vec2,
		public offset: number = 10,
		public dentSize = 5
	) {}

	getPath(): Path2D {
		const path = new Path2D();

		const { p0, p1, offsetDir } = this.calculateMainLine();
		path.moveTo(p0.x, p0.y);
		path.lineTo(p1.x, p1.y);

		// dents
		const dent0 = this.calculateDent(p0, offsetDir);
		path.moveTo(dent0.p0.x, dent0.p0.y);
		path.lineTo(dent0.p1.x, dent0.p1.y);

		const dent1 = this.calculateDent(p1, offsetDir);
		path.moveTo(dent1.p0.x, dent1.p0.y);
		path.lineTo(dent1.p1.x, dent1.p1.y);

		return path;
	}

	calculateMainLine() {
		// offseting line
		const lineDir = this.to.sub(this.from).normalize();
		const offsetDir = new Vec2(-lineDir.y, lineDir.x);
		const offset = offsetDir.mult(this.offset);

		// main line
		const p0 = this.from.add(offset);
		const p1 = this.to.add(offset);

		return {
			p0,
			p1,
			offsetDir
		};
	}

	private calculateDent(middlePoint: Vec2, direction: Vec2) {
		const p0 = middlePoint.add(direction.mult(this.dentSize / 2));
		const p1 = middlePoint.sub(direction.mult(this.dentSize / 2));

		return {
			p0,
			p1
		};
	}

	getBoundingBox(): BoundingBox {
		const { p0, p1, offsetDir } = this.calculateMainLine();
		const dent0 = this.calculateDent(p0, offsetDir);
		const dent1 = this.calculateDent(p1, offsetDir);

		return getPointsBoundingBox(p0, p1, dent0.p0, dent0.p1, dent1.p0, dent1.p1);
	}
}

export class BoundingBoxDrawing implements Drawing {
	constructor(public boundingBox: BoundingBox) {}

	draw(ctx: CanvasRenderingContext2D) {
		const bb = this.boundingBox;
		const { width, height } = getBoundingBoxDimensions(bb);

		ctx.save();
		ctx.strokeStyle = 'green';
		ctx.strokeRect(bb.minX, bb.minY, width, height);
		ctx.restore();
	}

	getBoundingBox(): BoundingBox {
		return this.boundingBox;
	}
}

export class TextDrawing implements Drawing {
	constructor(
		public text: string,
		public position: Vec2,
		public scale: number,
		public align: CanvasTextAlign = 'start',
		public baseline: CanvasTextBaseline = 'alphabetic'
	) {}

	draw(ctx: CanvasRenderingContext2D) {
		const scale = 0.7 * this.scale;

		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.scale(scale, -scale);
		ctx.textBaseline = this.baseline;
		ctx.textAlign = this.align;
		ctx.fillText(this.text, 0, 0);
		ctx.restore();
	}

	getBoundingBox(): BoundingBox {
		const width = 4.5 * this.text.length * this.scale;
		const height = 10 * this.scale;

		const boundingBox: BoundingBox = {
			minX: this.position.x,
			minY: this.position.y,
			maxX: this.position.x + width,
			maxY: this.position.y + height
		};

		let alignTranslate = new Vec2(0, 0);
		switch (this.align) {
			case 'center':
				alignTranslate = new Vec2(-width / 2, 0);
				break;
			case 'end':
			case 'right':
				alignTranslate = new Vec2(-width, 0);
				break;
		}

		let baselineTranslate = new Vec2(0, 0);
		switch (this.baseline) {
			case 'top':
			case 'hanging':
				baselineTranslate = new Vec2(0, -height);
				break;
			case 'bottom':
			case 'ideographic':
				baselineTranslate = new Vec2(0, 1);
				break;
			case 'middle':
				baselineTranslate = new Vec2(0, -height / 2);
				break;
		}

		const translate = alignTranslate.add(baselineTranslate);
		return translateBoundingBox(boundingBox, translate);
	}
}

export class TextLabel implements Drawing {
	constructor(
		public text: string,
		public position: Vec2,
		public scale: number,
		public target?: Vec2
	) {}

	draw(ctx: CanvasRenderingContext2D) {
		const line = this.getLine();
		if (line) {
			const lineDash = ctx.getLineDash();
			ctx.setLineDash([this.scale]);
			ctx.stroke(line.getPath());
			ctx.setLineDash(lineDash);
		}

		this.getText().draw(ctx);
	}

	getLine() {
		if (this.target) {
			const vec = this.position.sub(this.target);
			const scale = 1 - 2 / vec.length();
			const newPos = vec.mult(scale).add(this.target);

			return new Polyline([newPos, this.target]);
		}
	}

	getText() {
		const align = this.target && this.target.x > this.position.x ? 'end' : 'start';

		return new TextDrawing(this.text, this.position, this.scale, align, 'middle');
	}

	getBoundingBox(): BoundingBox {
		const lineBb = this.getLine()?.getBoundingBox();
		const text = this.getText();
		return mergeBoundingBoxes(lineBb ? [lineBb] : [], text.getBoundingBox());
	}
}
