import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/suggestions
 * Fetch all suggestions with filtering options
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, etc.
    const fieldType = searchParams.get("fieldType"); // MOTHER_TONGUE, CASTE, etc.

    const suggestions = await prisma.fieldSuggestion.findMany({
      where: {
        ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" | "DUPLICATE" | "MERGED" }),
        ...(fieldType && { fieldType: fieldType as "CASTE" | "ETHNICITY" | "CITY" | "EDUCATION_FIELD" | "MOTHER_TONGUE" | "OTHER" }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get counts by status
    const counts = await prisma.fieldSuggestion.groupBy({
      by: ["status"],
      _count: true,
    });

    const countsByStatus = counts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      suggestions,
      counts: {
        pending: countsByStatus.PENDING || 0,
        approved: countsByStatus.APPROVED || 0,
        rejected: countsByStatus.REJECTED || 0,
        total: suggestions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
