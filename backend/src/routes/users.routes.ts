import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParam } from "../schemas/common";
import { ok, paginated, safeUserSelect, toPagination } from "../utils/api";
import { asyncHandler } from "../utils/errors";

export const adminUsersRouter = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).max(20).nullable().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

adminUsersRouter.use(requireAuth, requireRole(Role.ADMIN));

adminUsersRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = toPagination(req.query as Record<string, unknown>);
    const [users, total] = await Promise.all([
      prisma.user.findMany({ select: safeUserSelect, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.user.count(),
    ]);
    paginated(res, users, { page, limit, total });
  }),
);

adminUsersRouter.get("/users/delivery-partners", asyncHandler(async (_req, res) => {
  const partners = await prisma.user.findMany({ where: { role: Role.DELIVERY_PARTNER, isActive: true }, select: safeUserSelect, orderBy: { name: "asc" as const } });
  ok(res, partners);
}));

adminUsersRouter.get("/users/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.user.findUniqueOrThrow({ where: { id: req.params.id as string }, select: safeUserSelect }))));
adminUsersRouter.patch("/users/:id", validate(idParam.merge(updateUserSchema)), asyncHandler(async (req, res) => ok(res, await prisma.user.update({ where: { id: req.params.id as string }, data: req.body, select: safeUserSelect }), "User updated")));

adminUsersRouter.get("/delivery-partners", asyncHandler(async (_req, res) => {
  const partners = await prisma.user.findMany({ where: { role: Role.DELIVERY_PARTNER, isActive: true }, select: safeUserSelect, orderBy: { name: "asc" as const } });
  ok(res, partners);
}));
