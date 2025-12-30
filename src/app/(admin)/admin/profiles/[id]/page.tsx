"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User,
  MapPin,
  Calendar,
  Heart,
  GraduationCap,
  Briefcase,
  Users,
  Globe,
  Moon,
  Languages,
  Ruler,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Edit,
  Ban,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Photo {
  id: string;
  publicId: string;
  originalUrl: string;
  blurredUrl: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  isPrivate: boolean;
  status: string;
  moderatedAt: string | null;
  rejectionReason: string | null;
  sortOrder: number;
}

interface Profile {
  id: string;
  userId: string;
  profileFor: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  numberOfChildren: number;
  childrenLivingWith: string | null;
  bio: string | null;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
  moderationStatus: string;
  moderatedAt: string | null;
  rejectionReason: string | null;
  isPublished: boolean;
  isVerified: boolean;
  isActive: boolean;
  countryOfOrigin: { id: string; name: string } | null;
  countryLivingIn: { id: string; name: string } | null;
  stateProvince: { id: string; name: string } | null;
  city: { id: string; name: string } | null;
  visaStatus: string | null;
  origin: { id: string; label: string } | null;
  ethnicity: { id: string; label: string } | null;
  caste: { id: string; label: string } | null;
  customCaste: string | null;
  sect: { id: string; label: string } | null;
  maslak: { id: string; label: string } | null;
  religiousBelonging: string | null;
  socialStatus: string | null;
  numberOfBrothers: number;
  numberOfSisters: number;
  marriedBrothers: number;
  marriedSisters: number;
  fatherOccupation: string | null;
  propertyOwnership: string | null;
  height: { id: string; labelImperial: string; centimeters: number } | null;
  complexion: string | null;
  hasDisability: boolean;
  disabilityDetails: string | null;
  educationLevel: { id: string; label: string } | null;
  educationField: { id: string; label: string } | null;
  educationDetails: string | null;
  occupationType: string | null;
  occupationDetails: string | null;
  incomeRange: { id: string; label: string } | null;
  motherTongue: { id: string; label: string } | null;
  otherMotherTongue: string | null;
  photos: Photo[];
  verification: {
    isVerified: boolean;
    verificationLevel: number;
  } | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    subscription: string;
    status: string;
    createdAt: string;
  };
}

const STATUS_BADGES: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800", icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle },
  BANNED: { label: "Banned", className: "bg-gray-800 text-white", icon: Ban },
};

