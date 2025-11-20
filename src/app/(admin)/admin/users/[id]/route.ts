import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSupervisor, canChangeRoleTo } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Fetch admin user details
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    // Check permissions
    if (!session || !isSupervisor(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow viewing admin users
    if (user.role === "USER") {
      return NextResponse.json(
        { error: "Cannot view regular users from this endpoint" },
        { status: 403 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH - Update admin user
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    // Check permissions
    if (!session || !isSupervisor(userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, status } = body;

    // Fetch current user data
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate role change permission
    if (role && role !== currentUser.role) {
      if (!canChangeRoleTo(userRole, role as UserRole)) {
        return NextResponse.json(
          { error: `You don't have permission to assign the ${role} role` },
          { status: 403 }
        );
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email address is already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        status: status || undefined,
        // If email changed, mark as unverified
        ...(email && email !== currentUser.email && { emailVerified: false }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin user updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
