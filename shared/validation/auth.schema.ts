import { z } from "zod";
import { AuthProvider } from "../types/auth/auth.enums";

// Strong password requirements (define once, reuse everywhere)
export const PasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export const EmailSchema = z.string()
  .email()
  .transform(val => val.toLowerCase().trim());

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  provider: z.nativeEnum(AuthProvider).optional(),
  deviceId: z.string().optional() // For device recognition
}).strict();

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Invalid characters in name"),
  tenant_name: z.string()
    .min(3, "Tenant name too short")
    .max(50, "Tenant name too long")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers and hyphens allowed"),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" })
  })
}).strict();

export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
  recaptcha_token: z.string().min(1).optional()
}).strict();

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().length(64, "Invalid token format"), // Example: 64-char token
  email: EmailSchema, // Additional verification
  new_password: PasswordSchema,
  confirm_password: PasswordSchema
}).strict()
.refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
})
.superRefine((data, ctx) => {
  if (data.new_password.includes(data.email.split('@')[0])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password cannot contain your email username",
    });
  }
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>; 