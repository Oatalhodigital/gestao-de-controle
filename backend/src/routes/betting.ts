import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const bankrollSchema = z.object({
  initialCapital: z.coerce.number().positive(),
  dailyGoal: z.coerce.number().positive(),
});

const entrySchema = z.object({
  date: z.coerce.date(),
  stakeAmount: z.coerce.number().nonnegative(),
  resultAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
});

router.use(authMiddleware);

router.get("/bankroll", async (req: AuthRequest, res) => {
  const bankroll = await prisma.bettingBankroll.findUnique({
    where: { userId: req.userId },
    include: { entries: true },
  });
  res.json(bankroll);
});

router.post("/bankroll", async (req: AuthRequest, res) => {
  const parse = bankrollSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const existing = await prisma.bettingBankroll.findUnique({
    where: { userId: req.userId },
  });
  if (existing) {
    res.status(400).json({ error: "Bankroll already exists" });
    return;
  }
  const bankroll = await prisma.bettingBankroll.create({
    data: { ...parse.data, userId: req.userId!, currentBalance: parse.data.initialCapital },
  });
  res.status(201).json(bankroll);
});

router.get("/dashboard", async (req: AuthRequest, res) => {
  const bankroll = await prisma.bettingBankroll.findUnique({
    where: { userId: req.userId },
    include: { entries: { orderBy: { date: "asc" } } },
  });

  if (!bankroll) {
    res.json(null);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayProfit = bankroll.entries
    .filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    })
    .reduce((sum, e) => sum + Number(e.profit), 0);

  const dailyGoal = Number(bankroll.dailyGoal);
  let status: string;
  let statusColor: string;
  if (todayProfit >= dailyGoal) {
    status = "acima ou na meta";
    statusColor = "green";
  } else if (todayProfit > 0) {
    status = "abaixo da meta";
    statusColor = "yellow";
  } else {
    status = "prejuízo";
    statusColor = "red";
  }

  const currentBalance = Number(bankroll.currentBalance);
  const initialCapital = Number(bankroll.initialCapital);

  const sortedEntries = bankroll.entries.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const history: { date: string; balance: number; target: number }[] = [];
  let running = initialCapital;
  const start = sortedEntries.length ? new Date(sortedEntries[0].date) : today;
  const days = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dayProfit = sortedEntries
      .filter((e) => {
        const ed = new Date(e.date);
        ed.setHours(0, 0, 0, 0);
        return ed.getTime() === d.getTime();
      })
      .reduce((sum, e) => sum + Number(e.profit), 0);
    running += dayProfit;
    const target = initialCapital + dailyGoal * (i + 1);
    history.push({ date: d.toISOString().split("T")[0], balance: Number(running.toFixed(2)), target: Number(target.toFixed(2)) });
  }

  const totalStaked = bankroll.entries.reduce((sum, e) => sum + Number(e.stakeAmount), 0);
  const totalProfit = bankroll.entries.reduce((sum, e) => sum + Number(e.profit), 0);
  const roi = totalStaked > 0 ? Number(((totalProfit / totalStaked) * 100).toFixed(2)) : 0;

  res.json({
    bankroll: { ...bankroll, currentBalance, dailyGoal: Number(dailyGoal), initialCapital: Number(initialCapital) },
    todayProfit: Number(todayProfit.toFixed(2)),
    status,
    statusColor,
    history,
    totalStaked: Number(totalStaked.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    roi,
  });
});

router.post("/entries", async (req: AuthRequest, res) => {
  const parse = entrySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }

  const bankroll = await prisma.bettingBankroll.findUnique({
    where: { userId: req.userId },
  });
  if (!bankroll) {
    res.status(400).json({ error: "Create a bankroll first" });
    return;
  }

  const { stakeAmount, resultAmount } = parse.data;
  const profit = resultAmount - stakeAmount;
  const entry = await prisma.bettingEntry.create({
    data: {
      ...parse.data,
      bankrollId: bankroll.id,
      profit,
    },
  });

  await prisma.bettingBankroll.update({
    where: { id: bankroll.id },
    data: { currentBalance: { increment: profit } },
  });

  res.status(201).json(entry);
});

router.delete("/entries/:id", async (req: AuthRequest, res) => {
  const bankroll = await prisma.bettingBankroll.findUnique({
    where: { userId: req.userId },
  });
  if (!bankroll) {
    res.status(404).json({ error: "Bankroll not found" });
    return;
  }
  const entry = await prisma.bettingEntry.findFirst({
    where: { id: req.params.id, bankrollId: bankroll.id },
  });
  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  await prisma.bettingBankroll.update({
    where: { id: bankroll.id },
    data: { currentBalance: { decrement: Number(entry.profit) } },
  });
  await prisma.bettingEntry.delete({ where: { id: entry.id } });
  res.status(204).send();
});

export default router;
