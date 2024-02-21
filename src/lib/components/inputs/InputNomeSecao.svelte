<script lang="ts">
	import { PenLine } from 'lucide-svelte';

	export let value: string;
	export let inputElement: HTMLInputElement | undefined = undefined;
</script>

<label class="flex w-full items-center gap-2">
	<PenLine class="h-4 w-4 cursor-pointer text-muted-foreground" />
	<input
		placeholder="Seção sem nome"
		class="w-full overflow-hidden text-ellipsis whitespace-nowrap border-0 text-lg font-semibold focus:outline-0"
		type="text"
		title={value}
		bind:value
		bind:this={inputElement}
	/>
</label>
