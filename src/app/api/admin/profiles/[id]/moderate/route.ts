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

    const allowedRoles = ["MODERATOR", "ADMIN", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params to get the ID
    const { id } = await params;
    const { action, feedback } = await req.json();

    if (action === "approve") {
      // Approve profile
      await prisma.profile.update({
        where: { id },
        data: {
          isPublished: true,
          isVerified: true,
          verificationLevel: 1,
        },
      });

      // TODO: Send approval notification to user

      return NextResponse.json({
        success: true,
        message: "Profile approved successfully",
      });
    } else if (action === "reject") {
      // Keep profile unpublished and send feedback
      await prisma.profile.update({
        where: { id },
        data: {
          isPublished: false,
        },
      });

      // TODO: Send rejection notification with feedback to user

      return NextResponse.json({
        success: true,
        message: "Profile rejected with feedback",
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
