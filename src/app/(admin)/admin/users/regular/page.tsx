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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  UserCheck,
  Diamond,
} from "lucide-react";

export default function RegularUsersPage() {
  // Placeholder data
  const stats = [
    {
      title: "Total Users",
      value: "2,456",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Active Today",
      value: "342",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Premium Users",
      value: "456",
      icon: Diamond,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "New This Month",
      value: "89",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const users = [
    {
      id: 1,
      name: "Ahmed Khan",
      email: "ahmed.khan@example.com",
      phone: "+923001234567",
      subscription: "FREE",
      profiles: 1,
      joined: "Nov 15, 2024",
      lastActive: "2 hours ago",
      status: "ACTIVE",
      location: "Karachi, Pakistan",
    },
    {
      id: 2,
      name: "Mrs. Malik",
      email: "mrs.malik@example.com",
      phone: "+923211234567",
      subscription: "SILVER",
      profiles: 1,
      joined: "Nov 10, 2024",
      lastActive: "1 day ago",
      status: "ACTIVE",
      location: "Lahore, Pakistan",
    },
    {
      id: 3,
      name: "Tariq Hassan",
      email: "tariq.hassan@example.com",
      phone: "+14155552345",
      subscription: "GOLD",
      profiles: 1,
      joined: "Oct 28, 2024",
      lastActive: "5 minutes ago",
      status: "ACTIVE",
      location: "San Francisco, USA",
    },
    {
      id: 4,
      name: "Ali Sheikh",
      email: "ali.sheikh@example.com",
      phone: "+966501234567",
      subscription: "FREE",
      profiles: 1,
      joined: "Oct 20, 2024",
      lastActive: "3 days ago",
      status: "ACTIVE",
      location: "Riyadh, Saudi Arabia",
    },
    {
      id: 5,
      name: "Sarah Ahmed",
      email: "sarah.ahmed@example.com",
      phone: "+923335551234",
      subscription: "STANDARD",
      profiles: 1,
      joined: "Sep 15, 2024",
      lastActive: "1 week ago",
      status: "INACTIVE",
      location: "Islamabad, Pakistan",
    },
  ];

  const getSubscriptionBadge = (subscription: string) => {
    const variants: Record<string, any> = {
      FREE: { variant: "outline", className: "" },
      STANDARD: { variant: "secondary", className: "" },
      SILVER: { variant: "default", className: "bg-gray-500" },
      GOLD: { variant: "default", className: "bg-yellow-600" },
      PLATINUM: { variant: "default", className: "bg-purple-600" },
    };
    return variants[subscription] || variants.FREE;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Regular Users Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage platform members and their profiles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>User List</CardTitle>
                <CardDescription>
                  Total {users.length} users found
                </CardDescription>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="premium">Premium Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
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
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Subscription
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Activity
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
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.profiles} profile(s)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge {...getSubscriptionBadge(user.subscription)}>
                          {user.subscription}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            Joined {user.joined}
                          </div>
                          <p className="text-xs text-gray-500">
                            Last active {user.lastActive}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            user.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className={
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {user.status}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing 1 to 5 of 2,456 results
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  ...
                </Button>
                <Button variant="outline" size="sm">
                  491
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
