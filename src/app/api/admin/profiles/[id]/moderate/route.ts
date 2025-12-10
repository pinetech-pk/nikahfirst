import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    const allowedRoles = ["CONTENT_EDITOR", "SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params to get the ID
    const { id } = await params;
    const { action, feedback } = await req.json();

    if (action === "approve") {
      // Approve profile using new moderationStatus
      await prisma.profile.update({
        where: { id },
        data: {
          moderationStatus: "APPROVED",
          moderatedAt: new Date(),
          moderatedBy: session.user.id,
          rejectionReason: null,
          // Keep isPublished for backward compatibility
          isPublished: true,
          isVerified: true,
        },
      });

      // TODO: Send approval notification to user

      return NextResponse.json({
        success: true,
        message: "Profile approved successfully",
      });
    } else if (action === "reject") {
      // Reject profile with feedback
      await prisma.profile.update({
        where: { id },
        data: {
          moderationStatus: "REJECTED",
          moderatedAt: new Date(),
          moderatedBy: session.user.id,
          rejectionReason: feedback || null,
          // Keep isPublished for backward compatibility
          isPublished: false,
        },
      });

      // TODO: Send rejection notification with feedback to user

      return NextResponse.json({
        success: true,
        message: "Profile rejected with feedback",
      });
    } else if (action === "ban") {
      // Ban profile (admin action)
      await prisma.profile.update({
        where: { id },
        data: {
          moderationStatus: "BANNED",
          bannedAt: new Date(),
          bannedBy: session.user.id,
          banReason: feedback || null,
          isPublished: false,
          isActive: false,
        },
      });

      // TODO: Send ban notification to user

      return NextResponse.json({
        success: true,
        message: "Profile banned successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile moderation error:", error);
    return NextResponse.json(
      { error: "Failed to moderate profile" },
      { status: 500 }
    );
  }
}
