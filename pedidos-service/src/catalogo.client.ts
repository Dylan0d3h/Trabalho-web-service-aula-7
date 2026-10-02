import { AppError } from "./app-error.js";

const CATALOGO_URL = process.env.CATALOGO_URL ?? "http://localhost:3001";
const CATALOGO_TIMEOUT_MS = Number(process.env.CATALOGO_TIMEOUT_MS ?? 2000);

export type ProdutoRemoto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
};

export type ProdutoResumo = {
  produtoId: number;
  nomeProduto: string;
  precoUnitario: number;
  estoqueDisponivel: number;
};

function resumoProduto(produto: ProdutoRemoto): ProdutoResumo {
  return {
    produtoId: produto.id,
    nomeProduto: produto.nome,
    precoUnitario: produto.preco,
    estoqueDisponivel: produto.estoque
  };
}

function ehProdutoRemoto(dado: unknown): dado is ProdutoRemoto {
  const p = dado as ProdutoRemoto;
  return (
    typeof p === "object" && p !== null &&
    typeof p.id === "number" &&
    typeof p.nome === "string" &&
    typeof p.preco === "number" &&
    typeof p.estoque === "number"
  );
}

export async function buscarProduto(id: number): Promise<ProdutoResumo> {
  const url = `${CATALOGO_URL}/produtos/${id}`;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      signal: AbortSignal.timeout(CATALOGO_TIMEOUT_MS)
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AppError("Tempo limite ao consultar o Catálogo", 504);
    }
    throw new AppError("Catálogo temporariamente indisponível", 502);
  }

  if (resposta.status === 404) {
    throw new AppError("Produto inexistente", 404);
  }

  if (!resposta.ok) {
    throw new AppError("Falha ao consultar Catálogo", 502);
  }

  const dados: unknown = await resposta.json();
  if (!ehProdutoRemoto(dados)) {
    throw new AppError("Resposta inválida do Catálogo", 502);
  }

  return resumoProduto(dados);
}
