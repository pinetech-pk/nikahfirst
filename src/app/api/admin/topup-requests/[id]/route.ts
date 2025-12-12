import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/topup-requests/[id]
 * Get a single top-up request
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["SUPERVISOR", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const request = await prisma.topUpRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            fundingWallet: {
              select: {
                balance: true,
              },
            },
          },
        },
        package: true,
        processor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error("Error fetching top-up request:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up request" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/topup-requests/[id]
 * Approve or reject a top-up request
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["SUPERVISOR", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNotes, rejectionReason } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the request
    const topUpRequest = await prisma.topUpRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            fundingWallet: true,
          },
        },
        package: true,
      },
    });

    if (!topUpRequest) {
      return NextResponse.json(
        { error: "Top-up request not found" },
        { status: 404 }
      );
    }

    if (topUpRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Calculate total credits
      const totalCredits = topUpRequest.credits + topUpRequest.bonusCredits;

      // Use a transaction to update request and credit wallet
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update the top-up request status
        const updatedRequest = await tx.topUpRequest.update({
          where: { id },
          data: {
            status: "COMPLETED",
            processedBy: session.user.id,
            processedAt: new Date(),
            adminNotes: adminNotes || null,
          },
        });

        // Update or create funding wallet
        const wallet = await tx.fundingWallet.upsert({
          where: { userId: topUpRequest.userId },
          update: {
            balance: {
              increment: totalCredits,
            },
            totalPurchased: {
              increment: totalCredits,
            },
          },
          create: {
            userId: topUpRequest.userId,
            balance: totalCredits,
            totalPurchased: totalCredits,
          },
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId: topUpRequest.userId,
            type: "TOP_UP",
            walletType: "FUNDING",
            amount: totalCredits,
            description: `Top-up: ${topUpRequest.package?.name || "Credit Package"} (${totalCredits} credits)`,
            paymentMethod: topUpRequest.paymentMethod,
            referenceType: "TOP_UP_REQUEST",
            referenceId: topUpRequest.id,
          },
        });

        return { updatedRequest, wallet, transaction };
      });

      return NextResponse.json({
        success: true,
        message: `Top-up approved. ${totalCredits} credits added to user's wallet.`,
        request: result.updatedRequest,
        newBalance: result.wallet.balance,
      });
    } else {
      // Reject the request
      if (!rejectionReason) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      const updatedRequest = await prisma.topUpRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedBy: session.user.id,
          processedAt: new Date(),
          adminNotes: adminNotes || null,
          rejectionReason,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Top-up request rejected.",
        request: updatedRequest,
      });
    }
  } catch (error) {
    console.error("Error processing top-up request:", error);
    return NextResponse.json(
      { error: "Failed to process top-up request" },
      { status: 500 }
    );
  }
}
