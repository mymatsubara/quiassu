import { calculaDLinha, descricaoCamadaArmadura, type Armaduras } from '$lib/calculations/armadura';
import type { Secao } from '$lib/calculations/nbr6118-elu';
import {
	Circle,
	Measurement,
	Polygon,
	Rectangle,
	TextLabel,
	getBoundingBoxDimensions,
	joinPaths,
	mergeBoundingBoxes,
	mergePathsBoundingBoxes,
	type CustomPath,
	type Drawing
} from '$lib/geometry/drawing';
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

export function obtemDesenhoDaSecaoComArmaduras(secao: Secao, armaduras: Armaduras): Drawing {
	const secaoPath = obtemDesenhoDaSecao(secao.geometria);
	const estriboPath = obtemEstribos(secao, armaduras);
	const armadurasPath = obtemDesenhoDasArmaduras(secao, armaduras);

	const boundingBoxSemMedidas = mergePathsBoundingBoxes(secaoPath, estriboPath, armadurasPath);

	const { width, height } = getBoundingBoxDimensions(boundingBoxSemMedidas);
	const scale = Math.max(width, height) / 100;
	const medidas = obtemMedidas(secao, armaduras, scale);

	const boundingBox = mergeBoundingBoxes(
		boundingBoxSemMedidas,
		medidas.map((medida) => medida.getBoundingBox())
	);

	return {
		draw: (ctx) => {
			const secao = secaoPath.getPath();
			ctx.stroke(secao);

			for (const medida of medidas) {
				medida.draw(ctx);
			}

			if (estriboPath) {
				const estribo = joinPaths(estriboPath);
				ctx.stroke(estribo);
			}

			const armaduras = joinPaths(armadurasPath);
			ctx.fill(armaduras);
		},
		getBoundingBox: () => boundingBox
	};
}

function obtemEstribos(secao: Secao, armaduras: Armaduras): Rectangle[] {
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
	const rec1 = new Rectangle(w1, h1, x1, y1, raio);

	const w2 = w1 - 2 * bitola;
	const h2 = h1 - 2 * bitola;
	const x2 = x1 + bitola;
	const y2 = y1 + bitola;
	const rec2 = new Rectangle(w2, h2, x2, y2, raio - bitola);

	return [rec1, rec2];
}

function obtemDesenhoDasArmaduras(secao: Secao, armaduras: Armaduras): Circle[] {
	if (secao.geometria.tipo === 'poligono') {
		return [];
	}

	const altura = secao.geometria.altura;
	const largura = secao.geometria.largura;
	let armadurasInferiores: Circle[] = [];
	let armadurasSuperiores: Circle[] = [];
	const offset = (armaduras.estribo?.bitola ?? 0) / (2 * 10);
	const cobrimento = secao.cobrimento;
	const bitolaEstribo = armaduras.estribo?.bitola ?? 0;

	if (armaduras.inferior?.camadas?.length) {
		const armadura = armaduras.inferior;
		const primeiroDLinha =
			cobrimento + (bitolaEstribo + (armadura.camadas[0].bitola ?? 0) / 2) / 10;

		for (const [i, camada] of armaduras.inferior.camadas.entries()) {
			if (!camada.bitola || !camada.quantidade) {
				continue;
			}

			const dLinhaHorizontal = cobrimento + (bitolaEstribo + camada.bitola / 2) / 10;
			const larguraUtil = largura - 2 * dLinhaHorizontal - 2 * offset;

			const raio = camada.bitola / (2 * 10); // Converte raio para cm
			const y = primeiroDLinha + i * armadura.espacamento;

			if (camada.quantidade === 1) {
				const x = secao.geometria.largura / 2;
				armadurasInferiores = [...armadurasInferiores, new Circle(raio, x, y)];
			} else {
				const x = dLinhaHorizontal + offset;
				const quantidade = camada.quantidade;
				const espacamento = larguraUtil / (quantidade - 1);
				armadurasInferiores = [
					...armadurasInferiores,
					...desenhaCirculosEspacados(x, y, raio, quantidade, espacamento)
				];
			}
		}
	}

	if (armaduras.superior?.camadas?.length) {
		const armadura = armaduras.superior;
		const primeiroDLinha =
			cobrimento + (bitolaEstribo + (armadura.camadas[0]?.bitola ?? 0) / 2) / 10;

		for (const [i, camada] of armaduras.superior.camadas.entries()) {
			if (!camada.bitola || !camada.quantidade) {
				continue;
			}

			const dLinhaHorizontal = cobrimento + (bitolaEstribo + camada.bitola / 2) / 10;
			const larguraUtil = secao.geometria.largura - 2 * dLinhaHorizontal - 2 * offset;

			const raio = camada.bitola / (2 * 10); // Converte raio para cm
			const y = altura - primeiroDLinha - i * armadura.espacamento;

			if (camada.quantidade === 1) {
				const x = secao.geometria.largura / 2;
				armadurasSuperiores = [...armadurasSuperiores, new Circle(raio, x, y)];
			} else {
				const x = dLinhaHorizontal + offset;
				const quantidade = camada.quantidade;
				const espacamento = larguraUtil / (quantidade - 1);
				armadurasSuperiores = [
					...armadurasSuperiores,
					...desenhaCirculosEspacados(x, y, raio, quantidade, espacamento)
				];
			}
		}
	}

	return [...armadurasInferiores, ...armadurasSuperiores];
}

