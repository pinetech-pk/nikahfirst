import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR", "SUPPORT_AGENT"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.role || !ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch counts in parallel
    const [regularUsers, adminUsers, pendingProfiles] = await Promise.all([
      // Regular users count (role = USER)
      prisma.user.count({
        where: { role: "USER" },
      }),
      // Admin users count (role in ADMIN_ROLES)
      prisma.user.count({
        where: {
          role: {
            in: ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR", "SUPPORT_AGENT"],
          },
        },
      }),
      // Pending profiles count (moderationStatus = PENDING)
      prisma.profile.count({
        where: { moderationStatus: "PENDING" },
      }),
    ]);

    return NextResponse.json({
      regularUsers,
      adminUsers,
      pendingProfiles,
    });
  } catch (error) {
    console.error("Error fetching sidebar counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
