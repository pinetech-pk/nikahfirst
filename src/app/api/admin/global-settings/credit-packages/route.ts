import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/credit-packages
 * Fetch all credit packages
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const packages = await prisma.creditPackage.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching credit packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit packages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/credit-packages
 * Create a new credit package
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      name,
      credits,
      price,
      bonusCredits,
      savingsPercent,
      isPopular,
      isActive,
      sortOrder,
    } = body;

    // Validate required fields
    if (!slug || !name || credits === undefined || price === undefined) {
      return NextResponse.json(
        { error: "Slug, name, credits, and price are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.creditPackage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A package with this slug already exists" },
        { status: 400 }
      );
    }

    // If this package is popular, unset other popular packages
    if (isPopular) {
      await prisma.creditPackage.updateMany({
        where: { isPopular: true },
        data: { isPopular: false },
      });
    }

    const creditPackage = await prisma.creditPackage.create({
      data: {
        slug,
        name,
        credits,
        price,
        bonusCredits: bonusCredits || 0,
        savingsPercent: savingsPercent || null,
        isPopular: isPopular ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ package: creditPackage }, { status: 201 });
  } catch (error) {
    console.error("Error creating credit package:", error);
    return NextResponse.json(
      { error: "Failed to create credit package" },
      { status: 500 }
    );
  }
}