function obtemMedidas(secao: Secao, armaduras: Armaduras, scale: number): Drawing[] {
	if (secao.geometria.tipo !== 'retangulo') {
		return [];
	}
	const altura = secao.geometria.altura;
	const largura = secao.geometria.largura;
	const cobrimento = secao.cobrimento;
	const bitolaEstribo = armaduras.estribo?.bitola ?? 0;
	const scaleArmadura = 0.75 * scale;
	const scaleCamadas = 0.35 * scale;

	const primeiraCamadaInferior = armaduras.inferior?.camadas?.[0];
	const possuiArmaduraInferior =
		primeiraCamadaInferior?.quantidade && primeiraCamadaInferior?.bitola;
	const b = new Measurement(new Vec2(0, altura), new Vec2(largura, altura), 'b = ', scale);
	const h = new Measurement(
		new Vec2(largura, altura),
		new Vec2(largura, 0),
		'h = ',
		scale,
		possuiArmaduraInferior ? 2 : 1
	);

	const resultados: Drawing[] = [b, h];

	// Detalha armadura inferior
	const dLinha = calculaDLinha(secao.cobrimento, armaduras).inferior;
	if (possuiArmaduraInferior) {
		resultados.push(
			new Measurement(new Vec2(largura, altura), new Vec2(largura, dLinha), 'd = ', scale)
		);

		const camadas = armaduras.inferior?.camadas ?? [];
		const primeiroDLinha = cobrimento + (bitolaEstribo + (camadas[0]?.bitola ?? 0) / 2) / 10;
		const espacamento = armaduras.inferior?.espacamento ?? 0;

		for (const [i, camada] of camadas.entries()) {
			if (!camada.bitola || !camada.quantidade) {
				continue;
			}

			const x = cobrimento + (bitolaEstribo + camada.bitola / 2) / 10;
			const y = primeiroDLinha + i * espacamento;
			const descricao = descricaoCamadaArmadura(camada);
			resultados.push(
				new TextLabel(descricao, new Vec2(-15 * scaleArmadura, y), scaleArmadura, new Vec2(x, y))
			);

			// Distancia entre as camadas
			if (i > 0) {
				const mx = cobrimento / 2;
				resultados.push(
					new Measurement(
						new Vec2(mx, y - espacamento),
						new Vec2(mx, y),
						'',
						4 * (espacamento / altura) * scale,
						0
					)
				);
			}
		}
	}

	// Detalha armadura superior
	if (armaduras.superior?.camadas?.length) {
		const camadas = armaduras.superior.camadas;
		const primeiroDLinha = cobrimento + (bitolaEstribo + (camadas[0]?.bitola ?? 0) / 2) / 10;
		const espacamento = armaduras.superior?.espacamento ?? 0;

		for (const [i, camada] of camadas.entries()) {
			if (!camada.bitola || !camada.quantidade) {
				continue;
			}

			const x = cobrimento + (bitolaEstribo + camada.bitola / 2) / 10;
			const y = altura - primeiroDLinha - i * espacamento;
			const descricao = descricaoCamadaArmadura(camada);
			resultados.push(
				new TextLabel(descricao, new Vec2(-15 * scaleArmadura, y), scaleArmadura, new Vec2(x, y))
			);

			// Distancia entre as camadas
			if (i > 0) {
				const mx = cobrimento / 2;
				resultados.push(
					new Measurement(
						new Vec2(mx, y),
						new Vec2(mx, y + espacamento),
						'',
						4 * (espacamento / altura) * scale,
						0
					)
				);
			}
		}
	}

	return resultados;
}

function desenhaCirculosEspacados(
	x: number,
	y: number,
	raio: number,
	quantidade: number,
	espacamento: number
): Circle[] {
	return new Array(quantidade).fill(0).map((_, i) => new Circle(raio, x + i * espacamento, y));
}

function obtemDesenhoDaSecao(secao: GeometriaSecao): CustomPath {
	switch (secao.tipo) {
		case 'poligono':
			return new Polygon(secao.pontos);
		case 'retangulo':
			return new Rectangle(secao.largura, secao.altura);
	}
}
