// @ts-nocheck
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema, refreshSchema, registerSchema } from "../schemas/auth";
import { ok, safeUserSelect } from "../utils/api";
import { AppError, asyncHandler } from "../utils/errors";

export const authRouter = Router();

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const signAccessToken = (user: { id: string; role: string; email: string }) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });

const signRefreshToken = (user: { id: string; role: string; email: string }) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const tokenExpiry = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const issueTokens = async (user: { id: string; role: string; email: string }) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: tokenExpiry() },
  });
  return { accessToken, refreshToken };
};

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        passwordHash,
        cart: { create: {} },
      },
      select: safeUserSelect,
    });
    const tokens = await issueTokens(user);
    ok(res, { user, ...tokens }, "Registered successfully", 201);
  }),
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
    if (!user || !user.isActive) throw new AppError("Invalid credentials", 401);
    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid credentials", 401);
    const safeUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: safeUserSelect });
    const tokens = await issueTokens(safeUser);
    ok(res, { user: safeUser, ...tokens }, "Logged in successfully");
  }),
);

authRouter.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const payload = jwt.verify(req.body.refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    const saved = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(req.body.refreshToken) }, include: { user: true } });
    if (!saved || saved.revokedAt || saved.expiresAt < new Date() || saved.userId !== payload.sub) {
      throw new AppError("Invalid refresh token", 401);
    }
    await prisma.refreshToken.update({ where: { id: saved.id }, data: { revokedAt: new Date() } });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: saved.userId }, select: safeUserSelect });
    const tokens = await issueTokens(user);
    ok(res, tokens, "Token refreshed");
  }),
);

authRouter.post(
  "/logout",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(req.body.refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    ok(res, null, "Logged out successfully");
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, select: safeUserSelect });
    ok(res, user);
  }),
);
