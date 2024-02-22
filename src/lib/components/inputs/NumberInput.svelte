<script lang="ts">
	import { Input } from '../ui/input';

	export let value: number | undefined = undefined;
	let displayValue: string | undefined = value?.toString();

	function onInput(e: Event) {
		const inputValue = (e.target as HTMLInputElement)?.value;
		value = Number(inputValue ?? 0);
		displayValue = inputValue;
	}
</script>

<Input value={displayValue} on:input={onInput} type="number" {...$$restProps} />
