import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-slate-600">Logged in as: {session.user?.email}</p>
      <p className="mt-4">User ID: {session.user?.id}</p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
