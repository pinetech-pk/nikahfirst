import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/profile/[id] - Get a specific profile
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.profile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        city: { select: { name: true } },
        stateProvince: { select: { name: true } },
        countryLivingIn: { select: { name: true } },
        countryOfOrigin: { select: { name: true } },
        ethnicity: { select: { name: true } },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
