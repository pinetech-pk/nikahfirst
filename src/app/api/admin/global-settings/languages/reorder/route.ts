import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/global-settings/languages/reorder
 * Reorder languages globally or within a country
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderedIds, countryId } = body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds array is required" },
        { status: 400 }
      );
    }

    if (countryId) {
      // Reorder within a country
      const updates = orderedIds.map((languageId: string, index: number) =>
        prisma.countryLanguage.update({
          where: {
            countryId_languageId: { countryId, languageId },
          },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);
    } else {
      // Reorder globally
      const updates = orderedIds.map((id: string, index: number) =>
        prisma.language.update({
          where: { id },
          data: { sortOrder: index },
        })
      );

      await prisma.$transaction(updates);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering languages:", error);
    return NextResponse.json(
      { error: "Failed to reorder languages" },
      { status: 500 }
    );
  }
}
