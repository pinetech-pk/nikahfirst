import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/redeem-actions
 * Fetch all redeem actions
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actions = await prisma.redeemAction.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error("Error fetching redeem actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch redeem actions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/redeem-actions
 * Create a new redeem action
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      name,
      description,
      category,
      creditsAwarded,
      maxRedemptions,
      cooldownDays,
      isActive,
      sortOrder,
    } = body;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug and name are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.redeemAction.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An action with this slug already exists" },
        { status: 400 }
      );
    }

    const action = await prisma.redeemAction.create({
      data: {
        slug,
        name,
        description: description || null,
        category: category || null,
        creditsAwarded: creditsAwarded || 1,
        maxRedemptions: maxRedemptions || null,
        cooldownDays: cooldownDays || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error("Error creating redeem action:", error);
    return NextResponse.json(
      { error: "Failed to create redeem action" },
      { status: 500 }
    );
  }
}
