import { notFound } from "next/navigation";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { getRoleBadge } from "@/lib/roleStyles";
import { UserRole } from "@prisma/client";
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
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Helper function to format dates
function formatDate(date: Date | null): string {
  if (!date) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// Helper function to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 5) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;

  return formatDate(date);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication and permissions
  await requireSupervisor();

  // Await params
  const { id } = await params;

  // Fetch admin user details
  const adminUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      subscription: true,
      subscriptionExpiry: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          profiles: true,
          transactions: true,
        },
      },
    },
  });

  // If user not found
  if (!adminUser) {
    notFound();
  }

  // Only show admin users (not regular users)
  if (adminUser.role === "USER") {
    redirect("/admin/users/regular");
  }

  const roleBadge = getRoleBadge(adminUser.role);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users/admins">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin User Details
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage admin user information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/users/admins/${id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic admin user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {adminUser.name
                      ? adminUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : adminUser.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {adminUser.name || "No name set"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={roleBadge.className}>
                        {roleBadge.label}
                      </Badge>
                      <Badge
                        variant={
                          adminUser.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          adminUser.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : adminUser.status === "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-800"
                            : adminUser.status === "BANNED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {adminUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{adminUser.email}</p>
                      {adminUser.emailVerified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {adminUser.phone || "Not provided"}
                      </p>
                      {adminUser.phone && adminUser.phoneVerified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Account Created</span>
                    </div>
                    <p className="font-medium">
                      {formatDate(adminUser.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(adminUser.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Last Login</span>
                    </div>
                    <p className="font-medium">
                      {adminUser.lastLoginAt
                        ? formatDate(adminUser.lastLoginAt)
                        : "Never logged in"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(adminUser.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>
                  Access level and administrative capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Current Role
                    </label>
                    <div className="mt-2">
                      <Badge
                        className={`${roleBadge.className} text-base px-4 py-2`}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {roleBadge.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">
                      Permissions Overview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {adminUser.role === "SUPER_ADMIN" && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Full System Access</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Manage All Admins</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>System Settings</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>View Analytics</span>
                          </div>
                        </>
                      )}
                      {adminUser.role === "SUPERVISOR" && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Create Lower Admins</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Ban Users</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Manage Subscriptions</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>View Team Analytics</span>
                          </div>
                        </>
                      )}
                      {adminUser.role === "CONTENT_EDITOR" && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Approve Profiles</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Reject Profiles</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Edit Content</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Cannot Ban Users</span>
                          </div>
                        </>
                      )}
                      {adminUser.role === "SUPPORT_AGENT" && (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Handle Complaints</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Process Refunds</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Support Tickets</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Cannot Modify Profiles</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            {adminUser.status !== "ACTIVE" && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <AlertCircle className="h-5 w-5" />
                    Account Status Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-800">
                    {adminUser.status === "SUSPENDED" &&
                      "This admin account is currently suspended. Access is temporarily restricted."}
                    {adminUser.status === "BANNED" &&
                      "This admin account is permanently banned. All access has been revoked."}
                    {adminUser.status === "INACTIVE" &&
                      "This admin account is inactive. The user has deactivated their account."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {adminUser.status === "SUSPENDED" && (
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Account
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Profiles Managed
                    </span>
                    <span className="text-lg font-bold">
                      {adminUser._count.profiles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transactions</span>
                    <span className="text-lg font-bold">
                      {adminUser._count.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Age</span>
                    <span className="text-lg font-bold">
                      {Math.floor(
                        (Date.now() - adminUser.createdAt.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  {adminUser.emailVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone Verified</span>
                  {adminUser.phoneVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Account Verified
                  </span>
                  {adminUser.isVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/admin/users/admins/${id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Role
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
