import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedOrigins() {
  console.log("🌍 Seeding Origins...");

  const origins = [
    { name: "Pakistani", code: "PK", sortOrder: 1 },
    { name: "Indian", code: "IN", sortOrder: 2 },
    { name: "Bangladeshi", code: "BD", sortOrder: 3 },
    { name: "Afghan", code: "AF", sortOrder: 4 },
    { name: "Arab", code: "AR", sortOrder: 5 },
    { name: "Turkish", code: "TR", sortOrder: 6 },
    { name: "Iranian", code: "IR", sortOrder: 7 },
    { name: "Other", code: "OT", sortOrder: 99 },
  ];

  for (const origin of origins) {
    await prisma.origin.upsert({
      where: { name: origin.name },
      update: {},
      create: origin,
    });
  }
  console.log("✅ Origins seeded");
}

async function seedEthnicitiesAndCastes() {
  console.log("👥 Seeding Ethnicities and Castes...");

  const pakistaniOrigin = await prisma.origin.findUnique({
    where: { name: "Pakistani" },
  });

  if (!pakistaniOrigin) {
    console.log("❌ Pakistani origin not found, skipping ethnicities");
    return;
  }

  // Pakistani Ethnicities with their Castes
  const ethnicities = [
    {
      name: "Punjabi",
      castes: [
        "Arain", "Awan", "Bhatti", "Butt", "Chaudhry", "Cheema", "Dogar",
        "Gujjar", "Jat", "Jutt", "Khokhar", "Malik", "Mughal", "Rajput",
        "Rana", "Sheikh", "Syed", "Tarar", "Warraich", "Other"
      ],
    },
    {
      name: "Sindhi",
      castes: [
        "Abbasi", "Baloch", "Chandio", "Jatoi", "Junejo", "Kalhoro",
        "Khoso", "Leghari", "Memon", "Mirza", "Samejo", "Syed", "Talpur", "Other"
      ],
    },
    {
      name: "Pashtun",
      castes: [
        "Achakzai", "Afridi", "Bangash", "Khattak", "Mahsud", "Marwat",
        "Mohmand", "Orakzai", "Shinwari", "Wazir", "Yousafzai", "Other"
      ],
    },
    {
      name: "Baloch",
      castes: [
        "Bugti", "Jamali", "Leghari", "Marri", "Mazari", "Mengal",
        "Raisani", "Rind", "Zardari", "Other"
      ],
    },
    {
      name: "Muhajir",
      castes: [
        "Ansari", "Khan", "Memon", "Qureshi", "Sheikh", "Siddiqui", "Syed", "Other"
      ],
    },
    {
      name: "Kashmiri",
      castes: [
        "Butt", "Dar", "Khan", "Lone", "Malik", "Mir", "Rather",
        "Sheikh", "Wani", "Other"
      ],
    },
    {
      name: "Saraiki",
      castes: [
        "Abbasi", "Buzdar", "Dreshak", "Jatoi", "Khosa", "Laghari",
        "Mazari", "Qaisrani", "Other"
      ],
    },
    {
      name: "Hazara",
      castes: ["Hazara", "Syed", "Other"],
    },
    {
      name: "Other",
      castes: ["Other"],
    },
  ];

  for (const eth of ethnicities) {
    const ethnicity = await prisma.ethnicity.upsert({
      where: {
        name_originId: {
          name: eth.name,
          originId: pakistaniOrigin.id,
        },
      },
      update: {},
      create: {
        name: eth.name,
        originId: pakistaniOrigin.id,
      },
    });

    // Create castes for this ethnicity
    for (let i = 0; i < eth.castes.length; i++) {
      await prisma.caste.upsert({
        where: {
          name_ethnicityId: {
            name: eth.castes[i],
            ethnicityId: ethnicity.id,
          },
        },
        update: {},
        create: {
          name: eth.castes[i],
          ethnicityId: ethnicity.id,
          sortOrder: i,
        },
      });
    }
  }
  console.log("✅ Ethnicities and Castes seeded");
}

