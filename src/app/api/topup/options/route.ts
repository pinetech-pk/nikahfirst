import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/topup/options
 * Get available packages and payment methods for top-up
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active packages and payment methods in parallel
    const [packages, paymentMethods] = await Promise.all([
      prisma.creditPackage.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          credits: true,
          price: true,
          bonusCredits: true,
          savingsPercent: true,
          isPopular: true,
        },
      }),
      prisma.paymentSetting.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          method: true,
          label: true,
          instructions: true,
          accountTitle: true,
          accountNumber: true,
          bankName: true,
          iban: true,
          mobileNumber: true,
        },
      }),
    ]);

    return NextResponse.json({
      packages,
      paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching top-up options:", error);
    return NextResponse.json(
      { error: "Failed to fetch top-up options" },
      { status: 500 }
    );
  }
}
