import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  Users,
  User,
  Link2,
  Share2,
  MessageSquare,
  Puzzle,
  UserPlus,
  CircleDot,
  BadgeCheck,
  Clock,
  Eye,
  Image,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user data with subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      subscription: true,
    },
  });

  // Check if user has any profiles with detailed stats
  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          receivedConnections: true,
          sentConnections: true,
        },
      },
    },
  });

  // Calculate profile stats
  const activeProfiles = profiles.filter((p) => p.isActive && p.isPublished).length;
  const verifiedProfiles = profiles.filter((p) => p.isVerified).length;
  const pendingProfiles = profiles.filter((p) => !p.isPublished).length;
  const totalProfileViews = profiles.reduce((sum, p) => sum + p.profileViews, 0);

  // Get connection stats (received interests pending)
  const profileIds = profiles.map((p) => p.id);
  const pendingConnections = profileIds.length > 0
    ? await prisma.connection.count({
        where: {
          receiverId: { in: profileIds },
          status: "PENDING",
        },
      })
    : 0;

  // Get accepted connections (matches)
  const acceptedConnections = profileIds.length > 0
    ? await prisma.connection.count({
        where: {
          OR: [
            { senderId: { in: profileIds }, status: "ACCEPTED" },
            { receiverId: { in: profileIds }, status: "ACCEPTED" },
          ],
        },
      })
    : 0;

  // Get wallet balances
  const redeemWallet = await prisma.redeemWallet.findUnique({
    where: { userId: session.user.id },
  });

  const fundingWallet = await prisma.fundingWallet.findUnique({
    where: { userId: session.user.id },
  });

  const totalCredits =
    (redeemWallet?.balance || 0) + (fundingWallet?.balance || 0);

  // Format subscription tier for display
  const subscriptionLabel = user?.subscription === "FREE" ? "Free Plan" : user?.subscription || "Free Plan";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your activity overview.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credits Card with Top Up */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Credits</CardTitle>
            <Link href="/dashboard/topup">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50">
                <Plus className="h-3 w-3 mr-1" />
                Top up
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCredits}</div>
            <p className="text-xs text-gray-500 mt-1">
              Redeem: {redeemWallet?.balance || 0} | Funding: {fundingWallet?.balance || 0}
            </p>
          </CardContent>
        </Card>

        {/* Profiles Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profiles</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{profiles.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {profiles.length === 0 ? "No profiles yet" : `${activeProfiles} active`}
            </p>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Account</CardTitle>
            <User className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900 truncate">
              {session.user?.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">{subscriptionLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* New Connections */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Link2 className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{acceptedConnections}</div>
              <p className="text-xs text-gray-500">New Connections</p>
            </CardContent>
          </Card>

          {/* New Requests */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Share2 className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{pendingConnections}</div>
              <p className="text-xs text-gray-500">New Request</p>
            </CardContent>
          </Card>

          {/* New Messages */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-500">New Message</p>
            </CardContent>
          </Card>

          {/* New Matches */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Puzzle className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{acceptedConnections}</div>
              <p className="text-xs text-gray-500">New Match</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Profiles Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Manage Profiles</h2>
        <div className="border-b border-gray-200 mb-6" />

        {/* Create New Profile Card */}
        <Link href="/profile/create">
          <Card className="hover:shadow-md transition-shadow cursor-pointer mb-6 border-dashed border-2 hover:border-gray-400">
            <CardContent className="p-8 flex items-center justify-center gap-4">
              <UserPlus className="h-10 w-10 text-gray-400" />
              <span className="text-xl font-semibold text-gray-700">Create New Rishta Profile</span>
            </CardContent>
          </Card>
        </Link>

        {/* Profile Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Active Profiles */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <CircleDot className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{activeProfiles}</div>
              <p className="text-xs text-gray-500">Active Profile(s)</p>
            </CardContent>
          </Card>

          {/* Verified Profiles */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <BadgeCheck className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{verifiedProfiles}</div>
              <p className="text-xs text-gray-500">Verified Profile(s)</p>
            </CardContent>
          </Card>

          {/* Pending Profiles */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{pendingProfiles}</div>
              <p className="text-xs text-gray-500">Pending Profile(s)</p>
            </CardContent>
          </Card>

          {/* Profile Views */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalProfileViews}</div>
              <p className="text-xs text-gray-500">Profile Views</p>
            </CardContent>
          </Card>

          {/* Photo Views */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-500">Views for Photo</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Your Profiles List */}
      {profiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Profiles</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {profiles.map((profile) => {
                  // Calculate age from dateOfBirth
                  const birthDate = new Date(profile.dateOfBirth);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }

                  return (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {profile.profileFor === "SELF" ? "My Profile" : `Profile for ${profile.profileFor.charAt(0) + profile.profileFor.slice(1).toLowerCase()}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {profile.gender === "MALE" ? "Male" : "Female"} • {age} years old
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {profile.isVerified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        )}
                        {profile.isPublished ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Approval
                          </span>
                        )}
                        <Link href={`/dashboard/profile/${profile.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
