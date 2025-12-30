import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModerationStatus, Gender } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const allowedRoles = ["CONTENT_EDITOR", "SUPERVISOR", "SUPER_ADMIN"];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as ModerationStatus | null;
    const sort = searchParams.get("sort") || "oldest"; // oldest, newest, completeness
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // New filter parameters
    const search = searchParams.get("search");
    const gender = searchParams.get("gender") as Gender | null;
    const verified = searchParams.get("verified"); // "true" for verified profiles

    // Build where clause
    const where: Record<string, unknown> = {};

    // Status filter (skip if "all")
    if (status && status !== "all") {
      where.moderationStatus = status;
    }

    // Gender filter
    if (gender) {
      where.gender = gender;
    }

    // Verified profiles filter (verification.isVerified = true)
    if (verified === "true") {
      where.verification = {
        isVerified: true,
      };
    }

    // Search filter (user name, email, or city)
    if (search && search.trim()) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { city: { name: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: "asc" }; // oldest first by default
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "completeness") {
      orderBy = { profileCompletion: "desc" };
    }

    // Fetch profiles with relations
    const [profiles, totalCount] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              subscription: true,
              createdAt: true,
            },
          },
          photos: {
            select: {
              id: true,
              thumbnailUrl: true,
              status: true,
              isPrimary: true,
            },
            orderBy: { sortOrder: "asc" },
          },
          countryOfOrigin: {
            select: { id: true, name: true },
          },
          countryLivingIn: {
            select: { id: true, name: true },
          },
          stateProvince: {
            select: { id: true, name: true },
          },
          city: {
            select: { id: true, name: true },
          },
          origin: {
            select: { id: true, label: true },
          },
          ethnicity: {
            select: { id: true, label: true },
          },
          caste: {
            select: { id: true, label: true },
          },
          sect: {
            select: { id: true, label: true },
          },
          educationLevel: {
            select: { id: true, label: true },
          },
          educationField: {
            select: { id: true, label: true },
          },
          incomeRange: {
            select: { id: true, label: true },
          },
          motherTongue: {
            select: { id: true, label: true },
          },
          height: {
            select: { id: true, labelImperial: true, centimeters: true },
          },
          verification: {
            select: {
              isVerified: true,
              verificationLevel: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    // Get counts by status for stats
    const [pendingCount, approvedCount, rejectedCount, bannedCount, verifiedCount, totalCount] =
      await Promise.all([
        prisma.profile.count({ where: { moderationStatus: "PENDING" } }),
        prisma.profile.count({ where: { moderationStatus: "APPROVED" } }),
        prisma.profile.count({ where: { moderationStatus: "REJECTED" } }),
        prisma.profile.count({ where: { moderationStatus: "BANNED" } }),
        prisma.profile.count({ where: { verification: { isVerified: true } } }),
        prisma.profile.count(),
      ]);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingTodayCount, approvedTodayCount, rejectedTodayCount] =
      await Promise.all([
        prisma.profile.count({
          where: {
            moderationStatus: "PENDING",
            createdAt: { gte: today },
          },
        }),
        prisma.profile.count({
          where: {
            moderationStatus: "APPROVED",
            moderatedAt: { gte: today },
          },
        }),
        prisma.profile.count({
          where: {
            moderationStatus: "REJECTED",
            moderatedAt: { gte: today },
          },
        }),
      ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      counts: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        banned: bannedCount,
        verified: verifiedCount,
      },
      todayStats: {
        pending: pendingTodayCount,
        approved: approvedTodayCount,
        rejected: rejectedTodayCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
