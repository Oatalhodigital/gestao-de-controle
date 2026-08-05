import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const cardSchema = z.object({
  name: z.string().min(1),
  limitAmount: z.coerce.number().positive().optional(),
  closingDay: z.coerce.number().min(1).max(31).optional(),
  dueDay: z.coerce.number().min(1).max(31).optional(),
});

const transactionSchema = z.object({
  cardId: z.string().uuid(),
  description: z.string().optional(),
  amount: z.coerce.number().positive(),
  installments: z.coerce.number().min(1).default(1),
  date: z.coerce.date(),
});

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const cards = await prisma.creditCard.findMany({
    where: { userId: req.userId },
    include: { transactions: true },
  });
  res.json(cards);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = cardSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const card = await prisma.creditCard.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(card);
});

router.post("/transactions", async (req: AuthRequest, res) => {
  const parse = transactionSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const card = await prisma.creditCard.findFirst({
    where: { id: parse.data.cardId, userId: req.userId },
  });
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }
  const tx = await prisma.creditCardTransaction.create({ data: parse.data });
  res.status(201).json(tx);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.creditCard.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
