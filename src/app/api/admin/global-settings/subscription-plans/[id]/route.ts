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
 * GET /api/admin/global-settings/subscription-plans/[id]
 * Get a single subscription plan
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plan" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/global-settings/subscription-plans/[id]
 * Update a subscription plan
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if plan exists
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // If slug is being changed, check it's unique
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.subscriptionPlan.findUnique({
        where: { slug: body.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "A plan with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If this plan is being set as default, unset other defaults
    if (body.isDefault && !existing.isDefault) {
      await prisma.subscriptionPlan.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        slug: body.slug,
        name: body.name,
        description: body.description,
        freeCredits: body.freeCredits,
        walletLimit: body.walletLimit,
        redeemCredits: body.redeemCredits,
        redeemCycleDays: body.redeemCycleDays,
        profileLimit: body.profileLimit,
        priceMonthly: body.priceMonthly,
        priceYearly: body.priceYearly,
        yearlyDiscountPct: body.yearlyDiscountPct,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
        isDefault: body.isDefault,
        color: body.color,
        features: body.features,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to update subscription plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/global-settings/subscription-plans/[id]
 * Delete a subscription plan (only if no users are using it)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if plan exists and has users
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan._count.users > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete plan. ${plan._count.users} users are currently on this plan.`,
        },
        { status: 400 }
      );
    }

    if (plan.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default plan. Set another plan as default first." },
        { status: 400 }
      );
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
}
