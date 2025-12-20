import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/cities/[id]
 * Fetch a single city
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

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        stateProvince: {
          select: {
            id: true,
            name: true,
            country: { select: { id: true, name: true, code: true } },
          },
        },
        _count: { select: { profiles: true } },
      },
    });

    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({ city });
  } catch (error) {
    console.error("Error fetching city:", error);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/locations/cities/[id]
 * Update a city
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
    const { name, nameNative, sortOrder, isPopular, isActive } = body;

    // Check if city exists
    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // If changing name, check for duplicates in the same state
    if (name && name !== existing.name) {
      const duplicate = await prisma.city.findUnique({
        where: {
          stateProvinceId_name: { stateProvinceId: existing.stateProvinceId, name },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A city with this name already exists in this state" },
          { status: 400 }
        );
      }
    }

    const city = await prisma.city.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameNative !== undefined && { nameNative }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isPopular !== undefined && { isPopular }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        stateProvince: {
          select: {
            name: true,
            country: { select: { name: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json({ city });
  } catch (error) {
    console.error("Error updating city:", error);
    return NextResponse.json(
      { error: "Failed to update city" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/locations/cities/[id]
 * Delete a city
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

    // Check if city exists
    const existing = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // Check if city is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete city that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.city.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { error: "Failed to delete city" },
      { status: 500 }
    );
  }
}
