"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) strength++;
    });

    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return { label: "", color: "" };
    if (strength <= 2) return { label: "Weak", color: "text-red-600" };
    if (strength <= 3) return { label: "Fair", color: "text-orange-600" };
    if (strength <= 4) return { label: "Good", color: "text-yellow-600" };
    return { label: "Strong", color: "text-green-600" };
  };

  const strengthInfo = getStrengthLabel(passwordStrength.strength);

  // Validate form
  const validateForm = () => {
    if (!formData.currentPassword) {
      setError("Please enter your current password");
      return false;
    }
    if (!formData.newPassword) {
      setError("Please enter a new password");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }
    if (passwordStrength.strength < 3) {
      setError("Please choose a stronger password");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully!");

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/admin/settings/account");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings/account">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Change Password
            </h1>
            <p className="text-gray-600 mt-1">
              Update your password to keep your account secure
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Choose a strong password to protect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Current Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      className="pl-9 pr-10"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="pl-9 pr-10"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Password Strength:
                        </span>
                        <span
                          className={`text-xs font-medium ${strengthInfo.color}`}
                        >
                          {strengthInfo.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.strength
                                ? passwordStrength.strength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.strength <= 3
                                  ? "bg-orange-500"
                                  : passwordStrength.strength <= 4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="pl-9 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        formData.newPassword === formData.confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.newPassword === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Passwords do not match
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Requirements & Tips */}
        <div className="space-y-6">
          {/* Password Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li
                  className={`flex items-start gap-2 ${
                    passwordStrength.checks.length
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {passwordStrength.checks.length ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>At least 8 characters long</span>
                </li>
                <li
                  className={`flex items-start gap-2 ${
                    passwordStrength.checks.uppercase
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {passwordStrength.checks.uppercase ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>One uppercase letter (A-Z)</span>
                </li>
                <li
                  className={`flex items-start gap-2 ${
                    passwordStrength.checks.lowercase
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {passwordStrength.checks.lowercase ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>One lowercase letter (a-z)</span>
                </li>
                <li
                  className={`flex items-start gap-2 ${
                    passwordStrength.checks.number
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {passwordStrength.checks.number ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>One number (0-9)</span>
                </li>
                <li
                  className={`flex items-start gap-2 ${
                    passwordStrength.checks.special
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {passwordStrength.checks.special ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>One special character (!@#$%)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Use a unique password for this account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Avoid using personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Change your password regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Never share your password with anyone</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
