<script lang="ts">
	import {
		dimensoesAgregadoGraudoMm,
		tiposAgregadosGraudo,
		type TipoAgregadoGraudo
	} from '$lib/calculations/agregados';
	import * as Select from '$lib/components/ui/select';
	import type { Selected } from 'bits-ui';

	export let value: TipoAgregadoGraudo | undefined;

	value = value ?? 'Brita 1';

	let selected: Selected<TipoAgregadoGraudo | undefined> = {
		value,
		label: label(value)
	};

	function label(tipo: TipoAgregadoGraudo) {
		const { min, max } = dimensoesAgregadoGraudoMm[tipo];
		return `${tipo} (${min.toLocaleString('pt-BR')}-${max.toLocaleString('pt-BR')}mm)`;
	}
</script>

<Select.Root
	onSelectedChange={(e) => {
		value = e?.value;
	}}
	bind:selected
>
	<Select.Trigger class="h-8">
		<Select.Value placeholder="Bitola" />
	</Select.Trigger>
	<Select.Content>
		{#each tiposAgregadosGraudo as tipo (tipo)}
			<Select.Item value={tipo}>{label(tipo)}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
