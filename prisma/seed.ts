import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log("🌱 Seeding subscription plans...");

  const plans = [
    {
      slug: "FREE",
      name: "Free",
      description: "Basic access to the platform with limited features",
      freeCredits: 3,
      walletLimit: 5,
      redeemCredits: 1,
      redeemCycleDays: 15,
      profileLimit: 1,
      priceMonthly: 0,
      priceYearly: 0,
      yearlyDiscountPct: 0,
      sortOrder: 0,
      isActive: true,
      isDefault: true, // Default for new registrations
      color: "gray",
      features: ["1 Active Profile", "3 Free Credits", "Basic Search", "Limited Messaging"],
    },
    {
      slug: "STANDARD",
      name: "Standard",
      description: "Great for getting started with more visibility",
      freeCredits: 5,
      walletLimit: 10,
      redeemCredits: 2,
      redeemCycleDays: 20,
      profileLimit: 1,
      priceMonthly: 5,
      priceYearly: 52.20, // 13% discount
      yearlyDiscountPct: 13,
      sortOrder: 1,
      isActive: true,
      isDefault: false,
      color: "blue",
      features: ["1 Active Profile", "5 Free Credits", "Enhanced Search", "Priority Support"],
    },
    {
      slug: "SILVER",
      name: "Silver",
      description: "Perfect for serious matchmaking with multiple profiles",
      freeCredits: 15,
      walletLimit: 15,
      redeemCredits: 5,
      redeemCycleDays: 30,
      profileLimit: 3,
      priceMonthly: 9,
      priceYearly: 93.96, // 13% discount
      yearlyDiscountPct: 13,
      sortOrder: 2,
      isActive: true,
      isDefault: false,
      color: "slate",
      features: ["3 Active Profiles", "15 Free Credits", "Advanced Filters", "Profile Boost"],
    },
    {
      slug: "GOLD",
      name: "Gold",
      description: "Premium features for dedicated matchmakers",
      freeCredits: 25,
      walletLimit: 25,
      redeemCredits: 5,
      redeemCycleDays: 30,
      profileLimit: 5,
      priceMonthly: 15,
      priceYearly: 160.20, // 11% discount
      yearlyDiscountPct: 11,
      sortOrder: 3,
      isActive: true,
      isDefault: false,
      color: "yellow",
      features: ["5 Active Profiles", "25 Free Credits", "Verified Badge", "Who Viewed Me"],
    },
    {
      slug: "PLATINUM",
      name: "Platinum",
      description: "Elite access with maximum visibility and features",
      freeCredits: 50,
      walletLimit: 50,
      redeemCredits: 5,
      redeemCycleDays: 30,
      profileLimit: 10,
      priceMonthly: 25,
      priceYearly: 267.00, // 11% discount
      yearlyDiscountPct: 11,
      sortOrder: 4,
      isActive: true,
      isDefault: false,
      color: "purple",
      features: ["10 Active Profiles", "50 Free Credits", "Top Search Priority", "Dedicated Support"],
    },
    {
      slug: "PRO",
      name: "Pro",
      description: "Ultimate plan for consultants and matchmaking professionals",
      freeCredits: 50,
      walletLimit: 50,
      redeemCredits: 5,
      redeemCycleDays: 30,
      profileLimit: 50,
      priceMonthly: 99,
      priceYearly: 1057.32, // 11% discount
      yearlyDiscountPct: 11,
      sortOrder: 5,
      isActive: true,
      isDefault: false,
      color: "emerald",
      features: ["50 Active Profiles", "Unlimited Credits", "White Glove Service", "API Access"],
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        freeCredits: plan.freeCredits,
        walletLimit: plan.walletLimit,
        redeemCredits: plan.redeemCredits,
        redeemCycleDays: plan.redeemCycleDays,
        profileLimit: plan.profileLimit,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        yearlyDiscountPct: plan.yearlyDiscountPct,
        sortOrder: plan.sortOrder,
        isActive: plan.isActive,
        isDefault: plan.isDefault,
        color: plan.color,
        features: plan.features,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        freeCredits: plan.freeCredits,
        walletLimit: plan.walletLimit,
        redeemCredits: plan.redeemCredits,
        redeemCycleDays: plan.redeemCycleDays,
        profileLimit: plan.profileLimit,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        yearlyDiscountPct: plan.yearlyDiscountPct,
        sortOrder: plan.sortOrder,
        isActive: plan.isActive,
        isDefault: plan.isDefault,
        color: plan.color,
        features: plan.features,
      },
    });
    console.log(`  ✓ ${plan.name} plan`);
  }

  console.log("✅ Subscription plans seeded successfully!");
}

async function main() {
  await seedSubscriptionPlans();
  // Add more seed functions here as needed
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
