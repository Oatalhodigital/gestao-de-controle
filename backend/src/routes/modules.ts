import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const modules = await prisma.module.findMany({
    include: {
      userModules: { where: { userId: req.userId } },
    },
  });
  res.json(
    modules.map((m) => ({
      ...m,
      active: m.userModules.length ? m.userModules[0].active : true,
    }))
  );
});

const toggleSchema = z.object({
  active: z.boolean(),
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parse = toggleSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.errors });
    return;
  }
  const moduleId = req.params.id;
  const existing = await prisma.userModule.findFirst({
    where: { userId: req.userId, moduleId },
  });
  if (existing) {
    await prisma.userModule.update({
      where: { id: existing.id },
      data: { active: parse.data.active },
    });
  } else {
    await prisma.userModule.create({
      data: { userId: req.userId!, moduleId, active: parse.data.active },
    });
  }
  res.json({ ok: true });
});

export default router;
