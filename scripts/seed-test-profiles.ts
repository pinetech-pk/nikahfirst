import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedTestProfiles() {
  try {
    console.log("🌱 Starting to seed test profiles...\n");

    const hashedPassword = await bcrypt.hash("Test123!", 12);

    // Profile 1: Young Male from Karachi (Approved)
    const user1 = await prisma.user.upsert({
      where: { email: "ahmed.khan@example.com" },
      update: {},
      create: {
        email: "ahmed.khan@example.com",
        password: hashedPassword,
        name: "Mr. Khan",
        phone: "+923001234567",
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        role: "USER",
        status: "ACTIVE",
        subscription: "FREE",
        profiles: {
          create: {
            profileFor: "SELF",
            firstName: "Ahmed",
            lastName: "Khan",
            gender: "MALE",
            dateOfBirth: new Date("1996-03-15"), // 28 years old
            bio: "Software engineer working at a multinational tech company in Karachi. I'm passionate about technology, cricket, and traveling. Looking for a life partner who values family, education, and has a positive outlook on life. I believe in maintaining a balance between modern thinking and traditional values.",
            education: "Bachelor's in Computer Science from FAST-NUCES",
            profession: "Senior Software Engineer",
            city: "Karachi",
            country: "Pakistan",
            height: "5'10\"",
            maritalStatus: "NEVER_MARRIED",
            religion: "Islam",
            sect: "Sunni",
            caste: "Pathan",
            motherTongue: "Urdu",
            minAge: 22,
            maxAge: 28,
            preferredCities: "Karachi, Lahore, Islamabad",
            isActive: true,
            isPublished: true, // APPROVED
            visibility: "VISIBLE",
            isVerified: true,
            verificationLevel: 2,
            profileViews: 45,
            lastActiveAt: new Date(),
          },
        },
        redeemWallet: {
          create: {
            balance: 3,
            frozenBalance: 0,
            limit: 5,
            lastRedeemed: new Date(),
            nextRedemption: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            creditsWasted: 0,
          },
        },
        fundingWallet: {
          create: {
            balance: 0,
            frozenBalance: 0,
            totalPurchased: 0,
            totalSpent: 0,
          },
        },
      },
    });

    // Profile 2: Young Female from Lahore (Approved) - Created by Mother
    const user2 = await prisma.user.upsert({
      where: { email: "mrs.malik@example.com" },
      update: {},
      create: {
        email: "mrs.malik@example.com",
        password: hashedPassword,
        name: "Mrs. Malik",
        phone: "+923211234567",
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        role: "USER",
        status: "ACTIVE",
        subscription: "SILVER",
        subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        profiles: {
          create: {
            profileFor: "DAUGHTER",
            firstName: "Ayesha",
            lastName: "Malik",
            gender: "FEMALE",
            dateOfBirth: new Date("1998-07-22"), // 26 years old
            bio: "Ayesha is a dedicated doctor currently completing her house job at Services Hospital, Lahore. She comes from a well-educated family and has strong moral values. She enjoys reading, painting, and spending quality time with family. We are looking for a well-educated, caring partner from a respectable family who shares similar values and can support her career aspirations.",
            education: "MBBS from King Edward Medical University",
            profession: "Medical Doctor (House Officer)",
            city: "Lahore",
            country: "Pakistan",
            height: "5'5\"",
            maritalStatus: "NEVER_MARRIED",
            religion: "Islam",
            sect: "Sunni",
            caste: "Rajput",
            motherTongue: "Punjabi",
            minAge: 27,
            maxAge: 34,
            preferredCities: "Lahore, Islamabad, Faisalabad",
            isActive: true,
            isPublished: true, // APPROVED
            visibility: "VISIBLE",
            isVerified: true,
            verificationLevel: 3,
            profileViews: 120,
            lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        },
        redeemWallet: {
          create: {
            balance: 10,
            frozenBalance: 0,
            limit: 15,
            lastRedeemed: new Date(),
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            creditsWasted: 2,
          },
        },
        fundingWallet: {
          create: {
            balance: 25,
            frozenBalance: 0,
            totalPurchased: 50,
            totalSpent: 25,
          },
        },
      },
    });

    // Profile 3: Middle-aged Male from USA (Pending)
    const user3 = await prisma.user.upsert({
      where: { email: "tariq.hassan@example.com" },
      update: {},
      create: {
        email: "tariq.hassan@example.com",
        password: hashedPassword,
        name: "Tariq Hassan",
        phone: "+14155552345",
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        role: "USER",
        status: "ACTIVE",
        subscription: "GOLD",
        subscriptionExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        profiles: {
          create: {
            profileFor: "SELF",
            firstName: "Tariq",
            lastName: "Hassan",
            gender: "MALE",
            dateOfBirth: new Date("1988-11-10"), // 36 years old
            bio: "Pakistani-American working as a Finance Manager in Silicon Valley. Previously married, no children. Looking to start fresh with someone who understands both Eastern and Western cultures. I value honesty, family bonds, and personal growth. Willing to relocate for the right person.",
            education: "MBA from UC Berkeley, CPA certified",
            profession: "Finance Manager at Tech Company",
            city: "San Francisco",
            country: "USA",
            height: "5'11\"",
            maritalStatus: "DIVORCED",
            religion: "Islam",
            sect: "Shia",
            caste: "Syed",
            motherTongue: "Urdu",
            minAge: 28,
            maxAge: 38,
            preferredCities: "Any major city in USA or Pakistan",
            isActive: true,
            isPublished: false, // PENDING
            visibility: "VISIBLE",
            isVerified: false,
            verificationLevel: 0,
            profileViews: 0,
            lastActiveAt: new Date(),
          },
        },
        redeemWallet: {
          create: {
            balance: 20,
            frozenBalance: 0,
            limit: 30,
            lastRedeemed: new Date(),
            nextRedemption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            creditsWasted: 0,
          },
        },
        fundingWallet: {
          create: {
            balance: 100,
            frozenBalance: 0,
            totalPurchased: 100,
            totalSpent: 0,
          },
        },
      },
    });

    // Profile 4: Young Female from Saudi Arabia (Pending) - Created by Brother
    const user4 = await prisma.user.upsert({
      where: { email: "ali.sheikh@example.com" },
      update: {},
      create: {
        email: "ali.sheikh@example.com",
        password: hashedPassword,
        name: "Ali Sheikh",
        phone: "+966501234567",
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        role: "USER",
        status: "ACTIVE",
        subscription: "FREE",
        profiles: {
          create: {
            profileFor: "SISTER",
            firstName: "Fatima",
            lastName: "Sheikh",
            gender: "FEMALE",
            dateOfBirth: new Date("1999-01-05"), // 25 years old
            bio: "My sister Fatima is a talented graphic designer working remotely for an international company. Born and raised in Riyadh, she's fluent in Arabic, English, and Urdu. She's religious, prays regularly, and wears hijab by choice. Looking for a practicing Muslim who is educated, kind-hearted, and family-oriented. Open to relocating to Pakistan after marriage.",
            education:
              "Bachelor's in Graphic Design from Princess Nora University",
            profession: "Senior Graphic Designer",
            city: "Riyadh",
            country: "Saudi Arabia",
            height: "5'3\"",
            maritalStatus: "NEVER_MARRIED",
            religion: "Islam",
            sect: "Sunni",
            caste: "Sheikh",
            motherTongue: "Arabic",
            minAge: 26,
            maxAge: 32,
            preferredCities: "Riyadh, Jeddah, Karachi, Islamabad",
            isActive: true,
            isPublished: false, // PENDING
            visibility: "VISIBLE",
            isVerified: false,
            verificationLevel: 0,
            profileViews: 0,
            lastActiveAt: new Date(),
          },
        },
        redeemWallet: {
          create: {
            balance: 5,
            frozenBalance: 0,
            limit: 5,
            lastRedeemed: new Date(),
            nextRedemption: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            creditsWasted: 0,
          },
        },
        fundingWallet: {
          create: {
            balance: 0,
            frozenBalance: 0,
            totalPurchased: 0,
            totalSpent: 0,
          },
        },
      },
    });

    // Profile 5: Mature Female from Islamabad (Pending) - Widow
    const user5 = await prisma.user.upsert({
      where: { email: "sarah.ahmed@example.com" },
      update: {},
      create: {
        email: "sarah.ahmed@example.com",
        password: hashedPassword,
        name: "Sarah Ahmed",
        phone: "+923335551234",
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        role: "USER",
        status: "ACTIVE",
        subscription: "STANDARD",
        subscriptionExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        profiles: {
          create: {
            profileFor: "SELF",
            firstName: "Sarah",
            lastName: "Ahmed",
            gender: "FEMALE",
            dateOfBirth: new Date("1985-09-18"), // 39 years old
            bio: "I'm a university professor and widow with one teenage daughter. After spending three years focusing on my daughter and career, I feel ready to find a life companion. I teach English Literature at NUST and have authored two books. Looking for an educated, mature partner who can accept my daughter and understands the importance of family. Preferably someone who is also widowed or divorced and understands life's complexities.",
            education: "PhD in English Literature from Quaid-e-Azam University",
            profession: "Associate Professor at NUST",
            city: "Islamabad",
            country: "Pakistan",
            height: "5'6\"",
            maritalStatus: "WIDOWED",
            religion: "Islam",
            sect: "Sunni",
            caste: "Mughal",
            motherTongue: "Urdu",
            minAge: 38,
            maxAge: 50,
            preferredCities: "Islamabad, Rawalpindi, Lahore",
            isActive: true,
            isPublished: false, // PENDING
            visibility: "VISIBLE",
            isVerified: false,
            verificationLevel: 0,
            profileViews: 0,
            lastActiveAt: new Date(),
          },
        },
        redeemWallet: {
          create: {
            balance: 8,
            frozenBalance: 0,
            limit: 10,
            lastRedeemed: new Date(),
            nextRedemption: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            creditsWasted: 1,
          },
        },
        fundingWallet: {
          create: {
            balance: 15,
            frozenBalance: 0,
            totalPurchased: 25,
            totalSpent: 10,
          },
        },
      },
    });

    // Add photos for the approved profiles
    // await prisma.photo.createMany({
    //   data: [
    //     {
    //       profileId: user1.profiles[0].id,
    //       url: "/images/profiles/ahmed-khan-1.jpg",
    //       isMain: true,
    //       isPublic: true,
    //       isVerified: true,
    //       order: 0,
    //     },
    //     {
    //       profileId: user2.profiles[0].id,
    //       url: "/images/profiles/ayesha-malik-1.jpg",
    //       isMain: true,
    //       isPublic: false, // Private photo
    //       isVerified: true,
    //       order: 0,
    //     },
    //   ],
    // });

    console.log("✅ Test profiles created successfully!\n");
    console.log("📋 Profile Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✅ APPROVED PROFILES (2):");
    console.log("1. Ahmed Khan - 28y Male, Karachi, Software Engineer");
    console.log("   Email: ahmed.khan@example.com");
    console.log("2. Ayesha Malik - 26y Female, Lahore, Doctor (by Mother)");
    console.log("   Email: mrs.malik@example.com");

    console.log("\n⏳ PENDING PROFILES (3):");
    console.log("3. Tariq Hassan - 36y Male, USA, Finance Manager (Divorced)");
    console.log("   Email: tariq.hassan@example.com");
    console.log(
      "4. Fatima Sheikh - 25y Female, Saudi Arabia, Designer (by Brother)"
    );
    console.log("   Email: ali.sheikh@example.com");
    console.log("5. Sarah Ahmed - 39y Female, Islamabad, Professor (Widowed)");
    console.log("   Email: sarah.ahmed@example.com");

    console.log("\n🔑 All passwords: Test123!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get statistics
    const totalUsers = await prisma.user.count();
    const totalProfiles = await prisma.profile.count();
    const approvedProfiles = await prisma.profile.count({
      where: { isPublished: true },
    });
    const pendingProfiles = await prisma.profile.count({
      where: { isPublished: false },
    });

    console.log("📊 Database Statistics:");
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Profiles: ${totalProfiles}`);
    console.log(`Approved Profiles: ${approvedProfiles}`);
    console.log(`Pending Profiles: ${pendingProfiles}`);
  } catch (error) {
    console.error("❌ Error seeding profiles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestProfiles();
