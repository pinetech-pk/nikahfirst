import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Generate unique request number
 * Format: TXN-YYYY-XXXXX (e.g., TXN-2024-00001)
 */
async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;

  // Find the last request number for this year
  const lastRequest = await prisma.topUpRequest.findFirst({
    where: {
      requestNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      requestNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestNumber.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
}

/**
 * GET /api/topup
 * Get current user's top-up requests
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.topUpRequest.findMany({
      where: { userId: session.user.id },
      include: {
        package: {
          select: {
            name: true,
            credits: true,
            bonusCredits: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching top-up requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/topup
 * Create a new top-up request
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, paymentMethod } = body;

    // Validate required fields
    if (!packageId || !paymentMethod) {
      return NextResponse.json(
        { error: "Package and payment method are required" },
        { status: 400 }
      );
    }

    // Check if package exists and is active
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
    });

    if (!creditPackage) {
      return NextResponse.json(
        { error: "Invalid package selected" },
        { status: 400 }
      );
    }

    if (!creditPackage.isActive) {
      return NextResponse.json(
        { error: "This package is no longer available" },
        { status: 400 }
      );
    }

    // Check if payment method is active
    const paymentSetting = await prisma.paymentSetting.findFirst({
      where: {
        method: paymentMethod,
        isActive: true,
      },
    });

    if (!paymentSetting) {
      return NextResponse.json(
        { error: "Invalid or inactive payment method" },
        { status: 400 }
      );
    }

    // Check for existing pending request (optional: prevent duplicate requests)
    const existingPending = await prisma.topUpRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error:
            "You already have a pending top-up request. Please wait for it to be processed or cancel it.",
        },
        { status: 400 }
      );
    }

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // Create the top-up request
    const topUpRequest = await prisma.topUpRequest.create({
      data: {
        requestNumber,
        userId: session.user.id,
        packageId,
        credits: creditPackage.credits,
        bonusCredits: creditPackage.bonusCredits,
        amount: creditPackage.price,
        paymentMethod,
        status: "PENDING",
      },
      include: {
        package: {
          select: {
            name: true,
            credits: true,
            bonusCredits: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        request: topUpRequest,
        paymentInstructions: paymentSetting.instructions,
        paymentDetails: {
          method: paymentSetting.method,
          label: paymentSetting.label,
          accountTitle: paymentSetting.accountTitle,
          accountNumber: paymentSetting.accountNumber,
          bankName: paymentSetting.bankName,
          iban: paymentSetting.iban,
          mobileNumber: paymentSetting.mobileNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating top-up request:", error);
    return NextResponse.json(
      { error: "Failed to create top-up request" },
      { status: 500 }
    );
  }
}
