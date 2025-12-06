import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

<<<<<<< HEAD
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
=======
async function main() {
  console.log("🌱 Starting seed...");

  // ============================================================================
  // ORIGINS
  // ============================================================================
  console.log("📍 Seeding Origins...");

  const origins = await Promise.all([
    prisma.origin.upsert({
      where: { slug: "pakistani" },
      update: {},
      create: {
        slug: "pakistani",
        label: "Pakistani Origin",
        labelNative: "پاکستانی",
        emoji: "🇵🇰",
        sortOrder: 1,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "indian" },
      update: {},
      create: {
        slug: "indian",
        label: "Indian Origin",
        labelNative: "ہندوستانی",
        emoji: "🇮🇳",
        sortOrder: 2,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "bangladeshi" },
      update: {},
      create: {
        slug: "bangladeshi",
        label: "Bangladeshi Origin",
        labelNative: "বাংলাদেশী",
        emoji: "🇧🇩",
        sortOrder: 3,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "arab" },
      update: {},
      create: {
        slug: "arab",
        label: "Arab Origin",
        labelNative: "عربی",
        emoji: "🌙",
        sortOrder: 4,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "north_african" },
      update: {},
      create: {
        slug: "north_african",
        label: "North African / Maghrebi Origin",
        emoji: "🏜️",
        sortOrder: 5,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "sub_saharan_african" },
      update: {},
      create: {
        slug: "sub_saharan_african",
        label: "Sub-Saharan African Origin",
        emoji: "🌍",
        sortOrder: 6,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "southeast_asian" },
      update: {},
      create: {
        slug: "southeast_asian",
        label: "Southeast Asian Origin",
        emoji: "🌴",
        sortOrder: 7,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "turkish_central_asian" },
      update: {},
      create: {
        slug: "turkish_central_asian",
        label: "Turkish & Central Asian Origin",
        emoji: "🕌",
        sortOrder: 8,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "persian_afghan" },
      update: {},
      create: {
        slug: "persian_afghan",
        label: "Persian & Afghan Origin",
        emoji: "🏔️",
        sortOrder: 9,
      },
    }),
    prisma.origin.upsert({
      where: { slug: "european_western" },
      update: {},
      create: {
        slug: "european_western",
        label: "European, American & Other Origin",
        emoji: "🌐",
        sortOrder: 10,
      },
    }),
  ]);

  const pakistaniOrigin = origins.find((o) => o.slug === "pakistani")!;

  // ============================================================================
  // PAKISTANI ETHNICITIES & CASTES
  // ============================================================================
  console.log("👥 Seeding Pakistani Ethnicities & Castes...");

  // Define ethnicities with their castes
  const pakistaniEthnicities = [
    {
      slug: "punjabi",
      label: "Punjabi",
      labelNative: "پنجابی",
      isPopular: true,
      castes: [
        "Awan",
        "Arain",
        "Baig",
        "Bajwa",
        "Bhatti",
        "Chatha",
        "Chaudry",
        "Chauhan",
        "Chughtai",
        "Dogar",
        "Gakhar",
        "Gujjar",
        "Janjua",
        "Jutt",
        "Kharal",
        "Khawaja",
        "Khokhar",
        "Makhdoom",
        "Malik",
        "Mughal",
        "Qureshi",
        "Rajput",
        "Rana",
        "Sahi",
        "Syed",
        "Sheikh",
        "Tarar",
        "Tiwana",
        "Warraich",
      ],
    },
    {
      slug: "urdu_speaking",
      label: "Urdu Speaking (Muhajir)",
      labelNative: "اردو اسپیکنگ",
      isPopular: true,
      castes: [
        "Abbasi",
        "Alvi",
        "Ansari",
        "Askari",
        "Bukhari",
        "Chishti",
        "Fareedi",
        "Farooqi",
        "Ghazali",
        "Gilani",
        "Gujrati (Bhatia)",
        "Gujrati (Lakhani)",
        "Gujrati (Memon)",
        "Gujrati (Patel)",
        "Hamadani",
        "Hashmi",
        "Hasni (Sadat)",
        "Hussaini (Sadat)",
        "Kashani",
        "Kermani",
        "Memon",
        "Naqvi",
        "Qadri",
        "Qureshi",
        "Rizvi",
        "Siddiqui",
        "Syed",
        "Usmani",
        "Zaidi",
      ],
    },
    {
      slug: "pashtun",
      label: "Pashtun",
      labelNative: "پشتون",
      isPopular: true,
      castes: [
        "Achakzai",
        "Afridi",
        "Alizai",
        "Akakhel",
        "Bangash",
        "Burki",
        "Chamkanni",
        "Daulat Khel",
        "Dawar",
        "Durrani",
        "Gandapur",
        "Isa Khel",
        "Jogezai",
        "Jadoon",
        "Kakakhel",
        "Kakar",
        "Kakazai",
        "Khattak",
        "Khizarkhel",
        "Lodhi",
        "Mahsud",
        "Mandokhel",
        "Marwat",
        "Mohmand",
        "Niazi",
        "Orakzai",
        "Shinwari",
        "Swati",
        "Tanoli",
        "Wazir",
        "Yousafzai",
        "Zakhakhel",
      ],
    },
    {
      slug: "sindhi",
      label: "Sindhi",
      labelNative: "سندھی",
      isPopular: true,
      castes: [
        "Abro",
        "Arain",
        "Bhati",
        "Bhutto",
        "Chachar",
        "Chandio",
        "Hingora",
        "Jogi",
        "Junejo",
        "Kalhoro",
        "Kalwar",
        "Khaskheli",
        "Khushk (Baloch)",
        "Kumbhar",
        "Lakhani",
        "Leghari",
        "Mahar",
        "Mahesar",
        "Memon",
        "Mirani",
        "Panhwar",
        "Rind (Baloch)",
        "Shah",
        "Shar",
        "Soomro",
        "Talpur",
        "Unar",
      ],
    },
    {
      slug: "siraiki",
      label: "Siraiki",
      labelNative: "سرائیکی",
      isPopular: false,
      castes: [
        "Arain",
        "Bhati",
        "Bosan",
        "Bukhari",
        "Chachar",
        "Chandio",
        "Chugntai",
        "Hashmi",
        "Kalwar",
        "Khokhar",
        "Laar",
        "Leghari",
        "Makhdoom",
        "Malik",
        "Mazari",
        "Panwar",
        "Qureshi",
        "Rind",
        "Ravani",
        "Shah",
        "Syed",
      ],
    },
    {
      slug: "balochi",
      label: "Balochi",
      labelNative: "بلوچی",
      isPopular: false,
      castes: [
        "Buledi",
        "Buzdar",
        "Chandio",
        "Darzada",
        "Dehwar",
        "Gabol",
        "Jalbani",
        "Jamali",
        "Jatoi",
        "Jiskani",
        "Kalmati",
        "Kalpar",
        "Kambarzahi",
        "Kenagzai",
        "Khetran",
        "Khushk",
        "Korai",
        "Langhani",
        "Lashari",
        "Leghari",
        "Magsi",
        "Marri",
        "Mazari",
        "Mengal",
        "Notezai",
        "Raisani",
        "Rind",
        "Zehri",
      ],
    },
    {
      slug: "kashmiri",
      label: "Kashmiri",
      labelNative: "کشمیری",
      isPopular: false,
      castes: [
        "Butt",
        "Dar",
        "Khan",
        "Lone",
        "Malik",
        "Mir",
        "Rather",
        "Shah",
        "Shaikh",
        "Wani",
        "Zargar",
      ],
    },
    {
      slug: "brahui",
      label: "Brahui",
      labelNative: "براہوی",
      isPopular: false,
      castes: [
        "Bangulzai",
        "Bizenjo",
        "Bahrani",
        "Hasni",
        "Jhalawan",
        "Khan-e-Qalat",
        "Kharal",
        "Lehri",
        "Mirwani",
        "Mengal",
        "Raisani",
        "Rodini",
        "Sarpara",
        "Shahwani",
        "Sumalani",
      ],
    },
    {
      slug: "hindkowan",
      label: "Hindkowan",
      labelNative: "ہندکوان",
      isPopular: false,
      castes: [
        "Abbasi",
        "Awan",
        "Gujjar",
        "Karlal",
        "Qureshi",
        "Swati",
        "Syed",
        "Tanoli",
      ],
    },
    {
      slug: "hazara",
      label: "Hazara",
      labelNative: "ہزارہ",
      isPopular: false,
      castes: [
        "Behsudi",
        "Daikundi",
        "Jaghori",
        "Polada",
        "Sheikh Ali",
        "Uruzgani",
      ],
    },
    {
      slug: "burusho",
      label: "Burusho",
      labelNative: "بروشو",
      isPopular: false,
      castes: ["Barataling", "Burong", "Diramiting", "Khurukutz"],
    },
  ];

  for (const ethData of pakistaniEthnicities) {
    // Create ethnicity
    const ethnicity = await prisma.ethnicity.upsert({
      where: {
        originId_slug: { originId: pakistaniOrigin.id, slug: ethData.slug },
      },
      update: {},
      create: {
        originId: pakistaniOrigin.id,
        slug: ethData.slug,
        label: ethData.label,
        labelNative: ethData.labelNative,
        isPopular: ethData.isPopular,
        sortOrder: pakistaniEthnicities.indexOf(ethData) + 1,
>>>>>>> main
      },
    });

    // Create castes for this ethnicity
    for (let i = 0; i < ethData.castes.length; i++) {
      const casteName = ethData.castes[i];
      const casteSlug = casteName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "")
        .replace(/\//g, "_");

      await prisma.caste.upsert({
        where: {
          ethnicityId_slug: { ethnicityId: ethnicity.id, slug: casteSlug },
        },
        update: {},
        create: {
          ethnicityId: ethnicity.id,
          slug: casteSlug,
          label: casteName,
          sortOrder: i + 1,
          isPopular: i < 5, // First 5 are popular
        },
      });
    }
  }

  // ============================================================================
  // RELIGIOUS SECTS & MASLAKS
  // ============================================================================
  console.log("🕌 Seeding Religious Sects...");

  const sunni = await prisma.sect.upsert({
    where: { slug: "sunni" },
    update: {},
    create: { slug: "sunni", label: "Sunni", sortOrder: 1 },
  });

  const shia = await prisma.sect.upsert({
    where: { slug: "shia" },
    update: {},
    create: { slug: "shia", label: "Shia", sortOrder: 2 },
  });

  const nonDenom = await prisma.sect.upsert({
    where: { slug: "non_denominational" },
    update: {},
    create: {
      slug: "non_denominational",
      label: "Non-denominational",
      sortOrder: 3,
    },
  });

  // Sunni Maslaks
  const sunniMaslaks = [
    {
      slug: "not_important",
      label: "Not Important / Just Sunni",
      sortOrder: 1,
    },
    { slug: "hanafi", label: "Hanafi", sortOrder: 2 },
    { slug: "hanafi_deobandi", label: "Hanafi - Deobandi", sortOrder: 3 },
    { slug: "hanafi_barelvi", label: "Hanafi - Barelvi", sortOrder: 4 },
    { slug: "hanafi_tableeghi", label: "Hanafi - Tableeghi", sortOrder: 5 },
    { slug: "shafii", label: "Shafi'i", sortOrder: 6 },
    { slug: "maliki", label: "Maliki", sortOrder: 7 },
    { slug: "hanbali", label: "Hanbali", sortOrder: 8 },
    { slug: "salafi", label: "Salafi / Ahl-e-Hadith", sortOrder: 9 },
    { slug: "ikhwani", label: "Haraki / Ikhwani", sortOrder: 10 },
  ];

  for (const maslak of sunniMaslaks) {
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: sunni.id, slug: maslak.slug } },
      update: {},
      create: { sectId: sunni.id, ...maslak },
    });
  }

  // Shia Maslaks
  const shiaMaslaks = [
    { slug: "not_important", label: "Not Important / Just Shia", sortOrder: 1 },
    { slug: "twelver", label: "Twelver (Ithna Ashari)", sortOrder: 2 },
    { slug: "ismaili", label: "Ismaili (Aga Khani)", sortOrder: 3 },
    { slug: "bohra", label: "Bohra (Dawoodi)", sortOrder: 4 },
    { slug: "alawite", label: "Alawite", sortOrder: 5 },
    { slug: "zaidi", label: "Zaidi", sortOrder: 6 },
  ];

  for (const maslak of shiaMaslaks) {
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: shia.id, slug: maslak.slug } },
      update: {},
      create: { sectId: shia.id, ...maslak },
    });
  }

  // Non-denominational
  const nonDenomMaslaks = [
    { slug: "quranist", label: "Quranist", sortOrder: 1 },
    { slug: "progressive", label: "Progressive Muslim", sortOrder: 2 },
    { slug: "prefer_not_say", label: "Prefer not to specify", sortOrder: 3 },
  ];

  for (const maslak of nonDenomMaslaks) {
    await prisma.maslak.upsert({
      where: { sectId_slug: { sectId: nonDenom.id, slug: maslak.slug } },
      update: {},
      create: { sectId: nonDenom.id, ...maslak },
    });
  }

  // ============================================================================
  // EDUCATION LEVELS
  // ============================================================================
  console.log("🎓 Seeding Education Levels...");

  const educationLevels = [
    {
      slug: "secondary",
      label: "Secondary Education",
      level: 1,
      yearsOfEducation: 8,
      sortOrder: 1,
      tags: [],
    },
    {
      slug: "matric",
      label: "Higher Secondary (O-Levels, Matric)",
      level: 2,
      yearsOfEducation: 10,
      sortOrder: 2,
      tags: [],
    },
    {
      slug: "intermediate",
      label: "Undergraduate (A-Levels, Intermediate, FSc)",
      level: 3,
      yearsOfEducation: 12,
      sortOrder: 3,
      tags: [],
    },
    {
      slug: "certificate",
      label: "Certificate of Higher Education (FdA)",
      level: 4,
      yearsOfEducation: 13,
      sortOrder: 4,
      tags: [],
    },
    {
      slug: "bachelors_2yr",
      label: "Bachelors (BA, BSc) - 2 Year",
      level: 5,
      yearsOfEducation: 14,
      sortOrder: 5,
      tags: [],
    },
    {
      slug: "bachelors_honors",
      label: "Degree with Honors (BSc Hons, BBA)",
      level: 6,
      yearsOfEducation: 15,
      sortOrder: 6,
      tags: [],
    },
    {
      slug: "bs",
      label: "BS (Bachelor in Computer Science)",
      level: 7,
      yearsOfEducation: 16,
      sortOrder: 7,
      tags: ["IT Specialist"],
    },
    {
      slug: "be",
      label: "B.E. (Bachelor in Engineering)",
      level: 7,
      yearsOfEducation: 16,
      sortOrder: 8,
      tags: ["Engineer"],
    },
    {
      slug: "mbbs",
      label: "MBBS (Bachelor of Medicine)",
      level: 7,
      yearsOfEducation: 16,
      sortOrder: 9,
      tags: ["Doctor"],
    },
    {
      slug: "aalim",
      label: "Aalim (Dars-e-Nizami)",
      level: 7,
      yearsOfEducation: 16,
      sortOrder: 10,
      tags: ["Islamic Scholar"],
    },
    {
      slug: "masters",
      label: "Masters (MBA, MA, MSc)",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 11,
      tags: [],
    },
    {
      slug: "ms_cs",
      label: "MS (Masters in Computer Science)",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 12,
      tags: ["IT Specialist"],
    },
    {
      slug: "me",
      label: "ME (Masters in Engineering)",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 13,
      tags: ["Engineer"],
    },
    {
      slug: "medical_specialty",
      label: "Medical Specialties",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 14,
      tags: ["Doctor"],
    },
    {
      slug: "ca",
      label: "CA Qualified",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 15,
      tags: ["Chartered Accountant"],
    },
    {
      slug: "mufti",
      label: "Mufti",
      level: 8,
      yearsOfEducation: 18,
      sortOrder: 16,
      tags: ["Islamic Scholar"],
    },
    {
      slug: "postgraduate",
      label: "PostGraduate (M.Phil)",
      level: 9,
      yearsOfEducation: 20,
      sortOrder: 17,
      tags: [],
    },
    {
      slug: "phd",
      label: "Doctorate (PhD)",
      level: 9,
      yearsOfEducation: 22,
      sortOrder: 18,
      tags: [],
    },
  ];

  for (const edu of educationLevels) {
    await prisma.educationLevel.upsert({
      where: { slug: edu.slug },
      update: {},
      create: edu,
    });
  }

  // ============================================================================
  // EDUCATION FIELDS
  // ============================================================================
  console.log("📚 Seeding Education Fields...");

  const educationFields = [
    // Islamic
    {
      slug: "islamic_education",
      label: "Islamic Education",
      category: "Islamic",
      sortOrder: 1,
    },

    // Social Sciences
    {
      slug: "arts_literature",
      label: "Social Science (Arts & Literature)",
      category: "Social Science",
      sortOrder: 2,
    },
    {
      slug: "economics",
      label: "Social Science (Economics)",
      category: "Social Science",
      sortOrder: 3,
    },
    {
      slug: "geography",
      label: "Social Science (Geography)",
      category: "Social Science",
      sortOrder: 4,
    },
    {
      slug: "history",
      label: "Social Science (History)",
      category: "Social Science",
      sortOrder: 5,
    },
    {
      slug: "linguistics",
      label: "Social Science (Linguistics and Languages)",
      category: "Social Science",
      sortOrder: 6,
    },
    {
      slug: "philosophy",
      label: "Social Science (Philosophy)",
      category: "Social Science",
      sortOrder: 7,
    },
    {
      slug: "political_science",
      label: "Social Science (Political Science)",
      category: "Social Science",
      sortOrder: 8,
    },
    {
      slug: "psychology",
      label: "Social Science (Psychology)",
      category: "Social Science",
      sortOrder: 9,
    },
    {
      slug: "sociology",
      label: "Social Science (Sociology)",
      category: "Social Science",
      sortOrder: 10,
    },

    // Natural Sciences
    {
      slug: "biology",
      label: "Natural Sciences (Biology)",
      category: "Natural Science",
      sortOrder: 11,
    },
    {
      slug: "chemistry",
      label: "Natural Sciences (Chemistry)",
      category: "Natural Science",
      sortOrder: 12,
    },
    {
      slug: "earth_sciences",
      label: "Natural Sciences (Earth Sciences)",
      category: "Natural Science",
      sortOrder: 13,
    },
    {
      slug: "physics",
      label: "Natural Sciences (Physics)",
      category: "Natural Science",
      sortOrder: 14,
    },
    {
      slug: "space_sciences",
      label: "Natural Sciences (Space Sciences)",
      category: "Natural Science",
      sortOrder: 15,
    },

    // Applied Sciences
    {
      slug: "agriculture",
      label: "Applied Sciences (Agriculture)",
      category: "Applied Science",
      sortOrder: 16,
    },
    {
      slug: "architecture",
      label: "Applied Sciences (Architecture and Design)",
      category: "Applied Science",
      sortOrder: 17,
    },
    {
      slug: "business",
      label: "Applied Sciences (Business)",
      category: "Applied Science",
      sortOrder: 18,
    },
    {
      slug: "computer_science",
      label: "Applied Sciences (Computer Sciences)",
      category: "Applied Science",
      sortOrder: 19,
      tags: ["IT Specialist"],
    },
    {
      slug: "education",
      label: "Applied Sciences (Education)",
      category: "Applied Science",
      sortOrder: 20,
    },
    {
      slug: "engineering",
      label: "Applied Sciences (Engineering and Technology)",
      category: "Applied Science",
      sortOrder: 21,
      tags: ["Engineer"],
    },
    {
      slug: "environmental",
      label: "Applied Sciences (Environmental Studies and Forestry)",
      category: "Applied Science",
      sortOrder: 22,
    },
    {
      slug: "journalism",
      label: "Applied Sciences (Journalism, Media Studies and Communication)",
      category: "Applied Science",
      sortOrder: 23,
    },
    {
      slug: "law",
      label: "Applied Sciences (Law)",
      category: "Applied Science",
      sortOrder: 24,
    },
    {
      slug: "mathematics",
      label: "Applied Sciences (Mathematics & Applied Maths)",
      category: "Applied Science",
      sortOrder: 25,
    },
    {
      slug: "medicine",
      label: "Applied Sciences (Medicine)",
      category: "Applied Science",
      sortOrder: 26,
      tags: ["Doctor"],
    },
  ];

  for (const field of educationFields) {
    await prisma.educationField.upsert({
      where: { slug: field.slug },
      update: {},
      create: { ...field, tags: field.tags || [] },
    });
  }

  // ============================================================================
  // HEIGHTS
  // ============================================================================
  console.log("📏 Seeding Heights...");

  const heights = [];
  // Generate heights from 4'6" to 7'0"
  for (let feet = 4; feet <= 7; feet++) {
    const maxInches = feet === 7 ? 0 : 11;
    const startInches = feet === 4 ? 6 : 0;

    for (let inches = startInches; inches <= maxInches; inches++) {
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);

      heights.push({
        slug: `${feet}_${inches}`,
        labelImperial: `${feet}'${inches}"`,
        labelMetric: `${cm} cm`,
        centimeters: cm,
        sortOrder: heights.length + 1,
      });
    }
  }

  for (const height of heights) {
    await prisma.height.upsert({
      where: { slug: height.slug },
      update: {},
      create: height,
    });
  }

  // ============================================================================
  // LANGUAGES
  // ============================================================================
  console.log("🗣️ Seeding Languages...");

  const languages = [
    {
      code: "ur",
      slug: "urdu",
      label: "Urdu",
      labelNative: "اردو",
      sortOrder: 1,
    },
    {
      code: "pa",
      slug: "punjabi",
      label: "Punjabi",
      labelNative: "پنجابی",
      sortOrder: 2,
    },
    {
      code: "ps",
      slug: "pashto",
      label: "Pashto",
      labelNative: "پښتو",
      sortOrder: 3,
    },
    {
      code: "sd",
      slug: "sindhi",
      label: "Sindhi",
      labelNative: "سنڌي",
      sortOrder: 4,
    },
    {
      code: "bal",
      slug: "balochi",
      label: "Balochi",
      labelNative: "بلوچی",
      sortOrder: 5,
    },
    {
      code: "skr",
      slug: "siraiki",
      label: "Siraiki",
      labelNative: "سرائیکی",
      sortOrder: 6,
    },
    {
      code: "ks",
      slug: "kashmiri",
      label: "Kashmiri",
      labelNative: "کٲشُر",
      sortOrder: 7,
    },
    {
      code: "brh",
      slug: "brahui",
      label: "Brahui",
      labelNative: "براہوی",
      sortOrder: 8,
    },
    {
      code: "hnd",
      slug: "hindko",
      label: "Hindko",
      labelNative: "ہندکو",
      sortOrder: 9,
    },
    {
      code: "haz",
      slug: "hazaragi",
      label: "Hazaragi",
      labelNative: "هزارگی",
      sortOrder: 10,
    },
    {
      code: "bsk",
      slug: "burushaski",
      label: "Burushaski",
      labelNative: "بروشسکی",
      sortOrder: 11,
    },
    {
      code: "en",
      slug: "english",
      label: "English",
      labelNative: "English",
      sortOrder: 12,
    },
    {
      code: "ar",
      slug: "arabic",
      label: "Arabic",
      labelNative: "العربية",
      sortOrder: 13,
    },
    {
      code: "hi",
      slug: "hindi",
      label: "Hindi",
      labelNative: "हिन्दी",
      sortOrder: 14,
    },
    {
      code: "bn",
      slug: "bengali",
      label: "Bengali",
      labelNative: "বাংলা",
      sortOrder: 15,
    },
    {
      code: "gu",
      slug: "gujarati",
      label: "Gujarati",
      labelNative: "ગુજરાતી",
      sortOrder: 16,
    },
    {
      code: "fa",
      slug: "farsi",
      label: "Farsi / Persian",
      labelNative: "فارسی",
      sortOrder: 17,
    },
    {
      code: "tr",
      slug: "turkish",
      label: "Turkish",
      labelNative: "Türkçe",
      sortOrder: 18,
    },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  // ============================================================================
  // COUNTRIES (Major ones for now)
  // ============================================================================
  console.log("🌍 Seeding Countries...");

  const countries = [
    {
      code: "PK",
      name: "Pakistan",
      nameNative: "پاکستان",
      phoneCode: "+92",
      currency: "PKR",
      sortOrder: 1,
    },
    {
      code: "IN",
      name: "India",
      nameNative: "भारत",
      phoneCode: "+91",
      currency: "INR",
      sortOrder: 2,
    },
    {
      code: "BD",
      name: "Bangladesh",
      nameNative: "বাংলাদেশ",
      phoneCode: "+880",
      currency: "BDT",
      sortOrder: 3,
    },
    {
      code: "GB",
      name: "United Kingdom",
      phoneCode: "+44",
      currency: "GBP",
      sortOrder: 4,
    },
    {
      code: "US",
      name: "United States",
      phoneCode: "+1",
      currency: "USD",
      sortOrder: 5,
    },
    {
      code: "CA",
      name: "Canada",
      phoneCode: "+1",
      currency: "CAD",
      sortOrder: 6,
    },
    {
      code: "AE",
      name: "United Arab Emirates",
      nameNative: "الإمارات",
      phoneCode: "+971",
      currency: "AED",
      sortOrder: 7,
    },
    {
      code: "SA",
      name: "Saudi Arabia",
      nameNative: "السعودية",
      phoneCode: "+966",
      currency: "SAR",
      sortOrder: 8,
    },
    {
      code: "QA",
      name: "Qatar",
      nameNative: "قطر",
      phoneCode: "+974",
      currency: "QAR",
      sortOrder: 9,
    },
    {
      code: "KW",
      name: "Kuwait",
      nameNative: "الكويت",
      phoneCode: "+965",
      currency: "KWD",
      sortOrder: 10,
    },
    {
      code: "BH",
      name: "Bahrain",
      nameNative: "البحرين",
      phoneCode: "+973",
      currency: "BHD",
      sortOrder: 11,
    },
    {
      code: "OM",
      name: "Oman",
      nameNative: "عمان",
      phoneCode: "+968",
      currency: "OMR",
      sortOrder: 12,
    },
    {
      code: "DE",
      name: "Germany",
      phoneCode: "+49",
      currency: "EUR",
      sortOrder: 13,
    },
    {
      code: "FR",
      name: "France",
      phoneCode: "+33",
      currency: "EUR",
      sortOrder: 14,
    },
    {
      code: "AU",
      name: "Australia",
      phoneCode: "+61",
      currency: "AUD",
      sortOrder: 15,
    },
    {
      code: "MY",
      name: "Malaysia",
      phoneCode: "+60",
      currency: "MYR",
      sortOrder: 16,
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }

  // ============================================================================
  // PAKISTANI STATES/PROVINCES & MAJOR CITIES
  // ============================================================================
  console.log("🏙️ Seeding Pakistani Provinces & Cities...");

  const pakistan = await prisma.country.findUnique({ where: { code: "PK" } });

  if (pakistan) {
    const pakistanProvinces = [
      {
        name: "Punjab",
        nameNative: "پنجاب",
        cities: [
          "Lahore",
          "Faisalabad",
          "Rawalpindi",
          "Multan",
          "Gujranwala",
          "Sialkot",
          "Bahawalpur",
          "Sargodha",
          "Sheikhupura",
          "Gujrat",
        ],
      },
      {
        name: "Sindh",
        nameNative: "سندھ",
        cities: [
          "Karachi",
          "Hyderabad",
          "Sukkur",
          "Larkana",
          "Nawabshah",
          "Mirpurkhas",
          "Thatta",
          "Jacobabad",
        ],
      },
      {
        name: "Khyber Pakhtunkhwa",
        nameNative: "خیبر پختونخوا",
        cities: [
          "Peshawar",
          "Mardan",
          "Abbottabad",
          "Swat",
          "Kohat",
          "Dera Ismail Khan",
          "Bannu",
          "Nowshera",
        ],
      },
      {
        name: "Balochistan",
        nameNative: "بلوچستان",
        cities: [
          "Quetta",
          "Gwadar",
          "Turbat",
          "Khuzdar",
          "Chaman",
          "Hub",
          "Sibi",
          "Zhob",
        ],
      },
      {
        name: "Islamabad Capital Territory",
        nameNative: "وفاقی دارالحکومت",
        cities: ["Islamabad"],
      },
      {
        name: "Azad Kashmir",
        nameNative: "آزاد کشمیر",
        cities: ["Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bhimber"],
      },
      {
        name: "Gilgit-Baltistan",
        nameNative: "گلگت بلتستان",
        cities: ["Gilgit", "Skardu", "Hunza", "Chilas", "Khaplu"],
      },
    ];

    for (let i = 0; i < pakistanProvinces.length; i++) {
      const provinceData = pakistanProvinces[i];

      const province = await prisma.stateProvince.upsert({
        where: {
          countryId_name: { countryId: pakistan.id, name: provinceData.name },
        },
        update: {},
        create: {
          countryId: pakistan.id,
          name: provinceData.name,
          nameNative: provinceData.nameNative,
          sortOrder: i + 1,
        },
      });

      for (let j = 0; j < provinceData.cities.length; j++) {
        await prisma.city.upsert({
          where: {
            stateProvinceId_name: {
              stateProvinceId: province.id,
              name: provinceData.cities[j],
            },
          },
          update: {},
          create: {
            stateProvinceId: province.id,
            name: provinceData.cities[j],
            sortOrder: j + 1,
            isPopular: j < 3, // First 3 cities are popular
          },
        });
      }
    }
  }

  // ============================================================================
  // INCOME RANGES (Pakistani)
  // ============================================================================
  console.log("💰 Seeding Income Ranges...");

  const pakistaniIncomeRanges = [
    {
      slug: "no_income",
      label: "No Income",
      minValue: 0,
      maxValue: 0,
      sortOrder: 1,
    },
    {
      slug: "less_than_75k",
      label: "Less than 75,000 PKR",
      minValue: 1,
      maxValue: 74999,
      sortOrder: 2,
    },
    {
      slug: "75k_125k",
      label: "75,000 - 125,000 PKR",
      minValue: 75000,
      maxValue: 125000,
      sortOrder: 3,
    },
    {
      slug: "125k_200k",
      label: "125,000 - 200,000 PKR",
      minValue: 125001,
      maxValue: 200000,
      sortOrder: 4,
    },
    {
      slug: "200k_350k",
      label: "200,000 - 350,000 PKR",
      minValue: 200001,
      maxValue: 350000,
      sortOrder: 5,
    },
    {
      slug: "350k_500k",
      label: "350,000 - 500,000 PKR",
      minValue: 350001,
      maxValue: 500000,
      sortOrder: 6,
    },
    {
      slug: "more_than_500k",
      label: "More than 500,000 PKR",
      minValue: 500001,
      maxValue: null,
      sortOrder: 7,
    },
  ];

  for (const income of pakistaniIncomeRanges) {
    await prisma.incomeRange.upsert({
      where: {
        originId_slug: { originId: pakistaniOrigin.id, slug: income.slug },
      },
      update: {},
      create: {
        originId: pakistaniOrigin.id,
        slug: income.slug,
        label: income.label,
        currency: "PKR",
        period: "MONTHLY",
        minValue: income.minValue,
        maxValue: income.maxValue,
        sortOrder: income.sortOrder,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
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
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
