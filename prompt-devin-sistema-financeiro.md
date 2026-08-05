# Prompt para o Devin — Sistema de Gestão Financeira Pessoal (SaaS-ready)

Copie e cole o conteúdo abaixo diretamente na sessão do Devin. Ele já está escrito na forma imperativa, como uma especificação de projeto.

---

## PROMPT

Você vai construir um **sistema completo de gestão financeira pessoal**, com landing page, front-end, back-end e banco de dados relacional, pensado desde o início para ser **multi-tenant** (ou seja, futuramente vendido como SaaS para múltiplos clientes, cada um com seus próprios dados isolados).

### 1. Visão geral do produto

O sistema deve permitir que o usuário controle, mês a mês:

- Receitas (salário, freelas, rendas extras)
- Despesas fixas e variáveis
- Faturas de cartão de crédito
- Mensalidades e pagamentos recorrentes (ex: faculdade)
- **Metas financeiras configuráveis por módulo**, incluindo um módulo específico de **controle de apostas (trading de risco/apostas esportivas)**, onde o usuário define:
  - Capital inicial (ex: R$ 50,00)
  - Meta de lucro diário (ex: R$ 50,00/dia)
  - Registro de cada aposta (valor apostado, resultado, lucro/prejuízo)
  - Comparativo automático: **acima da meta / na meta / abaixo da meta**, por dia, semana e mês

O sistema deve ser modular: cada "módulo" (Apostas, Cartão de Crédito, Faculdade, Gastos Fixos, etc.) pode ser ativado/desativado por usuário, simulando um produto configurável que futuramente pode virar planos de assinatura (free/pro).

### 2. Stack técnica recomendada

- **Front-end**: React + Next.js (App Router) + TailwindCSS + Recharts (gráficos)
- **Back-end**: Node.js + Express (ou NestJS, se preferir arquitetura mais robusta) com API REST
- **Banco de dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT + bcrypt para hash de senha (estrutura pronta para adicionar OAuth depois)
- **Infraestrutura de deploy**: Docker + docker-compose (para rodar API, front e banco juntos localmente)

Use essa stack como padrão, mas está liberado a ajustar caso identifique impedimento técnico — nesse caso, justifique a troca.

### 3. Estrutura do banco de dados (schema mínimo)

Crie as seguintes tabelas (ajuste tipos/constraints conforme a engine escolhida):

```sql
-- Usuários (multi-tenant desde o início)
users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- free, pro, business
  created_at TIMESTAMP DEFAULT now()
)

-- Categorias de receita/despesa
categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income','expense')),
  color TEXT
)

-- Receitas
incomes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT false
)

-- Despesas
expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE,
  paid BOOLEAN DEFAULT false,
  payment_method TEXT, -- pix, dinheiro, cartao
  recurring BOOLEAN DEFAULT false
)

-- Cartões de crédito
credit_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  limit_amount NUMERIC(12,2),
  closing_day INT,
  due_day INT
)

credit_card_transactions (
  id UUID PRIMARY KEY,
  card_id UUID REFERENCES credit_cards(id),
  description TEXT,
  amount NUMERIC(12,2),
  installments INT DEFAULT 1,
  date DATE
)

-- Faculdade / mensalidades recorrentes
tuition_payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  institution TEXT,
  amount NUMERIC(12,2),
  due_date DATE,
  paid BOOLEAN DEFAULT false
)

-- Módulo de metas gerais (genérico, reaproveitável por qualquer módulo)
goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  module TEXT, -- 'betting', 'savings', 'expenses_limit', etc
  target_amount NUMERIC(12,2),
  period TEXT CHECK (period IN ('daily','weekly','monthly')),
  start_date DATE,
  active BOOLEAN DEFAULT true
)

-- Módulo específico: controle de apostas
betting_bankroll (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  initial_capital NUMERIC(12,2) NOT NULL,
  current_balance NUMERIC(12,2) NOT NULL,
  daily_goal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
)

betting_entries (
  id UUID PRIMARY KEY,
  bankroll_id UUID REFERENCES betting_bankroll(id),
  date DATE NOT NULL,
  stake_amount NUMERIC(12,2) NOT NULL,     -- quanto apostou
  result_amount NUMERIC(12,2) NOT NULL,    -- retorno obtido (0 se perdeu)
  profit NUMERIC(12,2) GENERATED ALWAYS AS (result_amount - stake_amount) STORED,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
)
```

Crie índices em `user_id` e `date` nas tabelas de movimentação, já que serão as colunas mais consultadas nos dashboards.

### 4. Lógica de negócio do módulo de apostas (crítico — detalhar bem)

Este módulo deve calcular, para o usuário:

1. **Saldo atual** = capital inicial + soma de todos os `profit` de `betting_entries`
2. **Lucro do dia** = soma de `profit` de `betting_entries` onde `date = hoje`
3. **Status da meta diária**:
   - Se lucro do dia ≥ meta diária → status `"acima ou na meta"` (verde)
   - Se lucro do dia > 0 mas < meta diária → status `"abaixo da meta"` (amarelo)
   - Se lucro do dia ≤ 0 → status `"prejuízo"` (vermelho)
4. **Histórico**: gráfico de linha mostrando saldo acumulado dia a dia, com uma linha de referência mostrando "meta ideal" (capital inicial + meta diária × número de dias corridos), para visualizar se o usuário está performando acima ou abaixo da meta acumulada.
5. **Total apostado vs total lucrado** no período (semana/mês), com percentual de retorno sobre o valor apostado (ROI).

### 5. Páginas / telas obrigatórias

- **Landing page** pública (apresentação do produto, benefícios, CTA para cadastro/login) — pense nela como página de vendas do futuro SaaS
- **Login / Cadastro**
- **Dashboard geral**: resumo do mês (receitas x despesas x saldo), gráficos de pizza por categoria, alertas de contas a vencer
- **Tela de Cartão de Crédito**: fatura atual, parcelas futuras, limite disponível
- **Tela de Faculdade/Mensalidades**: próximos vencimentos, status pago/pendente
- **Tela de Apostas**: saldo atual, meta do dia, formulário de novo registro, gráfico de evolução, indicador visual de status (acima/na/abaixo da meta)
- **Configurações**: ativar/desativar módulos, editar metas

### 6. Requisitos não-funcionais

- API REST documentada (Swagger/OpenAPI)
- Autenticação obrigatória em todas as rotas exceto landing page e login/cadastro
- Isolamento de dados por `user_id` em toda query (preparar para multi-tenant real)
- Responsivo (mobile-first, já que o usuário provavelmente vai lançar dados pelo celular)
- Variáveis de ambiente para strings de conexão e segredos (nunca hardcoded)
- Seed script populando dados de exemplo para facilitar testes

### 7. Entregáveis esperados

1. Repositório com estrutura de monorepo (`/frontend`, `/backend`, `/database`)
2. Migrations do banco versionadas (Prisma Migrate ou equivalente)
3. `docker-compose.yml` funcional para subir tudo localmente com um comando
4. README com instruções de setup, variáveis de ambiente necessárias e como rodar seed
5. Dashboard funcional navegável de ponta a ponta com dados de exemplo

### 8. Observação final

Priorize entregar primeiro um **MVP funcional end-to-end** (cadastro de usuário → lançamento de receita/despesa → lançamento de aposta → visualização no dashboard) antes de refinar estilo visual ou adicionar módulos extras. Depois do MVP, evolua para os detalhes de UI, gráficos mais ricos e regras adicionais de negócio.

---
