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
import { Users, UserCheck, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // ✅ FIX: Use isAdmin() helper instead of hardcoded array
  const userRole = session.user.role as UserRole;
  if (!isAdmin(userRole)) {
    redirect("/dashboard");
  }

  // Get stats
  const totalProfiles = await prisma.profile.count();
  const pendingProfiles = await prisma.profile.count({
    where: { isPublished: false },
  });
  const verifiedProfiles = await prisma.profile.count({
    where: { isVerified: true },
  });
  const totalUsers = await prisma.user.count();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Logged in as: {session.user.email} ({session.user.role})
      </p>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profiles
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProfiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedProfiles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage profiles and users</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/admin/profiles/pending">
            <Button>Review Pending Profiles</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">Manage Users</Button>
          </Link>
          {session.user.role === "SUPER_ADMIN" && (
            <Link href="/admin/settings">
              <Button variant="outline">System Settings</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
