"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ImagePlus, Camera, CheckCircle2 } from "lucide-react";

export default function ProfilePhotosPage() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a profile (include completed profiles)
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/profile?includeCompleted=true");
        const json = await res.json();
        if (!json.profile) {
          // No profile, redirect to create one
          router.push("/profile/create");
          return;
        }
        setHasProfile(true);
      } catch (error) {
        console.error("Failed to check profile:", error);
        setHasProfile(false);
      }
    };

    checkProfile();
  }, [router]);

  if (hasProfile === null) {
    return (
      <div className="container mx-auto max-w-3xl py-10 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      {/* Back to Dashboard Link */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Success Message */}
      <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Profile Created Successfully!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your profile details have been saved. Now add photos to complete your profile.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle>Add Your Photos</CardTitle>
          <CardDescription>
            Upload photos to make your profile more attractive to potential matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder UI for photo upload */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <ImagePlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Photo Upload Coming Soon</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              We&apos;re working on the photo upload feature. Soon you&apos;ll be able to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Upload up to 6 photos
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Set a primary profile photo
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Control photo privacy (blurred for non-connections)
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              For now, your profile is visible without photos.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Skip for Now
            </Button>
            <Button
              className="flex-1"
              disabled
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Upload Photos (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Photo Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Use recent, clear photos that show your face</li>
            <li>• Avoid group photos as your primary image</li>
            <li>• Natural lighting works best</li>
            <li>• Dress modestly and appropriately</li>
            <li>• Smile! It makes a great first impression</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
