import { PrismaClient } from "@prisma/client";
import { BLOGS } from "../src/utils/seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.blogs.deleteMany();
  await prisma.blogs.createMany({
    data: BLOGS,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed blogs:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
