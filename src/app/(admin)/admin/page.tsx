// import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Users,
  FileText,
  Clock,
  DollarSign,
  Shield,
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
      trend: "up" as const,
      icon: Users,
      iconColor: "bg-blue-100 text-blue-600",
      description: "from last month",
    },
    {
      title: "Active Profiles",
      value: "1,823",
      change: "+8%",
      trend: "up" as const,
      icon: FileText,
      iconColor: "bg-green-100 text-green-600",
      description: "from last month",
    },
    {
      title: "Pending Approvals",
      value: "8",
      change: "Needs attention",
      trend: "neutral" as const,
      icon: Clock,
      iconColor: "bg-orange-100 text-orange-600",
      description: "",
    },
    {
      title: "Premium Subscribers",
      value: "456",
      change: "+23%",
      trend: "up" as const,
      icon: Users,
      iconColor: "bg-purple-100 text-purple-600",
      description: "from last month",
    },
    {
      title: "Admin Team",
      value: "12",
      change: "4 Supervisors, 8 Staff",
      trend: "neutral" as const,
      icon: Shield,
      iconColor: "bg-red-100 text-red-600",
      description: "",
    },
    {
      title: "Monthly Revenue",
      value: "$12,456",
      change: "+18%",
      trend: "up" as const,
      icon: DollarSign,
      iconColor: "bg-green-100 text-green-600",
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

  return (
    <>
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
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              trend={stat.trend}
              change={stat.change}
              description={stat.description}
              hoverable
            />
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
    </>
  );
}
