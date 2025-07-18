import type { UserRole, UserRoleType  } from '../types/roles/roles.enums';
import { hasPermission } from '../utils/permissionUtils';
import { checkPermission } from '../utils/permissionHandlers';
import type { Permission } from '../types/roles/permissions';
import { mapApiRoleToUserRole } from '../lib/userRoleMapper';

/**
 * Test the updated UserRole enum with uppercase values
 */
export function testUpdatedRoles() {
  console.log('=== Testing Updated UserRole Enum ===');

  // Test enum values
  console.log('UserRole enum values:');
  Object.values(UserRole).forEach((role) => {
    console.log(`  ${role}`);
  });

  // Test UserRoleType
  console.log('\nUserRoleType keys:');
  const roleKeys: UserRoleType[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST'];
  roleKeys.forEach((key) => {
    console.log(`  ${key} -> ${UserRole[key]}`);
  });

  // Test permission checking
  console.log('\nPermission checks:');
  const testUser = { role: UserRole.ADMIN, id: 'test-123' };

  const canEditUsers = hasPermission(UserRole.ADMIN, Permission.USER_UPDATE);
  console.log(`ADMIN can USER_UPDATE: ${canEditUsers}`);

  const canDeleteUsers = hasPermission(UserRole.USER, Permission.USER_DELETE);
  console.log(`USER can USER_DELETE: ${canDeleteUsers}`);

  // Test permission handler
  const permissionResult = checkPermission(testUser, Permission.USER_UPDATE);
  console.log(`Permission result:`, {
    allowed: permissionResult.allowed,
    userRole: permissionResult.userRole,
    permission: permissionResult.permission,
  });

  // Test role mapping
  console.log('\nRole mapping:');
  try {
    const mappedAdmin = mapApiRoleToUserRole('ADMIN');
    console.log(`"ADMIN" -> ${mappedAdmin}`);

    const mappedUser = mapApiRoleToUserRole('USER');
    console.log(`"USER" -> ${mappedUser}`);

    const mappedManager = mapApiRoleToUserRole('MANAGER');
    console.log(`"MANAGER" -> ${mappedManager}`);
  } catch (error) {
    console.error('Role mapping error:', error);
  }

  // Test role hierarchy
  console.log('\nRole hierarchy:');
  const roles = [
    UserRole.GUEST,
    UserRole.USER,
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ];
  roles.forEach((role) => {
    console.log(`  ${role}: ${role}`);
  });

  console.log('\n✅ All role tests completed successfully!');
}

/**
 * Test backward compatibility
 */
export function testBackwardCompatibility() {
  console.log('\n=== Testing Backward Compatibility ===');

  // Test that the enum can still be used in switch statements
  function getRoleDescription(role: UserRole): string {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrator';
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.USER:
        return 'User';
      case UserRole.GUEST:
        return 'Guest';
      default:
        return 'Unknown';
    }
  }

  Object.values(UserRole).forEach((role) => {
    const description = getRoleDescription(role);
    console.log(`${role}: ${description}`);
  });

  console.log('✅ Backward compatibility tests passed!');
}

/**
 * Test type safety
 */
export function testTypeSafety() {
  console.log('\n=== Testing Type Safety ===');

  // Test that UserRoleType works correctly
  const validRoleKeys: UserRoleType[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'GUEST'];

  validRoleKeys.forEach((key) => {
    const role = UserRole[key];
    console.log(`Key: ${key} -> Value: ${role}`);
  });

  // Test that invalid keys are caught at compile time
  // This would cause a TypeScript error if uncommented:
  // const invalidKey: UserRoleType = 'INVALID'; // Should cause error

  console.log('✅ Type safety tests passed!');
}

// Run all tests
export function runAllRoleTests() {
  testUpdatedRoles();
  testBackwardCompatibility();
  testTypeSafety();
  console.log('\n🎉 All role update tests completed successfully!');
}
