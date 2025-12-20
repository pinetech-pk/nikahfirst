import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/states/[id]
 * Fetch a single state with its cities
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

    const state = await prisma.stateProvince.findUnique({
      where: { id },
      include: {
        country: { select: { id: true, name: true, code: true } },
        cities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!state) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    return NextResponse.json({ state });
  } catch (error) {
    console.error("Error fetching state:", error);
    return NextResponse.json(
      { error: "Failed to fetch state" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/locations/states/[id]
 * Update a state
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
    const { code, name, nameNative, sortOrder, isActive } = body;

    // Check if state exists
    const existing = await prisma.stateProvince.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    // If changing name, check for duplicates in the same country
    if (name && name !== existing.name) {
      const duplicate = await prisma.stateProvince.findUnique({
        where: {
          countryId_name: { countryId: existing.countryId, name },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A state with this name already exists in this country" },
          { status: 400 }
        );
      }
    }

    const state = await prisma.stateProvince.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name && { name }),
        ...(nameNative !== undefined && { nameNative }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        country: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({ state });
  } catch (error) {
    console.error("Error updating state:", error);
    return NextResponse.json(
      { error: "Failed to update state" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/locations/states/[id]
 * Delete a state
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

    // Check if state exists
    const existing = await prisma.stateProvince.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cities: true, profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    // Check if state is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete state that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    // Delete will cascade to cities
    await prisma.stateProvince.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting state:", error);
    return NextResponse.json(
      { error: "Failed to delete state" },
      { status: 500 }
    );
  }
}
