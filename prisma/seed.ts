import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if Super Admin already exists
  const superAdminExists = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!superAdminExists) {
    // Create the first Super Admin
    const hashedPassword = await bcrypt.hash("SuperAdmin123!", 12);

    const superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@nikahfirst.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        isVerified: true,
        emailVerified: true,
        redeemWallet: {
          create: {
            balance: 100,
            limit: 100,
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        fundingWallet: {
          create: {
            balance: 1000,
          },
        },
      },
    });

    console.log("✅ Super Admin created:", superAdmin.email);
    console.log("📧 Email: superadmin@nikahfirst.com");
    console.log("🔑 Password: SuperAdmin123!");
    console.log("⚠️  CHANGE THIS PASSWORD IMMEDIATELY!");
  } else {
    console.log("Super Admin already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
