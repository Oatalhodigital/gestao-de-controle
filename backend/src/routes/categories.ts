import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  color: z.string().optional(),
});

const updateCategorySchema = categorySchema.partial();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const list = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  res.json(list);
});

router.post("/", async (req: AuthRequest, res) => {
  const parse = categorySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const category = await prisma.category.create({
    data: { ...parse.data, userId: req.userId! },
  });
  res.status(201).json(category);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = updateCategorySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const category = await prisma.category.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: parse.data,
  });
  res.json(category);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await prisma.category.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
