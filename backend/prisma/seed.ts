import "dotenv/config";
import bcrypt from "bcrypt";
import slugify from "slugify";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const slug = (value: string) => slugify(value, { lower: true, strict: true });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@noirsane.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      name: "Noir Sane Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      cart: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: "delivery@noirsane.com" },
    update: { role: Role.DELIVERY_PARTNER, isActive: true },
    create: {
      name: "Delivery Partner",
      email: "delivery@noirsane.com",
      phone: "+919999999999",
      passwordHash,
      role: Role.DELIVERY_PARTNER,
      cart: { create: {} },
    },
  });

  const categories = ["Truffles", "Bars", "Pralines", "Bonbons", "Single Origin", "Fruit Chocolates"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name), description: `${name} collection` },
    });
  }

  const categoryRows = await prisma.category.findMany({
    where: { slug: { in: categories.map(slug) } },
  });
  const categoryBySlug = new Map(categoryRows.map((category) => [category.slug, category]));

  const products = [
    {
      name: "Eclat de Pommeraie",
      categorySlug: "fruit-chocolates",
      price: 78000,
      mrp: 92000,
      isFeatured: true,
      shortDescription: "Apple jelly, dark chocolate, and warm orchard caramel",
      description:
        "A polished dark chocolate bar crowned with ruby apple jelly cubes and layered with a soft apple-caramel centre. Bright, juicy, and gently tart with a clean cocoa finish.",
      quantity: 36,
      imageUrls: ["/products/apple-box.png", "/products/apple-2.png", "/products/apple-3.png", "/products/apple-4.png"],
    },
    {
      name: "Soleil Secret",
      categorySlug: "fruit-chocolates",
      price: 76000,
      mrp: 89000,
      isFeatured: true,
      shortDescription: "Orange citrus jelly folded into bittersweet dark chocolate",
      description:
        "Candied orange jelly and a glossy citrus filling meet rich dark chocolate for a sunlit bar with aromatic peel, mellow sweetness, and a bright finish.",
      quantity: 34,
      imageUrls: ["/products/orange-box.png", "/products/orange-4.png", "/products/orange-1.png", "/products/orange-3.png"],
    },
    {
      name: "Mystere d'Aurore",
      categorySlug: "fruit-chocolates",
      price: 82000,
      mrp: 98000,
      isFeatured: true,
      shortDescription: "Mango jelly and tropical caramel in dark chocolate",
      description:
        "Golden mango jelly pieces sit over a deep chocolate tablet filled with lush mango-caramel. Tropical, creamy, and balanced by a bittersweet shell.",
      quantity: 32,
      imageUrls: ["/products/mango-box.png", "/products/mango-3.png", "/products/mango-1.png", "/products/mango-2.png"],
    },
    {
      name: "Ombres de Vigne",
      categorySlug: "fruit-chocolates",
      price: 79000,
      mrp: 94000,
      isFeatured: false,
      shortDescription: "Grape jelly with a dark, jammy cocoa centre",
      description:
        "Deep grape jelly cubes and a flowing fruit centre give this dark chocolate bar a wine-like berry character with a smooth cocoa backbone.",
      quantity: 30,
      imageUrls: ["/products/grape-box.png", "/products/grapes-3.png", "/products/grapes-1.png", "/products/grapes-2.png"],
    },
    {
      name: "Lumiere d'Or",
      categorySlug: "fruit-chocolates",
      price: 84000,
      mrp: 99000,
      isFeatured: false,
      shortDescription: "Pineapple brightness with crunchy tropical inclusions",
      description:
        "Dark chocolate lifted by pineapple jelly and golden fruit pieces. The flavour opens sweet and tangy, then settles into toasted cocoa and tropical crunch.",
      quantity: 33,
      imageUrls: ["/products/pineapple-box.png", "/products/pineapple-2.png", "/products/pineapple-1.png", "/products/pineapple-4.png"],
    },
    {
      name: "Coeur des Rubis",
      categorySlug: "fruit-chocolates",
      price: 86000,
      mrp: 102000,
      isFeatured: true,
      shortDescription: "Pomegranate jewels with a ruby fruit centre",
      description:
        "A dramatic dark chocolate bar set with pomegranate jelly cubes and a jewel-red fruit filling. Tart, glossy, and intensely aromatic.",
      quantity: 28,
      imageUrls: ["/products/pomegranate-box.png", "/products/pomegranate-2.png", "/products/pomegranate-3.png", "/products/pomegranate-4.png"],
    },
    {
      name: "La Symphonie Noire",
      categorySlug: "fruit-chocolates",
      price: 94000,
      mrp: 112000,
      isFeatured: true,
      shortDescription: "Tropical fruit fusion over premium dark chocolate",
      description:
        "A fruit-forward fusion bar with pineapple, apple, grape, and red fruit notes arranged over smooth dark chocolate. Layered, colorful, and made for gifting.",
      quantity: 26,
      imageUrls: ["/products/fusion-box.png", "/products/fusion-1.png", "/products/fusion-3.png", "/products/fusion-4.png"],
    },
    {
      name: "Noir Gold Truffle",
      categorySlug: "truffles",
      price: 129000,
      mrp: 149000,
      isFeatured: true,
      shortDescription: "Dark ganache with edible gold dust",
      description: "A deep cocoa truffle finished with a satin shell and a trace of edible gold.",
      quantity: 28,
      imageUrls: ["/products/pomegranate-box.png", "/products/pomegranate-2.png", "/products/pomegranate-3.png"],
    },
    {
      name: "Piedmont Hazelnut Bar",
      categorySlug: "bars",
      price: 69000,
      mrp: 79000,
      isFeatured: true,
      shortDescription: "Roasted hazelnut and milk chocolate",
      description: "Creamy milk chocolate folded with roasted Piedmont hazelnuts for a clean, nutty finish.",
      quantity: 35,
      imageUrls: ["/products/orange-box.png", "/products/orange-1.png", "/products/orange-3.png"],
    },
    {
      name: "Maison Praline Coffret",
      categorySlug: "pralines",
      price: 245000,
      mrp: 275000,
      isFeatured: true,
      shortDescription: "Assorted pralines in a gift box",
      description: "A curated praline box with almond, hazelnut, pistachio, and salted caramel centres.",
      quantity: 22,
      imageUrls: ["/products/fusion-box.png", "/products/fusion-1.png", "/products/fusion-3.png"],
    },
    {
      name: "Madagascar Vanilla Bonbon",
      categorySlug: "bonbons",
      price: 54000,
      mrp: 62000,
      isFeatured: true,
      shortDescription: "Vanilla cream in a dark chocolate shell",
      description: "Single-origin dark chocolate filled with Madagascar vanilla cream and a soft cocoa finish.",
      quantity: 40,
      imageUrls: ["/products/apple-box.png", "/products/apple-2.png", "/products/apple-3.png"],
    },
    {
      name: "Ecuador 72 Percent Tablet",
      categorySlug: "single-origin",
      price: 88000,
      mrp: 99000,
      isFeatured: false,
      shortDescription: "Single-origin Ecuador dark chocolate",
      description: "A balanced 72 percent tablet with notes of red fruit, roasted almond, and warm spice.",
      quantity: 30,
      imageUrls: ["/products/mango-box.png", "/products/mango-1.png", "/products/mango-3.png"],
    },
    {
      name: "Himalayan Salt Caramel Truffle",
      categorySlug: "truffles",
      price: 118000,
      mrp: 136000,
      isFeatured: false,
      shortDescription: "Salted caramel ganache truffle",
      description: "Slow-cooked caramel, Himalayan pink salt, and dark couverture in a polished truffle.",
      quantity: 26,
      imageUrls: ["/products/pomegranate-box.png", "/products/pomegranate-4.png", "/products/fusion-1.png"],
    },
    {
      name: "Ruby Raspberry Bonbon",
      categorySlug: "bonbons",
      price: 76000,
      mrp: 89000,
      isFeatured: false,
      shortDescription: "Raspberry pate de fruit and ruby chocolate",
      description: "A bright bonbon layered with raspberry pate de fruit and naturally fruity ruby chocolate.",
      quantity: 32,
      imageUrls: ["/products/pomegranate-box.png", "/products/pomegranate-1.png", "/products/pomegranate-3.png"],
    },
    {
      name: "Almond Gianduja Praline",
      categorySlug: "pralines",
      price: 98000,
      mrp: 115000,
      isFeatured: false,
      shortDescription: "Almond praline with crisp feuilletine",
      description: "Roasted almond gianduja paired with crisp feuilletine for a delicate layered bite.",
      quantity: 34,
      imageUrls: ["/products/fusion-box.png", "/products/fusion-2.png", "/products/fusion-4.png"],
    },
    {
      name: "Ivory Coast 80 Percent Bar",
      categorySlug: "single-origin",
      price: 94000,
      mrp: 109000,
      isFeatured: false,
      shortDescription: "Intense dark chocolate with toasted notes",
      description: "An assertive 80 percent bar with toasted cocoa, espresso, and a long dry finish.",
      quantity: 24,
      imageUrls: ["/products/mango-box.png", "/products/mango-2.png", "/products/mango-4.png"],
    },
    {
      name: "Orange Peel Dark Bar",
      categorySlug: "bars",
      price: 72000,
      mrp: 84000,
      isFeatured: false,
      shortDescription: "Dark chocolate with candied orange peel",
      description: "Bittersweet chocolate scattered with candied orange peel and a clean citrus lift.",
      quantity: 38,
      imageUrls: ["/products/orange-box.png", "/products/orange-2.png", "/products/orange-4.png"],
    },
    {
      name: "Pistachio Rose Bonbon",
      categorySlug: "bonbons",
      price: 82000,
      mrp: 96000,
      isFeatured: false,
      shortDescription: "Pistachio praline with rose aroma",
      description: "Silky pistachio praline scented with rose and sealed in a fine milk chocolate shell.",
      quantity: 27,
      imageUrls: ["/products/apple-box.png", "/products/apple-1.png", "/products/apple-4.png"],
    },
    {
      name: "Sea Salt Brownie Truffle",
      categorySlug: "truffles",
      price: 112000,
      mrp: 132000,
      isFeatured: false,
      shortDescription: "Brownie ganache with sea salt",
      description: "Fudgy brownie ganache dipped in dark chocolate and finished with flakes of sea salt.",
      quantity: 31,
      imageUrls: ["/products/pomegranate-box.png", "/products/pomegranate-2.png", "/products/fusion-3.png"],
    },
  ];

  for (const product of products) {
    const category = categoryBySlug.get(product.categorySlug);
    if (!category) throw new Error(`Missing category ${product.categorySlug}`);
    const productSlug = slug(product.name);
    const discountPercent = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    await prisma.product.upsert({
      where: { slug: productSlug },
      update: {
        categoryId: category.id,
        price: product.price,
        mrp: product.mrp,
        isFeatured: product.isFeatured,
        isActive: true,
        description: product.description,
        shortDescription: product.shortDescription,
        discountPercent,
        imageUrls: product.imageUrls,
        stock: {
          upsert: {
            update: { quantity: product.quantity, lowStockThreshold: 5 },
            create: { quantity: product.quantity, lowStockThreshold: 5 },
          },
        },
      },
      create: {
        name: product.name,
        slug: productSlug,
        categoryId: category.id,
        price: product.price,
        mrp: product.mrp,
        isFeatured: product.isFeatured,
        description: product.description,
        shortDescription: product.shortDescription,
        discountPercent,
        imageUrls: product.imageUrls,
        stock: { create: { quantity: product.quantity, lowStockThreshold: 5 } },
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.coupon.upsert({
      where: { code: "NOIR10" },
      update: {
        isActive: true,
        type: "PERCENTAGE",
        value: 10,
        maxDiscount: 50000,
        minSubtotal: 100000,
        usageLimit: 100,
      },
      create: {
        code: "NOIR10",
        type: "PERCENTAGE",
        value: 10,
        maxDiscount: 50000,
        minSubtotal: 100000,
        usageLimit: 100,
        isActive: true,
      },
    });

    await tx.coupon.upsert({
      where: { code: "WELCOME150" },
      update: {
        isActive: true,
        type: "FIXED",
        value: 15000,
        minSubtotal: 100000,
        usageLimit: 200,
      },
      create: {
        code: "WELCOME150",
        type: "FIXED",
        value: 15000,
        minSubtotal: 100000,
        usageLimit: 200,
        isActive: true,
      },
    });

    await tx.upiPaymentSetting.updateMany({
      where: { NOT: { upiId: "9319758795@omni" } },
      data: { isActive: false },
    });

    await tx.upiPaymentSetting.upsert({
      where: { upiId: "9319758795@omni" },
      update: { displayName: "Noir Sane", isActive: true },
      create: {
        upiId: "9319758795@omni",
        displayName: "Noir Sane",
        isActive: true,
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
