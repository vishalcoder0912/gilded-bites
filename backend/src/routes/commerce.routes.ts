// @ts-nocheck
import { Router } from "express";
import { OrderStatus, PaymentMethod, PaymentStatus, Role, StockMovementType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addressCreateSchema, addressUpdateSchema, assignDeliveryPartnerSchema, cartItemCreateSchema, cartItemUpdateSchema, etaSchema, orderCreateSchema, paymentStatusUpdateSchema, paymentSubmitSchema, statusUpdateSchema, trackingCreateSchema } from "../schemas/commerce";
import { idParam } from "../schemas/common";
import { createOrderNumber, createTransactionId } from "../utils/ids";
import { ok, paginated, safeUserSelect, toPagination } from "../utils/api";
import { AppError, asyncHandler } from "../utils/errors";

export const commerceRouter = Router();
export const adminCommerceRouter = Router();
export const deliveryRouter = Router();

const includeOrder = {
  items: { include: { product: true } },
  deliveryPartner: { select: safeUserSelect },
  tracking: { orderBy: { createdAt: "asc" as const } },
};

const ensureCart = async (userId: string) =>
  prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include: { items: { include: { product: true } } } });

commerceRouter.use(["/cart", "/addresses", "/orders"], requireAuth);

commerceRouter.get("/cart", asyncHandler(async (req, res) => ok(res, await ensureCart(req.user!.id))));

commerceRouter.get("/cart/items", asyncHandler(async (req, res) => {
  const cart = await ensureCart(req.user!.id);
  ok(res, cart.items);
}));

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
    const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cart: { userId: req.user!.id } }, include: { product: { include: { stock: true } } } });
    if (!item) throw new AppError("Cart item not found", 404);
    if (!item.product.stock || item.product.stock.quantity < req.body.quantity) throw new AppError("Insufficient stock", 400);
    ok(res, await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: req.body.quantity }, include: { product: true } }), "Cart item updated");
  }),
);

commerceRouter.delete("/cart/items/:id", validate(idParam), asyncHandler(async (req, res) => {
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, cart: { userId: req.user!.id } } });
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
  const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!address) throw new AppError("Address not found", 404);
  ok(res, await prisma.address.update({ where: { id: address.id }, data: req.body }), "Address updated");
}));
commerceRouter.delete("/addresses/:id", validate(idParam), asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!address) throw new AppError("Address not found", 404);
  await prisma.address.delete({ where: { id: address.id } });
  ok(res, null, "Address deleted");
}));
commerceRouter.patch("/addresses/:id/default", validate(idParam), asyncHandler(async (req, res) => {
  const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
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
      const deliveryCharge = req.body.deliveryCharge ?? 0;
      const discountAmount = req.body.discountAmount ?? 0;
      const totalAmount = subtotal + deliveryCharge - discountAmount;
      const activeUpi = req.body.paymentMethod === PaymentMethod.UPI ? await tx.upiPaymentSetting.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }) : null;
      const created = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          transactionId: createTransactionId(),
          userId: req.user!.id,
          status: req.body.paymentMethod === PaymentMethod.UPI ? OrderStatus.PAYMENT_PENDING : OrderStatus.PLACED,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: req.body.paymentMethod,
          upiId: activeUpi?.upiId,
          upiSettingId: activeUpi?.id,
          subtotal,
          deliveryCharge,
          discountAmount,
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
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, order);
}));
commerceRouter.post("/orders/:id/payment-submit", validate(idParam.merge(paymentSubmitSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
  if (!order) throw new AppError("Order not found", 404);
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentReferenceNumber: req.body.paymentReferenceNumber, upiId: req.body.upiId ?? order.upiId, paymentStatus: PaymentStatus.SUBMITTED, status: OrderStatus.PAYMENT_SUBMITTED, tracking: { create: { status: OrderStatus.PAYMENT_SUBMITTED, title: "Payment submitted", message: "Your UPI reference has been submitted for verification.", updatedById: req.user!.id } } },
    include: includeOrder,
  });
  ok(res, updated, "Payment submitted");
}));
commerceRouter.post("/orders/:id/cancel", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: { items: true } });
  if (!order) throw new AppError("Order not found", 404);
  if ([OrderStatus.OUT_FOR_DELIVERY, OrderStatus.NEARBY, OrderStatus.DELIVERED].includes(order.status)) throw new AppError("Order can no longer be cancelled", 400);
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
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.id }, include: includeOrder });
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
adminCommerceRouter.get("/orders/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.order.findUniqueOrThrow({ where: { id: req.params.id }, include: includeOrder }))));
adminCommerceRouter.patch("/orders/:id/status", validate(idParam.merge(statusUpdateSchema)), asyncHandler(async (req, res) => ok(res, await updateOrderStatus(req.params.id, req.body.status, req.user!.id, req.body.title, req.body.message, req.body.locationText), "Order status updated")));
adminCommerceRouter.patch("/orders/:id/payment-status", validate(idParam.merge(paymentStatusUpdateSchema)), asyncHandler(async (req, res) => ok(res, await prisma.order.update({ where: { id: req.params.id }, data: { paymentStatus: req.body.paymentStatus }, include: includeOrder }), "Payment status updated")));
adminCommerceRouter.patch("/orders/:id/assign-delivery-partner", validate(idParam.merge(assignDeliveryPartnerSchema)), asyncHandler(async (req, res) => {
  const partner = await prisma.user.findFirst({ where: { id: req.body.deliveryPartnerId, role: Role.DELIVERY_PARTNER, isActive: true } });
  if (!partner) throw new AppError("Delivery partner not found", 404);
  ok(res, await prisma.order.update({ where: { id: req.params.id }, data: { deliveryPartnerId: partner.id }, include: includeOrder }), "Delivery partner assigned");
}));
adminCommerceRouter.patch("/orders/:id/estimated-delivery-time", validate(idParam.merge(etaSchema)), asyncHandler(async (req, res) => ok(res, await prisma.order.update({ where: { id: req.params.id }, data: req.body, include: includeOrder }), "Estimated delivery updated")));
adminCommerceRouter.post("/orders/:id/tracking", validate(idParam.merge(trackingCreateSchema)), asyncHandler(async (req, res) => ok(res, await prisma.deliveryTracking.create({ data: { ...req.body, orderId: req.params.id, updatedById: req.user!.id } }), "Tracking added", 201)));
adminCommerceRouter.get("/orders/:id/tracking", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.deliveryTracking.findMany({ where: { orderId: req.params.id }, orderBy: { createdAt: "asc" } }))));

deliveryRouter.use(requireAuth, requireRole(Role.DELIVERY_PARTNER));
deliveryRouter.get("/orders", asyncHandler(async (req, res) => ok(res, await prisma.order.findMany({ where: { deliveryPartnerId: req.user!.id }, include: includeOrder, orderBy: { createdAt: "desc" } }))));
deliveryRouter.get("/orders/:id", validate(idParam), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, deliveryPartnerId: req.user!.id }, include: includeOrder });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, order);
}));
deliveryRouter.patch("/orders/:id/status", validate(idParam.merge(statusUpdateSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, deliveryPartnerId: req.user!.id } });
  if (!order) throw new AppError("Order not found", 404);
  ok(res, await updateOrderStatus(order.id, req.body.status, req.user!.id, req.body.title, req.body.message, req.body.locationText), "Delivery status updated");
}));
deliveryRouter.post("/orders/:id/location", validate(idParam.merge(trackingCreateSchema)), asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, deliveryPartnerId: req.user!.id } });
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
