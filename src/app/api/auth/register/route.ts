import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { FREE_TIER, BCRYPT } from "@/config/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        from: "NikahFirst <onboarding@resend.dev>",
        to: normalizedEmail,
        subject: "Welcome to NikahFirst!",
        html: getWelcomeEmailHTML(name),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
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

function getWelcomeEmailHTML(name: string | undefined): string {
  const greeting = name ? `Assalamu Alaikum ${name}` : "Assalamu Alaikum";
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nikahfirst.com";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #16a34a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">NikahFirst</h1>
      </div>

      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #16a34a; margin-top: 0;">Welcome to NikahFirst!</h2>

        <p>${greeting},</p>

        <p>We're thrilled to have you join the NikahFirst community! Your email has been verified, and your account is now active.</p>

        <p>NikahFirst is dedicated to helping Muslims find their life partner in a halal, respectful, and privacy-conscious environment.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}/login" style="background-color: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
        </div>

        <p><strong>What's next?</strong></p>
        <ol style="color: #4b5563;">
          <li>Complete your profile with accurate information</li>
          <li>Add photos to increase your visibility</li>
          <li>Start browsing and connecting with potential matches</li>
        </ol>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          NikahFirst - Find Your Perfect Match<br>
          Need help? Contact us at support@nikahfirst.com
        </p>
      </div>
    </body>
    </html>
  `;
}
