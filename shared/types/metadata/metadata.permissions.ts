import { z } from 'zod';
import type { UUID, UserID, TenantID, ISODate } from '../primitives';
import type { MetadataPermissionType,
  MetadataPermissionTypes,
  MetadataOperationType,
  MetadataOperationTypes,
  MetadataFieldType,
  MetadataFieldTypes,
 } from './metadata.enums';
import type { MetadataEntity,
  MetadataField,
  MetadataSchema,
  MetadataConstraint,
 } from './metadata.types';

// ============================================================================
// PERMISSION ENUMS
// ============================================================================

export const MetadataPermissionScope = {
  // Entity-level permissions
  ENTITY: 'entity',
  ENTITY_TYPE: 'entity_type',
  ENTITY_INSTANCE: 'entity_instance',

  // Field-level permissions
  FIELD: 'field',
  FIELD_TYPE: 'field_type',
  FIELD_INSTANCE: 'field_instance',

  // Schema-level permissions
  SCHEMA: 'schema',
  SCHEMA_TYPE: 'schema_type',
  SCHEMA_INSTANCE: 'schema_instance',

  // System-level permissions
  SYSTEM: 'system',
  TENANT: 'tenant',
  GLOBAL: 'global',
} as const;

export type MetadataPermissionScope =
  (typeof MetadataPermissionScope)[keyof typeof MetadataPermissionScope];

export const MetadataPermissionEffect = {
  ALLOW: 'allow',
  DENY: 'deny',
} as const;

export type MetadataPermissionEffect =
  (typeof MetadataPermissionEffect)[keyof typeof MetadataPermissionEffect];

export const MetadataPermissionCondition = {
  // Time-based conditions
  TIME_BASED: 'time_based',
  SCHEDULE_BASED: 'schedule_based',

  // Data-based conditions
  DATA_BASED: 'data_based',
  FIELD_VALUE: 'field_value',
  ENTITY_STATE: 'entity_state',

  // User-based conditions
  USER_BASED: 'user_based',
  ROLE_BASED: 'role_based',
  GROUP_BASED: 'group_based',

  // Context-based conditions
  CONTEXT_BASED: 'context_based',
  LOCATION_BASED: 'location_based',
  DEVICE_BASED: 'device_based',

  // Custom conditions
  CUSTOM: 'custom',
} as const;

export type MetadataPermissionCondition =
  (typeof MetadataPermissionCondition)[keyof typeof MetadataPermissionCondition];

// ============================================================================
// PERMISSION INTERFACES
// ============================================================================

export interface MetadataPermission {
  id: UUID;
  name: string;
  description?: string;
  type?: MetadataPermissionType; // Made optional for inheritance
  scope: MetadataPermissionScope;
  effect: MetadataPermissionEffect;

  // Resource identification
  resourceType: string;
  resourceId?: UUID;
  resourcePattern?: string;

  // Operations
  operations: MetadataOperationType[];

  // Conditions
  conditions?: MetadataPermissionConditionConfig[];

  // Constraints
  constraints?: {
    fieldConstraints?: Record<string, any>;
    valueConstraints?: Record<string, any>;
    timeConstraints?: {
      validFrom?: ISODate;
      validTo?: ISODate;
      schedule?: string;
    };
    usageConstraints?: {
      maxUsage?: number;
      usagePeriod?: string;
      currentUsage?: number;
    };
  };

  // Metadata
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
  priority: number;
  tags?: string[];
}

export interface MetadataPermissionConditionConfig {
  type?: MetadataPermissionCondition; // Made optional for inheritance
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in'
    | 'regex'
    | 'custom';
  field?: string;
  value: any;
  options?: Record<string, any>;
}

