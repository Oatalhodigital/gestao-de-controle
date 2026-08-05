import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const goalSchema = z.object({
  module: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  period: z.enum(["daily", "weekly", "monthly"]),
  startDate: z.coerce.date().optional(),
  active: z.boolean().default(true),
});

const updateGoalSchema = goalSchema.partial();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const list = await prisma.goal.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = goalSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const goal = await prisma.goal.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(goal);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = updateGoalSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const goal = await prisma.goal.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: parse.data,
  });
  res.json(goal);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.goal.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
