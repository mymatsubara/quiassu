import { calculaDLinha, type Armaduras } from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import { Circle, Polygon, Rectangle, RoundedRectangle, type Drawing } from '$lib/geometry/drawing';
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
	return [
		obtemDesenhoDaSecao(secao.geometria),
		...obtemEstribos(secao, armaduras),
		...obtemDesenhoDasArmaduras(secao, armaduras)
	];
}

function obtemEstribos(secao: Secao, armaduras: Armaduras): RoundedRectangle[] {
	if (secao.geometria.tipo !== 'retangulo' || !armaduras.estribo) {
		return [];
	}

	const c = secao.cobrimento;
	const b = secao.geometria.largura;
	const h = secao.geometria.altura;
	const bitola = armaduras.estribo.bitola / 10;
	const raio = 2 * bitola;

	if (2 * c >= h) {
		return [];
	}

	const w1 = b - 2 * c;
	const h1 = h - 2 * c;
	const x1 = c;
	const y1 = c;
	const rec1 = new RoundedRectangle(w1, h1, x1, y1, raio);

	const w2 = w1 - 2 * bitola;
	const h2 = h1 - 2 * bitola;
	const x2 = x1 + bitola;
	const y2 = y1 + bitola;
	const rec2 = new RoundedRectangle(w2, h2, x2, y2, raio - bitola);

	return [rec1, rec2];
}

function obtemDesenhoDasArmaduras(secao: Secao, armaduras: Armaduras): Circle[] {
	if (secao.geometria.tipo === 'poligono') {
		return [];
	}

	const dLinha = calculaDLinha(secao, armaduras);
	let armadurasInferiores: Circle[] = [];
	let armadurasSuperiores: Circle[] = [];
	const offset = (armaduras.estribo?.bitola ?? 0) / (2 * 10);
	const larguraUtil = secao.geometria.largura - 2 * dLinha - 2 * offset;

	if (armaduras.inferior?.bitola && armaduras.inferior?.quantidade) {
		const raio = armaduras.inferior.bitola / (2 * 10); // Converte raio para cm

		if (armaduras.inferior.quantidade === 1) {
			const x = secao.geometria.largura / 2;
			const y = dLinha + 0.1;
			armadurasInferiores = [new Circle(raio, x, y)];
		} else {
			const x = dLinha + offset;
			const y = dLinha + 0.1;
			const quantidade = armaduras.inferior.quantidade;
			const espacamento = larguraUtil / (quantidade - 1);
			armadurasInferiores = desenhaCirculosEspacados(x, y, raio, quantidade, espacamento);
		}
	}

	if (armaduras.superior?.bitola && armaduras.superior?.quantidade) {
		const raio = armaduras.superior.bitola / (2 * 10); // Converte raio para cm

		if (armaduras.superior.quantidade === 1) {
			const x = secao.geometria.largura / 2;
			const y = secao.geometria.altura - dLinha - 0.1;
			armadurasSuperiores = [new Circle(raio, x, y)];
		} else {
			const x = dLinha + offset;
			const y = secao.geometria.altura - dLinha - 0.1;
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
