import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API endpoint - no authentication required
// Returns only active subscription plans for public pricing page
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        freeCredits: true,
        walletLimit: true,
        redeemCredits: true,
        redeemCycleDays: true,
        profileLimit: true,
        priceMonthly: true,
        priceYearly: true,
        yearlyDiscountPct: true,
        sortOrder: true,
        isDefault: true,
        color: true,
        features: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Convert Decimal to number for JSON serialization
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: Number(plan.priceYearly),
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}