async function seedSectsAndMaslaks() {
  console.log("🕌 Seeding Sects and Maslaks...");

  const sects = [
    {
      name: "Sunni",
      description: "Sunni Islam",
      maslaks: [
        { name: "Deobandi", description: "Hanafi school, emphasis on Quran and Hadith" },
        { name: "Barelvi", description: "Hanafi school with Sufi traditions" },
        { name: "Ahl-e-Hadith", description: "Salafi approach, Quran and Hadith based" },
        { name: "Jamaat-e-Islami", description: "Islamic revivalist movement" },
        { name: "Tableeghi Jamaat", description: "Grassroots Islamic movement" },
        { name: "Just Sunni", description: "General Sunni Muslim" },
        { name: "Other", description: "Other Sunni school" },
      ],
    },
    {
      name: "Shia",
      description: "Shia Islam",
      maslaks: [
        { name: "Ithna Ashari (Twelver)", description: "Followers of twelve Imams" },
        { name: "Ismaili", description: "Followers of Aga Khan" },
        { name: "Bohra", description: "Dawoodi Bohra community" },
        { name: "Just Shia", description: "General Shia Muslim" },
        { name: "Other", description: "Other Shia school" },
      ],
    },
    {
      name: "Other",
      description: "Other Islamic traditions",
      maslaks: [
        { name: "Ahmadiyya", description: "Ahmadiyya community" },
        { name: "Non-Sectarian", description: "No specific sect" },
        { name: "Other", description: "Other tradition" },
      ],
    },
  ];

  for (let i = 0; i < sects.length; i++) {
    const sect = await prisma.sect.upsert({
      where: { name: sects[i].name },
      update: {},
      create: {
        name: sects[i].name,
        description: sects[i].description,
        sortOrder: i,
      },
    });

    // Create maslaks for this sect
    for (let j = 0; j < sects[i].maslaks.length; j++) {
      await prisma.maslak.upsert({
        where: {
          name_sectId: {
            name: sects[i].maslaks[j].name,
            sectId: sect.id,
          },
        },
        update: {},
        create: {
          name: sects[i].maslaks[j].name,
          description: sects[i].maslaks[j].description,
          sectId: sect.id,
          sortOrder: j,
        },
      });
    }
  }
  console.log("✅ Sects and Maslaks seeded");
}

async function seedEducation() {
  console.log("🎓 Seeding Education Levels and Fields...");

  const educationLevels = [
    { name: "Below High School", shortName: "Below HS", sortOrder: 1 },
    { name: "High School / Matric", shortName: "Matric", sortOrder: 2 },
    { name: "Intermediate / FSc / FA", shortName: "Inter", sortOrder: 3 },
    { name: "Diploma / Certificate", shortName: "Diploma", sortOrder: 4 },
    { name: "Bachelor's Degree", shortName: "Bachelor", sortOrder: 5 },
    { name: "Master's Degree", shortName: "Master", sortOrder: 6 },
    { name: "M.Phil / MS", shortName: "M.Phil", sortOrder: 7 },
    { name: "PhD / Doctorate", shortName: "PhD", sortOrder: 8 },
    { name: "Professional Degree (MBBS, LLB, etc.)", shortName: "Professional", sortOrder: 9 },
    { name: "Islamic Education / Aalim / Hafiz", shortName: "Islamic", sortOrder: 10 },
    { name: "Other", shortName: "Other", sortOrder: 99 },
  ];

  for (const level of educationLevels) {
    await prisma.educationLevel.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }

  const educationFields = [
    { name: "Medicine / Healthcare", category: "Medical" },
    { name: "Engineering", category: "STEM" },
    { name: "Computer Science / IT", category: "STEM" },
    { name: "Business / Commerce", category: "Business" },
    { name: "Arts / Humanities", category: "Arts" },
    { name: "Science (Physics, Chemistry, Biology)", category: "STEM" },
    { name: "Law / Legal Studies", category: "Professional" },
    { name: "Education / Teaching", category: "Education" },
    { name: "Islamic Studies / Quran", category: "Religious" },
    { name: "Economics / Finance", category: "Business" },
    { name: "Agriculture", category: "Agriculture" },
    { name: "Architecture / Design", category: "Arts" },
    { name: "Media / Journalism", category: "Arts" },
    { name: "Psychology / Social Sciences", category: "Social Sciences" },
    { name: "Pharmacy", category: "Medical" },
    { name: "Nursing", category: "Medical" },
    { name: "Accounting / CA", category: "Business" },
    { name: "Fashion / Textile Design", category: "Arts" },
    { name: "Hospitality / Tourism", category: "Services" },
    { name: "Other", category: "Other" },
  ];

  for (let i = 0; i < educationFields.length; i++) {
    await prisma.educationField.upsert({
      where: { name: educationFields[i].name },
      update: {},
      create: {
        ...educationFields[i],
        sortOrder: i,
      },
    });
  }
  console.log("✅ Education Levels and Fields seeded");
}

