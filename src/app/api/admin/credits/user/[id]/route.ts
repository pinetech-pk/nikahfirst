import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/credits/user/[id]
 * Fetch user data with wallet information and recent transactions
 * Only SUPER_ADMIN and SUPERVISOR can access this endpoint
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and permissions - SUPER_ADMIN and SUPERVISOR only
    await requireSupervisor();

    const { id } = await params;

    // Fetch user with wallet information
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: true,
        fundingWallet: {
          select: {
            id: true,
            balance: true,
            totalPurchased: true,
            totalSpent: true,
          },
        },
        redeemWallet: {
          select: {
            id: true,
            balance: true,
            limit: true,
            lastRedeemed: true,
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

    // Fetch recent credit transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: id,
        type: {
          in: ["CREDIT", "BONUS", "PURCHASE"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        type: true,
        walletType: true,
        amount: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching user credits data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
