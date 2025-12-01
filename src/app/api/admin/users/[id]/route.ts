import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT } from "@/config/constants";

/**
 * GET /api/admin/users/[id]
 * Fetch a specific admin user's data
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and permissions
    await requireSupervisor();

    const { id } = await params;

    // Fetch user data
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
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update a specific admin user's data
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and permissions
    await requireSupervisor();

    const { id } = await params;
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.role || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (body.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Validate role
    const validRoles: UserRole[] = [
      "SUPER_ADMIN",
      "SUPERVISOR",
      "CONTENT_EDITOR",
      "SUPPORT_AGENT",
      "CONSULTANT",
      "USER",
    ];

    if (!validRoles.includes(body.role as UserRole)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: {
      name: string;
      email: string;
      phone: string | null;
      role: UserRole;
      status: string;
      password?: string;
      emailVerified?: boolean;
      phoneVerified?: boolean;
      isVerified?: boolean;
    } = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role as UserRole,
      status: body.status,
    };

    // Handle password reset (Super Admin can reset without old password)
    if (body.newPassword && body.newPassword.trim() !== "") {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(body.newPassword, BCRYPT.SALT_ROUNDS);
    }

    // Handle verification status updates
    if (typeof body.emailVerified === "boolean") {
      updateData.emailVerified = body.emailVerified;
    }
    if (typeof body.phoneVerified === "boolean") {
      updateData.phoneVerified = body.phoneVerified;
    }
    if (typeof body.isVerified === "boolean") {
      updateData.isVerified = body.isVerified;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: body.newPassword
        ? "User updated successfully (password changed)"
        : "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a specific admin user
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and permissions
    const session = await requireSupervisor();

    const { id } = await params;

    // Prevent self-deletion
    if (session.user?.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete related records first (Prisma doesn't have cascade delete configured)
    await prisma.$transaction([
      // Delete profiles
      prisma.profile.deleteMany({
        where: { userId: id },
      }),
      // Delete transactions
      prisma.transaction.deleteMany({
        where: { userId: id },
      }),
      // Delete wallets (one-to-one relationships)
      prisma.redeemWallet.deleteMany({
        where: { userId: id },
      }),
      prisma.fundingWallet.deleteMany({
        where: { userId: id },
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
