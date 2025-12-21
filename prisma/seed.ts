import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================
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
      update: plan,
      create: plan,
    });
    console.log(`  ✓ ${plan.name} plan`);
  }

  console.log("✅ Subscription plans seeded successfully!");
}

// ============================================================================
// CREDIT ACTIONS
// ============================================================================
async function seedCreditActions() {
  console.log("🌱 Seeding credit actions...");

  const actions = [
    { slug: "REQUEST_CONNECTION", name: "Request Connection", description: "Send a connection request to another user", category: "connection", creditCost: 1, durationDays: null, sortOrder: 0 },
    { slug: "ACCESS_PHOTOS", name: "Access Profile Photos", description: "View all photos of a profile", category: "access", creditCost: 2, durationDays: null, sortOrder: 1 },
    { slug: "ACCESS_INCOME", name: "Access Income Details", description: "View income information of a profile", category: "access", creditCost: 2, durationDays: null, sortOrder: 2 },
    { slug: "ACCESS_CONTACT", name: "Access Contact Information", description: "View contact details of a profile", category: "access", creditCost: 10, durationDays: null, sortOrder: 3 },
    { slug: "DIRECT_MESSAGE", name: "Direct Message", description: "Send a direct message to a user without connection", category: "connection", creditCost: 10, durationDays: null, sortOrder: 4 },
    { slug: "BOOST_WEEK", name: "Boost Visibility (1 Week)", description: "Increase profile visibility for 7 days", category: "boost", creditCost: 7, durationDays: 7, sortOrder: 5 },
    { slug: "BOOST_FORTNIGHT", name: "Boost Visibility (15 Days)", description: "Increase profile visibility for 15 days", category: "boost", creditCost: 15, durationDays: 15, sortOrder: 6 },
  ];

  for (const action of actions) {
    await prisma.creditAction.upsert({
      where: { slug: action.slug },
      update: { ...action, isActive: true },
      create: { ...action, isActive: true },
    });
    console.log(`  ✓ ${action.name} (${action.creditCost} credits)`);
  }

  console.log("✅ Credit actions seeded successfully!");
}

// ============================================================================
// CREDIT PACKAGES
// ============================================================================
async function seedCreditPackages() {
  console.log("🌱 Seeding credit packages...");

  const packages = [
    { slug: "PACK_5", name: "Starter Pack", credits: 5, price: 15, bonusCredits: 0, savingsPercent: null, isPopular: false, sortOrder: 0 },
    { slug: "PACK_7", name: "Basic Pack", credits: 7, price: 17, bonusCredits: 0, savingsPercent: 19, isPopular: false, sortOrder: 1 },
    { slug: "PACK_11", name: "Value Pack", credits: 11, price: 20, bonusCredits: 0, savingsPercent: 39, isPopular: true, sortOrder: 2 },
    { slug: "PACK_17", name: "Premium Pack", credits: 17, price: 25, bonusCredits: 0, savingsPercent: 51, isPopular: false, sortOrder: 3 },
    { slug: "PACK_23", name: "Ultimate Pack", credits: 23, price: 30, bonusCredits: 0, savingsPercent: 57, isPopular: false, sortOrder: 4 },
  ];

  for (const pkg of packages) {
    await prisma.creditPackage.upsert({
      where: { slug: pkg.slug },
      update: { ...pkg, isActive: true },
      create: { ...pkg, isActive: true },
    });
    console.log(`  ✓ ${pkg.name} (${pkg.credits} credits for $${pkg.price})`);
  }

  console.log("✅ Credit packages seeded successfully!");
}

// ============================================================================
// PAYMENT SETTINGS
// ============================================================================
async function seedPaymentSettings() {
  console.log("🌱 Seeding payment settings...");

  const settings = [
    { method: "BANK_TRANSFER" as const, label: "Bank Transfer", instructions: "Please transfer the exact amount to our bank account. Include your request number in the transfer reference/description.\n\nProcessing time: 1-2 business days after payment confirmation.", bankName: "HBL (Habib Bank Limited)", accountTitle: "NikahFirst Services", accountNumber: "1234567890123", iban: "PK00HABB0001234567890123", mobileNumber: null, sortOrder: 0 },
    { method: "JAZZCASH" as const, label: "JazzCash", instructions: "Send payment to our JazzCash account. Include your request number in the reference.\n\nProcessing time: Same day after payment confirmation.", bankName: null, accountTitle: "NikahFirst Services", accountNumber: null, iban: null, mobileNumber: "03001234567", sortOrder: 1 },
    { method: "EASYPAISA" as const, label: "EasyPaisa", instructions: "Send payment to our EasyPaisa account. Include your request number in the reference.\n\nProcessing time: Same day after payment confirmation.", bankName: null, accountTitle: "NikahFirst Services", accountNumber: null, iban: null, mobileNumber: "03451234567", sortOrder: 2 },
  ];

  for (const setting of settings) {
    await prisma.paymentSetting.upsert({
      where: { method: setting.method },
      update: { ...setting, isActive: true },
      create: { ...setting, isActive: true },
    });
    console.log(`  ✓ ${setting.label}`);
  }

  console.log("✅ Payment settings seeded successfully!");
}

