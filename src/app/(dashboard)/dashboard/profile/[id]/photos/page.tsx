"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  ArrowLeft,
  ImagePlus,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { use } from "react";

interface Photo {
  id: string;
  publicId: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  sortOrder: number;
  rejectionReason: string | null;
}

interface Profile {
  id: string;
  profileFor: string;
  gender: string;
}

const MAX_PHOTOS = 6;
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfilePhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: profileId } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch profile and photos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile to verify ownership
      const profileRes = await fetch(`/api/profile/${profileId}`);
      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          router.push("/dashboard/profiles");
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      // Fetch photos
      const photosRes = await fetch(`/api/photos?profileId=${profileId}`);
      if (!photosRes.ok) {
        throw new Error("Failed to fetch photos");
      }
      const photosData = await photosRes.json();
      setPhotos(photosData.photos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [profileId, router]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, fetchData, router]);

  // Handle successful upload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = async (result: any) => {
    try {
      setUploading(true);
      setError(null);

      const publicId = result.info?.public_id;

      if (!publicId) {
        throw new Error("Upload failed - no public ID returned");
      }

      // Save to database
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          publicId,
          isPrimary: photos.length === 0, // First photo is primary
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save photo");
      }

      setSuccessMessage("Photo uploaded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh photos
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save photo");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete photo
  const handleDelete = async (photoId: string) => {
    try {
      setError(null);

      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete photo");
      }

      setSuccessMessage("Photo deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh photos
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  // Handle set as primary
  const handleSetPrimary = async (photoId: string) => {
    try {
      setError(null);

      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to set primary photo");
      }

      setSuccessMessage("Primary photo updated!");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh photos
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary photo");
    }
  };

  // Get status badge
  const getStatusBadge = (status: Photo["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/profile/${profileId}/edit`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Photos</h1>
          <p className="text-muted-foreground">
            Upload and manage photos for your profile
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>
            You can upload up to {MAX_PHOTOS} photos. Allowed formats:{" "}
            {ALLOWED_FORMATS.join(", ")}. Max size: 5MB per photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length >= MAX_PHOTOS ? (
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-muted-foreground">
                Maximum {MAX_PHOTOS} photos allowed. Delete a photo to upload a new one.
              </p>
            </div>
          ) : (
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              options={{
                maxFiles: 1,
                maxFileSize: MAX_FILE_SIZE,
                clientAllowedFormats: ALLOWED_FORMATS,
                sources: ["local", "camera"],
                multiple: false,
                showAdvancedOptions: false,
                cropping: false,
                showSkipCropButton: false,
              }}
              onSuccess={handleUploadSuccess}
              onError={(error) => {
                console.error("Upload error:", error);
                setError("Upload failed. Please try again.");
              }}
            >
              {({ open }) => (
                <button
                  onClick={() => open()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-3" />
                      <p className="text-muted-foreground">Saving photo...</p>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">Click to upload a photo</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {photos.length} of {MAX_PHOTOS} photos uploaded
                      </p>
                    </>
                  )}
                </button>
              )}
            </CldUploadWidget>
          )}
        </CardContent>
      </Card>

      {/* Photos Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Photos ({photos.length})</CardTitle>
          <CardDescription>
            Click the star to set a photo as your primary profile picture.
            Photos require approval before they become visible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No photos uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first photo to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden border bg-gray-50"
                >
                  {/* Photo */}
                  <div className="aspect-square relative">
                    <Image
                      src={photo.thumbnailUrl || photo.originalUrl}
                      alt="Profile photo"
                      fill
                      className="object-cover"
                    />

                    {/* Primary Badge */}
                    {photo.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Primary
                        </Badge>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(photo.status)}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(photo.id)}
                          title="Set as primary"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            title="Delete photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The photo will be
                              permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(photo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {photo.status === "REJECTED" && photo.rejectionReason && (
                    <div className="p-2 bg-red-50 text-xs text-red-700">
                      <span className="font-medium">Reason:</span>{" "}
                      {photo.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use recent, clear photos that show your face</li>
            <li>• Avoid group photos as your primary image</li>
            <li>• Natural lighting works best</li>
            <li>• Dress modestly and appropriately</li>
            <li>• Photos will be reviewed before becoming visible</li>
            <li>• Blurred versions will be shown to non-connected users</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
