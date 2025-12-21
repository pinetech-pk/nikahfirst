import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/sects/maslaks/[id]
 * Fetch a single maslak
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

    const maslak = await prisma.maslak.findUnique({
      where: { id },
      include: {
        sect: {
          select: { id: true, label: true },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!maslak) {
      return NextResponse.json({ error: "Maslak not found" }, { status: 404 });
    }

    return NextResponse.json({ maslak });
  } catch (error) {
    console.error("Error fetching maslak:", error);
    return NextResponse.json(
      { error: "Failed to fetch maslak" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/sects/maslaks/[id]
 * Update a maslak
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
    const { slug, label, description, sortOrder, isActive } = body;

    // Check if maslak exists
    const existing = await prisma.maslak.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Maslak not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates within the same sect
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.maslak.findFirst({
        where: {
          sectId: existing.sectId,
          slug,
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A maslak with this slug already exists for this sect" },
          { status: 400 }
        );
      }
    }

    const maslak = await prisma.maslak.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ maslak });
  } catch (error) {
    console.error("Error updating maslak:", error);
    return NextResponse.json(
      { error: "Failed to update maslak" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/sects/maslaks/[id]
 * Delete a maslak
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

    // Check if maslak exists and is in use
    const existing = await prisma.maslak.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Maslak not found" }, { status: 404 });
    }

    // Check if maslak is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete maslak that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.maslak.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maslak:", error);
    return NextResponse.json(
      { error: "Failed to delete maslak" },
      { status: 500 }
    );
  }
}
