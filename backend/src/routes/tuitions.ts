import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const tuitionSchema = z.object({
  institution: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
  paid: z.boolean().default(false),
});

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const list = await prisma.tuitionPayment.findMany({
    where: { userId: req.userId },
    orderBy: { dueDate: "asc" },
  });
  res.json(list);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = tuitionSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const tuition = await prisma.tuitionPayment.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(tuition);
});

router.put("/:id/pay", async (req: AuthRequest, res) => {
  await prisma.tuitionPayment.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { paid: true },
  });
  res.json({ ok: true });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.tuitionPayment.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
