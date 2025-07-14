import { z } from "zod";
import { UserRole } from "../types/user/user.enums";

/**
 * User permission types for validation
 */
export const UserPermissionSchema = z.enum([
  "VIEW_USERS",
  "EDIT_USERS", 
  "DELETE_USERS",
  "VIEW_TENANTS",
  "EDIT_TENANTS",
  "DELETE_TENANTS",
  "MANAGE_BILLING",
  "VIEW_ANALYTICS",
  "MANAGE_SETTINGS",
  "INVITE_USERS",
  "MANAGE_ROLES"
]);

export type UserPermission = z.infer<typeof UserPermissionSchema>;

/**
 * User validation schema
 */
export const UserSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  email: z.string().email("Invalid email format"),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Invalid user role" })
  }),
  permissions: z.array(UserPermissionSchema)
    .min(1, "User must have at least one permission")
    .default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Additional fields for enhanced user management
  isActive: z.boolean().default(true),
  lastLoginAt: z.date().optional(),
  emailVerified: z.boolean().default(false),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  timezone: z.string().optional(),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid locale format").optional(),
  preferences: z.record(z.unknown()).optional()
});

/**
 * User creation schema (without auto-generated fields)
 */
export const CreateUserSchema = UserSchema.omit({
  user_id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true
}).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
    .max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * User update schema (all fields optional except user_id)
 */
export const UpdateUserSchema = UserSchema.partial().extend({
  user_id: z.string().uuid("Invalid user ID format")
});

/**
 * User login schema
 */
export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
  deviceId: z.string().uuid().optional(),
  mfaCode: z.string().optional()
});

/**
 * User registration schema
 */
export const UserRegistrationSchema = CreateUserSchema.extend({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" })
  }),
  privacyPolicyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the privacy policy" })
  }),
  marketingEmails: z.boolean().default(false)
});

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format")
});

/**
 * Password reset confirmation schema
 */
export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * User search/filter schema
 */
export const UserSearchSchema = z.object({
  query: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["name", "email", "role", "createdAt", "lastLoginAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

/**
 * Bulk user operations schema
 */
export const BulkUserOperationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "At least one user ID is required"),
  operation: z.enum(["activate", "deactivate", "delete", "changeRole"]),
  role: z.nativeEnum(UserRole).optional(),
  reason: z.string().optional()
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
export type BulkUserOperation = z.infer<typeof BulkUserOperationSchema>;

// Validation helper functions
export const validateUser = (data: unknown): User => {
  return UserSchema.parse(data);
};

export const validateCreateUser = (data: unknown): CreateUser => {
  return CreateUserSchema.parse(data);
};

export const validateUserLogin = (data: unknown): UserLogin => {
  return UserLoginSchema.parse(data);
};

export const validateUserRegistration = (data: unknown): UserRegistration => {
  return UserRegistrationSchema.parse(data);
};

export const validatePasswordReset = (data: unknown): PasswordResetConfirm => {
  return PasswordResetConfirmSchema.parse(data);
};

// Utility functions
export const sanitizeUserForResponse = (user: User): Omit<User, 'password'> => {
  const { password, ...sanitizedUser } = user as any;
  return sanitizedUser;
};

export const hasPermission = (user: User, permission: UserPermission): boolean => {
  return user.permissions.includes(permission);
};

export const hasRole = (user: User, role: UserRole): boolean => {
  return user.role === role;
}; 