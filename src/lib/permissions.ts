import { UserRole } from "@prisma/client";

/**
 * Role Hierarchy (Higher number = More authority)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  SUPPORT_AGENT: 1,
  CONTENT_EDITOR: 2,
  CONSULTANT: 2, // Same level as Content Editor
  SUPERVISOR: 3,
  SUPER_ADMIN: 4,
};

/**
 * Permission definitions
 * Each permission lists which roles have access to it
 */
export const PERMISSIONS = {
  // ==================== USER MANAGEMENT ====================
  view_users: [
    "SUPER_ADMIN",
    "SUPERVISOR",
    "CONTENT_EDITOR",
    "SUPPORT_AGENT",
  ] as UserRole[],
  view_user_details: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  ban_users: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  suspend_users: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  reactivate_users: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  delete_users: ["SUPER_ADMIN"] as UserRole[],

  verify_email_manually: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  verify_phone_manually: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== PROFILE MANAGEMENT ====================
  view_profiles: ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR"] as UserRole[],
  approve_profiles: [
    "SUPER_ADMIN",
    "SUPERVISOR",
    "CONTENT_EDITOR",
  ] as UserRole[],
  reject_profiles: [
    "SUPER_ADMIN",
    "SUPERVISOR",
    "CONTENT_EDITOR",
  ] as UserRole[],
  edit_profiles: ["SUPER_ADMIN", "SUPERVISOR", "CONTENT_EDITOR"] as UserRole[],
  delete_profiles: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== ADMIN MANAGEMENT ====================
  create_super_admin: [] as UserRole[], // No one can create Super Admin (must be done manually)
  create_supervisor: ["SUPER_ADMIN"] as UserRole[],
  create_content_editor: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  create_consultant: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  create_support_agent: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  manage_admins: ["SUPER_ADMIN"] as UserRole[],
  view_admin_list: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== ROLE CHANGES ====================
  change_role_to_super_admin: [] as UserRole[], // Cannot promote to Super Admin
  change_role_to_supervisor: ["SUPER_ADMIN"] as UserRole[],
  change_role_to_content_editor: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  change_role_to_consultant: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  change_role_to_support_agent: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  change_role_to_user: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== SUBSCRIPTION MANAGEMENT ====================
  upgrade_to_premium: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  downgrade_from_premium: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  manage_subscriptions: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== SYSTEM SETTINGS ====================
  manage_global_settings: ["SUPER_ADMIN"] as UserRole[],
  view_system_analytics: ["SUPER_ADMIN"] as UserRole[],
  view_team_analytics: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],

  // ==================== SUPPORT ====================
  handle_complaints: [
    "SUPER_ADMIN",
    "SUPERVISOR",
    "SUPPORT_AGENT",
  ] as UserRole[],
  mark_refunds: ["SUPER_ADMIN", "SUPERVISOR", "SUPPORT_AGENT"] as UserRole[],
  view_support_tickets: [
    "SUPER_ADMIN",
    "SUPERVISOR",
    "SUPPORT_AGENT",
  ] as UserRole[],

  // ==================== CREDIT & WALLET ====================
  adjust_credits: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  view_wallet_details: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  freeze_wallet: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
  unfreeze_wallet: ["SUPER_ADMIN", "SUPERVISOR"] as UserRole[],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole | undefined,
  permission: keyof typeof PERMISSIONS
): boolean {
  if (!userRole) return false;

  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can access admin area (any admin role)
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  if (!userRole) return false;

  const adminRoles: UserRole[] = [
    "SUPPORT_AGENT",
    "CONTENT_EDITOR",
    "CONSULTANT",
    "SUPERVISOR",
    "SUPER_ADMIN",
  ];

  return adminRoles.includes(userRole);
}

/**
 * Check if user is moderator or higher (Content Editor level+)
 */
export function isModerator(userRole: UserRole | undefined): boolean {
  if (!userRole) return false;

  const moderatorRoles: UserRole[] = [
    "CONTENT_EDITOR",
    "CONSULTANT",
    "SUPERVISOR",
    "SUPER_ADMIN",
  ];

  return moderatorRoles.includes(userRole);
}

/**
 * Check if user is supervisor or higher
 */
export function isSupervisor(userRole: UserRole | undefined): boolean {
  if (!userRole) return false;

  return userRole === "SUPERVISOR" || userRole === "SUPER_ADMIN";
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "SUPER_ADMIN";
}

/**
 * Check if current user can create the target role
 */
export function canCreateRole(
  currentRole: UserRole | undefined,
  targetRole: UserRole
): boolean {
  if (!currentRole) return false;

  // Super Admin can create all roles except Super Admin
  if (currentRole === "SUPER_ADMIN") {
    const creatableRoles: UserRole[] = [
      "USER",
      "SUPPORT_AGENT",
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPERVISOR",
    ];
    return creatableRoles.includes(targetRole);
  }

  // Supervisor can create lower-level roles (including regular users)
  if (currentRole === "SUPERVISOR") {
    const creatableRoles: UserRole[] = [
      "USER",
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPPORT_AGENT",
    ];
    return creatableRoles.includes(targetRole);
  }

  return false;
}

/**
 * Check if current user can change another user's role to target role
 */
export function canChangeRoleTo(
  currentUserRole: UserRole | undefined,
  targetRole: UserRole
): boolean {
  if (!currentUserRole) return false;

  // Cannot change to Super Admin (ever)
  if (targetRole === "SUPER_ADMIN") return false;

  // Super Admin can change to any role except Super Admin
  if (currentUserRole === "SUPER_ADMIN") {
    const allowedRoles: UserRole[] = [
      "USER",
      "SUPPORT_AGENT",
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPERVISOR",
    ];
    return allowedRoles.includes(targetRole);
  }

  // Supervisor can change to lower roles
  if (currentUserRole === "SUPERVISOR") {
    const allowedRoles: UserRole[] = [
      "USER",
      "SUPPORT_AGENT",
      "CONTENT_EDITOR",
      "CONSULTANT",
    ];
    return allowedRoles.includes(targetRole);
  }

  return false;
}

/**
 * Get role hierarchy level (higher = more authority)
 */
export function getRoleLevel(role: UserRole | undefined): number {
  if (!role) return -1;
  return ROLE_HIERARCHY[role] ?? -1;
}

/**
 * Check if role A has higher authority than role B
 */
export function hasHigherAuthority(
  roleA: UserRole | undefined,
  roleB: UserRole | undefined
): boolean {
  if (!roleA || !roleB) return false;
  return getRoleLevel(roleA) > getRoleLevel(roleB);
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    USER: "Member",
    SUPPORT_AGENT: "Support Agent",
    CONTENT_EDITOR: "Content Editor",
    CONSULTANT: "Consultant",
    SUPERVISOR: "Supervisor",
    SUPER_ADMIN: "Super Admin",
  };

  return displayNames[role] || role;
}

/**
 * Get all roles that current user can assign
 */
export function getAssignableRoles(
  currentRole: UserRole | undefined
): UserRole[] {
  if (!currentRole) return [];

  if (currentRole === "SUPER_ADMIN") {
    return [
      "USER",
      "SUPPORT_AGENT",
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPERVISOR",
    ];
  }

  if (currentRole === "SUPERVISOR") {
    return ["USER", "SUPPORT_AGENT", "CONTENT_EDITOR", "CONSULTANT"];
  }

  return [];
}
