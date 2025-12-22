import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/languages/[id]
 * Fetch a single language with its country associations
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const language = await prisma.language.findUnique({
      where: { id },
      include: {
        countries: {
          include: {
            country: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!language) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    return NextResponse.json({
      language: {
        ...language,
        profileCount: language._count.profiles,
        countries: language.countries.map((cl) => ({
          ...cl.country,
          sortOrder: cl.sortOrder,
          isPrimary: cl.isPrimary,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching language:", error);
    return NextResponse.json(
      { error: "Failed to fetch language" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/global-settings/languages/[id]
 * Update a language
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { code, slug, label, labelNative, sortOrder, isActive, isGlobal } = body;

    // Check if language exists
    const existing = await prisma.language.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Check for duplicate code/slug if changing
    if (code && code !== existing.code) {
      const duplicate = await prisma.language.findUnique({ where: { code } });
      if (duplicate) {
        return NextResponse.json(
          { error: "A language with this code already exists" },
          { status: 400 }
        );
      }
    }

    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.language.findUnique({ where: { slug } });
      if (duplicate) {
        return NextResponse.json(
          { error: "A language with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const language = await prisma.language.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(slug && { slug }),
        ...(label && { label }),
        ...(labelNative !== undefined && { labelNative }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(isGlobal !== undefined && { isGlobal }),
      },
    });

    return NextResponse.json({ language });
  } catch (error) {
    console.error("Error updating language:", error);
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/languages/[id]
 * Delete a language
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if language exists and is in use
    const existing = await prisma.language.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profiles: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    // Prevent deletion of "Other" language
    if (existing.slug === "other_language") {
      return NextResponse.json(
        { error: "Cannot delete the 'Other' language option" },
        { status: 400 }
      );
    }

    // Check if in use
    if (existing._count.profiles > 0) {
      return NextResponse.json(
        { error: "Cannot delete language that is in use by profiles. Consider deactivating it instead." },
        { status: 400 }
      );
    }

    // Delete country associations first
    await prisma.countryLanguage.deleteMany({ where: { languageId: id } });

    // Delete the language
    await prisma.language.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting language:", error);
    return NextResponse.json(
      { error: "Failed to delete language" },
      { status: 500 }
    );
  }
}
