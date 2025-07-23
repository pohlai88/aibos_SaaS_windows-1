import {
  checkPermission,
  handleFeatureByPermission,
  getValueByPermission,
  handlePermissionWithCallbacks,
  checkActionPermission,
  createPermissionGuard,
  createActionGuard,
  hasAllPermissions,
  hasAnyPermission,
} from '../utils/permissionHandlers';
import type { PermissionUser, PermissionHandlerOptions } from '../utils/permissionHandlers';
import { Permission } from '../types/roles/permissions';
import { UserRole } from '../types/roles/roles.enums';

// Example user objects
const adminUser: PermissionUser = {
  role: UserRole.ADMIN,
  id: 'admin-123',
  email: 'admin@example.com',
};

const regularUser: PermissionUser = {
  role: UserRole.USER,
  id: 'user-456',
  email: 'user@example.com',
};

const guestUser: PermissionUser = {
  role: UserRole.GUEST,
  id: 'guest-789',
  email: 'guest@example.com',
};

/**
 * Example 1: Basic permission checking
 */
export function exampleBasicPermissionCheck() {
  console.log('=== Basic Permission Check ===');

  // Check single permission
  const canEditUsers = checkPermission(adminUser, Permission.USER_UPDATE);
  console.log(`Admin can edit users: ${canEditUsers.allowed}`);

  // Check with custom options
  const options: PermissionHandlerOptions = {
    logDenials: false,
    context: { feature: 'user-management' },
  };

  const canDeleteUsers = checkPermission(regularUser, Permission.USER_DELETE, options);
  console.log(`Regular user can delete users: ${canDeleteUsers.allowed}`);
  console.log(`Reason: ${canDeleteUsers.reason}`);
}

/**
 * Example 2: Feature handling with callbacks
 */
export function exampleFeatureHandling() {
  console.log('\n=== Feature Handling ===');

  // Simple feature execution
  const editButtonShown = handleFeatureByPermission(adminUser, Permission.USER_UPDATE, () => {
    console.log('Showing edit button for admin');
    showEditButton();
  });

  console.log(`Edit button shown: ${editButtonShown}`);

  // Feature with denied callback
  handlePermissionWithCallbacks(
    regularUser,
    Permission.USER_DELETE,
    () => {
      console.log('User can delete - showing delete button');
      showDeleteButton();
    },
    () => {
      console.log('User cannot delete - showing message');
      showAccessDeniedMessage();
    },
  );
}

/**
 * Example 3: Conditional value rendering
 */
export function exampleConditionalValues() {
  console.log('\n=== Conditional Values ===');

  // Get different values based on permission
  const buttonText = getValueByPermission(
    adminUser,
    Permission.USER_UPDATE,
    'Edit User',
    'View User',
  );

  console.log(`Button text: ${buttonText}`);

  // Get different UI components
  const userActions = getValueByPermission(
    adminUser,
    Permission.USER_CREATE,
    ['Edit', 'Delete', 'Suspend'],
    ['View'],
  );

  console.log(`Available actions: ${userActions.join(', ')}`);
}

/**
 * Example 4: Action-based permissions
 */
export function exampleActionPermissions() {
  console.log('\n=== Action Permissions ===');

  // Check specific actions on resources
  const canViewUsers = checkActionPermission(adminUser, 'view', 'users');
  console.log(`Admin can view users: ${canViewUsers.allowed}`);

  const canCreateTenants = checkActionPermission(regularUser, 'create', 'tenants');
  console.log(`Regular user can create tenants: ${canCreateTenants.allowed}`);

  const canManageBilling = checkActionPermission(adminUser, 'manage', 'billing');
  console.log(`Admin can manage billing: ${canManageBilling.allowed}`);
}

/**
 * Example 5: Permission guards
 */
export function examplePermissionGuards() {
  console.log('\n=== Permission Guards ===');

  // Create reusable permission guards
  const canEditUserGuard = createPermissionGuard(Permission.USER_UPDATE);
  const canViewBillingGuard = createActionGuard('view', 'billing');

  // Use guards multiple times
  const adminCanEdit = canEditUserGuard(adminUser);
  const userCanEdit = canEditUserGuard(regularUser);

  console.log(`Admin can edit users: ${adminCanEdit.allowed}`);
  console.log(`Regular user can edit users: ${userCanEdit.allowed}`);

  // Use action guard
  const canViewBilling = canViewBillingGuard(adminUser);
  console.log(`Admin can view billing: ${canViewBilling.allowed}`);
}

