import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/errors";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(new AppError("Authentication required", 401));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, role: true, email: true, isActive: true } });
    if (!user?.isActive) throw new AppError("User is inactive", 403);
    req.user = { id: user.id, role: user.role, email: user.email };
    return next();
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError("Invalid or expired token", 401));
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(req.user.role)) return next(new AppError("Insufficient permissions", 403));
    next();
  };
