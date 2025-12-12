import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/payment-settings
 * Fetch all payment settings
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.paymentSetting.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/payment-settings
 * Create a new payment setting
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      method,
      label,
      instructions,
      accountTitle,
      accountNumber,
      bankName,
      branchCode,
      iban,
      mobileNumber,
      isActive,
      sortOrder,
    } = body;

    // Validate required fields
    if (!method || !label || !instructions) {
      return NextResponse.json(
        { error: "Method, label, and instructions are required" },
        { status: 400 }
      );
    }

    // Check if method already exists
    const existing = await prisma.paymentSetting.findUnique({
      where: { method },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A setting for this payment method already exists" },
        { status: 400 }
      );
    }

    const setting = await prisma.paymentSetting.create({
      data: {
        method,
        label,
        instructions,
        accountTitle: accountTitle || null,
        accountNumber: accountNumber || null,
        bankName: bankName || null,
        branchCode: branchCode || null,
        iban: iban || null,
        mobileNumber: mobileNumber || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ setting }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment setting:", error);
    return NextResponse.json(
      { error: "Failed to create payment setting" },
      { status: 500 }
    );
  }
}
