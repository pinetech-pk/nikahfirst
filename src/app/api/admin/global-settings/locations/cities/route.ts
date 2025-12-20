import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/global-settings/locations/cities?stateId=xxx
 * Fetch cities for a state
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stateId = searchParams.get("stateId");

    if (!stateId) {
      return NextResponse.json(
        { error: "stateId is required" },
        { status: 400 }
      );
    }

    const cities = await prisma.city.findMany({
      where: { stateProvinceId: stateId },
      orderBy: { sortOrder: "asc" },
      include: {
        stateProvince: {
          select: {
            name: true,
            country: { select: { name: true, code: true } },
          },
        },
        _count: { select: { profiles: true } },
      },
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/global-settings/locations/cities
 * Create a new city
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { stateProvinceId, name, nameNative, sortOrder, isPopular, isActive } = body;

    // Validate required fields
    if (!stateProvinceId || !name) {
      return NextResponse.json(
        { error: "State ID and name are required" },
        { status: 400 }
      );
    }

    // Check if state exists
    const state = await prisma.stateProvince.findUnique({
      where: { id: stateProvinceId },
    });

    if (!state) {
      return NextResponse.json(
        { error: "State not found" },
        { status: 404 }
      );
    }

    // Check if city with same name exists in this state
    const existing = await prisma.city.findUnique({
      where: {
        stateProvinceId_name: { stateProvinceId, name },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A city with this name already exists in this state" },
        { status: 400 }
      );
    }

    const city = await prisma.city.create({
      data: {
        stateProvinceId,
        name,
        nameNative: nameNative || null,
        sortOrder: sortOrder || 0,
        isPopular: isPopular ?? false,
        isActive: isActive ?? true,
      },
      include: {
        stateProvince: {
          select: {
            name: true,
            country: { select: { name: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json({ city }, { status: 201 });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}
