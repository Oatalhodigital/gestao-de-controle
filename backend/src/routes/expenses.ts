import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const expenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date().optional(),
  paid: z.boolean().default(false),
  paymentMethod: z.enum(["pix", "dinheiro", "cartao"]).optional(),
  recurring: z.boolean().default(false),
});

const updateExpenseSchema = expenseSchema.partial();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const { month } = req.query;
  const where: any = { userId: req.userId };
  if (month) {
    const [year, mon] = (month as string).split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);
    where.dueDate = { gte: start, lte: end };
  }
  const list = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { dueDate: "desc" },
  });
  res.json(list);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = expenseSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const expense = await prisma.expense.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(expense);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = updateExpenseSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const expense = await prisma.expense.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: parse.data,
  });
  res.json(expense);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.expense.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
