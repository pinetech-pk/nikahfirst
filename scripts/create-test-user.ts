import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("🔍 Creating test regular user...\n");

    const hashedPassword = await bcrypt.hash("Test123!", 12);

    const testUser = await prisma.user.create({
      data: {
        email: "testuser@nikahfirst.com",
        password: hashedPassword,
        name: "Test User",
        role: "USER", // Regular user, not admin
        isVerified: true,
        emailVerified: true,
        redeemWallet: {
          create: {
            balance: 3,
            frozenBalance: 0,
            limit: 5,
            nextRedemption: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          },
        },
        fundingWallet: {
          create: {
            balance: 0,
            frozenBalance: 0,
          },
        },
      },
    });

    console.log("✅ Test user created successfully!");
    console.log("📧 Email: testuser@nikahfirst.com");
    console.log("🔑 Password: Test123!");
    console.log("👤 Role: USER (regular member)\n");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.log("✅ Test user already exists!");
      console.log("📧 Email: testuser@nikahfirst.com");
      console.log("🔑 Password: Test123!\n");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
