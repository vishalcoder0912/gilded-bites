import type { Response } from "express";

export const ok = <T>(res: Response, data: T, message = "Action completed successfully", status = 200) =>
  res.status(status).json({ success: true, message, data });

export const paginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message = "Action completed successfully",
) =>
  res.json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });

export const fail = (res: Response, message: string, status = 400, errors: unknown[] = []) =>
  res.status(status).json({ success: false, message, errors });

export const toPagination = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;
