import { z } from 'zod';
import { TenantStatus, SubscriptionPlan, TaxIdType } from '../types/tenant/tenant.enums';
import type { ISODate } from '../types/primitives';

// Reusable schemas
const EmailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase().trim());
const ISODateSchema = z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/);

const BillingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2).optional(), // ISO 3166-2 subdivision
  country: z.string().length(2), // ISO 3166-1 alpha-2
  postal_code: z.string().min(1),
  is_commercial: z.boolean(),
  geolocation: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      precision: z.enum(['rooftop', 'range', 'approximate']).optional(),
    })
    .optional(),
});

const TaxIdSchema = z.object({
  type: z.nativeEnum(TaxIdType).or(z.string()),
  value: z.string().min(1),
  country: z.string().length(2).optional(),
  valid: z.boolean().optional(),
  verified_at: ISODateSchema.optional(),
});

// Main tenant schema
export const TenantSchema = z
  .object({
    tenant_id: z.string().uuid(),
    name: z.string().min(1).max(100),
    status: z.nativeEnum(TenantStatus),
    subscription_plan: z.nativeEnum(SubscriptionPlan),
    billing_email: EmailSchema,
    created_at: ISODateSchema,
    updated_at: ISODateSchema.optional(),
    trial_ends_at: ISODateSchema.optional(),
    billing_address: BillingAddressSchema.optional(),
    tax_ids: z.array(TaxIdSchema).optional(),
    timezone: z.string().optional(), // Should validate against IANA timezones
    industry_code: z.string().optional(),
  })
  .strict();

// Derived types
export type Tenant = z.infer<typeof TenantSchema>;
export type BillingAddress = z.infer<typeof BillingAddressSchema>;
export type TaxId = z.infer<typeof TaxIdSchema>;

// Creation/update schemas
export const CreateTenantSchema = TenantSchema.omit({
  tenant_id: true,
  created_at: true,
  updated_at: true,
}).extend({
  initial_users: z.number().int().positive().optional(),
});

export const UpdateTenantSchema = TenantSchema.partial()
  .omit({ tenant_id: true, created_at: true })
  .strict();
