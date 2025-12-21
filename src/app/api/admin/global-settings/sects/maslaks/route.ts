import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/sects/maslaks
 * Fetch maslaks for a specific sect
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectId = searchParams.get("sectId");

    if (!sectId) {
      return NextResponse.json(
        { error: "sectId is required" },
        { status: 400 }
      );
    }

    const maslaks = await prisma.maslak.findMany({
      where: { sectId },
      orderBy: { sortOrder: "asc" },
      include: {
        sect: {
          select: { id: true, label: true },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    return NextResponse.json({
      maslaks: maslaks.map((maslak) => ({
        ...maslak,
        profileCount: maslak._count.profiles,
      })),
    });
  } catch (error) {
    console.error("Error fetching maslaks:", error);
    return NextResponse.json(
      { error: "Failed to fetch maslaks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/sects/maslaks
 * Create a new maslak
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sectId, slug, label, description, sortOrder, isActive } = body;

    // Validate required fields
    if (!sectId || !label) {
      return NextResponse.json(
        { error: "sectId and label are required" },
        { status: 400 }
      );
    }

    // Check if sect exists
    const sect = await prisma.sect.findUnique({ where: { id: sectId } });
    if (!sect) {
      return NextResponse.json(
        { error: "Sect not found" },
        { status: 404 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Check if slug already exists for this sect
    const existing = await prisma.maslak.findFirst({
      where: { sectId, slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A maslak with this slug already exists for this sect" },
        { status: 400 }
      );
    }

    // Get the highest sort order for this sect
    const maxSortOrder = await prisma.maslak.aggregate({
      where: { sectId },
      _max: { sortOrder: true },
    });

    const maslak = await prisma.maslak.create({
      data: {
        sectId,
        slug: finalSlug,
        label,
        description: description || null,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ maslak }, { status: 201 });
  } catch (error) {
    console.error("Error creating maslak:", error);
    return NextResponse.json(
      { error: "Failed to create maslak" },
      { status: 500 }
    );
  }
}
