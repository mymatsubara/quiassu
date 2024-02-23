<script lang="ts">
	import { page } from '$app/stores';
	import FuncoesProjeto from '$lib/components/FuncoesProjeto.svelte';
	import LinkTabs from '$lib/components/tabs/LinkTabs.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { projeto } from '$lib/stores/projeto';
	import { FolderInput, MoreVertical, PenLine, Save, SaveAll } from 'lucide-svelte';

	// Funções do projeto
	let salvarProjeto: FuncoesProjeto['salvarProjeto'];
	let abrirProjeto: FuncoesProjeto['abrirProjeto'];
</script>

<FuncoesProjeto bind:salvarProjeto bind:abrirProjeto />

<div class="flex h-full flex-col">
	<nav class="border-b">
		<div class="container">
			<div class="flex h-16 items-center justify-between gap-2 py-4">
				<label class="flex w-full items-center gap-2">
					<PenLine class="h-5 w-5 cursor-pointer text-muted-foreground" />
					<input
						placeholder="Projeto sem nome"
						class="w-full overflow-hidden text-ellipsis whitespace-nowrap border-0 text-lg font-semibold focus:outline-0 sm:text-xl"
						type="text"
						title={$projeto.nome}
						bind:value={$projeto.nome}
					/>
				</label>

				<div class="flex justify-end gap-3">
					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								class="rounded-full"
								variant="secondary"
								size="icon"
								on:click={() => salvarProjeto()}
							>
								<Save class="h-5 w-5" />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Salvar <DropdownMenu.Shortcut>(Ctrl+S)</DropdownMenu.Shortcut></p>
						</Tooltip.Content>
					</Tooltip.Root>

					<div class="hidden sm:block">
						<Tooltip.Root>
							<Tooltip.Trigger asChild let:builder>
								<Button
									builders={[builder]}
									class="rounded-full"
									variant="secondary"
									size="icon"
									on:click={abrirProjeto}><FolderInput class="h-5 w-5" /></Button
								>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Abrir projeto <DropdownMenu.Shortcut>(Ctrl+O)</DropdownMenu.Shortcut></p>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="secondary" builders={[builder]} size="icon"
								><MoreVertical class="h-5 w-5" /></Button
							>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-60">
							<DropdownMenu.Label>Mais opções</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item
									class="cursor-pointer sm:hidden"
									on:click={() => {
										abrirProjeto();
									}}
								>
									<FolderInput class="mr-2 h-4 w-4" />
									<span>Abrir projeto</span>
									<DropdownMenu.Shortcut>Ctrl+O</DropdownMenu.Shortcut>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="cursor-pointer"
									on:click={() => {
										salvarProjeto(true);
									}}
								>
									<SaveAll class="mr-2 h-4 w-4" />
									<span>Salvar como...</span>
									<DropdownMenu.Shortcut>Ctrl+Shift+S</DropdownMenu.Shortcut>
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
			<LinkTabs
				curPathname={$page.url.pathname}
				tabs={[
					{ label: 'Seções', href: '/' },
					{ label: 'Resultados', href: '/resultados' }
				]}
			/>
		</div>
	</nav>

	<div class="container mt-10 pb-5">
		<slot />
	</div>
</div>