// ============================================================================
// ORIGINS & ETHNICITIES
// ============================================================================
async function seedOriginsAndEthnicities() {
  console.log("🌱 Seeding origins and ethnicities...");

  // Pakistani Origin (primary)
  const pakistaniOrigin = await prisma.origin.upsert({
    where: { slug: "pakistani" },
    update: { label: "Pakistani", labelNative: "پاکستانی", emoji: "🇵🇰", sortOrder: 0, isActive: true },
    create: { slug: "pakistani", label: "Pakistani", labelNative: "پاکستانی", emoji: "🇵🇰", sortOrder: 0, isActive: true },
  });
  console.log("  ✓ Pakistani origin");

  // Pakistani Ethnicities
  const pakistaniEthnicities = [
    { slug: "punjabi", label: "Punjabi", labelNative: "پنجابی", sortOrder: 0, isPopular: true },
    { slug: "sindhi", label: "Sindhi", labelNative: "سندھی", sortOrder: 1, isPopular: true },
    { slug: "pashtun", label: "Pashtun/Pathan", labelNative: "پشتون", sortOrder: 2, isPopular: true },
    { slug: "balochi", label: "Balochi", labelNative: "بلوچی", sortOrder: 3, isPopular: true },
    { slug: "muhajir", label: "Muhajir/Urdu Speaking", labelNative: "مہاجر", sortOrder: 4, isPopular: true },
    { slug: "kashmiri", label: "Kashmiri", labelNative: "کشمیری", sortOrder: 5, isPopular: true },
    { slug: "saraiki", label: "Saraiki", labelNative: "سرائیکی", sortOrder: 6, isPopular: false },
    { slug: "hazara", label: "Hazara", labelNative: "ہزارہ", sortOrder: 7, isPopular: false },
    { slug: "gilgiti", label: "Gilgiti", labelNative: "گلگتی", sortOrder: 8, isPopular: false },
    { slug: "baltistani", label: "Baltistani", labelNative: "بلتستانی", sortOrder: 9, isPopular: false },
    { slug: "chitrali", label: "Chitrali", labelNative: "چترالی", sortOrder: 10, isPopular: false },
    { slug: "brahui", label: "Brahui", labelNative: "براہوی", sortOrder: 11, isPopular: false },
    { slug: "hindko", label: "Hindko", labelNative: "ہندکو", sortOrder: 12, isPopular: false },
    { slug: "other_pakistani", label: "Other", sortOrder: 99, isPopular: false },
  ];

  for (const eth of pakistaniEthnicities) {
    await prisma.ethnicity.upsert({
      where: { originId_slug: { originId: pakistaniOrigin.id, slug: eth.slug } },
      update: { ...eth, isActive: true },
      create: { ...eth, originId: pakistaniOrigin.id, isActive: true },
    });
  }
  console.log(`  ✓ ${pakistaniEthnicities.length} Pakistani ethnicities`);

  // Indian Origin
  const indianOrigin = await prisma.origin.upsert({
    where: { slug: "indian" },
    update: { label: "Indian", labelNative: "भारतीय", emoji: "🇮🇳", sortOrder: 1, isActive: true },
    create: { slug: "indian", label: "Indian", labelNative: "भारतीय", emoji: "🇮🇳", sortOrder: 1, isActive: true },
  });
  console.log("  ✓ Indian origin");

  const indianEthnicities = [
    { slug: "indian_punjabi", label: "Punjabi", sortOrder: 0, isPopular: true },
    { slug: "indian_gujarati", label: "Gujarati", sortOrder: 1, isPopular: true },
    { slug: "indian_hyderabadi", label: "Hyderabadi", sortOrder: 2, isPopular: true },
    { slug: "indian_kashmiri", label: "Kashmiri", sortOrder: 3, isPopular: true },
    { slug: "indian_malayali", label: "Malayali", sortOrder: 4, isPopular: false },
    { slug: "indian_tamil", label: "Tamil", sortOrder: 5, isPopular: false },
    { slug: "indian_bengali", label: "Bengali", sortOrder: 6, isPopular: false },
    { slug: "indian_bihari", label: "Bihari", sortOrder: 7, isPopular: false },
    { slug: "indian_other", label: "Other", sortOrder: 99, isPopular: false },
  ];

  for (const eth of indianEthnicities) {
    await prisma.ethnicity.upsert({
      where: { originId_slug: { originId: indianOrigin.id, slug: eth.slug } },
      update: { ...eth, isActive: true },
      create: { ...eth, originId: indianOrigin.id, isActive: true },
    });
  }
  console.log(`  ✓ ${indianEthnicities.length} Indian ethnicities`);

  // Bangladeshi Origin
  const bangladeshiOrigin = await prisma.origin.upsert({
    where: { slug: "bangladeshi" },
    update: { label: "Bangladeshi", labelNative: "বাংলাদেশী", emoji: "🇧🇩", sortOrder: 2, isActive: true },
    create: { slug: "bangladeshi", label: "Bangladeshi", labelNative: "বাংলাদেশী", emoji: "🇧🇩", sortOrder: 2, isActive: true },
  });

  await prisma.ethnicity.upsert({
    where: { originId_slug: { originId: bangladeshiOrigin.id, slug: "bengali" } },
    update: { label: "Bengali", sortOrder: 0, isPopular: true, isActive: true },
    create: { slug: "bengali", label: "Bengali", originId: bangladeshiOrigin.id, sortOrder: 0, isPopular: true, isActive: true },
  });
  console.log("  ✓ Bangladeshi origin with ethnicities");

  // Other Origins (Arab, Afghan, Turkish, etc.)
  const otherOrigins = [
    { slug: "arab", label: "Arab", emoji: "🌍", sortOrder: 3 },
    { slug: "afghan", label: "Afghan", emoji: "🇦🇫", sortOrder: 4 },
    { slug: "turkish", label: "Turkish", emoji: "🇹🇷", sortOrder: 5 },
    { slug: "indonesian", label: "Indonesian", emoji: "🇮🇩", sortOrder: 6 },
    { slug: "malaysian", label: "Malaysian", emoji: "🇲🇾", sortOrder: 7 },
    { slug: "african", label: "African", emoji: "🌍", sortOrder: 8 },
    { slug: "european_convert", label: "European (Convert)", emoji: "🌍", sortOrder: 9 },
    { slug: "american_convert", label: "American (Convert)", emoji: "🌎", sortOrder: 10 },
    { slug: "other", label: "Other", emoji: "🌐", sortOrder: 99 },
  ];

  for (const origin of otherOrigins) {
    const created = await prisma.origin.upsert({
      where: { slug: origin.slug },
      update: { ...origin, isActive: true },
      create: { ...origin, isActive: true },
    });
    // Add a default ethnicity for each origin
    await prisma.ethnicity.upsert({
      where: { originId_slug: { originId: created.id, slug: `${origin.slug}_default` } },
      update: { label: origin.label, sortOrder: 0, isActive: true },
      create: { slug: `${origin.slug}_default`, label: origin.label, originId: created.id, sortOrder: 0, isActive: true },
    });
  }
  console.log(`  ✓ ${otherOrigins.length} other origins`);

  console.log("✅ Origins and ethnicities seeded successfully!");
}

// ============================================================================
// SECTS & MASLAKS
// ============================================================================
async function seedSectsAndMaslaks() {
  console.log("🌱 Seeding sects and maslaks...");

  // Sunni Sect
  const sunni = await prisma.sect.upsert({
    where: { slug: "sunni" },
    update: { label: "Sunni", sortOrder: 0, isActive: true },
    create: { slug: "sunni", label: "Sunni", sortOrder: 0, isActive: true },
  });

  const sunniMaslaks = [
    { slug: "hanafi", label: "Hanafi", sortOrder: 0 },
    { slug: "barelvi", label: "Barelvi", sortOrder: 1 },
    { slug: "deobandi", label: "Deobandi", sortOrder: 2 },
    { slug: "ahle_hadith", label: "Ahle Hadith / Salafi", sortOrder: 3 },
    { slug: "shafii", label: "Shafi'i", sortOrder: 4 },
    { slug: "maliki", label: "Maliki", sortOrder: 5 },
    { slug: "hanbali", label: "Hanbali", sortOrder: 6 },
    { slug: "sunni_other", label: "Other Sunni", sortOrder: 99 },
  ];

  for (const maslak of sunniMaslaks) {
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: sunni.id, slug: maslak.slug } },
      update: { ...maslak, isActive: true },
      create: { ...maslak, sectId: sunni.id, isActive: true },
    });
  }
  console.log(`  ✓ Sunni with ${sunniMaslaks.length} maslaks`);

  // Shia Sect
  const shia = await prisma.sect.upsert({
    where: { slug: "shia" },
    update: { label: "Shia", sortOrder: 1, isActive: true },
    create: { slug: "shia", label: "Shia", sortOrder: 1, isActive: true },
  });

  const shiaMaslaks = [
    { slug: "twelver", label: "Twelver (Ithna Ashari)", sortOrder: 0 },
    { slug: "ismaili", label: "Ismaili", sortOrder: 1 },
    { slug: "bohra", label: "Bohra", sortOrder: 2 },
    { slug: "zaydi", label: "Zaydi", sortOrder: 3 },
    { slug: "shia_other", label: "Other Shia", sortOrder: 99 },
  ];

  for (const maslak of shiaMaslaks) {
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: shia.id, slug: maslak.slug } },
      update: { ...maslak, isActive: true },
      create: { ...maslak, sectId: shia.id, isActive: true },
    });
  }
  console.log(`  ✓ Shia with ${shiaMaslaks.length} maslaks`);

  // Other sects
  const otherSects = [
    { slug: "ahmadiyya", label: "Ahmadiyya", sortOrder: 2 },
    { slug: "just_muslim", label: "Just Muslim", sortOrder: 3 },
    { slug: "other_sect", label: "Other", sortOrder: 99 },
  ];

  for (const sect of otherSects) {
    const created = await prisma.sect.upsert({
      where: { slug: sect.slug },
      update: { ...sect, isActive: true },
      create: { ...sect, isActive: true },
    });
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: created.id, slug: `${sect.slug}_default` } },
      update: { label: sect.label, sortOrder: 0, isActive: true },
      create: { slug: `${sect.slug}_default`, label: sect.label, sectId: created.id, sortOrder: 0, isActive: true },
    });
  }
  console.log(`  ✓ ${otherSects.length} other sects`);

  console.log("✅ Sects and maslaks seeded successfully!");
}

