import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/transactions
 * Get current user's transaction history
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // Filter by transaction type
    const walletType = searchParams.get("walletType"); // Filter by wallet type

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (walletType) {
      where.walletType = walletType;
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Get summary statistics
    const stats = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId: session.user.id },
      _sum: { amount: true },
      _count: true,
    });

    // Calculate totals
    const summary = {
      totalCredits: 0,
      totalDebits: 0,
      totalTopUps: 0,
      totalPurchases: 0,
      totalRedemptions: 0,
    };

    stats.forEach((stat: { type: string; _sum: { amount: number | null }; _count: number }) => {
      const amount = stat._sum.amount || 0;
      switch (stat.type) {
        case "CREDIT":
        case "TOP_UP":
        case "BONUS":
        case "REFUND":
          summary.totalCredits += amount;
          break;
        case "DEBIT":
        case "PURCHASE":
          summary.totalDebits += amount;
          break;
      }

      if (stat.type === "TOP_UP") {
        summary.totalTopUps = stat._count;
      }
      if (stat.type === "PURCHASE") {
        summary.totalPurchases = stat._count;
      }
      if (stat.type === "REDEMPTION") {
        summary.totalRedemptions = stat._count;
      }
    });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
