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
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Lock,
  Send,
  Info,
  CheckCircle,
  Copy,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateAdminPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const form = useForm({
    name: "",
    email: "",
    phone: "",
    department: "",
    sendWelcomeEmail: true,
    requirePasswordChange: true,
    generatePassword: true,
  });

  // Role permissions data
  const rolePermissions = {
    SUPERVISOR: {
      title: "Supervisor",
      description: "Senior moderator with team management capabilities",
      can: [
        "Create lower-level admins (Content Editors, Support Agents)",
        "Ban or suspend user accounts",
        "Approve and reject profiles",
        "Edit profile content",
        "Upgrade/downgrade user subscriptions",
        "View team analytics and reports",
        "Manage content moderation teams",
      ],
      cannot: [
        "Access system-wide settings",
        "View complete platform analytics",
        "Create other Supervisors",
        "Modify Super Admin accounts",
        "Access financial reports",
      ],
    },
    CONTENT_EDITOR: {
      title: "Content Editor",
      description: "Profile moderation and content quality management",
      can: [
        "Approve and reject profile submissions",
        "Edit profile content for quality",
        "Add internal notes to profiles",
        "View profile analytics",
        "Flag profiles for review",
        "Access moderation queue",
      ],
      cannot: [
        "Ban or suspend users",
        "Create admin accounts",
        "Access financial data",
        "Delete profiles permanently",
        "Change user subscriptions",
        "Access system settings",
      ],
    },
    SUPPORT_AGENT: {
      title: "Support Agent",
      description: "Customer service and user assistance",
      can: [
        "Handle customer complaints",
        "Process refund requests",
        "View user account details",
        "Respond to support tickets",
        "Access help documentation",
        "Mark tickets as resolved",
      ],
      cannot: [
        "Modify profile content",
        "Approve or reject profiles",
        "Ban or suspend users",
        "Create admin accounts",
        "Access analytics data",
        "Change user subscriptions",
      ],
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    form.startLoading();
    setGeneratedPassword("");

    if (!selectedRole) {
      form.setErrorMessage("Please select a role");
      return;
    }

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.formData.name,
          email: form.formData.email,
          phone: form.formData.phone,
          department: form.formData.department,
          role: selectedRole,
          // Only send password field if NOT auto-generating
          ...(form.formData.generatePassword ? {} : { password: "TempPassword123!" }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin user");
      }

      form.setSuccessMessage(data.message || "Admin user created successfully!");

      // If password was auto-generated, show it
      if (data.generatedPassword) {
        setGeneratedPassword(data.generatedPassword);
      }

      // Reset form after 3 seconds if no generated password to copy
      if (!data.generatedPassword) {
        setTimeout(() => {
          router.push("/admin/users/admins");
        }, 2000);
      }
    } catch (err: any) {
      form.setErrorMessage(err.message || "Something went wrong");
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    alert("Password copied to clipboard!");
  };

  return (
    <>
      <div className="space-y-6 max-w-6xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Admin User
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new team member with administrative privileges
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
                      Generated Password (save this - it won't be shown again):
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the admin user's personal details
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
                          placeholder="admin@nikahfirst.com"
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

                    <div className="space-y-2">
                      <Label htmlFor="department">Department/Team</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="department"
                          placeholder="e.g., Content Team"
                          className="pl-9"
                          value={form.formData.department}
                          onChange={(e) =>
                            form.updateField("department", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Assignment</CardTitle>
                  <CardDescription>
                    Select the administrative role for this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Select Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Choose a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPERVISOR">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Supervisor - Senior Moderator
                          </div>
                        </SelectItem>
                        <SelectItem value="CONTENT_EDITOR">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Content Editor - Profile Management
                          </div>
                        </SelectItem>
                        <SelectItem value="SUPPORT_AGENT">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Support Agent - Customer Service
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      As a Super Admin, you can create Supervisors, Content
                      Editors, and Support Agents. Each role has specific
                      permissions and limitations.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Configure initial account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
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
                          Email login credentials to the new admin
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
                      Create Admin User
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/admin/users/admins")}
                  disabled={form.loading}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Right Column - Permissions Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                  <CardDescription>
                    {selectedRole
                      ? "What this role can and cannot do"
                      : "Select a role to view permissions"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRole ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {
                            rolePermissions[
                              selectedRole as keyof typeof rolePermissions
                            ].title
                          }
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {
                            rolePermissions[
                              selectedRole as keyof typeof rolePermissions
                            ].description
                          }
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Can Do:
                          </h4>
                          <ul className="space-y-1">
                            {rolePermissions[
                              selectedRole as keyof typeof rolePermissions
                            ].can.map((item, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-green-600 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                            <X className="h-4 w-4" />
                            Cannot Do:
                          </h4>
                          <ul className="space-y-1">
                            {rolePermissions[
                              selectedRole as keyof typeof rolePermissions
                            ].cannot.map((item, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-red-600 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Select a role to view its permissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
