"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Shield,
  Send,
  Info,
  CheckCircle,
  Copy,
  Crown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateRegularUserPage() {
  const router = useRouter();
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const [selectedSubscription, setSelectedSubscription] = useState("");

  const form = useForm({
    name: "",
    email: "",
    phone: "",
    sendWelcomeEmail: true,
    requirePasswordChange: true,
    generatePassword: true,
    isVerified: false,
    emailVerified: false,
    phoneVerified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form.startLoading();
    setGeneratedPassword("");

    try {
      const response = await fetch("/api/admin/users/create-regular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.formData.name,
          email: form.formData.email,
          phone: form.formData.phone || null,
          role: "USER",
          status: selectedStatus,
          subscription: selectedSubscription || "FREE",
          isVerified: form.formData.isVerified,
          emailVerified: form.formData.emailVerified,
          phoneVerified: form.formData.phoneVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      form.setSuccessMessage(data.message || "User created successfully!");

      // If password was auto-generated, show it
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }

      // Reset form after 3 seconds if no generated password to copy
      if (!data.generatedPassword) {
        setTimeout(() => {
          router.push("/admin/users/regular");
        }, 2000);
      }
    } catch (err) {
      form.setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert("Password copied to clipboard!");
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New User
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new regular user to the platform
          </p>
        </div>

        {/* Success Message with Generated Password */}
        {form.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-semibold">{form.success}</p>
                {generatedPassword && (
                  <div className="mt-3 p-3 bg-white border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Generated Password (save this - it won&apos;t be shown again):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                        {generatedPassword}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyPassword}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Button
                        type="button"
                        onClick={() => router.push("/admin/users/regular")}
                      >
                        Go to Users List
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {form.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{form.error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the user&apos;s personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-9"
                      value={form.formData.name}
                      onChange={(e) =>
                        form.updateField("name", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      className="pl-9"
                      value={form.formData.email}
                      onChange={(e) =>
                        form.updateField("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      className="pl-9"
                      value={form.formData.phone}
                      onChange={(e) =>
                        form.updateField("phone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Configure the user&apos;s account status and subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Account Status
                  </Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="SUSPENDED">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-yellow-600" />
                          Suspended
                        </div>
                      </SelectItem>
                      <SelectItem value="BANNED">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          Banned
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Leave as Active for normal user access
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription">
                    Subscription Tier
                  </Label>
                  <Select
                    value={selectedSubscription}
                    onValueChange={setSelectedSubscription}
                  >
                    <SelectTrigger id="subscription">
                      <SelectValue placeholder="Select subscription (default: FREE)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-gray-400" />
                          Free
                        </div>
                      </SelectItem>
                      <SelectItem value="STANDARD">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-blue-500" />
                          Standard
                        </div>
                      </SelectItem>
                      <SelectItem value="SILVER">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-gray-500" />
                          Silver
                        </div>
                      </SelectItem>
                      <SelectItem value="GOLD">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          Gold
                        </div>
                      </SelectItem>
                      <SelectItem value="PLATINUM">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-purple-500" />
                          Platinum
                        </div>
                      </SelectItem>
                      <SelectItem value="PRO">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-orange-500" />
                          Pro
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    Leave empty to use default (FREE)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Settings</CardTitle>
              <CardDescription>
                Configure account verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={form.formData.isVerified}
                    onCheckedChange={(checked) =>
                      form.updateField("isVerified", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="isVerified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Account Verified
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Mark the account as verified (identity verification)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailVerified"
                    checked={form.formData.emailVerified}
                    onCheckedChange={(checked) =>
                      form.updateField("emailVerified", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="emailVerified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email Verified
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Mark the email as verified (skip email verification)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phoneVerified"
                    checked={form.formData.phoneVerified}
                    onCheckedChange={(checked) =>
                      form.updateField("phoneVerified", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="phoneVerified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Phone Verified
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Mark the phone number as verified (skip phone verification)
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Leave these unchecked if you want the user to go through the normal verification process.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
              <CardDescription>
                Configure initial password settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generatePassword"
                    checked={form.formData.generatePassword}
                    onCheckedChange={(checked) =>
                      form.updateField("generatePassword", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="generatePassword"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Auto-generate secure password
                    </label>
                    <p className="text-sm text-muted-foreground">
                      System will create a strong temporary password
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={form.formData.sendWelcomeEmail}
                    onCheckedChange={(checked) =>
                      form.updateField("sendWelcomeEmail", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="sendEmail"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send welcome email
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Email login credentials to the new user
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requirePassword"
                    checked={form.formData.requirePasswordChange}
                    onCheckedChange={(checked) =>
                      form.updateField("requirePasswordChange", checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="requirePassword"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Require password change on first login
                    </label>
                    <p className="text-sm text-muted-foreground">
                      User must set a new password when they first sign in
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button type="submit" size="lg" disabled={form.loading || !!form.success}>
              {form.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/users/regular")}
              disabled={form.loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
