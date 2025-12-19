import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

// GET - Fetch notifications for admin
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    if (!isAdmin(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build where clause
    const whereClause = {
      OR: [
        { targetRoles: { isEmpty: true } }, // No specific target = all admins
        { targetRoles: { has: userRole } }, // Targeted to this role
      ],
      ...(unreadOnly && { isRead: false }),
    };

    // Get notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          readBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.adminNotification.count({ where: whereClause }),
      prisma.adminNotification.count({
        where: {
          isRead: false,
          OR: [
            { targetRoles: { isEmpty: true } },
            { targetRoles: { has: userRole } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT - Mark notification(s) as read
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    if (!isAdmin(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      // Mark all notifications as read for this admin
      await prisma.adminNotification.updateMany({
        where: {
          isRead: false,
          OR: [
            { targetRoles: { isEmpty: true } },
            { targetRoles: { has: userRole } },
          ],
        },
        data: {
          isRead: true,
          readById: session.user.id,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 }
      );
    }

    // Mark single notification as read
    await prisma.adminNotification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readById: session.user.id,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete old notifications (cleanup)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;

    // Only Super Admin can delete notifications
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const olderThanDays = parseInt(searchParams.get("olderThanDays") || "30");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deleted = await prisma.adminNotification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true, // Only delete read notifications
      },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} old notifications`,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
