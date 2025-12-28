"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PhoneInput } from "@/components/ui/phone-input";
import type { E164Number } from "libphonenumber-js/core";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
  ShieldAlert,
  Phone,
  Clock,
  Send,
  CalendarClock,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  phoneChangedAt: string | null;
  phoneCooldownDays: number;
  phoneCooldownEndsAt: string | null;
}

interface PhoneVerificationData {
  id: string;
  phone: string;
  expiresAt: string;
  requestedAt: string;
}

export default function SettingsPage() {
  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Personal info form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<E164Number | undefined>();
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Phone verification state
  const [pendingVerification, setPendingVerification] = useState<PhoneVerificationData | null>(null);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch user data and phone verification status on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/account");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone as E164Number | undefined);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPhoneVerificationStatus = async () => {
      try {
        const response = await fetch("/api/auth/phone-verification");
        if (response.ok) {
          const data = await response.json();
          if (data.pendingVerification) {
            setPendingVerification(data.pendingVerification);
          }
        }
      } catch (error) {
        console.error("Failed to fetch phone verification status:", error);
      }
    };

    fetchUserData();
    fetchPhoneVerificationStatus();
  }, []);

  // Handle personal info save
  const handleSavePersonalInfo = async () => {
    setIsSavingInfo(true);
    setInfoMessage(null);

    try {
      const response = await fetch("/api/auth/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || null }),
      });

      const data = await response.json();

      if (response.ok) {
        setInfoMessage({
          type: "success",
          text: data.phoneChanged
            ? "Account updated successfully. Phone verification required."
            : "Personal information updated successfully!",
        });
        // Update local state with new data
        if (data.user) {
          setUserData((prev) => (prev ? { ...prev, ...data.user } : null));
        }
        // Refresh phone verification status after phone change
        if (data.phoneChanged) {
          setPendingVerification(null);
        }
      } else if (response.status === 429 && data.cooldownRemaining) {
        // Handle phone cooldown error
        setInfoMessage({
          type: "error",
          text: data.error,
        });
        // Update local cooldown info
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                phoneCooldownDays: data.cooldownRemaining,
                phoneCooldownEndsAt: data.cooldownEndsAt,
              }
            : null
        );
        // Reset phone to current value
        setPhone(userData?.phone as E164Number | undefined);
      } else {
        setInfoMessage({
          type: "error",
          text: data.error || "Failed to update information",
        });
      }
    } catch {
      setInfoMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setPasswordMessage(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match",
      });
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully!",
        });
        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({
          type: "error",
          text: data.error || "Failed to change password",
        });
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Request phone verification
  const handleRequestVerification = async () => {
    setIsRequestingVerification(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/phone-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setPendingVerification(data.verification);
        setVerificationMessage({
          type: "success",
          text: data.message,
        });
      } else {
        setVerificationMessage({
          type: "error",
          text: data.error || "Failed to request verification",
        });
      }
    } catch {
      setVerificationMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  // Verify phone OTP
  const handleVerifyOtp = async () => {
    if (verificationOtp.length !== 6) {
      setVerificationMessage({
        type: "error",
        text: "Please enter a valid 6-digit code",
      });
      return;
    }

    setIsVerifyingOtp(true);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/auth/phone-verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: verificationOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationMessage({
          type: "success",
          text: data.message,
        });
        setPendingVerification(null);
        setVerificationOtp("");
        // Update user data to reflect verified status
        setUserData((prev) => (prev ? { ...prev, phoneVerified: true } : null));
      } else {
        setVerificationMessage({
          type: "error",
          text: data.error || "Failed to verify code",
        });
      }
    } catch {
      setVerificationMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Calculate time remaining for verification
  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings & Privacy</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings, privacy preferences, and notifications
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {infoMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    infoMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {infoMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {infoMessage.text}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {/* Email verification status */}
                  {userData?.emailVerified ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="text-xs font-medium">Email verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-medium">Email not verified</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  id="phone"
                  placeholder="300 1234567"
                  defaultCountry="PK"
                  value={phone}
                  onChange={setPhone}
                />
                {/* Phone verification status */}
                {userData?.phone ? (
                  userData?.phoneVerified ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <BadgeCheck className="h-4 w-4" />
                      <span className="text-xs font-medium">Phone verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs font-medium">Phone not verified</span>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-gray-500">
                    Add a phone number for account recovery and verification
                  </p>
                )}
                {/* Phone change cooldown notice */}
                {userData && userData.phoneCooldownDays > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <CalendarClock className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-medium">Phone number change restricted</p>
                      <p className="mt-0.5">
                        You can change your phone number again in{" "}
                        <strong>{userData.phoneCooldownDays} day{userData.phoneCooldownDays > 1 ? "s" : ""}</strong>
                        {userData.phoneCooldownEndsAt && (
                          <> (on {new Date(userData.phoneCooldownEndsAt).toLocaleDateString()})</>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Stored in international format (e.g., +923001234567)
                </p>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSavePersonalInfo}
                disabled={isSavingInfo}
              >
                {isSavingInfo ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSavingInfo ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Phone Verification Section */}
          {userData?.phone && !userData?.phoneVerified && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-amber-600" />
                  Verify Your Phone Number
                </CardTitle>
                <CardDescription>
                  Our team will contact you to verify your phone number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      verificationMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {verificationMessage.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {verificationMessage.text}
                  </div>
                )}

                {!pendingVerification ? (
                  // No pending verification - show request button
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Click the button below to request verification. Our team will contact you
                      within 24 hours at <strong>{userData.phone}</strong> to share your verification code.
                    </p>
                    <Button
                      onClick={handleRequestVerification}
                      disabled={isRequestingVerification}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isRequestingVerification ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Request Verification Code
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  // Pending verification - show OTP entry
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verification requested for <strong>{pendingVerification.phone}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(pendingVerification.expiresAt)}</span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Our team will contact you to share your verification code.
                      Enter the 6-digit code below:
                    </p>

                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={verificationOtp}
                        onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="text-center text-xl tracking-widest font-mono max-w-[150px]"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || verificationOtp.length !== 6}
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {passwordMessage.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSavingPassword ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deactivate Account</p>
                  <p className="text-sm text-gray-500">
                    Temporarily hide your account and profiles
                  </p>
                </div>
                <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                  Deactivate
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Profile in Search</Label>
                  <p className="text-sm text-gray-500">
                    Allow your profile to appear in search results
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Online Status</Label>
                  <p className="text-sm text-gray-500">
                    Let others see when you're online
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Last Active</Label>
                  <p className="text-sm text-gray-500">
                    Display when you were last active on the platform
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Hide Contact Details</Label>
                  <p className="text-sm text-gray-500">
                    Only show contact info to accepted connections
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Photo Privacy
              </CardTitle>
              <CardDescription>
                Manage who can view your photos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Blur Photos for Non-Members</Label>
                  <p className="text-sm text-gray-500">
                    Show blurred photos to users who haven't sent interest
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Photo Request Required</Label>
                  <p className="text-sm text-gray-500">
                    Require users to request access to view your photos
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Blocking & Restrictions
              </CardTitle>
              <CardDescription>
                Manage blocked users and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>You haven't blocked anyone yet</p>
                <p className="text-sm mt-1">
                  Blocked users cannot view your profile or contact you
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-600" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Interest Received</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when someone sends you an interest
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Interest Accepted</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when your interest is accepted
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Messages</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive new messages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profile Views</Label>
                  <p className="text-sm text-gray-500">
                    Weekly digest of who viewed your profile
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing & Promotions</Label>
                  <p className="text-sm text-gray-500">
                    Special offers and platform updates
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Manage mobile and browser notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive instant notifications on your device
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Sound</Label>
                  <p className="text-sm text-gray-500">
                    Play sound for new notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
