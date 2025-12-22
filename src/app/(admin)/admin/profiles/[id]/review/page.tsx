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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
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
  Ban,
  Trash2,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
  Eye,
  EyeOff,
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
  // Location
  countryOfOrigin: { id: string; name: string } | null;
  countryLivingIn: { id: string; name: string } | null;
  stateProvince: { id: string; name: string } | null;
  city: { id: string; name: string } | null;
  visaStatus: string | null;
  // Origin & Ethnicity
  origin: { id: string; label: string } | null;
  ethnicity: { id: string; label: string } | null;
  caste: { id: string; label: string } | null;
  customCaste: string | null;
  // Religious
  sect: { id: string; label: string } | null;
  maslak: { id: string; label: string } | null;
  religiousBelonging: string | null;
  // Family
  socialStatus: string | null;
  numberOfBrothers: number;
  numberOfSisters: number;
  marriedBrothers: number;
  marriedSisters: number;
  fatherOccupation: string | null;
  propertyOwnership: string | null;
  // Physical
  height: { id: string; labelImperial: string; centimeters: number } | null;
  complexion: string | null;
  hasDisability: boolean;
  disabilityDetails: string | null;
  // Education & Career
  educationLevel: { id: string; label: string } | null;
  educationField: { id: string; label: string } | null;
  educationDetails: string | null;
  occupationType: string | null;
  occupationDetails: string | null;
  incomeRange: { id: string; label: string } | null;
  // Language
  motherTongue: { id: string; label: string } | null;
  otherMotherTongue: string | null;
  // Photos
  photos: Photo[];
  // User
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

