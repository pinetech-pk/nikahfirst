import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FREE_TIER, BCRYPT } from "@/config/constants";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT.SALT_ROUNDS);

    // Create user with wallets
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
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
    });

    return NextResponse.json({
      message: "User created successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
