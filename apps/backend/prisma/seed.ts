import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashed,
    },
  });
  console.log("Seed complete: test@example.com / password123");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
