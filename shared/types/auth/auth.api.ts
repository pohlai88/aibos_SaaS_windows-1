import { ApiResponse, ApiErrorResponse } from "../api";
import { AuthSession, TokenPayload, DeviceInfo } from "./auth";
import { ApiErrorCode } from "../api.errors";
import { MfaMethod, AuthProvider } from "./auth.enums";

/**
 * Authentication API response types
 */

export type AuthResponse = {
  session: AuthSession;
  tokenPayload: TokenPayload;
  device?: DeviceInfo;
  // Security metadata
  lastLogin?: Date;
  failedAttempts?: number;
  newDevice?: boolean;
  trustedDevice?: boolean;
};

export type LoginResponse = ApiResponse<AuthResponse> & {
  requiresMfa?: boolean;
  mfaMethods?: MfaMethod[];
  provider?: AuthProvider;
  // Login metadata
  loginMethod: 'password' | 'social' | 'magic_link';
  sessionDuration?: number; // in seconds
  refreshTokenAvailable?: boolean;
};

export type RegisterResponse = ApiResponse<{
  session?: AuthSession;
  requiresVerification: boolean;
  verificationToken?: string;
  // Registration metadata
  emailSent?: boolean;
  smsSent?: boolean;
  welcomeMessage?: string;
  nextSteps?: string[];
  // Verification options
  verificationMethods?: ('email' | 'sms')[];
  verificationExpiresAt?: Date;
}>;

export type MfaChallengeResponse = ApiResponse<{
  challengeId: string;
  methods: MfaMethod[];
  expiresAt: Date;
  // MFA metadata
  setupComplete?: boolean;
  backupMethods?: MfaMethod[];
  attemptsRemaining?: number;
  // Security info
  deviceTrusted?: boolean;
  rememberDevice?: boolean;
}>;

export type VerifyMfaResponse = ApiResponse<AuthResponse> & {
  recoveryCodes?: string[];
  // Verification metadata
  methodUsed: MfaMethod;
  trustedDevice?: boolean;
  // Security info
  mfaEnabled: boolean;
  backupMethodsRemaining?: number;
};

export type MfaSetupResponse = ApiResponse<{
  tempSecret: string;
  qrCode: string;
  recoveryCodes: string[];
  // Setup metadata
  setupComplete: boolean;
  backupMethods: MfaMethod[];
  expiresAt: Date;
  attemptsRemaining: number;
}>;

export type MfaDisableResponse = ApiResponse<{
  disabled: boolean;
  backupMethodsRemoved: boolean;
}>;

// Enhanced error response with comprehensive auth error codes
export type AuthErrorResponse = ApiErrorResponse & {
  error: {
    code: 
      | ApiErrorCode.AUTH_INVALID_CREDENTIALS
      | ApiErrorCode.AUTH_TOKEN_EXPIRED
      | ApiErrorCode.AUTH_TOKEN_INVALID
      | ApiErrorCode.AUTH_INSUFFICIENT_PERMISSIONS
      | ApiErrorCode.AUTH_MFA_REQUIRED
      | ApiErrorCode.AUTH_MFA_INVALID
      | ApiErrorCode.AUTH_SESSION_EXPIRED
      | ApiErrorCode.AUTH_DEVICE_NOT_TRUSTED
      | ApiErrorCode.AUTH_LOCATION_BLOCKED
      | ApiErrorCode.AUTH_RATE_LIMIT_EXCEEDED
      | ApiErrorCode.USER_NOT_FOUND
      | ApiErrorCode.USER_ACCOUNT_LOCKED
      | ApiErrorCode.USER_ACCOUNT_DISABLED
      | ApiErrorCode.USER_EMAIL_NOT_VERIFIED
      | ApiErrorCode.USER_EMAIL_ALREADY_EXISTS
      | ApiErrorCode.USER_PASSWORD_TOO_WEAK
      | ApiErrorCode.VALIDATION_ERROR
      | ApiErrorCode.TENANT_SUSPENDED
      | ApiErrorCode.TENANT_MAINTENANCE_MODE;
    remainingAttempts?: number;
    lockoutDuration?: number;
    // Additional auth-specific error context
    field?: 'email' | 'password' | 'mfa' | 'token' | 'device';
    suggestion?: string;
    retryAfter?: number;
    suspiciousActivity?: boolean;
    location?: string;
    // MFA-specific error info
    mfaMethods?: MfaMethod[];
    backupMethodsRemaining?: number;
    // Account security info
    accountLockedUntil?: Date;
    passwordResetRequired?: boolean;
  };
};

