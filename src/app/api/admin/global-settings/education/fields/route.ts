import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/education/fields
 * Fetch all education fields with profile counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fields = await prisma.educationField.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    return NextResponse.json({
      fields: fields.map((field) => ({
        ...field,
        profileCount: field._count.profiles,
      })),
    });
  } catch (error) {
    console.error("Error fetching education fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch education fields" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/education/fields
 * Create a new education field
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, label, category, sortOrder, isActive, tags } = body;

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
    const existing = await prisma.educationField.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An education field with this slug already exists" },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.educationField.aggregate({
      _max: { sortOrder: true },
    });

    const educationField = await prisma.educationField.create({
      data: {
        slug: finalSlug,
        label,
        category: category || null,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
        tags: tags || [],
      },
    });

    return NextResponse.json({ educationField }, { status: 201 });
  } catch (error) {
    console.error("Error creating education field:", error);
    return NextResponse.json(
      { error: "Failed to create education field" },
      { status: 500 }
    );
  }
}
