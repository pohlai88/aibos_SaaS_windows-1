import { UserRole } from '../types/user/user.enums';

/**
 * Maps API role strings to strongly-typed UserRole enum values
 * @param input Role string received from API
 * @returns Corresponding UserRole enum value
 * @throws {Error} When input doesn't match any known role
 */
export function mapApiRoleToUserRole(input: string): UserRole {
  const roleMap: Readonly<Record<string, UserRole>> = {
    SUPER_ADMIN: UserRole.SUPER_ADMIN,
    ADMIN: UserRole.ADMIN,
    MANAGER: UserRole.MANAGER,
    USER: UserRole.USER,
    GUEST: UserRole.GUEST,
  } as const;

  const mappedRole = roleMap[input.toUpperCase()];

  if (!mappedRole) {
    throw new Error(
      `Invalid role received from API: "${input}". Expected one of: ${Object.keys(roleMap).join(', ')}`,
    );
  }

  return mappedRole;
}

/**
 * Type guard for checking if a string is a valid UserRole
 */
export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}
