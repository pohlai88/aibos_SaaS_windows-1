import { z } from 'zod';
import type { UUID, ISODate } from '../primitives';
import type { TenantStatus, SubscriptionPlan, TaxIdType  } from './tenant.enums';
import type { TenantSchema,
  CreateTenantSchema,
  UpdateTenantSchema,
 } from '@shared/validation/tenant.schema';

// Re-export enums for convenient access
export { TenantStatus, SubscriptionPlan, TaxIdType };

export type Email = `${string}@${string}.${string}`;

/**
 * Core tenant interface matching the validation schema
 */
export interface Tenant extends z.infer<typeof TenantSchema> {}

/**
 * Type-safe builder for Tenant-related utilities
 */
export namespace Tenant {
  export type CreateInput = z.input<typeof CreateTenantSchema>;
  export type UpdateInput = z.input<typeof UpdateTenantSchema>;
  export type BillingAddress = z.infer<typeof TenantSchema.shape.billing_address>;

  /**
   * Runtime validation checker
   */
  export function validate(input: unknown): input is Tenant {
    return TenantSchema.safeParse(input).success;
  }
}

// Schema definitions remain in validation file
export {
  TenantSchema,
  CreateTenantSchema,
  UpdateTenantSchema,
} from '@shared/validation/tenant.schema';

/**
 * BI-optimized address structure with validation-ready constraints
 */
export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string; // ISO 3166-2 subdivision code
  country: string; // ISO 3166-1 alpha-2
  postal_code: string;
  is_commercial: boolean;
  geolocation?: {
    lat: number;
    lng: number;
    precision?: 'rooftop' | 'range' | 'approximate';
  };
}

/**
 * Analytics-optimized projection
 */
export type TenantLocationAnalytics = {
  tenant_id: UUID;
  name: string;
  country: string;
  region?: string;
  is_commercial: boolean;
  customer_segment?: string;
  industry_code?: string;
  plan_type: SubscriptionPlan;
  tenant_age_days: number;
};
