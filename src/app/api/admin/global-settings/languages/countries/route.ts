import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/languages/countries
 * Fetch all countries with their language counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { languages: true },
        },
      },
    });

    return NextResponse.json({
      countries: countries.map((country) => ({
        id: country.id,
        code: country.code,
        name: country.name,
        languageCount: country._count.languages,
      })),
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
