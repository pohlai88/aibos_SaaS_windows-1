import { getPermissionMeta } from '../roles/permissions';
import type { Permission } from '../roles/permissions';
import type { PermissionCheck } from '../roles/permissions';
import type { UserRole } from './user.enums';
import { rolePermissionsMap, getRoleMeta } from '../roles/rolePermissionsMap';
import type { UUID, ISODate } from '../primitives';

export type Email = `${string}@${string}.${string}`;

/**
 * Core user interface with enhanced permission handling
 */
export interface User {
  id: UUID;
  email: Email;
  username?: string;
  role: UserRole;

  /**
   * Direct permissions assigned to this user (overrides role permissions)
   * Use for special cases where users need permissions beyond their role
   */
  customPermissions?: Permission[];

  /**
   * Permissions explicitly denied to this user (overrides both role and custom permissions)
   */
  deniedPermissions?: Permission[];

  // Standard user properties
  isActive: boolean;
  emailVerified: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;

  // Profile information
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;

  // Security and authentication
  lastLoginAt?: ISODate;
  lastPasswordChangeAt?: ISODate;
  failedLoginAttempts?: number;
  accountLockedUntil?: ISODate;
  mfaEnabled: boolean;
  mfaMethods?: string[];

  // Preferences and settings
  preferences?: UserPreferences;
  notificationSettings?: NotificationSettings;

  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  currency?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profileVisibility: 'public' | 'private' | 'team';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
  accessibility?: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;
  };
}

/**
 * Notification settings interface
 */
export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: {
      security: boolean;
      billing: boolean;
      updates: boolean;
      marketing: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      security: boolean;
      billing: boolean;
      updates: boolean;
      marketing: boolean;
    };
  };
  sms: {
    enabled: boolean;
    types: {
      security: boolean;
      billing: boolean;
    };
  };
}

/**
 * Type for user objects that have had their permissions resolved
 */
export interface UserWithResolvedPermissions extends User {
  /**
   * All effective permissions available to this user
   * (role permissions + custom permissions - denied permissions)
   */
  effectivePermissions: Permission[];

  /**
   * Permissions grouped by category for easier access
   */
  permissionsByCategory: Record<string, Permission[]>;

  /**
   * Permissions grouped by impact level
   */
  permissionsByImpact: Record<'low' | 'medium' | 'high' | 'critical', Permission[]>;

  /**
   * Dangerous permissions the user has
   */
  dangerousPermissions: Permission[];

  /**
   * Role metadata for display purposes
   */
  roleMeta: {
    label: string;
    description: string;
    level: number;
    dangerous: boolean;
  };
}

/**
 * User creation interface (without auto-generated fields)
 */
export interface CreateUserRequest {
  email: Email;
  username?: string;
  role: UserRole;
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];

  // Profile information
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;

  // Preferences
  preferences?: Partial<UserPreferences>;
  notificationSettings?: Partial<NotificationSettings>;

  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * User update interface (all fields optional)
 */
export interface UpdateUserRequest {
  username?: string;
  role?: UserRole;
  customPermissions?: Permission[];
  deniedPermissions?: Permission[];

  // Profile information
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;

  // Status
  isActive?: boolean;
  emailVerified?: boolean;

  // Security
  mfaEnabled?: boolean;
  mfaMethods?: string[];

