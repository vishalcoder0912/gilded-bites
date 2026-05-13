import { z } from "zod";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { addressFields } from "./common";

export const cartItemCreateSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export const addressCreateSchema = z.object({
  ...addressFields,
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressCreateSchema.partial();

export const orderCreateSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  addressId: z.string().uuid().optional(),
  address: z.object(addressFields).optional(),
  deliveryCharge: z.coerce.number().int().min(0).default(0),
  discountAmount: z.coerce.number().int().min(0).default(0),
}).refine((body) => body.addressId || body.address, "addressId or address is required");

export const paymentSubmitSchema = z.object({
  paymentReferenceNumber: z.string().min(6).max(64),
  upiId: z.string().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  title: z.string().optional(),
  message: z.string().optional(),
  locationText: z.string().optional(),
});

export const paymentStatusUpdateSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export const assignDeliveryPartnerSchema = z.object({
  deliveryPartnerId: z.string().uuid(),
});

export const etaSchema = z.object({
  adminEstimatedDeliveryTime: z.coerce.date(),
  estimatedDeliveryMessage: z.string().min(3),
});

export const trackingCreateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  title: z.string().min(2),
  message: z.string().min(2),
  locationText: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});