import { prisma } from "@/lib/prisma";
import { resend, emailConfig } from "@/lib/resend";
import { AdminNotificationType, NotificationPriority, UserRole } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface PhoneUpdateNotificationData {
  userId: string;
  userName: string | null;
  userEmail: string;
  oldPhone: string | null;
  newPhone: string | null;
}

interface CreateAdminNotificationParams {
  type: AdminNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority?: NotificationPriority;
  targetRoles?: UserRole[];
  actionUrl?: string;
}

// ============================================================================
// EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Send email notification when user updates their phone number
 */
export async function sendPhoneUpdateEmail(data: PhoneUpdateNotificationData) {
  try {
    const { userId, userName, userEmail, oldPhone, newPhone } = data;

    const subject = `[NikahFirst] Phone Number Updated - ${userName || "User"}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .action-required { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Phone Number Updated</h1>
            </div>
            <div class="content">
              <p>A user has updated their phone number on NikahFirst:</p>

              <div class="info-row">
                <span class="label">User:</span>
                <span class="value">${userName || "Not provided"}</span>
              </div>

              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${userEmail}</span>
              </div>

              <div class="info-row">
                <span class="label">Previous Phone:</span>
                <span class="value">${oldPhone || "Not set"}</span>
              </div>

              <div class="info-row">
                <span class="label">New Phone:</span>
                <span class="value">${newPhone || "Removed"}</span>
              </div>

              <div class="info-row">
                <span class="label">Updated At:</span>
                <span class="value">${new Date().toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Karachi"
                })} PKT</span>
              </div>

              <div class="action-required">
                <strong>Action Required:</strong> This phone number requires manual verification.
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nikahfirst.com"}/admin/users/regular?search=${encodeURIComponent(userEmail)}" class="button">
                View User in Admin Panel
              </a>
            </div>
            <div class="footer">
              <p>This is an automated notification from NikahFirst.</p>
              <p>User ID: ${userId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.supportEmail,
      subject,
      html: htmlContent,
    });

    console.log(`Phone update email sent for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send phone update email:", error);
    return { success: false, error };
  }
}

// ============================================================================
// IN-APP ADMIN NOTIFICATIONS
// ============================================================================

/**
 * Create an in-app notification for admins
 */
export async function createAdminNotification(params: CreateAdminNotificationParams) {
  try {
    const notification = await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data,
        priority: params.priority || "NORMAL",
        targetRoles: params.targetRoles || [],
        actionUrl: params.actionUrl,
      },
    });

    console.log(`Admin notification created: ${notification.id}`);
    return { success: true, notification };
  } catch (error) {
    console.error("Failed to create admin notification:", error);
    return { success: false, error };
  }
}

/**
 * Create notification for phone number update
 */
export async function notifyPhoneUpdate(data: PhoneUpdateNotificationData) {
  const { userId, userName, userEmail, oldPhone, newPhone } = data;

  // Send email notification
  await sendPhoneUpdateEmail(data);

  // Create in-app notification
  await createAdminNotification({
    type: "PHONE_UPDATE",
    title: "Phone Number Updated",
    message: `${userName || "A user"} (${userEmail}) has updated their phone number from ${oldPhone || "not set"} to ${newPhone || "removed"}.`,
    data: {
      userId,
      userName,
      userEmail,
      oldPhone,
      newPhone,
      updatedAt: new Date().toISOString(),
    },
    priority: "NORMAL",
    targetRoles: ["SUPER_ADMIN", "SUPERVISOR", "SUPPORT_AGENT"],
    actionUrl: `/admin/users/regular?search=${encodeURIComponent(userEmail)}`,
  });

  return { success: true };
}

/**
 * Create notification for phone verification request
 */
export async function notifyPhoneVerificationRequest(data: {
  userId: string;
  userName: string | null;
  userEmail: string;
  phone: string;
  otp: string;
}) {
  const { userId, userName, userEmail, phone, otp } = data;

  // Send email notification with OTP
  try {
    const subject = `[NikahFirst] Phone Verification Request - ${userName || "User"}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .otp-box { background: #10b981; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; }
            .action-required { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Phone Verification Request</h1>
            </div>
            <div class="content">
              <p>A user has requested phone verification:</p>

              <div class="info-row">
                <span class="label">User:</span>
                <span class="value">${userName || "Not provided"}</span>
              </div>

              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${userEmail}</span>
              </div>

              <div class="info-row">
                <span class="label">Phone to Verify:</span>
                <span class="value">${phone}</span>
              </div>

              <p><strong>Verification Code to Share:</strong></p>
              <div class="otp-box">${otp}</div>

              <div class="action-required">
                <strong>Action Required:</strong> Contact the user at ${phone} and share this verification code, or verify the number directly through the admin panel.
              </div>

              <p><em>This code expires in 24 hours.</em></p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nikahfirst.com"}/admin/verifications/phone" class="button">
                View Phone Verifications
              </a>
            </div>
            <div class="footer">
              <p>This is an automated notification from NikahFirst.</p>
              <p>User ID: ${userId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.supportEmail,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send verification request email:", error);
  }

  // Create in-app notification
  await createAdminNotification({
    type: "PHONE_VERIFY_REQUEST",
    title: "Phone Verification Request",
    message: `${userName || "A user"} (${userEmail}) has requested verification for phone: ${phone}`,
    data: {
      userId,
      userName,
      userEmail,
      phone,
      otp, // Include OTP in notification data for admins
      requestedAt: new Date().toISOString(),
    },
    priority: "HIGH",
    targetRoles: ["SUPER_ADMIN", "SUPERVISOR", "SUPPORT_AGENT"],
    actionUrl: `/admin/verifications/phone`,
  });

  return { success: true };
}

/**
 * Get unread notification count for an admin
 */
export async function getUnreadNotificationCount(adminRole: UserRole) {
  try {
    const count = await prisma.adminNotification.count({
      where: {
        isRead: false,
        OR: [
          { targetRoles: { isEmpty: true } }, // No specific target = all admins
          { targetRoles: { has: adminRole } }, // Targeted to this role
        ],
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to get notification count:", error);
    return 0;
  }
}

/**
 * Get recent notifications for an admin
 */
export async function getRecentNotifications(adminRole: UserRole, limit = 10) {
  try {
    const notifications = await prisma.adminNotification.findMany({
      where: {
        OR: [
          { targetRoles: { isEmpty: true } },
          { targetRoles: { has: adminRole } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, adminId: string) {
  try {
    await prisma.adminNotification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readById: adminId,
        readAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read for an admin
 */
export async function markAllNotificationsAsRead(adminId: string, adminRole: UserRole) {
  try {
    await prisma.adminNotification.updateMany({
      where: {
        isRead: false,
        OR: [
          { targetRoles: { isEmpty: true } },
          { targetRoles: { has: adminRole } },
        ],
      },
      data: {
        isRead: true,
        readById: adminId,
        readAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error };
  }
}
