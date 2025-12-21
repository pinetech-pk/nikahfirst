import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins/[id]
 * Fetch a single origin with its ethnicities
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

    const origin = await prisma.origin.findUnique({
      where: { id },
      include: {
        ethnicities: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: { castes: true, profiles: true },
            },
          },
        },
      },
    });

    if (!origin) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    return NextResponse.json({ origin });
  } catch (error) {
    console.error("Error fetching origin:", error);
    return NextResponse.json(
      { error: "Failed to fetch origin" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/origins/[id]
 * Update an origin
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
    const {
      slug,
      label,
      labelNative,
      emoji,
      description,
      sortOrder,
      isActive,
      level1Label,
      level1LabelPlural,
      level2Label,
      level2LabelPlural,
      level2Enabled,
    } = body;

    // Check if origin exists
    const existing = await prisma.origin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates
    if (slug && slug !== existing.slug) {
      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "_");
      const duplicate = await prisma.origin.findUnique({
        where: { slug: normalizedSlug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "An origin with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const origin = await prisma.origin.update({
      where: { id },
      data: {
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, "_") }),
        ...(label && { label }),
        ...(labelNative !== undefined && { labelNative }),
        ...(emoji !== undefined && { emoji }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(level1Label !== undefined && { level1Label }),
        ...(level1LabelPlural !== undefined && { level1LabelPlural }),
        ...(level2Label !== undefined && { level2Label }),
        ...(level2LabelPlural !== undefined && { level2LabelPlural }),
        ...(level2Enabled !== undefined && { level2Enabled }),
      },
    });

    return NextResponse.json({ origin });
  } catch (error) {
    console.error("Error updating origin:", error);
    return NextResponse.json(
      { error: "Failed to update origin" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/origins/[id]
 * Delete an origin
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

    // Check if origin exists and is in use
    const existing = await prisma.origin.findUnique({
      where: { id },
      include: {
        _count: {
          select: { ethnicities: true, profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Origin not found" }, { status: 404 });
    }

    // Check if origin is being used by profiles
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete origin that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    // Delete will cascade to ethnicities and castes
    await prisma.origin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting origin:", error);
    return NextResponse.json(
      { error: "Failed to delete origin" },
      { status: 500 }
    );
  }
}
