<script lang="ts">
	import { browser } from '$app/environment';
	import type { Vec2 } from '$lib/geometry/vec2';
	import { onDestroy, onMount } from 'svelte';

	export let points: Vec2[];

	let ctx: CanvasRenderingContext2D;
	let containerElement: HTMLDivElement;

	$: {
		if (ctx) {
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;

			ctx.fillStyle = '#fff';
			ctx.clearRect(0, 0, width, height);
			drawSection(ctx, points);
		}
	}

	$: updateCanvasSize(ctx, containerElement);

	function drawSection(ctx: CanvasRenderingContext2D, points: Vec2[]) {
		if (points.length === 0) {
			return;
		}

		centerPath(ctx, points);

		for (let i = 0; i < points.length; i++) {
			const point = points[i];

			if (i === 0) {
				ctx.moveTo(point.x, point.y);
			} else {
				ctx.lineTo(point.x, point.y);
			}
		}

		ctx.closePath();
		ctx.stroke();
	}

	function centerPath(ctx: CanvasRenderingContext2D, points: Vec2[]) {
		const width = ctx.canvas.width;
		const height = ctx.canvas.height;

		let maxX = 0;
		let minX = 0;
		let maxY = 0;
		let minY = 0;

		for (let point of points) {
			maxX = Math.max(maxX, point.x);
			minX = Math.min(minX, point.x);
			maxY = Math.max(maxY, point.y);
			minY = Math.min(minY, point.y);
		}

		const sectionWidth = maxX - minX;
		const sectionHeight = maxY - minY;
		const middleX = (maxX + minX) / 2;
		const middleY = (maxY + minY) / 2;

		const scaleX = width / sectionWidth;
		const scaleY = height / sectionHeight;
		const scale = Math.min(scaleX, scaleY) * 0.75;

		ctx.translate(width / 2 - scale * middleX, height / 2 - scale * middleY);
		ctx.scale(scale, scale);
		ctx.lineWidth = 1 / scale;
	}

	function initCanvas(canvas: HTMLCanvasElement) {
		if (!(canvas instanceof HTMLCanvasElement)) {
			console.error('Element is not a canvas:', canvas);
			return;
		}

		const context = canvas.getContext('2d');

		if (!context) {
			const msg =
				'Browser does not support canvas 2d context. Try updating your browser or using another one.';
			alert(msg);
			console.error(msg);
			return;
		}
		ctx = context;
	}

	function onResize(e: UIEvent) {
		updateCanvasSize(ctx, containerElement);
	}

	function updateCanvasSize(ctx: CanvasRenderingContext2D, containerElement: HTMLDivElement) {
		if (containerElement && ctx) {
			ctx.canvas.width = containerElement.clientWidth;
			ctx.canvas.height = containerElement.clientHeight;
			drawSection(ctx, points);
		}
	}

	onMount(() => {
		window.addEventListener('resize', onResize);
	});

	onDestroy(() => {
		browser && window.removeEventListener('resize', onResize);
	});
</script>

<div bind:this={containerElement} class="h-full w-full">
	<canvas class="h-full w-full -scale-y-100" use:initCanvas><slot /></canvas>
</div>