// ============================================================================
// COUNTRIES
// ============================================================================
async function seedCountries() {
  console.log("🌱 Seeding countries...");

  // Priority countries (Pakistan first, then diaspora countries, then others)
  const countries = [
    // Primary Market
    { code: "PK", name: "Pakistan", phoneCode: "+92", currency: "PKR", sortOrder: 0 },

    // Major Diaspora - Gulf
    { code: "SA", name: "Saudi Arabia", phoneCode: "+966", currency: "SAR", sortOrder: 1 },
    { code: "AE", name: "United Arab Emirates", phoneCode: "+971", currency: "AED", sortOrder: 2 },
    { code: "QA", name: "Qatar", phoneCode: "+974", currency: "QAR", sortOrder: 3 },
    { code: "KW", name: "Kuwait", phoneCode: "+965", currency: "KWD", sortOrder: 4 },
    { code: "BH", name: "Bahrain", phoneCode: "+973", currency: "BHD", sortOrder: 5 },
    { code: "OM", name: "Oman", phoneCode: "+968", currency: "OMR", sortOrder: 6 },

    // Major Diaspora - Western
    { code: "US", name: "United States", phoneCode: "+1", currency: "USD", sortOrder: 7 },
    { code: "GB", name: "United Kingdom", phoneCode: "+44", currency: "GBP", sortOrder: 8 },
    { code: "CA", name: "Canada", phoneCode: "+1", currency: "CAD", sortOrder: 9 },
    { code: "AU", name: "Australia", phoneCode: "+61", currency: "AUD", sortOrder: 10 },

    // European Countries
    { code: "DE", name: "Germany", phoneCode: "+49", currency: "EUR", sortOrder: 11 },
    { code: "FR", name: "France", phoneCode: "+33", currency: "EUR", sortOrder: 12 },
    { code: "IT", name: "Italy", phoneCode: "+39", currency: "EUR", sortOrder: 13 },
    { code: "ES", name: "Spain", phoneCode: "+34", currency: "EUR", sortOrder: 14 },
    { code: "NL", name: "Netherlands", phoneCode: "+31", currency: "EUR", sortOrder: 15 },
    { code: "BE", name: "Belgium", phoneCode: "+32", currency: "EUR", sortOrder: 16 },
    { code: "SE", name: "Sweden", phoneCode: "+46", currency: "SEK", sortOrder: 17 },
    { code: "NO", name: "Norway", phoneCode: "+47", currency: "NOK", sortOrder: 18 },
    { code: "DK", name: "Denmark", phoneCode: "+45", currency: "DKK", sortOrder: 19 },
    { code: "AT", name: "Austria", phoneCode: "+43", currency: "EUR", sortOrder: 20 },
    { code: "CH", name: "Switzerland", phoneCode: "+41", currency: "CHF", sortOrder: 21 },
    { code: "IE", name: "Ireland", phoneCode: "+353", currency: "EUR", sortOrder: 22 },
    { code: "FI", name: "Finland", phoneCode: "+358", currency: "EUR", sortOrder: 23 },
    { code: "PT", name: "Portugal", phoneCode: "+351", currency: "EUR", sortOrder: 24 },
    { code: "GR", name: "Greece", phoneCode: "+30", currency: "EUR", sortOrder: 25 },
    { code: "PL", name: "Poland", phoneCode: "+48", currency: "PLN", sortOrder: 26 },

    // Asian Countries
    { code: "MY", name: "Malaysia", phoneCode: "+60", currency: "MYR", sortOrder: 27 },
    { code: "SG", name: "Singapore", phoneCode: "+65", currency: "SGD", sortOrder: 28 },
    { code: "TR", name: "Turkey", phoneCode: "+90", currency: "TRY", sortOrder: 29 },
    { code: "ID", name: "Indonesia", phoneCode: "+62", currency: "IDR", sortOrder: 30 },
    { code: "IN", name: "India", phoneCode: "+91", currency: "INR", sortOrder: 31 },
    { code: "BD", name: "Bangladesh", phoneCode: "+880", currency: "BDT", sortOrder: 32 },
    { code: "JP", name: "Japan", phoneCode: "+81", currency: "JPY", sortOrder: 33 },
    { code: "KR", name: "South Korea", phoneCode: "+82", currency: "KRW", sortOrder: 34 },
    { code: "CN", name: "China", phoneCode: "+86", currency: "CNY", sortOrder: 35 },
    { code: "HK", name: "Hong Kong", phoneCode: "+852", currency: "HKD", sortOrder: 36 },
    { code: "TH", name: "Thailand", phoneCode: "+66", currency: "THB", sortOrder: 37 },
    { code: "PH", name: "Philippines", phoneCode: "+63", currency: "PHP", sortOrder: 38 },
    { code: "VN", name: "Vietnam", phoneCode: "+84", currency: "VND", sortOrder: 39 },

    // Middle East & North Africa
    { code: "EG", name: "Egypt", phoneCode: "+20", currency: "EGP", sortOrder: 40 },
    { code: "JO", name: "Jordan", phoneCode: "+962", currency: "JOD", sortOrder: 41 },
    { code: "LB", name: "Lebanon", phoneCode: "+961", currency: "LBP", sortOrder: 42 },
    { code: "IQ", name: "Iraq", phoneCode: "+964", currency: "IQD", sortOrder: 43 },
    { code: "MA", name: "Morocco", phoneCode: "+212", currency: "MAD", sortOrder: 44 },
    { code: "TN", name: "Tunisia", phoneCode: "+216", currency: "TND", sortOrder: 45 },
    { code: "DZ", name: "Algeria", phoneCode: "+213", currency: "DZD", sortOrder: 46 },
    { code: "LY", name: "Libya", phoneCode: "+218", currency: "LYD", sortOrder: 47 },
    { code: "IR", name: "Iran", phoneCode: "+98", currency: "IRR", sortOrder: 48 },
    { code: "AF", name: "Afghanistan", phoneCode: "+93", currency: "AFN", sortOrder: 49 },

    // African Countries
    { code: "ZA", name: "South Africa", phoneCode: "+27", currency: "ZAR", sortOrder: 50 },
    { code: "NG", name: "Nigeria", phoneCode: "+234", currency: "NGN", sortOrder: 51 },
    { code: "KE", name: "Kenya", phoneCode: "+254", currency: "KES", sortOrder: 52 },
    { code: "SD", name: "Sudan", phoneCode: "+249", currency: "SDG", sortOrder: 53 },
    { code: "ET", name: "Ethiopia", phoneCode: "+251", currency: "ETB", sortOrder: 54 },
    { code: "SO", name: "Somalia", phoneCode: "+252", currency: "SOS", sortOrder: 55 },

    // Americas
    { code: "MX", name: "Mexico", phoneCode: "+52", currency: "MXN", sortOrder: 56 },
    { code: "BR", name: "Brazil", phoneCode: "+55", currency: "BRL", sortOrder: 57 },
    { code: "AR", name: "Argentina", phoneCode: "+54", currency: "ARS", sortOrder: 58 },

    // Other
    { code: "NZ", name: "New Zealand", phoneCode: "+64", currency: "NZD", sortOrder: 59 },
    { code: "RU", name: "Russia", phoneCode: "+7", currency: "RUB", sortOrder: 60 },
    { code: "UA", name: "Ukraine", phoneCode: "+380", currency: "UAH", sortOrder: 61 },
    { code: "CZ", name: "Czech Republic", phoneCode: "+420", currency: "CZK", sortOrder: 62 },
    { code: "HU", name: "Hungary", phoneCode: "+36", currency: "HUF", sortOrder: 63 },
    { code: "RO", name: "Romania", phoneCode: "+40", currency: "RON", sortOrder: 64 },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { ...country, isActive: true },
      create: { ...country, isActive: true },
    });
  }
  console.log(`  ✓ ${countries.length} countries seeded`);

  console.log("✅ Countries seeded successfully!");
}

