import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash,
      plan: "pro",
    },
  });

  await prisma.category.deleteMany({ where: { userId: user.id } });
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.creditCard.deleteMany({ where: { userId: user.id } });
  await prisma.tuitionPayment.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.bettingBankroll.deleteMany({ where: { userId: user.id } });
  await prisma.userModule.deleteMany({ where: { userId: user.id } });
  await prisma.module.deleteMany({});

  const modules = [
    { key: "income", name: "Receitas", description: "Controle de receitas" },
    { key: "expenses", name: "Despesas", description: "Controle de despesas" },
    { key: "credit_card", name: "Cartão de Crédito", description: "Faturas e parcelas" },
    { key: "tuition", name: "Faculdade/Mensalidades", description: "Mensalidades recorrentes" },
    { key: "betting", name: "Apostas", description: "Controle de bankroll" },
    { key: "goals", name: "Metas", description: "Metas financeiras" },
  ];
  for (const m of modules) {
    await prisma.module.create({ data: m });
  }

  const incomeCategories = ["Salário", "Freela", "Renda Extra"];
  const expenseCategories = ["Aluguel", "Mercado", "Transporte", "Lazer", "Saúde"];

  for (const name of incomeCategories) {
    await prisma.category.create({
      data: { userId: user.id, name, type: "income", color: "#22c55e" },
    });
  }
  for (const name of expenseCategories) {
    await prisma.category.create({
      data: { userId: user.id, name, type: "expense", color: "#ef4444" },
    });
  }

  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const incomeCat = categories.find((c) => c.type === "income");
  const expenseCat = categories.find((c) => c.type === "expense");

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  await prisma.income.create({
    data: {
      userId: user.id,
      categoryId: incomeCat?.id,
      description: "Salário mensal",
      amount: 5000,
      date: monthStart,
      recurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      userId: user.id,
      categoryId: expenseCat?.id,
      description: "Aluguel",
      amount: 1200,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 10),
      paid: true,
      paymentMethod: "pix",
      recurring: true,
    },
  });

  await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: "Nubank",
      limitAmount: 5000,
      closingDay: 5,
      dueDay: 12,
      transactions: {
        create: {
          description: "Compra online",
          amount: 250,
          installments: 5,
          date: today,
        },
      },
    },
  });

  await prisma.tuitionPayment.create({
    data: {
      userId: user.id,
      institution: "Universidade Exemplo",
      amount: 800,
      dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
      paid: false,
    },
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      module: "expenses_limit",
      targetAmount: 2500,
      period: "monthly",
      startDate: monthStart,
      active: true,
    },
  });

  const bankroll = await prisma.bettingBankroll.create({
    data: {
      userId: user.id,
      initialCapital: 50,
      currentBalance: 50,
      dailyGoal: 50,
    },
  });

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const stake = 20;
    const result = i % 3 === 0 ? 0 : stake * 2;
    const profit = result - stake;
    await prisma.bettingEntry.create({
      data: {
        bankrollId: bankroll.id,
        date: d,
        stakeAmount: stake,
        resultAmount: result,
        profit,
      },
    });
  }

  const entries = await prisma.bettingEntry.findMany({
    where: { bankrollId: bankroll.id },
  });
  const totalProfit = entries.reduce((sum, e) => sum + Number(e.profit), 0);

  await prisma.bettingBankroll.update({
    where: { id: bankroll.id },
    data: {
      currentBalance: 50 + totalProfit,
    },
  });

  console.log("Seed completed for demo@example.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
