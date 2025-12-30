"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { SimpleStatsCard } from "@/components/ui/stats-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Filter,
  X,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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
  moderationStatus: string;
  createdAt: string;
  moderatedAt: string | null;
  isVerified: boolean;
  occupationType: string | null;
  occupationDetails: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    subscription: string;
  };
  photos: Photo[];
  countryLivingIn: { name: string } | null;
  city: { name: string } | null;
  educationLevel: { label: string } | null;
  educationField: { label: string } | null;
  verification: {
    isVerified: boolean;
    verificationLevel: number;
  } | null;
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
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    banned: number;
    verified: number;
  };
  todayStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED" | "BANNED" | "verified";

const STATUS_TABS: { value: StatusFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Profiles", icon: Users },
  { value: "PENDING", label: "Pending", icon: Clock },
  { value: "APPROVED", label: "Approved", icon: CheckCircle },
  { value: "REJECTED", label: "Rejected", icon: XCircle },
  { value: "verified", label: "Verified", icon: ShieldCheck },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" },
  BANNED: { label: "Banned", className: "bg-gray-800 text-white" },
};

function ProfilesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialStatus = (searchParams.get("status") as StatusFilter) || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialGender = searchParams.get("gender") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(initialPage);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  const updateURL = useCallback(
    (newStatus: StatusFilter, newSearch: string, newGender: string, newPage: number) => {
      const params = new URLSearchParams();
      if (newStatus !== "all") params.set("status", newStatus);
      if (newSearch) params.set("search", newSearch);
      if (newGender) params.set("gender", newGender);
      if (newPage > 1) params.set("page", newPage.toString());
      const queryString = params.toString();
      router.push(`/admin/profiles${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router]
  );

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Handle status - "verified" is special
      if (statusFilter === "verified") {
        params.set("verified", "true");
      } else if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (searchQuery) params.set("search", searchQuery);
      if (genderFilter) params.set("gender", genderFilter);
      params.set("sort", sort);
      params.set("page", page.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/admin/profiles?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, genderFilter, sort, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
    updateURL(value, searchQuery, genderFilter, 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateURL(statusFilter, searchQuery, genderFilter, 1);
    fetchProfiles();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setGenderFilter("");
    setPage(1);
    updateURL(statusFilter, "", "", 1);
  };

  const hasActiveFilters = searchQuery || genderFilter;

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

  const getLocation = (profile: Profile) => {
    const parts = [];
    if (profile.city?.name) parts.push(profile.city.name);
    if (profile.countryLivingIn?.name) parts.push(profile.countryLivingIn.name);
    return parts.join(", ") || "Not specified";
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

  const getMaritalStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Stats cards
  const statsCards = data
    ? [
        {
          title: "Total Profiles",
          value: data.counts.total.toString(),
          icon: Users,
          iconColor: "bg-blue-100 text-blue-600",
        },
        {
          title: "Pending",
          value: data.counts.pending.toString(),
          icon: Clock,
          iconColor: "bg-yellow-100 text-yellow-600",
        },
        {
          title: "Approved",
          value: data.counts.approved.toString(),
          icon: CheckCircle,
          iconColor: "bg-green-100 text-green-600",
        },
        {
          title: "Verified",
          value: data.counts.verified.toString(),
          icon: ShieldCheck,
          iconColor: "bg-purple-100 text-purple-600",
        },
      ]
    : [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Profiles</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage all matrimonial profiles
          </p>
        </div>
        <Button variant="outline" onClick={fetchProfiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
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

      {/* Profiles Card */}
      <Card>
        <CardHeader className="pb-4">
          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={(v) => handleStatusChange(v as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {data && tab.value !== "all" && tab.value !== "verified" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {data.counts[tab.value.toLowerCase() as keyof typeof data.counts]}
                    </Badge>
                  )}
                  {data && tab.value === "verified" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {data.counts.verified}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, city..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="completeness">Completeness</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 p-4 mt-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genders</SelectItem>
                    <SelectItem value="MALE">Male (Groom)</SelectItem>
                    <SelectItem value="FEMALE">Female (Bride)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Results count */}
          {data && (
            <p className="text-sm text-gray-600 mb-4">
              Showing {data.profiles.length} of {data.pagination.totalCount} profiles
            </p>
          )}

          {/* Empty State */}
          {data && data.profiles.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No profiles found</h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "No profiles match the current status filter"}
              </p>
            </div>
          )}

          {/* Profiles Table */}
          {data && data.profiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Profile</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Completeness</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.profiles.map((profile) => {
                    const statusConfig = STATUS_BADGES[profile.moderationStatus];
                    return (
                      <tr key={profile.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                              {profile.photos.length > 0 && profile.photos[0].thumbnailUrl ? (
                                <img
                                  src={profile.photos[0].thumbnailUrl}
                                  alt=""
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
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {profile.user.name || profile.user.email.split("@")[0]}
                                </p>
                                {profile.verification?.isVerified && (
                                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{profile.user.email}</p>
                              <Badge className={`${getSubscriptionBadge(profile.user.subscription)} text-xs mt-1`}>
                                {profile.user.subscription}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={statusConfig?.className || "bg-gray-100"}>
                            {statusConfig?.label || profile.moderationStatus}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="h-3 w-3" />
                              {calculateAge(profile.dateOfBirth)}y, {profile.gender},{" "}
                              {getMaritalStatusLabel(profile.maritalStatus)}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {getLocation(profile)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
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
                            <span className={`text-sm font-medium ${getCompletenessColor(profile.profileCompletion)}`}>
                              {profile.profileCompletion}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {profile.photos.length} photo{profile.photos.length !== 1 ? "s" : ""}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm">
                              {format(new Date(profile.createdAt), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(profile.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/profiles/${profile.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            {profile.moderationStatus === "PENDING" && (
                              <Link href={`/admin/profiles/${profile.id}/review`}>
                                <Button size="sm">Review</Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    updateURL(statusFilter, searchQuery, genderFilter, Math.max(1, page - 1));
                  }}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.min(data.pagination.totalPages, p + 1));
                    updateURL(
                      statusFilter,
                      searchQuery,
                      genderFilter,
                      Math.min(data.pagination.totalPages, page + 1)
                    );
                  }}
                  disabled={page === data.pagination.totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      }
    >
      <ProfilesPageContent />
    </Suspense>
  );
}
