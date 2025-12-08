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
import { ArrowLeft, Edit, Wrench } from "lucide-react";

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Fetch the profile to verify ownership
  const profile = await prisma.profile.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      profileFor: true,
      gender: true,
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 mt-1">
          Make changes to &quot;{profileTitle}&quot;
        </p>
      </div>

      {/* Placeholder Card */}
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle>Edit Feature Coming Soon</CardTitle>
          <CardDescription>
            We&apos;re working on the profile editing functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              Soon you&apos;ll be able to edit all your profile information including:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Basic Information (Age, Marital Status)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Origin & Background
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Location Details
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Religion & Family
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Physical Attributes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Education & Career
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Bio & Visibility Settings
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/dashboard/profile/${id}`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  View Profile Instead
                </Button>
              </Link>
              <Link href="/dashboard/profiles">
                <Button>Back to Profile List</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