// ============================================================================
// STATES/PROVINCES
// ============================================================================
async function seedStatesAndCities() {
  console.log("🌱 Seeding states/provinces and cities...");

  // Pakistan - Islamabad Capital Territory FIRST
  const pk = await prisma.country.findUnique({ where: { code: "PK" } });
  if (!pk) {
    console.log("  ⚠️ Pakistan not found, skipping states");
    return;
  }

  const pakistanStates = [
    { code: "ICT", name: "Islamabad Capital Territory", sortOrder: 0 }, // First!
    { code: "PB", name: "Punjab", sortOrder: 1 },
    { code: "SD", name: "Sindh", sortOrder: 2 },
    { code: "KP", name: "Khyber Pakhtunkhwa", sortOrder: 3 },
    { code: "BA", name: "Balochistan", sortOrder: 4 },
    { code: "GB", name: "Gilgit-Baltistan", sortOrder: 5 },
    { code: "AK", name: "Azad Kashmir", sortOrder: 6 },
  ];

  const pakistanCities: Record<string, string[]> = {
    "ICT": ["Islamabad"],
    "PB": ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot", "Bahawalpur", "Sargodha", "Gujrat", "Sheikhupura", "Sahiwal", "Rahim Yar Khan", "Jhang", "Kasur", "Okara", "Dera Ghazi Khan", "Chiniot", "Kamoke", "Hafizabad", "Mandi Bahauddin", "Jhelum", "Attock", "Chakwal", "Khanewal", "Vehari", "Muzaffargarh", "Layyah", "Mianwali", "Bhakkar", "Khushab", "Narowal", "Pakpattan", "Lodhran", "Rajanpur", "Toba Tek Singh"],
    "SD": ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Thatta", "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Badin", "Tando Adam", "Tando Allahyar", "Matiari", "Umerkot", "Sanghar", "Ghotki", "Kashmore"],
    "KP": ["Peshawar", "Mardan", "Abbottabad", "Swat", "Kohat", "Dera Ismail Khan", "Bannu", "Mansehra", "Charsadda", "Nowshera", "Swabi", "Haripur", "Chitral", "Dir", "Buner", "Shangla", "Battagram", "Kohistan", "Hangu", "Karak", "Lakki Marwat", "Tank"],
    "BA": ["Quetta", "Gwadar", "Turbat", "Khuzdar", "Hub", "Chaman", "Sibi", "Zhob", "Loralai", "Mastung", "Pishin", "Kalat", "Nushki", "Kharan", "Panjgur", "Lasbela", "Awaran", "Washuk"],
    "GB": ["Gilgit", "Skardu", "Hunza", "Ghizer", "Diamer", "Astore", "Ghanche", "Shigar", "Kharmang", "Roundu"],
    "AK": ["Muzaffarabad", "Mirpur", "Kotli", "Bhimber", "Rawalakot", "Bagh", "Pallandri", "Hajira", "Athmuqam", "Neelum"],
  };

  for (const state of pakistanStates) {
    const createdState = await prisma.stateProvince.upsert({
      where: { countryId_name: { countryId: pk.id, name: state.name } },
      update: { code: state.code, sortOrder: state.sortOrder, isActive: true },
      create: { countryId: pk.id, code: state.code, name: state.name, sortOrder: state.sortOrder, isActive: true },
    });

    const cities = pakistanCities[state.code] || [];
    for (let i = 0; i < cities.length; i++) {
      await prisma.city.upsert({
        where: { stateProvinceId_name: { stateProvinceId: createdState.id, name: cities[i] } },
        update: { sortOrder: i, isPopular: i < 5, isActive: true },
        create: { stateProvinceId: createdState.id, name: cities[i], sortOrder: i, isPopular: i < 5, isActive: true },
      });
    }
  }
  console.log("  ✓ Pakistan: 7 provinces/territories with major cities");

  // UAE
  const ae = await prisma.country.findUnique({ where: { code: "AE" } });
  if (ae) {
    const uaeStates = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];
    for (let i = 0; i < uaeStates.length; i++) {
      const state = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: ae.id, name: uaeStates[i] } },
        update: { sortOrder: i, isActive: true },
        create: { countryId: ae.id, name: uaeStates[i], sortOrder: i, isActive: true },
      });
      await prisma.city.upsert({
        where: { stateProvinceId_name: { stateProvinceId: state.id, name: uaeStates[i] } },
        update: { sortOrder: 0, isPopular: true, isActive: true },
        create: { stateProvinceId: state.id, name: uaeStates[i], sortOrder: 0, isPopular: true, isActive: true },
      });
    }
    console.log("  ✓ UAE: 7 emirates");
  }

  // Saudi Arabia
  const sa = await prisma.country.findUnique({ where: { code: "SA" } });
  if (sa) {
    const saudiRegions: Record<string, string[]> = {
      "Riyadh Region": ["Riyadh", "Al Kharj", "Diriyah"],
      "Makkah Region": ["Makkah", "Jeddah", "Taif"],
      "Madinah Region": ["Madinah", "Yanbu"],
      "Eastern Province": ["Dammam", "Dhahran", "Khobar", "Jubail", "Qatif"],
      "Asir Region": ["Abha", "Khamis Mushait"],
      "Qassim Region": ["Buraydah", "Unaizah"],
      "Tabuk Region": ["Tabuk"],
      "Hail Region": ["Hail"],
      "Jazan Region": ["Jazan"],
      "Najran Region": ["Najran"],
    };
    let order = 0;
    for (const [region, cities] of Object.entries(saudiRegions)) {
      const state = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: sa.id, name: region } },
        update: { sortOrder: order, isActive: true },
        create: { countryId: sa.id, name: region, sortOrder: order, isActive: true },
      });
      for (let i = 0; i < cities.length; i++) {
        await prisma.city.upsert({
          where: { stateProvinceId_name: { stateProvinceId: state.id, name: cities[i] } },
          update: { sortOrder: i, isPopular: i < 2, isActive: true },
          create: { stateProvinceId: state.id, name: cities[i], sortOrder: i, isPopular: i < 2, isActive: true },
        });
      }
      order++;
    }
    console.log("  ✓ Saudi Arabia: 10 regions with cities");
  }

  // UK
  const gb = await prisma.country.findUnique({ where: { code: "GB" } });
  if (gb) {
    const ukRegions: Record<string, string[]> = {
      "England": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool", "Bradford", "Sheffield", "Bristol", "Leicester", "Luton", "Coventry", "Nottingham", "Newcastle", "Southampton", "Reading", "Derby", "Plymouth", "Wolverhampton", "Milton Keynes", "Oxford", "Cambridge"],
      "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"],
      "Wales": ["Cardiff", "Swansea", "Newport"],
      "Northern Ireland": ["Belfast", "Derry"],
    };
    let order = 0;
    for (const [region, cities] of Object.entries(ukRegions)) {
      const state = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: gb.id, name: region } },
        update: { sortOrder: order, isActive: true },
        create: { countryId: gb.id, name: region, sortOrder: order, isActive: true },
      });
      for (let i = 0; i < cities.length; i++) {
        await prisma.city.upsert({
          where: { stateProvinceId_name: { stateProvinceId: state.id, name: cities[i] } },
          update: { sortOrder: i, isPopular: i < 5, isActive: true },
          create: { stateProvinceId: state.id, name: cities[i], sortOrder: i, isPopular: i < 5, isActive: true },
        });
      }
      order++;
    }
    console.log("  ✓ UK: 4 regions with major cities");
  }

  // USA (Major states with cities)
  const us = await prisma.country.findUnique({ where: { code: "US" } });
  if (us) {
    const usStates: Record<string, string[]> = {
      "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Fresno", "Sacramento", "Irvine", "Anaheim"],
      "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Plano"],
      "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany"],
      "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
      "Illinois": ["Chicago", "Aurora", "Naperville", "Rockford"],
      "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Trenton"],
      "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Reading"],
      "Michigan": ["Detroit", "Grand Rapids", "Warren", "Ann Arbor", "Dearborn"],
      "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah"],
      "Virginia": ["Virginia Beach", "Norfolk", "Richmond", "Chesapeake", "Arlington"],
      "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge"],
      "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue"],
      "Maryland": ["Baltimore", "Columbia", "Germantown", "Silver Spring"],
      "Arizona": ["Phoenix", "Tucson", "Mesa", "Scottsdale"],
      "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
      "Colorado": ["Denver", "Colorado Springs", "Aurora", "Boulder"],
      "Minnesota": ["Minneapolis", "Saint Paul", "Rochester"],
      "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford"],
    };
    let order = 0;
    for (const [state, cities] of Object.entries(usStates)) {
      const createdState = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: us.id, name: state } },
        update: { sortOrder: order, isActive: true },
        create: { countryId: us.id, name: state, sortOrder: order, isActive: true },
      });
      for (let i = 0; i < cities.length; i++) {
        await prisma.city.upsert({
          where: { stateProvinceId_name: { stateProvinceId: createdState.id, name: cities[i] } },
          update: { sortOrder: i, isPopular: i < 3, isActive: true },
          create: { stateProvinceId: createdState.id, name: cities[i], sortOrder: i, isPopular: i < 3, isActive: true },
        });
      }
      order++;
    }
    console.log("  ✓ USA: 18 states with major cities");
  }

  // Canada
  const ca = await prisma.country.findUnique({ where: { code: "CA" } });
  if (ca) {
    const caProvinces: Record<string, string[]> = {
      "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Markham", "Vaughan", "Kitchener", "Windsor"],
      "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Victoria", "Kelowna"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
      "Manitoba": ["Winnipeg", "Brandon"],
      "Saskatchewan": ["Saskatoon", "Regina"],
    };
    let order = 0;
    for (const [province, cities] of Object.entries(caProvinces)) {
      const state = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: ca.id, name: province } },
        update: { sortOrder: order, isActive: true },
        create: { countryId: ca.id, name: province, sortOrder: order, isActive: true },
      });
      for (let i = 0; i < cities.length; i++) {
        await prisma.city.upsert({
          where: { stateProvinceId_name: { stateProvinceId: state.id, name: cities[i] } },
          update: { sortOrder: i, isPopular: i < 3, isActive: true },
          create: { stateProvinceId: state.id, name: cities[i], sortOrder: i, isPopular: i < 3, isActive: true },
        });
      }
      order++;
    }
    console.log("  ✓ Canada: 6 provinces with major cities");
  }

  // Australia
  const au = await prisma.country.findUnique({ where: { code: "AU" } });
  if (au) {
    const auStates: Record<string, string[]> = {
      "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
      "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"],
      "Western Australia": ["Perth", "Fremantle", "Mandurah"],
      "South Australia": ["Adelaide"],
      "Australian Capital Territory": ["Canberra"],
    };
    let order = 0;
    for (const [state, cities] of Object.entries(auStates)) {
      const createdState = await prisma.stateProvince.upsert({
        where: { countryId_name: { countryId: au.id, name: state } },
        update: { sortOrder: order, isActive: true },
        create: { countryId: au.id, name: state, sortOrder: order, isActive: true },
      });
      for (let i = 0; i < cities.length; i++) {
        await prisma.city.upsert({
          where: { stateProvinceId_name: { stateProvinceId: createdState.id, name: cities[i] } },
          update: { sortOrder: i, isPopular: i < 2, isActive: true },
          create: { stateProvinceId: createdState.id, name: cities[i], sortOrder: i, isPopular: i < 2, isActive: true },
        });
      }
      order++;
    }
    console.log("  ✓ Australia: 6 states with major cities");
  }

  console.log("✅ States/provinces and cities seeded successfully!");
}

