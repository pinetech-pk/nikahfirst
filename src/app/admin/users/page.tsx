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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)
  ) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive";
      case "ADMIN":
        return "default";
      case "MODERATOR":
        return "secondary";
      case "CONSULTANT":
        return "outline";
      default:
        return "outline";
    }
  };

  const canCreateRole = (creatorRole: string, targetRole: string): boolean => {
    if (creatorRole === "SUPER_ADMIN") {
      return ["ADMIN"].includes(targetRole);
    }
    if (creatorRole === "ADMIN") {
      return ["MODERATOR", "SUPPORT_AGENT"].includes(targetRole);
    }
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        {session.user.role === "SUPER_ADMIN" && (
          <Link href="/admin/users/create-admin">
            <Button>Create Admin</Button>
          </Link>
        )}
        {session.user.role === "ADMIN" && (
          <Link href="/admin/users/create-moderator">
            <Button>Create Moderator</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.name || "-"}</td>
                    <td className="p-2">
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
