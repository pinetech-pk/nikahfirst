import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { canCreateRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT } from "@/config/constants";

export async function POST(req: Request) {
  try {
    // Require supervisor or higher (uses our new auth middleware!)
    const session = await requireSupervisor();
    const currentUserRole = session?.user?.role as UserRole;

    const body = await req.json();
    const { email, name, phone, role, department, password } = body;

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, name, and role are required" },
        { status: 400 }
      );
    }

    // Validate that current user can create this role
    if (!canCreateRole(currentUserRole, role as UserRole)) {
      return NextResponse.json(
        { error: `You do not have permission to create ${role} accounts` },
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

    // Generate password if not provided
    const userPassword = password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(userPassword, BCRYPT.SALT_ROUNDS);

    // Create the new admin user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: role as UserRole,
        status: "ACTIVE",
        isVerified: true,
        emailVerified: true,
        // Admin users get higher credit limits
        redeemWallet: {
          create: {
            balance: 10,
            limit: 50,
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        fundingWallet: {
          create: {
            balance: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role} account created successfully`,
      user: newUser,
      // Return password only if it was auto-generated
      ...(password ? {} : { generatedPassword: userPassword }),
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one of each required character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