// ============================================================================
// HEIGHTS
// ============================================================================
async function seedHeights() {
  console.log("🌱 Seeding heights...");

  const heights = [];
  // Generate heights from 4'6" to 6'8"
  for (let feet = 4; feet <= 6; feet++) {
    const maxInches = feet === 6 ? 8 : 11;
    const startInches = feet === 4 ? 6 : 0;
    for (let inches = startInches; inches <= maxInches; inches++) {
      const cm = Math.round((feet * 12 + inches) * 2.54);
      heights.push({
        slug: `${feet}ft${inches}in`,
        labelImperial: `${feet}'${inches}"`,
        labelMetric: `${cm} cm`,
        centimeters: cm,
        sortOrder: heights.length,
      });
    }
  }

  for (const height of heights) {
    await prisma.height.upsert({
      where: { slug: height.slug },
      update: { ...height, isActive: true },
      create: { ...height, isActive: true },
    });
  }
  console.log(`  ✓ ${heights.length} height options`);

  console.log("✅ Heights seeded successfully!");
}

// ============================================================================
// EDUCATION LEVELS
// ============================================================================
async function seedEducationLevels() {
  console.log("🌱 Seeding education levels...");

  const levels = [
    { slug: "below_matric", label: "Below Matriculation", level: 1, yearsOfEducation: 8, sortOrder: 0 },
    { slug: "matric", label: "Matriculation (10th)", level: 2, yearsOfEducation: 10, sortOrder: 1 },
    { slug: "intermediate", label: "Intermediate (12th / FSc / FA)", level: 3, yearsOfEducation: 12, sortOrder: 2 },
    { slug: "diploma", label: "Diploma / Certificate", level: 4, yearsOfEducation: 13, sortOrder: 3 },
    { slug: "bachelors", label: "Bachelor's Degree", level: 5, yearsOfEducation: 16, sortOrder: 4 },
    { slug: "masters", label: "Master's Degree", level: 6, yearsOfEducation: 18, sortOrder: 5 },
    { slug: "mphil", label: "M.Phil / MS", level: 7, yearsOfEducation: 18, sortOrder: 6 },
    { slug: "phd", label: "PhD / Doctorate", level: 8, yearsOfEducation: 21, sortOrder: 7 },
    { slug: "postdoc", label: "Post Doctorate", level: 9, yearsOfEducation: 23, sortOrder: 8 },
    { slug: "islamic_scholar", label: "Islamic Scholar (Aalim/Mufti)", level: 5, yearsOfEducation: 16, sortOrder: 9, tags: ["islamic", "religious"] },
    { slug: "hafiz", label: "Hafiz-e-Quran", level: 3, yearsOfEducation: 12, sortOrder: 10, tags: ["islamic", "religious"] },
  ];

  for (const level of levels) {
    await prisma.educationLevel.upsert({
      where: { slug: level.slug },
      update: { ...level, isActive: true },
      create: { ...level, isActive: true, tags: level.tags || [] },
    });
  }
  console.log(`  ✓ ${levels.length} education levels`);

  console.log("✅ Education levels seeded successfully!");
}

// ============================================================================
// EDUCATION FIELDS
// ============================================================================
async function seedEducationFields() {
  console.log("🌱 Seeding education fields...");

  const fields = [
    // Engineering & Technology
    { slug: "computer_science", label: "Computer Science / IT", category: "Engineering & Technology", sortOrder: 0 },
    { slug: "software_engineering", label: "Software Engineering", category: "Engineering & Technology", sortOrder: 1 },
    { slug: "electrical_engineering", label: "Electrical Engineering", category: "Engineering & Technology", sortOrder: 2 },
    { slug: "mechanical_engineering", label: "Mechanical Engineering", category: "Engineering & Technology", sortOrder: 3 },
    { slug: "civil_engineering", label: "Civil Engineering", category: "Engineering & Technology", sortOrder: 4 },
    { slug: "chemical_engineering", label: "Chemical Engineering", category: "Engineering & Technology", sortOrder: 5 },
    { slug: "other_engineering", label: "Other Engineering", category: "Engineering & Technology", sortOrder: 6 },

    // Medical & Health
    { slug: "medicine_mbbs", label: "Medicine (MBBS)", category: "Medical & Health", sortOrder: 10 },
    { slug: "dentistry", label: "Dentistry (BDS)", category: "Medical & Health", sortOrder: 11 },
    { slug: "pharmacy", label: "Pharmacy", category: "Medical & Health", sortOrder: 12 },
    { slug: "nursing", label: "Nursing", category: "Medical & Health", sortOrder: 13 },
    { slug: "physiotherapy", label: "Physiotherapy", category: "Medical & Health", sortOrder: 14 },
    { slug: "psychology", label: "Psychology", category: "Medical & Health", sortOrder: 15 },
    { slug: "other_medical", label: "Other Medical/Health", category: "Medical & Health", sortOrder: 16 },

    // Business & Commerce
    { slug: "business_admin", label: "Business Administration (BBA/MBA)", category: "Business & Commerce", sortOrder: 20 },
    { slug: "accounting", label: "Accounting / Finance", category: "Business & Commerce", sortOrder: 21 },
    { slug: "economics", label: "Economics", category: "Business & Commerce", sortOrder: 22 },
    { slug: "marketing", label: "Marketing", category: "Business & Commerce", sortOrder: 23 },
    { slug: "commerce", label: "Commerce", category: "Business & Commerce", sortOrder: 24 },
    { slug: "banking", label: "Banking", category: "Business & Commerce", sortOrder: 25 },

    // Law & Social Sciences
    { slug: "law", label: "Law (LLB/LLM)", category: "Law & Social Sciences", sortOrder: 30 },
    { slug: "political_science", label: "Political Science", category: "Law & Social Sciences", sortOrder: 31 },
    { slug: "sociology", label: "Sociology", category: "Law & Social Sciences", sortOrder: 32 },
    { slug: "international_relations", label: "International Relations", category: "Law & Social Sciences", sortOrder: 33 },
    { slug: "social_work", label: "Social Work", category: "Law & Social Sciences", sortOrder: 34 },

    // Arts & Humanities
    { slug: "english", label: "English Literature/Language", category: "Arts & Humanities", sortOrder: 40 },
    { slug: "urdu", label: "Urdu Literature", category: "Arts & Humanities", sortOrder: 41 },
    { slug: "arabic", label: "Arabic", category: "Arts & Humanities", sortOrder: 42 },
    { slug: "history", label: "History", category: "Arts & Humanities", sortOrder: 43 },
    { slug: "philosophy", label: "Philosophy", category: "Arts & Humanities", sortOrder: 44 },
    { slug: "journalism", label: "Journalism / Mass Communication", category: "Arts & Humanities", sortOrder: 45 },
    { slug: "fine_arts", label: "Fine Arts / Design", category: "Arts & Humanities", sortOrder: 46 },

    // Natural Sciences
    { slug: "physics", label: "Physics", category: "Natural Sciences", sortOrder: 50 },
    { slug: "chemistry", label: "Chemistry", category: "Natural Sciences", sortOrder: 51 },
    { slug: "mathematics", label: "Mathematics", category: "Natural Sciences", sortOrder: 52 },
    { slug: "biology", label: "Biology / Biotechnology", category: "Natural Sciences", sortOrder: 53 },
    { slug: "environmental", label: "Environmental Science", category: "Natural Sciences", sortOrder: 54 },

    // Islamic Studies
    { slug: "islamic_studies", label: "Islamic Studies", category: "Islamic Studies", sortOrder: 60 },
    { slug: "quran_tafsir", label: "Quran & Tafsir", category: "Islamic Studies", sortOrder: 61 },
    { slug: "hadith", label: "Hadith Sciences", category: "Islamic Studies", sortOrder: 62 },
    { slug: "fiqh", label: "Fiqh (Islamic Jurisprudence)", category: "Islamic Studies", sortOrder: 63 },

    // Education
    { slug: "education", label: "Education / Teaching", category: "Education", sortOrder: 70 },

    // Other
    { slug: "agriculture", label: "Agriculture", category: "Other", sortOrder: 80 },
    { slug: "architecture", label: "Architecture", category: "Other", sortOrder: 81 },
    { slug: "aviation", label: "Aviation / Aeronautics", category: "Other", sortOrder: 82 },
    { slug: "hospitality", label: "Hospitality / Hotel Management", category: "Other", sortOrder: 83 },
    { slug: "other_field", label: "Other", category: "Other", sortOrder: 99 },
  ];

  for (const field of fields) {
    await prisma.educationField.upsert({
      where: { slug: field.slug },
      update: { ...field, isActive: true },
      create: { ...field, isActive: true, tags: [] },
    });
  }
  console.log(`  ✓ ${fields.length} education fields`);

  console.log("✅ Education fields seeded successfully!");
}

