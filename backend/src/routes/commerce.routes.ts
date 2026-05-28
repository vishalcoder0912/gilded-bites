import { Router, type Request } from "express";
import multer from "multer";
import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import { CouponType, OrderStatus, PaymentMethod, PaymentStatus, Prisma, Role, StockMovementType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addressCreateSchema, addressUpdateSchema, assignDeliveryPartnerSchema, cartItemCreateSchema, cartItemUpdateSchema, couponValidateSchema, etaSchema, orderCreateSchema, paymentStatusUpdateSchema, paymentSubmitSchema, statusUpdateSchema, trackingCreateSchema } from "../schemas/commerce";
import { idParam } from "../schemas/common";
import { createOrderNumber, createTransactionId } from "../utils/ids";
import { ok, paginated, safeUserSelect, toPagination } from "../utils/api";
import { AppError, asyncHandler } from "../utils/errors";
import { stripe } from "../lib/stripe";
import { env } from "../config/env";
import QRCode from "qrcode";

export const commerceRouter = Router();
export const adminCommerceRouter = Router();
export const deliveryRouter = Router();

const FREE_DELIVERY_THRESHOLD_PAISE = 250000; // INR 2500
const DELIVERY_CHARGE_PAISE = 15000; // INR 150

const calculateDeliveryCharge = (subtotal: number) =>
  subtotal >= FREE_DELIVERY_THRESHOLD_PAISE ? 0 : DELIVERY_CHARGE_PAISE;

const normalizeCouponCode = (value?: string) =>
  value?.trim().toUpperCase() || undefined;

const calculateCouponDiscount = async (
  tx: Prisma.TransactionClient,
  couponCode: string | undefined,
  subtotal: number,
) => {
  const code = normalizeCouponCode(couponCode);

  if (!code) {
    return {
      coupon: null,
      couponCodeSnapshot: null,
      discountAmount: 0,
    };
  }

  const coupon = await tx.coupon.findUnique({
    where: { code },
  });

  if (!coupon) throw new AppError("Invalid coupon code", 400);

  const now = new Date();

  if (!coupon.isActive) throw new AppError("This coupon is not active", 400);
  if (coupon.startsAt && coupon.startsAt > now) throw new AppError("This coupon is not active yet", 400);
  if (coupon.expiresAt && coupon.expiresAt < now) throw new AppError("This coupon has expired", 400);
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("This coupon usage limit has been reached", 400);
  }
  if (subtotal < coupon.minSubtotal) {
    throw new AppError(`Minimum order value for this coupon is ₹${Math.round(coupon.minSubtotal / 100)}`, 400);
  }

  let discountAmount =
    coupon.type === CouponType.PERCENTAGE
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount !== null) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    coupon,
    couponCodeSnapshot: coupon.code,
    discountAmount,
  };
};

const paymentProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError("Only PNG, JPG, and WebP are allowed", 400));
    }
    cb(null, true);
  },
});

const extensionByMime: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

type PaymentProofUploadRequest = Request & {
  file?: Express.Multer.File;
  user?: { id: string };
};

async function uploadToImageStorage(req: PaymentProofUploadRequest) {
  const file = req.file;
  if (!file || !req.user) throw new AppError("Payment proof image required", 400);
  const extension = extensionByMime[file.mimetype];
  const uploadDir = path.join(process.cwd(), "backend", "uploads", "payment-proofs");
  const fileName = `${req.user!.id}-${Date.now()}-${randomUUID()}${extension}`;
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
  return `${req.protocol}://${req.get("host")}/uploads/payment-proofs/${fileName}`;
}

const includeOrder = {
  items: { include: { product: true } },
  deliveryPartner: { select: safeUserSelect },
  tracking: { orderBy: { createdAt: "asc" as const } },
};

const ensureCart = async (userId: string) =>
  prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: { items: { include: { product: true } } } });

commerceRouter.use(["/cart", "/addresses", "/orders"], requireAuth);

commerceRouter.post(
  "/uploads/payment-proof",
  requireAuth,
  paymentProofUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("Payment proof image required", 400);

    const url = await uploadToImageStorage(req);

    ok(res, { url }, "Payment proof uploaded");
  })
);

commerceRouter.get("/cart", asyncHandler(async (req, res) => ok(res, await ensureCart(req.user!.id))));

