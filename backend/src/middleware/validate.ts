import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        ...req.body,
        params: req.params,
        query: req.query,
      }) as Record<string, unknown>;

      const { params: _params, query: _query, ...body } = parsed;
      req.body = body;
      next();
    } catch (error) {
      next(error);
    }
  };