// ============================================================================
// INCOME RANGES (Country-based)
// ============================================================================
async function seedIncomeRanges() {
  console.log("🌱 Seeding income ranges...");

  // Helper to upsert income ranges for a country
  const upsertIncomeRanges = async (
    countryCode: string,
    ranges: Array<{
      slug: string;
      label: string;
      currency: string;
      period: "MONTHLY" | "ANNUAL";
      minValue: number | null;
      maxValue: number | null;
      sortOrder: number;
    }>
  ) => {
    const country = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!country) {
      console.log(`  ⚠️ Country ${countryCode} not found, skipping...`);
      return 0;
    }

    for (const range of ranges) {
      const existing = await prisma.incomeRange.findFirst({
        where: { slug: range.slug, countryId: country.id },
      });
      if (existing) {
        await prisma.incomeRange.update({
          where: { id: existing.id },
          data: { ...range, countryId: country.id, isActive: true },
        });
      } else {
        await prisma.incomeRange.create({
          data: { ...range, countryId: country.id, isActive: true },
        });
      }
    }
    return ranges.length;
  };

  // Global income ranges in USD (fallback for countries without specific ranges)
  const globalRanges = [
    { slug: "global_0_25k", label: "Under $25,000", currency: "USD", period: "ANNUAL" as const, minValue: 0, maxValue: 25000, sortOrder: 0 },
    { slug: "global_25k_50k", label: "$25,000 - $50,000", currency: "USD", period: "ANNUAL" as const, minValue: 25000, maxValue: 50000, sortOrder: 1 },
    { slug: "global_50k_75k", label: "$50,000 - $75,000", currency: "USD", period: "ANNUAL" as const, minValue: 50000, maxValue: 75000, sortOrder: 2 },
    { slug: "global_75k_100k", label: "$75,000 - $100,000", currency: "USD", period: "ANNUAL" as const, minValue: 75000, maxValue: 100000, sortOrder: 3 },
    { slug: "global_100k_150k", label: "$100,000 - $150,000", currency: "USD", period: "ANNUAL" as const, minValue: 100000, maxValue: 150000, sortOrder: 4 },
    { slug: "global_150k_plus", label: "$150,000+", currency: "USD", period: "ANNUAL" as const, minValue: 150000, maxValue: null, sortOrder: 5 },
  ];

  for (const range of globalRanges) {
    const existing = await prisma.incomeRange.findFirst({
      where: { slug: range.slug, countryId: null },
    });
    if (existing) {
      await prisma.incomeRange.update({
        where: { id: existing.id },
        data: { ...range, countryId: null, isActive: true },
      });
    } else {
      await prisma.incomeRange.create({
        data: { ...range, countryId: null, isActive: true },
      });
    }
  }
  console.log(`  ✓ ${globalRanges.length} global fallback ranges (USD)`);

  // ============= PAKISTAN (PKR - Monthly) =============
  const pkRanges = [
    { slug: "pk_0_50k", label: "Under Rs. 50,000", currency: "PKR", period: "MONTHLY" as const, minValue: 0, maxValue: 50000, sortOrder: 0 },
    { slug: "pk_50k_100k", label: "Rs. 50,000 - Rs. 100,000", currency: "PKR", period: "MONTHLY" as const, minValue: 50000, maxValue: 100000, sortOrder: 1 },
    { slug: "pk_100k_150k", label: "Rs. 100,000 - Rs. 150,000", currency: "PKR", period: "MONTHLY" as const, minValue: 100000, maxValue: 150000, sortOrder: 2 },
    { slug: "pk_150k_250k", label: "Rs. 150,000 - Rs. 250,000", currency: "PKR", period: "MONTHLY" as const, minValue: 150000, maxValue: 250000, sortOrder: 3 },
    { slug: "pk_250k_400k", label: "Rs. 250,000 - Rs. 400,000", currency: "PKR", period: "MONTHLY" as const, minValue: 250000, maxValue: 400000, sortOrder: 4 },
    { slug: "pk_400k_700k", label: "Rs. 400,000 - Rs. 700,000", currency: "PKR", period: "MONTHLY" as const, minValue: 400000, maxValue: 700000, sortOrder: 5 },
    { slug: "pk_700k_plus", label: "Rs. 700,000+", currency: "PKR", period: "MONTHLY" as const, minValue: 700000, maxValue: null, sortOrder: 6 },
  ];
  const pkCount = await upsertIncomeRanges("PK", pkRanges);
  if (pkCount) console.log(`  ✓ ${pkCount} Pakistan income ranges (PKR)`);

  // ============= USA (USD - Annual) =============
  const usRanges = [
    { slug: "us_0_30k", label: "Under $30,000", currency: "USD", period: "ANNUAL" as const, minValue: 0, maxValue: 30000, sortOrder: 0 },
    { slug: "us_30k_50k", label: "$30,000 - $50,000", currency: "USD", period: "ANNUAL" as const, minValue: 30000, maxValue: 50000, sortOrder: 1 },
    { slug: "us_50k_75k", label: "$50,000 - $75,000", currency: "USD", period: "ANNUAL" as const, minValue: 50000, maxValue: 75000, sortOrder: 2 },
    { slug: "us_75k_100k", label: "$75,000 - $100,000", currency: "USD", period: "ANNUAL" as const, minValue: 75000, maxValue: 100000, sortOrder: 3 },
    { slug: "us_100k_150k", label: "$100,000 - $150,000", currency: "USD", period: "ANNUAL" as const, minValue: 100000, maxValue: 150000, sortOrder: 4 },
    { slug: "us_150k_250k", label: "$150,000 - $250,000", currency: "USD", period: "ANNUAL" as const, minValue: 150000, maxValue: 250000, sortOrder: 5 },
    { slug: "us_250k_plus", label: "$250,000+", currency: "USD", period: "ANNUAL" as const, minValue: 250000, maxValue: null, sortOrder: 6 },
  ];
  const usCount = await upsertIncomeRanges("US", usRanges);
  if (usCount) console.log(`  ✓ ${usCount} USA income ranges (USD)`);

  // ============= CANADA (CAD - Annual) =============
  const caRanges = [
    { slug: "ca_0_30k", label: "Under C$30,000", currency: "CAD", period: "ANNUAL" as const, minValue: 0, maxValue: 30000, sortOrder: 0 },
    { slug: "ca_30k_50k", label: "C$30,000 - C$50,000", currency: "CAD", period: "ANNUAL" as const, minValue: 30000, maxValue: 50000, sortOrder: 1 },
    { slug: "ca_50k_75k", label: "C$50,000 - C$75,000", currency: "CAD", period: "ANNUAL" as const, minValue: 50000, maxValue: 75000, sortOrder: 2 },
    { slug: "ca_75k_100k", label: "C$75,000 - C$100,000", currency: "CAD", period: "ANNUAL" as const, minValue: 75000, maxValue: 100000, sortOrder: 3 },
    { slug: "ca_100k_150k", label: "C$100,000 - C$150,000", currency: "CAD", period: "ANNUAL" as const, minValue: 100000, maxValue: 150000, sortOrder: 4 },
    { slug: "ca_150k_200k", label: "C$150,000 - C$200,000", currency: "CAD", period: "ANNUAL" as const, minValue: 150000, maxValue: 200000, sortOrder: 5 },
    { slug: "ca_200k_plus", label: "C$200,000+", currency: "CAD", period: "ANNUAL" as const, minValue: 200000, maxValue: null, sortOrder: 6 },
  ];
  const caCount = await upsertIncomeRanges("CA", caRanges);
  if (caCount) console.log(`  ✓ ${caCount} Canada income ranges (CAD)`);

  // ============= UK (GBP - Annual) =============
  const gbRanges = [
    { slug: "gb_0_25k", label: "Under £25,000", currency: "GBP", period: "ANNUAL" as const, minValue: 0, maxValue: 25000, sortOrder: 0 },
    { slug: "gb_25k_40k", label: "£25,000 - £40,000", currency: "GBP", period: "ANNUAL" as const, minValue: 25000, maxValue: 40000, sortOrder: 1 },
    { slug: "gb_40k_60k", label: "£40,000 - £60,000", currency: "GBP", period: "ANNUAL" as const, minValue: 40000, maxValue: 60000, sortOrder: 2 },
    { slug: "gb_60k_80k", label: "£60,000 - £80,000", currency: "GBP", period: "ANNUAL" as const, minValue: 60000, maxValue: 80000, sortOrder: 3 },
    { slug: "gb_80k_120k", label: "£80,000 - £120,000", currency: "GBP", period: "ANNUAL" as const, minValue: 80000, maxValue: 120000, sortOrder: 4 },
    { slug: "gb_120k_plus", label: "£120,000+", currency: "GBP", period: "ANNUAL" as const, minValue: 120000, maxValue: null, sortOrder: 5 },
  ];
  const gbCount = await upsertIncomeRanges("GB", gbRanges);
  if (gbCount) console.log(`  ✓ ${gbCount} UK income ranges (GBP)`);

  // ============= UAE (AED - Monthly) =============
  const aeRanges = [
    { slug: "ae_0_10k", label: "Under AED 10,000", currency: "AED", period: "MONTHLY" as const, minValue: 0, maxValue: 10000, sortOrder: 0 },
    { slug: "ae_10k_20k", label: "AED 10,000 - AED 20,000", currency: "AED", period: "MONTHLY" as const, minValue: 10000, maxValue: 20000, sortOrder: 1 },
    { slug: "ae_20k_35k", label: "AED 20,000 - AED 35,000", currency: "AED", period: "MONTHLY" as const, minValue: 20000, maxValue: 35000, sortOrder: 2 },
    { slug: "ae_35k_50k", label: "AED 35,000 - AED 50,000", currency: "AED", period: "MONTHLY" as const, minValue: 35000, maxValue: 50000, sortOrder: 3 },
    { slug: "ae_50k_80k", label: "AED 50,000 - AED 80,000", currency: "AED", period: "MONTHLY" as const, minValue: 50000, maxValue: 80000, sortOrder: 4 },
    { slug: "ae_80k_plus", label: "AED 80,000+", currency: "AED", period: "MONTHLY" as const, minValue: 80000, maxValue: null, sortOrder: 5 },
  ];
  const aeCount = await upsertIncomeRanges("AE", aeRanges);
  if (aeCount) console.log(`  ✓ ${aeCount} UAE income ranges (AED)`);

  // ============= SAUDI ARABIA (SAR - Monthly) =============
  const saRanges = [
    { slug: "sa_0_10k", label: "Under SAR 10,000", currency: "SAR", period: "MONTHLY" as const, minValue: 0, maxValue: 10000, sortOrder: 0 },
    { slug: "sa_10k_20k", label: "SAR 10,000 - SAR 20,000", currency: "SAR", period: "MONTHLY" as const, minValue: 10000, maxValue: 20000, sortOrder: 1 },
    { slug: "sa_20k_35k", label: "SAR 20,000 - SAR 35,000", currency: "SAR", period: "MONTHLY" as const, minValue: 20000, maxValue: 35000, sortOrder: 2 },
    { slug: "sa_35k_50k", label: "SAR 35,000 - SAR 50,000", currency: "SAR", period: "MONTHLY" as const, minValue: 35000, maxValue: 50000, sortOrder: 3 },
    { slug: "sa_50k_80k", label: "SAR 50,000 - SAR 80,000", currency: "SAR", period: "MONTHLY" as const, minValue: 50000, maxValue: 80000, sortOrder: 4 },
    { slug: "sa_80k_plus", label: "SAR 80,000+", currency: "SAR", period: "MONTHLY" as const, minValue: 80000, maxValue: null, sortOrder: 5 },
  ];
  const saCount = await upsertIncomeRanges("SA", saRanges);
  if (saCount) console.log(`  ✓ ${saCount} Saudi Arabia income ranges (SAR)`);

  // ============= QATAR (QAR - Monthly) =============
  const qaRanges = [
    { slug: "qa_0_15k", label: "Under QAR 15,000", currency: "QAR", period: "MONTHLY" as const, minValue: 0, maxValue: 15000, sortOrder: 0 },
    { slug: "qa_15k_25k", label: "QAR 15,000 - QAR 25,000", currency: "QAR", period: "MONTHLY" as const, minValue: 15000, maxValue: 25000, sortOrder: 1 },
    { slug: "qa_25k_40k", label: "QAR 25,000 - QAR 40,000", currency: "QAR", period: "MONTHLY" as const, minValue: 25000, maxValue: 40000, sortOrder: 2 },
    { slug: "qa_40k_60k", label: "QAR 40,000 - QAR 60,000", currency: "QAR", period: "MONTHLY" as const, minValue: 40000, maxValue: 60000, sortOrder: 3 },
    { slug: "qa_60k_plus", label: "QAR 60,000+", currency: "QAR", period: "MONTHLY" as const, minValue: 60000, maxValue: null, sortOrder: 4 },
  ];
  const qaCount = await upsertIncomeRanges("QA", qaRanges);
  if (qaCount) console.log(`  ✓ ${qaCount} Qatar income ranges (QAR)`);

  // ============= KUWAIT (KWD - Monthly) =============
  const kwRanges = [
    { slug: "kw_0_500", label: "Under KWD 500", currency: "KWD", period: "MONTHLY" as const, minValue: 0, maxValue: 500, sortOrder: 0 },
    { slug: "kw_500_1000", label: "KWD 500 - KWD 1,000", currency: "KWD", period: "MONTHLY" as const, minValue: 500, maxValue: 1000, sortOrder: 1 },
    { slug: "kw_1000_2000", label: "KWD 1,000 - KWD 2,000", currency: "KWD", period: "MONTHLY" as const, minValue: 1000, maxValue: 2000, sortOrder: 2 },
    { slug: "kw_2000_3500", label: "KWD 2,000 - KWD 3,500", currency: "KWD", period: "MONTHLY" as const, minValue: 2000, maxValue: 3500, sortOrder: 3 },
    { slug: "kw_3500_plus", label: "KWD 3,500+", currency: "KWD", period: "MONTHLY" as const, minValue: 3500, maxValue: null, sortOrder: 4 },
  ];
  const kwCount = await upsertIncomeRanges("KW", kwRanges);
  if (kwCount) console.log(`  ✓ ${kwCount} Kuwait income ranges (KWD)`);

  // ============= AUSTRALIA (AUD - Annual) =============
  const auRanges = [
    { slug: "au_0_40k", label: "Under A$40,000", currency: "AUD", period: "ANNUAL" as const, minValue: 0, maxValue: 40000, sortOrder: 0 },
    { slug: "au_40k_60k", label: "A$40,000 - A$60,000", currency: "AUD", period: "ANNUAL" as const, minValue: 40000, maxValue: 60000, sortOrder: 1 },
    { slug: "au_60k_90k", label: "A$60,000 - A$90,000", currency: "AUD", period: "ANNUAL" as const, minValue: 60000, maxValue: 90000, sortOrder: 2 },
    { slug: "au_90k_120k", label: "A$90,000 - A$120,000", currency: "AUD", period: "ANNUAL" as const, minValue: 90000, maxValue: 120000, sortOrder: 3 },
    { slug: "au_120k_180k", label: "A$120,000 - A$180,000", currency: "AUD", period: "ANNUAL" as const, minValue: 120000, maxValue: 180000, sortOrder: 4 },
    { slug: "au_180k_plus", label: "A$180,000+", currency: "AUD", period: "ANNUAL" as const, minValue: 180000, maxValue: null, sortOrder: 5 },
  ];
  const auCount = await upsertIncomeRanges("AU", auRanges);
  if (auCount) console.log(`  ✓ ${auCount} Australia income ranges (AUD)`);

  // ============= GERMANY (EUR - Annual) =============
  const deRanges = [
    { slug: "de_0_30k", label: "Under €30,000", currency: "EUR", period: "ANNUAL" as const, minValue: 0, maxValue: 30000, sortOrder: 0 },
    { slug: "de_30k_50k", label: "€30,000 - €50,000", currency: "EUR", period: "ANNUAL" as const, minValue: 30000, maxValue: 50000, sortOrder: 1 },
    { slug: "de_50k_70k", label: "€50,000 - €70,000", currency: "EUR", period: "ANNUAL" as const, minValue: 50000, maxValue: 70000, sortOrder: 2 },
    { slug: "de_70k_100k", label: "€70,000 - €100,000", currency: "EUR", period: "ANNUAL" as const, minValue: 70000, maxValue: 100000, sortOrder: 3 },
    { slug: "de_100k_plus", label: "€100,000+", currency: "EUR", period: "ANNUAL" as const, minValue: 100000, maxValue: null, sortOrder: 4 },
  ];
  const deCount = await upsertIncomeRanges("DE", deRanges);
  if (deCount) console.log(`  ✓ ${deCount} Germany income ranges (EUR)`);

  // ============= MALAYSIA (MYR - Monthly) =============
  const myRanges = [
    { slug: "my_0_3k", label: "Under RM 3,000", currency: "MYR", period: "MONTHLY" as const, minValue: 0, maxValue: 3000, sortOrder: 0 },
    { slug: "my_3k_5k", label: "RM 3,000 - RM 5,000", currency: "MYR", period: "MONTHLY" as const, minValue: 3000, maxValue: 5000, sortOrder: 1 },
    { slug: "my_5k_10k", label: "RM 5,000 - RM 10,000", currency: "MYR", period: "MONTHLY" as const, minValue: 5000, maxValue: 10000, sortOrder: 2 },
    { slug: "my_10k_20k", label: "RM 10,000 - RM 20,000", currency: "MYR", period: "MONTHLY" as const, minValue: 10000, maxValue: 20000, sortOrder: 3 },
    { slug: "my_20k_plus", label: "RM 20,000+", currency: "MYR", period: "MONTHLY" as const, minValue: 20000, maxValue: null, sortOrder: 4 },
  ];
  const myCount = await upsertIncomeRanges("MY", myRanges);
  if (myCount) console.log(`  ✓ ${myCount} Malaysia income ranges (MYR)`);

  // ============= OMAN (OMR - Monthly) =============
  const omRanges = [
    { slug: "om_0_500", label: "Under OMR 500", currency: "OMR", period: "MONTHLY" as const, minValue: 0, maxValue: 500, sortOrder: 0 },
    { slug: "om_500_1000", label: "OMR 500 - OMR 1,000", currency: "OMR", period: "MONTHLY" as const, minValue: 500, maxValue: 1000, sortOrder: 1 },
    { slug: "om_1000_2000", label: "OMR 1,000 - OMR 2,000", currency: "OMR", period: "MONTHLY" as const, minValue: 1000, maxValue: 2000, sortOrder: 2 },
    { slug: "om_2000_3500", label: "OMR 2,000 - OMR 3,500", currency: "OMR", period: "MONTHLY" as const, minValue: 2000, maxValue: 3500, sortOrder: 3 },
    { slug: "om_3500_plus", label: "OMR 3,500+", currency: "OMR", period: "MONTHLY" as const, minValue: 3500, maxValue: null, sortOrder: 4 },
  ];
  const omCount = await upsertIncomeRanges("OM", omRanges);
  if (omCount) console.log(`  ✓ ${omCount} Oman income ranges (OMR)`);

  // ============= BAHRAIN (BHD - Monthly) =============
  const bhRanges = [
    { slug: "bh_0_500", label: "Under BHD 500", currency: "BHD", period: "MONTHLY" as const, minValue: 0, maxValue: 500, sortOrder: 0 },
    { slug: "bh_500_1000", label: "BHD 500 - BHD 1,000", currency: "BHD", period: "MONTHLY" as const, minValue: 500, maxValue: 1000, sortOrder: 1 },
    { slug: "bh_1000_2000", label: "BHD 1,000 - BHD 2,000", currency: "BHD", period: "MONTHLY" as const, minValue: 1000, maxValue: 2000, sortOrder: 2 },
    { slug: "bh_2000_3000", label: "BHD 2,000 - BHD 3,000", currency: "BHD", period: "MONTHLY" as const, minValue: 2000, maxValue: 3000, sortOrder: 3 },
    { slug: "bh_3000_plus", label: "BHD 3,000+", currency: "BHD", period: "MONTHLY" as const, minValue: 3000, maxValue: null, sortOrder: 4 },
  ];
  const bhCount = await upsertIncomeRanges("BH", bhRanges);
  if (bhCount) console.log(`  ✓ ${bhCount} Bahrain income ranges (BHD)`);

  console.log("✅ Income ranges seeded successfully!");
}

