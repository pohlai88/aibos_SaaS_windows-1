import { z } from 'zod';
import { Email, PasswordSchema } from './auth';

export namespace PasswordReset {
  export interface Request {
    email: Email;
    recaptcha_token?: string;
  }

  export interface Completion {
    token: string;
    email: Email;
    new_password: string;
    ip_address?: string; // For security logging
  }

  export const schemas = {
    request: z.object({
      email: z.string().email(),
      recaptcha_token: z.string().min(10).optional(),
    }) satisfies z.ZodType<Request>,
    completion: z.object({
      token: z.string().min(10),
      email: z.string().email(),
      new_password: PasswordSchema,
      ip_address: z.string().optional(),
    }) satisfies z.ZodType<Completion>,
  };
}
