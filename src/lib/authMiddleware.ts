import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  isAdmin,
  isModerator,
  isSupervisor,
  isSuperAdmin,
  hasPermission,
} from "@/lib/permissions";

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 * @returns The authenticated session
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Require admin role (any admin level)
 * Redirects to dashboard if not an admin
 * @returns The authenticated session with admin role
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const userRole = session?.user?.role as UserRole | undefined;

  if (!isAdmin(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Require moderator role or higher (Content Editor, Consultant, Supervisor, Super Admin)
 * Redirects to dashboard if not a moderator
 * @returns The authenticated session with moderator role
 */
export async function requireModerator() {
  const session = await requireAuth();
  const userRole = session?.user?.role as UserRole | undefined;

  if (!isModerator(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Require supervisor role or higher (Supervisor, Super Admin)
 * Redirects to dashboard if not a supervisor
 * @returns The authenticated session with supervisor role
 */
export async function requireSupervisor() {
  const session = await requireAuth();
  const userRole = session?.user?.role as UserRole | undefined;

  if (!isSupervisor(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Require super admin role
 * Redirects to dashboard if not a super admin
 * @returns The authenticated session with super admin role
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  const userRole = session?.user?.role as UserRole | undefined;

  if (!isSuperAdmin(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Require specific permission
 * Redirects to dashboard if permission is not granted
 * @param permission - The permission to check
 * @returns The authenticated session
 */
export async function requirePermission(
  permission: Parameters<typeof hasPermission>[1]
) {
  const session = await requireAuth();
  const userRole = session?.user?.role as UserRole | undefined;

  if (!hasPermission(userRole, permission)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Check authentication without redirecting
 * Useful for optional authentication checks
 * @returns The session if authenticated, null otherwise
 */
export async function checkAuth() {
  const session = await getServerSession(authOptions);
  return session;
}
