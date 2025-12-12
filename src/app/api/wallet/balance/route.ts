import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wallet/balance
 * Get current user's wallet balances
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [fundingWallet, redeemWallet] = await Promise.all([
      prisma.fundingWallet.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.redeemWallet.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const fundingBalance = fundingWallet?.balance || 0;
    const redeemBalance = redeemWallet?.balance || 0;

    return NextResponse.json({
      fundingBalance,
      redeemBalance,
      totalCredits: fundingBalance + redeemBalance,
      fundingWallet: fundingWallet
        ? {
            balance: fundingWallet.balance,
            totalPurchased: fundingWallet.totalPurchased,
            totalSpent: fundingWallet.totalSpent,
          }
        : null,
      redeemWallet: redeemWallet
        ? {
            balance: redeemWallet.balance,
            limit: redeemWallet.limit,
            nextRedemption: redeemWallet.nextRedemption,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}
