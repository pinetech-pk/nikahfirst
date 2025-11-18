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
  Users,
  FileText,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  // Placeholder data
  const stats = [
    {
      title: "Total Regular Users",
      value: "2,456",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
      description: "from last month",
    },
    {
      title: "Active Profiles",
      value: "1,823",
      change: "+8%",
      trend: "up",
      icon: FileText,
      color: "green",
      description: "from last month",
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "Needs attention",
      trend: "neutral",
      icon: Clock,
      color: "yellow",
      description: "",
    },
    {
      title: "Premium Subscribers",
      value: "456",
      change: "+23%",
      trend: "up",
      icon: Users,
      color: "purple",
      description: "from last month",
    },
    {
      title: "Admin Team",
      value: "12",
      change: "4 Supervisors, 8 Staff",
      trend: "neutral",
      icon: Shield,
      color: "red",
      description: "",
    },
    {
      title: "Monthly Revenue",
      value: "$12,456",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "green",
      description: "from last month",
    },
  ];

  const recentActivity = [
    {
      admin: "Sarah Miller",
      role: "Content Editor",
      action: "Approved Profile",
      target: "Ahmed Khan",
      time: "2 minutes ago",
      status: "success",
    },
    {
      admin: "John Doe",
      role: "Supervisor",
      action: "Banned User",
      target: "spam_user_123",
      time: "15 minutes ago",
      status: "success",
    },
    {
      admin: "Ali Khan",
      role: "Support Agent",
      action: "Processed Refund",
      target: "Order #12345",
      time: "1 hour ago",
      status: "success",
    },
    {
      admin: "Emma Wilson",
      role: "Content Editor",
      action: "Rejected Profile",
      target: "John Smith",
      time: "2 hours ago",
      status: "warning",
    },
    {
      admin: "Mike Chen",
      role: "Supervisor",
      action: "Created Admin",
      target: "New Support Agent",
      time: "3 hours ago",
      status: "success",
    },
  ];

  const getIconBgColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-orange-100 text-orange-600",
      purple: "bg-purple-100 text-purple-600",
      red: "bg-red-100 text-red-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with NikahFirst today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" && (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {stat.trend === "down" && (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    {stat.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${getIconBgColor(stat.color)}`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/users/create-admin">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Create Admin</p>
                    <p className="text-xs text-gray-500">Add new admin user</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/profiles/pending">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Eye className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Review Profiles</p>
                    <p className="text-xs text-gray-500">8 pending</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/analytics">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <BarChart3 className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">View Reports</p>
                    <p className="text-xs text-gray-500">
                      Analytics & insights
                    </p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/settings/system">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <Settings className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Settings</p>
                    <p className="text-xs text-gray-500">
                      System configuration
                    </p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Admin Activity</CardTitle>
              <CardDescription>Latest actions by admin team</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Admin
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Action
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Target
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Time
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                            {activity.admin
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {activity.admin}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">{activity.action}</td>
                      <td className="py-3 px-2 text-sm">{activity.target}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {activity.time}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "warning"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
