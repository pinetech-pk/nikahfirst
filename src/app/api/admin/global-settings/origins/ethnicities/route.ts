import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/origins/ethnicities?originId=xxx
 * Fetch ethnicities for an origin
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const originId = searchParams.get("originId");

    if (!originId) {
      return NextResponse.json(
        { error: "originId is required" },
        { status: 400 }
      );
    }

    const ethnicities = await prisma.ethnicity.findMany({
      where: { originId },
      orderBy: { sortOrder: "asc" },
      include: {
        origin: { select: { label: true, level1Label: true, level2Label: true } },
        _count: { select: { castes: true, profiles: true } },
      },
    });

    return NextResponse.json({ ethnicities });
  } catch (error) {
    console.error("Error fetching ethnicities:", error);
    return NextResponse.json(
      { error: "Failed to fetch ethnicities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/origins/ethnicities
 * Create a new ethnicity
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { originId, slug, label, labelNative, sortOrder, isPopular, isActive } = body;

    // Validate required fields
    if (!originId || !label) {
      return NextResponse.json(
        { error: "Origin ID and label are required" },
        { status: 400 }
      );
    }

    // Check if origin exists
    const origin = await prisma.origin.findUnique({
      where: { id: originId },
    });

    if (!origin) {
      return NextResponse.json(
        { error: "Origin not found" },
        { status: 404 }
      );
    }

    // Generate slug if not provided
    const ethnicitySlug = slug || label.toLowerCase().replace(/\s+/g, "_");

    // Check if ethnicity with same slug exists in this origin
    const existing = await prisma.ethnicity.findUnique({
      where: {
        originId_slug: { originId, slug: ethnicitySlug },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A ${origin.level1Label.toLowerCase()} with this name already exists` },
        { status: 400 }
      );
    }

    const ethnicity = await prisma.ethnicity.create({
      data: {
        originId,
        slug: ethnicitySlug,
        label,
        labelNative: labelNative || null,
        sortOrder: sortOrder || 0,
        isPopular: isPopular ?? false,
        isActive: isActive ?? true,
      },
      include: {
        origin: { select: { label: true, level1Label: true } },
      },
    });

    return NextResponse.json({ ethnicity }, { status: 201 });
  } catch (error) {
    console.error("Error creating ethnicity:", error);
    return NextResponse.json(
      { error: "Failed to create ethnicity" },
      { status: 500 }
    );
  }
}
