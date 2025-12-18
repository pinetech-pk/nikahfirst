import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users/admins
 * Fetch all admin users (non-USER roles) with stats
 */
export async function GET() {
  try {
    // Check authentication and permissions
    await requireSupervisor();

    // Fetch admin role counts
    const [
      superAdminCount,
      supervisorCount,
      contentEditorCount,
      supportAgentCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
      prisma.user.count({ where: { role: "SUPERVISOR" } }),
      prisma.user.count({ where: { role: "CONTENT_EDITOR" } }),
      prisma.user.count({ where: { role: "SUPPORT_AGENT" } }),
    ]);

    // Fetch all admin users (exclude regular USER role)
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          not: "USER",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      stats: {
        superAdminCount,
        supervisorCount,
        contentEditorCount,
        supportAgentCount,
      },
      admins: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}
