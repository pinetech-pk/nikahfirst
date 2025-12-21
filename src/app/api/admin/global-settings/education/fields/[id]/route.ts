import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/education/fields/[id]
 * Fetch a single education field
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const field = await prisma.educationField.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!field) {
      return NextResponse.json({ error: "Education field not found" }, { status: 404 });
    }

    return NextResponse.json({ field });
  } catch (error) {
    console.error("Error fetching education field:", error);
    return NextResponse.json(
      { error: "Failed to fetch education field" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/education/fields/[id]
 * Update an education field
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { slug, label, category, sortOrder, isActive, tags } = body;

    // Check if field exists
    const existing = await prisma.educationField.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Education field not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.educationField.findUnique({
        where: { slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "An education field with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const educationField = await prisma.educationField.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
        ...(category !== undefined && { category }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(tags !== undefined && { tags }),
      },
    });

    return NextResponse.json({ educationField });
  } catch (error) {
    console.error("Error updating education field:", error);
    return NextResponse.json(
      { error: "Failed to update education field" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/education/fields/[id]
 * Delete an education field
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if field exists and is in use
    const existing = await prisma.educationField.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Education field not found" }, { status: 404 });
    }

    // Check if field is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete education field that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.educationField.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting education field:", error);
    return NextResponse.json(
      { error: "Failed to delete education field" },
      { status: 500 }
    );
  }
}
