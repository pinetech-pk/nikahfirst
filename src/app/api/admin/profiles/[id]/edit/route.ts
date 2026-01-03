import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Admin update profile (primarily for location mapping)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Only CONTENT_EDITOR, SUPERVISOR, and SUPER_ADMIN can edit profiles
    const allowedRoles = ["CONTENT_EDITOR", "SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Build update data - only allow specific fields to be updated by admin
    const updateData: Record<string, unknown> = {};

    // Location fields
    if (data.stateProvinceId !== undefined) {
      updateData.stateProvinceId = data.stateProvinceId || null;
    }
    if (data.cityId !== undefined) {
      updateData.cityId = data.cityId || null;
    }
    if (data.suggestedLocation !== undefined) {
      // Clear suggested location when admin maps to actual location
      updateData.suggestedLocation = data.suggestedLocation || null;
    }
    if (data.visaStatus !== undefined) {
      updateData.visaStatus = data.visaStatus || null;
    }

    // Country fields (in case they need adjustment)
    if (data.countryOfOriginId !== undefined) {
      updateData.countryOfOriginId = data.countryOfOriginId || null;
    }
    if (data.countryLivingInId !== undefined) {
      updateData.countryLivingInId = data.countryLivingInId || null;
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: updateData,
      include: {
        countryOfOrigin: { select: { id: true, name: true } },
        countryLivingIn: { select: { id: true, name: true } },
        stateProvince: { select: { id: true, name: true } },
        city: { select: { id: true, name: true } },
      },
    });

    // Log the admin action
    console.log(
      `Profile ${id} edited by admin ${session.user.id} (${session.user.email}). Updated fields: ${Object.keys(updateData).join(", ")}`
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
