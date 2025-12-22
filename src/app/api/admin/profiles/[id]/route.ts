import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch profile details
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    const allowedRoles = ["CONTENT_EDITOR", "SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            subscriptionTier: true,
            status: true,
            createdAt: true,
          },
        },
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        countryOfOrigin: true,
        countryLivingIn: true,
        stateProvince: true,
        city: true,
        origin: true,
        ethnicity: true,
        caste: true,
        sect: true,
        maslak: true,
        educationLevel: true,
        educationField: true,
        incomeRange: true,
        motherTongue: true,
        height: true,
        verification: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// DELETE - Delete profile only (keep user account)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    // Only SUPERVISOR and SUPER_ADMIN can delete profiles
    const allowedRoles = ["SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        photos: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete profile (photos will be cascade deleted due to onDelete: Cascade in schema)
    // Note: You may want to also delete photos from Cloudinary here
    await prisma.profile.delete({
      where: { id },
    });

    // Log the deletion (you can add to audit log here)
    console.log(
      `Profile ${id} deleted by admin ${session.user.id}. User ${profile.user.email} account kept intact.`
    );

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully. User account remains active.",
      deletedProfile: {
        id: profile.id,
        userId: profile.userId,
        userEmail: profile.user.email,
        photosDeleted: profile.photos.length,
      },
    });
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
