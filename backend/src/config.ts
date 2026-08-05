import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
