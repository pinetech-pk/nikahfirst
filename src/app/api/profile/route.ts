import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROFILE_REWARDS, DEFAULTS } from "@/config/constants";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Create profile with user association
    // Note: This is a minimal profile creation. Full profile details
    // will be added via the multi-step profile form in a future update.
    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        profileFor: data.profileFor,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        maritalStatus: data.maritalStatus || "NEVER_MARRIED",
        bio: data.bio || null,
      },
    });

    // Award credits for profile completion
    await prisma.redeemWallet.update({
      where: { userId: session.user.id },
      data: {
        balance: { increment: PROFILE_REWARDS.COMPLETION_BONUS },
      },
    });

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      message: `Profile created! You earned ${PROFILE_REWARDS.COMPLETION_BONUS} bonus credits.`,
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
