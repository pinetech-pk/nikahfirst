import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/topup-requests/pending-count
 * Get count of pending top-up requests (for admin badge)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user.role ||
      !["SUPERVISOR", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.topUpRequest.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching pending count:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending count" },
      { status: 500 }
    );
  }
}
