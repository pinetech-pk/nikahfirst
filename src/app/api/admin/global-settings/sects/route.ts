import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/sects
 * Fetch all sects with maslak and profile counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sects = await prisma.sect.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { maslaks: true, profiles: true },
        },
      },
    });

    return NextResponse.json({
      sects: sects.map((sect) => ({
        ...sect,
        maslakCount: sect._count.maslaks,
        profileCount: sect._count.profiles,
      })),
    });
  } catch (error) {
    console.error("Error fetching sects:", error);
    return NextResponse.json(
      { error: "Failed to fetch sects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/sects
 * Create a new sect
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, label, sortOrder, isActive } = body;

    // Validate required fields
    if (!label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Check if slug already exists
    const existing = await prisma.sect.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A sect with this slug already exists" },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.sect.aggregate({
      _max: { sortOrder: true },
    });

    const sect = await prisma.sect.create({
      data: {
        slug: finalSlug,
        label,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ sect }, { status: 201 });
  } catch (error) {
    console.error("Error creating sect:", error);
    return NextResponse.json(
      { error: "Failed to create sect" },
      { status: 500 }
    );
  }
}
