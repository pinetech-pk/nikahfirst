"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  MapPin,
  Globe2,
  GraduationCap,
  Moon,
  Languages,
  Lightbulb,
  Gift,
  PanelLeftClose,
  PanelLeft,
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
  "/admin/profiles": {
    section: "Profile Management",
    page: "All Profiles",
  },
  "/admin/profiles/pending": {
    section: "Profile Management",
    page: "Pending Approval",
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
  "/admin/global-settings/redeem-actions": {
    section: "Global Settings",
    page: "Redeem Actions",
  },
  "/admin/global-settings/credit-packages": {
    section: "Global Settings",
    page: "Credit Packages",
  },
  "/admin/global-settings/payment-settings": {
    section: "Global Settings",
    page: "Payment Settings",
  },
  "/admin/global-settings/locations": {
    section: "Global Settings",
    page: "Location Management",
  },
  "/admin/global-settings/origins": {
    section: "Global Settings",
    page: "Origin Management",
  },
  "/admin/global-settings/income": {
    section: "Global Settings",
    page: "Income Management",
  },
  "/admin/global-settings/education": {
    section: "Global Settings",
    page: "Education Management",
  },
  "/admin/global-settings/sects": {
    section: "Global Settings",
    page: "Sect Management",
  },
  "/admin/global-settings/languages": {
    section: "Global Settings",
    page: "Mother Tongue Management",
  },
  "/admin/financial/topup-requests": {
    section: "Financial",
    page: "Top-Up Requests",
  },
  "/admin/suggestions": {
    section: "Content Management",
    page: "User Suggestions",
  },
};

const ADMIN_SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

// Helper to get initial sidebar collapsed state from localStorage
function getInitialCollapsedState(): boolean {
  if (typeof window === "undefined") return false;
  const savedState = localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
  return savedState === "true";
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCollapsedState);
  const [pendingTopUpCount, setPendingTopUpCount] = useState<number>(0);
  const [pendingVerificationCount, setPendingVerificationCount] = useState<number>(0);
  const [pendingSuggestionsCount, setPendingSuggestionsCount] = useState<number>(0);
  const [regularUsersCount, setRegularUsersCount] = useState<number>(0);
  const [adminUsersCount, setAdminUsersCount] = useState<number>(0);
  const [pendingProfilesCount, setPendingProfilesCount] = useState<number>(0);
  const pathname = usePathname();

  // Toggle sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // Fetch all counts
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

        // Fetch pending suggestions count
        const suggestionsResponse = await fetch("/api/admin/suggestions?status=PENDING");
        if (suggestionsResponse.ok) {
          const data = await suggestionsResponse.json();
          setPendingSuggestionsCount(data.counts?.pending || 0);
        }

        // Fetch sidebar counts (users and pending profiles)
        const sidebarCountsResponse = await fetch("/api/admin/sidebar-counts");
        if (sidebarCountsResponse.ok) {
          const data = await sidebarCountsResponse.json();
          setRegularUsersCount(data.regularUsers || 0);
          setAdminUsersCount(data.adminUsers || 0);
          setPendingProfilesCount(data.pendingProfiles || 0);
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

    // Transaction routes: /admin/financial/transactions/[id]
    if (pathname.match(/^\/admin\/financial\/transactions\/[^/]+$/)) {
      return { section: "Financial", page: "Transaction Details" };
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
          badge: regularUsersCount > 0 ? regularUsersCount.toLocaleString() : null,
          badgeColor: "default",
        },
        {
          name: "Admin Users",
          href: "/admin/users/admins",
          icon: Shield,
          badge: adminUsersCount > 0 ? adminUsersCount.toString() : null,
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
          name: "All Profiles",
          href: "/admin/profiles",
          icon: Users,
          badge: null,
        },
        {
          name: "Pending Approval",
          href: "/admin/profiles/pending",
          icon: Clock,
          badge: pendingProfilesCount > 0 ? pendingProfilesCount.toString() : null,
          badgeColor: "destructive",
        },
        {
          name: "Approved Profiles",
          href: "/admin/profiles?status=APPROVED",
          icon: CheckCircle,
          badge: null,
        },
        {
          name: "Rejected Profiles",
          href: "/admin/profiles?status=REJECTED",
          icon: XCircle,
          badge: null,
        },
        {
          name: "Verified Profiles",
          href: "/admin/profiles?status=verified",
          icon: Star,
          badge: null,
        },
      ],
    },
    {
      title: "Content Management",
      items: [
        {
          name: "User Suggestions",
          href: "/admin/suggestions",
          icon: Lightbulb,
          badge: pendingSuggestionsCount > 0 ? pendingSuggestionsCount.toString() : null,
          badgeColor: "destructive",
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
          badge: null, // TODO: Add real count when support tickets are implemented
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
          name: "Redeem Actions",
          href: "/admin/global-settings/redeem-actions",
          icon: Gift,
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
        {
          name: "Locations",
          href: "/admin/global-settings/locations",
          icon: MapPin,
          badge: null,
        },
        {
          name: "Origins",
          href: "/admin/global-settings/origins",
          icon: Globe2,
          badge: null,
        },
        {
          name: "Income Ranges",
          href: "/admin/global-settings/income",
          icon: DollarSign,
          badge: null,
        },
        {
          name: "Education",
          href: "/admin/global-settings/education",
          icon: GraduationCap,
          badge: null,
        },
        {
          name: "Sects",
          href: "/admin/global-settings/sects",
          icon: Moon,
          badge: null,
        },
        {
          name: "Mother Tongues",
          href: "/admin/global-settings/languages",
          icon: Languages,
          badge: null,
        },
      ],
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Sidebar Toggle */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:fixed h-full bg-gray-900 text-white transform transition-all duration-300 ease-in-out z-40 overflow-y-auto",
            sidebarCollapsed ? "lg:w-16" : "lg:w-64",
            "w-64", // Always full width on mobile
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            "border-b border-gray-800 flex items-center justify-between",
            sidebarCollapsed ? "p-3" : "p-6"
          )}>
            {!sidebarCollapsed ? (
              <div>
                <Logo variant="dark" size="normal" href="/admin" />
                <Badge className="mt-2 bg-green-600 text-white hover:bg-green-600">
                  SUPER ADMIN
                </Badge>
              </div>
            ) : (
              <Link href="/admin" className="mx-auto">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  N
                </div>
              </Link>
            )}
          </div>

          {/* Collapse Toggle Button - Desktop only */}
          <div className="hidden lg:flex justify-end p-2 border-b border-gray-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebarCollapsed}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Navigation */}
          <nav className="py-4">
            {navigation.map((section) => (
              <div key={section.title} className="mb-4">
                {!sidebarCollapsed && (
                  <h2 className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h2>
                )}
                <div className={cn("mt-1", sidebarCollapsed && "mt-0")}>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;

                    const linkContent = (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center text-sm font-medium transition-all relative group",
                          sidebarCollapsed ? "px-0 py-3 justify-center" : "px-6 py-3",
                          isActive
                            ? "bg-gray-800 text-cyan-400 border-l-4 border-cyan-400"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 shrink-0",
                          !sidebarCollapsed && "mr-3"
                        )} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <Badge
                                variant={(item.badgeColor as any) || "secondary"}
                                className="ml-auto"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                        {sidebarCollapsed && item.badge && (
                          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                        )}
                      </Link>
                    );

                    // Wrap with tooltip when collapsed
                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.name}
                            {item.badge && (
                              <Badge
                                variant={(item.badgeColor as any) || "secondary"}
                                className="text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return linkContent;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}>
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
    </TooltipProvider>
  );
}
