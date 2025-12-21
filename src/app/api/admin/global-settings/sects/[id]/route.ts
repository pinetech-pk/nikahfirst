import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/sects/[id]
 * Fetch a single sect with its maslaks
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

    const sect = await prisma.sect.findUnique({
      where: { id },
      include: {
        maslaks: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: { profiles: true },
            },
          },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!sect) {
      return NextResponse.json({ error: "Sect not found" }, { status: 404 });
    }

    return NextResponse.json({ sect });
  } catch (error) {
    console.error("Error fetching sect:", error);
    return NextResponse.json(
      { error: "Failed to fetch sect" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/sects/[id]
 * Update a sect
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
    const { slug, label, sortOrder, isActive } = body;

    // Check if sect exists
    const existing = await prisma.sect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Sect not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.sect.findUnique({
        where: { slug },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A sect with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const sect = await prisma.sect.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ sect });
  } catch (error) {
    console.error("Error updating sect:", error);
    return NextResponse.json(
      { error: "Failed to update sect" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/sects/[id]
 * Delete a sect
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

    // Check if sect exists and is in use
    const existing = await prisma.sect.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true, maslaks: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sect not found" }, { status: 404 });
    }

    // Check if sect is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete sect that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    // Delete will cascade to maslaks
    await prisma.sect.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sect:", error);
    return NextResponse.json(
      { error: "Failed to delete sect" },
      { status: 500 }
    );
  }
}
