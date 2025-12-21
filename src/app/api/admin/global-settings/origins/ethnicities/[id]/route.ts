import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins/ethnicities/[id]
 * Fetch a single ethnicity with its castes
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

    const ethnicity = await prisma.ethnicity.findUnique({
      where: { id },
      include: {
        origin: { select: { id: true, label: true, level1Label: true, level2Label: true, level2Enabled: true } },
        castes: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!ethnicity) {
      return NextResponse.json({ error: "Ethnicity not found" }, { status: 404 });
    }

    return NextResponse.json({ ethnicity });
  } catch (error) {
    console.error("Error fetching ethnicity:", error);
    return NextResponse.json(
      { error: "Failed to fetch ethnicity" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/origins/ethnicities/[id]
 * Update an ethnicity
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
    const { slug, label, labelNative, sortOrder, isPopular, isActive } = body;

    // Check if ethnicity exists
    const existing = await prisma.ethnicity.findUnique({
      where: { id },
      include: { origin: { select: { level1Label: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Ethnicity not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates in the same origin
    if (slug && slug !== existing.slug) {
      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "_");
      const duplicate = await prisma.ethnicity.findUnique({
        where: {
          originId_slug: { originId: existing.originId, slug: normalizedSlug },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `A ${existing.origin.level1Label.toLowerCase()} with this name already exists` },
          { status: 400 }
        );
      }
    }

    const ethnicity = await prisma.ethnicity.update({
      where: { id },
      data: {
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, "_") }),
        ...(label && { label }),
        ...(labelNative !== undefined && { labelNative }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isPopular !== undefined && { isPopular }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        origin: { select: { label: true, level1Label: true } },
      },
    });

    return NextResponse.json({ ethnicity });
  } catch (error) {
    console.error("Error updating ethnicity:", error);
    return NextResponse.json(
      { error: "Failed to update ethnicity" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/origins/ethnicities/[id]
 * Delete an ethnicity
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

    // Check if ethnicity exists
    const existing = await prisma.ethnicity.findUnique({
      where: { id },
      include: {
        origin: { select: { level1Label: true } },
        _count: {
          select: { castes: true, profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ethnicity not found" }, { status: 404 });
    }

    // Check if ethnicity is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: `Cannot delete ${existing.origin.level1Label.toLowerCase()} that is in use by profiles. Consider deactivating it instead.` },
        { status: 400 }
      );
    }

    // Delete will cascade to castes
    await prisma.ethnicity.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ethnicity:", error);
    return NextResponse.json(
      { error: "Failed to delete ethnicity" },
      { status: 500 }
    );
  }
}