commerceRouter.get("/cart/items", asyncHandler(async (req, res) => {
  const cart = await ensureCart(req.user!.id);
  ok(res, cart.items);
}));

commerceRouter.post(
  "/coupons/validate",
  requireAuth,
  validate(couponValidateSchema),
  asyncHandler(async (req, res) => {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    const result = await prisma.$transaction((tx) => calculateCouponDiscount(tx, req.body.couponCode, subtotal));
    const deliveryCharge = calculateDeliveryCharge(subtotal);
    const totalAmount = subtotal + deliveryCharge - result.discountAmount;

    ok(
      res,
      {
        code: result.couponCodeSnapshot,
        type: result.coupon?.type,
        value: result.coupon?.value,
        subtotal,
        deliveryCharge,
        discountAmount: result.discountAmount,
        totalAmount,
      },
      "Coupon applied",
    );
  }),
);

commerceRouter.post(
  "/cart/items",
  validate(cartItemCreateSchema),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.body.productId }, include: { stock: true } });
    if (!product?.isActive) throw new AppError("Product is not available", 400);
    if (!product.stock || product.stock.quantity < req.body.quantity) throw new AppError("Insufficient stock", 400);
    const cart = await ensureCart(req.user!.id);
    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: product.id } } });
    const nextQuantity = (existing?.quantity ?? 0) + req.body.quantity;
    if (product.stock.quantity < nextQuantity) throw new AppError("Insufficient stock", 400);
    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      update: { quantity: nextQuantity, priceSnapshot: product.price },
      create: { cartId: cart.id, productId: product.id, quantity: req.body.quantity, priceSnapshot: product.price },
      include: { product: true },
    });
    ok(res, item, "Cart item saved", 201);
  }),
);

commerceRouter.patch(
  "/cart/items/:id",
  validate(idParam.merge(cartItemUpdateSchema)),
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id as string, cart: { userId: req.user!.id } }, include: { product: { include: { stock: true } } } });
    if (!item) throw new AppError("Cart item not found", 404);
    if (!item.product.stock || item.product.stock.quantity < req.body.quantity) throw new AppError("Insufficient stock", 400);
    ok(res, await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: req.body.quantity }, include: { product: true } }), "Cart item updated");
  }),
);

commerceRouter.delete("/cart/items/:id", validate(idParam), asyncHandler(async (req, res) => {
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id as string, cart: { userId: req.user!.id } } });
  if (!item) throw new AppError("Cart item not found", 404);
  await prisma.cartItem.delete({ where: { id: item.id } });
  ok(res, null, "Cart item removed");
}));

commerceRouter.delete("/cart/clear", asyncHandler(async (req, res) => {
  const cart = await ensureCart(req.user!.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  ok(res, null, "Cart cleared");
}));

commerceRouter.post("/addresses", validate(addressCreateSchema), asyncHandler(async (req, res) => {
  const address = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) await tx.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    return tx.address.create({ data: { ...req.body, userId: req.user!.id } });
  });
  ok(res, address, "Address created", 201);
}));
commerceRouter.get("/addresses", asyncHandler(async (req, res) => ok(res, await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }))));
commerceRouter.patch("/addresses/:id", validate(idParam.merge(addressUpdateSchema)), asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id as string, userId: req.user!.id } });
  if (!address) throw new AppError("Address not found", 404);
  ok(res, await prisma.address.update({ where: { id: address.id }, data: req.body }), "Address updated");
}));
commerceRouter.delete("/addresses/:id", validate(idParam), asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id as string, userId: req.user!.id } });
  if (!address) throw new AppError("Address not found", 404);
  await prisma.address.delete({ where: { id: address.id } });
  ok(res, null, "Address deleted");
}));
commerceRouter.patch("/addresses/:id/default", validate(idParam), asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id as string, userId: req.user!.id } });
  if (!address) throw new AppError("Address not found", 404);
  await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  ok(res, await prisma.address.update({ where: { id: address.id }, data: { isDefault: true } }), "Default address set");
}));