export interface MetadataPermissionGroup {
  id: UUID;
  name: string;
  description?: string;
  permissions: UUID[];
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

export interface MetadataRole {
  id: UUID;
  name: string;
  description?: string;
  permissions: UUID[];
  permissionGroups: UUID[];
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
  isSystem: boolean;
  priority: number;
}

export interface MetadataUserRole {
  id: UUID;
  userId: UserID;
  roleId: UUID;
  tenantId: TenantID;
  grantedBy: UserID;
  grantedAt: ISODate;
  expiresAt?: ISODate;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface MetadataPermissionAssignment {
  id: UUID;
  userId: UserID;
  permissionId: UUID;
  tenantId: TenantID;
  grantedBy: UserID;
  grantedAt: ISODate;
  expiresAt?: ISODate;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// ACCESS CONTROL INTERFACES
// ============================================================================

export interface MetadataAccessRequest {
  id: UUID;
  userId: UserID;
  tenantId: TenantID;
  resourceType: string;
  resourceId?: UUID;
  operation: MetadataOperationType;
  context: {
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    device?: string;
    timestamp: ISODate;
    metadata?: Record<string, any>;
  };
  data?: Record<string, any>;
}

export interface MetadataAccessResponse {
  id: UUID;
  requestId: UUID;
  allowed: boolean;
  reason?: string;
  permissions: UUID[];
  constraints?: Record<string, any>;
  auditTrail?: string[];
  timestamp: ISODate;
}

export interface MetadataAccessPolicy {
  id: UUID;
  name: string;
  description?: string;
  type?: 'allow' | 'deny' | 'conditional'; // Made optional for inheritance

  // Matching criteria
  resourceType?: string;
  resourcePattern?: string;
  operations?: MetadataOperationType[];
  conditions?: MetadataPermissionConditionConfig[];

  // Actions
  actions: {
    allow?: boolean;
    deny?: boolean;
    transform?: Record<string, any>;
    audit?: boolean;
    notify?: string[];
  };

  // Priority and ordering
  priority: number;
  order: number;

  // Metadata
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

// ============================================================================
// FIELD-LEVEL SECURITY
// ============================================================================

export interface MetadataFieldPermission {
  id: UUID;
  fieldId: UUID;
  entityType: string;
  permissionType: MetadataPermissionType;
  operations: MetadataOperationType[];

  // Field-specific constraints
  constraints: {
    read?: boolean;
    write?: boolean;
    required?: boolean;
    mask?: {
      type?: 'partial' | 'full' | 'hash' | 'custom'; // Made optional for inheritance
      pattern?: string;
      replacement?: string;
    };
    transform?: {
      type?: 'encrypt' | 'hash' | 'format' | 'custom'; // Made optional for inheritance
      options?: Record<string, any>;
    };
    validation?: {
      rules: string[];
      customValidator?: string;
    };
  };

  // Conditions
  conditions?: MetadataPermissionConditionConfig[];

  // Metadata
  tenantId: TenantID;
  createdBy: UserID;
  createdAt: ISODate;
  updatedBy?: UserID;
  updatedAt?: ISODate;
  isActive: boolean;
}

export interface MetadataFieldMask {
  id: UUID;
  fieldId: UUID;
  maskType: 'partial' | 'full' | 'hash' | 'custom';
  pattern?: string;
  replacement?: string;
  customMask?: (value: any) => any;
  conditions?: MetadataPermissionConditionConfig[];
  tenantId: TenantID;
  isActive: boolean;
}

// ============================================================================
// PERMISSION EVALUATION
// ============================================================================

export interface MetadataPermissionEvaluator {
  evaluate(
    request: MetadataAccessRequest,
    userPermissions: MetadataPermission[],
    userRoles: MetadataRole[],
  ): Promise<MetadataAccessResponse>;

  evaluateFieldAccess(
    fieldId: UUID,
    operation: MetadataOperationType,
    userId: UserID,
    tenantId: TenantID,
    context?: Record<string, any>,
  ): Promise<{
    allowed: boolean;
    constraints?: Record<string, any>;
    mask?: MetadataFieldMask;
  }>;

  getEffectivePermissions(
    userId: UserID,
    tenantId: TenantID,
    resourceType?: string,
    resourceId?: UUID,
  ): Promise<MetadataPermission[]>;
}

export interface MetadataPermissionCache {
  get(userId: UserID, tenantId: TenantID): Promise<MetadataPermission[] | null>;
  set(
    userId: UserID,
    tenantId: TenantID,
    permissions: MetadataPermission[],
    ttl?: number,
  ): Promise<void>;
  invalidate(userId: UserID, tenantId: TenantID): Promise<void>;
  invalidateByPattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
}

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

export interface MetadataPermissionManager {
  // Permission CRUD
  createPermission(
    permission: Omit<MetadataPermission, 'id' | 'createdAt'>,
  ): Promise<MetadataPermission>;
  updatePermission(id: UUID, updates: Partial<MetadataPermission>): Promise<MetadataPermission>;
  deletePermission(id: UUID): Promise<void>;
  getPermission(id: UUID): Promise<MetadataPermission | null>;
  listPermissions(filter?: {
    tenantId?: TenantID;
    type?: MetadataPermissionType;
    scope?: MetadataPermissionScope;
    resourceType?: string;
    isActive?: boolean;
  }): Promise<MetadataPermission[]>;

  // Role CRUD
  createRole(role: Omit<MetadataRole, 'id' | 'createdAt'>): Promise<MetadataRole>;
  updateRole(id: UUID, updates: Partial<MetadataRole>): Promise<MetadataRole>;
  deleteRole(id: UUID): Promise<void>;
  getRole(id: UUID): Promise<MetadataRole | null>;
  listRoles(filter?: {
    tenantId?: TenantID;
    isActive?: boolean;
    isSystem?: boolean;
  }): Promise<MetadataRole[]>;

  // User role assignments
  assignRoleToUser(
    userId: UserID,
    roleId: UUID,
    tenantId: TenantID,
    grantedBy: UserID,
  ): Promise<MetadataUserRole>;
  removeRoleFromUser(userId: UserID, roleId: UUID, tenantId: TenantID): Promise<void>;
  getUserRoles(userId: UserID, tenantId: TenantID): Promise<MetadataUserRole[]>;

  // Permission assignments
  assignPermissionToUser(
    userId: UserID,
    permissionId: UUID,
    tenantId: TenantID,
    grantedBy: UserID,
  ): Promise<MetadataPermissionAssignment>;
  removePermissionFromUser(userId: UserID, permissionId: UUID, tenantId: TenantID): Promise<void>;
  getUserPermissions(userId: UserID, tenantId: TenantID): Promise<MetadataPermissionAssignment[]>;

  // Bulk operations
  bulkAssignRoles(
    assignments: Array<{
      userId: UserID;
      roleId: UUID;
      tenantId: TenantID;
      grantedBy: UserID;
    }>,
  ): Promise<MetadataUserRole[]>;

  bulkAssignPermissions(
    assignments: Array<{
      userId: UserID;
      permissionId: UUID;
      tenantId: TenantID;
      grantedBy: UserID;
    }>,
  ): Promise<MetadataPermissionAssignment[]>;
}

// ============================================================================
// PERMISSION VALIDATION
// ============================================================================

export const MetadataPermissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(MetadataPermissionTypes),
  scope: z.nativeEnum(MetadataPermissionScope),
  effect: z.nativeEnum(MetadataPermissionEffect),
  resourceType: z.string(),
  resourceId: z.string().uuid().optional(),
  resourcePattern: z.string().optional(),
  operations: z.array(z.nativeEnum(MetadataOperationTypes)),
  conditions: z
    .array(
      z.object({
        type: z.nativeEnum(MetadataPermissionCondition),
        operator: z.enum([
          'equals',
          'not_equals',
          'contains',
          'greater_than',
          'less_than',
          'in',
          'not_in',
          'regex',
          'custom',
        ]),
        field: z.string().optional(),
        value: z.any(),
        options: z.record(z.any()).optional(),
      }),
    )
    .optional(),
  constraints: z
    .object({
      fieldConstraints: z.record(z.any()).optional(),
      valueConstraints: z.record(z.any()).optional(),
      timeConstraints: z
        .object({
          validFrom: z.string().datetime().optional(),
          validTo: z.string().datetime().optional(),
          schedule: z.string().optional(),
        })
        .optional(),
      usageConstraints: z
        .object({
          maxUsage: z.number().positive().optional(),
          usagePeriod: z.string().optional(),
          currentUsage: z.number().nonnegative().optional(),
        })
        .optional(),
    })
    .optional(),
  tenantId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  isActive: z.boolean(),
  priority: z.number().int().min(0),
  tags: z.array(z.string()).optional(),
});

export const MetadataRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  permissions: z.array(z.string().uuid()),
  permissionGroups: z.array(z.string().uuid()),
  tenantId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedBy: z.string().uuid().optional(),
  updatedAt: z.string().datetime().optional(),
  isActive: z.boolean(),
  isSystem: z.boolean(),
  priority: z.number().int().min(0),
});

