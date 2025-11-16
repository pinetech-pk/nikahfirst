import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, CreditCard, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user has any profiles
  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
  });

  // Get wallet balances
  const redeemWallet = await prisma.redeemWallet.findUnique({
    where: { userId: session.user.id },
  });

  const fundingWallet = await prisma.fundingWallet.findUnique({
    where: { userId: session.user.id },
  });

  const totalCredits =
    (redeemWallet?.balance || 0) + (fundingWallet?.balance || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              Redeem: {redeemWallet?.balance || 0} | Funding:{" "}
              {fundingWallet?.balance || 0}
            </p>
          </CardContent>
        </Card>

        {/* Profiles Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {profiles.length === 0 ? "No profiles yet" : "Active profiles"}
            </p>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {session.user?.email}
            </div>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Section */}
      {profiles.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Create Your First Profile</CardTitle>
            <CardDescription>
              You haven't created any profiles yet. Create one to start finding
              matches!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile/create">
              <Button>Create Profile</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Profiles</CardTitle>
            <CardDescription>Manage your matrimonial profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div>
                    <p className="font-medium">
                      {profile.firstName} {profile.lastName || ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profile for: {profile.profileFor} | {profile.city}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/profile/create">
                <Button variant="outline">Add Another Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
