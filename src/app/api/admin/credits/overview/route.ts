import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/credits/overview
 * Fetch overview data for credits & wallets admin page
 * Only SUPER_ADMIN and SUPERVISOR can access this endpoint
 */
export async function GET() {
  try {
    // Check authentication and permissions - SUPER_ADMIN and SUPERVISOR only
    await requireSupervisor();

    // Fetch all regular users with their wallet balances
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscription: true,
        fundingWallet: {
          select: {
            balance: true,
          },
        },
        redeemWallet: {
          select: {
            balance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to 100 users for performance
    });

    // Transform users data
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      subscription: user.subscription,
      fundingBalance: user.fundingWallet?.balance ?? 0,
      redeemBalance: user.redeemWallet?.balance ?? 0,
    }));

    // Calculate stats
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Get total funding wallet credits
    const fundingWalletStats = await prisma.fundingWallet.aggregate({
      _sum: {
        balance: true,
      },
    });

    // Get total redeem wallet credits
    const redeemWalletStats = await prisma.redeemWallet.aggregate({
      _sum: {
        balance: true,
      },
    });

    // Count users with any credits
    const usersWithFunding = await prisma.fundingWallet.count({
      where: {
        balance: {
          gt: 0,
        },
      },
    });

    const usersWithRedeem = await prisma.redeemWallet.count({
      where: {
        balance: {
          gt: 0,
        },
      },
    });

    const stats = {
      totalUsers,
      totalFundingCredits: fundingWalletStats._sum.balance ?? 0,
      totalRedeemCredits: redeemWalletStats._sum.balance ?? 0,
      usersWithCredits: Math.max(usersWithFunding, usersWithRedeem),
    };

    return NextResponse.json({
      stats,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching credits overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits overview" },
      { status: 500 }
    );
  }
}
