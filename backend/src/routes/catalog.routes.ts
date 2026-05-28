import { Router } from "express";
import slugify from "slugify";
import { Role, StockMovementType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { categoryCreateSchema, categoryUpdateSchema, productCreateSchema, productUpdateSchema, stockAdjustSchema, stockUpdateSchema, upiCreateSchema, upiUpdateSchema } from "../schemas/catalog";
import { idParam, paginationQuery, productIdParam } from "../schemas/common";
import { ok, paginated, toPagination } from "../utils/api";
import { AppError, asyncHandler } from "../utils/errors";

export const catalogRouter = Router();
export const adminCatalogRouter = Router();

const makeSlug = (value: string) => slugify(value, { lower: true, strict: true });

catalogRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query = paginationQuery.parse(req.query);
    const { page, limit, skip } = toPagination(query);
    const where = {
      isActive: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" as const } }, { description: { contains: query.q, mode: "insensitive" as const } }] } : {}),
    };
    const orderBy =
      query.sort === "price_asc" ? { price: "asc" as const } : query.sort === "price_desc" ? { price: "desc" as const } : query.sort === "name" ? { name: "asc" as const } : { createdAt: "desc" as const };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true, stock: true }, skip, take: limit, orderBy }),
      prisma.product.count({ where }),
    ]);
    paginated(res, products, { page, limit, total });
  }),
);

catalogRouter.get("/products/search", catalogRouter.stack[0].handle);

catalogRouter.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({ where: { slug: req.params.slug as string, isActive: true }, include: { category: true, stock: true } });
    if (!product) throw new AppError("Product not found", 404);
    ok(res, product);
  }),
);

catalogRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
  }),
);

catalogRouter.get(
  "/payment/upi/active",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.upiPaymentSetting.findMany({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
    ok(res, settings);
  }),
);

adminCatalogRouter.use(requireAuth, requireRole(Role.ADMIN));

adminCatalogRouter.post(
  "/products",
  validate(productCreateSchema),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.create({
      data: { ...req.body, slug: req.body.slug ? makeSlug(req.body.slug) : makeSlug(req.body.name), stock: { create: { quantity: 0 } } },
      include: { stock: true, category: true },
    });
    ok(res, product, "Product created", 201);
  }),
);

adminCatalogRouter.get(
  "/products",
  asyncHandler(async (req, res) => {
    const query = paginationQuery.parse(req.query);
    const { page, limit, skip } = toPagination(query);
    const where = query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" as const } }, { slug: { contains: query.q, mode: "insensitive" as const } }] } : {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true, stock: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.product.count({ where }),
    ]);
    paginated(res, products, { page, limit, total });
  }),
);

adminCatalogRouter.get("/products/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.product.findUniqueOrThrow({ where: { id: req.params.id as string }, include: { category: true, stock: true } }))));

adminCatalogRouter.patch(
  "/products/:id",
  validate(idParam.merge(productUpdateSchema)),
  asyncHandler(async (req, res) => {
    const data = { ...req.body, ...(req.body.slug ? { slug: makeSlug(req.body.slug) } : {}) };
    ok(res, await prisma.product.update({ where: { id: req.params.id as string }, data, include: { category: true, stock: true } }), "Product updated");
  }),
);

adminCatalogRouter.delete(
  "/products/:id",
  validate(idParam),
  asyncHandler(async (req, res) => ok(res, await prisma.product.update({ where: { id: req.params.id as string }, data: { isActive: false } }), "Product deleted")),
);

adminCatalogRouter.post("/categories", validate(categoryCreateSchema), asyncHandler(async (req, res) => ok(res, await prisma.category.create({ data: { ...req.body, slug: req.body.slug ? makeSlug(req.body.slug) : makeSlug(req.body.name) } }), "Category created", 201)));
adminCatalogRouter.get("/categories", asyncHandler(async (_req, res) => ok(res, await prisma.category.findMany({ orderBy: { createdAt: "desc" } }))));
adminCatalogRouter.patch("/categories/:id", validate(idParam.merge(categoryUpdateSchema)), asyncHandler(async (req, res) => ok(res, await prisma.category.update({ where: { id: req.params.id as string }, data: { ...req.body, ...(req.body.slug ? { slug: makeSlug(req.body.slug) } : {}) } }), "Category updated")));
adminCatalogRouter.delete("/categories/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.category.update({ where: { id: req.params.id as string }, data: { isActive: false } }), "Category deleted")));

adminCatalogRouter.get("/stock", asyncHandler(async (_req, res) => ok(res, await prisma.stock.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } }))));
adminCatalogRouter.get("/stock/:productId", validate(productIdParam), asyncHandler(async (req, res) => ok(res, await prisma.stock.findUniqueOrThrow({ where: { productId: req.params.productId as string }, include: { product: true } }))));
adminCatalogRouter.patch("/stock/:productId", validate(productIdParam.merge(stockUpdateSchema)), asyncHandler(async (req, res) => ok(res, await prisma.stock.upsert({ where: { productId: req.params.productId as string }, update: req.body, create: { productId: req.params.productId as string, quantity: req.body.quantity ?? 0, lowStockThreshold: req.body.lowStockThreshold ?? 5 } }), "Stock updated")));
adminCatalogRouter.post(
  "/stock/:productId/adjust",
  validate(productIdParam.merge(stockAdjustSchema)),
  asyncHandler(async (req, res) => {
    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.upsert({
        where: { productId: req.params.productId as string },
        update: { quantity: { increment: req.body.quantity } },
        create: { productId: req.params.productId as string, quantity: Math.max(req.body.quantity, 0) },
      });
      if (stock.quantity < 0) throw new AppError("Stock cannot be negative", 400);
      await tx.stockMovement.create({ data: { productId: req.params.productId as string, quantity: req.body.quantity, type: StockMovementType.ADJUSTMENT, reason: req.body.reason, createdById: req.user!.id } });
      return stock;
    });
    ok(res, result, "Stock adjusted");
  }),
);

adminCatalogRouter.post("/upi", validate(upiCreateSchema), asyncHandler(async (req, res) => {
  const data = await prisma.$transaction(async (tx) => {
    if (req.body.isActive) await tx.upiPaymentSetting.updateMany({ data: { isActive: false } });
    return tx.upiPaymentSetting.create({ data: req.body });
  });
  ok(res, data, "UPI setting created", 201);
}));
adminCatalogRouter.get("/upi", asyncHandler(async (_req, res) => ok(res, await prisma.upiPaymentSetting.findMany({ orderBy: { updatedAt: "desc" } }))));
adminCatalogRouter.patch("/upi/:id", validate(idParam.merge(upiUpdateSchema)), asyncHandler(async (req, res) => {
  const data = await prisma.$transaction(async (tx) => {
    if (req.body.isActive) await tx.upiPaymentSetting.updateMany({ data: { isActive: false } });
    return tx.upiPaymentSetting.update({ where: { id: req.params.id as string }, data: req.body });
  });
  ok(res, data, "UPI setting updated");
}));
adminCatalogRouter.delete("/upi/:id", validate(idParam), asyncHandler(async (req, res) => ok(res, await prisma.upiPaymentSetting.delete({ where: { id: req.params.id as string } }), "UPI setting deleted")));
