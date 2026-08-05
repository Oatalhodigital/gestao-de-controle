import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const incomeSchema = z.object({
  categoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  recurring: z.boolean().default(false),
});

const updateIncomeSchema = incomeSchema.partial();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const { month } = req.query;
  const where: any = { userId: req.userId };
  if (month) {
    const [year, mon] = (month as string).split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);
    where.date = { gte: start, lte: end };
  }
  const list = await prisma.income.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(list);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = incomeSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const income = await prisma.income.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(income);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = updateIncomeSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const income = await prisma.income.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: parse.data,
  });
  res.json(income);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.income.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
