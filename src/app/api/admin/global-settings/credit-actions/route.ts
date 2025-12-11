import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/credit-actions
 * Fetch all credit actions
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actions = await prisma.creditAction.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error("Error fetching credit actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit actions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/credit-actions
 * Create a new credit action
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
      creditCost,
      durationDays,
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
    const existing = await prisma.creditAction.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An action with this slug already exists" },
        { status: 400 }
      );
    }

    const action = await prisma.creditAction.create({
      data: {
        slug,
        name,
        description: description || null,
        category: category || null,
        creditCost: creditCost || 1,
        durationDays: durationDays || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error("Error creating credit action:", error);
    return NextResponse.json(
      { error: "Failed to create credit action" },
      { status: 500 }
    );
  }
}
