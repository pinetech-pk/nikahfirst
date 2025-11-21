/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

/**
 * Free Tier Configuration
 * Credits and limits for new user accounts
 */
export const FREE_TIER = {
  /** Initial credits awarded to new users */
  INITIAL_CREDITS: 3,
  /** Maximum credit limit for free tier accounts */
  CREDIT_LIMIT: 5,
  /** Redemption window in days */
  REDEMPTION_WINDOW_DAYS: 15,
  /** Redemption window in milliseconds */
  get REDEMPTION_WINDOW_MS() {
    return this.REDEMPTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  },
} as const;

/**
 * Profile Completion Rewards
 * Credits awarded for completing user profile
 */
export const PROFILE_REWARDS = {
  /** Bonus credits for completing profile */
  COMPLETION_BONUS: 2,
} as const;

/**
 * Password Requirements
 * Security requirements for user passwords
 */
export const PASSWORD_REQUIREMENTS = {
  /** Minimum password length */
  MIN_LENGTH: 8,
  /** Minimum complexity score (number of different character types) */
  MIN_COMPLEXITY: 3,
  /** Require uppercase letters */
  REQUIRE_UPPERCASE: true,
  /** Require lowercase letters */
  REQUIRE_LOWERCASE: true,
  /** Require numbers */
  REQUIRE_NUMBER: true,
  /** Require special characters */
  REQUIRE_SPECIAL: true,
} as const;

/**
 * Bcrypt Configuration
 */
export const BCRYPT = {
  /** Salt rounds for password hashing */
  SALT_ROUNDS: 12,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  /** Default page size */
  DEFAULT_PAGE_SIZE: 50,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Date/Time Constants
 */
export const TIME = {
  /** Milliseconds in a minute */
  MINUTE_MS: 60 * 1000,
  /** Milliseconds in an hour */
  HOUR_MS: 60 * 60 * 1000,
  /** Milliseconds in a day */
  DAY_MS: 24 * 60 * 60 * 1000,
  /** Minutes to consider user "online" */
  ONLINE_THRESHOLD_MINUTES: 5,
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  /** Default country */
  COUNTRY: "Pakistan",
} as const;
