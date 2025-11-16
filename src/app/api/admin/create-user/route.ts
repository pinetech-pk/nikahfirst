import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { email, password, name, role } = await req.json();

    // Validate role creation hierarchy
    const canCreate = {
      SUPER_ADMIN: ["ADMIN"],
      ADMIN: ["MODERATOR", "SUPPORT_AGENT"],
    };

    const allowedRoles =
      canCreate[currentUser.role as keyof typeof canCreate] || [];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `You cannot create a ${role} account` },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create the new admin user
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isVerified: true,
        redeemWallet: {
          create: {
            balance: 10,
            limit: 20,
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        fundingWallet: {
          create: {
            balance: 0,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role} account created successfully`,
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
