import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBlurredUrl,
  getThumbnailUrl,
  getOptimizedUrl,
  PHOTO_CONSTRAINTS,
} from "@/lib/cloudinary";

// POST /api/photos - Save photo metadata after successful Cloudinary upload
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profileId, publicId, isPrimary } = body;

    if (!profileId || !publicId) {
      return NextResponse.json(
        { error: "Missing required fields: profileId, publicId" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the user
    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: session.user.id,
      },
      include: {
        photos: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check max photos limit
    if (profile.photos.length >= PHOTO_CONSTRAINTS.MAX_PHOTOS_PER_PROFILE) {
      return NextResponse.json(
        { error: `Maximum ${PHOTO_CONSTRAINTS.MAX_PHOTOS_PER_PROFILE} photos allowed per profile` },
        { status: 400 }
      );
    }

    // Generate URLs using Cloudinary transformations
    const originalUrl = getOptimizedUrl(publicId);
    const blurredUrl = getBlurredUrl(publicId);
    const thumbnailUrl = getThumbnailUrl(publicId);

    // Determine sort order (add to end)
    const maxSortOrder = profile.photos.reduce(
      (max: number, photo: { sortOrder: number }) => Math.max(max, photo.sortOrder),
      -1
    );

    // If this should be primary, unset other primary photos
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { profileId },
        data: { isPrimary: false },
      });
    }

    // Create the photo record
    const photo = await prisma.photo.create({
      data: {
        profileId,
        publicId,
        originalUrl,
        blurredUrl,
        thumbnailUrl,
        isPrimary: isPrimary || profile.photos.length === 0, // First photo is primary by default
        sortOrder: maxSortOrder + 1,
        status: "PENDING", // Photos need moderation
      },
    });

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Error saving photo:", error);
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 }
    );
  }
}

// GET /api/photos?profileId=xxx - Get photos for a profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    // Verify the profile belongs to the user
    const profile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    const photos = await prisma.photo.findMany({
      where: { profileId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
