import { NextResponse } from "next/server";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus, SubscriptionTier } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BCRYPT } from "@/config/constants";
import { deleteFromCloudinary } from "@/lib/cloudinary";

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
        subscription: true,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role as UserRole,
      status: body.status as UserStatus,
    };

    // Handle subscription plan change - this is the key part
    // Accept either subscriptionPlanId or subscription (slug) for backwards compatibility
    const subscriptionSlug = body.subscriptionPlanId || body.subscription;

    if (subscriptionSlug) {
      // Fetch the subscription plan by slug
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: subscriptionSlug },
      });

      if (!plan) {
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 }
        );
      }

      // Update subscriptionPlanId and sync all tier snapshot fields
      updateData.subscriptionPlanId = plan.id;
      updateData.subscription = subscriptionSlug as SubscriptionTier; // Keep deprecated field in sync
      updateData.tierFreeCredits = plan.freeCredits;
      updateData.tierWalletLimit = plan.walletLimit;
      updateData.tierRedeemCredits = plan.redeemCredits;
      updateData.tierRedeemCycleDays = plan.redeemCycleDays;
      updateData.tierProfileLimit = plan.profileLimit;
      updateData.tierPriceMonthly = plan.priceMonthly;
      updateData.tierPriceYearly = plan.priceYearly;
      updateData.subscribedAt = new Date(); // Mark when subscription changed
    }

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

    // Update user and wallet in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update the user
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          subscription: true,
          subscriptionPlanId: true,
          tierFreeCredits: true,
          tierWalletLimit: true,
          tierRedeemCredits: true,
          tierRedeemCycleDays: true,
          tierProfileLimit: true,
          emailVerified: true,
          phoneVerified: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      // If subscription changed, also update the RedeemWallet
      if (subscriptionSlug) {
        const plan = await tx.subscriptionPlan.findUnique({
          where: { slug: subscriptionSlug },
        });

        if (plan) {
          // Calculate next redemption date
          const nextRedemption = new Date();
          nextRedemption.setDate(nextRedemption.getDate() + plan.redeemCycleDays);

          await tx.redeemWallet.upsert({
            where: { userId: id },
            update: {
              limit: plan.walletLimit,
              redeemCredits: plan.redeemCredits,
              redeemCycleDays: plan.redeemCycleDays,
              // Add free credits from new plan (don't reset balance, add to it)
              balance: {
                increment: plan.freeCredits,
              },
              nextRedemption: nextRedemption,
            },
            create: {
              userId: id,
              balance: plan.freeCredits,
              limit: plan.walletLimit,
              redeemCredits: plan.redeemCredits,
              redeemCycleDays: plan.redeemCycleDays,
              lastRedeemed: new Date(),
              nextRedemption: nextRedemption,
            },
          });
        }
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      message: body.newPassword
        ? "User updated successfully (password changed)"
        : subscriptionSlug
        ? "User updated successfully (subscription plan and benefits updated)"
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
 * Delete a user and all associated data including Cloudinary images
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

    // Check if user exists and fetch all related data for cleanup
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profiles: {
          select: {
            id: true,
            photos: {
              select: {
                id: true,
                publicId: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Step 1: Delete all photos from Cloudinary
    const cloudinaryDeletions: Promise<boolean>[] = [];
    let totalPhotos = 0;

    for (const profile of user.profiles) {
      for (const photo of profile.photos) {
        if (photo.publicId) {
          totalPhotos++;
          cloudinaryDeletions.push(deleteFromCloudinary(photo.publicId));
        }
      }
    }

    // Wait for all Cloudinary deletions to complete
    if (cloudinaryDeletions.length > 0) {
      const results = await Promise.allSettled(cloudinaryDeletions);
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        console.warn(`Failed to delete ${failed} of ${totalPhotos} photos from Cloudinary`);
      }
    }

    // Step 2: Delete user from database (cascade will handle related records)
    // The Prisma schema has onDelete: Cascade for most relations
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully`,
      deletedPhotos: totalPhotos,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