// ============================================================================
// LANGUAGES
// ============================================================================
async function seedLanguages() {
  console.log("🌱 Seeding languages...");

  const languages = [
    { code: "ur", slug: "urdu", label: "Urdu", labelNative: "اردو", sortOrder: 0 },
    { code: "en", slug: "english", label: "English", labelNative: "English", sortOrder: 1 },
    { code: "pa", slug: "punjabi", label: "Punjabi", labelNative: "پنجابی", sortOrder: 2 },
    { code: "ps", slug: "pashto", label: "Pashto", labelNative: "پښتو", sortOrder: 3 },
    { code: "sd", slug: "sindhi", label: "Sindhi", labelNative: "سنڌي", sortOrder: 4 },
    { code: "bal", slug: "balochi", label: "Balochi", labelNative: "بلوچی", sortOrder: 5 },
    { code: "skr", slug: "saraiki", label: "Saraiki", labelNative: "سرائیکی", sortOrder: 6 },
    { code: "kas", slug: "kashmiri", label: "Kashmiri", labelNative: "کٲشُر", sortOrder: 7 },
    { code: "hnd", slug: "hindko", label: "Hindko", labelNative: "ہندکو", sortOrder: 8 },
    { code: "ar", slug: "arabic", label: "Arabic", labelNative: "العربية", sortOrder: 9 },
    { code: "hi", slug: "hindi", label: "Hindi", labelNative: "हिन्दी", sortOrder: 10 },
    { code: "bn", slug: "bengali", label: "Bengali", labelNative: "বাংলা", sortOrder: 11 },
    { code: "fa", slug: "persian", label: "Persian/Farsi", labelNative: "فارسی", sortOrder: 12 },
    { code: "tr", slug: "turkish", label: "Turkish", labelNative: "Türkçe", sortOrder: 13 },
    { code: "de", slug: "german", label: "German", labelNative: "Deutsch", sortOrder: 14 },
    { code: "fr", slug: "french", label: "French", labelNative: "Français", sortOrder: 15 },
    { code: "es", slug: "spanish", label: "Spanish", labelNative: "Español", sortOrder: 16 },
    { code: "zh", slug: "chinese", label: "Chinese", labelNative: "中文", sortOrder: 17 },
    { code: "other", slug: "other_language", label: "Other", labelNative: null, sortOrder: 99 },
  ];

  // Both code and slug are unique, so check for existing records by either field
  for (const lang of languages) {
    const existing = await prisma.language.findFirst({
      where: { OR: [{ code: lang.code }, { slug: lang.slug }] },
    });
    if (existing) {
      await prisma.language.update({
        where: { id: existing.id },
        data: { ...lang, isActive: true },
      });
    } else {
      await prisma.language.create({
        data: { ...lang, isActive: true },
      });
    }
  }
  console.log(`  ✓ ${languages.length} languages`);

  console.log("✅ Languages seeded successfully!");
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  console.log("🚀 Starting database seeding...\n");

  // Already seeded successfully - uncomment if needed to re-run:
  // await seedSubscriptionPlans();
  // await seedCreditActions();
  // await seedCreditPackages();
  // await seedPaymentSettings();
  // await seedOriginsAndEthnicities();
  // await seedSectsAndMaslaks();
  // await seedCountries();
  // await seedStatesAndCities();
  // await seedHeights();
  // await seedEducationLevels();
  // await seedEducationFields();
  // await seedIncomeRanges();

  // Remaining to seed:
  await seedLanguages();

  console.log("\n🎉 All seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
