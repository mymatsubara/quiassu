<script lang="ts">
	import {
		areaAcoArmadura,
		calculaDLinha,
		calculaEspacamento,
		descricaoArmadura
	} from '$lib/calculations/armadura';
	import { calcularELSW } from '$lib/calculations/nbr6118-els';
	import { calcularAreaAcoMin, dimensionaSecao } from '$lib/calculations/nbr6118-elu';
	import { convertStress, convertToque } from '$lib/calculations/units';
	import DataTableCheckbox from '$lib/components/datatables/DataTableCheckbox.svelte';
	import NomeDisplay from '$lib/components/datatables/resultados/NomeDisplay.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import type { DadosSecao, Projeto } from '$lib/project/projeto';
	import { toCsv } from '$lib/utils/csv';
	import { saveToFileOld } from '$lib/utils/file';
	import { ChevronDown, FileSpreadsheet } from 'lucide-svelte';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import { addSelectedRows, addTableFilter } from 'svelte-headless-table/plugins';
	import { toast } from 'svelte-sonner';
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
		mdserv?: number;
		es: number;
		ecs?: number;
		acri?: number;
		wk1?: number;
		wk2?: number;
		wk?: number;
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
		const elsw = calcularELSW(secao, armaduras);

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
				md: convertToque(variaveis.msdx, 'KNcm', 'KNm'),
				nk: secao.nsd,
				nd: variaveis.nsd,
				x_d: resultados.x / variaveis.d,
				as: resultados.as ?? 0,
				asMin: asMin,
				armaduraInferiorAdotada: armaduras.inferior?.quantidade
					? descricaoArmadura(armaduras.inferior)
					: '-',
				asAdotado:
					armaduras.inferior && armaduras.inferior?.quantidade
						? areaAcoArmadura(armaduras.inferior)
						: 0,
				armaduraSuperiorAdotada: armaduras.superior?.quantidade
					? descricaoArmadura(armaduras.superior)
					: '-',
				asLinhaAdotado: armaduras.superior?.quantidade ? areaAcoArmadura(armaduras.superior) : 0,
				mdserv: elsw?.variaveis?.mdserv
					? convertToque(elsw?.variaveis?.mdserv, 'KNcm', 'KNm')
					: undefined,
				es: convertStress(secao.es, 'GPa', 'MPa'),
				ecs: elsw?.variaveis?.ecs
					? convertStress(elsw?.variaveis?.ecs, 'KN/cm2', 'MPa')
					: undefined,
				acri: elsw?.variaveis?.acri,
				wk1: elsw?.wk1,
				wk2: elsw?.wk2,
				wk: elsw?.wk
			};
		}
	}

	const headers: Record<Col, string> = {
		id: 'ID',
		nome: 'Nome',
		bw: 'bw (cm)',
		h: 'h (cm)',
		d: 'd (cm)',
		fck: 'fck (MPa)',
		fyk: 'fyk (MPa)',
		mk: 'Mskx (KNm)',
		md: 'Msdx (KNm)',
		nk: 'Nsk (KN)',
		nd: 'Nsd (KN)',
		x_d: 'x/d (cm)',
		as: 'As (cm²)',
		asMin: 'As,mín (cm²)',
		armaduraInferiorAdotada: 'Armadura inf. adot.',
		asAdotado: 'As,adot (cm²)',
		armaduraSuperiorAdotada: 'Armadura sup. adot.',
		asLinhaAdotado: "A's,adot (cm²)",
		mdserv: 'Md,serv (KNm)',
		es: 'Es (MPa)',
		ecs: 'Ecs (MPa)',
		acri: 'Acri (cm²)',
		wk1: 'wk1 (mm)',
		wk2: 'wk2 (mm)',
		wk: 'wk2 (mm)'
	};

	const table = createTable(readable(data), {
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		select: addSelectedRows()
	});

	const numberCell = ({ value }: { value?: number }) =>
		value?.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) ?? '-';

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
			accessor: 'nome',
			header: headers['nome']
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
			header: headers['bw'],
			cell: numberCell
		}),
		table.column({
			accessor: 'h',
			header: headers['h'],
			cell: numberCell
		}),
		table.column({
			accessor: 'd',
			header: headers['d'],
			cell: numberCell
		}),
		table.column({
			accessor: 'fck',
			header: headers['fck'],
			cell: numberCell
		}),
		table.column({
			accessor: 'fyk',
			header: headers['fyk'],
			cell: numberCell
		}),
		table.column({
			accessor: 'mk',
			header: headers['mk'],
			cell: numberCell
		}),
		table.column({
			accessor: 'md',
			header: headers['md'],
			cell: numberCell
		}),
		table.column({
			accessor: 'nk',
			header: headers['nk'],
			cell: numberCell
		}),
		table.column({
			accessor: 'nd',
			header: headers['nd'],
			cell: numberCell
		}),
		table.column({
			accessor: 'x_d',
			header: headers['x_d'],
			cell: numberCell
		}),
		table.column({
			accessor: 'as',
			header: headers['as'],
			cell: numberCell
		}),
		table.column({
			accessor: 'asMin',
			header: headers['asMin'],
			cell: numberCell
		}),
		table.column({
			accessor: 'armaduraInferiorAdotada',
			header: headers['armaduraInferiorAdotada']
		}),
		table.column({
			accessor: 'asAdotado',
			header: headers['asAdotado'],
			cell: ({ value }) =>
				value ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '-'
		}),
		table.column({
			accessor: 'armaduraSuperiorAdotada',
			header: headers['armaduraSuperiorAdotada']
		}),
		table.column({
			accessor: 'asLinhaAdotado',
			header: headers['asLinhaAdotado'],
			cell: ({ value }) =>
				value ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '-'
		}),
		table.column({
			accessor: 'mdserv',
			header: headers['mdserv'],
			cell: numberCell
		}),
		table.column({
			accessor: 'es',
			header: headers['es'],
			cell: numberCell
		}),
		table.column({
			accessor: 'ecs',
			header: headers['ecs'],
			cell: numberCell
		}),
		table.column({
			accessor: 'acri',
			header: headers['acri'],
			cell: numberCell
		}),
		table.column({
			accessor: 'wk1',
			header: headers['wk1'],
			cell: numberCell
		}),
		table.column({
			accessor: 'wk2',
			header: headers['wk2'],
			cell: numberCell
		}),
		table.column({
			accessor: 'wk',
			header: headers['wk'],
			cell: numberCell
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, rows } =
		table.createViewModel(columns);

	const hiddenCols: Col[] = ['nome'] as const;
	const hiddenColsSet: Set<string> = new Set(hiddenCols);

	const boldCols: Col[] = [
		'asAdotado',
		'armaduraInferiorAdotada',
		'asLinhaAdotado',
		'armaduraSuperiorAdotada',
		'wk'
	] as const;
	const boldColsSet: Set<string> = new Set(boldCols);
	const { filterValue } = pluginStates.filter;
	const { selectedDataIds } = pluginStates.select;

	function exportParaCsv() {
		const filename = `Resultados - ${projeto.nome || 'Projeto sem nome'}.csv`;
		const data = selectedData();
		const csv = toCsv(data, { labels: headers });
		const encoder = new TextEncoder();
		// Prefixa o arquivo com BOM (https://en.wikipedia.org/wiki/Byte_order_mark) para indicar que o arquivo foi salvo com utf-8
		const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

		const blob = new Blob([bom, encoder.encode(csv)], {
			type: 'text/csv'
		});
		saveToFileOld(filename, blob);
		toast.success('Arquivo exportado com sucesso');
	}

	function selectedData() {
		return Object.keys($selectedDataIds).length > 0
			? data.filter((secao) => $selectedDataIds[secao.id])
			: data;
	}
</script>

<div>
	<div class="flex items-center justify-between gap-2">
		<Input
			class="max-w-sm bg-gray-50"
			placeholder="Filtra seções..."
			type="text"
			bind:value={$filterValue}
		/>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]}>Exportar <ChevronDown class="ml-2 size-4" /></Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-40">
				<DropdownMenu.Label>Exportar</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item class="cursor-pointer" on:click={exportParaCsv}>
						<FileSpreadsheet class="mr-2 size-4" />
						<span>Para csv...</span>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<div class="mt-6 rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				<Table.Row class="divide-x bg-gray-50">
					<Table.Head class="text-center" colspan={18}
						>DIMENSIONAMENTO - ELU (NBR 6118-2014)</Table.Head
					>
					<Table.Head class="text-center" colspan={7}
						>VERIFICAÇÃO À FISSURAÇÃO - ELS-W (NBR 6118-2014)</Table.Head
					>
				</Table.Row>

				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row class="bg-gray-50">
							{#each headerRow.cells as cell (cell.id)}
								{#if !hiddenColsSet.has(cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
										<Table.Head {...attrs}>
											<div
												class="[&:has([role='checkbox'])]:px-2 {cell.label === 'Nome'
													? 'px-4'
													: ''}"
											>
												<Render of={cell.render()} />
											</div>
										</Table.Head>
									</Subscribe>
								{/if}
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
								{#if !hiddenColsSet.has(cell.id)}
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
								{/if}
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
