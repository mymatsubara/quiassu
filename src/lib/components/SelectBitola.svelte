<script lang="ts">
	import { unchecked } from '$lib/utils/ui';
	import type { Selected } from 'bits-ui';
	import * as Select from './ui/select';

	export let bitola: number | undefined;

	let selected: Selected<number | undefined> = {
		value: bitola ?? 0,
		label: bitola ? `${bitola} mm` : undefined
	};
	$: bitola = selected.value;
</script>

<Select.Root
	onSelectedChange={(e) => {
		bitola = unchecked(e?.value);
	}}
	bind:selected
>
	<Select.Trigger class="h-8">
		<Select.Value placeholder="Bitola" />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value={5.0}>5.0 mm</Select.Item>
		<Select.Item value={6.3}>6.3 mm</Select.Item>
		<Select.Item value={8.0}>8.0 mm</Select.Item>
		<Select.Item value={10.0}>10.0 mm</Select.Item>
		<Select.Item value={12.5}>12.5 mm</Select.Item>
		<Select.Item value={16.0}>16.0 mm</Select.Item>
		<Select.Item value={20.0}>20.0 mm</Select.Item>
		<Select.Item value={25.0}>25.0 mm</Select.Item>
		<Select.Item value={32.0}>32.0 mm</Select.Item>
	</Select.Content>
</Select.Root>
