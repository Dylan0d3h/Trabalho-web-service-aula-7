export type Produto = {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
};

export const produtos: Produto[] = [
  { id: 1, nome: "Teclado", preco: 150, estoque: 4 },
  { id: 2, nome: "Mouse", preco: 65, estoque: 10 }
];

export function buscarPorId(id: number): Produto | undefined {
  return produtos.find((p) => p.id === id);
}
