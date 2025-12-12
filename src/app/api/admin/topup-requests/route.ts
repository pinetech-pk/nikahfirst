import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/topup-requests
 * Get all top-up requests (for Supervisor/Super Admin)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["SUPERVISOR", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status: status as string } : {};

    const [requests, stats] = await Promise.all([
      prisma.topUpRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          package: {
            select: {
              name: true,
              credits: true,
              bonusCredits: true,
              price: true,
            },
          },
          processor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Get stats
      prisma.topUpRequest.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    // Format stats
    const formattedStats = {
      pending: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      total: 0,
    };

    stats.forEach((stat: { status: string; _count: { status: number } }) => {
      const count = stat._count.status;
      formattedStats.total += count;
      switch (stat.status) {
        case "PENDING":
          formattedStats.pending = count;
          break;
        case "COMPLETED":
          formattedStats.completed = count;
          break;
        case "REJECTED":
          formattedStats.rejected = count;
          break;
        case "CANCELLED":
          formattedStats.cancelled = count;
          break;
      }
    });

    return NextResponse.json({
      requests,
      stats: formattedStats,
    });
  } catch (error) {
    console.error("Error fetching top-up requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up requests" },
      { status: 500 }
    );
  }
}
