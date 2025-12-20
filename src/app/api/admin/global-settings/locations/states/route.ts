import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/states?countryId=xxx
 * Fetch states for a country
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return NextResponse.json(
        { error: "countryId is required" },
        { status: 400 }
      );
    }

    const states = await prisma.stateProvince.findMany({
      where: { countryId },
      orderBy: { sortOrder: "asc" },
      include: {
        country: { select: { name: true, code: true } },
        _count: { select: { cities: true } },
      },
    });

    return NextResponse.json({ states });
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/locations/states
 * Create a new state/province
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { countryId, code, name, nameNative, sortOrder, isActive } = body;

    // Validate required fields
    if (!countryId || !name) {
      return NextResponse.json(
        { error: "Country ID and name are required" },
        { status: 400 }
      );
    }

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return NextResponse.json(
        { error: "Country not found" },
        { status: 404 }
      );
    }

    // Check if state with same name exists in this country
    const existing = await prisma.stateProvince.findUnique({
      where: {
        countryId_name: { countryId, name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A state with this name already exists in this country" },
        { status: 400 }
      );
    }

    const state = await prisma.stateProvince.create({
      data: {
        countryId,
        code: code || null,
        name,
        nameNative: nameNative || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
      },
      include: {
        country: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({ state }, { status: 201 });
  } catch (error) {
    console.error("Error creating state:", error);
    return NextResponse.json(
      { error: "Failed to create state" },
      { status: 500 }
    );
  }
}