commerceRouter.post(
  "/orders",
  validate(orderCreateSchema),
  asyncHandler(async (req, res) => {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({ where: { userId: req.user!.id }, include: { items: { include: { product: { include: { stock: true } } } } } });
      if (!cart?.items.length) throw new AppError("Cart is empty", 400);
      const address = req.body.addressId
        ? await tx.address.findFirst({ where: { id: req.body.addressId, userId: req.user!.id } })
        : req.body.address;
      if (!address) throw new AppError("Address not found", 404);

      for (const item of cart.items) {
        if (!item.product.isActive) throw new AppError(`${item.product.name} is inactive`, 400);
        if (!item.product.stock || item.product.stock.quantity < item.quantity) throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }

      const subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
      const deliveryCharge = calculateDeliveryCharge(subtotal);
      const { coupon, couponCodeSnapshot, discountAmount } = await calculateCouponDiscount(tx, req.body.couponCode, subtotal);
      const totalAmount = subtotal + deliveryCharge - discountAmount;
      const activeUpi = req.body.paymentMethod === PaymentMethod.UPI ? await tx.upiPaymentSetting.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }) : null;
      if (req.body.paymentMethod === PaymentMethod.UPI && !activeUpi) {
        throw new AppError("No active UPI ID configured by admin", 400);
      }
      const requiresOnlinePayment =
        req.body.paymentMethod === PaymentMethod.UPI ||
        req.body.paymentMethod === PaymentMethod.STRIPE;
      const created = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          transactionId: createTransactionId(),
          userId: req.user!.id,
          status: requiresOnlinePayment ? OrderStatus.PAYMENT_PENDING : OrderStatus.PLACED,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: req.body.paymentMethod,
          upiId: activeUpi?.upiId,
          upiSettingId: activeUpi?.id,
          subtotal,
          deliveryCharge,
          discountAmount,
          couponId: coupon?.id,
          couponCodeSnapshot,
          totalAmount,
          customerName: address.fullName,
          customerPhone: address.phone,
          deliveryAddressLine1: address.addressLine1,
          deliveryAddressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productNameSnapshot: item.product.name,
              productPriceSnapshot: item.priceSnapshot,
              quantity: item.quantity,
              totalPrice: item.priceSnapshot * item.quantity,
            })),
          },
          tracking: { create: { status: OrderStatus.PLACED, title: "Order placed", message: "Your order has been received.", updatedById: req.user!.id } },
        },
        include: includeOrder,
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      for (const item of cart.items) {
        await tx.stock.update({ where: { productId: item.productId }, data: { quantity: { decrement: item.quantity } } });
        await tx.stockMovement.create({ data: { productId: item.productId, type: StockMovementType.ORDER_RESERVED, quantity: item.quantity, referenceId: created.id, createdById: req.user!.id, reason: "Order placed" } });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });
    ok(res, order, "Order placed", 201);
  }),
);

commerceRouter.get("/orders", asyncHandler(async (req, res) => ok(res, await prisma.order.findMany({ where: { userId: req.user!.id }, include: includeOrder, orderBy: { createdAt: "desc" } }))));
commerceRouter.get("/orders/:id", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, userId: req.user!.id }, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, order);
}));
commerceRouter.post("/orders/:id/payment-submit", validate(idParam.merge(paymentSubmitSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, userId: req.user!.id } });
  if (!order) throw new AppError("Order not found", 404);
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentReferenceNumber: req.body.paymentReferenceNumber, upiId: req.body.upiId ?? order.upiId, paymentStatus: PaymentStatus.SUBMITTED, status: OrderStatus.PAYMENT_SUBMITTED, tracking: { create: { status: OrderStatus.PAYMENT_SUBMITTED, title: "Payment submitted", message: "Your UPI reference has been submitted for verification.", updatedById: req.user!.id } } },
    include: includeOrder,
  });
  ok(res, updated, "Payment submitted");
}));
commerceRouter.post(
  "/orders/:id/stripe-checkout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id as string,
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) throw new AppError("Order not found", 404);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user!.email,
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: item.productPriceSnapshot,
          product_data: {
            name: item.productNameSnapshot || item.product?.name || "Noir Sane item",
          },
        },
      })),
      metadata: {
        orderId: order.id,
        userId: req.user!.id,
      },
      success_url: `${env.FRONTEND_URL}/order-confirmed?id=${order.id}&payment=stripe_success`,
      cancel_url: `${env.FRONTEND_URL}/checkout?payment=stripe_cancelled`,
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        method: "STRIPE",
        provider: "stripe",
        status: "PENDING",
        amount: order.totalAmount,
        currency: "INR",
        stripeSessionId: session.id,
      },
      create: {
        orderId: order.id,
        method: "STRIPE",
        provider: "stripe",
        status: "PENDING",
        amount: order.totalAmount,
        currency: "INR",
        stripeSessionId: session.id,
      },
    });

    ok(res, { url: session.url }, "Stripe checkout created");
  }),
);