export default function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [resolvedParams.id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        setError("Profile not found");
      } else {
        setError("Failed to fetch profile");
      }
    } catch (err) {
      setError("An error occurred");
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/profiles");
      } else {
        setError("Failed to delete profile");
      }
    } catch (err) {
      setError("An error occurred while deleting");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Helper functions
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatEnum = (value: string | null) => {
    if (!value) return "Not specified";
    return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getSubscriptionBadge = (subscription: string) => {
    const styles: Record<string, string> = {
      FREE: "bg-gray-100 text-gray-800",
      STANDARD: "bg-blue-100 text-blue-800",
      SILVER: "bg-gray-200 text-gray-900",
      GOLD: "bg-yellow-100 text-yellow-800",
      PLATINUM: "bg-purple-100 text-purple-800",
      PRO: "bg-indigo-100 text-indigo-800",
    };
    return styles[subscription] || styles.FREE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <XCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-600">{error || "Profile not found"}</p>
        <Link href="/admin/profiles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_BADGES[profile.moderationStatus];
  const StatusIcon = statusConfig?.icon || Clock;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/profiles">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
                <Badge className={statusConfig?.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig?.label}
                </Badge>
                {profile.verification?.isVerified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Created {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.moderationStatus === "PENDING" && (
              <Link href={`/admin/profiles/${profile.id}/review`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Review Profile
                </Button>
              </Link>
            )}
            <Link href={`/admin/users/regular/${profile.user.id}`}>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View User
              </Button>
            </Link>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Profile For</p>
                    <p className="font-medium">{formatEnum(profile.profileFor)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{profile.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{calculateAge(profile.dateOfBirth)} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{format(new Date(profile.dateOfBirth), "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium">{formatEnum(profile.maritalStatus)}</p>
                  </div>
                  {profile.numberOfChildren > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Children</p>
                      <p className="font-medium">
                        {profile.numberOfChildren}
                        {profile.childrenLivingWith && ` (${formatEnum(profile.childrenLivingWith)})`}
                      </p>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Bio</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Country of Origin</p>
                    <p className="font-medium">{profile.countryOfOrigin?.name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Living In</p>
                    <p className="font-medium">{profile.countryLivingIn?.name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State/Province</p>
                    <p className="font-medium">{profile.stateProvince?.name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{profile.city?.name || "Not specified"}</p>
                  </div>
                  {profile.visaStatus && (
                    <div>
                      <p className="text-sm text-gray-500">Visa Status</p>
                      <p className="font-medium">{formatEnum(profile.visaStatus)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Background Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Origin</p>
                    <p className="font-medium">{profile.origin?.label || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ethnicity</p>
                    <p className="font-medium">{profile.ethnicity?.label || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Caste</p>
                    <p className="font-medium">
                      {profile.caste?.label || profile.customCaste || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sect</p>
                    <p className="font-medium">{profile.sect?.label || "Not specified"}</p>
                  </div>
                  {profile.maslak && (
                    <div>
                      <p className="text-sm text-gray-500">Maslak</p>
                      <p className="font-medium">{profile.maslak.label}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Mother Tongue</p>
                    <p className="font-medium">
                      {profile.motherTongue?.label || profile.otherMotherTongue || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education & Career Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education & Career
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Education Level</p>
                    <p className="font-medium">{profile.educationLevel?.label || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Field of Study</p>
                    <p className="font-medium">{profile.educationField?.label || "Not specified"}</p>
                  </div>
                  {profile.educationDetails && (
                    <div>
                      <p className="text-sm text-gray-500">Education Details</p>
                      <p className="font-medium">{profile.educationDetails}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">{formatEnum(profile.occupationType)}</p>
                  </div>
                  {profile.occupationDetails && (
                    <div>
                      <p className="text-sm text-gray-500">Occupation Details</p>
                      <p className="font-medium">{profile.occupationDetails}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Income Range</p>
                    <p className="font-medium">{profile.incomeRange?.label || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Social Status</p>
                    <p className="font-medium">{formatEnum(profile.socialStatus)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Brothers</p>
                    <p className="font-medium">
                      {profile.numberOfBrothers} ({profile.marriedBrothers} married)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sisters</p>
                    <p className="font-medium">
                      {profile.numberOfSisters} ({profile.marriedSisters} married)
                    </p>
                  </div>
                  {profile.fatherOccupation && (
                    <div>
                      <p className="text-sm text-gray-500">Father&apos;s Occupation</p>
                      <p className="font-medium">{profile.fatherOccupation}</p>
                    </div>
                  )}
                  {profile.propertyOwnership && (
                    <div>
                      <p className="text-sm text-gray-500">Property</p>
                      <p className="font-medium">{formatEnum(profile.propertyOwnership)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Physical Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Physical Attributes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="font-medium">
                      {profile.height
                        ? `${profile.height.labelImperial} (${profile.height.centimeters} cm)`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Complexion</p>
                    <p className="font-medium">{formatEnum(profile.complexion)}</p>
                  </div>
                  {profile.hasDisability && (
                    <div>
                      <p className="text-sm text-gray-500">Disability</p>
                      <p className="font-medium">{profile.disabilityDetails || "Yes"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photos ({profile.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.photos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No photos uploaded</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.originalUrl || photo.thumbnailUrl || ""}
                          alt="Profile photo"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {photo.isPrimary && (
                            <Badge className="bg-blue-600 text-xs">Primary</Badge>
                          )}
                          {photo.isPrivate && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge
                            className={
                              photo.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : photo.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {photo.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {(profile.user.name || profile.user.email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{profile.user.name || "No name"}</p>
                    <Badge className={getSubscriptionBadge(profile.user.subscription)}>
                      {profile.user.subscription}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{profile.user.email}</span>
                  </div>
                  {profile.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{profile.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Joined {format(new Date(profile.user.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>

                <Separator />

                <Link href={`/admin/users/regular/${profile.user.id}`}>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completion</span>
                    <span className="font-medium">{profile.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        profile.profileCompletion >= 90
                          ? "bg-green-500"
                          : profile.profileCompletion >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${profile.profileCompletion}%` }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Photos</span>
                    <span className="font-medium">{profile.photos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Published</span>
                    <span className="font-medium">{profile.isPublished ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active</span>
                    <span className="font-medium">{profile.isActive ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moderation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge className={statusConfig?.className}>
                      {statusConfig?.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{format(new Date(profile.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  {profile.moderatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Moderated</span>
                      <span>{format(new Date(profile.moderatedAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span>{format(new Date(profile.updatedAt), "MMM d, yyyy")}</span>
                  </div>
                </div>

                {profile.rejectionReason && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-600">{profile.rejectionReason}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone.
              <br />
              <br />
              <strong>Note:</strong> The user account will remain active. Only the profile and
              associated photos will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 px-4 bg-gray-50 rounded-md text-sm">
            <p>
              <strong>User:</strong> {profile.user.name || profile.user.email}
            </p>
            <p>
              <strong>Email:</strong> {profile.user.email}
            </p>
            <p>
              <strong>Photos:</strong> {profile.photos.length} photo(s) will be deleted
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
