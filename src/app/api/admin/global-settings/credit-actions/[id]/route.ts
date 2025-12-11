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
 * GET /api/admin/global-settings/credit-actions/[id]
 * Get a single credit action
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const action = await prisma.creditAction.findUnique({
      where: { id },
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Error fetching credit action:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit action" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/global-settings/credit-actions/[id]
 * Update a credit action
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
    const existing = await prisma.creditAction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    // If slug is being changed, check it's unique
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.creditAction.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "An action with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const action = await prisma.creditAction.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        category: body.category,
        creditCost: body.creditCost,
        durationDays: body.durationDays,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Error updating credit action:", error);
    return NextResponse.json(
      { error: "Failed to update credit action" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/credit-actions/[id]
 * Delete a credit action
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if action exists
    const action = await prisma.creditAction.findUnique({
      where: { id },
    });

    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    await prisma.creditAction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Action deleted successfully" });
  } catch (error) {
    console.error("Error deleting credit action:", error);
    return NextResponse.json(
      { error: "Failed to delete credit action" },
      { status: 500 }
    );
  }
}
