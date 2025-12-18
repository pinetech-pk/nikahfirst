"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { isAdmin } from "@/lib/permissions";
import { UserRole } from "@prisma/client";
import { Logo } from "@/components/layout/header/Logo";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form.startLoading();

    try {
      const result = await signIn("credentials", {
        email: form.formData.email,
        password: form.formData.password,
        redirect: false,
      });

      if (result?.error) {
        form.setErrorMessage("Invalid email or password");
      } else {
        // Fetch user session to check role
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        const userRole = session?.user?.role as UserRole | undefined;

        if (isAdmin(userRole)) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      form.setErrorMessage("Something went wrong");
    } finally {
      form.stopLoading();
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Logo size="lg" href="/" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Login to your NikahFirst account</CardDescription>
          </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.formData.email}
                onChange={(e) => form.updateField("email", e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.formData.password}
                onChange={(e) => form.updateField("password", e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            {form.error && <p className="text-sm text-red-500">{form.error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={form.loading}>
              {form.loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
