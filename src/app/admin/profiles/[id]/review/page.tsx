import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileModerationForm } from "@/components/admin/ProfileModerationForm";

export default async function ProfileReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  const allowedRoles = ["MODERATOR", "ADMIN", "SUPER_ADMIN"];
  if (!session || !allowedRoles.includes(session.user.role as string)) {
    redirect("/dashboard");
  }

  // Await the params
  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      },
      photos: true,
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Review Profile</h1>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Review the details below before approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p>
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Profile For
                </p>
                <p>{profile.profileFor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gender
                </p>
                <p>{profile.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p>
                  {new Date().getFullYear() -
                    new Date(profile.dateOfBirth).getFullYear()}{" "}
                  years
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Location
                </p>
                <p>
                  {profile.city}, {profile.country}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Marital Status
                </p>
                <p>{profile.maritalStatus || "Not specified"}</p>
              </div>
            </div>

            {profile.bio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Bio
                </p>
                <p className="whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Education
              </p>
              <p>{profile.education || "Not specified"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Profession
              </p>
              <p>{profile.profession || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Email:</span> {profile.user.email}
            </p>
            <p>
              <span className="font-medium">Name:</span>{" "}
              {profile.user.name || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {profile.user.phone || "Not provided"}
            </p>
            <p>
              <span className="font-medium">Account Created:</span>{" "}
              {new Date(profile.user.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Moderation Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Moderation Actions</CardTitle>
            <CardDescription>Approve or reject this profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileModerationForm profileId={profile.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
