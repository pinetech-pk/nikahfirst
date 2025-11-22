"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form.clearMessages();

    if (form.formData.password !== form.formData.confirmPassword) {
      form.setErrorMessage("Passwords do not match");
      return;
    }

    if (form.formData.password.length < 6) {
      form.setErrorMessage("Password must be at least 6 characters");
      return;
    }

    form.startLoading();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.formData.email,
          password: form.formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        form.setErrorMessage(data.error || "Something went wrong");
      } else {
        // Auto-login after registration
        await signIn("credentials", {
          email: form.formData.email,
          password: form.formData.password,
          callbackUrl: "/dashboard",
        });
      }
    } catch (error) {
      form.setErrorMessage("Something went wrong");
    } finally {
      form.stopLoading();
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join NikahFirst to find your life partner
          </CardDescription>
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
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.formData.confirmPassword}
                onChange={(e) => form.updateField("confirmPassword", e.target.value)}
                required
                placeholder="Re-enter password"
              />
            </div>
            {form.error && <p className="text-sm text-red-500">{form.error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={form.loading}>
              {form.loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
