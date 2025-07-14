import { Tenant, TenantMember, TenantInvitation } from "./tenant";
import { ApiResponse, PaginatedApiResponse, ApiErrorResponse } from "../api";
import { ApiErrorCode } from "../api.errors";
import { UserRole } from "../user/user.enums";

/**
 * Tenant API response types
 */

// Single Tenant Response
export type GetTenantResponse = ApiResponse<{
  tenant: Tenant;
  members?: TenantMember[];
  invitations?: TenantInvitation[];
  // Tenant metadata
  memberCount: number;
  invitationCount: number;
  activeMemberCount: number;
  // Usage statistics
  usage?: {
    storage: {
      used: number;
      limit: number;
      unit: 'MB' | 'GB' | 'TB';
    };
    apiCalls: {
      used: number;
      limit: number;
      period: 'daily' | 'monthly';
    };
    seats: {
      used: number;
      limit: number;
    };
  };
  // Security info
  lastActivity?: Date;
  securitySettings?: {
    mfaRequired: boolean;
    sessionTimeout: number;
    ipWhitelist?: string[];
  };
}>;

// List Tenants Response (Paginated)
export type ListTenantsResponse = PaginatedApiResponse<Tenant> & {
  activeTenantId?: string;
  // List metadata
  totalActiveTenants: number;
  totalSuspendedTenants: number;
  // Filter summary
  filters?: {
    status?: 'active' | 'suspended' | 'all';
    plan?: string;
    createdAfter?: Date;
  };
};

// Create Tenant Response
export type CreateTenantResponse = ApiResponse<{
  tenant: Tenant;
  initialMember: TenantMember;
  invitation?: TenantInvitation;
  // Creation metadata
  setupComplete: boolean;
  nextSteps?: string[];
  // Welcome info
  welcomeMessage?: string;
  onboardingUrl?: string;
  // Billing info
  billingSetupRequired?: boolean;
  trialEndsAt?: Date;
}>;

// Update Tenant Response
export type UpdateTenantResponse = ApiResponse<{
  tenant: Tenant;
  changes: Partial<Tenant>;
  // Update metadata
  updatedAt: Date;
  updatedBy: string;
  // Change tracking
  changeHistory?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: Date;
  }[];
  // Notifications
  notificationsSent?: {
    members: boolean;
    billing: boolean;
    security: boolean;
  };
}>;

// Tenant Member Responses
export type AddMemberResponse = ApiResponse<{
  member: TenantMember;
  // Member metadata
  addedBy: string;
  addedAt: Date;
  // Notification info
  invitationSent: boolean;
  welcomeEmailSent: boolean;
  // Security info
  mfaRequired: boolean;
  initialPasswordSet: boolean;
}>;

export type RemoveMemberResponse = ApiResponse<{
  removedMemberId: string;
  remainingMembers: TenantMember[];
  // Removal metadata
  removedBy: string;
  removedAt: Date;
  reason?: string;
  // Cleanup info
  dataTransferred: boolean;
  accessRevoked: boolean;
  // Notifications
  memberNotified: boolean;
  remainingMembersNotified: boolean;
}>;

export type UpdateMemberResponse = ApiResponse<{
  member: TenantMember;
  // Update metadata
  updatedBy: string;
  updatedAt: Date;
  changes: Partial<TenantMember>;
  // Role change info
  roleChanged?: {
    from: UserRole;
    to: UserRole;
    reason?: string;
  };
  // Permissions
  permissionsUpdated: boolean;
  effectivePermissions: string[];
}>;

// Tenant Invitation Responses
export type SendInvitationResponse = ApiResponse<{
  invitation: TenantInvitation;
  // Invitation metadata
  sentBy: string;
  sentAt: Date;
  // Delivery info
  emailSent: boolean;
  smsSent?: boolean;
  // Expiration
  expiresAt: Date;
  reminderScheduled?: boolean;
}>;

export type CancelInvitationResponse = ApiResponse<{
  cancelledInvitationId: string;
  // Cancellation metadata
  cancelledBy: string;
  cancelledAt: Date;
  reason?: string;
  // Cleanup info
  emailRevoked: boolean;
  accessRevoked: boolean;
}>;

export type AcceptInvitationResponse = ApiResponse<{
  member: TenantMember;
  invitation: TenantInvitation;
  // Acceptance metadata
  acceptedAt: Date;
  acceptedFrom?: {
    ipAddress: string;
    userAgent: string;
    location?: string;
  };
  // Setup info
  profileComplete: boolean;
  mfaSetupRequired: boolean;
}>;

