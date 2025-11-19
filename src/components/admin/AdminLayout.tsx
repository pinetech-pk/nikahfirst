"use client";

import { useState, useMemo } from "react";
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
  "/admin/support/tickets": { section: "Support", page: "Support Tickets" },
  "/admin/support/complaints": { section: "Support", page: "Complaints" },
  "/admin/support/refunds": { section: "Support", page: "Refund Requests" },
  "/admin/settings/system": { section: "Settings", page: "System Settings" },
  "/admin/settings/permissions": { section: "Settings", page: "Permissions" },
  "/admin/settings/audit": { section: "Settings", page: "Audit Logs" },
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Handle logout
  const handleLogout = () => {
    signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  };

  // Get dynamic breadcrumb
  const breadcrumb = useMemo(() => {
    // Handle dynamic routes like /admin/profiles/[id]/review
    if (pathname.includes("/admin/profiles/") && pathname.includes("/review")) {
      return { section: "Profile Management", page: "Review Profile" };
    }

    return (
      BREADCRUMB_MAP[pathname] || { section: "Dashboard", page: "Overview" }
    );
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
          name: "Subscriptions",
          href: "/admin/financial/subscriptions",
          icon: CreditCard,
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold">
                      AM
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">Ahmad Mustafa</p>
                      <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Change Password</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
