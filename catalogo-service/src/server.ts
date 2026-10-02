import express from "express";
import { buscarPorId } from "./produtos.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get("/produtos/:id", (req, res) => {
  const id = Number(req.params.id);
  const produto = buscarPorId(id);

  if (!produto) {
    return res.status(404).json({ mensagem: "Produto não encontrado" });
  }

  return res.status(200).json(produto);
});

app.listen(PORT, () => {
  console.log(`Catálogo rodando em http://localhost:${PORT}`);
});
