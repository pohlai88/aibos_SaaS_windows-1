import type { ApiResponse, PaginatedResponse } from '../api';
import type { UserRole } from './roles.enums';
import type { Permission } from './permissions';

export interface RoleDetailResponse {
  role: UserRole;
  permissions: Permission[];
  memberCount: number;
}

export type GetRolesResponse = ApiResponse<RoleDetailResponse[]>;
export type GetRoleResponse = ApiResponse<RoleDetailResponse>;
export type UpdateRolePermissionsResponse = ApiResponse<{
  previous: Permission[];
  current: Permission[];
}>;
