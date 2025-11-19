# Backend - controle-trabalho

## Instalação local

1. Instale dependências:
```bash
cd backend
npm install
```

2. Configure o arquivo `.env` (já contém DATABASE_URL se você forneceu).

3. Gere o cliente Prisma e aplique migrations:
```bash
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
```

4. Rode em desenvolvimento:
```bash
npm run dev
```

API rodando em http://localhost:3333
