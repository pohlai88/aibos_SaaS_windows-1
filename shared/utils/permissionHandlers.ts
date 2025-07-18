import { hasPermission, canPerformAction } from './permissionUtils';
import { Permission } from '../types/roles/permissions';
import type { PermissionCheck } from '../types/roles/permissions';
import { UserRole } from '../types/roles/roles.enums';
import { logger } from '../lib/logger';

/**
 * User interface for permission checking
 */
export interface PermissionUser {
  role: UserRole;
  id?: string;
  email?: string;
  // ... other user properties
}

/**
 * Permission check result with additional context
 */
export interface PermissionResult {
  allowed: boolean;
  permission: PermissionCheck;
  userRole: UserRole;
  reason?: string;
  timestamp: Date;
}

/**
 * Permission handler options
 */
export interface PermissionHandlerOptions {
  logDenials?: boolean;
  logErrors?: boolean;
  throwOnError?: boolean;
  context?: Record<string, any>;
}

/**
 * Default permission handler options
 */
const DEFAULT_OPTIONS: PermissionHandlerOptions = {
  logDenials: true,
  logErrors: true,
  throwOnError: false,
  context: {},
};

/**
 * Safely checks permissions and handles edge cases
 * @param user - User object with role
 * @param permission - Permission or permission check to validate
 * @param options - Handler options for logging and error behavior
 * @returns PermissionResult with detailed information
 */
