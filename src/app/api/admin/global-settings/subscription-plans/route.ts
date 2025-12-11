import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/subscription-plans
 * Fetch all subscription plans
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/subscription-plans
 * Create a new subscription plan
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
      description,
      freeCredits,
      walletLimit,
      redeemCredits,
      redeemCycleDays,
      profileLimit,
      priceMonthly,
      priceYearly,
      yearlyDiscountPct,
      sortOrder,
      isActive,
      isDefault,
      color,
      features,
    } = body;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug and name are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A plan with this slug already exists" },
        { status: 400 }
      );
    }

    // If this plan is default, unset other defaults
    if (isDefault) {
      await prisma.subscriptionPlan.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        slug,
        name,
        description: description || null,
        freeCredits: freeCredits || 0,
        walletLimit: walletLimit || 5,
        redeemCredits: redeemCredits || 1,
        redeemCycleDays: redeemCycleDays || 15,
        profileLimit: profileLimit || 1,
        priceMonthly: priceMonthly || 0,
        priceYearly: priceYearly || 0,
        yearlyDiscountPct: yearlyDiscountPct || 0,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        color: color || null,
        features: features || null,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}
