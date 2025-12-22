import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/languages
 * Fetch all languages with profile counts and country associations
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    // If countryId provided, return languages for that country
    if (countryId) {
      const countryLanguages = await prisma.countryLanguage.findMany({
        where: { countryId },
        orderBy: { sortOrder: "asc" },
        include: {
          language: {
            select: {
              id: true,
              code: true,
              slug: true,
              label: true,
              labelNative: true,
              isActive: true,
              isGlobal: true,
            },
          },
        },
      });

      return NextResponse.json({
        languages: countryLanguages.map((cl) => ({
          ...cl.language,
          sortOrder: cl.sortOrder,
          isPrimary: cl.isPrimary,
          associationId: cl.id,
        })),
      });
    }

    // Return all languages with counts
    const languages = await prisma.language.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            profiles: true,
            countries: true,
          },
        },
      },
    });

    return NextResponse.json({
      languages: languages.map((lang) => ({
        ...lang,
        profileCount: lang._count.profiles,
        countryCount: lang._count.countries,
      })),
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/languages
 * Create a new language
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, slug, label, labelNative, sortOrder, isActive, isGlobal } = body;

    // Validate required fields
    if (!code || !label) {
      return NextResponse.json(
        { error: "Code and label are required" },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || label.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Check for duplicates
    const existing = await prisma.language.findFirst({
      where: { OR: [{ code }, { slug: finalSlug }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A language with this code or slug already exists" },
        { status: 400 }
      );
    }

    // Get highest sort order
    const maxSortOrder = await prisma.language.aggregate({
      _max: { sortOrder: true },
    });

    const language = await prisma.language.create({
      data: {
        code,
        slug: finalSlug,
        label,
        labelNative: labelNative || null,
        sortOrder: sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
        isGlobal: isGlobal ?? false,
      },
    });

    return NextResponse.json({ language }, { status: 201 });
  } catch (error) {
    console.error("Error creating language:", error);
    return NextResponse.json(
      { error: "Failed to create language" },
      { status: 500 }
    );
  }
}
