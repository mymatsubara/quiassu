<script lang="ts">
	import SectionDrawing from '$lib/components/SectionDrawing.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs';
	import { getSectionPoints, type Section, type SectionType } from '$lib/geometry/section';
	import { Pencil, Square } from 'lucide-svelte';

	let section: Section = { type: 'rectangle', height: 0, width: 0 };
	let sectionType: SectionType = 'rectangle';

	function changeHeight(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (section.type === 'rectangle') {
			section.height = Number(value);
		}
	}

	function changeWidth(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (section.type === 'rectangle') {
			section.width = Number(value);
		}
	}
</script>

<div class="flex h-full">
	<div class="min-w-80 border-r p-4">
		<div class="grid gap-2">
			<h4 class="font-medium leading-none">Seção</h4>

			<Tabs.Root bind:value={sectionType}>
				<Tabs.List class="grid grid-cols-2">
					<Tabs.Trigger value="rectangle"><Square class="h-5 w-5" /></Tabs.Trigger>
					<Tabs.Trigger value="polygon"><Pencil class="h-5 w-5" /></Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="rectangle">
					<div class="mt-4 grid gap-2">
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="width">Largura (m)</Label>
							<Input type="number" id="width" class="col-span-2 h-8" on:change={changeWidth} />
						</div>
						<div class="grid grid-cols-3 items-center gap-4">
							<Label for="height">Altura (m)</Label>
							<Input type="number" id="height" class="col-span-2 h-8" on:change={changeHeight} />
						</div>
					</div>
				</Tabs.Content>
				<Tabs.Content value="polygon">Adicione os pontos da seção</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>

	<SectionDrawing points={getSectionPoints(section)}>Desenho da seção transversal</SectionDrawing>
	<div class="min-w-80 border-l p-4">
		<div class="grid gap-2">
			<h4 class="font-medium leading-none">Resultados</h4>
		</div>
	</div>
</div>
