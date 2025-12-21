import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/education/levels/[id]
 * Fetch a single education level
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

    const level = await prisma.educationLevel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!level) {
      return NextResponse.json({ error: "Education level not found" }, { status: 404 });
    }

    return NextResponse.json({ level });
  } catch (error) {
    console.error("Error fetching education level:", error);
    return NextResponse.json(
      { error: "Failed to fetch education level" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/education/levels/[id]
 * Update an education level
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
    const { slug, label, level, yearsOfEducation, sortOrder, isActive, tags } = body;

    // Check if level exists
    const existing = await prisma.educationLevel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Education level not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.educationLevel.findUnique({
        where: { slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "An education level with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const educationLevel = await prisma.educationLevel.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
        ...(level !== undefined && { level }),
        ...(yearsOfEducation !== undefined && { yearsOfEducation }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(tags !== undefined && { tags }),
      },
    });

    return NextResponse.json({ educationLevel });
  } catch (error) {
    console.error("Error updating education level:", error);
    return NextResponse.json(
      { error: "Failed to update education level" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/education/levels/[id]
 * Delete an education level
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

    // Check if level exists and is in use
    const existing = await prisma.educationLevel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Education level not found" }, { status: 404 });
    }

    // Check if level is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete education level that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.educationLevel.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting education level:", error);
    return NextResponse.json(
      { error: "Failed to delete education level" },
      { status: 500 }
    );
  }
}
