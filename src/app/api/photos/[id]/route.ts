import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the photo and verify ownership
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        profile: {
          select: { userId: true },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(photo.publicId);

    // Delete from database
    await prisma.photo.delete({
      where: { id },
    });

    // If this was the primary photo, set the first remaining photo as primary
    if (photo.isPrimary) {
      const firstPhoto = await prisma.photo.findFirst({
        where: { profileId: photo.profileId },
        orderBy: { sortOrder: "asc" },
      });

      if (firstPhoto) {
        await prisma.photo.update({
          where: { id: firstPhoto.id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

// PATCH /api/photos/[id] - Update photo (set as primary, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isPrimary } = body;

    // Find the photo and verify ownership
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        profile: {
          select: { userId: true, id: true },
        },
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If setting as primary, unset other photos first
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { profileId: photo.profile.id },
        data: { isPrimary: false },
      });
    }

    // Update the photo
    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: { isPrimary },
    });

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}
