import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

// Type for user data returned from Prisma query
interface UserWithProfiles {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  subscription: string;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: {
    profiles: number;
  };
}

/**
 * GET /api/admin/users/regular
 * Fetch all regular users (role = USER) with stats
 */
export async function GET() {
  try {
    // Check authentication and permissions
    await requireAdmin();

    // Get current date boundaries
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch stats in parallel
    const [
      totalUsers,
      activeToday,
      premiumUsers,
      newThisMonth,
      users,
    ] = await Promise.all([
      // Total regular users
      prisma.user.count({
        where: { role: "USER" },
      }),
      // Active today (logged in today)
      prisma.user.count({
        where: {
          role: "USER",
          lastLoginAt: {
            gte: startOfToday,
          },
        },
      }),
      // Premium users (non-FREE subscription)
      prisma.user.count({
        where: {
          role: "USER",
          subscription: {
            not: "FREE",
          },
        },
      }),
      // New this month
      prisma.user.count({
        where: {
          role: "USER",
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      // Fetch user list with profile count
      prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subscription: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              profiles: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Format users for the response
    const formattedUsers = (users as UserWithProfiles[]).map((user) => ({
      id: user.id,
      name: user.name || "No name",
      email: user.email,
      phone: user.phone || "Not set",
      subscription: user.subscription,
      profiles: user._count.profiles,
      joined: user.createdAt,
      lastActive: user.lastLoginAt,
      status: user.status,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        activeToday,
        premiumUsers,
        newThisMonth,
      },
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching regular users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
