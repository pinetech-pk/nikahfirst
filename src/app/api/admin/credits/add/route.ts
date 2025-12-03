import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * POST /api/admin/credits/add
 * Add credits to a user's funding wallet
 * Only SUPER_ADMIN and SUPERVISOR can access this endpoint
 */
export async function POST(req: Request) {
  try {
    // Check authentication and permissions - SUPER_ADMIN and SUPERVISOR only
    const session = await requireSupervisor();
    const adminId = session.user?.id;
    const adminName = session.user?.name || session.user?.email;

    const body = await req.json();

    // Validate required fields
    const { userId, amount, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid positive amount is required" },
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        { error: "Amount cannot exceed 10,000 credits per transaction" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        fundingWallet: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let fundingWallet = user.fundingWallet;

      // Create funding wallet if it doesn't exist
      if (!fundingWallet) {
        fundingWallet = await tx.fundingWallet.create({
          data: {
            userId: userId,
            balance: 0,
            totalPurchased: 0,
            totalSpent: 0,
          },
        });
      }

      // Update the funding wallet balance
      const updatedWallet = await tx.fundingWallet.update({
        where: { userId: userId },
        data: {
          balance: {
            increment: amount,
          },
          totalPurchased: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      const description = reason
        ? `Admin credit: ${reason} (by ${adminName})`
        : `Admin credit addition (by ${adminName})`;

      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          type: "CREDIT",
          walletType: "FUNDING",
          amount: amount,
          description: description,
        },
      });

      return {
        wallet: updatedWallet,
        transaction: transaction,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${amount} credits to ${user.name || user.email}'s funding wallet`,
      data: {
        userId: user.id,
        userName: user.name || user.email,
        newBalance: result.wallet.balance,
        creditsAdded: amount,
        transactionId: result.transaction.id,
      },
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
