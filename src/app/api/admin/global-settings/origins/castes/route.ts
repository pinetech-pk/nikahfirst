import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins/castes?ethnicityId=xxx
 * Fetch castes for an ethnicity
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ethnicityId = searchParams.get("ethnicityId");

    if (!ethnicityId) {
      return NextResponse.json(
        { error: "ethnicityId is required" },
        { status: 400 }
      );
    }

    const castes = await prisma.caste.findMany({
      where: { ethnicityId },
      orderBy: { sortOrder: "asc" },
      include: {
        ethnicity: {
          select: {
            label: true,
            origin: { select: { label: true, level2Label: true } },
          },
        },
        _count: { select: { profiles: true } },
      },
    });

    return NextResponse.json({ castes });
  } catch (error) {
    console.error("Error fetching castes:", error);
    return NextResponse.json(
      { error: "Failed to fetch castes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/origins/castes
 * Create a new caste
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ethnicityId, slug, label, labelNative, sortOrder, isPopular, isActive } = body;

    // Validate required fields
    if (!ethnicityId || !label) {
      return NextResponse.json(
        { error: "Ethnicity ID and label are required" },
        { status: 400 }
      );
    }

    // Check if ethnicity exists and get origin's level2Label
    const ethnicity = await prisma.ethnicity.findUnique({
      where: { id: ethnicityId },
      include: { origin: { select: { level2Label: true } } },
    });

    if (!ethnicity) {
      return NextResponse.json(
        { error: "Ethnicity not found" },
        { status: 404 }
      );
    }

    // Generate slug if not provided
    const casteSlug = slug || label.toLowerCase().replace(/\s+/g, "_");

    // Check if caste with same slug exists in this ethnicity
    const existing = await prisma.caste.findUnique({
      where: {
        ethnicityId_slug: { ethnicityId, slug: casteSlug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A ${ethnicity.origin.level2Label.toLowerCase()} with this name already exists` },
        { status: 400 }
      );
    }

    const caste = await prisma.caste.create({
      data: {
        ethnicityId,
        slug: casteSlug,
        label,
        labelNative: labelNative || null,
        sortOrder: sortOrder || 0,
        isPopular: isPopular ?? false,
        isActive: isActive ?? true,
      },
      include: {
        ethnicity: {
          select: {
            label: true,
            origin: { select: { label: true, level2Label: true } },
          },
        },
      },
    });

    return NextResponse.json({ caste }, { status: 201 });
  } catch (error) {
    console.error("Error creating caste:", error);
    return NextResponse.json(
      { error: "Failed to create caste" },
      { status: 500 }
    );
  }
}
