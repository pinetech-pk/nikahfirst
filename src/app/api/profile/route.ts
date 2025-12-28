import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to get redeem action credits
async function getRedeemActionCredits(slug: string): Promise<number> {
  try {
    const action = await prisma.redeemAction.findUnique({
      where: { slug },
      select: { creditsAwarded: true, isActive: true },
    });
    return action?.isActive ? action.creditsAwarded : 0;
  } catch {
    return 0; // Return 0 if RedeemAction table doesn't exist yet
  }
}

// Helper function to award redeem credits with wallet limit enforcement
interface AwardResult {
  awarded: number;
  wasted: number;
  newBalance: number;
  limitReached: boolean;
}

async function awardRedeemCredits(
  userId: string,
  creditsToAward: number
): Promise<AwardResult> {
  // Get user's redeem wallet
  const wallet = await prisma.redeemWallet.findUnique({
    where: { userId },
    select: { balance: true, limit: true, creditsWasted: true },
  });

  if (!wallet) {
    return { awarded: 0, wasted: creditsToAward, newBalance: 0, limitReached: false };
  }

  const currentBalance = wallet.balance;
  const walletLimit = wallet.limit;

  // Calculate how many credits can actually be awarded
  const spaceAvailable = Math.max(0, walletLimit - currentBalance);
  const actualCredits = Math.min(creditsToAward, spaceAvailable);
  const wastedCredits = creditsToAward - actualCredits;

  // Update wallet if there are credits to award
  if (actualCredits > 0 || wastedCredits > 0) {
    await prisma.redeemWallet.update({
      where: { userId },
      data: {
        balance: { increment: actualCredits },
        creditsWasted: { increment: wastedCredits },
      },
    });
  }

  return {
    awarded: actualCredits,
    wasted: wastedCredits,
    newBalance: currentBalance + actualCredits,
    limitReached: spaceAvailable === 0 || actualCredits < creditsToAward,
  };
}

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
    // motherTongueId is now optional - removed from required
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
          _count: {
            select: {
              photos: true,
            },
          },
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      return NextResponse.json({ profile });
    }

    // Check if we should include completed profiles
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    // Fetch user's most recent profile (optionally including completed ones)
    const profile = await prisma.profile.findFirst({
      where: {
        userId: session.user.id,
        ...(includeCompleted ? {} : { profileCompletion: { lt: 100 } }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ profile });
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
    if (updateData.otherMotherTongue !== undefined) prismaUpdateData.otherMotherTongue = updateData.otherMotherTongue || null;

    // Create suggestion for custom mother tongue if provided
    if (updateData.otherMotherTongue && updateData.otherMotherTongue.trim()) {
      // Check if suggestion already exists from this user
      const existingSuggestion = await prisma.fieldSuggestion.findFirst({
        where: {
          userId: session.user.id,
          fieldType: "MOTHER_TONGUE",
          suggestedValue: updateData.otherMotherTongue.trim(),
        },
      });

      if (!existingSuggestion) {
        await prisma.fieldSuggestion.create({
          data: {
            userId: session.user.id,
            fieldType: "MOTHER_TONGUE",
            suggestedValue: updateData.otherMotherTongue.trim(),
            suggestedLabel: updateData.otherMotherTongue.trim(),
            status: "PENDING",
          },
        });
      }
    }

    // Step 7: Bio & Visibility
    if (updateData.bio !== undefined) prismaUpdateData.bio = updateData.bio || null;
    if (updateData.originAudience !== undefined) prismaUpdateData.originAudience = updateData.originAudience || "SAME_ORIGIN";

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
      // Get configurable credits from RedeemAction
      const bonusCredits = await getRedeemActionCredits("PROFILE_COMPLETION");

      if (bonusCredits > 0) {
        // Award credits with wallet limit enforcement
        const result = await awardRedeemCredits(session.user.id, bonusCredits);

        if (result.awarded > 0) {
          // Build appropriate message based on whether limit was reached
          let message = `Profile complete! You earned ${result.awarded} bonus credit${result.awarded !== 1 ? 's' : ''}.`;
          if (result.wasted > 0) {
            message += ` (${result.wasted} credit${result.wasted !== 1 ? 's' : ''} could not be added - wallet limit reached)`;
          }

          return NextResponse.json({
            success: true,
            profileId: finalProfile.id,
            profileCompletion: completion,
            message,
            bonusAwarded: true,
            creditsAwarded: result.awarded,
            creditsWasted: result.wasted,
            newBalance: result.newBalance,
          });
        } else if (result.limitReached) {
          // No credits awarded because wallet is at limit
          return NextResponse.json({
            success: true,
            profileId: finalProfile.id,
            profileCompletion: completion,
            message: "Profile complete! Bonus credits could not be added - your redeem wallet is at its limit.",
            bonusAwarded: false,
            creditsWasted: result.wasted,
          });
        }
      }
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

// DELETE - Delete user's own profile
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Verify profile belongs to user
    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: session.user.id,
      },
      select: {
        id: true,
        _count: {
          select: {
            photos: true,
            sentConnections: true,
            receivedConnections: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Delete the profile (cascades to photos, connections, etc.)
    await prisma.profile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
      deletedCounts: {
        photos: profile._count.photos,
        sentConnections: profile._count.sentConnections,
        receivedConnections: profile._count.receivedConnections,
      },
    });
  } catch (error) {
    console.error("Profile delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
