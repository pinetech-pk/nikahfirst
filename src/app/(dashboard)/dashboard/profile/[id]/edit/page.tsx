"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Camera, User, Trash2, ChevronRight, Eye, Loader2 } from "lucide-react";

interface ProfileData {
  id: string;
  profileFor: string;
  gender: string;
  _count: {
    photos: number;
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?id=${profileId}`);
        const json = await res.json();

        if (!json.profile) {
          router.push("/dashboard/profiles");
          return;
        }

        setProfile({
          id: json.profile.id,
          profileFor: json.profile.profileFor,
          gender: json.profile.gender,
          _count: {
            photos: json.profile._count?.photos || 0,
          },
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, router]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/profile?id=${profileId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (res.ok) {
        router.push("/dashboard/profiles");
      } else {
        setDeleteError(json.error || "Failed to delete profile");
      }
    } catch (error) {
      setDeleteError("Failed to delete profile. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const profileTitle =
    profile.profileFor === "SELF"
      ? "My Profile"
      : `Profile for ${profile.profileFor.charAt(0) + profile.profileFor.slice(1).toLowerCase()}`;

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

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage &quot;{profileTitle}&quot;
          </p>
        </div>
        <Link href={`/dashboard/profile/${profileId}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </Link>
      </div>

      {/* Edit Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Photos Section */}
        <Link href={`/dashboard/profile/${profileId}/photos`} className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="mt-4">Manage Photos</CardTitle>
              <CardDescription>
                Upload, replace, or delete your profile photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {profile._count.photos} / 6 photos
                </span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Profile Information Section */}
        <Link href={`/dashboard/profile/${profileId}/edit/information`} className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <CardTitle className="mt-4">Profile Information</CardTitle>
              <CardDescription>
                Update your personal details, education, career, and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Basic Information</li>
                <li>Origin & Background</li>
                <li>Location Details</li>
                <li>Religion & Family</li>
                <li>Physical Attributes</li>
                <li>Education & Career</li>
                <li>Bio & Visibility</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Delete Profile Section */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">Delete Profile</CardTitle>
              <CardDescription className="text-red-600">
                Permanently delete this profile and all associated data including photos, views, and connections.
                This action cannot be undone.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {deleteError && (
            <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
              {deleteError}
            </div>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Profile
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your profile
                  &quot;{profileTitle}&quot; and remove all associated data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All uploaded photos</li>
                    <li>Profile views and visitor history</li>
                    <li>Sent and received connection requests</li>
                    <li>All profile information</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, delete profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