async function seedHeights() {
  console.log("📏 Seeding Heights...");

  // Heights from 4'6" to 6'6"
  const heights = [];
  for (let feet = 4; feet <= 6; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      if (feet === 4 && inches < 6) continue; // Start from 4'6"
      if (feet === 6 && inches > 6) break; // End at 6'6"

      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);

      heights.push({
        feet,
        inches,
        cm,
        display: `${feet}'${inches}" (${cm} cm)`,
        sortOrder: totalInches,
      });
    }
  }

  for (const height of heights) {
    await prisma.height.upsert({
      where: {
        feet_inches: {
          feet: height.feet,
          inches: height.inches,
        },
      },
      update: {},
      create: height,
    });
  }
  console.log("✅ Heights seeded");
}

async function seedLanguages() {
  console.log("🗣️ Seeding Languages...");

  const languages = [
    { name: "Urdu", nativeName: "اردو", code: "ur", sortOrder: 1 },
    { name: "English", nativeName: "English", code: "en", sortOrder: 2 },
    { name: "Punjabi", nativeName: "پنجابی", code: "pa", sortOrder: 3 },
    { name: "Sindhi", nativeName: "سنڌي", code: "sd", sortOrder: 4 },
    { name: "Pashto", nativeName: "پښتو", code: "ps", sortOrder: 5 },
    { name: "Balochi", nativeName: "بلوچی", code: "bal", sortOrder: 6 },
    { name: "Saraiki", nativeName: "سرائیکی", code: "skr", sortOrder: 7 },
    { name: "Kashmiri", nativeName: "کٲشُر", code: "ks", sortOrder: 8 },
    { name: "Hindko", nativeName: "ہندکو", code: "hno", sortOrder: 9 },
    { name: "Brahui", nativeName: "براہوئی", code: "brh", sortOrder: 10 },
    { name: "Arabic", nativeName: "العربية", code: "ar", sortOrder: 11 },
    { name: "Persian / Farsi", nativeName: "فارسی", code: "fa", sortOrder: 12 },
    { name: "Turkish", nativeName: "Türkçe", code: "tr", sortOrder: 13 },
    { name: "Hindi", nativeName: "हिन्दी", code: "hi", sortOrder: 14 },
    { name: "Bengali", nativeName: "বাংলা", code: "bn", sortOrder: 15 },
    { name: "Other", nativeName: "Other", code: "other", sortOrder: 99 },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { name: lang.name },
      update: {},
      create: lang,
    });
  }
  console.log("✅ Languages seeded");
}

