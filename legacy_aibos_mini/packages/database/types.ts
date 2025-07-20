// Database Types for Enhanced Accounting SaaS
// Generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          parent_org_id: string | null;
          name: string;
          legal_name: string | null;
          tax_id: string | null;
          registration_number: string | null;
          fiscal_year_start: string;
          base_currency: string;
          timezone: string;
          address: Json | null;
          contact_info: Json | null;
          settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_org_id?: string | null;
          name: string;
          legal_name?: string | null;
          tax_id?: string | null;
          registration_number?: string | null;
          fiscal_year_start?: string;
          base_currency?: string;
          timezone?: string;
          address?: Json | null;
          contact_info?: Json | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_org_id?: string | null;
          name?: string;
          legal_name?: string | null;
          tax_id?: string | null;
          registration_number?: string | null;
          fiscal_year_start?: string;
          base_currency?: string;
          timezone?: string;
          address?: Json | null;
          contact_info?: Json | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          email_verified: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_users: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          permissions: Json;
          is_active: boolean;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          permissions?: Json;
          is_active?: boolean;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          permissions?: Json;
          is_active?: boolean;
          joined_at?: string;
          created_at?: string;
        };
      };
      currencies: {
        Row: {
          id: string;
          code: string;
          name: string;
          symbol: string | null;
          decimal_places: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          symbol?: string | null;
          decimal_places?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          symbol?: string | null;
          decimal_places?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      exchange_rates: {
        Row: {
          id: string;
          from_currency: string;
          to_currency: string;
          rate: number;
          effective_date: string;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_currency: string;
          to_currency: string;
          rate: number;
          effective_date: string;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_currency?: string;
          to_currency?: string;
          rate?: number;
          effective_date?: string;
          source?: string | null;
          created_at?: string;
        };
      };
      chart_of_accounts: {
        Row: {
          id: string;
          organization_id: string;
          account_code: string;
          account_name: string;
          account_type: string;
          parent_account_id: string | null;
          normal_balance: string;
          description: string | null;
          is_active: boolean;
          is_system_account: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_code: string;
          account_name: string;
          account_type: string;
          parent_account_id?: string | null;
          normal_balance: string;
          description?: string | null;
          is_active?: boolean;
          is_system_account?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_code?: string;
          account_name?: string;
          account_type?: string;
          parent_account_id?: string | null;
          normal_balance?: string;
          description?: string | null;
          is_active?: boolean;
          is_system_account?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      account_classes: {
        Row: {
          id: string;
          organization_id: string;
          class_name: string;
          class_type: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          class_name: string;
          class_type: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          class_name?: string;
          class_type?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          organization_id: string;
          entry_number: string;
          entry_date: string;
          reference: string | null;
          description: string | null;
          currency: string;
          exchange_rate: number;
          status: string;
          entry_type: string | null;
          posted_at: string | null;
          posted_by: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          entry_number: string;
          entry_date: string;
          reference?: string | null;
          description?: string | null;
          currency?: string;
          exchange_rate?: number;
          status?: string;
          entry_type?: string | null;
          posted_at?: string | null;
          posted_by?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          entry_number?: string;
          entry_date?: string;
          reference?: string | null;
          description?: string | null;
          currency?: string;
          exchange_rate?: number;
          status?: string;
          entry_type?: string | null;
          posted_at?: string | null;
          posted_by?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entry_lines: {
        Row: {
          id: string;
          journal_entry_id: string;
          account_id: string;
          line_number: number;
          description: string | null;
          debit_amount: number;
          credit_amount: number;
          class_id: string | null;
          location_id: string | null;
          tax_code: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          journal_entry_id: string;
          account_id: string;
          line_number: number;
          description?: string | null;
          debit_amount?: number;
          credit_amount?: number;
          class_id?: string | null;
          location_id?: string | null;
          tax_code?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          journal_entry_id?: string;
          account_id?: string;
          line_number?: number;
          description?: string | null;
          debit_amount?: number;
          credit_amount?: number;
          class_id?: string | null;
          location_id?: string | null;
          tax_code?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      general_ledger: {
        Row: {
          id: string;
          organization_id: string;
          account_id: string;
          period_start: string;
          period_end: string;
          opening_balance: number;
          debit_total: number;
          credit_total: number;
          closing_balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_id: string;
          period_start: string;
          period_end: string;
          opening_balance?: number;
          debit_total?: number;
          credit_total?: number;
          closing_balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_id?: string;
          period_start?: string;
          period_end?: string;
          opening_balance?: number;
          debit_total?: number;
          credit_total?: number;
          closing_balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          customer_code: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: Json | null;
          tax_id: string | null;
          credit_limit: number;
          payment_terms: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_code: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          tax_id?: string | null;
          credit_limit?: number;
          payment_terms?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          customer_code?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          tax_id?: string | null;
          credit_limit?: number;
          payment_terms?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          organization_id: string;
          vendor_code: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: Json | null;
          tax_id: string | null;
          payment_terms: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          vendor_code: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          tax_id?: string | null;
          payment_terms?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          vendor_code?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          tax_id?: string | null;
          payment_terms?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          invoice_number: string;
          customer_id: string;
          invoice_date: string;
          due_date: string;
          currency: string;
          exchange_rate: number;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          status: string;
          notes: string | null;
          metadata: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          invoice_number: string;
          customer_id: string;
          invoice_date: string;
          due_date: string;
          currency?: string;
          exchange_rate?: number;
          subtotal: number;
          tax_amount?: number;
          total_amount: number;
          status?: string;
          notes?: string | null;
          metadata?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          invoice_number?: string;
          customer_id?: string;
          invoice_date?: string;
          due_date?: string;
          currency?: string;
          exchange_rate?: number;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: string;
          notes?: string | null;
          metadata?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_lines: {
        Row: {
          id: string;
          invoice_id: string;
          line_number: number;
          description: string;
          quantity: number;
          unit_price: number;
          tax_rate: number;
          line_total: number;
          account_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          line_number: number;
          description: string;
          quantity?: number;
          unit_price: number;
          tax_rate?: number;
          line_total: number;
          account_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          line_number?: number;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tax_rate?: number;
          line_total?: number;
          account_id?: string | null;
          created_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          organization_id: string;
          bill_number: string;
          vendor_id: string;
          bill_date: string;
          due_date: string;
          currency: string;
          exchange_rate: number;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          status: string;
          notes: string | null;
          metadata: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          bill_number: string;
          vendor_id: string;
          bill_date: string;
          due_date: string;
          currency?: string;
          exchange_rate?: number;
          subtotal: number;
          tax_amount?: number;
          total_amount: number;
          status?: string;
          notes?: string | null;
          metadata?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          bill_number?: string;
          vendor_id?: string;
          bill_date?: string;
          due_date?: string;
          currency?: string;
          exchange_rate?: number;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          status?: string;
          notes?: string | null;
          metadata?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bill_lines: {
        Row: {
          id: string;
          bill_id: string;
          line_number: number;
          description: string;
          quantity: number;
          unit_price: number;
          tax_rate: number;
          line_total: number;
          account_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          line_number: number;
          description: string;
          quantity?: number;
          unit_price: number;
          tax_rate?: number;
          line_total: number;
          account_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          line_number?: number;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tax_rate?: number;
          line_total?: number;
          account_id?: string | null;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          payment_number: string;
          payment_date: string;
          payment_type: string;
          currency: string;
          exchange_rate: number;
          amount: number;
          reference: string | null;
          notes: string | null;
          status: string;
          metadata: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          payment_number: string;
          payment_date: string;
          payment_type: string;
          currency?: string;
          exchange_rate?: number;
          amount: number;
          reference?: string | null;
          notes?: string | null;
          status?: string;
          metadata?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          payment_number?: string;
          payment_date?: string;
          payment_type?: string;
          currency?: string;
          exchange_rate?: number;
          amount?: number;
          reference?: string | null;
          notes?: string | null;
          status?: string;
          metadata?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_allocations: {
        Row: {
          id: string;
          payment_id: string;
          invoice_id: string | null;
          bill_id: string | null;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          invoice_id?: string | null;
          bill_id?: string | null;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          invoice_id?: string | null;
          bill_id?: string | null;
          amount?: number;
          created_at?: string;
        };
      };
      bank_accounts: {
        Row: {
          id: string;
          organization_id: string;
          account_name: string;
          account_number: string | null;
          bank_name: string | null;
          routing_number: string | null;
          currency: string;
          opening_balance: number;
          current_balance: number;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_name: string;
          account_number?: string | null;
          bank_name?: string | null;
          routing_number?: string | null;
          currency?: string;
          opening_balance?: number;
          current_balance?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_name?: string;
          account_number?: string | null;
          bank_name?: string | null;
          routing_number?: string | null;
          currency?: string;
          opening_balance?: number;
          current_balance?: number;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_transactions: {
        Row: {
          id: string;
          organization_id: string;
          bank_account_id: string;
          transaction_date: string;
          description: string;
          amount: number;
          balance: number | null;
          reference: string | null;
          category: string | null;
          is_reconciled: boolean;
          journal_entry_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          bank_account_id: string;
          transaction_date: string;
          description: string;
          amount: number;
          balance?: number | null;
          reference?: string | null;
          category?: string | null;
          is_reconciled?: boolean;
          journal_entry_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          bank_account_id?: string;
          transaction_date?: string;
          description?: string;
          amount?: number;
          balance?: number | null;
          reference?: string | null;
          category?: string | null;
          is_reconciled?: boolean;
          journal_entry_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          table_name: string;
          record_id: string | null;
          action: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          table_name: string;
          record_id?: string | null;
          action: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          table_name?: string;
          record_id?: string | null;
          action?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      kpi_metrics: {
        Row: {
          id: string;
          organization_id: string;
          metric_name: string;
          metric_value: number;
          metric_date: string;
          category: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric_name: string;
          metric_value: number;
          metric_date: string;
          category?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          metric_name?: string;
          metric_value?: number;
          metric_date?: string;
          category?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      workflows: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          trigger_type: string;
          trigger_config: Json;
          steps: Json;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          trigger_type: string;
          trigger_config: Json;
          steps: Json;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          trigger_type?: string;
          trigger_config?: Json;
          steps?: Json;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workflow_executions: {
        Row: {
          id: string;
          workflow_id: string;
          status: string;
          started_at: string;
          completed_at: string | null;
          result: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          result?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          result?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Type aliases for better developer experience
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type OrganizationUser = Database['public']['Tables']['organization_users']['Row'];
export type Currency = Database['public']['Tables']['currencies']['Row'];
export type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row'];
export type ChartOfAccount = Database['public']['Tables']['chart_of_accounts']['Row'];
export type AccountClass = Database['public']['Tables']['account_classes']['Row'];
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type JournalEntryLine = Database['public']['Tables']['journal_entry_lines']['Row'];
export type GeneralLedger = Database['public']['Tables']['general_ledger']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceLine = Database['public']['Tables']['invoice_lines']['Row'];
export type Bill = Database['public']['Tables']['bills']['Row'];
export type BillLine = Database['public']['Tables']['bill_lines']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentAllocation = Database['public']['Tables']['payment_allocations']['Row'];
export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
export type BankTransaction = Database['public']['Tables']['bank_transactions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type KpiMetric = Database['public']['Tables']['kpi_metrics']['Row'];
export type Workflow = Database['public']['Tables']['workflows']['Row'];
export type WorkflowExecution = Database['public']['Tables']['workflow_executions']['Row'];

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type OrganizationUserInsert = Database['public']['Tables']['organization_users']['Insert'];
export type CurrencyInsert = Database['public']['Tables']['currencies']['Insert'];
export type ExchangeRateInsert = Database['public']['Tables']['exchange_rates']['Insert'];
export type ChartOfAccountInsert = Database['public']['Tables']['chart_of_accounts']['Insert'];
export type AccountClassInsert = Database['public']['Tables']['account_classes']['Insert'];
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
export type JournalEntryLineInsert = Database['public']['Tables']['journal_entry_lines']['Insert'];
export type GeneralLedgerInsert = Database['public']['Tables']['general_ledger']['Insert'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceLineInsert = Database['public']['Tables']['invoice_lines']['Insert'];
export type BillInsert = Database['public']['Tables']['bills']['Insert'];
export type BillLineInsert = Database['public']['Tables']['bill_lines']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentAllocationInsert = Database['public']['Tables']['payment_allocations']['Insert'];
export type BankAccountInsert = Database['public']['Tables']['bank_accounts']['Insert'];
export type BankTransactionInsert = Database['public']['Tables']['bank_transactions']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type KpiMetricInsert = Database['public']['Tables']['kpi_metrics']['Insert'];
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
export type WorkflowExecutionInsert = Database['public']['Tables']['workflow_executions']['Insert'];

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type OrganizationUserUpdate = Database['public']['Tables']['organization_users']['Update'];
export type CurrencyUpdate = Database['public']['Tables']['currencies']['Update'];
export type ExchangeRateUpdate = Database['public']['Tables']['exchange_rates']['Update'];
export type ChartOfAccountUpdate = Database['public']['Tables']['chart_of_accounts']['Update'];
export type AccountClassUpdate = Database['public']['Tables']['account_classes']['Update'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];
export type JournalEntryLineUpdate = Database['public']['Tables']['journal_entry_lines']['Update'];
export type GeneralLedgerUpdate = Database['public']['Tables']['general_ledger']['Update'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type VendorUpdate = Database['public']['Tables']['vendors']['Update'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
export type InvoiceLineUpdate = Database['public']['Tables']['invoice_lines']['Update'];
export type BillUpdate = Database['public']['Tables']['bills']['Update'];
export type BillLineUpdate = Database['public']['Tables']['bill_lines']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type PaymentAllocationUpdate = Database['public']['Tables']['payment_allocations']['Update'];
export type BankAccountUpdate = Database['public']['Tables']['bank_accounts']['Update'];
export type BankTransactionUpdate = Database['public']['Tables']['bank_transactions']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
export type KpiMetricUpdate = Database['public']['Tables']['kpi_metrics']['Update'];
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];
export type WorkflowExecutionUpdate = Database['public']['Tables']['workflow_executions']['Update']; 