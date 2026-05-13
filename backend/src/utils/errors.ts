import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { fail } from "./api";

export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public errors: unknown[] = [],
  ) {
    super(message);
  }
}

export const notFound = (_req: Request, res: Response) => fail(res, "Route not found", 404);

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) return fail(res, error.message, error.status, error.errors);
  if (error instanceof ZodError) return fail(res, "Validation failed", 422, error.issues);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return fail(res, "A record with this unique value already exists", 409);
    if (error.code === "P2025") return fail(res, "Record not found", 404);
  }
  const message = env.NODE_ENV === "production" ? "Internal server error" : error instanceof Error ? error.message : "Internal server error";
  return fail(res, message, 500);
};

export const asyncHandler =
  <T extends (...args: [Request, Response, NextFunction]) => Promise<unknown>>(handler: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(handler(req, res, next)).catch(next);