async function seedCountriesAndLocations() {
  console.log("🌏 Seeding Countries, States, and Cities...");

  // Countries with dial codes
  const countries = [
    { name: "Pakistan", code: "PK", dialCode: "+92", sortOrder: 1 },
    { name: "United Kingdom", code: "GB", dialCode: "+44", sortOrder: 2 },
    { name: "United States", code: "US", dialCode: "+1", sortOrder: 3 },
    { name: "Canada", code: "CA", dialCode: "+1", sortOrder: 4 },
    { name: "United Arab Emirates", code: "AE", dialCode: "+971", sortOrder: 5 },
    { name: "Saudi Arabia", code: "SA", dialCode: "+966", sortOrder: 6 },
    { name: "Qatar", code: "QA", dialCode: "+974", sortOrder: 7 },
    { name: "Bahrain", code: "BH", dialCode: "+973", sortOrder: 8 },
    { name: "Kuwait", code: "KW", dialCode: "+965", sortOrder: 9 },
    { name: "Oman", code: "OM", dialCode: "+968", sortOrder: 10 },
    { name: "Australia", code: "AU", dialCode: "+61", sortOrder: 11 },
    { name: "Germany", code: "DE", dialCode: "+49", sortOrder: 12 },
    { name: "France", code: "FR", dialCode: "+33", sortOrder: 13 },
    { name: "Italy", code: "IT", dialCode: "+39", sortOrder: 14 },
    { name: "Malaysia", code: "MY", dialCode: "+60", sortOrder: 15 },
    { name: "Singapore", code: "SG", dialCode: "+65", sortOrder: 16 },
    { name: "Turkey", code: "TR", dialCode: "+90", sortOrder: 17 },
    { name: "India", code: "IN", dialCode: "+91", sortOrder: 18 },
    { name: "Bangladesh", code: "BD", dialCode: "+880", sortOrder: 19 },
    { name: "Afghanistan", code: "AF", dialCode: "+93", sortOrder: 20 },
    { name: "Other", code: "OT", dialCode: "", sortOrder: 99 },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }

  // Pakistan provinces and cities
  const pakistan = await prisma.country.findUnique({
    where: { code: "PK" },
  });

  if (pakistan) {
    const pakistanProvinces = [
      {
        name: "Punjab",
        code: "PB",
        cities: [
          "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala",
          "Sialkot", "Bahawalpur", "Sargodha", "Jhang", "Sheikhupura",
          "Gujrat", "Kasur", "Sahiwal", "Okara", "Chiniot", "Rahim Yar Khan",
          "Muzaffargarh", "Mianwali", "Chakwal", "Attock", "Jhelum",
          "Bahawalnagar", "Khanewal", "Vehari", "Lodhran", "DG Khan",
        ],
      },
      {
        name: "Sindh",
        code: "SD",
        cities: [
          "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah",
          "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Thatta",
          "Dadu", "Badin", "Sanghar", "Umerkot", "Ghotki",
        ],
      },
      {
        name: "Khyber Pakhtunkhwa",
        code: "KP",
        cities: [
          "Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat",
          "Bannu", "Dera Ismail Khan", "Charsadda", "Swabi", "Nowshera",
          "Mansehra", "Haripur", "Chitral", "Dir", "Malakand",
        ],
      },
      {
        name: "Balochistan",
        code: "BA",
        cities: [
          "Quetta", "Gwadar", "Turbat", "Khuzdar", "Hub",
          "Chaman", "Zhob", "Sibi", "Loralai", "Pishin",
        ],
      },
      {
        name: "Islamabad Capital Territory",
        code: "IS",
        cities: ["Islamabad"],
      },
      {
        name: "Azad Jammu & Kashmir",
        code: "AJK",
        cities: [
          "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bagh",
          "Bhimber", "Pallandri", "Hajira",
        ],
      },
      {
        name: "Gilgit-Baltistan",
        code: "GB",
        cities: [
          "Gilgit", "Skardu", "Chilas", "Hunza", "Ghizer",
          "Astore", "Khaplu",
        ],
      },
    ];

    for (let i = 0; i < pakistanProvinces.length; i++) {
      const province = await prisma.stateProvince.upsert({
        where: {
          name_countryId: {
            name: pakistanProvinces[i].name,
            countryId: pakistan.id,
          },
        },
        update: {},
        create: {
          name: pakistanProvinces[i].name,
          code: pakistanProvinces[i].code,
          countryId: pakistan.id,
          sortOrder: i,
        },
      });

      // Create cities for this province
      for (let j = 0; j < pakistanProvinces[i].cities.length; j++) {
        await prisma.city.upsert({
          where: {
            name_stateProvinceId: {
              name: pakistanProvinces[i].cities[j],
              stateProvinceId: province.id,
            },
          },
          update: {},
          create: {
            name: pakistanProvinces[i].cities[j],
            stateProvinceId: province.id,
            sortOrder: j,
          },
        });
      }
    }
  }

  console.log("✅ Countries, States, and Cities seeded");
}

