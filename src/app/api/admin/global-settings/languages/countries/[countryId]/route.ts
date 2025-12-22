import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/languages/countries/[countryId]
 * Get languages associated with a specific country
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { countryId } = await params;

    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: { id: true, name: true, code: true },
    });

    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const associations = await prisma.countryLanguage.findMany({
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
          },
        },
      },
    });

    // Get all available languages not yet associated
    const associatedIds = associations.map((a) => a.languageId);
    const availableLanguages = await prisma.language.findMany({
      where: {
        isActive: true,
        id: { notIn: associatedIds },
        slug: { not: "other_language" }, // Don't show "Other" for association
      },
      orderBy: { label: "asc" },
      select: {
        id: true,
        code: true,
        label: true,
        labelNative: true,
      },
    });

    return NextResponse.json({
      country,
      languages: associations.map((a) => ({
        ...a.language,
        sortOrder: a.sortOrder,
        isPrimary: a.isPrimary,
        associationId: a.id,
      })),
      availableLanguages,
    });
  } catch (error) {
    console.error("Error fetching country languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch country languages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/languages/countries/[countryId]
 * Add a language to a country
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { countryId } = await params;
    const body = await req.json();
    const { languageId, isPrimary } = body;

    if (!languageId) {
      return NextResponse.json(
        { error: "Language ID is required" },
        { status: 400 }
      );
    }

    // Verify country and language exist
    const country = await prisma.country.findUnique({ where: { id: countryId } });
    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const language = await prisma.language.findUnique({ where: { id: languageId } });
    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Check if association already exists
    const existing = await prisma.countryLanguage.findUnique({
      where: {
        countryId_languageId: { countryId, languageId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This language is already associated with this country" },
        { status: 400 }
      );
    }

    // Get highest sort order
    const maxSort = await prisma.countryLanguage.aggregate({
      where: { countryId },
      _max: { sortOrder: true },
    });

    const association = await prisma.countryLanguage.create({
      data: {
        countryId,
        languageId,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        isPrimary: isPrimary ?? false,
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            label: true,
            labelNative: true,
          },
        },
      },
    });

    return NextResponse.json({ association }, { status: 201 });
  } catch (error) {
    console.error("Error adding language to country:", error);
    return NextResponse.json(
      { error: "Failed to add language to country" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/languages/countries/[countryId]
 * Remove a language from a country
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ countryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { countryId } = await params;
    const { searchParams } = new URL(req.url);
    const languageId = searchParams.get("languageId");

    if (!languageId) {
      return NextResponse.json(
        { error: "Language ID is required" },
        { status: 400 }
      );
    }

    await prisma.countryLanguage.delete({
      where: {
        countryId_languageId: { countryId, languageId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing language from country:", error);
    return NextResponse.json(
      { error: "Failed to remove language from country" },
      { status: 500 }
    );
  }
}
