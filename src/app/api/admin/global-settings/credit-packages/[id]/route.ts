import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/global-settings/credit-packages/[id]
 * Get a single credit package
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!creditPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ package: creditPackage });
  } catch (error) {
    console.error("Error fetching credit package:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit package" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/global-settings/credit-packages/[id]
 * Update a credit package
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if package exists
    const existing = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // If slug is being changed, check it's unique
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.creditPackage.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A package with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If this package is being set as popular, unset other popular packages
    if (body.isPopular && !existing.isPopular) {
      await prisma.creditPackage.updateMany({
        where: { isPopular: true },
        data: { isPopular: false },
      });
    }

    const creditPackage = await prisma.creditPackage.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        credits: body.credits,
        price: body.price,
        bonusCredits: body.bonusCredits,
        savingsPercent: body.savingsPercent,
        isPopular: body.isPopular,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json({ package: creditPackage });
  } catch (error) {
    console.error("Error updating credit package:", error);
    return NextResponse.json(
      { error: "Failed to update credit package" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/credit-packages/[id]
 * Delete a credit package
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if package exists
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!creditPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    await prisma.creditPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting credit package:", error);
    return NextResponse.json(
      { error: "Failed to delete credit package" },
      { status: 500 }
    );
  }
}
