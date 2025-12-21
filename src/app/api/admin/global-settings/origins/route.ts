import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins
 * Fetch all origins with ethnicity/caste counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origins = await prisma.origin.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { ethnicities: true, profiles: true },
        },
      },
    });

    // Get caste counts for each origin
    const originsWithCounts = await Promise.all(
      origins.map(async (origin) => {
        const casteCount = await prisma.caste.count({
          where: {
            ethnicity: {
              originId: origin.id,
            },
          },
        });
        return {
          ...origin,
          ethnicityCount: origin._count.ethnicities,
          casteCount,
          profileCount: origin._count.profiles,
        };
      })
    );

    return NextResponse.json({ origins: originsWithCounts });
  } catch (error) {
    console.error("Error fetching origins:", error);
    return NextResponse.json(
      { error: "Failed to fetch origins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/origins
 * Create a new origin
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      label,
      labelNative,
      emoji,
      description,
      sortOrder,
      isActive,
      level1Label,
      level1LabelPlural,
      level2Label,
      level2LabelPlural,
      level2Enabled,
    } = body;

    // Validate required fields
    if (!slug || !label) {
      return NextResponse.json(
        { error: "Slug and label are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.origin.findUnique({
      where: { slug: slug.toLowerCase().replace(/\s+/g, "_") },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An origin with this slug already exists" },
        { status: 400 }
      );
    }

    const origin = await prisma.origin.create({
      data: {
        slug: slug.toLowerCase().replace(/\s+/g, "_"),
        label,
        labelNative: labelNative || null,
        emoji: emoji || null,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
        level1Label: level1Label || "Ethnicity",
        level1LabelPlural: level1LabelPlural || "Ethnicities",
        level2Label: level2Label || "Caste",
        level2LabelPlural: level2LabelPlural || "Castes",
        level2Enabled: level2Enabled ?? true,
      },
    });

    return NextResponse.json({ origin }, { status: 201 });
  } catch (error) {
    console.error("Error creating origin:", error);
    return NextResponse.json(
      { error: "Failed to create origin" },
      { status: 500 }
    );
  }
}
