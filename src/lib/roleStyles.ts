import { UserRole } from "@prisma/client";

/**
 * Role badge styling configuration
 * Provides consistent role badge styling across the application
 */
export const ROLE_STYLES: Record<UserRole, { className: string; label: string }> = {
  SUPER_ADMIN: {
    className: "bg-red-100 text-red-800",
    label: "Super Admin",
  },
  SUPERVISOR: {
    className: "bg-blue-100 text-blue-800",
    label: "Supervisor",
  },
  CONTENT_EDITOR: {
    className: "bg-purple-100 text-purple-800",
    label: "Content Editor",
  },
  SUPPORT_AGENT: {
    className: "bg-orange-100 text-orange-800",
    label: "Support Agent",
  },
  CONSULTANT: {
    className: "bg-green-100 text-green-800",
    label: "Consultant",
  },
  USER: {
    className: "bg-gray-100 text-gray-800",
    label: "Member",
  },
};

/**
 * Get role badge styling and label
 * @param role - The user role
 * @returns Object containing className and label for the role badge
 */
export function getRoleBadge(role: string | UserRole) {
  return ROLE_STYLES[role as UserRole] || {
    className: "bg-gray-100 text-gray-800",
    label: role,
  };
}