export const MetadataAccessRequestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  resourceType: z.string(),
  resourceId: z.string().uuid().optional(),
  operation: z.nativeEnum(MetadataOperationTypes),
  context: z.object({
    sessionId: z.string().optional(),
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    location: z.string().optional(),
    device: z.string().optional(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.any()).optional(),
  }),
  data: z.record(z.any()).optional(),
});

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

export class MetadataPermissionUtils {
  /**
   * Creates a new permission with default values
   */
  static createPermission(
    name: string,
    type: MetadataPermissionType,
    scope: MetadataPermissionScope,
    resourceType: string,
    operations: MetadataOperationType[],
    tenantId: TenantID,
    createdBy: UserID,
    options?: Partial<MetadataPermission>,
  ): MetadataPermission {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      type,
      scope,
      effect: MetadataPermissionEffect.ALLOW,
      resourceType,
      operations,
      tenantId,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      priority: 0,
      ...options,
    };
  }

  /**
   * Creates a role with default values
   */
  static createRole(
    name: string,
    tenantId: TenantID,
    createdBy: UserID,
    options?: Partial<MetadataRole>,
  ): MetadataRole {
    return {
      id: crypto.randomUUID() as UUID,
      name,
      permissions: [],
      permissionGroups: [],
      tenantId,
      createdBy,
      createdAt: new Date().toISOString() as ISODate,
      isActive: true,
      isSystem: false,
      priority: 0,
      ...options,
    };
  }

  /**
   * Validates a permission against the schema
   */
  static validatePermission(permission: MetadataPermission): { valid: boolean; errors?: string[] } {
    try {
      MetadataPermissionSchema.parse(permission);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validates a role against the schema
   */
  static validateRole(role: MetadataRole): { valid: boolean; errors?: string[] } {
    try {
      MetadataRoleSchema.parse(role);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Checks if a permission matches a resource
   */
  static matchesResource(
    permission: MetadataPermission,
    resourceType: string,
    resourceId?: UUID,
  ): boolean {
    // Check resource type
    if (permission.resourceType !== resourceType) {
      return false;
    }

    // Check resource ID if specified
    if (permission.resourceId && resourceId && permission.resourceId !== resourceId) {
      return false;
    }

    // Check resource pattern if specified
    if (permission.resourcePattern && resourceId) {
      const pattern = new RegExp(permission.resourcePattern);
      if (!pattern.test(resourceId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if a permission allows an operation
   */
  static allowsOperation(
    permission: MetadataPermission,
    operation: MetadataOperationType,
  ): boolean {
    return permission.operations.includes(operation);
  }

  /**
   * Evaluates permission conditions
   */
  static evaluateConditions(
    conditions: MetadataPermissionConditionConfig[],
    context: Record<string, any>,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every((condition) => {
      const fieldValue = condition.field ? context[condition.field] : context;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        case 'regex':
          return new RegExp(condition.value).test(String(fieldValue));
        case 'custom':
          // Custom condition evaluation would be implemented here
          return true;
        default:
          return false;
      }
    });
  }

  /**
   * Merges multiple permissions into effective permissions
   */
  static mergePermissions(permissions: MetadataPermission[]): MetadataPermission[] {
    // Group by resource and operation
    const grouped = permissions.reduce(
      (groups, permission) => {
        const key = `${permission.resourceType}:${permission.operations.join(',')}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(permission);
        return groups;
      },
      {} as Record<string, MetadataPermission[]>,
    );

    // Merge each group
    return Object.values(grouped).map((group) => {
      if (group.length === 1) {
        return group[0];
      }

      // Merge multiple permissions for the same resource/operation
      const base = group[0];
      const merged: MetadataPermission = {
        ...base,
        conditions: group.flatMap((p) => p.conditions || []),
        constraints: {
          ...base.constraints,
          ...group.slice(1).reduce(
            (acc, p) => ({
              ...acc,
              ...p.constraints,
            }),
            {},
          ),
        },
      };

      return merged;
    });
  }

  /**
   * Gets effective permissions for a user
   */
  static getEffectivePermissions(
    userPermissions: MetadataPermission[],
    userRoles: MetadataRole[],
    rolePermissions: MetadataPermission[],
  ): MetadataPermission[] {
    const allPermissions = [
      ...userPermissions,
      ...userRoles.flatMap(
        (role) =>
          role.permissions
            .map((permissionId) => rolePermissions.find((p) => p.id === permissionId))
            .filter(Boolean) as MetadataPermission[],
      ),
    ];

    return this.mergePermissions(allPermissions);
  }

  /**
   * Creates a field mask for sensitive data
   */
  static createFieldMask(
    fieldId: UUID,
    maskType: 'partial' | 'full' | 'hash' | 'custom',
    tenantId: TenantID,
    options?: {
      pattern?: string;
      replacement?: string;
      customMask?: (value: any) => any;
      conditions?: MetadataPermissionConditionConfig[];
    },
  ): MetadataFieldMask {
    return {
      id: crypto.randomUUID() as UUID,
      fieldId,
      maskType,
      pattern: options?.pattern,
      replacement: options?.replacement,
      customMask: options?.customMask,
      conditions: options?.conditions,
      tenantId,
      isActive: true,
    };
  }

  /**
   * Applies a field mask to a value
   */
  static applyFieldMask(value: any, mask: MetadataFieldMask): any {
    if (!mask.isActive) {
      return value;
    }

    switch (mask.maskType) {
      case 'partial':
        if (mask.pattern && mask.replacement) {
          return String(value).replace(new RegExp(mask.pattern, 'g'), mask.replacement);
        }
        return value;

      case 'full':
        return mask.replacement || '***';

      case 'hash':
        return crypto.createHash('sha256').update(String(value)).digest('hex');

      case 'custom':
        return mask.customMask ? mask.customMask(value) : value;

      default:
        return value;
    }
  }

  /**
   * Generates a permission cache key
   */
  static generatePermissionCacheKey(
    userId: UserID,
    tenantId: TenantID,
    resourceType?: string,
  ): string {
    const parts = ['permissions', userId, tenantId];
    if (resourceType) {
      parts.push(resourceType);
    }
    return parts.join(':');
  }

  /**
   * Checks if permissions have expired
   */
  static hasExpiredPermissions(
    assignments: (MetadataUserRole | MetadataPermissionAssignment)[],
  ): boolean {
    const now = new Date();
    return assignments.some(
      (assignment) => assignment.expiresAt && new Date(assignment.expiresAt) < now,
    );
  }

  /**
   * Gets active permissions (not expired)
   */
  static getActivePermissions<T extends MetadataUserRole | MetadataPermissionAssignment>(
    assignments: T[],
  ): T[] {
    const now = new Date();
    return assignments.filter(
      (assignment) => !assignment.expiresAt || new Date(assignment.expiresAt) > now,
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MetadataPermission,
  MetadataPermissionConditionConfig,
  MetadataPermissionGroup,
  MetadataRole,
  MetadataUserRole,
  MetadataPermissionAssignment,
  MetadataAccessRequest,
  MetadataAccessResponse,
  MetadataAccessPolicy,
  MetadataFieldPermission,
  MetadataFieldMask,
  MetadataPermissionEvaluator,
  MetadataPermissionCache,
  MetadataPermissionManager,
};

export {
  MetadataPermissionScope,
  MetadataPermissionEffect,
  MetadataPermissionCondition,
  MetadataPermissionSchema,
  MetadataRoleSchema,
  MetadataAccessRequestSchema,
  MetadataPermissionUtils,
};