async function seedIncomeRanges() {
  console.log("💰 Seeding Income Ranges...");

  const incomeRanges = [
    { minAmount: 0, maxAmount: 25000, display: "Below Rs. 25,000", displayUSD: "Below $100", sortOrder: 1 },
    { minAmount: 25000, maxAmount: 50000, display: "Rs. 25,000 - 50,000", displayUSD: "$100 - $200", sortOrder: 2 },
    { minAmount: 50000, maxAmount: 100000, display: "Rs. 50,000 - 100,000", displayUSD: "$200 - $400", sortOrder: 3 },
    { minAmount: 100000, maxAmount: 150000, display: "Rs. 100,000 - 150,000", displayUSD: "$400 - $600", sortOrder: 4 },
    { minAmount: 150000, maxAmount: 200000, display: "Rs. 150,000 - 200,000", displayUSD: "$600 - $800", sortOrder: 5 },
    { minAmount: 200000, maxAmount: 300000, display: "Rs. 200,000 - 300,000", displayUSD: "$800 - $1,200", sortOrder: 6 },
    { minAmount: 300000, maxAmount: 500000, display: "Rs. 300,000 - 500,000", displayUSD: "$1,200 - $2,000", sortOrder: 7 },
    { minAmount: 500000, maxAmount: 1000000, display: "Rs. 500,000 - 10 Lac", displayUSD: "$2,000 - $4,000", sortOrder: 8 },
    { minAmount: 1000000, maxAmount: 2000000, display: "Rs. 10 Lac - 20 Lac", displayUSD: "$4,000 - $8,000", sortOrder: 9 },
    { minAmount: 2000000, maxAmount: null, display: "Above Rs. 20 Lac", displayUSD: "Above $8,000", sortOrder: 10 },
  ];

  for (const range of incomeRanges) {
    // Use display as a unique identifier since we don't have a unique constraint
    const existing = await prisma.incomeRange.findFirst({
      where: { display: range.display },
    });

    if (!existing) {
      await prisma.incomeRange.create({
        data: range,
      });
    }
  }
  console.log("✅ Income Ranges seeded");
}

async function seedSuperAdmin() {
  console.log("👤 Checking Super Admin...");

  const superAdminExists = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!superAdminExists) {
    const hashedPassword = await bcrypt.hash("SuperAdmin123!", 12);

    const superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@nikahfirst.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
        isVerified: true,
        emailVerified: true,
        redeemWallet: {
          create: {
            balance: 100,
            frozenBalance: 0,
            limit: 100,
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        fundingWallet: {
          create: {
            balance: 1000,
            frozenBalance: 0,
          },
        },
      },
    });

    console.log("✅ Super Admin created:", superAdmin.email);
    console.log("📧 Email: superadmin@nikahfirst.com");
    console.log("🔑 Password: SuperAdmin123!");
    console.log("⚠️  CHANGE THIS PASSWORD IMMEDIATELY!");
  } else {
    console.log("✅ Super Admin already exists");
  }
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  // Seed lookup tables first
  await seedOrigins();
  await seedEthnicitiesAndCastes();
  await seedSectsAndMaslaks();
  await seedEducation();
  await seedHeights();
  await seedLanguages();
  await seedCountriesAndLocations();
  await seedIncomeRanges();

  // Seed super admin last
  await seedSuperAdmin();

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
