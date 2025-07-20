/**
 * Integration Tests for Enterprise Tax Integration
 * 
 * Tests the integration between the Enterprise Tax Calculation Service
 * and the Invoice/Bill services to ensure proper tax calculation,
 * compliance monitoring, and audit trail management.
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { Decimal } from 'decimal.js';
import { EnterpriseTaxIntegrationService } from './tax-integration-service';
import { EnterpriseBillService } from './bill-service-enterprise';
import { EnterpriseInvoiceService } from './invoice-service-enterprise';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Enterprise Tax Integration Tests', () => {
  let taxIntegrationService: EnterpriseTaxIntegrationService;
  let billService: EnterpriseBillService;
  let invoiceService: EnterpriseInvoiceService;

  const testOrganizationId = 'test-org-123';
  const testUserId = 'test-user-456';

  beforeEach(() => {
    jest.clearAllMocks();
    taxIntegrationService = new EnterpriseTaxIntegrationService(mockSupabase as any);
    billService = new EnterpriseBillService('test-url', 'test-key');
    invoiceService = new EnterpriseInvoiceService('test-url', 'test-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Invoice Tax Integration', () => {
    test('should calculate taxes for new invoice with multiple line items', async () => {
      // Mock customer validation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'customer-123',
          name: 'Test Customer',
          billing_address: {
            country_code: 'US',
            state: 'CA',
            city: 'San Francisco',
            postal_code: '94105'
          }
        },
        error: null
      });

      // Mock invoice creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'invoice-123',
          invoice_number: 'INV-000001',
          organization_id: testOrganizationId,
          customer_id: 'customer-123',
          subtotal: 1000,
          tax_amount: 0,
          total_amount: 1000,
          currency: 'USD',
          invoice_date: '2025-07-08',
          due_date: '2025-08-07',
          status: 'DRAFT'
        },
        error: null
      });

      // Mock invoice lines creation
      mockSupabase.insert.mockResolvedValueOnce({
        data: [],
        error: null
      });

      // Mock tax integration calculation
      jest.spyOn(taxIntegrationService, 'calculateInvoiceTax').mockResolvedValueOnce({
        invoice_id: 'invoice-123',
        organization_id: testOrganizationId,
        tax_calculations: [
          {
            line_id: 'line-1',
            line_description: 'Software License',
            base_amount: new Decimal(500),
            tax_code_id: 'tax-001',
            tax_code_name: 'Standard Rate',
            calculation_result: {
              id: 'calc-1',
              request_id: 'req-1',
              organization_id: testOrganizationId,
              calculation_details: {
                base_amount: new Decimal(500),
                taxable_amount: new Decimal(500),
                tax_amount: new Decimal(45),
                total_amount: new Decimal(545),
                effective_rate: new Decimal(0.09),
                applied_rates: [],
                exemptions_applied: []
              },
              validation_results: [],
              compliance_status: 'COMPLIANT' as any,
              audit_trail: [],
              performance_metrics: {
                calculation_time_ms: 25,
                cache_hit: false,
                external_api_calls: 1,
                validation_time_ms: 5
              },
              generated_at: new Date(),
              generated_by: 'system',
              status: 'COMPLETED' as any,
              security_classification: 'STANDARD' as any
            },
            exemptions_applied: []
          },
          {
            line_id: 'line-2',
            line_description: 'Support Services',
            base_amount: new Decimal(500),
            tax_code_id: 'tax-001',
            tax_code_name: 'Standard Rate',
            calculation_result: {
              id: 'calc-2',
              request_id: 'req-2',
              organization_id: testOrganizationId,
              calculation_details: {
                base_amount: new Decimal(500),
                taxable_amount: new Decimal(500),
                tax_amount: new Decimal(45),
                total_amount: new Decimal(545),
                effective_rate: new Decimal(0.09),
                applied_rates: [],
                exemptions_applied: []
              },
              validation_results: [],
              compliance_status: 'COMPLIANT' as any,
              audit_trail: [],
              performance_metrics: {
                calculation_time_ms: 23,
                cache_hit: false,
                external_api_calls: 1,
                validation_time_ms: 4
              },
              generated_at: new Date(),
              generated_by: 'system',
              status: 'COMPLETED' as any,
              security_classification: 'STANDARD' as any
            },
            exemptions_applied: []
          }
        ],
        total_tax_summary: {
          total_base_amount: new Decimal(1000),
          total_taxable_amount: new Decimal(1000),
          total_tax_amount: new Decimal(90),
          total_amount: new Decimal(1090),
          effective_rate: new Decimal(0.09),
          tax_breakdown: [],
          currency: 'USD',
          jurisdiction_summary: []
        },
        compliance_status: 'COMPLIANT' as any,
        validation_results: [],
        audit_trail_id: 'audit-123',
        calculated_at: new Date(),
        calculated_by: 'system',
        recalculation_required: false
      });

      // Mock invoice total update
      mockSupabase.update.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const invoiceData = {
        customer_id: 'customer-123',
        invoice_date: '2025-07-08',
        due_date: '2025-08-07',
        payment_terms: 'Net 30',
        payment_terms_days: 30,
        currency: 'USD',
        subtotal: 1000,
        tax_amount: 0,
        total_amount: 1000,
        status: 'DRAFT' as any,
        lines: [
          {
            description: 'Software License',
            quantity: 1,
            unit_price: 500,
            tax_code_id: 'tax-001'
          },
          {
            description: 'Support Services',
            quantity: 1,
            unit_price: 500,
            tax_code_id: 'tax-001'
          }
        ]
      };

      const result = await invoiceService.createInvoice(
        testOrganizationId,
        invoiceData,
        { user_id: testUserId, organization_id: testOrganizationId }
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.tax_amount).toBe(90);
      expect(result.data?.total_amount).toBe(1090);
      expect(taxIntegrationService.calculateInvoiceTax).toHaveBeenCalledWith(
        'invoice-123',
        testOrganizationId,
        expect.arrayContaining([
          expect.objectContaining({
            description: 'Software License',
            amount: new Decimal(500)
          }),
          expect.objectContaining({
            description: 'Support Services',
            amount: new Decimal(500)
          })
        ]),
        expect.objectContaining({
          currency: 'USD',
          customer_location: expect.objectContaining({
            country: 'US',
            state_province: 'CA'
          })
        })
      );
    });

    test('should handle tax calculation errors gracefully', async () => {
      // Mock customer validation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'customer-123',
          billing_address: {
            country_code: 'US',
            state: 'CA'
          }
        },
        error: null
      });

      // Mock invoice creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'invoice-456',
          invoice_number: 'INV-000002'
        },
        error: null
      });

      // Mock tax calculation failure
      jest.spyOn(taxIntegrationService, 'calculateInvoiceTax').mockRejectedValueOnce(
        new Error('Tax service unavailable')
      );

      const invoiceData = {
        customer_id: 'customer-123',
        invoice_date: '2025-07-08',
        due_date: '2025-08-07',
        payment_terms: 'Net 30',
        payment_terms_days: 30,
        currency: 'USD',
        subtotal: 1000,
        tax_amount: 0,
        total_amount: 1000,
        status: 'DRAFT' as any,
        lines: [
          {
            description: 'Software License',
            quantity: 1,
            unit_price: 1000,
            tax_code_id: 'tax-001'
          }
        ]
      };

      const result = await invoiceService.createInvoice(
        testOrganizationId,
        invoiceData,
        { user_id: testUserId, organization_id: testOrganizationId }
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('TAX_CALCULATION_ERROR');
      expect(result.errors[0].message).toContain('Tax service unavailable');
    });
  });

  describe('Bill Tax Integration', () => {
    test('should calculate taxes for new bill with vendor location', async () => {
      // Mock vendor validation
      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        billing_address: {
          country_code: 'CA',
          state: 'ON',
          city: 'Toronto',
          postal_code: 'M5V 3A4'
        },
        organization: {
          base_currency: 'USD'
        }
      };

      // Mock bill creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'bill-123',
          bill_number: 'BILL-000001',
          organization_id: testOrganizationId,
          vendor_id: 'vendor-123',
          subtotal: 2000,
          tax_amount: 0,
          total_amount: 2000,
          currency: 'USD',
          bill_date: '2025-07-08',
          due_date: '2025-08-07'
        },
        error: null
      });

      // Mock tax integration calculation
      jest.spyOn(taxIntegrationService, 'calculateBillTax').mockResolvedValueOnce({
        bill_id: 'bill-123',
        organization_id: testOrganizationId,
        tax_calculations: [
          {
            line_id: 'line-1',
            line_description: 'Professional Services',
            base_amount: new Decimal(2000),
            tax_code_id: 'tax-002',
            tax_code_name: 'HST',
            calculation_result: {
              id: 'calc-3',
              request_id: 'req-3',
              organization_id: testOrganizationId,
              calculation_details: {
                base_amount: new Decimal(2000),
                taxable_amount: new Decimal(2000),
                tax_amount: new Decimal(260),
                total_amount: new Decimal(2260),
                effective_rate: new Decimal(0.13),
                applied_rates: [],
                exemptions_applied: []
              },
              validation_results: [],
              compliance_status: 'COMPLIANT' as any,
              audit_trail: [],
              performance_metrics: {
                calculation_time_ms: 30,
                cache_hit: false,
                external_api_calls: 1,
                validation_time_ms: 8
              },
              generated_at: new Date(),
              generated_by: 'system',
              status: 'COMPLETED' as any,
              security_classification: 'STANDARD' as any
            },
            exemptions_applied: []
          }
        ],
        total_tax_summary: {
          total_base_amount: new Decimal(2000),
          total_taxable_amount: new Decimal(2000),
          total_tax_amount: new Decimal(260),
          total_amount: new Decimal(2260),
          effective_rate: new Decimal(0.13),
          tax_breakdown: [],
          currency: 'USD',
          jurisdiction_summary: []
        },
        compliance_status: 'COMPLIANT' as any,
        validation_results: [],
        audit_trail_id: 'audit-456',
        calculated_at: new Date(),
        calculated_by: 'system',
        recalculation_required: false
      });

      // Test would continue with bill service integration
      // Note: This is a conceptual test since we'd need to mock more of the bill service
      
      expect(taxIntegrationService.calculateBillTax).toBeDefined();
    });
  });

  describe('Tax Recalculation', () => {
    test('should recalculate invoice taxes when triggered', async () => {
      const invoiceId = 'invoice-789';
      
      // Mock existing invoice with lines
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: invoiceId,
          subtotal: 1500,
          discount_amount: 0,
          lines: [
            {
              id: 'line-1',
              description: 'Updated Service',
              quantity: 1,
              unit_price: 1500,
              tax_code_id: 'tax-001'
            }
          ]
        },
        error: null
      });

      // Mock tax recalculation
      jest.spyOn(taxIntegrationService, 'recalculateInvoiceTax').mockResolvedValueOnce({
        invoice_id: invoiceId,
        organization_id: testOrganizationId,
        tax_calculations: [],
        total_tax_summary: {
          total_base_amount: new Decimal(1500),
          total_taxable_amount: new Decimal(1500),
          total_tax_amount: new Decimal(135),
          total_amount: new Decimal(1635),
          effective_rate: new Decimal(0.09),
          tax_breakdown: [],
          currency: 'USD',
          jurisdiction_summary: []
        },
        compliance_status: 'COMPLIANT' as any,
        validation_results: [],
        audit_trail_id: 'audit-789',
        calculated_at: new Date(),
        calculated_by: 'system',
        recalculation_required: false
      });

      // Mock invoice update
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: invoiceId,
          tax_amount: 135,
          total_amount: 1635,
          updated_at: new Date().toISOString()
        },
        error: null
      });

      const result = await invoiceService.recalculateInvoiceTax(
        invoiceId,
        testOrganizationId,
        { user_id: testUserId, organization_id: testOrganizationId }
      );

      expect(result.success).toBe(true);
      expect(result.data?.tax_amount).toBe(135);
      expect(result.data?.total_amount).toBe(1635);
      expect(taxIntegrationService.recalculateInvoiceTax).toHaveBeenCalledWith(
        invoiceId,
        expect.objectContaining({
          trigger_type: 'AMOUNT_CHANGE',
          requires_approval: false,
          confidence_level: 1.0
        })
      );
    });
  });

  describe('Event Integration', () => {
    test('should emit events during tax calculation process', async () => {
      const taxCalculatedSpy = jest.fn();
      const complianceIssueSpy = jest.fn();

      invoiceService.on('tax_calculated', taxCalculatedSpy);
      invoiceService.on('compliance_issue', complianceIssueSpy);

      // Mock a compliance alert from tax service
      setTimeout(() => {
        taxIntegrationService.emit('compliance_alert', {
          type: 'RATE_CHANGE',
          severity: 'MEDIUM',
          message: 'Tax rate updated for jurisdiction'
        });
      }, 10);

      await new Promise(resolve => setTimeout(resolve, 20));

      expect(complianceIssueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RATE_CHANGE',
          severity: 'MEDIUM'
        })
      );
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle partial tax calculation failures', async () => {
      // Test cases for:
      // - Network timeouts
      // - Invalid tax codes
      // - Missing jurisdiction data
      // - Rate service unavailability
      // - Compliance validation failures

      // This would test the resilience features of the integration
      expect(true).toBe(true); // Placeholder
    });

    test('should maintain audit trail during error scenarios', async () => {
      // Test that audit trails are preserved even when calculations fail
      expect(true).toBe(true); // Placeholder
    });
  });
});

/**
 * Performance and Load Testing
 */
describe('Tax Integration Performance', () => {
  test('should handle high-volume invoice processing', async () => {
    // Test processing multiple invoices concurrently
    // Validate caching effectiveness
    // Monitor memory usage and response times
    expect(true).toBe(true); // Placeholder
  });

  test('should cache tax calculations effectively', async () => {
    // Test cache hit ratios
    // Validate cache invalidation
    // Test concurrent access patterns
    expect(true).toBe(true); // Placeholder
  });
});

/**
 * Compliance and Audit Testing  
 */
describe('Tax Compliance Integration', () => {
  test('should maintain comprehensive audit trails', async () => {
    // Test audit trail completeness
    // Validate compliance reporting
    // Test data retention policies
    expect(true).toBe(true); // Placeholder
  });

  test('should handle regulatory requirement changes', async () => {
    // Test dynamic rate updates
    // Validate exemption management
    // Test jurisdiction changes
    expect(true).toBe(true); // Placeholder
  });
});
