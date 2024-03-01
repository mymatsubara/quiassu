import { projetoVazio, type Projeto } from '$lib/project/projeto';
import { writable } from 'svelte/store';

export let projeto = writable<Projeto>(projetoVazio());
export let arquivoProjeto = writable<FileSystemFileHandle>();

export let prevState: Projeto;
