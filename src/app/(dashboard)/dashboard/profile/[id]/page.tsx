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
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Heart,
  GraduationCap,
  Briefcase,
  Users,
  Edit,
  BadgeCheck,
  Clock,
  Globe,
  Lock,
} from "lucide-react";

interface ViewProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewProfilePage({ params }: ViewProfilePageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Fetch the profile with all related data
  const profile = await prisma.profile.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      origin: { select: { label: true } },
      ethnicity: { select: { label: true } },
      caste: { select: { label: true } },
      countryOfOrigin: { select: { name: true } },
      countryLivingIn: { select: { name: true } },
      stateProvince: { select: { name: true } },
      city: { select: { name: true } },
      sect: { select: { label: true } },
      maslak: { select: { label: true } },
      height: { select: { labelImperial: true, labelMetric: true } },
      educationLevel: { select: { label: true } },
      educationField: { select: { label: true } },
      incomeRange: { select: { label: true } },
      motherTongue: { select: { label: true } },
    },
  });

  if (!profile) {
    redirect("/dashboard/profiles");
  }

  // Calculate age from dateOfBirth
  const birthDate = new Date(profile.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Build location string
  const locationParts = [];
  if (profile.city?.name) locationParts.push(profile.city.name);
  if (profile.stateProvince?.name) locationParts.push(profile.stateProvince.name);
  if (profile.countryLivingIn?.name) locationParts.push(profile.countryLivingIn.name);
  const locationString = locationParts.join(", ") || "Not specified";

  const profileTitle =
    profile.profileFor === "SELF"
      ? "My Profile"
      : `Profile for ${profile.profileFor.charAt(0) + profile.profileFor.slice(1).toLowerCase()}`;

  // Helper function for displaying field values
  const displayValue = (value: string | null | undefined, fallback = "Not specified") => {
    return value || fallback;
  };

  // Format marital status
  const formatMaritalStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/profiles"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Profiles
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto sm:mx-0">
                <User className="h-12 w-12 text-gray-500" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{profileTitle}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {profile.gender === "MALE" ? "Male" : "Female"} • {age} years old
              </p>
              <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {locationString}
              </p>

              {/* Status Badges */}
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                {profile.isVerified && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                )}
                {profile.isPublished ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Approval
                  </span>
                )}
                {profile.originAudience === "SAME_ORIGIN" ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <Lock className="h-3 w-3 mr-1" />
                    Same Origin Only
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    <Globe className="h-3 w-3 mr-1" />
                    Global Visibility
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="shrink-0 text-center sm:text-right">
              <Link href={`/dashboard/profile/${id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Profile For</span>
              <span className="font-medium">{formatMaritalStatus(profile.profileFor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gender</span>
              <span className="font-medium">{profile.gender === "MALE" ? "Male" : "Female"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Age</span>
              <span className="font-medium">{age} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Marital Status</span>
              <span className="font-medium">{formatMaritalStatus(profile.maritalStatus)}</span>
            </div>
            {profile.numberOfChildren > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Children</span>
                <span className="font-medium">{profile.numberOfChildren}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Origin & Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-green-600" />
              Origin & Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Origin</span>
              <span className="font-medium">{displayValue(profile.origin?.label)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ethnicity</span>
              <span className="font-medium">{displayValue(profile.ethnicity?.label)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Caste</span>
              <span className="font-medium">{displayValue(profile.caste?.label || profile.customCaste)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mother Tongue</span>
              <span className="font-medium">{displayValue(profile.motherTongue?.label)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-green-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Country of Origin</span>
              <span className="font-medium">{displayValue(profile.countryOfOrigin?.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Living In</span>
              <span className="font-medium">{displayValue(profile.countryLivingIn?.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">State/Province</span>
              <span className="font-medium">{displayValue(profile.stateProvince?.name)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">City</span>
              <span className="font-medium">{displayValue(profile.city?.name)}</span>
            </div>
            {profile.visaStatus && (
              <div className="flex justify-between">
                <span className="text-gray-500">Visa Status</span>
                <span className="font-medium">{formatMaritalStatus(profile.visaStatus)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Religion & Family */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-green-600" />
              Religion & Family
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Sect</span>
              <span className="font-medium">{displayValue(profile.sect?.label)}</span>
            </div>
            {profile.maslak && (
              <div className="flex justify-between">
                <span className="text-gray-500">Maslak</span>
                <span className="font-medium">{displayValue(profile.maslak?.label)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Religious Practice</span>
              <span className="font-medium">{displayValue(profile.religiousBelonging ? formatMaritalStatus(profile.religiousBelonging) : null)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Social Status</span>
              <span className="font-medium">{displayValue(profile.socialStatus ? formatMaritalStatus(profile.socialStatus) : null)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-green-600" />
              Physical Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Height</span>
              <span className="font-medium">
                {profile.height
                  ? `${profile.height.labelImperial} (${profile.height.labelMetric})`
                  : "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Complexion</span>
              <span className="font-medium">{displayValue(profile.complexion ? formatMaritalStatus(profile.complexion) : null)}</span>
            </div>
            {profile.hasDisability && (
              <div className="flex justify-between">
                <span className="text-gray-500">Disability</span>
                <span className="font-medium">{profile.disabilityDetails || "Yes"}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education & Career */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Education & Career
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Education</span>
              <span className="font-medium">{displayValue(profile.educationLevel?.label)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Field</span>
              <span className="font-medium">{displayValue(profile.educationField?.label)}</span>
            </div>
            {profile.educationDetails && (
              <div className="flex justify-between">
                <span className="text-gray-500">Details</span>
                <span className="font-medium text-right max-w-[60%]">{profile.educationDetails}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Occupation</span>
              <span className="font-medium">{displayValue(profile.occupationType ? formatMaritalStatus(profile.occupationType) : null)}</span>
            </div>
            {profile.occupationDetails && (
              <div className="flex justify-between">
                <span className="text-gray-500">Job Details</span>
                <span className="font-medium text-right max-w-[60%]">{profile.occupationDetails}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Income</span>
              <span className="font-medium">{displayValue(profile.incomeRange?.label)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Family Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-green-600" />
              Family Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Brothers</span>
              <span className="font-medium">
                {profile.numberOfBrothers} ({profile.marriedBrothers} married)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sisters</span>
              <span className="font-medium">
                {profile.numberOfSisters} ({profile.marriedSisters} married)
              </span>
            </div>
            {profile.fatherOccupation && (
              <div className="flex justify-between">
                <span className="text-gray-500">Father&apos;s Occupation</span>
                <span className="font-medium">{profile.fatherOccupation}</span>
              </div>
            )}
            {profile.propertyOwnership && (
              <div className="flex justify-between">
                <span className="text-gray-500">Property</span>
                <span className="font-medium">{profile.propertyOwnership}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-green-600" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.bio ? (
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic">No bio added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
