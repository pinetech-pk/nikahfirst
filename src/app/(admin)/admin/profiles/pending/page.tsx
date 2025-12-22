"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleStatsCard } from "@/components/ui/stats-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  User,
  MapPin,
  Calendar,
  Heart,
  Eye,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Photo {
  id: string;
  thumbnailUrl: string;
  status: string;
  isPrimary: boolean;
}

interface Profile {
  id: string;
  profileFor: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  bio: string | null;
  profileCompletion: number;
  createdAt: string;
  occupationType: string | null;
  occupationDetails: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionTier: string;
  };
  photos: Photo[];
  countryLivingIn: { label: string } | null;
  city: { label: string } | null;
  educationLevel: { label: string } | null;
  educationField: { label: string } | null;
}

interface ApiResponse {
  profiles: Profile[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    banned: number;
  };
  todayStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function PendingProfilesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [sort, setSort] = useState("oldest");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Quick reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/profiles?status=PENDING&sort=${sort}&page=${page}&limit=20`
      );
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [sort, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleQuickApprove = async (profileId: string) => {
    setActionLoading(profileId);
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (response.ok) {
        fetchProfiles();
      }
    } catch (error) {
      console.error("Failed to approve profile:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickReject = async () => {
    if (!selectedProfileId || !rejectReason.trim()) return;

    setActionLoading(selectedProfileId);
    try {
      const response = await fetch(`/api/admin/profiles/${selectedProfileId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", feedback: rejectReason }),
      });
      if (response.ok) {
        setRejectDialogOpen(false);
        setRejectReason("");
        setSelectedProfileId(null);
        fetchProfiles();
      }
    } catch (error) {
      console.error("Failed to reject profile:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;

    setActionLoading(profileToDelete.id);
    try {
      const response = await fetch(`/api/admin/profiles/${profileToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        setProfileToDelete(null);
        fetchProfiles();
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (profileId: string) => {
    setSelectedProfileId(profileId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const openDeleteDialog = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const getSubscriptionBadge = (subscription: string) => {
    const styles: Record<string, string> = {
      FREE: "bg-gray-100 text-gray-800",
      STANDARD: "bg-blue-100 text-blue-800",
      SILVER: "bg-gray-100 text-gray-800",
      GOLD: "bg-yellow-100 text-yellow-800",
      PLATINUM: "bg-purple-100 text-purple-800",
      PRO: "bg-indigo-100 text-indigo-800",
    };
    return styles[subscription] || styles.FREE;
  };

  const getMaritalStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEVER_MARRIED: "bg-green-100 text-green-800",
      DIVORCED: "bg-orange-100 text-orange-800",
      WIDOWED: "bg-purple-100 text-purple-800",
      SEPARATED: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const formatMaritalStatus = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-red-600";
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

  const getLocation = (profile: Profile) => {
    const parts = [];
    if (profile.city?.label) parts.push(profile.city.label);
    if (profile.countryLivingIn?.label) parts.push(profile.countryLivingIn.label);
    return parts.join(", ") || "Not specified";
  };

  const getEducation = (profile: Profile) => {
    const parts = [];
    if (profile.educationLevel?.label) parts.push(profile.educationLevel.label);
    if (profile.educationField?.label) parts.push(`in ${profile.educationField.label}`);
    return parts.join(" ") || "Not specified";
  };

  const stats = data ? [
    {
      title: "Pending Today",
      value: data.todayStats.pending.toString(),
      icon: Clock,
      iconColor: "bg-orange-100 text-orange-600",
    },
    {
      title: "Approved Today",
      value: data.todayStats.approved.toString(),
      icon: CheckCircle,
      iconColor: "bg-green-100 text-green-600",
    },
    {
      title: "Rejected Today",
      value: data.todayStats.rejected.toString(),
      icon: XCircle,
      iconColor: "bg-red-100 text-red-600",
    },
    {
      title: "Total Pending",
      value: data.counts.pending.toString(),
      icon: Timer,
      iconColor: "bg-blue-100 text-blue-600",
    },
  ] : [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pending Profile Approvals
            </h1>
            <p className="text-gray-600 mt-1">
              Review and approve user profiles waiting for verification
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchProfiles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Select value={sort} onValueChange={(value) => { setSort(value); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="completeness">Completeness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <SimpleStatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                iconColor={stat.iconColor}
              />
            ))}
          </div>
        )}

        {/* Alert */}
        {data && data.counts.pending > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">
                    {data.counts.pending} profile{data.counts.pending !== 1 ? "s" : ""} awaiting review
                  </p>
                  <p className="text-sm text-orange-700">
                    Premium users should be prioritized for faster service
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {data && data.profiles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                There are no pending profiles to review at the moment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending Profiles List */}
        <div className="space-y-4">
          {data?.profiles.map((profile) => (
            <Card
              key={profile.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                        {profile.photos.length > 0 && profile.photos[0].thumbnailUrl ? (
                          <img
                            src={profile.photos[0].thumbnailUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (profile.user.name || profile.user.email)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold">
                            {profile.user.name || profile.user.email.split("@")[0]}
                          </h3>
                          <Badge className={getSubscriptionBadge(profile.user.subscriptionTier)}>
                            {profile.user.subscriptionTier}
                          </Badge>
                          <Badge className={getMaritalStatusBadge(profile.maritalStatus)}>
                            {formatMaritalStatus(profile.maritalStatus)}
                          </Badge>
                          {profile.profileFor !== "SELF" && (
                            <Badge variant="outline">
                              For {profile.profileFor.toLowerCase()}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {calculateAge(profile.dateOfBirth)}y, {profile.gender}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {getLocation(profile)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            Profile for {profile.profileFor.toLowerCase()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Profession:</span>{" "}
                            {profile.occupationType?.replace(/_/g, " ") || "Not specified"}{" "}
                            {profile.occupationDetails && `(${profile.occupationDetails})`}
                            {" | "}
                            <span className="font-medium">Education:</span>{" "}
                            {getEducation(profile)}
                          </p>
                          {profile.bio && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {profile.bio}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">Profile Completeness:</span>
                            <span className={`font-bold ${getCompletenessColor(profile.profileCompletion)}`}>
                              {profile.profileCompletion}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">Photos:</span>
                            <span>{profile.photos.length}</span>
                            {profile.photos.length > 0 && (
                              <span className="text-gray-500">
                                ({profile.photos.filter(p => p.status === "PENDING").length} pending)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Link
                      href={`/admin/profiles/${profile.id}/review`}
                      className="flex-1 lg:flex-none"
                    >
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="flex-1 lg:flex-none"
                      onClick={() => handleQuickApprove(profile.id)}
                      disabled={actionLoading === profile.id}
                    >
                      {actionLoading === profile.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
                      onClick={() => openRejectDialog(profile.id)}
                      disabled={actionLoading === profile.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-600"
                      onClick={() => openDeleteDialog(profile)}
                      disabled={actionLoading === profile.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this profile. This feedback will be sent to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Rejection Reason *</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g., Profile contains inappropriate content, incomplete information, fake details..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleQuickReject}
              disabled={!rejectReason.trim() || actionLoading !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Rejecting..." : "Reject Profile"}
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
              <strong>Note:</strong> The user account will remain active. Only the profile and associated photos will be deleted. The user can create a new profile if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {profileToDelete && (
            <div className="py-2 px-4 bg-gray-50 rounded-md text-sm">
              <p><strong>User:</strong> {profileToDelete.user.name || profileToDelete.user.email}</p>
              <p><strong>Email:</strong> {profileToDelete.user.email}</p>
              <p><strong>Photos:</strong> {profileToDelete.photos.length} photo(s) will be deleted</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={actionLoading !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Deleting..." : "Delete Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
