import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestAdmins() {
  try {
    console.log("🔍 Creating test admin users...\n");

    const hashedPassword = await bcrypt.hash("Test123!", 12);

    // Create Test Supervisor
    try {
      const supervisor = await prisma.user.create({
        data: {
          email: "supervisor@nikahfirst.com",
          password: hashedPassword,
          name: "Test Supervisor",
          role: "SUPERVISOR",
          isVerified: true,
          emailVerified: true,
          redeemWallet: {
            create: {
              balance: 20,
              frozenBalance: 0,
              limit: 30,
              nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
          fundingWallet: {
            create: {
              balance: 100,
              frozenBalance: 0,
            },
          },
        },
      });
      console.log("✅ Supervisor created:", supervisor.email);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log("ℹ️  Supervisor already exists: supervisor@nikahfirst.com");
      } else {
        throw error;
      }
    }

    // Create Test Content Editor
    try {
      const contentEditor = await prisma.user.create({
        data: {
          email: "editor@nikahfirst.com",
          password: hashedPassword,
          name: "Test Content Editor",
          role: "CONTENT_EDITOR",
          isVerified: true,
          emailVerified: true,
          redeemWallet: {
            create: {
              balance: 10,
              frozenBalance: 0,
              limit: 20,
              nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
          fundingWallet: {
            create: {
              balance: 50,
              frozenBalance: 0,
            },
          },
        },
      });
      console.log("✅ Content Editor created:", contentEditor.email);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log("ℹ️  Content Editor already exists: editor@nikahfirst.com");
      } else {
        throw error;
      }
    }

    // Create Test Support Agent
    try {
      const supportAgent = await prisma.user.create({
        data: {
          email: "support@nikahfirst.com",
          password: hashedPassword,
          name: "Test Support Agent",
          role: "SUPPORT_AGENT",
          isVerified: true,
          emailVerified: true,
          redeemWallet: {
            create: {
              balance: 5,
              frozenBalance: 0,
              limit: 10,
              nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
          fundingWallet: {
            create: {
              balance: 20,
              frozenBalance: 0,
            },
          },
        },
      });
      console.log("✅ Support Agent created:", supportAgent.email);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log("ℹ️  Support Agent already exists: support@nikahfirst.com");
      } else {
        throw error;
      }
    }

    console.log("\n🎉 All test admin users ready!");
    console.log("\n📋 Test Accounts Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1️⃣  SUPER ADMIN (Full Access)");
    console.log("   📧 Email: superadmin@nikahfirst.com");
    console.log("   🔑 Password: SuperAdmin123!");
    console.log("   ✅ Can: Everything");
    console.log("");
    console.log("2️⃣  SUPERVISOR (Senior Moderator)");
    console.log("   📧 Email: supervisor@nikahfirst.com");
    console.log("   🔑 Password: Test123!");
    console.log("   ✅ Can: Ban users, Create admins, Approve profiles");
    console.log("   ❌ Cannot: Access global settings, View analytics");
    console.log("");
    console.log("3️⃣  CONTENT EDITOR (Moderator)");
    console.log("   📧 Email: editor@nikahfirst.com");
    console.log("   🔑 Password: Test123!");
    console.log("   ✅ Can: Approve profiles, Edit profiles");
    console.log("   ❌ Cannot: Ban users, Create admins, Access settings");
    console.log("");
    console.log("4️⃣  SUPPORT AGENT (Customer Service)");
    console.log("   📧 Email: support@nikahfirst.com");
    console.log("   🔑 Password: Test123!");
    console.log("   ✅ Can: Handle complaints, Mark refunds");
    console.log("   ❌ Cannot: Approve profiles, Ban users, Create admins");
    console.log("");
    console.log("5️⃣  REGULAR USER (Member)");
    console.log("   📧 Email: testuser@nikahfirst.com");
    console.log("   🔑 Password: Test123!");
    console.log("   ✅ Can: Access dashboard only");
    console.log("   ❌ Cannot: Access any admin routes");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error creating test admins:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmins();