/**
 * Example 6: Multiple permission checks
 */
export function exampleMultiplePermissions() {
  console.log('\n=== Multiple Permissions ===');

  // Check if user has all required permissions
  const hasAllUserPermissions = hasAllPermissions(adminUser, [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
  ]);

  console.log(`Admin has all user permissions: ${hasAllUserPermissions}`);

  // Check if user has any of the permissions
  const hasAnyBillingPermission = hasAnyPermission(regularUser, [
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
  ]);

  console.log(`Regular user has any billing permission: ${hasAnyBillingPermission}`);
}

/**
 * Example 7: Complex permission scenarios
 */
export function exampleComplexScenarios() {
  console.log('\n=== Complex Scenarios ===');

  // Scenario: User management dashboard
  const userManagementPermissions = [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_CREATE,
  ];

  const hasUserManagementAccess = hasAnyPermission(adminUser, userManagementPermissions);

  if (hasUserManagementAccess) {
    console.log('Showing user management dashboard');
    showUserManagementDashboard();

    // Check specific actions for UI elements
    const canCreateUsers = checkPermission(adminUser, Permission.USER_CREATE);
    const canDeleteUsers = checkPermission(adminUser, Permission.USER_DELETE);

    if (canCreateUsers.allowed) {
      showCreateUserButton();
    }

    if (canDeleteUsers.allowed) {
      showDeleteUserButton();
    }
  } else {
    console.log('Access denied to user management');
    showAccessDeniedPage();
  }
}

/**
 * Example 8: Error handling and logging
 */
export function exampleErrorHandling() {
  console.log('\n=== Error Handling ===');

  // Handle null/undefined users gracefully
  const nullUserResult = checkPermission(null, Permission.EDIT_USER);
  console.log(`Null user result: ${nullUserResult.allowed}, Reason: ${nullUserResult.reason}`);

  // Custom error handling options
  const strictOptions: PermissionHandlerOptions = {
    logDenials: true,
    logErrors: true,
    throwOnError: true,
    context: { component: 'UserProfile', action: 'edit' },
  };

  try {
    const result = checkPermission(guestUser, Permission.USER_UPDATE, strictOptions);
    console.log(`Guest user can edit: ${result.allowed}`);
  } catch (error) {
    console.log(`Error caught: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Example 9: React-like component usage
 */
export function exampleReactLikeUsage() {
  console.log('\n=== React-like Usage ===');

  // Simulate React component permission checks
  const UserProfileComponent = (user: PermissionUser) => {
    const canEdit = checkPermission(user, Permission.USER_UPDATE);
    const canDelete = checkPermission(user, Permission.USER_DELETE);

    return {
      showEditButton: canEdit.allowed,
      showDeleteButton: canDelete.allowed,
      showViewOnly: !canEdit.allowed && !canDelete.allowed,
    };
  };

  const adminProfile = UserProfileComponent(adminUser);
  const userProfile = UserProfileComponent(regularUser);

  console.log('Admin profile options:', adminProfile);
  console.log('Regular user profile options:', userProfile);
}

// Mock UI functions for demonstration
function showEditButton() {
  console.log('UI: Edit button displayed');
}

function showDeleteButton() {
  console.log('UI: Delete button displayed');
}

function showAccessDeniedMessage() {
  console.log('UI: Access denied message displayed');
}

function showUserManagementDashboard() {
  console.log('UI: User management dashboard displayed');
}

function showCreateUserButton() {
  console.log('UI: Create user button displayed');
}

function showAccessDeniedPage() {
  console.log('UI: Access denied page displayed');
}

// Run all examples
export function runAllExamples() {
  exampleBasicPermissionCheck();
  exampleFeatureHandling();
  exampleConditionalValues();
  exampleActionPermissions();
  examplePermissionGuards();
  exampleMultiplePermissions();
  exampleComplexScenarios();
  exampleErrorHandling();
  exampleReactLikeUsage();
}
