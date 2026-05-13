import { z } from "zod";

export const idParam = z.object({ params: z.object({ id: z.string().uuid() }) });
export const productIdParam = z.object({ params: z.object({ productId: z.string().uuid() }) });

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).optional(),
});

export const addressFields = {
  fullName: z.string().min(2),
  phone: z.string().min(7).max(20),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4).max(12),
  landmark: z.string().optional(),
};

export const upiIdSchema = z.string().regex(/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID");
