import { Router } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { prisma } from "../config";

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Dados do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      modules: { include: { module: true } },
    },
  });
  res.json(user);
});

export default router;
