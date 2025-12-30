import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  User,
  UserPlus,
  BadgeCheck,
  Clock,
  MapPin,
  Edit,
  Eye,
  AlertCircle,
  Info,
  Crown,
} from "lucide-react";

// Minimum completion percentage to be considered "complete enough" for review
const MIN_COMPLETION_FOR_REVIEW = 80;

export default async function ProfileManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user's subscription plan to check profile limit
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionPlan: {
        select: {
          name: true,
          profileLimit: true,
        },
      },
    },
  });

  // Get profile limit from subscription plan (default to 1 for free users)
  const profileLimit = user?.subscriptionPlan?.profileLimit ?? 1;
  const planName = user?.subscriptionPlan?.name ?? "Free";

  // Fetch all profiles with location data
  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    include: {
      city: { select: { name: true } },
      stateProvince: { select: { name: true } },
      countryLivingIn: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Check if profile limit reached
  const hasReachedProfileLimit = profiles.length >= profileLimit;

  // Helper to get profile status info
  const getProfileStatus = (profile: typeof profiles[number]) => {
    // If profile is approved/published
    if (profile.isPublished) {
      return {
        label: "Approved",
        color: "bg-blue-100 text-blue-700",
        icon: BadgeCheck,
      };
    }

    // If profile completion is below threshold, show as incomplete
    if (profile.profileCompletion < MIN_COMPLETION_FOR_REVIEW) {
      return {
        label: "Incomplete",
        color: "bg-orange-100 text-orange-700",
        icon: AlertCircle,
      };
    }

    // Profile is complete but awaiting review
    return {
      label: "Pending Approval",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Profile(s)</h1>
        <p className="text-gray-500 mt-1">
          View, edit and manage all your matrimonial profiles
        </p>
      </div>

      {/* Profile Limit Reached Alert */}
      {hasReachedProfileLimit && profiles.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">
            Profile Limit Reached
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            You have reached the maximum number of profiles ({profileLimit}) allowed under your <strong>{planName}</strong> plan.
            To create additional profiles, please upgrade your subscription.
          </AlertDescription>
          <Link href="/dashboard/subscription" className="inline-block mt-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        </Alert>
      )}

      {/* Create New Profile Card - only show if under profile limit */}
      {!hasReachedProfileLimit && profiles.length === 0 && (
        <Link href="/profile/create">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-green-400">
            <CardContent className="p-6 flex items-center justify-center gap-4">
              <UserPlus className="h-8 w-8 text-green-600" />
              <span className="text-lg font-semibold text-gray-700">
                Create New Rishta Profile
              </span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Profiles List */}
      {profiles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Profiles</CardTitle>
            <CardDescription>
              {profiles.length} profile{profiles.length !== 1 ? "s" : ""} created
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {profiles.map((profile: typeof profiles[number]) => {
                // Calculate age from dateOfBirth
                const birthDate = new Date(profile.dateOfBirth);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                  age--;
                }

                // Build location string
                const locationParts = [];
                if (profile.city?.name) locationParts.push(profile.city.name);
                if (profile.stateProvince?.name) locationParts.push(profile.stateProvince.name);
                if (profile.countryLivingIn?.name) locationParts.push(profile.countryLivingIn.name);
                const locationString = locationParts.join(", ") || "Location not set";

                // Get profile status
                const status = getProfileStatus(profile);
                const StatusIcon = status.icon;
                const isIncomplete = profile.profileCompletion < MIN_COMPLETION_FOR_REVIEW;

                return (
                  <div
                    key={profile.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4"
                  >
                    {/* Profile Info */}
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {profile.profileFor === "SELF"
                            ? "My Profile"
                            : `Profile for ${profile.profileFor.charAt(0) + profile.profileFor.slice(1).toLowerCase()}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {profile.gender === "MALE" ? "Male" : "Female"} •{" "}
                          {age} years old
                        </p>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {locationString}
                        </p>
                        {/* Show completion percentage for incomplete profiles */}
                        {isIncomplete && (
                          <p className="text-xs text-orange-600 mt-1">
                            {profile.profileCompletion}% complete - Please complete your profile
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                      {/* Status Badge */}
                      {profile.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </span>

                      {/* Action Buttons - Show "Complete Profile" for incomplete, "Edit" otherwise */}
                      {isIncomplete ? (
                        <Link href={`/dashboard/profile/${profile.id}/edit`}>
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <Edit className="h-4 w-4 mr-1" />
                            Complete Profile
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Link href={`/dashboard/profile/${profile.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/dashboard/profile/${profile.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No profiles yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first matrimonial profile to get started
            </p>
            {!hasReachedProfileLimit && (
              <Link href="/profile/create">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Profile
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