commerceRouter.post(
  "/orders/:id/upi-session",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id as string,
        userId: req.user!.id,
      },
    });

    if (!order) throw new AppError("Order not found", 404);

    const activeUpi = await prisma.upiPaymentSetting.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!activeUpi) {
      throw new AppError("No active UPI ID configured by admin", 400);
    }

    const transactionRef = `NS-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const amountRupees = (order.totalAmount / 100).toFixed(2);

    const upiUri =
      `upi://pay?pa=${encodeURIComponent(activeUpi.upiId)}` +
      `&pn=${encodeURIComponent(activeUpi.displayName || "Noir Sane")}` +
      `&am=${encodeURIComponent(amountRupees)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(transactionRef)}`;

    const qrDataUrl = await QRCode.toDataURL(upiUri, {
      width: 300,
      margin: 1,
    });

    const session = await prisma.upiPaymentSession.create({
      data: {
        orderId: order.id,
        upiSettingId: activeUpi.id,
        upiIdSnapshot: activeUpi.upiId,
        payeeName: activeUpi.displayName || "Noir Sane",
        amount: order.totalAmount,
        currency: "INR",
        transactionRef,
        upiUri,
        qrDataUrl,
      },
    });

    ok(res, session, "UPI payment session created");
  })
);

commerceRouter.post(
  "/upi-sessions/:id/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { utr, proofImageUrl } = req.body;

    if (!/^\d{12}$/.test(utr)) {
      throw new AppError("Invalid UTR. It must be 12 digits.", 400);
    }

    if (!proofImageUrl || typeof proofImageUrl !== "string") {
      throw new AppError("Payment proof image required", 400);
    }

    const session = await prisma.upiPaymentSession.findFirst({
      where: {
        id: req.params.id as string,
      },
      include: { order: true },
    });

    if (!session) throw new AppError("UPI session not found", 404);

    const order = session.order;

    if (order.userId !== req.user!.id) {
      throw new AppError("Forbidden", 403);
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new AppError("Payment already submitted or processed", 409);
    }

    if (session.orderId !== order.id) {
      throw new AppError("Invalid payment session", 400);
    }

    if (session.amount !== order.totalAmount) {
      throw new AppError("Payment amount mismatch", 400);
    }

    if (session.status !== PaymentStatus.PENDING) {
      throw new AppError("Payment session already submitted or processed", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const upiSession = await tx.upiPaymentSession.update({
        where: { id: session.id },
        data: {
          utr,
          proofImageUrl,
          status: PaymentStatus.SUBMITTED,
        },
      });

      await tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          method: PaymentMethod.UPI,
          provider: "manual_upi",
          status: PaymentStatus.SUBMITTED,
          amount: order.totalAmount,
          currency: "INR",
          upiReferenceNumber: utr,
          proofImageUrl,
        },
        create: {
          orderId: order.id,
          method: PaymentMethod.UPI,
          provider: "manual_upi",
          status: PaymentStatus.SUBMITTED,
          amount: order.totalAmount,
          currency: "INR",
          upiReferenceNumber: utr,
          proofImageUrl,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.SUBMITTED,
          status: OrderStatus.PAYMENT_SUBMITTED,
          paymentReferenceNumber: utr,
          tracking: {
            create: {
              status: OrderStatus.PAYMENT_SUBMITTED,
              title: "Payment submitted",
              message: "Your UPI payment proof has been submitted for admin verification.",
              updatedById: req.user!.id,
            },
          },
        },
      });

      return upiSession;
    });

    ok(res, updated, "Payment submitted for admin verification");
  })
);

