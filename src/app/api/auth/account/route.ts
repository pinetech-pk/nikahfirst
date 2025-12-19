import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyPhoneUpdate } from "@/lib/notifications";

// GET - Fetch current user's account data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching account data:", error);
    return NextResponse.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    );
  }
}

// PATCH - Update account information
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if email or phone is being changed
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, phone: true },
    });

    if (email !== currentUser?.email) {
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

    // Check if phone is being changed and if it's already taken
    if (phone && phone.trim().length > 0) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          id: { not: session.user.id },
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "Phone number is already in use" },
          { status: 400 }
        );
      }
    }

    // Determine if phone has changed
    const newPhone = phone && phone.trim().length > 0 ? phone.trim() : null;
    const phoneChanged = newPhone !== currentUser?.phone;
    const emailChanged = email !== currentUser?.email;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: newPhone,
        // If email changed, mark as unverified
        ...(emailChanged && { emailVerified: false }),
        // If phone changed, mark as unverified
        ...(phoneChanged && { phoneVerified: false }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    // Send notifications if phone number changed
    if (phoneChanged) {
      // Fire and forget - don't block the response
      notifyPhoneUpdate({
        userId: session.user.id,
        userName: updatedUser.name,
        userEmail: updatedUser.email,
        oldPhone: currentUser?.phone || null,
        newPhone: newPhone,
      }).catch((err) => {
        console.error("Failed to send phone update notification:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: phoneChanged
        ? "Account updated successfully. Phone verification required."
        : "Account updated successfully",
      user: updatedUser,
      phoneChanged,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
