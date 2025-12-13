import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, emailConfig } from "@/lib/resend";
import { generateOTP, getOTPExpiry, OTP_CONFIG } from "@/lib/otp";
import { OTPVerificationEmail } from "@/emails";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/send-otp
 * Send OTP to email for verification
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type = "REGISTRATION", name } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // FIRST: Check if user already exists (before any other operations)
    // This is the primary validation for registration
    if (type === "REGISTRATION") {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login instead." },
          { status: 409 } // 409 Conflict is more appropriate
        );
      }
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: type as VerificationType,
        createdAt: {
          gte: new Date(Date.now() - OTP_CONFIG.cooldownMinutes * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOTP) {
      const waitTime = Math.ceil(
        (OTP_CONFIG.cooldownMinutes * 60 * 1000 -
          (Date.now() - recentOTP.createdAt.getTime())) /
          1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitTime} seconds before requesting a new code`,
          waitTime,
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry(OTP_CONFIG.expiryMinutes);

    // Delete any existing unverified OTPs for this email and type
    await prisma.emailVerification.deleteMany({
      where: {
        email: normalizedEmail,
        type: type as VerificationType,
        verified: false,
      },
    });

    // Create new OTP record
    await prisma.emailVerification.create({
      data: {
        email: normalizedEmail,
        otp,
        type: type as VerificationType,
        expiresAt,
      },
    });

    // Send email via Resend
    const emailType =
      type === "REGISTRATION"
        ? "registration"
        : type === "PASSWORD_RESET"
        ? "password_reset"
        : "email_change";

    const { error: emailError } = await resend.emails.send({
      from: emailConfig.from,
      to: normalizedEmail,
      subject: getEmailSubject(emailType),
      react: OTPVerificationEmail({
        otp,
        name,
        type: emailType,
        expiresInMinutes: OTP_CONFIG.expiryMinutes,
      }),
    });

    if (emailError) {
      console.error("Error sending OTP email:", emailError);
      // Delete the OTP record if email fails
      await prisma.emailVerification.deleteMany({
        where: { email: normalizedEmail, otp },
      });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      expiresIn: OTP_CONFIG.expiryMinutes * 60, // in seconds
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case "registration":
      return "Verify your email - NikahFirst";
    case "password_reset":
      return "Reset your password - NikahFirst";
    case "email_change":
      return "Verify your new email - NikahFirst";
    default:
      return "Verification Code - NikahFirst";
  }
}
