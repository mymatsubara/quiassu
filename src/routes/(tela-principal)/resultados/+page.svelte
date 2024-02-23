<script lang="ts">
	import TabelaResultados from '$lib/components/datatables/resultados/ResultadosDataTable.svelte';
	import { projeto } from '$lib/stores/projeto';
</script>

<TabelaResultados projeto={$projeto} />
