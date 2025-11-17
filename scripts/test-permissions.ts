import {
  hasPermission,
  canCreateRole,
  getRoleDisplayName,
  isAdmin,
  isSupervisor,
  isModerator,
} from "@/lib/permissions";
import { UserRole } from "@prisma/client";

console.log("🧪 Testing Permission System:\n");

// Test 1: Super Admin Permissions
console.log("=== Super Admin Permissions ===");
console.log("Can ban users:", hasPermission("SUPER_ADMIN", "ban_users")); // true
console.log(
  "Can manage settings:",
  hasPermission("SUPER_ADMIN", "manage_global_settings")
); // true
console.log(
  "Can create supervisor:",
  canCreateRole("SUPER_ADMIN", "SUPERVISOR")
); // true

// Test 2: Supervisor Permissions
console.log("\n=== Supervisor Permissions ===");
console.log("Can ban users:", hasPermission("SUPERVISOR", "ban_users")); // true
console.log(
  "Can manage settings:",
  hasPermission("SUPERVISOR", "manage_global_settings")
); // false
console.log(
  "Can create supervisor:",
  canCreateRole("SUPERVISOR", "SUPERVISOR")
); // false
console.log(
  "Can create content editor:",
  canCreateRole("SUPERVISOR", "CONTENT_EDITOR")
); // true

// Test 3: Content Editor Permissions
console.log("\n=== Content Editor Permissions ===");
console.log(
  "Can approve profiles:",
  hasPermission("CONTENT_EDITOR", "approve_profiles")
); // true
console.log("Can ban users:", hasPermission("CONTENT_EDITOR", "ban_users")); // false
console.log(
  "Can edit profiles:",
  hasPermission("CONTENT_EDITOR", "edit_profiles")
); // true

// Test 4: Support Agent Permissions
console.log("\n=== Support Agent Permissions ===");
console.log(
  "Can handle complaints:",
  hasPermission("SUPPORT_AGENT", "handle_complaints")
); // true
console.log(
  "Can approve profiles:",
  hasPermission("SUPPORT_AGENT", "approve_profiles")
); // false
console.log("Can ban users:", hasPermission("SUPPORT_AGENT", "ban_users")); // false

// Test 5: Role Checks
console.log("\n=== Role Checks ===");
console.log("SUPER_ADMIN is admin:", isAdmin("SUPER_ADMIN")); // true
console.log("CONTENT_EDITOR is admin:", isAdmin("CONTENT_EDITOR")); // true
console.log("USER is admin:", isAdmin("USER")); // false

console.log("SUPERVISOR is supervisor:", isSupervisor("SUPERVISOR")); // true
console.log("CONTENT_EDITOR is supervisor:", isSupervisor("CONTENT_EDITOR")); // false

console.log("CONTENT_EDITOR is moderator:", isModerator("CONTENT_EDITOR")); // true
console.log("SUPPORT_AGENT is moderator:", isModerator("SUPPORT_AGENT")); // false

// Test 6: Display Names
console.log("\n=== Display Names ===");
console.log("SUPER_ADMIN:", getRoleDisplayName("SUPER_ADMIN"));
console.log("SUPERVISOR:", getRoleDisplayName("SUPERVISOR"));
console.log("CONTENT_EDITOR:", getRoleDisplayName("CONTENT_EDITOR"));
console.log("SUPPORT_AGENT:", getRoleDisplayName("SUPPORT_AGENT"));

console.log("\n✅ All tests complete!");
