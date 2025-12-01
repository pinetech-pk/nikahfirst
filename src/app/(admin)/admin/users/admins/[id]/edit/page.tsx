"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRoleBadge } from "@/lib/roleStyles";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Shield,
  Mail,
  Phone,
  User,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isVerified: boolean;
}

export default function AdminUserEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    newPassword: "",
    confirmPassword: "",
    emailVerified: false,
    phoneVerified: false,
    isVerified: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [originalData, setOriginalData] = useState<AdminUser | null>(null);

  // Fetch admin user data
  useEffect(() => {
    async function fetchAdminUser() {
      try {
        // Await params first
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setUserId(id);

        const response = await fetch(`/api/admin/users/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();

        setFormData({
          name: data.name || "",
          email: data.email,
          phone: data.phone || "",
          role: data.role,
          status: data.status,
          newPassword: "",
          confirmPassword: "",
          emailVerified: data.emailVerified || false,
          phoneVerified: data.phoneVerified || false,
          isVerified: data.isVerified || false,
        });
        setOriginalData(data);
        setLoading(false);
      } catch (err) {
        // show error message
        console.error(err);
        setError("Failed to load admin user data");
        setLoading(false);
      }
    }

    fetchAdminUser();
  }, [params]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validate password if provided
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long");
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match");
        setSaving(false);
        return;
      }
    }

    try {
      // Prepare payload (exclude confirmPassword)
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        emailVerified: formData.emailVerified,
        phoneVerified: formData.phoneVerified,
        isVerified: formData.isVerified,
        ...(formData.newPassword && { newPassword: formData.newPassword }),
      };

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update admin user");
      }

      setSuccess(
        formData.newPassword
          ? "Admin user updated successfully! Password has been changed."
          : "Admin user updated successfully!"
      );

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/admin/users/admins/${userId}`);
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      confirm("Are you sure you want to cancel? Unsaved changes will be lost.")
    ) {
      router.push(`/admin/users/admins/${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin user data...</p>
        </div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/admin/users/admins">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/users/admins/${userId}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Admin User
              </h1>
              <p className="text-gray-600 mt-1">
                Update admin user information and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the admin user&apos;s personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-9"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    {originalData?.emailVerified && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Email verified
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+92 300 1234567"
                        className="pl-9"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                    {originalData?.phoneVerified && formData.phone && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Phone verified
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Role & Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Role & Status</CardTitle>
                  <CardDescription>
                    Manage admin permissions and account status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role">
                      Admin Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Super Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="SUPERVISOR">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Supervisor
                          </div>
                        </SelectItem>
                        <SelectItem value="CONTENT_EDITOR">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Content Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="SUPPORT_AGENT">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Support Agent
                          </div>
                        </SelectItem>
                        <SelectItem value="CONSULTANT">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Consultant
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.role !== originalData?.role && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Changing role will affect the admin&apos;s permissions.
                          Make sure this is intentional.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Account Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-gray-600" />
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="SUSPENDED">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            Suspended
                          </div>
                        </SelectItem>
                        <SelectItem value="BANNED">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-600" />
                            Banned
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.status !== "ACTIVE" && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          This admin will not be able to access the system with
                          this status.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings - Password Reset */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Reset this admin user&apos;s password (no previous password required)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Leave blank to keep current password"
                        className="pl-9 pr-10"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, newPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Minimum 6 characters. Leave blank if you don&apos;t want to change the password.
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="pl-9 pr-10"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formData.newPassword &&
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Passwords do not match
                        </p>
                      )}
                    {formData.newPassword &&
                      formData.confirmPassword &&
                      formData.newPassword === formData.confirmPassword && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Passwords match
                        </p>
                      )}
                  </div>

                  {formData.newPassword && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Key className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-800">
                        The password will be changed when you save. The admin will need to use the new password for their next login.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    Verification Status
                  </CardTitle>
                  <CardDescription>
                    Manage verification status for this admin user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email Verified */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Email Verified</p>
                        <p className="text-xs text-gray-500">
                          {formData.email || "No email set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="emailVerified"
                        checked={formData.emailVerified}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, emailVerified: checked })
                        }
                      />
                      <Badge
                        variant={formData.emailVerified ? "default" : "secondary"}
                        className={
                          formData.emailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {formData.emailVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </div>

                  {/* Phone Verified */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Phone Verified</p>
                        <p className="text-xs text-gray-500">
                          {formData.phone || "No phone set"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="phoneVerified"
                        checked={formData.phoneVerified}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, phoneVerified: checked })
                        }
                      />
                      <Badge
                        variant={formData.phoneVerified ? "default" : "secondary"}
                        className={
                          formData.phoneVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {formData.phoneVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </div>

                  {/* Account Verified (General) */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Account Verified</p>
                        <p className="text-xs text-gray-500">
                          General account verification status
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isVerified"
                        checked={formData.isVerified}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isVerified: checked })
                        }
                      />
                      <Badge
                        variant={formData.isVerified ? "default" : "secondary"}
                        className={
                          formData.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {formData.isVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>
                  </div>

                  {/* Show changes warning */}
                  {originalData && (
                    (formData.emailVerified !== originalData.emailVerified ||
                     formData.phoneVerified !== originalData.phoneVerified ||
                     formData.isVerified !== originalData.isVerified) && (
                      <Alert className="border-purple-200 bg-purple-50">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-sm text-purple-800">
                          Verification status changes will be applied when you save.
                        </AlertDescription>
                      </Alert>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>

            {/* Right Column - Current Info */}
            <div className="space-y-6">
              {/* Current Role Info */}
              {originalData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Role</p>
                      <Badge
                        className={getRoleBadge(originalData.role).className}
                      >
                        {getRoleBadge(originalData.role).label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Current Status
                      </p>
                      <Badge
                        variant={
                          originalData.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          originalData.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : originalData.status === "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-800"
                            : originalData.status === "BANNED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {originalData.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Important Notice */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-900 text-base">
                    Important Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Changing the role will immediately affect permissions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>
                        Suspended or banned admins cannot access the system
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Email changes require verification</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
