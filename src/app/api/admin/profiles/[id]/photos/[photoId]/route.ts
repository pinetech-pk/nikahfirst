import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PhotoStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
    photoId: string;
  }>;
}

// PATCH - Moderate individual photo
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    const allowedRoles = ["CONTENT_EDITOR", "SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: profileId, photoId } = await params;
    const { action, reason } = await req.json();

    // Verify photo belongs to profile
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        profileId,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    let newStatus: PhotoStatus;
    let message: string;

    switch (action) {
      case "approve":
        newStatus = "APPROVED";
        message = "Photo approved successfully";
        break;
      case "reject":
        newStatus = "REJECTED";
        message = "Photo rejected";
        break;
      case "pending":
        newStatus = "PENDING";
        message = "Photo set to pending";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.photo.update({
      where: { id: photoId },
      data: {
        status: newStatus,
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
        rejectionReason: action === "reject" ? reason || null : null,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      photo: {
        id: photoId,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Failed to moderate photo:", error);
    return NextResponse.json(
      { error: "Failed to moderate photo" },
      { status: 500 }
    );
  }
}

// DELETE - Delete individual photo
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    const allowedRoles = ["SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: profileId, photoId } = await params;

    // Verify photo belongs to profile
    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        profileId,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from database
    // Note: You may also want to delete from Cloudinary here
    await prisma.photo.delete({
      where: { id: photoId },
    });

    console.log(
      `Photo ${photoId} deleted by admin ${session.user.id} from profile ${profileId}`
    );

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
