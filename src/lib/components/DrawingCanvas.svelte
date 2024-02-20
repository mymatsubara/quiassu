<script lang="ts">
	import { browser } from '$app/environment';
	import type { Drawing } from '$lib/geometry/drawing';
	import { onDestroy, onMount } from 'svelte';

	export let drawing: Drawing;

	let ctx: CanvasRenderingContext2D;
	let containerElement: HTMLDivElement;

	$: {
		if (ctx) {
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;

			ctx.fillStyle = '#fff';
			ctx.clearRect(0, 0, width, height);
			draw(ctx, drawing);
		}
	}

	$: updateCanvasSize(ctx, containerElement);

	function draw(ctx: CanvasRenderingContext2D, drawing: Drawing) {
		centerPath(ctx, drawing);
		drawing.draw(ctx);
	}

	function centerPath(ctx: CanvasRenderingContext2D, drawing: Drawing) {
		const width = ctx.canvas.width;
		const height = ctx.canvas.height;

		const { maxX, minX, maxY, minY } = drawing.getBoundingBox();

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
			draw(ctx, drawing);
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
