import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription plan with profile limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPlan: {
          select: {
            name: true,
            profileLimit: true,
          },
        },
      },
    });

    // Get current profile count
    const profileCount = await prisma.profile.count({
      where: { userId: session.user.id },
    });

    // Get profile limit from subscription plan (default to 1 for free users)
    const profileLimit = user?.subscriptionPlan?.profileLimit ?? 1;
    const planName = user?.subscriptionPlan?.name ?? "Free";

    return NextResponse.json({
      profileCount,
      profileLimit,
      planName,
      limitReached: profileCount >= profileLimit,
      canCreate: profileCount < profileLimit,
    });
  } catch (error) {
    console.error("Error checking profile limit:", error);
    return NextResponse.json(
      { error: "Failed to check profile limit" },
      { status: 500 }
    );
  }
}
