import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOTPExpired, OTP_CONFIG } from "@/lib/otp";
import { VerificationType } from "@prisma/client";

/**
 * POST /api/auth/verify-otp
 * Verify OTP code
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, type = "REGISTRATION" } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Normalize email and OTP
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.trim();

    // Find the OTP record
    const otpRecord = await prisma.emailVerification.findFirst({
      where: {
        email: normalizedEmail,
        type: type as VerificationType,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      // Delete expired OTP
      await prisma.emailVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= OTP_CONFIG.maxAttempts) {
      // Delete the OTP record after max attempts
      await prisma.emailVerification.delete({
        where: { id: otpRecord.id },
      });
      return NextResponse.json(
        {
          error:
            "Too many failed attempts. Please request a new verification code.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== normalizedOTP) {
      // Increment attempts
      await prisma.emailVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = OTP_CONFIG.maxAttempts - otpRecord.attempts - 1;
      return NextResponse.json(
        {
          error: `Invalid verification code. ${remainingAttempts} attempt${
            remainingAttempts !== 1 ? "s" : ""
          } remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid - mark as verified
    await prisma.emailVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // For registration type, we'll return a token that can be used in the final registration step
    // For other types, update the user record directly
    if (type === "REGISTRATION") {
      // Return success - the registration will be completed in the register endpoint
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        verified: true,
        email: normalizedEmail,
      });
    }

    // For password reset or email change, update user
    if (type === "PASSWORD_RESET" || type === "EMAIL_CHANGE") {
      // These will be handled by their respective endpoints
      return NextResponse.json({
        success: true,
        message: "Code verified successfully",
        verified: true,
        email: normalizedEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful",
      verified: true,
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
