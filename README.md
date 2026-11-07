# E-commerce SOLID (Projeto 2)

API de e-commerce do Projeto 1 (SRP, OCP e LSP), agora com InversifyJS 7. O container monta as dependências. Services e controller não dão `new` em infraestrutura.

## Como rodar

Use Node.js 20 ou mais novo.

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

A API sobe em `http://localhost:3000`. O `.env.example` já traz `APP_ENV=dev`.

### Modo dev e modo test

Só o `APP_ENV` muda o modo. A escolha das classes fica em `src/container/container.ts`.

| | `APP_ENV=dev` | `APP_ENV=test` |
|---|---|---|
| E-mail | `EtherealMailProvider` (conta de teste do Ethereal, precisa de internet) | `ConsoleMailProvider` (imprime o e-mail no terminal) |
| Pedidos | `PrismaOrderRepository` (SQLite) | `InMemoryOrderRepository` (array em memória) |

Os produtos ficam no SQLite nos dois modos. Rode o `migrate` e o `seed` antes.

No modo dev, a resposta traz `emailPreview` com o link da mensagem no Ethereal. O envio é simulado: a mensagem fica na caixa de teste, não vai para uma pessoa. No modo test, o e-mail aparece no terminal, `emailPreview` volta `null` e a API funciona sem internet.

Para o modo test, reinicie com `APP_ENV=test npm run dev`.

### Exemplo

```bash
curl -X POST http://localhost:3000/orders \
-H "Content-Type: application/json" \
-d '{
  "customer": "cliente@ethereal.email",
  "items": [{ "productId": 1, "quantity": 1 }],
  "paymentMethod": "credit_card",
  "paymentDetails": { "cardNumber": "1234567812345678", "cvv": "123" }
}'
```

- Produto `1`: livro físico, R$ 100 mais R$ 10 de frete. Total R$ 110.
- Produto `2`: e-book, R$ 50, sem frete.
- Pagamentos simulados: `credit_card`, `debit_card` e `pix`.
- A quantidade de cada item precisa ser um inteiro maior ou igual a 1.

## Estrutura

```
src/
├── domain/        # produtos, pedido e erros de negócio
├── repositories/  # interfaces, Prisma e InMemoryOrderRepository
├── providers/     # IMailProvider, EtherealMailProvider e ConsoleMailProvider
├── payments/      # IPaymentMethod, uma classe por pagamento e o registro
├── services/      # OrderService e NotificationService
├── controllers/   # OrderController: só HTTP
├── container/     # types.ts (Symbols) e container.ts (binds por APP_ENV)
├── app.ts         # pede o OrderController ao container e registra a rota
└── server.ts      # carrega reflect-metadata e dotenv e sobe o servidor
```

`src/container/container.ts` é o único arquivo que importa as classes concretas de repositório, e-mail, pagamento, service e controller. O `app.ts` só pede o `OrderController` ao container.
