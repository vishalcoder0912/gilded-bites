import { z } from "zod";
import { upiIdSchema } from "./common";

const imagePathSchema = z.string().refine(
  (value) => {
    if (value.startsWith("/")) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  },
  { message: "Image must be an absolute URL or a site path like /products/apple-1.png" },
);

export const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(3),
  shortDescription: z.string().optional(),
  price: z.coerce.number().int().positive(),
  mrp: z.coerce.number().int().positive().optional(),
  discountPercent: z.coerce.number().int().min(0).max(100).default(0),
  categoryId: z.string().uuid(),
  imageUrls: z.array(imagePathSchema).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const stockUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const stockAdjustSchema = z.object({
  quantity: z.coerce.number().int(),
  reason: z.string().min(2),
});

export const upiCreateSchema = z.object({
  upiId: upiIdSchema,
  displayName: z.string().min(2),
  qrCodeUrl: z.string().url().optional(),
  isActive: z.boolean().default(false),
});

export const upiUpdateSchema = upiCreateSchema.partial();
