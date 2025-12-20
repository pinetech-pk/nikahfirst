import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend, emailConfig } from "@/lib/resend";

const ADMIN_ROLES = ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR", "SUPPORT_AGENT"];

// GET: Fetch verification data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.role || !ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "pending"; // pending, unverified, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    if (tab === "pending") {
      // Fetch pending phone verification requests
      const whereClause = {
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [requests, total] = await Promise.all([
        prisma.phoneVerification.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                phoneVerified: true,
                createdAt: true,
              },
            },
          },
          orderBy: { requestedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.phoneVerification.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else if (tab === "unverified") {
      // Fetch users with unverified phone numbers (have phone but not verified)
      const whereClause = {
        phone: { not: null },
        phoneVerified: false,
        role: "USER" as const, // Only regular users
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneVerified: true,
            createdAt: true,
            lastLoginAt: true,
            phoneVerifications: {
              where: {
                verified: false,
                expiresAt: { gt: new Date() },
              },
              orderBy: { requestedAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      // All users with phone verification status
      const whereClause = {
        phone: { not: null },
        role: "USER" as const,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            phoneVerified: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching verification data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Admin verify a user's phone number
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.role || !ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { verificationId, userId, action } = body;

    if (action === "verify") {
      // Verify via verification request
      if (verificationId) {
        const verification = await prisma.phoneVerification.findUnique({
          where: { id: verificationId },
          include: { user: true },
        });

        if (!verification) {
          return NextResponse.json({ error: "Verification request not found" }, { status: 404 });
        }

        // Update verification record and user
        await prisma.$transaction([
          prisma.phoneVerification.update({
            where: { id: verificationId },
            data: {
              verified: true,
              verifiedAt: new Date(),
              verifiedBy: session.user.id,
            },
          }),
          prisma.user.update({
            where: { id: verification.userId },
            data: { phoneVerified: true },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: `Phone number verified for ${verification.user.name || verification.user.email}`,
        });
      }

      // Direct verify via userId
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await prisma.user.update({
          where: { id: userId },
          data: { phoneVerified: true },
        });

        return NextResponse.json({
          success: true,
          message: `Phone number verified for ${user.name || user.email}`,
        });
      }

      return NextResponse.json({ error: "verificationId or userId required" }, { status: 400 });
    }

    if (action === "reject") {
      // Reject/expire verification request
      if (!verificationId) {
        return NextResponse.json({ error: "verificationId required" }, { status: 400 });
      }

      await prisma.phoneVerification.update({
        where: { id: verificationId },
        data: {
          expiresAt: new Date(), // Expire immediately
        },
      });

      return NextResponse.json({
        success: true,
        message: "Verification request rejected",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing verification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Send reminder to unverified users
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.role || !ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userIds, action } = body;

    if (action === "send_reminder") {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json({ error: "userIds array required" }, { status: 400 });
      }

      // Fetch users to send reminders to
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
          phone: { not: null },
          phoneVerified: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      if (users.length === 0) {
        return NextResponse.json({ error: "No eligible users found" }, { status: 404 });
      }

      // Send reminder emails to each user
      const results = await Promise.allSettled(
        users.map(async (user) => {
          if (user.email) {
            await resend.emails.send({
              from: emailConfig.from,
              to: user.email,
              subject: "Please Verify Your Phone Number - NikahFirst",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1a1a1a;">Phone Verification Reminder</h2>
                  <p>Dear ${user.name || "User"},</p>
                  <p>We noticed that your phone number (<strong>${user.phone}</strong>) has not been verified yet.</p>
                  <p>To complete your verification and unlock all features of NikahFirst, please:</p>
                  <ol>
                    <li>Log in to your NikahFirst account</li>
                    <li>Go to Settings & Privacy</li>
                    <li>Click "Request Verification Code"</li>
                    <li>Our team will contact you at ${user.phone} to provide your verification code</li>
                  </ol>
                  <p>Verifying your phone number helps ensure the security and authenticity of profiles on our platform.</p>
                  <p>If you have any questions, please contact our support team.</p>
                  <p style="margin-top: 30px; color: #666;">
                    Best regards,<br>
                    The NikahFirst Team
                  </p>
                </div>
              `,
            });
          }
          return { userId: user.id, success: true };
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return NextResponse.json({
        success: true,
        message: `Reminder sent to ${successful} user(s)${failed > 0 ? `, ${failed} failed` : ""}`,
        sent: successful,
        failed,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
