import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyPhoneVerificationRequest } from "@/lib/notifications";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET - Get current phone verification status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's phone and verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        phone: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get pending verification request if any
    const pendingVerification = await prisma.phoneVerification.findFirst({
      where: {
        userId: session.user.id,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phone: true,
        expiresAt: true,
        requestedAt: true,
      },
    });

    return NextResponse.json({
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      pendingVerification: pendingVerification
        ? {
            id: pendingVerification.id,
            phone: pendingVerification.phone,
            expiresAt: pendingVerification.expiresAt,
            requestedAt: pendingVerification.requestedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching phone verification status:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}

// POST - Request phone verification (generate OTP)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current phone
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.phone) {
      return NextResponse.json(
        { error: "Please add a phone number first" },
        { status: 400 }
      );
    }

    if (user.phoneVerified) {
      return NextResponse.json(
        { error: "Phone number is already verified" },
        { status: 400 }
      );
    }

    // Check for existing pending verification (rate limiting)
    const existingVerification = await prisma.phoneVerification.findFirst({
      where: {
        userId: user.id,
        verified: false,
        expiresAt: { gt: new Date() },
        // Can only request once every 30 minutes
        requestedAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });

    if (existingVerification) {
      const waitTime = Math.ceil(
        (existingVerification.requestedAt.getTime() + 30 * 60 * 1000 - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitTime} minutes before requesting again`,
          waitTime,
          existingRequest: {
            expiresAt: existingVerification.expiresAt,
            requestedAt: existingVerification.requestedAt,
          },
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Create verification record with 24-hour expiry
    const verification = await prisma.phoneVerification.create({
      data: {
        userId: user.id,
        phone: user.phone,
        otp,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send notification to admins
    await notifyPhoneVerificationRequest({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      phone: user.phone,
      otp,
    });

    return NextResponse.json({
      success: true,
      message: "Verification request submitted. Our team will contact you within 24 hours.",
      verification: {
        id: verification.id,
        phone: verification.phone,
        expiresAt: verification.expiresAt,
        requestedAt: verification.requestedAt,
      },
    });
  } catch (error) {
    console.error("Error requesting phone verification:", error);
    return NextResponse.json(
      { error: "Failed to request verification" },
      { status: 500 }
    );
  }
}

// PUT - Verify OTP
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otp } = body;

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code" },
        { status: 400 }
      );
    }

    // Find pending verification
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        userId: session.user.id,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No pending verification found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check attempts (max 5)
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (verification.otp !== otp) {
      // Increment attempts
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = 5 - verification.attempts - 1;
      return NextResponse.json(
        {
          error: `Invalid code. ${remainingAttempts} attempts remaining.`,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is correct - update verification and user
    await prisma.$transaction([
      // Mark verification as verified
      prisma.phoneVerification.update({
        where: { id: verification.id },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      }),
      // Update user's phone verification status
      prisma.user.update({
        where: { id: session.user.id },
        data: { phoneVerified: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    return NextResponse.json(
      { error: "Failed to verify phone number" },
      { status: 500 }
    );
  }
}