// Tenant Settings Responses
export type GetTenantSettingsResponse = ApiResponse<{
  settings: {
    billing: {
      plan: string;
      billingCycle: 'monthly' | 'yearly';
      nextBillingDate: Date;
      autoRenew: boolean;
    };
    security: {
      mfaRequired: boolean;
      sessionTimeout: number;
      ipWhitelist?: string[];
      passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSymbols: boolean;
      };
    };
    notifications: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      securityAlerts: boolean;
      billingAlerts: boolean;
    };
    integrations: {
      ssoEnabled: boolean;
      ssoProvider?: string;
      apiAccess: boolean;
      webhookUrl?: string;
    };
  };
  // Settings metadata
  lastUpdated: Date;
  updatedBy: string;
}>;

export type UpdateTenantSettingsResponse = ApiResponse<{
  settings: GetTenantSettingsResponse['data']['settings'];
  // Update metadata
  updatedAt: Date;
  updatedBy: string;
  changes: Record<string, unknown>;
  // Validation
  validationPassed: boolean;
  warnings?: string[];
  // Notifications
  membersNotified: boolean;
  securityAuditTriggered?: boolean;
}>;

// Tenant Billing Responses
export type GetBillingResponse = ApiResponse<{
  billing: {
    currentPlan: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: Date;
    amount: number;
    currency: string;
    status: 'active' | 'past_due' | 'cancelled' | 'trial';
    // Usage
    usage: {
      storage: number;
      apiCalls: number;
      seats: number;
    };
    // Limits
    limits: {
      storage: number;
      apiCalls: number;
      seats: number;
    };
  };
  // Billing metadata
  lastInvoiceDate?: Date;
  nextInvoiceDate: Date;
  trialEndsAt?: Date;
}>;

// Tenant Error Responses
export type TenantErrorResponse = ApiErrorResponse & {
  error: {
    code: 
      | ApiErrorCode.TENANT_NOT_FOUND
      | ApiErrorCode.TENANT_SUSPENDED
      | ApiErrorCode.TENANT_LICENSE_EXPIRED
      | ApiErrorCode.TENANT_QUOTA_EXCEEDED
      | ApiErrorCode.TENANT_BILLING_OVERDUE
      | ApiErrorCode.TENANT_MAINTENANCE_MODE
      | ApiErrorCode.AUTH_INSUFFICIENT_PERMISSIONS
      | ApiErrorCode.CONFLICT
      | ApiErrorCode.OPERATION_NOT_ALLOWED
      | ApiErrorCode.INSUFFICIENT_QUOTA
      | ApiErrorCode.PAYMENT_REQUIRED
      | ApiErrorCode.VALIDATION_ERROR;
    suggestion?: string;
    metadata?: {
      availableRoles?: string[];
      maxMembers?: number;
      currentUsage?: {
        storage: number;
        apiCalls: number;
        seats: number;
      };
      limits?: {
        storage: number;
        apiCalls: number;
        seats: number;
      };
      billingStatus?: 'active' | 'past_due' | 'cancelled' | 'trial';
      trialEndsAt?: Date;
    };
    // Additional context
    field?: 'name' | 'plan' | 'billing' | 'member' | 'invitation';
    retryAfter?: number;
    upgradeRequired?: boolean;
  };
};

// Helper type for all tenant responses
export type TenantApiResponse = 
  | GetTenantResponse
  | ListTenantsResponse
  | CreateTenantResponse
  | UpdateTenantResponse
  | AddMemberResponse
  | RemoveMemberResponse
  | UpdateMemberResponse
  | SendInvitationResponse
  | CancelInvitationResponse
  | AcceptInvitationResponse
  | GetTenantSettingsResponse
  | UpdateTenantSettingsResponse
  | GetBillingResponse
  | TenantErrorResponse;

// Type guards for tenant responses
export const isTenantError = (response: TenantApiResponse): response is TenantErrorResponse => {
  return !response.success && 'error' in response;
};

export const isTenantSuspended = (response: TenantErrorResponse): boolean => {
  return response.error.code === ApiErrorCode.TENANT_SUSPENDED;
};

export const isQuotaExceeded = (response: TenantErrorResponse): boolean => {
  return response.error.code === ApiErrorCode.TENANT_QUOTA_EXCEEDED;
};

export const isBillingOverdue = (response: TenantErrorResponse): boolean => {
  return response.error.code === ApiErrorCode.TENANT_BILLING_OVERDUE;
};

// Utility types for better type safety
export type TenantSuccessResponse = Exclude<TenantApiResponse, TenantErrorResponse>;
export type TenantOperation = 
  | 'create'
  | 'update'
  | 'delete'
  | 'suspend'
  | 'activate'
  | 'add_member'
  | 'remove_member'
  | 'update_member'
  | 'send_invitation'
  | 'cancel_invitation'
  | 'accept_invitation'
  | 'update_settings'
  | 'update_billing'; 