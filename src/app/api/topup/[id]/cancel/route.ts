import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/topup/[id]/cancel
 * Cancel a pending top-up request
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the request
    const topUpRequest = await prisma.topUpRequest.findUnique({
      where: { id },
    });

    if (!topUpRequest) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    // Check if user owns this request
    if (topUpRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if request is still pending
    if (topUpRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending requests can be cancelled" },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const updated = await prisma.topUpRequest.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Top-up request cancelled successfully",
      request: updated,
    });
  } catch (error) {
    console.error("Error cancelling top-up request:", error);
    return NextResponse.json(
      { error: "Failed to cancel top-up request" },
      { status: 500 }
    );
  }
}
