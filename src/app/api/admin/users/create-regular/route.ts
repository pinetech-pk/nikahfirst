import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { canCreateRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus, SubscriptionTier } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT, FREE_TIER } from "@/config/constants";

export async function POST(req: Request) {
  try {
    // Require supervisor or higher
    const session = await requireSupervisor();
    const currentUserRole = session?.user?.role as UserRole;

    const body = await req.json();
    const {
      email,
      name,
      phone,
      status,
      subscription,
      isVerified,
      emailVerified,
      phoneVerified,
      password,
    } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing required fields: email and name are required" },
        { status: 400 }
      );
    }

    // Validate that current user can create USER role
    if (!canCreateRole(currentUserRole, "USER")) {
      return NextResponse.json(
        { error: "You do not have permission to create user accounts" },
        { status: 403 }
      );
    }

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if user already exists by phone (if phone is provided)
    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: "User with this phone number already exists" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    const validStatuses: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];
    const userStatus: UserStatus = status && validStatuses.includes(status)
      ? status
      : "ACTIVE";

    // Validate subscription if provided
    const validSubscriptions: SubscriptionTier[] = [
      "FREE", "STANDARD", "SILVER", "GOLD", "PLATINUM", "PRO"
    ];
    const userSubscription: SubscriptionTier = subscription && validSubscriptions.includes(subscription)
      ? subscription
      : "FREE";

    // Generate password if not provided
    const userPassword = password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(userPassword, BCRYPT.SALT_ROUNDS);

    // Create the new regular user with wallets
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "USER",
        status: userStatus,
        subscription: userSubscription,
        isVerified: isVerified || false,
        emailVerified: emailVerified || false,
        phoneVerified: phoneVerified || false,
        // Create wallets for the user
        redeemWallet: {
          create: {
            balance: FREE_TIER.INITIAL_CREDITS,
            limit: FREE_TIER.CREDIT_LIMIT,
            nextRedemption: new Date(Date.now() + FREE_TIER.REDEMPTION_WINDOW_MS),
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
        phone: true,
        role: true,
        status: true,
        subscription: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User account created successfully",
      user: newUser,
      // Return password only if it was auto-generated
      ...(password ? {} : { generatedPassword: userPassword }),
    });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user account" },
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
