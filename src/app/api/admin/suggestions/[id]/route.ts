import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/suggestions/[id]
 * Fetch a single suggestion
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

    const suggestion = await prisma.fieldSuggestion.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestion" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/suggestions/[id]
 * Update suggestion status (approve/reject)
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
    const { status, reviewNote, createLanguage } = body;

    // Validate status
    if (!["APPROVED", "REJECTED", "DUPLICATE", "MERGED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED, REJECTED, DUPLICATE, or MERGED" },
        { status: 400 }
      );
    }

    // Get the suggestion
    const suggestion = await prisma.fieldSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    // If approving a MOTHER_TONGUE suggestion and createLanguage is true, create the language
    let createdLanguage = null;
    if (status === "APPROVED" && suggestion.fieldType === "MOTHER_TONGUE" && createLanguage) {
      // Generate code and slug from suggested value
      const code = suggestion.suggestedValue
        .toLowerCase()
        .replace(/[^a-z]+/g, "")
        .slice(0, 10);
      const slug = suggestion.suggestedValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");

      // Check if language already exists
      const existingLanguage = await prisma.language.findFirst({
        where: {
          OR: [
            { code },
            { slug },
            { label: { equals: suggestion.suggestedValue, mode: "insensitive" } },
          ],
        },
      });

      if (existingLanguage) {
        return NextResponse.json(
          { error: "A language with this name/code already exists" },
          { status: 400 }
        );
      }

      // Get highest sort order
      const maxSort = await prisma.language.aggregate({
        _max: { sortOrder: true },
      });

      createdLanguage = await prisma.language.create({
        data: {
          code,
          slug,
          label: suggestion.suggestedLabel || suggestion.suggestedValue,
          labelNative: null,
          sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
          isActive: true,
          isGlobal: false,
        },
      });
    }

    // Update the suggestion
    const updatedSuggestion = await prisma.fieldSuggestion.update({
      where: { id },
      data: {
        status,
        reviewedById: session.user.id,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      suggestion: updatedSuggestion,
      createdLanguage,
    });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/suggestions/[id]
 * Delete a suggestion
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

    await prisma.fieldSuggestion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    return NextResponse.json(
      { error: "Failed to delete suggestion" },
      { status: 500 }
    );
  }
}