commerceRouter.post("/orders/:id/cancel", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, userId: req.user!.id }, include: { items: true } });
  if (!order) throw new AppError("Order not found", 404);
  if (([OrderStatus.OUT_FOR_DELIVERY, OrderStatus.NEARBY, OrderStatus.DELIVERED] as OrderStatus[]).includes(order.status)) throw new AppError("Order can no longer be cancelled", 400);
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.stock.update({ where: { productId: item.productId }, data: { quantity: { increment: item.quantity } } });
      await tx.stockMovement.create({ data: { productId: item.productId, type: StockMovementType.ORDER_CANCELLED, quantity: item.quantity, referenceId: order.id, createdById: req.user!.id, reason: "Order cancelled" } });
    }
    return tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.CANCELLED, cancelledAt: new Date(), tracking: { create: { status: OrderStatus.CANCELLED, title: "Order cancelled", message: "Your order has been cancelled.", updatedById: req.user!.id } } }, include: includeOrder });
  });
  ok(res, updated, "Order cancelled");
}));
commerceRouter.get("/orders/:id/tracking", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, userId: req.user!.id }, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, {
    orderNumber: order.orderNumber,
    currentStatus: order.status,
    currentLocationText: order.tracking.at(-1)?.locationText,
    estimatedDeliveryTime: order.adminEstimatedDeliveryTime,
    estimatedDeliveryMessage: order.estimatedDeliveryMessage,
    deliveryPartnerName: order.deliveryPartner?.name,
    deliveryPartnerPhone: order.deliveryPartner?.phone,
    trackingTimeline: order.tracking,
  });
}));

adminCommerceRouter.use(requireAuth, requireRole(Role.ADMIN));
adminCommerceRouter.get("/dashboard", asyncHandler(async (_req, res) => {
  const [totalUsers, totalProducts, totalOrders, pendingOrders, deliveredOrders, cancelledOrders, revenue, stockRows, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: [OrderStatus.PLACED, OrderStatus.PAYMENT_PENDING, OrderStatus.PAYMENT_SUBMITTED, OrderStatus.CONFIRMED] } } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    prisma.order.aggregate({ where: { paymentStatus: PaymentStatus.VERIFIED }, _sum: { totalAmount: true } }),
    prisma.stock.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } }),
    prisma.order.findMany({ include: { user: { select: safeUserSelect } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const lowStockProducts = stockRows.filter((stock) => stock.quantity <= stock.lowStockThreshold).slice(0, 10);
  ok(res, { totalUsers, totalProducts, totalOrders, pendingOrders, deliveredOrders, cancelledOrders, totalRevenue: revenue._sum.totalAmount ?? 0, lowStockProducts, recentOrders });
}));
adminCommerceRouter.get("/orders", asyncHandler(async (req, res) => {
  const { page, limit, skip } = toPagination(req.query);
  const [orders, total] = await Promise.all([prisma.order.findMany({ include: includeOrder, skip, take: limit, orderBy: { createdAt: "desc" } }), prisma.order.count()]);
  paginated(res, orders, { page, limit, total });
}));
adminCommerceRouter.get("/orders/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.order.findUniqueOrThrow({ where: { id: req.params.id as string }, include: includeOrder }))));
adminCommerceRouter.patch("/orders/:id/status", validate(idParam.merge(statusUpdateSchema)), asyncHandler(async (req, res) => ok(res, await updateOrderStatus(req.params.id as string, req.body.status, req.user!.id, req.body.title, req.body.message, req.body.locationText), "Order status updated")));
adminCommerceRouter.patch(
  "/orders/:id/payment-status",
  validate(idParam.merge(paymentStatusUpdateSchema)),
  asyncHandler(async (req, res) => {
    const paymentStatus = req.body.paymentStatus as PaymentStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: req.params.id as string },
        include: {
          payment: true,
          upiSessions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!order) throw new AppError("Order not found", 404);

      const nextOrderStatus =
        paymentStatus === PaymentStatus.VERIFIED
          ? OrderStatus.CONFIRMED
          : paymentStatus === PaymentStatus.REJECTED
            ? OrderStatus.FAILED
            : order.status;

      if (order.payment) {
        await tx.payment.update({
          where: { orderId: order.id },
          data: { status: paymentStatus },
        });
      }

      const latestUpiSession = order.upiSessions[0];
      if (latestUpiSession) {
        await tx.upiPaymentSession.update({
          where: { id: latestUpiSession.id },
          data: { status: paymentStatus },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          status: nextOrderStatus,
          tracking:
            paymentStatus === PaymentStatus.VERIFIED
              ? {
                  create: {
                    status: OrderStatus.CONFIRMED,
                    title: "Order confirmed",
                    message: "Payment verified by admin. Order is confirmed.",
                    updatedById: req.user!.id,
                  },
                }
              : paymentStatus === PaymentStatus.REJECTED
                ? {
                    create: {
                      status: OrderStatus.FAILED,
                      title: "Payment rejected",
                      message: "Payment was rejected by admin. Please contact support.",
                      updatedById: req.user!.id,
                    },
                  }
                : undefined,
        },
        include: includeOrder,
      });
    });

    ok(res, updated, "Payment status updated");
  }),
);
adminCommerceRouter.patch("/orders/:id/assign-delivery-partner", validate(idParam.merge(assignDeliveryPartnerSchema)), asyncHandler(async (req, res) => {
  const partner = await prisma.user.findFirst({ where: { id: req.body.deliveryPartnerId, role: Role.DELIVERY_PARTNER, isActive: true } });
  if (!partner) throw new AppError("Delivery partner not found", 404);
  ok(res, await prisma.order.update({ where: { id: req.params.id as string }, data: { deliveryPartnerId: partner.id }, include: includeOrder }), "Delivery partner assigned");
}));
adminCommerceRouter.patch("/orders/:id/estimated-delivery-time", validate(idParam.merge(etaSchema)), asyncHandler(async (req, res) => ok(res, await prisma.order.update({ where: { id: req.params.id as string }, data: req.body, include: includeOrder }), "Estimated delivery updated")));
adminCommerceRouter.post("/orders/:id/tracking", validate(idParam.merge(trackingCreateSchema)), asyncHandler(async (req, res) => ok(res, await prisma.deliveryTracking.create({ data: { ...req.body, orderId: req.params.id as string, updatedById: req.user!.id } }), "Tracking added", 201)));
adminCommerceRouter.get("/orders/:id/tracking", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.deliveryTracking.findMany({ where: { orderId: req.params.id as string }, orderBy: { createdAt: "asc" } }))));

