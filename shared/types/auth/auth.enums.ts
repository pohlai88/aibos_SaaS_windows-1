/**
 * Authentication providers supported by the system
 */
export enum AuthProvider {
  EMAIL = "email",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",  // Added for iOS ecosystem
  GITHUB = "github", // Added for developer accounts
}

/**
 * Token types used in authentication flows
 */
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  VERIFICATION = "verification",
  PASSWORD_RESET = "password-reset",
}

/**
 * Authentication error codes for standardized error handling
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = "auth/invalid-credentials",
  USER_NOT_FOUND = "auth/user-not-found",
  ACCOUNT_LOCKED = "auth/account-locked",
  PROVIDER_ERROR = "auth/provider-error",
  EMAIL_NOT_VERIFIED = "auth/email-not-verified",
}

// Utility types
export type AuthProviderType = `${AuthProvider}`;
export type TokenTypeType = `${TokenType}`;

/**
 * Session status tracking
 */
export enum SessionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
} 