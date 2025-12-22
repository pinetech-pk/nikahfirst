import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * POST /api/admin/credits/adjust
 * Adjust wallet balances and limits (Super Admin / Supervisor only)
 *
 * Supports:
 * - Setting funding wallet balance
 * - Setting redeem wallet balance
 * - Setting redeem wallet limit
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Only SUPER_ADMIN and SUPERVISOR can adjust wallets
    const allowedRoles = ["SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user?.id;
    const adminName = session.user?.name || session.user?.email;

    const body = await req.json();
    const { userId, walletType, newBalance, newLimit, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!walletType || !["FUNDING", "REDEEM"].includes(walletType)) {
      return NextResponse.json(
        { error: "Valid wallet type (FUNDING or REDEEM) is required" },
        { status: 400 }
      );
    }

    // Validate new balance
    if (newBalance !== undefined && (typeof newBalance !== "number" || newBalance < 0)) {
      return NextResponse.json(
        { error: "Balance must be a non-negative number" },
        { status: 400 }
      );
    }

    // Validate new limit (only for REDEEM wallet)
    if (walletType === "REDEEM" && newLimit !== undefined) {
      if (typeof newLimit !== "number" || newLimit < 0) {
        return NextResponse.json(
          { error: "Limit must be a non-negative number" },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        fundingWallet: {
          select: { id: true, balance: true },
        },
        redeemWallet: {
          select: { id: true, balance: true, limit: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Perform the adjustment in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (walletType === "FUNDING") {
        // Get current balance
        let fundingWallet = user.fundingWallet;
        const previousBalance = fundingWallet?.balance ?? 0;

        // Create funding wallet if it doesn't exist
        if (!fundingWallet && newBalance !== undefined) {
          fundingWallet = await tx.fundingWallet.create({
            data: {
              userId: userId,
              balance: newBalance,
              totalPurchased: 0,
              totalSpent: 0,
            },
          });
        } else if (newBalance !== undefined) {
          // Update the funding wallet balance
          fundingWallet = await tx.fundingWallet.update({
            where: { userId: userId },
            data: { balance: newBalance },
          });
        }

        // Calculate the difference for transaction record
        const balanceDiff = (newBalance ?? 0) - previousBalance;

        // Create transaction record for audit
        if (balanceDiff !== 0) {
          const description = reason
            ? `Admin adjustment: ${reason} (by ${adminName})`
            : `Admin balance adjustment (by ${adminName})`;

          await tx.transaction.create({
            data: {
              userId: userId,
              type: balanceDiff > 0 ? "CREDIT" : "DEBIT",
              walletType: "FUNDING",
              amount: Math.abs(balanceDiff),
              description: description,
            },
          });
        }

        return {
          walletType: "FUNDING",
          previousBalance,
          newBalance: fundingWallet?.balance ?? newBalance,
        };
      } else {
        // REDEEM wallet
        let redeemWallet = user.redeemWallet;
        const previousBalance = redeemWallet?.balance ?? 0;
        const previousLimit = redeemWallet?.limit ?? 0;

        // Prepare update data
        const updateData: { balance?: number; limit?: number } = {};
        if (newBalance !== undefined) updateData.balance = newBalance;
        if (newLimit !== undefined) updateData.limit = newLimit;

        // Create redeem wallet if it doesn't exist
        if (!redeemWallet) {
          redeemWallet = await tx.redeemWallet.create({
            data: {
              userId: userId,
              balance: newBalance ?? 0,
              limit: newLimit ?? 50,
              totalEarned: 0,
              totalSpent: 0,
              lastResetAt: new Date(),
            },
          });
        } else if (Object.keys(updateData).length > 0) {
          // Update the redeem wallet
          redeemWallet = await tx.redeemWallet.update({
            where: { userId: userId },
            data: updateData,
          });
        }

        // Create transaction record for balance changes
        if (newBalance !== undefined) {
          const balanceDiff = newBalance - previousBalance;
          if (balanceDiff !== 0) {
            const description = reason
              ? `Admin adjustment: ${reason} (by ${adminName})`
              : `Admin balance adjustment (by ${adminName})`;

            await tx.transaction.create({
              data: {
                userId: userId,
                type: balanceDiff > 0 ? "CREDIT" : "DEBIT",
                walletType: "REDEEM",
                amount: Math.abs(balanceDiff),
                description: description,
              },
            });
          }
        }

        return {
          walletType: "REDEEM",
          previousBalance,
          newBalance: redeemWallet?.balance,
          previousLimit,
          newLimit: redeemWallet?.limit,
        };
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted ${user.name || user.email}'s ${walletType.toLowerCase()} wallet`,
      data: {
        userId: user.id,
        userName: user.name || user.email,
        ...result,
      },
    });
  } catch (error) {
    console.error("Error adjusting wallet:", error);
    return NextResponse.json(
      { error: "Failed to adjust wallet" },
      { status: 500 }
    );
  }
}
