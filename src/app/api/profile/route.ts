import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Create profile with user association
    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        profileFor: data.profileFor,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        bio: data.bio,
        city: data.city,
        country: data.country || "Pakistan",
      },
    });

    // Award credits for profile completion
    await prisma.redeemWallet.update({
      where: { userId: session.user.id },
      data: {
        balance: { increment: 2 }, // Bonus credits for completing profile
      },
    });

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      message: "Profile created! You earned 2 bonus credits.",
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
