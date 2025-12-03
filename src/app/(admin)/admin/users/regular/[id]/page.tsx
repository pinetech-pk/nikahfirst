import { notFound, redirect } from "next/navigation";
import { requireSupervisor } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
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
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  CreditCard,
  User,
  Activity,
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

// Helper function for subscription badge styling
function getSubscriptionBadge(subscription: string): { className: string } {
  const styles: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-800",
    STANDARD: "bg-blue-100 text-blue-800",
    SILVER: "bg-slate-200 text-slate-800",
    GOLD: "bg-yellow-100 text-yellow-800",
    PLATINUM: "bg-purple-100 text-purple-800",
    PRO: "bg-indigo-100 text-indigo-800",
  };
  return { className: styles[subscription] || styles.FREE };
}

export default async function RegularUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication and permissions - SUPER_ADMIN and SUPERVISOR only
  const session = await requireSupervisor();
  const currentUserId = session.user?.id;

  // Await params
  const { id } = await params;

  // Fetch user details with wallets and related data
  const user = await prisma.user.findUnique({
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
      redeemWallet: {
        select: {
          balance: true,
          limit: true,
          lastRedeemed: true,
        },
      },
      fundingWallet: {
        select: {
          balance: true,
        },
      },
      _count: {
        select: {
          profiles: true,
          transactions: true,
        },
      },
    },
  });

  // If user not found
  if (!user) {
    notFound();
  }

  // Only show regular users (not admin users)
  if (user.role !== "USER") {
    redirect("/admin/users/admins");
  }

  const subscriptionBadge = getSubscriptionBadge(user.subscription);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/users/regular">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600 mt-1">
                View and manage user information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/users/regular/${id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
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
                <CardDescription>Basic user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {user.name || "No name set"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gray-100 text-gray-800">
                        <User className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "default" : "secondary"
                        }
                        className={
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : user.status === "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-800"
                            : user.status === "BANNED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {user.status}
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
                      <p className="font-medium">{user.email}</p>
                      {user.emailVerified && (
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
                        {user.phone || "Not provided"}
                      </p>
                      {user.phone && user.phoneVerified && (
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
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(user.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Last Login</span>
                    </div>
                    <p className="font-medium">
                      {user.lastLoginAt
                        ? formatDate(user.lastLoginAt)
                        : "Never logged in"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(user.lastLoginAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Credits</CardTitle>
                <CardDescription>
                  User subscription tier and wallet balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Subscription Tier */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        Subscription
                      </span>
                    </div>
                    <Badge className={`${subscriptionBadge.className} text-lg px-3 py-1`}>
                      {user.subscription}
                    </Badge>
                    {user.subscriptionExpiry && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expires: {formatDate(user.subscriptionExpiry)}
                      </p>
                    )}
                  </div>

                  {/* Redeem Wallet */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-500">
                        Redeem Wallet
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {user.redeemWallet?.balance ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Limit: {user.redeemWallet?.limit ?? 0} credits
                    </p>
                    {user.redeemWallet?.lastRedeemed && (
                      <p className="text-xs text-gray-500">
                        Last redeemed:{" "}
                        {formatRelativeTime(user.redeemWallet.lastRedeemed)}
                      </p>
                    )}
                  </div>

                  {/* Funding Wallet */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-500">
                        Funding Wallet
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {user.fundingWallet?.balance ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Paid credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            {user.status !== "ACTIVE" && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <AlertCircle className="h-5 w-5" />
                    Account Status Warning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-800">
                    {user.status === "SUSPENDED" &&
                      "This user account is currently suspended. Access is temporarily restricted."}
                    {user.status === "BANNED" &&
                      "This user account is permanently banned. All access has been revoked."}
                    {user.status === "INACTIVE" &&
                      "This user account is inactive. The user has deactivated their account."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {user.status === "SUSPENDED" && (
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
                    <span className="text-sm text-gray-600">Profiles</span>
                    <span className="text-lg font-bold">
                      {user._count.profiles}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transactions</span>
                    <span className="text-lg font-bold">
                      {user._count.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Credits</span>
                    <span className="text-lg font-bold">
                      {(user.redeemWallet?.balance ?? 0) +
                        (user.fundingWallet?.balance ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Age</span>
                    <span className="text-lg font-bold">
                      {Math.floor(
                        (Date.now() - user.createdAt.getTime()) /
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
                  {user.emailVerified ? (
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
                  {user.phoneVerified ? (
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
                  <span className="text-sm text-gray-600">Account Verified</span>
                  {user.isVerified ? (
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
                <Link href={`/admin/users/regular/${id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
                <Link href={`/admin/users/regular/${id}/credits`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Wallet className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Activity
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {user.status === "ACTIVE"
                    ? "Suspend Account"
                    : "Change Status"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
