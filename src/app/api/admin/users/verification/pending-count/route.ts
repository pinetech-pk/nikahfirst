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

    // Check if user is admin
    if (!session.user.role || !ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Count pending phone verification requests (not verified, not expired)
    const count = await prisma.phoneVerification.count({
      where: {
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending verification count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
