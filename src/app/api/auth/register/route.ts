import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { FREE_TIER, BCRYPT } from "@/config/constants";
import { resend, emailConfig } from "@/lib/resend";
import { WelcomeEmail } from "@/emails";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Check if email was verified via OTP
    const verifiedOTP = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: "REGISTRATION",
        verified: true,
        // OTP verification should be recent (within 30 minutes)
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOTP) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT.SALT_ROUNDS);

    // If user exists but not verified, update them
    // Otherwise create new user
    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: name || null,
          emailVerified: true,
          isVerified: true,
        },
      });
    } else {
      // Create new user with wallets
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name || null,
          emailVerified: true,
          isVerified: true,
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
    }

    // Clean up used OTP records
    await prisma.emailVerification.deleteMany({
      where: {
        email: normalizedEmail,
        type: "REGISTRATION",
      },
    });

    // Send welcome email (don't block registration if this fails)
    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: normalizedEmail,
        subject: "Welcome to NikahFirst!",
        react: WelcomeEmail({
          name: name || undefined,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://nikahfirst.com"}/login`,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if welcome email fails
    }

    return NextResponse.json({
      message: "Account created successfully",
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
