import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/education/levels
 * Fetch all education levels with profile counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const levels = await prisma.educationLevel.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    return NextResponse.json({
      levels: levels.map((level) => ({
        ...level,
        profileCount: level._count.profiles,
      })),
    });
  } catch (error) {
    console.error("Error fetching education levels:", error);
    return NextResponse.json(
      { error: "Failed to fetch education levels" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/education/levels
 * Create a new education level
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, label, level, yearsOfEducation, sortOrder, isActive, tags } = body;

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
    const existing = await prisma.educationLevel.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An education level with this slug already exists" },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.educationLevel.aggregate({
      _max: { sortOrder: true },
    });

    const educationLevel = await prisma.educationLevel.create({
      data: {
        slug: finalSlug,
        label,
        level: level ?? 1,
        yearsOfEducation: yearsOfEducation ?? 0,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
        tags: tags || [],
      },
    });

    return NextResponse.json({ educationLevel }, { status: 201 });
  } catch (error) {
    console.error("Error creating education level:", error);
    return NextResponse.json(
      { error: "Failed to create education level" },
      { status: 500 }
    );
  }
}
