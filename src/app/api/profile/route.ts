import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROFILE_REWARDS } from "@/config/constants";

// Calculate profile completion percentage based on filled fields
function calculateCompletion(profile: Record<string, unknown>): number {
  const requiredFields = [
    "profileFor",
    "gender",
    "dateOfBirth",
    "maritalStatus",
    "originId",
    "ethnicityId",
    "countryOfOriginId",
    "countryLivingInId",
    "stateProvinceId",
    "cityId",
    "sectId",
    "religiousBelonging",
    "socialStatus",
    "heightId",
    "complexion",
    "educationLevelId",
    "educationFieldId",
    "occupationType",
    "incomeRangeId",
    "motherTongueId",
    "bio",
  ];

  let filled = 0;
  for (const field of requiredFields) {
    if (profile[field] !== null && profile[field] !== undefined && profile[field] !== "") {
      filled++;
    }
  }

  return Math.round((filled / requiredFields.length) * 100);
}

// GET - Fetch user's incomplete/draft profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("id");

    // If specific profile ID provided, fetch that profile
    if (profileId) {
      const profile = await prisma.profile.findFirst({
        where: {
          id: profileId,
          userId: session.user.id,
        },
        include: {
          origin: { select: { id: true, label: true } },
          ethnicity: { select: { id: true, label: true } },
          caste: { select: { id: true, label: true } },
          countryOfOrigin: { select: { id: true, name: true } },
          countryLivingIn: { select: { id: true, name: true } },
          stateProvince: { select: { id: true, name: true } },
          city: { select: { id: true, name: true } },
          sect: { select: { id: true, label: true } },
          maslak: { select: { id: true, label: true } },
          height: { select: { id: true, labelImperial: true, labelMetric: true } },
          educationLevel: { select: { id: true, label: true } },
          educationField: { select: { id: true, label: true } },
          incomeRange: { select: { id: true, label: true } },
          motherTongue: { select: { id: true, label: true } },
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      return NextResponse.json({ profile });
    }

    // Otherwise, fetch user's most recent incomplete profile
    const incompleteProfile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        profileCompletion: { lt: 100 },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ profile: incompleteProfile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST - Create new profile (Step 1)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields for step 1
    if (!data.profileFor || !data.gender || !data.dateOfBirth || !data.maritalStatus) {
      return NextResponse.json(
        { error: "Missing required fields: profileFor, gender, dateOfBirth, maritalStatus" },
        { status: 400 }
      );
    }

    // Create profile with basic info
    const profile = await prisma.profile.create({
      data: {
        userId: session.user.id,
        profileFor: data.profileFor,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        maritalStatus: data.maritalStatus,
        numberOfChildren: data.numberOfChildren || 0,
        childrenLivingWith: data.childrenLivingWith || null,
        profileCompletion: 15, // Step 1 = ~15% complete
      },
    });

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      profileCompletion: profile.profileCompletion,
      message: "Profile created! Continue to add more details.",
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing profile (Steps 2-7)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { profileId, step, ...updateData } = data;

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Verify profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Build update data based on step
    const prismaUpdateData: Record<string, unknown> = {};

    // Step 2: Origin & Background
    if (updateData.originId !== undefined) prismaUpdateData.originId = updateData.originId || null;
    if (updateData.ethnicityId !== undefined) prismaUpdateData.ethnicityId = updateData.ethnicityId || null;
    if (updateData.casteId !== undefined) prismaUpdateData.casteId = updateData.casteId || null;
    if (updateData.customCaste !== undefined) prismaUpdateData.customCaste = updateData.customCaste || null;

    // Step 3: Location
    if (updateData.countryOfOriginId !== undefined) prismaUpdateData.countryOfOriginId = updateData.countryOfOriginId || null;
    if (updateData.countryLivingInId !== undefined) prismaUpdateData.countryLivingInId = updateData.countryLivingInId || null;
    if (updateData.stateProvinceId !== undefined) prismaUpdateData.stateProvinceId = updateData.stateProvinceId || null;
    if (updateData.cityId !== undefined) prismaUpdateData.cityId = updateData.cityId || null;
    if (updateData.visaStatus !== undefined) prismaUpdateData.visaStatus = updateData.visaStatus || null;

    // Step 4: Religion & Family
    if (updateData.sectId !== undefined) prismaUpdateData.sectId = updateData.sectId || null;
    if (updateData.maslakId !== undefined) prismaUpdateData.maslakId = updateData.maslakId || null;
    if (updateData.religiousBelonging !== undefined) prismaUpdateData.religiousBelonging = updateData.religiousBelonging || null;
    if (updateData.socialStatus !== undefined) prismaUpdateData.socialStatus = updateData.socialStatus || null;
    if (updateData.numberOfBrothers !== undefined) prismaUpdateData.numberOfBrothers = updateData.numberOfBrothers || 0;
    if (updateData.numberOfSisters !== undefined) prismaUpdateData.numberOfSisters = updateData.numberOfSisters || 0;
    if (updateData.marriedBrothers !== undefined) prismaUpdateData.marriedBrothers = updateData.marriedBrothers || 0;
    if (updateData.marriedSisters !== undefined) prismaUpdateData.marriedSisters = updateData.marriedSisters || 0;
    if (updateData.fatherOccupation !== undefined) prismaUpdateData.fatherOccupation = updateData.fatherOccupation || null;
    if (updateData.propertyOwnership !== undefined) prismaUpdateData.propertyOwnership = updateData.propertyOwnership || null;

    // Step 5: Physical Attributes
    if (updateData.heightId !== undefined) prismaUpdateData.heightId = updateData.heightId || null;
    if (updateData.complexion !== undefined) prismaUpdateData.complexion = updateData.complexion || null;
    if (updateData.hasDisability !== undefined) prismaUpdateData.hasDisability = updateData.hasDisability || false;
    if (updateData.disabilityDetails !== undefined) prismaUpdateData.disabilityDetails = updateData.disabilityDetails || null;

    // Step 6: Education & Career
    if (updateData.educationLevelId !== undefined) prismaUpdateData.educationLevelId = updateData.educationLevelId || null;
    if (updateData.educationFieldId !== undefined) prismaUpdateData.educationFieldId = updateData.educationFieldId || null;
    if (updateData.educationDetails !== undefined) prismaUpdateData.educationDetails = updateData.educationDetails || null;
    if (updateData.occupationType !== undefined) prismaUpdateData.occupationType = updateData.occupationType || null;
    if (updateData.occupationDetails !== undefined) prismaUpdateData.occupationDetails = updateData.occupationDetails || null;
    if (updateData.incomeRangeId !== undefined) prismaUpdateData.incomeRangeId = updateData.incomeRangeId || null;
    if (updateData.motherTongueId !== undefined) prismaUpdateData.motherTongueId = updateData.motherTongueId || null;

    // Step 7: Bio
    if (updateData.bio !== undefined) prismaUpdateData.bio = updateData.bio || null;

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: prismaUpdateData,
    });

    // Calculate and update completion percentage
    const completion = calculateCompletion(updatedProfile as unknown as Record<string, unknown>);

    const finalProfile = await prisma.profile.update({
      where: { id: profileId },
      data: { profileCompletion: completion },
    });

    // Award bonus credits if profile is now complete (100%)
    if (completion === 100 && existingProfile.profileCompletion < 100) {
      await prisma.redeemWallet.update({
        where: { userId: session.user.id },
        data: {
          balance: { increment: PROFILE_REWARDS.COMPLETION_BONUS },
        },
      });

      return NextResponse.json({
        success: true,
        profileId: finalProfile.id,
        profileCompletion: completion,
        message: `Profile complete! You earned ${PROFILE_REWARDS.COMPLETION_BONUS} bonus credits.`,
        bonusAwarded: true,
      });
    }

    return NextResponse.json({
      success: true,
      profileId: finalProfile.id,
      profileCompletion: completion,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
