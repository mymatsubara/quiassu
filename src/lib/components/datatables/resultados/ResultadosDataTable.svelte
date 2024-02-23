<script lang="ts">
	import {
		areaAcoArmadura,
		calculaDLinha,
		calculaEspacamento,
		descricaoArmadura
	} from '$lib/calculations/armadura';
	import { calcularAreaAcoMin, dimensionaSecao } from '$lib/calculations/nbr6118-elu';
	import DataTableCheckbox from '$lib/components/datatables/DataTableCheckbox.svelte';
	import NomeDisplay from '$lib/components/datatables/resultados/NomeDisplay.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import type { DadosSecao, Projeto } from '$lib/project/projeto';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { addSelectedRows, addTableFilter } from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';

	export let projeto: Projeto;

	type ResultadoSecao = {
		id: number;
		nome: string;
		bw: number;
		h: number;
		d: number;
		fck: number;
		fyk: number;
		mk: number;
		md: number;
		nk: number;
		nd: number;
		x_d: number;
		as: number;
		asMin: number;
		armaduraInferiorAdotada?: string;
		asAdotado?: number;
		armaduraSuperiorAdotada?: string;
		asLinhaAdotado?: number;
	};
	type Col = keyof ResultadoSecao;

	let data = calculaResultados(projeto);

	$: data = calculaResultados(projeto);

	function calculaResultados(projeto: Projeto): ResultadoSecao[] {
		return projeto.secoes.map((secao) => calculaResultado(secao) as any);
	}

	function calculaResultado(dados: DadosSecao): ResultadoSecao | undefined {
		const secao = dados.secao;
		const armaduras = dados.armaduras;
		const dLinha = calculaDLinha(secao, armaduras);
		const resultados = dimensionaSecao(secao, dLinha);
		const variaveis = resultados.variaveis;
		const asMin = calcularAreaAcoMin(secao);

		if (!variaveis) {
			alert('Seção não retangular');
			return undefined;
		} else {
			const espacamento = calculaEspacamento(variaveis.b, secao.cobrimento, armaduras);

			return {
				id: dados.id,
				nome: dados.nome || 'Seção sem nome',
				bw: variaveis.b,
				h: variaveis.h,
				d: variaveis.d,
				fck: secao.fck,
				fyk: secao.fy,
				mk: secao.mskx,
				md: variaveis.msdx,
				nk: secao.nsd,
				nd: variaveis.nsd,
				x_d: resultados.x / variaveis.d,
				as: resultados.as ?? 0,
				asMin: asMin,
				armaduraInferiorAdotada: armaduras.inferior?.quantidade
					? descricaoArmadura(armaduras.inferior.bitola, espacamento.inferior ?? 0)
					: '-',
				asAdotado:
					armaduras.inferior && armaduras.inferior?.quantidade
						? areaAcoArmadura(armaduras.inferior)
						: 0,
				armaduraSuperiorAdotada: armaduras.superior?.quantidade
					? descricaoArmadura(armaduras.superior.bitola, espacamento.superior ?? 0)
					: '-',
				asLinhaAdotado: armaduras.superior?.quantidade ? areaAcoArmadura(armaduras.superior) : 0
			};
		}
	}

	const table = createTable(readable(data), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows()
	});

	const numberCell = ({ value }: { value: number }) =>
		value.toLocaleString('en-US', { maximumFractionDigits: 2 });

	const columns = table.createColumns([
		table.column({
			accessor: ({ id }) => id,
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			}
		}),
		table.column({
			accessor: (item) => ({ nome: item.nome, id: item.id }),
			header: 'Nome',
			cell: ({ value }) => {
				return createRender(NomeDisplay, value);
			}
		}),
		table.column({
			accessor: 'bw',
			header: 'bw (cm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'h',
			header: 'h (cm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'd',
			header: 'd (cm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'fck',
			header: 'fck (MPa)',
			cell: numberCell
		}),
		table.column({
			accessor: 'fyk',
			header: 'fyk (MPa)',
			cell: numberCell
		}),
		table.column({
			accessor: 'mk',
			header: 'Mskx (KNm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'md',
			header: 'Msdx (KNcm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'nk',
			header: 'Nsk (KN)',
			cell: numberCell
		}),
		table.column({
			accessor: 'nd',
			header: 'Nsd (KN)',
			cell: numberCell
		}),
		table.column({
			accessor: 'x_d',
			header: 'x/d (cm)',
			cell: numberCell
		}),
		table.column({
			accessor: 'as',
			header: 'As (cm²)',
			cell: numberCell
		}),
		table.column({
			accessor: 'asMin',
			header: 'As,mín (cm²)',
			cell: numberCell
		}),
		table.column({
			accessor: 'armaduraInferiorAdotada',
			header: 'Armadura inf. adot.'
		}),
		table.column({
			accessor: 'asAdotado',
			header: 'As,adot (cm²)',
			cell: ({ value }) =>
				value ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'
		}),
		table.column({
			accessor: 'armaduraSuperiorAdotada',
			header: 'Armadura sup. adot.'
		}),
		table.column({
			accessor: 'asLinhaAdotado',
			header: "A's,adot (cm²)",
			cell: ({ value }) =>
				value ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-'
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } =
		table.createViewModel(columns);

	const boldCols: Col[] = [
		'asAdotado',
		'armaduraInferiorAdotada',
		'asLinhaAdotado',
		'armaduraSuperiorAdotada'
	];
	const boldColsSet: Set<Col> = new Set(boldCols);
	const { filterValue } = pluginStates.filter;
	const { selectedDataIds } = pluginStates.select;

	$: d = $rows[0].cells[1]?.state?.data;
	$: console.log($d);
</script>

<div>
	<div class="flex items-center">
		<Input
			class="max-w-sm bg-gray-50"
			placeholder="Filtra seções..."
			type="text"
			bind:value={$filterValue}
		/>
	</div>

	<div class="mt-6 rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										<div class="[&:has([role='checkbox'])]:px-2">
											<Render of={cell.render()} />
										</div>
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<div
											class="truncate [&:has([role='checkbox'])]:px-2 {boldColsSet.has(
												cell.column.id
											)
												? 'font-medium'
												: ''}"
										>
											{#if cell.id === 'nome'}
												<Button variant="ghost" href="/secao?id={row.state?.data}">
													<Render of={cell.render()} />
												</Button>
											{:else}
												<Render of={cell.render()} />
											{/if}
										</div>
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