adminCommerceRouter.patch(
  "/upi-sessions/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      throw new AppError("Invalid payment status", 400);
    }

    const session = await prisma.upiPaymentSession.update({
      where: { id: req.params.id as string },
      data: { status },
    });

    await prisma.order.update({
      where: { id: session.orderId },
      data: {
        paymentStatus: status,
        status: status === "VERIFIED" ? OrderStatus.CONFIRMED : OrderStatus.PAYMENT_SUBMITTED,
        tracking: status === "VERIFIED" ? {
          create: {
            status: OrderStatus.CONFIRMED,
            title: "Order confirmed",
            message: "Your payment has been verified and your order is confirmed.",
            updatedById: req.user!.id,
          }
        } : undefined,
      },
    });

    ok(res, session, "UPI payment status updated");
  })
);

deliveryRouter.use(requireAuth, requireRole(Role.DELIVERY_PARTNER));
deliveryRouter.get("/orders", asyncHandler(async (req, res) => ok(res, await prisma.order.findMany({ where: { deliveryPartnerId: req.user!.id }, include: includeOrder, orderBy: { createdAt: "desc" } }))));
deliveryRouter.get("/orders/:id", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, deliveryPartnerId: req.user!.id }, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, order);
}));
deliveryRouter.patch("/orders/:id/status", validate(idParam.merge(statusUpdateSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, deliveryPartnerId: req.user!.id } });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, await updateOrderStatus(order.id, req.body.status, req.user!.id, req.body.title, req.body.message, req.body.locationText), "Delivery status updated");
}));
deliveryRouter.post("/orders/:id/location", validate(idParam.merge(trackingCreateSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id as string, deliveryPartnerId: req.user!.id } });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, await prisma.deliveryTracking.create({ data: { ...req.body, orderId: order.id, updatedById: req.user!.id } }), "Location updated", 201);
}));

async function updateOrderStatus(orderId: string, status: OrderStatus, userId: string, title?: string, message?: string, locationText?: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      deliveredAt: status === OrderStatus.DELIVERED ? new Date() : undefined,
      tracking: {
        create: {
          status,
          title: title ?? status.replaceAll("_", " ").toLowerCase(),
          message: message ?? "Order status updated.",
          locationText,
          updatedById: userId,
        },
      },
    },
    include: includeOrder,
  });
}
