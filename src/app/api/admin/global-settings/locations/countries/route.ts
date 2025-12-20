import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/countries
 * Fetch all countries with state/city counts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const countries = await prisma.country.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { statesProvinces: true },
        },
      },
    });

    // Get city counts for each country
    const countriesWithCounts = await Promise.all(
      countries.map(async (country) => {
        const cityCount = await prisma.city.count({
          where: {
            stateProvince: {
              countryId: country.id,
            },
          },
        });
        return {
          ...country,
          stateCount: country._count.statesProvinces,
          cityCount,
        };
      })
    );

    return NextResponse.json({ countries: countriesWithCounts });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/locations/countries
 * Create a new country
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, name, nameNative, phoneCode, currency, sortOrder, isActive } = body;

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { error: "Country code and name are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A country with this code already exists" },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        code: code.toUpperCase(),
        name,
        nameNative: nameNative || null,
        phoneCode: phoneCode || null,
        currency: currency || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ country }, { status: 201 });
  } catch (error) {
    console.error("Error creating country:", error);
    return NextResponse.json(
      { error: "Failed to create country" },
      { status: 500 }
    );
  }
}
