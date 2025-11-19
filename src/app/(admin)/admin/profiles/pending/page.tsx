// import { AdminLayout } from "@/components/admin/AdminLayout";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import Link from "next/link";

export default function PendingProfilesPage() {
  // Placeholder data
  const stats = [
    {
      title: "Pending Today",
      value: "8",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Approved Today",
      value: "12",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Rejected Today",
      value: "3",
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Avg. Review Time",
      value: "24m",
      icon: Timer,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const pendingProfiles = [
    {
      id: 1,
      name: "Tariq Hassan",
      age: 36,
      gender: "Male",
      createdBy: "Self",
      maritalStatus: "Divorced",
      location: "San Francisco, USA",
      submittedAt: "2 hours ago",
      subscription: "GOLD",
      profileFor: "SELF",
      profession: "Finance Manager",
      education: "MBA",
      bio: "Pakistani-American working in Silicon Valley. Looking to start fresh with someone who understands both cultures.",
      photos: 2,
      completeness: 85,
    },
    {
      id: 2,
      name: "Fatima Sheikh",
      age: 25,
      gender: "Female",
      createdBy: "Brother",
      maritalStatus: "Never Married",
      location: "Riyadh, Saudi Arabia",
      submittedAt: "5 hours ago",
      subscription: "FREE",
      profileFor: "SISTER",
      profession: "Graphic Designer",
      education: "Bachelor's",
      bio: "Religious, wears hijab. Looking for practicing Muslim who is educated and family-oriented.",
      photos: 0,
      completeness: 70,
    },
    {
      id: 3,
      name: "Sarah Ahmed",
      age: 39,
      gender: "Female",
      createdBy: "Self",
      maritalStatus: "Widowed",
      location: "Islamabad, Pakistan",
      submittedAt: "1 day ago",
      subscription: "STANDARD",
      profileFor: "SELF",
      profession: "University Professor",
      education: "PhD",
      bio: "Professor and widow with one daughter. Looking for mature, understanding partner.",
      photos: 1,
      completeness: 90,
    },
    {
      id: 4,
      name: "Imran Ali",
      age: 29,
      gender: "Male",
      createdBy: "Mother",
      maritalStatus: "Never Married",
      location: "Dubai, UAE",
      submittedAt: "3 days ago",
      subscription: "SILVER",
      profileFor: "SON",
      profession: "Software Developer",
      education: "Bachelor's in CS",
      bio: "Working in tech industry in Dubai. Family-oriented person looking for a life partner.",
      photos: 3,
      completeness: 95,
    },
    {
      id: 5,
      name: "Zara Khan",
      age: 27,
      gender: "Female",
      createdBy: "Self",
      maritalStatus: "Never Married",
      location: "London, UK",
      submittedAt: "4 days ago",
      subscription: "FREE",
      profileFor: "SELF",
      profession: "Doctor",
      education: "MBBS",
      bio: "British-Pakistani doctor working in NHS. Looking for someone with similar values.",
      photos: 1,
      completeness: 80,
    },
  ];

  const getSubscriptionBadge = (subscription: string) => {
    const styles: Record<string, string> = {
      FREE: "bg-gray-100 text-gray-800",
      STANDARD: "bg-blue-100 text-blue-800",
      SILVER: "bg-gray-100 text-gray-800",
      GOLD: "bg-yellow-100 text-yellow-800",
      PLATINUM: "bg-purple-100 text-purple-800",
    };
    return styles[subscription] || styles.FREE;
  };

  const getMaritalStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Never Married": "bg-green-100 text-green-800",
      Divorced: "bg-orange-100 text-orange-800",
      Widowed: "bg-purple-100 text-purple-800",
      Separated: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-red-600";
  };

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
          <Select defaultValue="oldest">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="completeness">Completeness</SelectItem>
            </SelectContent>
          </Select>
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
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {pendingProfiles.length} profiles awaiting review
                </p>
                <p className="text-sm text-orange-700">
                  Premium users should be prioritized for faster service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Profiles List */}
        <div className="space-y-4">
          {pendingProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">
                            {profile.name}
                          </h3>
                          <Badge
                            className={getSubscriptionBadge(
                              profile.subscription
                            )}
                          >
                            {profile.subscription}
                          </Badge>
                          <Badge
                            className={getMaritalStatusBadge(
                              profile.maritalStatus
                            )}
                          >
                            {profile.maritalStatus}
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
                            {profile.age}y, {profile.gender}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {profile.submittedAt}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            Created by {profile.createdBy}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Profession:</span>{" "}
                            {profile.profession} |
                            <span className="font-medium ml-2">Education:</span>{" "}
                            {profile.education}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {profile.bio}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">
                              Profile Completeness:
                            </span>
                            <span
                              className={`font-bold ${getCompletenessColor(
                                profile.completeness
                              )}`}
                            >
                              {profile.completeness}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">Photos:</span>
                            <span>{profile.photos}</span>
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
                        Review Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="flex-1 lg:flex-none">
                      Quick Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 lg:flex-none text-red-600 hover:text-red-700"
                    >
                      Quick Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Profiles
          </Button>
        </div>
      </div>
    </>
  );
}
