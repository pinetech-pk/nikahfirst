"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Shield,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  CreditCard,
  Wallet,
  DollarSign,
  MessageSquare,
  RotateCw,
  Settings,
  Key,
  FileText,
  Bell,
  Menu,
  X,
  TrendingUp,
  Mail,
  ChevronDown,
  BarChart3,
  LogOut,
  Crown,
  Coins,
  Package,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/layout/header/Logo";

import { UserMenu } from "./UserMenu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Breadcrumb mapping based on routes
const BREADCRUMB_MAP: Record<string, { section: string; page: string }> = {
  "/admin": { section: "Dashboard", page: "Overview" },
  "/admin/analytics": { section: "Dashboard", page: "Analytics" },
  "/admin/users/regular": { section: "User Management", page: "Regular Users" },
  "/admin/users/admins": { section: "User Management", page: "Admin Users" },
  "/admin/users/banned": { section: "User Management", page: "Banned Users" },
  "/admin/users/create-admin": {
    section: "User Management",
    page: "Create Admin",
  },
  "/admin/users/verification": {
    section: "User Management",
    page: "User Verification",
  },
  "/admin/profiles/pending": {
    section: "Profile Management",
    page: "Pending Approval",
  },
  "/admin/profiles/approved": {
    section: "Profile Management",
    page: "Approved Profiles",
  },
  "/admin/profiles/rejected": {
    section: "Profile Management",
    page: "Rejected Profiles",
  },
  "/admin/profiles/verified": {
    section: "Profile Management",
    page: "Verified Profiles",
  },
  "/admin/financial/subscriptions": {
    section: "Financial",
    page: "Subscriptions",
  },
  "/admin/financial/transactions": {
    section: "Financial",
    page: "Transactions",
  },
  "/admin/financial/wallets": {
    section: "Financial",
    page: "Credits & Wallets",
  },
  "/admin/users/regular/create": {
    section: "User Management",
    page: "Create User",
  },
  "/admin/support/tickets": { section: "Support", page: "Support Tickets" },
  "/admin/support/complaints": { section: "Support", page: "Complaints" },
  "/admin/support/refunds": { section: "Support", page: "Refund Requests" },
  "/admin/settings/system": { section: "Settings", page: "System Settings" },
  "/admin/settings/permissions": { section: "Settings", page: "Permissions" },
  "/admin/settings/audit": { section: "Settings", page: "Audit Logs" },
  "/admin/settings/account": { section: "Settings", page: "Account Settings" },
  "/admin/settings/change-password": {
    section: "Settings",
    page: "Change Password",
  },
  "/admin/global-settings": { section: "Global Settings", page: "Overview" },
  "/admin/global-settings/subscription-plans": {
    section: "Global Settings",
    page: "Subscription Plans",
  },
  "/admin/global-settings/credit-actions": {
    section: "Global Settings",
    page: "Credit Actions",
  },
  "/admin/global-settings/credit-packages": {
    section: "Global Settings",
    page: "Credit Packages",
  },
  "/admin/global-settings/payment-settings": {
    section: "Global Settings",
    page: "Payment Settings",
  },
  "/admin/financial/topup-requests": {
    section: "Financial",
    page: "Top-Up Requests",
  },
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingTopUpCount, setPendingTopUpCount] = useState<number>(0);
  const [pendingVerificationCount, setPendingVerificationCount] = useState<number>(0);
  const pathname = usePathname();

  // Fetch pending counts
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        // Fetch top-up requests count
        const topUpResponse = await fetch("/api/admin/topup-requests/pending-count");
        if (topUpResponse.ok) {
          const data = await topUpResponse.json();
          setPendingTopUpCount(data.count || 0);
        }

        // Fetch pending phone verification count
        const verificationResponse = await fetch("/api/admin/users/verification/pending-count");
        if (verificationResponse.ok) {
          const data = await verificationResponse.json();
          setPendingVerificationCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch pending counts:", error);
      }
    };

    fetchPendingCounts();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = () => {
    signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  // Get dynamic breadcrumb
  const breadcrumb = useMemo(() => {
    // Check static map first
    if (BREADCRUMB_MAP[pathname]) {
      return BREADCRUMB_MAP[pathname];
    }

    // Handle dynamic routes with pattern matching
    // Admin user routes: /admin/users/admins/[id] and /admin/users/admins/[id]/edit
    if (pathname.match(/^\/admin\/users\/admins\/[^/]+\/edit$/)) {
      return { section: "User Management", page: "Edit Admin User" };
    }
    if (pathname.match(/^\/admin\/users\/admins\/[^/]+$/)) {
      return { section: "User Management", page: "Admin User Details" };
    }

    // Regular user routes: /admin/users/regular/[id], /admin/users/regular/[id]/edit, /admin/users/regular/[id]/credits
    if (pathname.match(/^\/admin\/users\/regular\/[^/]+\/edit$/)) {
      return { section: "User Management", page: "Edit User" };
    }
    if (pathname.match(/^\/admin\/users\/regular\/[^/]+\/credits$/)) {
      return { section: "User Management", page: "Add Credits" };
    }
    if (pathname.match(/^\/admin\/users\/regular\/[^/]+$/)) {
      return { section: "User Management", page: "User Details" };
    }

    // Profile routes: /admin/profiles/[id]/review
    if (pathname.match(/^\/admin\/profiles\/[^/]+\/review$/)) {
      return { section: "Profile Management", page: "Review Profile" };
    }
    if (pathname.match(/^\/admin\/profiles\/[^/]+$/)) {
      return { section: "Profile Management", page: "Profile Details" };
    }

    // Default fallback
    return { section: "Dashboard", page: "Overview" };
  }, [pathname]);

  const navigation = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          badge: null,
        },
      ],
    },
    {
      title: "User Management",
      items: [
        {
          name: "Regular Users",
          href: "/admin/users/regular",
          icon: Users,
          badge: "2,456",
          badgeColor: "default",
        },
        {
          name: "Admin Users",
          href: "/admin/users/admins",
          icon: Shield,
          badge: "12",
          badgeColor: "secondary",
        },
        {
          name: "User Verification",
          href: "/admin/users/verification",
          icon: ShieldCheck,
          badge: pendingVerificationCount > 0 ? pendingVerificationCount.toString() : null,
          badgeColor: "destructive",
        },
        {
          name: "Banned Users",
          href: "/admin/users/banned",
          icon: UserX,
          badge: null,
        },
      ],
    },
    {
      title: "Profile Management",
      items: [
        {
          name: "Pending Approval",
          href: "/admin/profiles/pending",
          icon: Clock,
          badge: "8",
          badgeColor: "destructive",
        },
        {
          name: "Approved Profiles",
          href: "/admin/profiles/approved",
          icon: CheckCircle,
          badge: null,
        },
        {
          name: "Rejected Profiles",
          href: "/admin/profiles/rejected",
          icon: XCircle,
          badge: null,
        },
        {
          name: "Verified Profiles",
          href: "/admin/profiles/verified",
          icon: Star,
          badge: null,
        },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          name: "Top-Up Requests",
          href: "/admin/financial/topup-requests",
          icon: CreditCard,
          badge: pendingTopUpCount > 0 ? pendingTopUpCount.toString() : null,
          badgeColor: "destructive",
        },
        {
          name: "Subscriptions",
          href: "/admin/financial/subscriptions",
          icon: Crown,
          badge: null,
        },
        {
          name: "Transactions",
          href: "/admin/financial/transactions",
          icon: DollarSign,
          badge: null,
        },
        {
          name: "Credits & Wallets",
          href: "/admin/financial/wallets",
          icon: Wallet,
          badge: null,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          name: "Support Tickets",
          href: "/admin/support/tickets",
          icon: Mail,
          badge: "3",
          badgeColor: "destructive",
        },
        {
          name: "Complaints",
          href: "/admin/support/complaints",
          icon: MessageSquare,
          badge: null,
        },
        {
          name: "Refund Requests",
          href: "/admin/support/refunds",
          icon: RotateCw,
          badge: null,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "System Settings",
          href: "/admin/settings/system",
          icon: Settings,
          badge: null,
        },
        {
          name: "Permissions",
          href: "/admin/settings/permissions",
          icon: Key,
          badge: null,
        },
        {
          name: "Audit Logs",
          href: "/admin/settings/audit",
          icon: FileText,
          badge: null,
        },
      ],
    },
    {
      title: "Global Settings",
      items: [
        {
          name: "Subscription Plans",
          href: "/admin/global-settings/subscription-plans",
          icon: Crown,
          badge: null,
        },
        {
          name: "Credit Actions",
          href: "/admin/global-settings/credit-actions",
          icon: Coins,
          badge: null,
        },
        {
          name: "Credit Packages",
          href: "/admin/global-settings/credit-packages",
          icon: Package,
          badge: null,
        },
        {
          name: "Payment Settings",
          href: "/admin/global-settings/payment-settings",
          icon: CreditCard,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:fixed w-64 h-full bg-gray-900 text-white transform transition-transform duration-200 ease-in-out z-40 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <Logo variant="dark" size="normal" href="/admin" />
          <Badge className="mt-2 bg-green-600 text-white hover:bg-green-600">
            SUPER ADMIN
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="py-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-4">
              <h2 className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h2>
              <div className="mt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-6 py-3 text-sm font-medium transition-colors relative",
                        isActive
                          ? "bg-gray-800 text-cyan-400 border-l-4 border-cyan-400"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge
                          variant={(item.badgeColor as any) || "secondary"}
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Dynamic Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {breadcrumb.section}
              </span>
              <span className="mx-2">/</span>
              <span>{breadcrumb.page}</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
