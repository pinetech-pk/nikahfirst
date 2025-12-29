import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR", "SUPPORT_AGENT"];

// GET - List all transactions with filters
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const walletType = searchParams.get("walletType");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (walletType) {
      where.walletType = walletType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = end;
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { referenceType: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count and transactions
    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Get stats
    const stats = await prisma.transaction.groupBy({
      by: ["type"],
      _count: { id: true },
      _sum: { amount: true },
    });

    const typeStats = stats.reduce(
      (acc, stat) => {
        acc[stat.type] = {
          count: stat._count.id,
          totalAmount: stat._sum.amount || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; totalAmount: number }>
    );

    // Get wallet type stats
    const walletStats = await prisma.transaction.groupBy({
      by: ["walletType"],
      _count: { id: true },
      _sum: { amount: true },
    });

    const walletTypeStats = walletStats.reduce(
      (acc, stat) => {
        acc[stat.walletType] = {
          count: stat._count.id,
          totalAmount: stat._sum.amount || 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; totalAmount: number }>
    );

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        byType: typeStats,
        byWalletType: walletTypeStats,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
