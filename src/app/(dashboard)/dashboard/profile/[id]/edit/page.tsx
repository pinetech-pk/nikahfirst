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
import { ArrowLeft, Edit, Camera, User, Wrench, ChevronRight, Eye } from "lucide-react";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Fetch the profile to verify ownership and get photo count
  const profile = await prisma.profile.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      profileFor: true,
      gender: true,
      _count: {
        select: {
          photos: true,
        },
      },
    },
  });

  if (!profile) {
    redirect("/dashboard/profiles");
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
        <Link href={`/dashboard/profile/${id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </Link>
      </div>

      {/* Edit Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Photos Section - Active */}
        <Link href={`/dashboard/profile/${id}/photos`} className="block">
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

        {/* Profile Information - Coming Soon */}
        <Card className="h-full opacity-75">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-600" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
            <CardTitle className="mt-4">Profile Information</CardTitle>
            <CardDescription>
              Update your personal details, education, career, and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Basic Information</li>
              <li>• Origin & Background</li>
              <li>• Location Details</li>
              <li>• Religion & Family</li>
              <li>• Physical Attributes</li>
              <li>• Education & Career</li>
              <li>• Bio & Visibility</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Delete Profile Section - Coming Later */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800">Delete Profile</CardTitle>
              <CardDescription className="text-red-600">
                Permanently delete this profile and all associated data including photos, views, and connections.
                This feature will be available soon.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete Profile (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
