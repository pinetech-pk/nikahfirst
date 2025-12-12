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
      isDefault: true,
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
      priceYearly: 52.20,
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
      priceYearly: 93.96,
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
      priceYearly: 160.20,
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
      priceYearly: 267.00,
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
      priceYearly: 1057.32,
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

async function seedCreditActions() {
  console.log("🌱 Seeding credit actions...");

  const actions = [
    {
      slug: "REQUEST_CONNECTION",
      name: "Request Connection",
      description: "Send a connection request to another user",
      category: "connection",
      creditCost: 1,
      durationDays: null,
      sortOrder: 0,
    },
    {
      slug: "ACCESS_PHOTOS",
      name: "Access Profile Photos",
      description: "View all photos of a profile (if not private)",
      category: "access",
      creditCost: 2,
      durationDays: null,
      sortOrder: 1,
    },
    {
      slug: "ACCESS_INCOME",
      name: "Access Income Details",
      description: "View income information of a profile (if not private)",
      category: "access",
      creditCost: 2,
      durationDays: null,
      sortOrder: 2,
    },
    {
      slug: "ACCESS_CONTACT",
      name: "Access Contact Information",
      description: "View contact details of a profile (if not private)",
      category: "access",
      creditCost: 10,
      durationDays: null,
      sortOrder: 3,
    },
    {
      slug: "DIRECT_MESSAGE",
      name: "Direct Message",
      description: "Send a direct message to a user without connection",
      category: "connection",
      creditCost: 10,
      durationDays: null,
      sortOrder: 4,
    },
    {
      slug: "BOOST_WEEK",
      name: "Boost Visibility (1 Week)",
      description: "Increase profile visibility for 7 days",
      category: "boost",
      creditCost: 7,
      durationDays: 7,
      sortOrder: 5,
    },
    {
      slug: "BOOST_FORTNIGHT",
      name: "Boost Visibility (15 Days)",
      description: "Increase profile visibility for 15 days",
      category: "boost",
      creditCost: 15,
      durationDays: 15,
      sortOrder: 6,
    },
  ];

  for (const action of actions) {
    await prisma.creditAction.upsert({
      where: { slug: action.slug },
      update: {
        name: action.name,
        description: action.description,
        category: action.category,
        creditCost: action.creditCost,
        durationDays: action.durationDays,
        sortOrder: action.sortOrder,
        isActive: true,
      },
      create: {
        slug: action.slug,
        name: action.name,
        description: action.description,
        category: action.category,
        creditCost: action.creditCost,
        durationDays: action.durationDays,
        sortOrder: action.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ ${action.name} (${action.creditCost} credits)`);
  }

  console.log("✅ Credit actions seeded successfully!");
}

async function seedCreditPackages() {
  console.log("🌱 Seeding credit packages...");

  const packages = [
    {
      slug: "PACK_5",
      name: "Starter Pack",
      credits: 5,
      price: 15,
      bonusCredits: 0,
      savingsPercent: null,
      isPopular: false,
      sortOrder: 0,
    },
    {
      slug: "PACK_7",
      name: "Basic Pack",
      credits: 7,
      price: 17,
      bonusCredits: 0,
      savingsPercent: 19, // $2.43/credit vs $3/credit
      isPopular: false,
      sortOrder: 1,
    },
    {
      slug: "PACK_11",
      name: "Value Pack",
      credits: 11,
      price: 20,
      bonusCredits: 0,
      savingsPercent: 39, // $1.82/credit vs $3/credit
      isPopular: true, // Mark as popular
      sortOrder: 2,
    },
    {
      slug: "PACK_17",
      name: "Premium Pack",
      credits: 17,
      price: 25,
      bonusCredits: 0,
      savingsPercent: 51, // $1.47/credit vs $3/credit
      isPopular: false,
      sortOrder: 3,
    },
    {
      slug: "PACK_23",
      name: "Ultimate Pack",
      credits: 23,
      price: 30,
      bonusCredits: 0,
      savingsPercent: 57, // $1.30/credit vs $3/credit
      isPopular: false,
      sortOrder: 4,
    },
  ];

  for (const pkg of packages) {
    await prisma.creditPackage.upsert({
      where: { slug: pkg.slug },
      update: {
        name: pkg.name,
        credits: pkg.credits,
        price: pkg.price,
        bonusCredits: pkg.bonusCredits,
        savingsPercent: pkg.savingsPercent,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
        isActive: true,
      },
      create: {
        slug: pkg.slug,
        name: pkg.name,
        credits: pkg.credits,
        price: pkg.price,
        bonusCredits: pkg.bonusCredits,
        savingsPercent: pkg.savingsPercent,
        isPopular: pkg.isPopular,
        sortOrder: pkg.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ ${pkg.name} (${pkg.credits} credits for $${pkg.price})`);
  }

  console.log("✅ Credit packages seeded successfully!");
}

async function seedPaymentSettings() {
  console.log("🌱 Seeding payment settings...");

  const settings = [
    {
      method: "BANK_TRANSFER" as const,
      label: "Bank Transfer",
      instructions: "Please transfer the exact amount to our bank account. Include your request number in the transfer reference/description.\n\nProcessing time: 1-2 business days after payment confirmation.",
      bankName: "HBL (Habib Bank Limited)",
      accountTitle: "NikahFirst Services",
      accountNumber: "1234567890123",
      iban: "PK00HABB0001234567890123",
      sortOrder: 0,
    },
    {
      method: "JAZZCASH" as const,
      label: "JazzCash",
      instructions: "Send payment to our JazzCash account. Include your request number in the reference.\n\nProcessing time: Same day after payment confirmation.",
      accountTitle: "NikahFirst Services",
      mobileNumber: "03001234567",
      sortOrder: 1,
    },
    {
      method: "EASYPAISA" as const,
      label: "EasyPaisa",
      instructions: "Send payment to our EasyPaisa account. Include your request number in the reference.\n\nProcessing time: Same day after payment confirmation.",
      accountTitle: "NikahFirst Services",
      mobileNumber: "03451234567",
      sortOrder: 2,
    },
  ];

  for (const setting of settings) {
    await prisma.paymentSetting.upsert({
      where: { method: setting.method },
      update: {
        label: setting.label,
        instructions: setting.instructions,
        bankName: setting.bankName || null,
        accountTitle: setting.accountTitle || null,
        accountNumber: setting.accountNumber || null,
        iban: setting.iban || null,
        mobileNumber: setting.mobileNumber || null,
        sortOrder: setting.sortOrder,
        isActive: true,
      },
      create: {
        method: setting.method,
        label: setting.label,
        instructions: setting.instructions,
        bankName: setting.bankName || null,
        accountTitle: setting.accountTitle || null,
        accountNumber: setting.accountNumber || null,
        iban: setting.iban || null,
        mobileNumber: setting.mobileNumber || null,
        sortOrder: setting.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ✓ ${setting.label}`);
  }

  console.log("✅ Payment settings seeded successfully!");
}

async function main() {
  await seedSubscriptionPlans();
  await seedCreditActions();
  await seedCreditPackages();
  await seedPaymentSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
