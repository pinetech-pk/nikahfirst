import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins/castes/[id]
 * Fetch a single caste
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

    const caste = await prisma.caste.findUnique({
      where: { id },
      include: {
        ethnicity: {
          select: {
            id: true,
            label: true,
            origin: { select: { id: true, label: true, level2Label: true } },
          },
        },
        _count: { select: { profiles: true } },
      },
    });

    if (!caste) {
      return NextResponse.json({ error: "Caste not found" }, { status: 404 });
    }

    return NextResponse.json({ caste });
  } catch (error) {
    console.error("Error fetching caste:", error);
    return NextResponse.json(
      { error: "Failed to fetch caste" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/origins/castes/[id]
 * Update a caste
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

    // Check if caste exists
    const existing = await prisma.caste.findUnique({
      where: { id },
      include: {
        ethnicity: {
          select: { origin: { select: { level2Label: true } } },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Caste not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates in the same ethnicity
    if (slug && slug !== existing.slug) {
      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "_");
      const duplicate = await prisma.caste.findUnique({
        where: {
          ethnicityId_slug: { ethnicityId: existing.ethnicityId, slug: normalizedSlug },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `A ${existing.ethnicity.origin.level2Label.toLowerCase()} with this name already exists` },
          { status: 400 }
        );
      }
    }

    const caste = await prisma.caste.update({
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
        ethnicity: {
          select: {
            label: true,
            origin: { select: { label: true, level2Label: true } },
          },
        },
      },
    });

    return NextResponse.json({ caste });
  } catch (error) {
    console.error("Error updating caste:", error);
    return NextResponse.json(
      { error: "Failed to update caste" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/origins/castes/[id]
 * Delete a caste
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

    // Check if caste exists
    const existing = await prisma.caste.findUnique({
      where: { id },
      include: {
        ethnicity: {
          select: { origin: { select: { level2Label: true } } },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Caste not found" }, { status: 404 });
    }

    // Check if caste is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: `Cannot delete ${existing.ethnicity.origin.level2Label.toLowerCase()} that is in use by profiles. Consider deactivating it instead.` },
        { status: 400 }
      );
    }

    await prisma.caste.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting caste:", error);
    return NextResponse.json(
      { error: "Failed to delete caste" },
      { status: 500 }
    );
  }
}
