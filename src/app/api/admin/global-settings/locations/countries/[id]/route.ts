import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/countries/[id]
 * Fetch a single country with its states
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

    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        statesProvinces: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: { cities: true },
            },
          },
        },
      },
    });

    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    return NextResponse.json({ country });
  } catch (error) {
    console.error("Error fetching country:", error);
    return NextResponse.json(
      { error: "Failed to fetch country" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/locations/countries/[id]
 * Update a country
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
    const { code, name, nameNative, phoneCode, currency, sortOrder, isActive } = body;

    // Check if country exists
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    // If changing code, check for duplicates
    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.country.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A country with this code already exists" },
          { status: 400 }
        );
      }
    }

    const country = await prisma.country.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(nameNative !== undefined && { nameNative }),
        ...(phoneCode !== undefined && { phoneCode }),
        ...(currency !== undefined && { currency }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ country });
  } catch (error) {
    console.error("Error updating country:", error);
    return NextResponse.json(
      { error: "Failed to update country" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/locations/countries/[id]
 * Delete a country
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

    // Check if country exists
    const existing = await prisma.country.findUnique({
      where: { id },
      include: {
        _count: {
          select: { statesProvinces: true, profilesOrigin: true, profilesLiving: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    // Check if country is being used
    if (existing._count.profilesOrigin > 0 || existing._count.profilesLiving > 0) {
      return NextResponse.json(
        { error: "Cannot delete country that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    // Delete will cascade to states and cities
    await prisma.country.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting country:", error);
    return NextResponse.json(
      { error: "Failed to delete country" },
      { status: 500 }
    );
  }
}
