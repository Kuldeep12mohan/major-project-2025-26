import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Admin...");

  const email = "admin@example.com";
  const password = "admin123";
  const name = "Super Admin";
  const adminId = "ADM001";

  // Check if admin exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "ADMIN" },
  });

  await prisma.adminProfile.create({
    data: { userId: user.id, adminId },
  });

  console.log("✅ Admin seeded successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