  // Preferences
  preferences?: Partial<UserPreferences>;
  notificationSettings?: Partial<NotificationSettings>;

  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Resolves a user's complete set of effective permissions
 */
export function resolveUserPermissions(user: User): Permission[] {
  const rolePermissions = rolePermissionsMap[user.role] || [];
  const customPermissions = user.customPermissions || [];
  const deniedPermissions = new Set(user.deniedPermissions || []);

  const allPermissions = new Set([...rolePermissions, ...customPermissions]);

  // Remove denied permissions
  deniedPermissions.forEach((p) => allPermissions.delete(p));

  return Array.from(allPermissions);
}

/**
 * Groups permissions by category for a user
 */
export function groupUserPermissionsByCategory(user: User): Record<string, Permission[]> {
  const permissions = resolveUserPermissions(user);
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach((permission) => {
    const meta = getPermissionMeta(permission);
    if (meta) {
      const category = meta.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    }
  });

  return grouped;
}

/**
 * Groups permissions by impact level for a user
 * Note: Impact levels are not currently supported in the simplified permission system
 */
export function groupUserPermissionsByImpact(
  user: User,
): Record<'low' | 'medium' | 'high' | 'critical', Permission[]> {
  // Impact levels are not currently supported in the simplified permission system
  return {
    low: [],
    medium: [],
    high: [],
    critical: [],
  };
}

/**
 * Gets dangerous permissions for a user
 * Note: Dangerous permissions are not currently supported in the simplified permission system
 */
export function getUserDangerousPermissions(user: User): Permission[] {
  // Dangerous permissions are not currently supported in the simplified permission system
  return [];
}

/**
 * Checks if a user has a specific permission or set of permissions
 */
export function userHasPermission(user: User, permission: Permission | Permission[]): boolean {
  const permissions = [...(rolePermissionsMap[user.role] || []), ...(user.customPermissions || [])];

  if (Array.isArray(permission)) {
    return permission.every((p) => permissions.includes(p));
  }
  return permissions.includes(permission);
}

/**
 * Checks if a user has dangerous permissions
 */
export function userHasDangerousPermissions(user: User): boolean {
  return getUserDangerousPermissions(user).length > 0;
}

/**
 * Checks if a user can perform a specific action
 */
export function userCanPerformAction(
  user: User,
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage',
  resource: string,
): boolean {
  const permissionKey = `${resource.toUpperCase()}_${action.toUpperCase()}` as Permission;
  return userHasPermission(user, permissionKey);
}

/**
 * Gets all permissions a user has in a specific category
 */
export function getUserPermissionsByCategory(user: User, category: string): Permission[] {
  const grouped = groupUserPermissionsByCategory(user);
  return grouped[category] || [];
}

/**
 * Gets all permissions a user has with a specific impact level
 * Note: Impact levels are not currently supported in the simplified permission system
 */
export function getUserPermissionsByImpact(
  user: User,
  impact: 'low' | 'medium' | 'high' | 'critical',
): Permission[] {
  // Impact levels are not currently supported in the simplified permission system
  return [];
}

/**
 * Creates a new user object with resolved permissions
 */
export function createUserWithResolvedPermissions(user: User): UserWithResolvedPermissions {
  const effectivePermissions = resolveUserPermissions(user);
  const roleMeta = getRoleMeta(user.role);

  return {
    ...user,
    effectivePermissions,
    permissionsByCategory: groupUserPermissionsByCategory(user),
    permissionsByImpact: groupUserPermissionsByImpact(user),
    dangerousPermissions: getUserDangerousPermissions(user),
    roleMeta: {
      label: roleMeta.label,
      description: roleMeta.description,
      level: roleMeta.level,
      dangerous: roleMeta.dangerous || false,
    },
  };
}

/**
 * Validates user permissions and returns any issues
 */
export function validateUserPermissions(user: User): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for invalid permissions
  const allPermissions = Object.values(Permission);
  const customPermissions = user.customPermissions || [];
  const deniedPermissions = user.deniedPermissions || [];

  customPermissions.forEach((permission) => {
    if (!allPermissions.includes(permission)) {
      issues.push(`Invalid custom permission: ${permission}`);
    }
  });

  deniedPermissions.forEach((permission) => {
    if (!allPermissions.includes(permission)) {
      issues.push(`Invalid denied permission: ${permission}`);
    }
  });

  // Check for dangerous permissions
  const dangerousPermissions = getUserDangerousPermissions(user);
  if (dangerousPermissions.length > 0) {
    warnings.push(`User has ${dangerousPermissions.length} dangerous permission(s)`);
  }

  // Check for permission conflicts
  const effectivePermissions = resolveUserPermissions(user);
  const rolePermissions = rolePermissionsMap[user.role] || [];

  deniedPermissions.forEach((permission) => {
    if (!rolePermissions.includes(permission) && !customPermissions.includes(permission)) {
      warnings.push(`Denying permission that user doesn't have: ${permission}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Gets a summary of user permissions for display
 */
export function getUserPermissionSummary(user: User): {
  totalPermissions: number;
  rolePermissions: number;
  customPermissions: number;
  deniedPermissions: number;
  dangerousPermissions: number;
  categories: string[];
} {
  const effectivePermissions = resolveUserPermissions(user);
  const rolePermissions = rolePermissionsMap[user.role] || [];
  const customPermissions = user.customPermissions || [];
  const deniedPermissions = user.deniedPermissions || [];
  const dangerousPermissions = getUserDangerousPermissions(user);
  const categories = Object.keys(groupUserPermissionsByCategory(user));

  return {
    totalPermissions: effectivePermissions.length,
    rolePermissions: rolePermissions.length,
    customPermissions: customPermissions.length,
    deniedPermissions: deniedPermissions.length,
    dangerousPermissions: dangerousPermissions.length,
    categories,
  };
}