export default function ProfileReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [photoActionLoading, setPhotoActionLoading] = useState<string | null>(null);

  // Moderation state
  const [feedback, setFeedback] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Photo reject state
  const [photoRejectDialogOpen, setPhotoRejectDialogOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [photoRejectReason, setPhotoRejectReason] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/admin/profiles/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          router.push("/admin/profiles/pending");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [resolvedParams.id, router]);

  const handleModeration = async (action: "approve" | "reject" | "ban") => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback }),
      });
      if (response.ok) {
        router.push("/admin/profiles/pending");
      }
    } catch (error) {
      console.error("Failed to moderate profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/admin/profiles/pending");
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePhotoModeration = async (photoId: string, action: "approve" | "reject", reason?: string) => {
    if (!profile) return;
    setPhotoActionLoading(photoId);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (response.ok) {
        // Refresh profile data
        const refreshResponse = await fetch(`/api/admin/profiles/${profile.id}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setProfile(data);
        }
      }
    } catch (error) {
      console.error("Failed to moderate photo:", error);
    } finally {
      setPhotoActionLoading(null);
      setPhotoRejectDialogOpen(false);
      setPhotoRejectReason("");
      setSelectedPhotoId(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!profile) return;
    setPhotoActionLoading(photoId);
    try {
      const response = await fetch(`/api/admin/profiles/${profile.id}/photos/${photoId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Refresh profile data
        const refreshResponse = await fetch(`/api/admin/profiles/${profile.id}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setProfile(data);
        }
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    } finally {
      setPhotoActionLoading(null);
    }
  };

  const openPhotoRejectDialog = (photoId: string) => {
    setSelectedPhotoId(photoId);
    setPhotoRejectReason("");
    setPhotoRejectDialogOpen(true);
  };

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

  const formatEnumValue = (value: string | null) => {
    if (!value) return "Not specified";
    return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; icon: React.ReactNode }> = {
      PENDING: { className: "bg-orange-100 text-orange-800", icon: <Clock className="h-3 w-3" /> },
      APPROVED: { className: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { className: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
      BANNED: { className: "bg-gray-800 text-white", icon: <Ban className="h-3 w-3" /> },
    };
    const style = styles[status] || styles.PENDING;
    return (
      <Badge className={`${style.className} flex items-center gap-1`}>
        {style.icon}
        {status}
      </Badge>
    );
  };

  const getPhotoStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-orange-100 text-orange-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return styles[status] || styles.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
        <Link href="/admin/profiles/pending">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pending Profiles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/profiles/pending">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Profile</h1>
            <p className="text-gray-600">
              Review all profile information before making a decision
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(profile.moderationStatus)}
          <Badge variant="outline">
            {profile.profileCompletion}% Complete
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Profile For</p>
                  <p className="font-medium">{formatEnumValue(profile.profileFor)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="font-medium">{formatEnumValue(profile.gender)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="font-medium">
                    {calculateAge(profile.dateOfBirth)} years
                    <span className="text-gray-500 text-sm ml-1">
                      ({format(new Date(profile.dateOfBirth), "MMM d, yyyy")})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Marital Status</p>
                  <p className="font-medium">{formatEnumValue(profile.maritalStatus)}</p>
                </div>
                {profile.numberOfChildren > 0 && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Children</p>
                      <p className="font-medium">{profile.numberOfChildren}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Living With</p>
                      <p className="font-medium">{profile.childrenLivingWith || "Not specified"}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
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
                  <p className="text-sm font-medium text-gray-500">Country of Origin</p>
                  <p className="font-medium">{profile.countryOfOrigin?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Currently Living In</p>
                  <p className="font-medium">{profile.countryLivingIn?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">State/Province</p>
                  <p className="font-medium">{profile.stateProvince?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="font-medium">{profile.city?.name || "Not specified"}</p>
                </div>
                {profile.visaStatus && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Visa Status</p>
                    <p className="font-medium">{formatEnumValue(profile.visaStatus)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Origin & Ethnicity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Origin & Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Origin</p>
                  <p className="font-medium">{profile.origin?.label || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ethnicity</p>
                  <p className="font-medium">{profile.ethnicity?.label || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Caste</p>
                  <p className="font-medium">
                    {profile.caste?.label || profile.customCaste || "Not specified"}
                    {profile.customCaste && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Religious */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Religious Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sect</p>
                  <p className="font-medium">{profile.sect?.label || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Maslak</p>
                  <p className="font-medium">{profile.maslak?.label || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Religious Belonging</p>
                  <p className="font-medium">{formatEnumValue(profile.religiousBelonging)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Social Status</p>
                  <p className="font-medium">{formatEnumValue(profile.socialStatus)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Brothers</p>
                  <p className="font-medium">
                    {profile.numberOfBrothers} ({profile.marriedBrothers} married)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sisters</p>
                  <p className="font-medium">
                    {profile.numberOfSisters} ({profile.marriedSisters} married)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Father's Occupation</p>
                  <p className="font-medium">{profile.fatherOccupation || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Property Ownership</p>
                  <p className="font-medium">{profile.propertyOwnership || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Attributes */}
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
                  <p className="text-sm font-medium text-gray-500">Height</p>
                  <p className="font-medium">
                    {profile.height ? `${profile.height.labelImperial} (${profile.height.centimeters} cm)` : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Complexion</p>
                  <p className="font-medium">{formatEnumValue(profile.complexion)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Disability</p>
                  <p className="font-medium">
                    {profile.hasDisability ? (
                      <span className="text-orange-600">
                        Yes - {profile.disabilityDetails || "Details not provided"}
                      </span>
                    ) : (
                      "No"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
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
                  <p className="text-sm font-medium text-gray-500">Education Level</p>
                  <p className="font-medium">{profile.educationLevel?.label || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Field of Study</p>
                  <p className="font-medium">{profile.educationField?.label || "Not specified"}</p>
                </div>
                {profile.educationDetails && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Education Details</p>
                    <p className="font-medium">{profile.educationDetails}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Occupation Type</p>
                  <p className="font-medium">{formatEnumValue(profile.occupationType)}</p>
                </div>
                {profile.occupationDetails && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Occupation Details</p>
                    <p className="font-medium">{profile.occupationDetails}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Income Range</p>
                  <p className="font-medium">{profile.incomeRange?.label || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium text-gray-500">Mother Tongue</p>
                <p className="font-medium">
                  {profile.motherTongue?.label || profile.otherMotherTongue || "Not specified"}
                  {profile.otherMotherTongue && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Photos Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Photos ({profile.photos.length})
              </CardTitle>
              <CardDescription>
                Review and moderate each photo individually
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No photos uploaded</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg overflow-hidden">
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={photo.originalUrl}
                          alt="Profile photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className={getPhotoStatusBadge(photo.status)}>
                            {photo.status}
                          </Badge>
                          {photo.isPrimary && (
                            <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                          )}
                          {photo.isPrivate && (
                            <Badge className="bg-gray-100 text-gray-800">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {photo.rejectionReason && (
                          <p className="text-sm text-red-600">
                            <strong>Rejected:</strong> {photo.rejectionReason}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handlePhotoModeration(photo.id, "approve")}
                            disabled={photoActionLoading === photo.id || photo.status === "APPROVED"}
                          >
                            {photoActionLoading === photo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700"
                            onClick={() => openPhotoRejectDialog(photo.id)}
                            disabled={photoActionLoading === photo.id || photo.status === "REJECTED"}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeletePhoto(photo.id)}
                            disabled={photoActionLoading === photo.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile.user.email}</span>
              </div>
              {profile.user.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.user.name}</span>
                </div>
              )}
              {profile.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.user.phone}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subscription</span>
                <Badge variant="outline">{profile.user.subscription}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Status</span>
                <Badge variant="outline">{profile.user.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Created</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(profile.user.createdAt), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Moderation Status</span>
                {getStatusBadge(profile.moderationStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Verified</span>
                <Badge variant={profile.isVerified ? "default" : "outline"}>
                  {profile.isVerified ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Published</span>
                <Badge variant={profile.isPublished ? "default" : "outline"}>
                  {profile.isPublished ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active</span>
                <Badge variant={profile.isActive ? "default" : "outline"}>
                  {profile.isActive ? "Yes" : "No"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Updated</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}
                </span>
              </div>
              {profile.moderatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Moderated</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(profile.moderatedAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Previous Rejection Reason */}
          {profile.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Previous Rejection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{profile.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Moderation Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Moderation Actions</CardTitle>
              <CardDescription>
                Take action on this profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback / Notes (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Add any feedback or notes..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleModeration("approve")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-gray-700"
                  onClick={() => setBanDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban Profile
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm you want to reject this profile.
              {feedback && (
                <span className="block mt-2">
                  <strong>Feedback:</strong> {feedback}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleModeration("reject")}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban this profile? This is a serious action that will permanently hide this profile from the platform.
              {feedback && (
                <span className="block mt-2">
                  <strong>Reason:</strong> {feedback}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleModeration("ban")}
              className="bg-gray-800 hover:bg-gray-900"
            >
              Ban Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this profile? This action cannot be undone.
              <br /><br />
              <strong>Note:</strong> The user account will remain active. Only the profile and associated photos will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 px-4 bg-gray-50 rounded-md text-sm">
            <p><strong>User:</strong> {profile.user.name || profile.user.email}</p>
            <p><strong>Photos:</strong> {profile.photos.length} photo(s) will be deleted</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Photo Reject Dialog */}
      <AlertDialog open={photoRejectDialogOpen} onOpenChange={setPhotoRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this photo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="photo-reject-reason">Rejection Reason</Label>
            <Textarea
              id="photo-reject-reason"
              placeholder="e.g., Inappropriate content, low quality, not a real photo..."
              value={photoRejectReason}
              onChange={(e) => setPhotoRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPhotoId && handlePhotoModeration(selectedPhotoId, "reject", photoRejectReason)}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
