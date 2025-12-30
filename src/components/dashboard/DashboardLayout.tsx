"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/header/Logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  User,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  CreditCard,
  Shield,
  LogOut,
  Menu,
  X,
  Search,
  Star,
  UserCheck,
  Clock,
  ChevronDown,
  Sparkles,
  Gift,
  HelpCircle,
  Wallet,
  History,
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserPlanData {
  planName: string;
  isFree: boolean;
}

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";

// Helper to get initial sidebar collapsed state from localStorage
function getInitialCollapsedState(): boolean {
  if (typeof window === "undefined") return false;
  const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  return savedState === "true";
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialCollapsedState);
  const [userPlan, setUserPlan] = useState<UserPlanData>({ planName: "Free Plan", isFree: true });
  const pathname = usePathname();
  const { data: session } = useSession();

  // Toggle sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // Fetch user subscription data
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const res = await fetch("/api/user/plan");
        if (res.ok) {
          const data = await res.json();
          setUserPlan({
            planName: data.planName || "Free Plan",
            isFree: data.isFree ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user plan:", error);
      }
    };

    if (session?.user) {
      fetchUserPlan();
    }
  }, [session]);

  // Get user info from session
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const navigation = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: "Browse Profiles",
          href: "/dashboard/browse",
          icon: Search,
          badge: "New",
          badgeColor: "default",
        },
      ],
    },
    {
      title: "My Profile",
      items: [
        {
          name: "Manage Profile(s)",
          href: "/dashboard/profiles",
          icon: User,
          badge: null,
        },
        {
          name: "Verification",
          href: "/dashboard/verification",
          icon: Shield,
          badge: "Required",
          badgeColor: "destructive",
        },
      ],
    },
    {
      title: "Connections",
      items: [
        {
          name: "Interests Sent",
          href: "/dashboard/interests/sent",
          icon: Heart,
          badge: "5",
          badgeColor: "default",
        },
        {
          name: "Interests Received",
          href: "/dashboard/interests/received",
          icon: UserCheck,
          badge: "12",
          badgeColor: "destructive",
        },
        {
          name: "Matches",
          href: "/dashboard/matches",
          icon: Star,
          badge: null,
        },
        {
          name: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
          badge: "3",
          badgeColor: "destructive",
        },
      ],
    },
    {
      title: "Activity",
      items: [
        {
          name: "Profile Visitors",
          href: "/dashboard/visitors",
          icon: Clock,
          badge: "24",
          badgeColor: "secondary",
        },
        {
          name: "Saved Profiles",
          href: "/dashboard/saved",
          icon: Heart,
          badge: null,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Subscription",
          href: "/dashboard/subscription",
          icon: Sparkles,
          badge: "Premium",
          badgeColor: "default",
        },
        {
          name: "Top Up Credits",
          href: "/dashboard/topup",
          icon: Wallet,
          badge: null,
        },
        {
          name: "Transactions",
          href: "/dashboard/transactions",
          icon: History,
          badge: null,
        },
        {
          name: "Billing",
          href: "/dashboard/billing",
          icon: CreditCard,
          badge: null,
        },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          badge: null,
        },
      ],
    },
    {
      title: "Help & Support",
      items: [
        {
          name: "Help Center",
          href: "/dashboard/help",
          icon: HelpCircle,
          badge: null,
        },
        {
          name: "Contact Support",
          href: "/dashboard/support",
          icon: MessageSquare,
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
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
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
            "fixed lg:fixed h-full bg-gray-900 text-white transform transition-all duration-300 ease-in-out z-40 overflow-y-auto shadow-2xl",
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
                <Logo variant="dark" size="normal" href="/dashboard" />
                <Badge className={cn(
                  "mt-2 font-medium",
                  userPlan.isFree
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-700"
                    : "bg-green-600 text-white hover:bg-green-600"
                )}>
                  {userPlan.isFree ? "FREE MEMBER" : userPlan.planName.toUpperCase()}
                </Badge>
              </div>
            ) : (
              <Link href="/dashboard" className="mx-auto">
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
                            ? "bg-gray-800 text-green-400 border-l-4 border-green-400"
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
                                className={cn(
                                  "ml-auto text-xs",
                                  item.badgeColor === "destructive" &&
                                    "bg-red-500 text-white hover:bg-red-600",
                                  item.badgeColor === "default" &&
                                    "bg-green-600 text-white hover:bg-green-700",
                                  item.badgeColor === "secondary" &&
                                    "bg-gray-700 text-white hover:bg-gray-600"
                                )}
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
                                className={cn(
                                  "text-xs",
                                  item.badgeColor === "destructive" &&
                                    "bg-red-500 text-white",
                                  item.badgeColor === "default" &&
                                    "bg-green-600 text-white",
                                  item.badgeColor === "secondary" &&
                                    "bg-gray-500 text-white"
                                )}
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

          {/* Sidebar Footer - Upgrade CTA (only show for free users and when not collapsed) */}
          {userPlan.isFree && !sidebarCollapsed && (
            <div className="p-6 border-t border-gray-700 mt-auto">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Upgrade to Premium</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Unlock unlimited messaging and advanced features
                </p>
                <Button
                  size="sm"
                  className="w-full bg-green-600 text-white hover:bg-green-700 font-semibold"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}

          {/* Collapsed Upgrade Button */}
          {userPlan.isFree && sidebarCollapsed && (
            <div className="p-2 border-t border-gray-700 mt-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/subscription" className="flex justify-center">
                    <div className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Upgrade to Premium
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Breadcrumb / Page Title */}
            <div className="flex items-center">
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <Link
                  href="/dashboard"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  Dashboard
                </Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700">Overview</span>
              </div>
              <div className="md:hidden">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard
                </h2>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              {/* Upgrade Button - Desktop */}
              <Button
                size="sm"
                className="hidden md:flex bg-linear-to-r from-green-600 to-cyan-600 text-white hover:from-green-700 hover:to-cyan-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-50"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {userInitials}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500">{userPlan.planName}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings & Privacy
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/help" className="cursor-pointer">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
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

        {/* Optional Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <p>© 2024 NikahFirst. All rights reserved.</p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="hover:text-green-600 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-green-600 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/help"
                className="hover:text-green-600 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
