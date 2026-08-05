# Sistema de Gestão Financeira Pessoal (SaaS-ready)

Monorepo completo com landing page, front-end, back-end e banco de dados relacional, pensado para ser multi-tenant desde o início.

## Estrutura

- `/frontend` — Next.js 14 + TailwindCSS + Recharts
- `/backend` — Node.js + Express + Prisma + PostgreSQL
- `/docker-compose.yml` — orquestração completa

## Stack

- React + Next.js (App Router)
- TailwindCSS + Recharts
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT + bcrypt
- Docker + docker-compose

## Variáveis de ambiente

Copie os exemplos e ajuste conforme o ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=development
```

**`frontend/.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Rodar com Docker (recomendado)

```bash
docker-compose up --build
```

Acesse:

- Landing page: http://localhost:3000
- API: http://localhost:4000/api
- Swagger: http://localhost:4000/api-docs

## Rodar localmente (modo desenvolvimento)

### 1. Banco de dados

Inicie o PostgreSQL localmente ou via Docker:

```bash
docker run --name finance-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=finance -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse http://localhost:3000.

## Dados de exemplo

O seed cria um usuário demo:

- **Email:** `demo@example.com`
- **Senha:** `123456`

Com receitas, despesas, cartão, mensalidade e bankroll de apostas preenchidos.

## Funcionalidades

- Cadastro e login com JWT
- Dashboard mensal com saldo e gráfico por categoria
- Módulos: Receitas, Despesas, Cartão de Crédito, Faculdade/Mensalidades, Metas e Apostas
- Controle de bankroll com meta diária, gráfico de evolução e ROI
- Ativação/desativação de módulos por usuário
- API REST documentada via Swagger
- Dados isolados por `user_id`

## Migrations

As migrations do Prisma ficam em `backend/prisma/migrations`. Para criar uma nova:

```bash
cd backend
npx prisma migrate dev --name nome_da_mudanca
```
