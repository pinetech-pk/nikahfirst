import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/plan
 * Get current user's subscription plan
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPlan: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    const planName = user?.subscriptionPlan?.name || "Free Plan";
    const planSlug = user?.subscriptionPlan?.slug || "FREE";
    const isFree = !user?.subscriptionPlan || planSlug === "FREE";

    return NextResponse.json({
      planName,
      planSlug,
      isFree,
    });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch user plan" },
      { status: 500 }
    );
  }
}
