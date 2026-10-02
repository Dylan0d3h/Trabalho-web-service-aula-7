# Aula 07 – Microsserviços: Catálogo + Pedidos

Dois serviços independentes que se comunicam por HTTP (REST):

| Serviço  | Porta | Responsabilidade                         | Endpoint            |
|----------|-------|------------------------------------------|---------------------|
| Catálogo | 3001  | Dono dos dados de produtos               | `GET /produtos/:id` |
| Pedidos  | 3000  | Cria pedidos consultando o Catálogo      | `POST /pedidos`     |

```
web-services-aula07/
├── catalogo-service/
│   ├── src/
│   │   ├── server.ts
│   │   └── produtos.ts
│   ├── package.json
│   └── .env.example
└── pedidos-service/
    ├── src/
    │   ├── server.ts
    │   ├── pedidos.service.ts
    │   ├── catalogo.client.ts
    │   └── app-error.ts
    ├── package.json
    └── .env.example
```

## Requisitos

- Node.js **20.6 ou superior** (usamos `--env-file`, nativo do Node)
- VS Code com a extensão **Thunder Client** (para os testes)

## Como instalar

Em um terminal, para **cada** serviço:

```bash
cd catalogo-service
npm install
cp .env.example .env      # no Windows (PowerShell): copy .env.example .env
```

```bash
cd pedidos-service
npm install
cp .env.example .env
```

## Como executar

Abra **dois terminais** (um para cada serviço):

```bash
# Terminal 1
cd catalogo-service
npm run dev        # -> Catálogo rodando em http://localhost:3001
```

```bash
# Terminal 2
cd pedidos-service
npm run dev        # -> Pedidos rodando em http://localhost:3000
```

## Variáveis de ambiente

**catalogo-service/.env**

| Variável | Padrão | Descrição          |
|----------|--------|--------------------|
| PORT     | 3001   | Porta do Catálogo  |

**pedidos-service/.env**

| Variável            | Padrão                  | Descrição                                  |
|---------------------|-------------------------|--------------------------------------------|
| PORT                | 3000                    | Porta de Pedidos                           |
| CATALOGO_URL        | http://localhost:3001   | Endereço do serviço de Catálogo            |
| CATALOGO_TIMEOUT_MS | 2000                    | Tempo máximo de espera pelo Catálogo (ms)  |

## Contrato

### Catálogo – `GET /produtos/:id`

- `200 OK` → `{ "id": 1, "nome": "Teclado", "preco": 150, "estoque": 4 }`
- `404 Not Found` → `{ "mensagem": "Produto não encontrado" }`

### Pedidos – `POST /pedidos`

Body: `{ "produtoId": 1, "quantidade": 2 }`

| Status | Quando                                   | Resposta                                          |
|--------|------------------------------------------|---------------------------------------------------|
| 201    | Pedido criado                            | `{ id, produtoId, nomeProduto, quantidade, precoUnitario, total, status }` |
| 400    | Body inválido                            | `{ "mensagem": "..." }`                           |
| 404    | Produto não existe no Catálogo           | `{ "mensagem": "Produto inexistente" }`           |
| 409    | Quantidade maior que o estoque           | `{ "mensagem": "Estoque insuficiente" }`          |
| 502    | Catálogo fora do ar / resposta inválida  | `{ "mensagem": "Catálogo temporariamente indisponível" }` |
| 504    | Catálogo não respondeu dentro do timeout | `{ "mensagem": "Tempo limite ao consultar o Catálogo" }`  |

## Testes (Thunder Client)

| # | Caso                 | Requisição                                                   | Esperado |
|---|----------------------|--------------------------------------------------------------|----------|
| 1 | Consultar produto    | `GET http://localhost:3001/produtos/1`                       | 200      |
| 2 | Produto não existe   | `GET http://localhost:3001/produtos/999`                     | 404      |
| 3 | Criar pedido         | `POST http://localhost:3000/pedidos` `{"produtoId":1,"quantidade":2}`  | 201, total 300 |
| 4 | Sem estoque          | `POST .../pedidos` `{"produtoId":1,"quantidade":99}`         | 409      |
| 5 | Produto inexistente  | `POST .../pedidos` `{"produtoId":999,"quantidade":1}`        | 404      |
| 6 | Catálogo parado      | Pare o Catálogo (Ctrl+C) e repita o teste 3                  | 502      |

As capturas de tela dos testes estão na pasta [`evidencias/`](./evidencias).
