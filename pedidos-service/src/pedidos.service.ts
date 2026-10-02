import { AppError } from "./app-error.js";
import * as catalogoClient from "./catalogo.client.js";

export type Pedido = {
  id: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  status: "criado";
};

const pedidos: Pedido[] = [];
let proximoId = 1;

export async function criarPedido(produtoId: number, quantidade: number): Promise<Pedido> {
  const produto = await catalogoClient.buscarProduto(produtoId);

  if (produto.estoqueDisponivel < quantidade) {
    throw new AppError("Estoque insuficiente", 409);
  }

  const total = produto.precoUnitario * quantidade;

  const pedido: Pedido = {
    id: proximoId++,
    produtoId,
    nomeProduto: produto.nomeProduto,
    quantidade,
    precoUnitario: produto.precoUnitario,
    total,
    status: "criado"
  };

  pedidos.push(pedido);
  return pedido;
}
