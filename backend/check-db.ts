import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const productsCount = await prisma.product.count();
  const stocksCount = await prisma.stock.count();
  const categoriesCount = await prisma.category.count();
  const usersCount = await prisma.user.count();
  
  console.log({
    productsCount,
    stocksCount,
    categoriesCount,
    usersCount
  });

  const stocks = await prisma.stock.findMany({
    include: { product: true },
    take: 5
  });
  console.log("Sample Stocks:", JSON.stringify(stocks, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
