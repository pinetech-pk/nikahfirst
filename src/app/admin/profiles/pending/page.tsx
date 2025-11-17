import { redirect } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isModerator } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

export default async function PendingProfilesPage() {
  const session = await getServerSession(authOptions);

  // Check if user is moderator or higher
  const userRole = session?.user?.role as UserRole;
  if (!session || !isModerator(userRole)) {
    redirect("/dashboard");
  }

  // Get all pending profiles
  const pendingProfiles = await prisma.profile.findMany({
    where: {
      isPublished: false,
      isActive: true,
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Profile Approvals</h1>
        <Badge variant="secondary">{pendingProfiles.length} Pending</Badge>
      </div>

      {pendingProfiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No profiles pending approval
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingProfiles.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {profile.firstName} {profile.lastName || ""}
                    </CardTitle>
                    <CardDescription>
                      Profile for: {profile.profileFor} | {profile.gender} |{" "}
                      {profile.city}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">Created by:</span>{" "}
                    {profile.user.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Age:</span>{" "}
                    {new Date().getFullYear() -
                      new Date(profile.dateOfBirth).getFullYear()}{" "}
                    years
                  </p>
                  {profile.bio && (
                    <p className="text-sm">
                      <span className="font-medium">Bio:</span>{" "}
                      {profile.bio.substring(0, 150)}...
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/profiles/${profile.id}/review`}>
                    <Button size="sm">Review Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
