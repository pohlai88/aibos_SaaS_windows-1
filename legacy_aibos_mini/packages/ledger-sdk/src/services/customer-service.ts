import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Customer, CustomerInsert } from '@aibos/database';
import { AccountingError } from '../../types';
import { validateCustomer } from '../../validation';

export class CustomerService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new customer
   */
  async createCustomer(
    organizationId: string,
    customerData: Omit<CustomerInsert, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; customer?: Customer; errors: AccountingError[] }> {
    const errors: AccountingError[] = [];

    // Validate customer data
    const validation = validateCustomer(customerData);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(err => ({
        code: 'VALIDATION_ERROR',
        message: err.message,
        field: err.path.join('.'),
        value: (err as any).input,
        severity: 'error' as const
      })));
      return { success: false, errors };
    }

    // Check if customer code is unique
    const existingCustomer = await this.supabase
      .from('customers')
      .select('id')
      .eq('organizationId', organizationId)
      .eq('customer_code', customerData.customer_code)
      .single();

    if (existingCustomer.data) {
      errors.push({
        code: 'DUPLICATE_CUSTOMER_CODE',
        message: 'Customer code already exists',
        field: 'customer_code',
        value: customerData.customer_code,
        severity: 'error'
      });
      return { success: false, errors };
    }

    try {
      const { data: customer, error } = await this.supabase
        .from('customers')
        .insert({
          ...customerData,
          organizationId: organizationId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, customer, errors: [] };

    } catch (error) {
      errors.push({
        code: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown database error',
        severity: 'error'
      });
      return { success: false, errors };
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(
    organizationId: string,
    customerId: string
  ): Promise<{ customer: Customer | null; error: any }> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('organizationId', organizationId)
      .eq('id', customerId)
      .single();

    return { customer: data, error };
  }

  /**
   * List customers with filtering
   */
  async listCustomers(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, search, isActive } = options;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('organizationId', organizationId);

    if (search) {
      query = query.or(`name.ilike.%${search}%,customer_code.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data: customers, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) {
      return { customers: [], total: 0, page, limit };
    }

    return {
      customers: customers || [],
      total: count || 0,
      page,
      limit
    };
  }

  /**
   * Update customer
   */
  async updateCustomer(
    organizationId: string,
    customerId: string,
    updates: Partial<Omit<CustomerInsert, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; customer?: Customer; errors: AccountingError[] }> {
    const errors: AccountingError[] = [];

    // Validate updates if customer_code is being changed
    if (updates.customer_code) {
      const validation = validateCustomer({ customer_code: updates.customer_code, name: updates.name || '' });
      if (!validation.isValid) {
        errors.push(...validation.errors.map(err => ({
          code: 'VALIDATION_ERROR',
          message: err.message,
          field: err.path.join('.'),
          value: (err as any).input,
          severity: 'error' as const
        })));
        return { success: false, errors };
      }

      // Check if new customer code is unique
      const existingCustomer = await this.supabase
        .from('customers')
        .select('id')
        .eq('organizationId', organizationId)
        .eq('customer_code', updates.customer_code)
        .neq('id', customerId)
        .single();

      if (existingCustomer.data) {
        errors.push({
          code: 'DUPLICATE_CUSTOMER_CODE',
          message: 'Customer code already exists',
          field: 'customer_code',
          value: updates.customer_code,
          severity: 'error'
        });
        return { success: false, errors };
      }
    }

    try {
      const { data: customer, error } = await this.supabase
        .from('customers')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('organizationId', organizationId)
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, customer, errors: [] };

    } catch (error) {
      errors.push({
        code: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown database error',
        severity: 'error'
      });
      return { success: false, errors };
    }
  }

  /**
   * Delete customer (soft delete by setting is_active to false)
   */
  async deleteCustomer(
    organizationId: string,
    customerId: string
  ): Promise<{ success: boolean; errors: AccountingError[] }> {
    const errors: AccountingError[] = [];

    try {
      // Check if customer has any invoices
      const { data: invoices, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('id')
        .eq('organizationId', organizationId)
        .eq('customer_id', customerId)
        .limit(1);

      if (invoiceError) throw invoiceError;

      if (invoices && invoices.length > 0) {
        errors.push({
          code: 'CUSTOMER_HAS_INVOICES',
          message: 'Cannot delete customer with existing invoices',
          severity: 'error'
        });
        return { success: false, errors };
      }

      // Soft delete by setting is_active to false
      const { error } = await this.supabase
        .from('customers')
        .update({
          is_active: false,
          updatedAt: new Date().toISOString()
        })
        .eq('organizationId', organizationId)
        .eq('id', customerId);

      if (error) throw error;

      return { success: true, errors: [] };

    } catch (error) {
      errors.push({
        code: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown database error',
        severity: 'error'
      });
      return { success: false, errors };
    }
  }

  /**
   * Get customer summary (total invoices, total paid, outstanding balance)
   */
  async getCustomerSummary(
    organizationId: string,
    customerId: string
  ): Promise<{
    totalInvoices: number;
    totalPaid: number;
    outstandingBalance: number;
    lastInvoiceDate: string | null;
    lastPaymentDate: string | null;
  }> {
    try {
      // Get total invoices
      const { data: invoices, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('total, invoice_date, status')
        .eq('organizationId', organizationId)
        .eq('customer_id', customerId)
        .in('status', ['sent', 'paid', 'overdue']);

      if (invoiceError) throw invoiceError;

      // Get total payments
      const { data: payments, error: paymentError } = await this.supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('organizationId', organizationId)
        .eq('customer_id', customerId)
        .eq('status', 'completed');

      if (paymentError) throw paymentError;

      const totalInvoices = invoices?.length || 0;
      const totalPaid = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
      const totalInvoiced = (invoices || []).reduce((sum, invoice) => sum + invoice.total, 0);
      const outstandingBalance = totalInvoiced - totalPaid;

      const lastInvoiceDate = invoices && invoices.length > 0 
        ? Math.max(...invoices.map(inv => new Date(inv.invoice_date).getTime()))
        : null;

      const lastPaymentDate = payments && payments.length > 0
        ? Math.max(...payments.map(pay => new Date(pay.payment_date).getTime()))
        : null;

      return {
        totalInvoices,
        totalPaid,
        outstandingBalance,
        lastInvoiceDate: lastInvoiceDate ? new Date(lastInvoiceDate).toISOString() : null,
        lastPaymentDate: lastPaymentDate ? new Date(lastPaymentDate).toISOString() : null
      };

    } catch (error) {
      return {
        totalInvoices: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        lastInvoiceDate: null,
        lastPaymentDate: null
      };
    }
  }
} 