import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Shield,
  Edit,
  Users,
  MessageSquare,
  Plus,
  Eye,
  UserPlus,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  // Placeholder data
  const adminStats = [
    {
      title: "Super Admins",
      value: "1",
      icon: Crown,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Supervisors",
      value: "3",
      icon: Shield,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Content Editors",
      value: "5",
      icon: Edit,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Support Agents",
      value: "3",
      icon: MessageSquare,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const adminUsers = [
    {
      id: 1,
      name: "Ahmad Mustafa",
      email: "superadmin@nikahfirst.com",
      role: "SUPER_ADMIN",
      department: "Management",
      lastActive: "Online now",
      status: "ACTIVE",
      profilesReviewed: 0,
      ticketsHandled: 0,
    },
    {
      id: 2,
      name: "Test Supervisor",
      email: "supervisor@nikahfirst.com",
      role: "SUPERVISOR",
      department: "Operations",
      lastActive: "2 hours ago",
      status: "ACTIVE",
      profilesReviewed: 145,
      ticketsHandled: 0,
    },
    {
      id: 3,
      name: "Sarah Miller",
      email: "sarah.miller@nikahfirst.com",
      role: "CONTENT_EDITOR",
      department: "Content Team",
      lastActive: "1 hour ago",
      status: "ACTIVE",
      profilesReviewed: 89,
      ticketsHandled: 0,
    },
    {
      id: 4,
      name: "John Doe",
      email: "john.doe@nikahfirst.com",
      role: "SUPERVISOR",
      department: "Quality Assurance",
      lastActive: "30 minutes ago",
      status: "ACTIVE",
      profilesReviewed: 234,
      ticketsHandled: 0,
    },
    {
      id: 5,
      name: "Test Editor",
      email: "editor@nikahfirst.com",
      role: "CONTENT_EDITOR",
      department: "Content Team",
      lastActive: "1 day ago",
      status: "ACTIVE",
      profilesReviewed: 67,
      ticketsHandled: 0,
    },
    {
      id: 6,
      name: "Ali Khan",
      email: "ali.khan@nikahfirst.com",
      role: "SUPPORT_AGENT",
      department: "Customer Support",
      lastActive: "5 minutes ago",
      status: "ACTIVE",
      profilesReviewed: 0,
      ticketsHandled: 156,
    },
    {
      id: 7,
      name: "Emma Wilson",
      email: "emma.wilson@nikahfirst.com",
      role: "CONTENT_EDITOR",
      department: "Content Team",
      lastActive: "3 hours ago",
      status: "ACTIVE",
      profilesReviewed: 123,
      ticketsHandled: 0,
    },
    {
      id: 8,
      name: "Mike Chen",
      email: "mike.chen@nikahfirst.com",
      role: "SUPPORT_AGENT",
      department: "Customer Support",
      lastActive: "2 days ago",
      status: "INACTIVE",
      profilesReviewed: 0,
      ticketsHandled: 89,
    },
  ];

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

  return (
    <AdminLayout>
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
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      Department
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Performance
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
                    return (
                      <tr key={admin.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {admin.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium">{admin.name}</p>
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
                          <p className="text-sm">{admin.department}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {admin.profilesReviewed > 0 && (
                              <p>{admin.profilesReviewed} profiles reviewed</p>
                            )}
                            {admin.ticketsHandled > 0 && (
                              <p>{admin.ticketsHandled} tickets handled</p>
                            )}
                            {admin.profilesReviewed === 0 &&
                              admin.ticketsHandled === 0 && (
                                <p className="text-gray-400">—</p>
                              )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p
                            className={`text-sm ${
                              admin.lastActive === "Online now"
                                ? "text-green-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {admin.lastActive}
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
                                : ""
                            }
                          >
                            {admin.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <UserPlus className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Invite Admin</p>
                  <p className="text-xs text-gray-500">Send invitation email</p>
                </div>
              </Button>
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
    </AdminLayout>
  );
}
