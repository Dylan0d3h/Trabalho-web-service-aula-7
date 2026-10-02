import express, { type NextFunction, type Request, type Response } from "express";
import { AppError } from "./app-error.js";
import { criarPedido } from "./pedidos.service.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());


app.post("/pedidos", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { produtoId, quantidade } = req.body ?? {};

    if (!Number.isInteger(produtoId) || !Number.isInteger(quantidade) || quantidade <= 0) {
      throw new AppError("Informe produtoId e quantidade (inteiros, quantidade > 0)", 400);
    }

    const pedido = await criarPedido(produtoId, quantidade);
    return res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({ mensagem: error.mensagem });
  }
  if ((error as { type?: string })?.type === "entity.parse.failed") {
    return res.status(400).json({ mensagem: "JSON inválido no corpo da requisição" });
  }
  console.error(error);
  return res.status(500).json({ mensagem: "Erro interno no serviço de Pedidos" });
});

app.listen(PORT, () => {
  console.log(`Pedidos rodando em http://localhost:${PORT}`);
});
