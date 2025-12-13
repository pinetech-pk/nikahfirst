import crypto from "crypto";

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  // Generate a random 6-digit number
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
}

/**
 * Get OTP expiry time (default 10 minutes)
 */
export function getOTPExpiry(minutes: number = 10): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * OTP configuration
 */
export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  cooldownMinutes: 1, // Minimum time between OTP requests
};
