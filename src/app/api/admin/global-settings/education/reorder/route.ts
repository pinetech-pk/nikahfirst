import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/global-settings/education/reorder
 * Reorder education levels or fields
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, orderedIds } = body;

    if (!type || !["levels", "fields"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'levels' or 'fields'" },
        { status: 400 }
      );
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds array is required" },
        { status: 400 }
      );
    }

    if (type === "levels") {
      await prisma.$transaction(
        orderedIds.map((id: string, index: number) =>
          prisma.educationLevel.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
    } else {
      await prisma.$transaction(
        orderedIds.map((id: string, index: number) =>
          prisma.educationField.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering education data:", error);
    return NextResponse.json(
      { error: "Failed to reorder education data" },
      { status: 500 }
    );
  }
}
