import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry, OTP_CONFIG } from "@/lib/otp";
import { VerificationType } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (type === "REGISTRATION") {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser && existingUser.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login instead." },
          { status: 409 }
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
        { error: `Please wait ${waitTime} seconds before requesting a new code`, waitTime },
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

    // Send email via Resend with simple HTML
    const { error: emailError } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NikahFirst <noreply@contact.nikahfirst.com>",
      to: normalizedEmail,
      subject: getEmailSubject(type),
      html: getOTPEmailHTML(otp, name, type, OTP_CONFIG.expiryMinutes),
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
      expiresIn: OTP_CONFIG.expiryMinutes * 60,
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case "REGISTRATION":
      return "Verify your email - NikahFirst";
    case "PASSWORD_RESET":
      return "Reset your password - NikahFirst";
    case "EMAIL_CHANGE":
      return "Verify your new email - NikahFirst";
    default:
      return "Verification Code - NikahFirst";
  }
}

function getOTPEmailHTML(otp: string, name: string | undefined, type: string, expiryMinutes: number): string {
  const greeting = name ? `Assalamu Alaikum ${name}` : "Assalamu Alaikum";

  let description = "Please use the verification code below to complete your registration.";
  if (type === "PASSWORD_RESET") {
    description = "Please use the verification code below to reset your password.";
  } else if (type === "EMAIL_CHANGE") {
    description = "Please use the verification code below to verify your new email address.";
  }

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
        <p style="margin-bottom: 20px;">${greeting},</p>

        <p style="margin-bottom: 20px;">${description}</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px;">${otp}</span>
        </div>

        <p style="margin-bottom: 20px;">This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>

        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          NikahFirst - Find Your Perfect Match<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    </body>
    </html>
  `;
}