export function checkPermission(
  user: PermissionUser | null | undefined,
  permission: PermissionCheck,
  options: PermissionHandlerOptions = {},
): PermissionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const timestamp = new Date();

  try {
    // Validate inputs
    if (!user) {
      const result: PermissionResult = {
        allowed: false,
        permission,
        userRole: UserRole.GUEST,
        reason: 'No user provided',
        timestamp,
      };

      if (opts.logDenials) {
        logger.warn('Permission check failed: No user provided', {
          permission,
          context: opts.context,
        });
      }

      return result;
    }

    if (!permission) {
      const result: PermissionResult = {
        allowed: false,
        permission,
        userRole: user.role,
        reason: 'No permission specified',
        timestamp,
      };

      if (opts.logDenials) {
        logger.warn('Permission check failed: No permission specified', {
          userRole: user.role,
          context: opts.context,
        });
      }

      return result;
    }

    // Perform permission check
    const allowed = hasPermission(user.role, permission);

    const result: PermissionResult = {
      allowed,
      permission,
      userRole: user.role,
      timestamp,
    };

    // Log results based on options
    if (!allowed && opts.logDenials) {
      logger.debug(`Permission denied for ${user.role}`, {
        permission,
        userRole: user.role,
        userId: user.id,
        context: opts.context,
      });
    }

    return result;
  } catch (error) {
    const result: PermissionResult = {
      allowed: false,
      permission,
      userRole: user?.role || UserRole.GUEST,
      reason: `Permission check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp,
    };

    if (opts.logErrors) {
      logger.error('Permission check failed', {
        error,
        permission,
        userRole: user?.role,
        userId: user?.id,
        context: opts.context,
      });
    }

    if (opts.throwOnError) {
      throw error;
    }

    return result;
  }
}

/**
 * Checks permission and executes callback if allowed
 * @param user - User object with role
 * @param permission - Permission to check
 * @param callback - Function to execute if permission is granted
 * @param options - Handler options
 * @returns boolean indicating if callback was executed
 */
export function handleFeatureByPermission(
  user: PermissionUser | null | undefined,
  permission: PermissionCheck,
  callback: () => void,
  options: PermissionHandlerOptions = {},
): boolean {
  const result = checkPermission(user, permission, options);

  if (result.allowed) {
    try {
      callback();
      return true;
    } catch (error) {
      if (options.logErrors) {
        logger.error('Feature callback execution failed', {
          error,
          permission,
          userRole: result.userRole,
          context: options.context,
        });
      }
      return false;
    }
  }

  return false;
}

/**
 * Checks permission and returns a value or executes callback
 * @param user - User object with role
 * @param permission - Permission to check
 * @param allowedValue - Value to return if permission is granted
 * @param deniedValue - Value to return if permission is denied
 * @param options - Handler options
 * @returns The appropriate value based on permission
 */
export function getValueByPermission<T>(
  user: PermissionUser | null | undefined,
  permission: PermissionCheck,
  allowedValue: T,
  deniedValue: T,
  options: PermissionHandlerOptions = {},
): T {
  const result = checkPermission(user, permission, options);
  return result.allowed ? allowedValue : deniedValue;
}

/**
 * Checks permission and executes different callbacks based on result
 * @param user - User object with role
 * @param permission - Permission to check
 * @param onAllowed - Callback to execute if permission is granted
 * @param onDenied - Callback to execute if permission is denied
 * @param options - Handler options
 * @returns boolean indicating if allowed callback was executed
 */
export function handlePermissionWithCallbacks(
  user: PermissionUser | null | undefined,
  permission: PermissionCheck,
  onAllowed: () => void,
  onDenied: () => void,
  options: PermissionHandlerOptions = {},
): boolean {
  const result = checkPermission(user, permission, options);

  try {
    if (result.allowed) {
      onAllowed();
      return true;
    } else {
      onDenied();
      return false;
    }
  } catch (error) {
    if (options.logErrors) {
      logger.error('Permission callback execution failed', {
        error,
        permission,
        userRole: result.userRole,
        allowed: result.allowed,
        context: options.context,
      });
    }
    return false;
  }
}

/**
 * Checks if user can perform a specific action on a resource
 * @param user - User object with role
 * @param action - Action to perform
 * @param resource - Resource type
 * @param options - Handler options
 * @returns PermissionResult with detailed information
 */
export function checkActionPermission(
  user: PermissionUser | null | undefined,
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage',
  resource: string,
  options: PermissionHandlerOptions = {},
): PermissionResult {
  const permissionKey = `${resource.toUpperCase()}_${action.toUpperCase()}` as Permission;
  return checkPermission(user, permissionKey, options);
}

/**
 * Creates a permission guard function for specific permission
 * @param permission - Permission to check
 * @param options - Handler options
 * @returns Function that takes user and returns permission result
 */
export function createPermissionGuard(
  permission: PermissionCheck,
  options: PermissionHandlerOptions = {},
) {
  return (user: PermissionUser | null | undefined): PermissionResult => {
    return checkPermission(user, permission, options);
  };
}

/**
 * Creates an action permission guard function
 * @param action - Action to check
 * @param resource - Resource type
 * @param options - Handler options
 * @returns Function that takes user and returns permission result
 */
export function createActionGuard(
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage',
  resource: string,
  options: PermissionHandlerOptions = {},
) {
  return (user: PermissionUser | null | undefined): PermissionResult => {
    return checkActionPermission(user, action, resource, options);
  };
}

/**
 * Batch permission checker for multiple permissions
 * @param user - User object with role
 * @param permissions - Array of permissions to check
 * @param options - Handler options
 * @returns Array of permission results
 */
export function checkMultiplePermissions(
  user: PermissionUser | null | undefined,
  permissions: PermissionCheck[],
  options: PermissionHandlerOptions = {},
): PermissionResult[] {
  return permissions.map((permission) => checkPermission(user, permission, options));
}

/**
 * Checks if user has all specified permissions
 * @param user - User object with role
 * @param permissions - Array of permissions to check
 * @param options - Handler options
 * @returns boolean indicating if user has all permissions
 */
export function hasAllPermissions(
  user: PermissionUser | null | undefined,
  permissions: PermissionCheck[],
  options: PermissionHandlerOptions = {},
): boolean {
  const results = checkMultiplePermissions(user, permissions, options);
  return results.every((result) => result.allowed);
}

/**
 * Checks if user has any of the specified permissions
 * @param user - User object with role
 * @param permissions - Array of permissions to check
 * @param options - Handler options
 * @returns boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(
  user: PermissionUser | null | undefined,
  permissions: PermissionCheck[],
  options: PermissionHandlerOptions = {},
): boolean {
  const results = checkMultiplePermissions(user, permissions, options);
  return results.some((result) => result.allowed);
}
