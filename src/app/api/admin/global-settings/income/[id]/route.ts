import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/income/[id]
 * Fetch a single income range
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

    const incomeRange = await prisma.incomeRange.findUnique({
      where: { id },
      include: {
        country: {
          select: { id: true, name: true, code: true, currency: true },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!incomeRange) {
      return NextResponse.json({ error: "Income range not found" }, { status: 404 });
    }

    return NextResponse.json({ incomeRange });
  } catch (error) {
    console.error("Error fetching income range:", error);
    return NextResponse.json(
      { error: "Failed to fetch income range" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/income/[id]
 * Update an income range
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
      currency,
      period,
      minValue,
      maxValue,
      sortOrder,
      isActive,
    } = body;

    // Check if income range exists
    const existing = await prisma.incomeRange.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Income range not found" }, { status: 404 });
    }

    // If changing slug, check for duplicates
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.incomeRange.findFirst({
        where: {
          slug,
          countryId: existing.countryId,
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "An income range with this slug already exists for this country" },
          { status: 400 }
        );
      }
    }

    const incomeRange = await prisma.incomeRange.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(label && { label }),
        ...(currency && { currency }),
        ...(period && { period }),
        ...(minValue !== undefined && { minValue }),
        ...(maxValue !== undefined && { maxValue }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ incomeRange });
  } catch (error) {
    console.error("Error updating income range:", error);
    return NextResponse.json(
      { error: "Failed to update income range" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/income/[id]
 * Delete an income range
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

    // Check if income range exists and is in use
    const existing = await prisma.incomeRange.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Income range not found" }, { status: 404 });
    }

    // Check if income range is being used
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete income range that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    await prisma.incomeRange.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income range:", error);
    return NextResponse.json(
      { error: "Failed to delete income range" },
      { status: 500 }
    );
  }
}
