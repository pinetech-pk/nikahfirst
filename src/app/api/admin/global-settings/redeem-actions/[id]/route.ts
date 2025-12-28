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
 * GET /api/admin/global-settings/redeem-actions/[id]
 * Get a single redeem action
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const action = await prisma.redeemAction.findUnique({
      where: { id },
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Error fetching redeem action:", error);
    return NextResponse.json(
      { error: "Failed to fetch redeem action" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/global-settings/redeem-actions/[id]
 * Update a redeem action
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if action exists
    const existing = await prisma.redeemAction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // If slug is being changed, check it's unique
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.redeemAction.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "An action with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const action = await prisma.redeemAction.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        category: body.category,
        creditsAwarded: body.creditsAwarded,
        maxRedemptions: body.maxRedemptions,
        cooldownDays: body.cooldownDays,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Error updating redeem action:", error);
    return NextResponse.json(
      { error: "Failed to update redeem action" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/redeem-actions/[id]
 * Delete a redeem action
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if action exists
    const action = await prisma.redeemAction.findUnique({
      where: { id },
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    await prisma.redeemAction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Action deleted successfully" });
  } catch (error) {
    console.error("Error deleting redeem action:", error);
    return NextResponse.json(
      { error: "Failed to delete redeem action" },
      { status: 500 }
    );
  }
}
