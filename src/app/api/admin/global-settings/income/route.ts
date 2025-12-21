import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/income
 * Fetch all income ranges grouped by country
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    // If countryId is provided, fetch income ranges for that country
    if (countryId) {
      const incomeRanges = await prisma.incomeRange.findMany({
        where: { countryId },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { profiles: true },
          },
        },
      });

      const country = await prisma.country.findUnique({
        where: { id: countryId },
        select: { id: true, name: true, code: true, currency: true, currencySymbol: true },
      });

      return NextResponse.json({ incomeRanges, country });
    }

    // Fetch all countries that have income ranges defined
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        currency: true,
        currencySymbol: true,
        _count: {
          select: { incomeRanges: true },
        },
      },
    });

    // Also fetch global income ranges (countryId = null)
    const globalRanges = await prisma.incomeRange.findMany({
      where: { countryId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    return NextResponse.json({
      countries: countries.map((c) => ({
        ...c,
        incomeRangeCount: c._count.incomeRanges,
      })),
      globalRanges,
    });
  } catch (error) {
    console.error("Error fetching income ranges:", error);
    return NextResponse.json(
      { error: "Failed to fetch income ranges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/income
 * Create a new income range
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      countryId,
      slug,
      label,
      currency,
      period,
      minValue,
      maxValue,
      sortOrder,
      isActive,
    } = body;

    // Validate required fields
    if (!label || !currency || !period) {
      return NextResponse.json(
        { error: "Label, currency, and period are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Check if slug already exists for this country
    const existing = await prisma.incomeRange.findFirst({
      where: {
        slug: finalSlug,
        countryId: countryId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An income range with this slug already exists for this country" },
        { status: 400 }
      );
    }

    // Get the highest sort order for this country
    const maxSortOrder = await prisma.incomeRange.aggregate({
      where: { countryId: countryId || null },
      _max: { sortOrder: true },
    });

    const incomeRange = await prisma.incomeRange.create({
      data: {
        countryId: countryId || null,
        slug: finalSlug,
        label,
        currency,
        period,
        minValue: minValue ?? null,
        maxValue: maxValue ?? null,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ incomeRange }, { status: 201 });
  } catch (error) {
    console.error("Error creating income range:", error);
    return NextResponse.json(
      { error: "Failed to create income range" },
      { status: 500 }
    );
  }
}
