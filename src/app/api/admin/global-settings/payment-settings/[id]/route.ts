import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/global-settings/payment-settings/[id]
 * Get a single payment setting
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const setting = await prisma.paymentSetting.findUnique({
      where: { id },
    });

    if (!setting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error fetching payment setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment setting" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/global-settings/payment-settings/[id]
 * Update a payment setting
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if setting exists
    const existing = await prisma.paymentSetting.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    const setting = await prisma.paymentSetting.update({
      where: { id },
      data: {
        label: body.label,
        instructions: body.instructions,
        accountTitle: body.accountTitle,
        accountNumber: body.accountNumber,
        bankName: body.bankName,
        branchCode: body.branchCode,
        iban: body.iban,
        mobileNumber: body.mobileNumber,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error updating payment setting:", error);
    return NextResponse.json(
      { error: "Failed to update payment setting" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/payment-settings/[id]
 * Delete a payment setting
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if setting exists
    const setting = await prisma.paymentSetting.findUnique({
      where: { id },
    });

    if (!setting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    await prisma.paymentSetting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment setting:", error);
    return NextResponse.json(
      { error: "Failed to delete payment setting" },
      { status: 500 }
    );
  }
}
