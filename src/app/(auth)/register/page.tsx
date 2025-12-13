"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Loader2, Mail, KeyRound, CheckCircle, ArrowLeft } from "lucide-react";

type Step = "email" | "otp" | "password";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Start cooldown timer
  const startCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type: "REGISTRATION",
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification code");
        if (data.waitTime) {
          startCooldown(data.waitTime);
        }
      } else {
        setOtpSent(true);
        setStep("otp");
        startCooldown(60); // 1 minute cooldown for resend
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          type: "REGISTRATION",
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code");
        if (data.waitTime) {
          startCooldown(data.waitTime);
        }
      } else {
        startCooldown(60);
        setError(""); // Clear any previous errors
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          type: "REGISTRATION",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code");
      } else {
        setStep("password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        // Auto-login after registration
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
        });
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    setError("");
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else if (step === "password") {
      setStep("otp");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {step !== "email" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle>
                {step === "email" && "Create Account"}
                {step === "otp" && "Verify Email"}
                {step === "password" && "Set Password"}
              </CardTitle>
              <CardDescription>
                {step === "email" && "Enter your email to get started"}
                {step === "otp" && `We sent a code to ${email}`}
                {step === "password" && "Almost done! Create your password"}
              </CardDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            <div
              className={`h-1 flex-1 rounded ${
                step === "email" ? "bg-green-500" : "bg-green-500"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                step === "otp" || step === "password"
                  ? "bg-green-500"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`h-1 flex-1 rounded ${
                step === "password" ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          </div>
        </CardHeader>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOTP}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || resendCooldown > 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Wait ${resendCooldown}s`
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-sm text-center text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className={`${
                    resendCooldown > 0
                      ? "text-gray-400"
                      : "text-green-600 hover:underline"
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
                </button>
              </p>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Code
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step 3: Password */}
        {step === "password" && (
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <KeyRound className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Create a secure password for your account
                </p>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