// Social Auth Types
export type SocialAuthResponse = ApiResponse<{
  session: AuthSession;
  isNewUser: boolean;
  requiresRegistration?: boolean;
  // Social auth metadata
  provider: AuthProvider;
  providerUserId?: string;
  profileComplete?: boolean;
  // Registration flow
  missingFields?: string[];
  suggestedUsername?: string;
  avatarUrl?: string;
}>;

// Password Reset Types
export type PasswordResetRequestResponse = ApiResponse<{
  tokenExpiresAt: Date;
  // Reset metadata
  emailSent: boolean;
  smsSent?: boolean;
  attemptsRemaining: number;
  // Security info
  resetMethod: 'email' | 'sms';
  nextResetAllowedAt?: Date;
}>;

export type PasswordResetConfirmResponse = ApiResponse<{
  session: AuthSession;
  // Reset confirmation metadata
  passwordChanged: boolean;
  allDevicesLoggedOut?: boolean;
  securityAlertSent?: boolean;
}>;

// Email Verification Types
export type EmailVerificationResponse = ApiResponse<{
  verified: boolean;
  session?: AuthSession;
  // Verification metadata
  verificationMethod: 'email' | 'sms';
  nextVerificationAllowedAt?: Date;
}>;

// Session Management Types
export type SessionRefreshResponse = ApiResponse<{
  session: AuthSession;
  tokenPayload: TokenPayload;
  // Refresh metadata
  refreshedAt: Date;
  expiresAt: Date;
}>;

export type LogoutResponse = ApiResponse<{
  loggedOut: boolean;
  // Logout metadata
  devicesLoggedOut?: number;
  cleanupComplete: boolean;
  // Security info
  sessionEnded: boolean;
  tokensRevoked: boolean;
}>;

// Device Management Types
export type DeviceListResponse = ApiResponse<{
  devices: DeviceInfo[];
  // Device metadata
  currentDeviceId?: string;
  trustedDevicesCount: number;
  totalDevicesCount: number;
}>;

export type DeviceTrustResponse = ApiResponse<{
  deviceTrusted: boolean;
  // Trust metadata
  trustExpiresAt?: Date;
  locationVerified?: boolean;
}>;

// Account Security Types
export type SecuritySettingsResponse = ApiResponse<{
  mfaEnabled: boolean;
  mfaMethods: MfaMethod[];
  // Security metadata
  lastPasswordChange?: Date;
  passwordStrength: 'weak' | 'medium' | 'strong';
  suspiciousActivityDetected?: boolean;
  // Settings
  loginNotifications: boolean;
  deviceTrustEnabled: boolean;
  locationRestrictions?: string[];
}>;

// Helper type for all auth responses
export type AuthApiResponse = 
  | LoginResponse
  | RegisterResponse
  | MfaChallengeResponse
  | MfaSetupResponse
  | MfaDisableResponse
  | VerifyMfaResponse
  | SocialAuthResponse
  | PasswordResetRequestResponse
  | PasswordResetConfirmResponse
  | EmailVerificationResponse
  | SessionRefreshResponse
  | LogoutResponse
  | DeviceListResponse
  | DeviceTrustResponse
  | SecuritySettingsResponse
  | AuthErrorResponse;

// Type guards for auth responses
export const isAuthError = (response: AuthApiResponse): response is AuthErrorResponse => {
  return !response.success && 'error' in response;
};

export const isLoginResponse = (response: AuthApiResponse): response is LoginResponse => {
  return response.success && 'loginMethod' in response;
};

export const isMfaRequired = (response: LoginResponse): boolean => {
  return response.requiresMfa === true;
};

export const isVerificationRequired = (response: RegisterResponse): boolean => {
  return response.requiresVerification === true;
};

export const isNewUser = (response: SocialAuthResponse): boolean => {
  return response.data?.isNewUser === true;
};

// Utility types for better type safety
export type AuthSuccessResponse = Exclude<AuthApiResponse, AuthErrorResponse>;
export type AuthFlowStep = 
  | 'login'
  | 'register'
  | 'mfa_setup'
  | 'mfa_verify'
  | 'password_reset'
  | 'email_verification'
  | 'social_auth'
  | 'logout'
  | 'session_refresh'; 