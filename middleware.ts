import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Define admin roles
    const adminRoles = [
      "SUPPORT_AGENT",
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPERVISOR",
      "SUPER_ADMIN",
    ];

    const moderatorRoles = [
      "CONTENT_EDITOR",
      "CONSULTANT",
      "SUPERVISOR",
      "SUPER_ADMIN",
    ];

    const supervisorRoles = ["SUPERVISOR", "SUPER_ADMIN"];

    const superAdminOnly = ["SUPER_ADMIN"];

    // ==================== ADMIN ROUTES ====================
    if (pathname.startsWith("/admin")) {
      // Check if user has any admin role
      if (!token?.role || !adminRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // ==================== SUPER ADMIN ONLY ====================
      // System settings - Super Admin only
      if (pathname.startsWith("/admin/settings")) {
        if (!superAdminOnly.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // Analytics - Super Admin only
      if (pathname.startsWith("/admin/analytics")) {
        if (!superAdminOnly.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // Create Supervisor - Super Admin only
      if (pathname.startsWith("/admin/users/create-supervisor")) {
        if (!superAdminOnly.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // ==================== SUPERVISOR OR HIGHER ====================
      // Create other admins - Supervisor or Super Admin
      if (pathname.startsWith("/admin/users/create-")) {
        if (!supervisorRoles.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // User management (ban, suspend) - Supervisor or Super Admin
      if (pathname.match(/\/admin\/users\/[^/]+\/(ban|suspend|upgrade)/)) {
        if (!supervisorRoles.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // ==================== MODERATOR OR HIGHER ====================
      // Profile approval - Content Editor or higher
      if (pathname.startsWith("/admin/profiles")) {
        if (!moderatorRoles.includes(token.role as string)) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      }

      // All other /admin routes - any admin role can access
    }

    // Allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
};
