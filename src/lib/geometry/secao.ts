import type { Armaduras } from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { Circle, Polygon, Rectangle, type Drawing } from '$lib/geometry/drawing';
import { Vec2 } from '$lib/geometry/vec2';

export type GeometriaSecao =
	| {
			tipo: 'retangulo';
			altura: number;
			largura: number;
	  }
	| {
			tipo: 'poligono';
			pontos: Vec2[];
	  };

export type TipoSecao = GeometriaSecao['tipo'];

export function obtemDesenhoDaSecaoComArmaduras(secao: Secao, armaduras: Armaduras): Drawing[] {
	return [obtemDesenhoDaSecao(secao.geometria), ...obtemDesenhoDasArmaduras(secao, armaduras)];
}

function obtemDesenhoDasArmaduras(secao: Secao, armaduras: Armaduras): Circle[] {
	if (secao.geometria.tipo === 'poligono') {
		return [];
	}

	let armadurasInferiores: Circle[] = [];
	let armadurasSuperiores: Circle[] = [];
	const larguraUtil = secao.geometria.largura - 2 * secao.dLinha;

	if (armaduras.inferior.bitola && armaduras.inferior.quantidade) {
		const raio = armaduras.inferior.bitola / (2 * 10); // Converte raio para cm

		if (armaduras.inferior.quantidade === 1) {
			const x = secao.geometria.largura / 2;
			const y = secao.dLinha;
			armadurasInferiores = [new Circle(raio, x, y)];
		} else {
			const x = secao.dLinha;
			const y = secao.dLinha;
			const quantidade = armaduras.inferior.quantidade;
			const espacamento = larguraUtil / (quantidade - 1);
			armadurasInferiores = desenhaCirculosEspacados(x, y, raio, quantidade, espacamento);
		}
	}

	if (armaduras.superior.bitola && armaduras.superior.quantidade) {
		const raio = armaduras.superior.bitola / (2 * 10); // Converte raio para cm

		if (armaduras.superior.quantidade === 1) {
			const x = secao.geometria.largura / 2;
			const y = secao.geometria.altura - secao.dLinha;
			armadurasSuperiores = [new Circle(raio, x, y)];
		} else {
			const x = secao.dLinha;
			const y = secao.geometria.altura - secao.dLinha;
			const quantidade = armaduras.superior.quantidade;
			const espacamento = larguraUtil / (quantidade - 1);
			armadurasSuperiores = desenhaCirculosEspacados(x, y, raio, quantidade, espacamento);
		}
	}

	return [...armadurasInferiores, ...armadurasSuperiores];
}

function desenhaCirculosEspacados(
	x: number,
	y: number,
	raio: number,
	quantidade: number,
	espacamento: number
): Circle[] {
	return new Array(quantidade)
		.fill(0)
		.map((_, i) => new Circle(raio, x + i * espacamento, y, true));
}

function obtemDesenhoDaSecao(secao: GeometriaSecao): Drawing {
	switch (secao.tipo) {
		case 'poligono':
			return new Polygon(secao.pontos);
		case 'retangulo':
			return new Rectangle(secao.largura, secao.altura);
	}
}
