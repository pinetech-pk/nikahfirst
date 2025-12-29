import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR", "SUPPORT_AGENT"];

// GET - Get single transaction details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || !ADMIN_ROLES.includes(adminUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            subscription: true,
            createdAt: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Get related transactions for the same user (recent ones)
    const relatedTransactions = await prisma.transaction.findMany({
      where: {
        userId: transaction.userId,
        id: { not: transaction.id },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        walletType: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    });

    // Get user wallet balances
    const [fundingWallet, redeemWallet] = await Promise.all([
      prisma.fundingWallet.findUnique({
        where: { userId: transaction.userId },
        select: { balance: true, totalPurchased: true, totalSpent: true },
      }),
      prisma.redeemWallet.findUnique({
        where: { userId: transaction.userId },
        select: { balance: true, limit: true },
      }),
    ]);

    return NextResponse.json({
      transaction,
      relatedTransactions,
      walletInfo: {
        funding: fundingWallet,
        redeem: redeemWallet,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transaction (Super Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Super Admin can delete transactions
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only Super Admin can delete transactions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        amount: true,
        walletType: true,
        userId: true,
        description: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Delete the transaction
    // Note: This is a soft operation - it only removes the transaction record
    // It does NOT reverse/refund the credits as that could cause data inconsistency
    // If a refund is needed, a new REFUND transaction should be created instead
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
      deletedTransaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
      },
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
