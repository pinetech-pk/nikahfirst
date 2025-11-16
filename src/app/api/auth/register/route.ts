import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with wallets
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        redeemWallet: {
          create: {
            balance: 3, // Free tier initial credits
            limit: 5, // Free tier limit
            nextRedemption: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
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
