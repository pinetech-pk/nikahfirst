"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Lock,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  // Get user initials
  const getInitials = (name: string | null | undefined, email: string) => {
    if (name && name.trim().length > 0) {
      return name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (session.user.name && session.user.name.trim().length > 0) {
      return session.user.name;
    }
    return session.user.email?.split("@")[0] || "User";
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      SUPER_ADMIN: "bg-red-100 text-red-800",
      SUPERVISOR: "bg-blue-100 text-blue-800",
      CONTENT_EDITOR: "bg-purple-100 text-purple-800",
      SUPPORT_AGENT: "bg-orange-100 text-orange-800",
      CONSULTANT: "bg-green-100 text-green-800",
    };

    const labels: Record<string, string> = {
      SUPER_ADMIN: "Super Admin",
      SUPERVISOR: "Supervisor",
      CONTENT_EDITOR: "Content Editor",
      SUPPORT_AGENT: "Support Agent",
      CONSULTANT: "Consultant",
    };

    return {
      className: styles[role] || "bg-gray-100 text-gray-800",
      label: labels[role] || role,
    };
  };

  const initials = getInitials(session.user.name, session.user.email || "U");
  const displayName = getDisplayName();
  const roleBadge = getRoleBadge(session.user.role || "USER");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">{roleBadge.label}</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
            <Badge className={`${roleBadge.className} w-fit`}>
              <Shield className="h-3 w-3 mr-1" />
              {roleBadge.label}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings/account"
            className="flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings/change-password"
            className="flex items-center cursor-pointer"
          >
            <Lock className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
