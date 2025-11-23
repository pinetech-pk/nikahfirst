import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { getRoleBadge } from "@/lib/roleStyles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleStatsCard } from "@/components/ui/stats-card";
import {
  Crown,
  Shield,
  Edit as EditIcon,
  Users,
  MessageSquare,
  Eye,
  UserPlus,
  Settings,
} from "lucide-react";
import Link from "next/link";

// Helper function to format "last active" time
function formatLastActive(lastLoginAt: Date | null): {
  text: string;
  isOnline: boolean;
} {
  if (!lastLoginAt) {
    return { text: "Never logged in", isOnline: false };
  }

  const now = new Date();
  const diffMs = now.getTime() - lastLoginAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Online now (within last 5 minutes)
  if (diffMinutes < 5) {
    return { text: "Online now", isOnline: true };
  }

  // Minutes ago
  if (diffMinutes < 60) {
    return {
      text: `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`,
      isOnline: false,
    };
  }

  // Hours ago
  if (diffHours < 24) {
    return {
      text: `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`,
      isOnline: false,
    };
  }

  // Days ago
  if (diffDays < 30) {
    return {
      text: `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`,
      isOnline: false,
    };
  }

  // More than 30 days - show date
  return {
    text: lastLoginAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        lastLoginAt.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }),
    isOnline: false,
  };
}

export default async function AdminUsersPage() {
  // Check authentication and permissions
  await requireSupervisor();

  // Fetch admin role counts
  const [
    superAdminCount,
    supervisorCount,
    contentEditorCount,
    supportAgentCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "SUPERVISOR" } }),
    prisma.user.count({ where: { role: "CONTENT_EDITOR" } }),
    prisma.user.count({ where: { role: "SUPPORT_AGENT" } }),
  ]);

  // Fetch all admin users (exclude regular USER role)
  const adminUsers = await prisma.user.findMany({
    where: {
      role: {
        not: "USER",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: [
      { role: "asc" }, // Sort by role hierarchy
      { createdAt: "desc" }, // Then by creation date
    ],
  });

  const adminStats = [
    {
      title: "Super Admins",
      value: superAdminCount.toString(),
      icon: Crown,
      iconColor: "bg-red-100 text-red-600",
    },
    {
      title: "Supervisors",
      value: supervisorCount.toString(),
      icon: Shield,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "Content Editors",
      value: contentEditorCount.toString(),
      icon: EditIcon,
      iconColor: "bg-purple-100 text-purple-600",
    },
    {
      title: "Support Agents",
      value: supportAgentCount.toString(),
      icon: MessageSquare,
      iconColor: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Users Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage admin team members and their permissions
            </p>
          </div>
          <Link href="/admin/users/create-admin">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {adminStats.map((stat, index) => (
            <SimpleStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        {/* Admin Team Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Admin Team</CardTitle>
                <CardDescription>
                  Total {adminUsers.length} admin users
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Permissions
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {adminUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Admin Users Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first admin user.
                </p>
                <Link href="/admin/users/create-admin">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Admin
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Last Active
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((admin) => {
                      const roleBadge = getRoleBadge(admin.role);
                      const lastActive = formatLastActive(admin.lastLoginAt);

                      return (
                        <tr
                          key={admin.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {admin.name
                                  ? admin.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : admin.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {admin.name || "No name set"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {admin.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={roleBadge.className}>
                              {roleBadge.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <p
                              className={`text-sm ${
                                lastActive.isOnline
                                  ? "text-green-600 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {lastActive.text}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                admin.status === "ACTIVE"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                admin.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : admin.status === "SUSPENDED"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : admin.status === "BANNED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {admin.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/users/admins/${admin.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link
                                href={`/admin/users/admins/${admin.id}/edit`}
                              >
                                <Button variant="outline" size="sm">
                                  <EditIcon className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Management Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users/create-admin">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2"
                >
                  <UserPlus className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Invite Admin</p>
                    <p className="text-xs text-gray-500">
                      Send invitation email
                    </p>
                  </div>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Shield className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Role Permissions</p>
                  <p className="text-xs text-gray-500">
                    Configure access levels
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Team Reports</p>
                  <p className="text-xs text-gray-500">
                    View performance metrics
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
