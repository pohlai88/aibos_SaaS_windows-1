-- Enhanced Accounting SaaS Database Schema
-- Multi-tenant, Multi-currency, Enterprise-grade

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations (Multi-tenant support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  registration_number VARCHAR(100),
  fiscal_year_start DATE DEFAULT '2024-01-01',
  base_currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  address JSONB,
  contact_info JSONB,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Users (Multi-tenant user management)
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- owner, admin, accountant, user, viewer
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Currencies
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange Rates
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,6) NOT NULL,
  effective_date DATE NOT NULL,
  source VARCHAR(50), -- API source
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, effective_date)
);

-- Chart of Accounts
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_code VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  normal_balance VARCHAR(10) NOT NULL, -- Debit/Credit
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system_account BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Custom fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, account_code)
);

-- Account Classes (for project/location tracking)
CREATE TABLE account_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  class_name VARCHAR(100) NOT NULL,
  class_type VARCHAR(50) NOT NULL, -- Project, Location, Department, etc.
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, class_name)
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  reference VARCHAR(255),
  description TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, posted, void
  entry_type VARCHAR(50), -- manual, recurring, imported, adjustment
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_by UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, entry_number)
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  line_number INTEGER NOT NULL,
  description TEXT,
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  class_id UUID REFERENCES account_classes(id),
  location_id UUID, -- For multi-location tracking
  tax_code VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK (debit_amount = 0 OR credit_amount = 0) -- Double-entry validation
);

-- General Ledger (Real-time aggregated view)
CREATE TABLE general_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  debit_total DECIMAL(15,2) DEFAULT 0,
  credit_total DECIMAL(15,2) DEFAULT 0,
  closing_balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, account_id, period_start, period_end)
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  tax_id VARCHAR(50),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 30, -- days
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, customer_code)
);

-- Vendors/Suppliers
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  tax_id VARCHAR(50),
  payment_terms INTEGER DEFAULT 30, -- days
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, vendor_code)
);

-- Invoices (Accounts Receivable)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, void
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, invoice_number)
);

-- Invoice Lines
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills (Accounts Payable)
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bill_number VARCHAR(50) NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, received, paid, overdue, void
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, bill_number)
);

-- Bill Lines
CREATE TABLE bill_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_number VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- customer_payment, vendor_payment, transfer
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed, void
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, payment_number)
);

-- Payment Allocations
CREATE TABLE payment_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  bill_id UUID REFERENCES bills(id),
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (invoice_id IS NOT NULL OR bill_id IS NOT NULL)
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  routing_number VARCHAR(50),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Transactions
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2),
  reference VARCHAR(255),
  category VARCHAR(100),
  is_reconciled BOOLEAN DEFAULT false,
  journal_entry_id UUID REFERENCES journal_entries(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI Metrics
CREATE TABLE kpi_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE NOT NULL,
  category VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, metric_name, metric_date)
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL, -- scheduled, event_based, manual
  trigger_config JSONB NOT NULL,
  steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id),
  status VARCHAR(20) NOT NULL DEFAULT 'running', -- running, completed, failed, cancelled
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- METADATA REGISTRY SCHEMA
-- ========================================

-- Metadata Registry (Hard Metadata)
CREATE TABLE IF NOT EXISTS metadata_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name TEXT NOT NULL UNIQUE,
    data_type TEXT NOT NULL CHECK (data_type IN (
        'short_text', 'long_text', 'short_date', 'long_date', 'number', 
        'boolean', 'dropdown', 'currency', 'percentage', 'email', 
        'phone', 'url', 'json', 'array', 'file', 'image'
    )),
    description TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN (
        'accounting', 'finance', 'tax', 'compliance', 'customer', 
        'vendor', 'employee', 'inventory', 'project', 'reporting', 
        'audit', 'general'
    )),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    match_confidence NUMERIC(3,2) DEFAULT 1.0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
    security_level TEXT NOT NULL DEFAULT 'internal' CHECK (security_level IN ('public', 'internal', 'confidential', 'restricted')),
    is_pii BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_financial BOOLEAN DEFAULT FALSE,
    validation_rules TEXT,
    default_value TEXT,
    allowed_values TEXT[],
    min_length INTEGER,
    max_length INTEGER,
    min_value NUMERIC,
    max_value NUMERIC,
    pattern TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    synonyms TEXT[] DEFAULT '{}',
    business_owner TEXT NOT NULL,
    technical_owner TEXT NOT NULL,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Local Metadata (Soft Metadata)
CREATE TABLE IF NOT EXISTS local_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN (
        'short_text', 'long_text', 'short_date', 'long_date', 'number', 
        'boolean', 'dropdown', 'currency', 'percentage', 'email', 
        'phone', 'url', 'json', 'array', 'file', 'image'
    )),
    description TEXT NOT NULL,
    mapped_to UUID REFERENCES metadata_registry(id),
    is_mapped BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    confidence_score NUMERIC(3,2),
    suggested_mappings UUID[] DEFAULT '{}',
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, table_name, column_name)
);

-- Metadata Usage Tracking
CREATE TABLE IF NOT EXISTS metadata_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, organization_id, table_name, column_name)
);

-- Metadata Change Log
CREATE TABLE IF NOT EXISTS metadata_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deprecated', 'mapped', 'approved')),
    old_value JSONB,
    new_value JSONB,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    impact_assessment TEXT
);

-- Metadata Field Relationships
CREATE TABLE IF NOT EXISTS metadata_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    target_field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('depends_on', 'similar_to', 'replaces', 'extends')),
    confidence_score NUMERIC(3,2) DEFAULT 1.0,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_field_id, target_field_id, relationship_type)
);

-- Metadata Validation Rules
CREATE TABLE IF NOT EXISTS metadata_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('format', 'range', 'required', 'unique', 'custom')),
    rule_definition JSONB NOT NULL,
    error_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metadata Field Dependencies
CREATE TABLE IF NOT EXISTS metadata_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    depends_on_field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    dependency_type TEXT NOT NULL CHECK (dependency_type IN ('required', 'optional', 'conditional')),
    condition_expression TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, depends_on_field_id)
);

-- Metadata Field Versions
CREATE TABLE IF NOT EXISTS metadata_field_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    field_data JSONB NOT NULL,
    change_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, version_number)
);

-- Metadata Field Comments
CREATE TABLE IF NOT EXISTS metadata_field_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    comment_type TEXT NOT NULL CHECK (comment_type IN ('note', 'question', 'suggestion', 'issue')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Metadata Field Tags
CREATE TABLE IF NOT EXISTS metadata_field_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_category TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, tag_name)
);

-- Metadata Field Synonyms
CREATE TABLE IF NOT EXISTS metadata_field_synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    synonym_text TEXT NOT NULL,
    language_code TEXT DEFAULT 'en',
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, synonym_text, language_code)
);

-- Metadata Field Translations
CREATE TABLE IF NOT EXISTS metadata_field_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,
    translated_name TEXT NOT NULL,
    translated_description TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, language_code)
);

-- Metadata Field Access Control
CREATE TABLE IF NOT EXISTS metadata_field_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'admin')),
    organization_id UUID,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(field_id, role_name, organization_id)
);

-- Metadata Field Audit Trail
CREATE TABLE IF NOT EXISTS metadata_field_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'edit', 'delete', 'export', 'import')),
    user_id TEXT NOT NULL,
    organization_id UUID,
    ip_address INET,
    user_agent TEXT,
    action_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_metadata_registry_field_name ON metadata_registry(field_name);
CREATE INDEX IF NOT EXISTS idx_metadata_registry_domain ON metadata_registry(domain);
CREATE INDEX IF NOT EXISTS idx_metadata_registry_status ON metadata_registry(status);
CREATE INDEX IF NOT EXISTS idx_metadata_registry_usage_count ON metadata_registry(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_metadata_registry_tags ON metadata_registry USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_metadata_registry_synonyms ON metadata_registry USING GIN(synonyms);

CREATE INDEX IF NOT EXISTS idx_local_metadata_org_table ON local_metadata(organization_id, table_name);
CREATE INDEX IF NOT EXISTS idx_local_metadata_is_mapped ON local_metadata(is_mapped);
CREATE INDEX IF NOT EXISTS idx_local_metadata_confidence ON local_metadata(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_metadata_usage_field_org ON metadata_usage(field_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_metadata_usage_last_used ON metadata_usage(last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_metadata_change_log_field ON metadata_change_log(field_id);
CREATE INDEX IF NOT EXISTS idx_metadata_change_log_changed_at ON metadata_change_log(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_metadata_relationships_source ON metadata_relationships(source_field_id);
CREATE INDEX IF NOT EXISTS idx_metadata_relationships_target ON metadata_relationships(target_field_id);

-- Functions for Metadata Management
CREATE OR REPLACE FUNCTION increment_metadata_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE metadata_registry 
    SET usage_count = usage_count + 1, last_used_at = NOW()
    WHERE id = NEW.field_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_metadata_usage
    AFTER INSERT ON metadata_usage
    FOR EACH ROW
    EXECUTE FUNCTION increment_metadata_usage();

-- Function to update metadata field version
CREATE OR REPLACE FUNCTION update_metadata_field_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.field_name != NEW.field_name OR 
       OLD.data_type != NEW.data_type OR 
       OLD.description != NEW.description OR
       OLD.domain != NEW.domain OR
       OLD.status != NEW.status THEN
        
        INSERT INTO metadata_field_versions (
            field_id, 
            version_number, 
            field_data, 
            change_summary,
            created_by
        ) VALUES (
            OLD.id,
            OLD.version + 1,
            to_jsonb(OLD),
            'Field updated',
            NEW.updated_by
        );
        
        NEW.version = OLD.version + 1;
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_metadata_field_version
    BEFORE UPDATE ON metadata_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_metadata_field_version();

-- Function to log metadata changes
CREATE OR REPLACE FUNCTION log_metadata_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO metadata_change_log (
            field_id, 
            change_type, 
            new_value, 
            changed_by
        ) VALUES (
            NEW.id,
            'created',
            to_jsonb(NEW),
            NEW.created_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO metadata_change_log (
            field_id, 
            change_type, 
            old_value, 
            new_value, 
            changed_by
        ) VALUES (
            NEW.id,
            'updated',
            to_jsonb(OLD),
            to_jsonb(NEW),
            COALESCE(NEW.updated_by, NEW.created_by)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO metadata_change_log (
            field_id, 
            change_type, 
            old_value, 
            changed_by
        ) VALUES (
            OLD.id,
            'deleted',
            to_jsonb(OLD),
            'system'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_metadata_change
    AFTER INSERT OR UPDATE OR DELETE ON metadata_registry
    FOR EACH ROW
    EXECUTE FUNCTION log_metadata_change();

-- Function to suggest similar fields
CREATE OR REPLACE FUNCTION suggest_similar_fields(
    search_field_name TEXT,
    search_data_type TEXT DEFAULT NULL,
    search_domain TEXT DEFAULT NULL,
    similarity_threshold NUMERIC DEFAULT 0.3
)
RETURNS TABLE (
    field_id UUID,
    field_name TEXT,
    data_type TEXT,
    description TEXT,
    domain TEXT,
    confidence NUMERIC,
    match_type TEXT,
    usage_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.field_name,
        mr.data_type,
        mr.description,
        mr.domain,
        CASE 
            WHEN LOWER(mr.field_name) = LOWER(search_field_name) THEN 1.0
            WHEN LOWER(mr.field_name) LIKE '%' || LOWER(search_field_name) || '%' 
                 OR LOWER(search_field_name) LIKE '%' || LOWER(mr.field_name) || '%' THEN 0.8
            WHEN search_field_name % mr.field_name THEN 0.6
            WHEN search_field_name % ANY(mr.synonyms) THEN 0.5
            ELSE 0.3
        END as confidence,
        CASE 
            WHEN LOWER(mr.field_name) = LOWER(search_field_name) THEN 'exact'
            WHEN LOWER(mr.field_name) LIKE '%' || LOWER(search_field_name) || '%' 
                 OR LOWER(search_field_name) LIKE '%' || LOWER(mr.field_name) || '%' THEN 'fuzzy'
            WHEN search_field_name % ANY(mr.synonyms) THEN 'synonym'
            ELSE 'semantic'
        END as match_type,
        mr.usage_count
    FROM metadata_registry mr
    WHERE mr.status = 'active'
      AND (
        LOWER(mr.field_name) = LOWER(search_field_name)
        OR LOWER(mr.field_name) LIKE '%' || LOWER(search_field_name) || '%'
        OR LOWER(search_field_name) LIKE '%' || LOWER(mr.field_name) || '%'
        OR search_field_name % mr.field_name
        OR search_field_name % ANY(mr.synonyms)
      )
      AND (search_data_type IS NULL OR mr.data_type = search_data_type)
      AND (search_domain IS NULL OR mr.domain = search_domain)
      AND CASE 
            WHEN LOWER(mr.field_name) = LOWER(search_field_name) THEN 1.0
            WHEN LOWER(mr.field_name) LIKE '%' || LOWER(search_field_name) || '%' 
                 OR LOWER(search_field_name) LIKE '%' || LOWER(mr.field_name) || '%' THEN 0.8
            WHEN search_field_name % mr.field_name THEN 0.6
            WHEN search_field_name % ANY(mr.synonyms) THEN 0.5
            ELSE 0.3
          END >= similarity_threshold
    ORDER BY confidence DESC, usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get governance metrics
CREATE OR REPLACE FUNCTION get_metadata_governance_metrics(org_id UUID)
RETURNS TABLE (
    total_local_fields BIGINT,
    mapped_fields BIGINT,
    unmapped_fields BIGINT,
    mapping_rate NUMERIC,
    total_usage BIGINT,
    fields_needing_review BIGINT,
    duplicate_candidates_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH local_stats AS (
        SELECT 
            COUNT(*) as total_local,
            COUNT(*) FILTER (WHERE is_mapped) as mapped,
            COUNT(*) FILTER (WHERE NOT is_approved) as needs_review
        FROM local_metadata 
        WHERE organization_id = org_id
    ),
    usage_stats AS (
        SELECT COALESCE(SUM(usage_count), 0) as total_usage
        FROM metadata_usage 
        WHERE organization_id = org_id
    ),
    duplicate_candidates AS (
        SELECT COUNT(*) as duplicate_count
        FROM (
            SELECT lm1.field_name, lm1.data_type
            FROM local_metadata lm1
            WHERE lm1.organization_id = org_id AND lm1.is_mapped = false
            GROUP BY lm1.field_name, lm1.data_type
            HAVING COUNT(*) > 1
        ) duplicates
    )
    SELECT 
        ls.total_local,
        ls.mapped,
        ls.total_local - ls.mapped,
        CASE 
            WHEN ls.total_local > 0 THEN (ls.mapped::NUMERIC / ls.total_local) * 100
            ELSE 0
        END,
        us.total_usage,
        ls.needs_review,
        dc.duplicate_count
    FROM local_stats ls, usage_stats us, duplicate_candidates dc;
END;
$$ LANGUAGE plpgsql;

-- Insert some default metadata fields for common accounting scenarios
INSERT INTO metadata_registry (
    field_name, data_type, description, domain, is_custom, created_by, 
    business_owner, technical_owner, status, tags, synonyms
) VALUES 
-- Accounting Domain
('account_number', 'short_text', 'Unique account identifier in chart of accounts', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['core', 'identifier'], ARRAY['account_code', 'account_id']),
('account_name', 'short_text', 'Human-readable account name', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['core', 'name'], ARRAY['account_title', 'account_description']),
('account_type', 'dropdown', 'Type of account (Asset, Liability, Equity, Revenue, Expense)', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['core', 'classification'], ARRAY['account_category', 'account_class']),
('account_balance', 'currency', 'Current balance of the account', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['core', 'balance'], ARRAY['balance', 'current_balance']),
('opening_balance', 'currency', 'Opening balance at the beginning of the period', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['balance', 'opening'], ARRAY['beginning_balance', 'starting_balance']),
('closing_balance', 'currency', 'Closing balance at the end of the period', 'accounting', false, 'system', 'system', 'system', 'active', ARRAY['balance', 'closing'], ARRAY['ending_balance', 'final_balance']),

-- Finance Domain
('transaction_date', 'short_date', 'Date when the transaction occurred', 'finance', false, 'system', 'system', 'system', 'active', ARRAY['core', 'date'], ARRAY['date', 'txn_date', 'transaction_date']),
('transaction_amount', 'currency', 'Monetary amount of the transaction', 'finance', false, 'system', 'system', 'system', 'active', ARRAY['core', 'amount'], ARRAY['amount', 'txn_amount', 'transaction_amount']),
('transaction_type', 'dropdown', 'Type of transaction (Debit, Credit)', 'finance', false, 'system', 'system', 'system', 'active', ARRAY['core', 'type'], ARRAY['type', 'txn_type', 'transaction_type']),
('reference_number', 'short_text', 'External reference number for the transaction', 'finance', false, 'system', 'system', 'system', 'active', ARRAY['reference'], ARRAY['ref_no', 'reference_no', 'external_reference']),
('description', 'long_text', 'Detailed description of the transaction', 'finance', false, 'system', 'system', 'system', 'active', ARRAY['core', 'description'], ARRAY['txn_description', 'transaction_description']),

-- Tax Domain
('tax_code', 'short_text', 'Tax code identifier', 'tax', false, 'system', 'system', 'system', 'active', ARRAY['tax', 'code'], ARRAY['tax_code', 'tax_identifier']),
('tax_rate', 'percentage', 'Tax rate percentage', 'tax', false, 'system', 'system', 'system', 'active', ARRAY['tax', 'rate'], ARRAY['rate', 'tax_percentage']),
('tax_amount', 'currency', 'Calculated tax amount', 'tax', false, 'system', 'system', 'system', 'active', ARRAY['tax', 'amount'], ARRAY['tax_amount', 'tax_value']),
('tax_type', 'dropdown', 'Type of tax (GST, SST, Income Tax, etc.)', 'tax', false, 'system', 'system', 'system', 'active', ARRAY['tax', 'type'], ARRAY['tax_category', 'tax_classification']),

-- Customer Domain
('customer_name', 'short_text', 'Name of the customer', 'customer', false, 'system', 'system', 'system', 'active', ARRAY['customer', 'name'], ARRAY['client_name', 'customer_title']),
('customer_email', 'email', 'Email address of the customer', 'customer', false, 'system', 'system', 'system', 'active', ARRAY['customer', 'contact'], ARRAY['email', 'customer_email']),
('customer_phone', 'phone', 'Phone number of the customer', 'customer', false, 'system', 'system', 'system', 'active', ARRAY['customer', 'contact'], ARRAY['phone', 'customer_phone']),
('customer_address', 'long_text', 'Address of the customer', 'customer', false, 'system', 'system', 'system', 'active', ARRAY['customer', 'address'], ARRAY['address', 'customer_address']),

-- Vendor Domain
('vendor_name', 'short_text', 'Name of the vendor/supplier', 'vendor', false, 'system', 'system', 'system', 'active', ARRAY['vendor', 'name'], ARRAY['supplier_name', 'vendor_title']),
('vendor_email', 'email', 'Email address of the vendor', 'vendor', false, 'system', 'system', 'system', 'active', ARRAY['vendor', 'contact'], ARRAY['email', 'vendor_email']),
('vendor_phone', 'phone', 'Phone number of the vendor', 'vendor', false, 'system', 'system', 'system', 'active', ARRAY['vendor', 'contact'], ARRAY['phone', 'vendor_phone']),
('vendor_address', 'long_text', 'Address of the vendor', 'vendor', false, 'system', 'system', 'system', 'active', ARRAY['vendor', 'address'], ARRAY['address', 'vendor_address']),

-- Compliance Domain
('compliance_status', 'dropdown', 'Compliance status (Compliant, Non-Compliant, Pending)', 'compliance', false, 'system', 'system', 'system', 'active', ARRAY['compliance', 'status'], ARRAY['status', 'compliance_status']),
('audit_date', 'short_date', 'Date of the audit', 'compliance', false, 'system', 'system', 'system', 'active', ARRAY['audit', 'date'], ARRAY['date', 'audit_date']),
('auditor_name', 'short_text', 'Name of the auditor', 'compliance', false, 'system', 'system', 'system', 'active', ARRAY['audit', 'auditor'], ARRAY['auditor', 'auditor_name']),
('compliance_notes', 'long_text', 'Notes related to compliance', 'compliance', false, 'system', 'system', 'system', 'active', ARRAY['compliance', 'notes'], ARRAY['notes', 'compliance_notes'])

ON CONFLICT (field_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_organizations_parent_id ON organizations(parent_org_id);
CREATE INDEX idx_organization_users_org_id ON organization_users(organization_id);
CREATE INDEX idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX idx_chart_of_accounts_org_id ON chart_of_accounts(organization_id);
CREATE INDEX idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_account_id);
CREATE INDEX idx_journal_entries_org_id ON journal_entries(organization_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entry_lines_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX idx_general_ledger_org_account ON general_ledger(organization_id, account_id);
CREATE INDEX idx_general_ledger_period ON general_ledger(period_start, period_end);
CREATE INDEX idx_customers_org_id ON customers(organization_id);
CREATE INDEX idx_vendors_org_id ON vendors(organization_id);
CREATE INDEX idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_bills_org_id ON bills(organization_id);
CREATE INDEX idx_bills_vendor_id ON bills(vendor_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_org_id ON payments(organization_id);
CREATE INDEX idx_bank_transactions_org_id ON bank_transactions(organization_id);
CREATE INDEX idx_bank_transactions_account_id ON bank_transactions(bank_account_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_kpi_metrics_org_date ON kpi_metrics(organization_id, metric_date);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples - will be enhanced in auth package)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their organizations" ON organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_users 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);

-- ========================================
-- REPORT DESIGNER SCHEMA
-- ========================================

-- Report Settings (Main table for storing report configurations)
CREATE TABLE IF NOT EXISTS report_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    layout JSONB NOT NULL, -- ReportLayout object
    fields JSONB NOT NULL, -- ReportField[] array
    filters JSONB DEFAULT '[]', -- ReportFilter[] array
    sorting JSONB DEFAULT '[]', -- ReportSort[] array
    grouping JSONB DEFAULT '[]', -- ReportGroup[] array
    computed_fields JSONB DEFAULT '[]', -- ComputedField[] array
    schedule JSONB, -- ReportSchedule object
    permissions JSONB NOT NULL, -- ReportPermissions object
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'general',
    thumbnail_url TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Report Executions (Track report generation history)
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    executed_by TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    format TEXT NOT NULL CHECK (format IN ('pdf', 'html', 'excel', 'csv')),
    file_url TEXT,
    file_size INTEGER,
    row_count INTEGER,
    execution_time INTEGER, -- milliseconds
    error_message TEXT,
    parameters JSONB, -- Runtime parameters passed to report
    organization_id UUID NOT NULL,
    tenant_group_id UUID
);

-- Report Templates (Pre-built templates for common report types)
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    thumbnail_url TEXT,
    default_layout JSONB NOT NULL,
    default_fields JSONB NOT NULL,
    supported_formats TEXT[] NOT NULL,
    max_fields INTEGER DEFAULT 50,
    recommended_use TEXT[],
    is_system_template BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'archived'))
);

-- Report Sharing (Control who can access reports)
CREATE TABLE IF NOT EXISTS report_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    shared_with TEXT NOT NULL, -- user_id or role
    shared_by TEXT NOT NULL,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'edit', 'admin')),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Report Comments (Collaboration on reports)
CREATE TABLE IF NOT EXISTS report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    comment_type TEXT NOT NULL CHECK (comment_type IN ('note', 'question', 'suggestion', 'issue')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    parent_comment_id UUID REFERENCES report_comments(id) ON DELETE CASCADE
);

-- Report Favorites (User's favorite reports)
CREATE TABLE IF NOT EXISTS report_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, user_id)
);

-- Report Analytics (Track report usage and performance)
CREATE TABLE IF NOT EXISTS report_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    organization_id UUID NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'edit', 'execute', 'share', 'export')),
    action_details JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time INTEGER, -- milliseconds
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Report Data Sources (Define where report data comes from)
CREATE TABLE IF NOT EXISTS report_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('table', 'view', 'function', 'api')),
    source_definition JSONB NOT NULL, -- SQL query, API endpoint, etc.
    connection_string TEXT, -- For external data sources
    refresh_frequency TEXT, -- For cached data sources
    last_refresh_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Schedules (Automated report generation)
CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    time TIME NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    recipients TEXT[] NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('pdf', 'html', 'excel', 'csv')),
    parameters JSONB, -- Default parameters for scheduled execution
    is_active BOOLEAN DEFAULT TRUE,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    next_execution_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Versions (Version control for reports)
CREATE TABLE IF NOT EXISTS report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    report_data JSONB NOT NULL, -- Complete report configuration
    change_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, version_number)
);

-- Report Export History (Track exported files)
CREATE TABLE IF NOT EXISTS report_export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES report_settings(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES report_executions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    format TEXT NOT NULL,
    exported_by TEXT NOT NULL,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_report_settings_org ON report_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_settings_created_by ON report_settings(created_by);
CREATE INDEX IF NOT EXISTS idx_report_settings_status ON report_settings(status);
CREATE INDEX IF NOT EXISTS idx_report_settings_category ON report_settings(category);
CREATE INDEX IF NOT EXISTS idx_report_settings_updated_at ON report_settings(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_status ON report_executions(status);
CREATE INDEX IF NOT EXISTS idx_report_executions_executed_at ON report_executions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_executions_org ON report_executions(organization_id);

CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_status ON report_templates(status);

CREATE INDEX IF NOT EXISTS idx_report_sharing_report ON report_sharing(report_id);
CREATE INDEX IF NOT EXISTS idx_report_sharing_shared_with ON report_sharing(shared_with);
CREATE INDEX IF NOT EXISTS idx_report_sharing_active ON report_sharing(is_active);

CREATE INDEX IF NOT EXISTS idx_report_comments_report ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_created_at ON report_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_favorites_user ON report_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_report_favorites_org ON report_favorites(organization_id);

CREATE INDEX IF NOT EXISTS idx_report_analytics_report ON report_analytics(report_id);
CREATE INDEX IF NOT EXISTS idx_report_analytics_user ON report_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_report_analytics_action ON report_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_report_analytics_executed_at ON report_analytics(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_schedules_report ON report_schedules(report_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_active ON report_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_report_schedules_next_execution ON report_schedules(next_execution_at);

-- Functions for Report Management

-- Function to increment report usage count
CREATE OR REPLACE FUNCTION increment_report_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE report_settings 
    SET usage_count = usage_count + 1, last_used_at = NOW()
    WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_usage
    AFTER INSERT ON report_executions
    FOR EACH ROW
    EXECUTE FUNCTION increment_report_usage();

-- Function to log report changes
CREATE OR REPLACE FUNCTION log_report_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO report_versions (
            report_id, 
            version_number, 
            report_data, 
            change_summary,
            created_by
        ) VALUES (
            NEW.id,
            1,
            to_jsonb(NEW),
            'Initial version',
            NEW.created_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO report_versions (
            report_id, 
            version_number, 
            report_data, 
            change_summary,
            created_by
        ) VALUES (
            NEW.id,
            OLD.version + 1,
            to_jsonb(NEW),
            'Report updated',
            COALESCE(NEW.updated_by, NEW.created_by)
        );
        NEW.version = OLD.version + 1;
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_report_changes
    BEFORE INSERT OR UPDATE ON report_settings
    FOR EACH ROW
    EXECUTE FUNCTION log_report_changes();

-- Function to execute dynamic reports
CREATE OR REPLACE FUNCTION execute_dynamic_report(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    EXECUTE 'SELECT jsonb_agg(to_jsonb(t)) FROM (' || sql_query || ') t' INTO result;
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error executing dynamic report: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get report statistics
CREATE OR REPLACE FUNCTION get_report_statistics(org_id UUID)
RETURNS TABLE (
    total_reports BIGINT,
    active_reports BIGINT,
    total_executions BIGINT,
    avg_execution_time NUMERIC,
    most_used_report TEXT,
    most_used_template TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH report_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            SUM(usage_count) as total_usage
        FROM report_settings 
        WHERE organization_id = org_id
    ),
    execution_stats AS (
        SELECT 
            COUNT(*) as total_executions,
            AVG(execution_time) as avg_time
        FROM report_executions 
        WHERE organization_id = org_id
    ),
    popular_reports AS (
        SELECT name, usage_count
        FROM report_settings 
        WHERE organization_id = org_id 
        ORDER BY usage_count DESC 
        LIMIT 1
    ),
    popular_templates AS (
        SELECT layout->>'template' as template_name, COUNT(*) as usage
        FROM report_settings 
        WHERE organization_id = org_id 
        GROUP BY layout->>'template'
        ORDER BY usage DESC 
        LIMIT 1
    )
    SELECT 
        rs.total,
        rs.active,
        es.total_executions,
        es.avg_time,
        pr.name,
        pt.template_name
    FROM report_stats rs, execution_stats es, popular_reports pr, popular_templates pt;
END;
$$ LANGUAGE plpgsql;

-- Insert default report templates
INSERT INTO report_templates (
    name, display_name, description, category, default_layout, default_fields, 
    supported_formats, max_fields, recommended_use, is_system_template, created_by
) VALUES 
(
    'simple_table',
    'Simple Table',
    'Basic table layout for any data',
    'General',
    '{"template": "simple_table", "header": {"title": "Report Title"}, "footer": {"text": "Generated by AIBOS", "page_numbers": true}, "styling": {"font_family": "Arial", "font_size": 12, "primary_color": "#2563eb"}, "page": {"orientation": "portrait", "size": "a4", "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20}}}',
    '[]',
    ARRAY['pdf', 'html', 'excel', 'csv'],
    50,
    ARRAY['Data lists', 'Simple reports', 'Quick views'],
    true,
    'system'
),
(
    'financial_statement',
    'Financial Statement',
    'Professional financial report layout',
    'Finance',
    '{"template": "financial_statement", "header": {"title": "Financial Statement"}, "footer": {"text": "Generated by AIBOS", "page_numbers": true}, "styling": {"font_family": "Times New Roman", "font_size": 12, "primary_color": "#1f2937"}, "page": {"orientation": "portrait", "size": "a4", "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20}}}',
    '[{"field_name": "account_name", "label": "Account Name", "data_type": "text", "source_type": "hard_metadata", "display_order": 1, "is_visible": true, "alignment": "left"}, {"field_name": "account_balance", "label": "Balance", "data_type": "currency", "source_type": "hard_metadata", "display_order": 2, "is_visible": true, "alignment": "right", "formatting": {"decimal_places": 2, "currency_symbol": "$"}, "aggregation": "sum"}]',
    ARRAY['pdf', 'html', 'excel'],
    20,
    ARRAY['Balance sheets', 'Income statements', 'Trial balances'],
    true,
    'system'
),
(
    'invoice_report',
    'Invoice Report',
    'Invoice listing with customer details',
    'Sales',
    '{"template": "invoice_report", "header": {"title": "Invoice Report"}, "footer": {"text": "Generated by AIBOS", "page_numbers": true}, "styling": {"font_family": "Arial", "font_size": 11, "primary_color": "#059669"}, "page": {"orientation": "landscape", "size": "a4", "margins": {"top": 15, "bottom": 15, "left": 15, "right": 15}}}',
    '[{"field_name": "invoice_number", "label": "Invoice #", "data_type": "text", "source_type": "hard_metadata", "display_order": 1, "is_visible": true}, {"field_name": "customer_name", "label": "Customer", "data_type": "text", "source_type": "hard_metadata", "display_order": 2, "is_visible": true}, {"field_name": "invoice_date", "label": "Date", "data_type": "date", "source_type": "hard_metadata", "display_order": 3, "is_visible": true, "formatting": {"date_format": "MM/DD/YYYY"}}, {"field_name": "invoice_amount", "label": "Amount", "data_type": "currency", "source_type": "hard_metadata", "display_order": 4, "is_visible": true, "alignment": "right", "formatting": {"decimal_places": 2, "currency_symbol": "$"}, "aggregation": "sum"}]',
    ARRAY['pdf', 'html', 'excel'],
    15,
    ARRAY['Invoice listings', 'Sales reports', 'Customer analysis'],
    true,
    'system'
),
(
    'modern_card',
    'Modern Card Layout',
    'Card-based layout for modern reports',
    'Modern',
    '{"template": "modern_card", "header": {"title": "Modern Report"}, "footer": {"text": "Generated by AIBOS"}, "styling": {"font_family": "Inter", "font_size": 14, "primary_color": "#7c3aed", "secondary_color": "#f3f4f6"}, "page": {"orientation": "portrait", "size": "a4", "margins": {"top": 25, "bottom": 25, "left": 25, "right": 25}}}',
    '[]',
    ARRAY['pdf', 'html'],
    10,
    ARRAY['Dashboards', 'Summary reports', 'Executive briefings'],
    true,
    'system'
)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- MULTI-ENTITY GOVERNANCE SYSTEM
-- ========================================

-- Entities table for multi-entity management
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(500) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'PublicCompany', 'PrivateCompany', 'GovernmentLinked', 'Branch', 
        'Holding', 'Subsidiary', 'JointVenture', 'Partnership', 'Trust', 'Foundation'
    )),
    country_code VARCHAR(2) NOT NULL CHECK (country_code IN ('MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM')),
    parent_entity_id UUID REFERENCES entities(id),
    registration_number VARCHAR(100) NOT NULL,
    tax_id VARCHAR(50),
    industry_sector VARCHAR(100) NOT NULL CHECK (industry_sector IN (
        'Agriculture', 'Manufacturing', 'Construction', 'Retail', 'Financial', 
        'Technology', 'Healthcare', 'Transportation', 'Energy', 'Telecommunications',
        'RealEstate', 'Professional', 'Education', 'Entertainment', 'Hospitality',
        'Mining', 'Utilities', 'Media', 'Logistics', 'Insurance'
    )),
    ownership_type VARCHAR(50) NOT NULL CHECK (ownership_type IN (
        'Private', 'Public', 'Government', 'Foreign', 'Institutional', 'FamilyOwned'
    )),
    incorporation_date DATE NOT NULL,
    financial_year_end DATE NOT NULL,
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN (
        'Active', 'Inactive', 'PendingApproval', 'Suspended', 'InLiquidation', 'StruckOff'
    )),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Enhanced fields for SEA consolidation
    timezone VARCHAR(10) NOT NULL DEFAULT 'GMT+8',
    reporting_currency VARCHAR(3) NOT NULL,
    consolidation_group VARCHAR(100) DEFAULT 'default',
    direct_company BOOLEAN DEFAULT false,
    associate_type VARCHAR(50) CHECK (associate_type IN ('Direct', 'Associate', 'JointVenture', 'Subsidiary')),
    
    -- Beneficial owners
    beneficial_owners JSONB DEFAULT '[]',
    
    -- Shareholding structure
    shareholding_structure JSONB DEFAULT '{}',
    
    -- Regulatory compliance
    regulatory_compliance JSONB DEFAULT '{}',
    
    -- Audit information
    audit_firm VARCHAR(255),
    audit_partner VARCHAR(255),
    
    -- Board and management
    board_members JSONB DEFAULT '[]',
    key_management JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT unique_registration_per_country UNIQUE (country_code, registration_number),
    CONSTRAINT valid_tax_id_format CHECK (
        (country_code = 'SG' AND tax_id ~ '^[0-9]{8}[A-Z]$') OR
        (country_code = 'MY' AND tax_id ~ '^[0-9]{12}$') OR
        (country_code = 'TH' AND tax_id ~ '^[0-9]{13}$') OR
        (country_code = 'ID' AND tax_id ~ '^[0-9]{15}$') OR
        (country_code = 'PH' AND tax_id ~ '^[0-9]{9}-[0-9]{3}$') OR
        (country_code = 'VN' AND tax_id ~ '^[0-9]{10}$') OR
        (country_code = 'BN' AND tax_id ~ '^[0-9]{11}$') OR
        (country_code = 'KH' AND tax_id ~ '^[0-9]{9}$') OR
        (country_code = 'LA' AND tax_id ~ '^[0-9]{10}$') OR
        (country_code = 'MM' AND tax_id ~ '^[0-9]{9}$') OR
        tax_id IS NULL
    )
);

-- Entity relationships table
CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    child_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('Subsidiary', 'Associate', 'JointVenture', 'Branch')),
    ownership_percentage DECIMAL(5,2) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    voting_rights_percentage DECIMAL(5,2) NOT NULL CHECK (voting_rights_percentage >= 0 AND voting_rights_percentage <= 100),
    effective_date DATE NOT NULL,
    termination_date DATE,
    consolidation_method VARCHAR(50) NOT NULL DEFAULT 'Full' CHECK (consolidation_method IN ('Full', 'Equity', 'Proportional')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_entity_relationship UNIQUE (parent_entity_id, child_entity_id),
    CONSTRAINT valid_termination_date CHECK (termination_date IS NULL OR termination_date >= effective_date)
);

-- Consolidation groups table
CREATE TABLE IF NOT EXISTS consolidation_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_entity_id UUID REFERENCES entities(id),
    consolidation_method VARCHAR(50) NOT NULL DEFAULT 'Full' CHECK (consolidation_method IN ('Full', 'Equity', 'Proportional')),
    reporting_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(10) NOT NULL DEFAULT 'GMT+8',
    fiscal_year_end DATE NOT NULL,
    consolidation_entities UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_group_name UNIQUE (name)
);

-- Consolidation reports table
CREATE TABLE IF NOT EXISTS consolidation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES consolidation_groups(id) ON DELETE CASCADE,
    reporting_period VARCHAR(10) NOT NULL, -- YYYY-MM format
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('Monthly', 'Quarterly', 'Annual')),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'InReview', 'Final', 'Filed')),
    
    -- Financial metrics
    total_assets DECIMAL(20,2) DEFAULT 0,
    total_liabilities DECIMAL(20,2) DEFAULT 0,
    total_equity DECIMAL(20,2) DEFAULT 0,
    revenue DECIMAL(20,2) DEFAULT 0,
    profit_before_tax DECIMAL(20,2) DEFAULT 0,
    profit_after_tax DECIMAL(20,2) DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rates JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    reviewed_by UUID,
    filed_date TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_report_period UNIQUE (group_id, reporting_period, report_type)
);

-- Compliance requirements table
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL CHECK (country_code IN ('MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM')),
    jurisdiction_level VARCHAR(20) NOT NULL CHECK (jurisdiction_level IN ('National', 'State', 'Local')),
    entity_types VARCHAR(50)[] NOT NULL,
    industry_sectors VARCHAR(100)[] NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    legal_reference VARCHAR(500),
    regulatory_body VARCHAR(255),
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'AdHoc')),
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Tax', 'Corporate', 'Financial', 'Environmental', 'Labor', 'DataPrivacy', 'Industry'
    )),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    penalty_amount DECIMAL(15,2),
    penalty_currency VARCHAR(3) DEFAULT 'USD',
    grace_period_days INTEGER DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entity compliance tracking table
CREATE TABLE IF NOT EXISTS entity_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    compliance_requirement_id UUID NOT NULL REFERENCES compliance_requirements(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'InProgress', 'Completed', 'Overdue', 'Exempt')),
    completion_date DATE,
    submitted_by UUID,
    reviewed_by UUID,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    notes TEXT,
    documents JSONB DEFAULT '[]',
    extensions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_entity_compliance UNIQUE (entity_id, compliance_requirement_id)
);

-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    risk_category VARCHAR(100) NOT NULL CHECK (risk_category IN (
        'Operational', 'Financial', 'Compliance', 'Strategic', 'Reputational', 'Technology', 'Environmental'
    )),
    risk_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    root_cause TEXT,
    likelihood VARCHAR(20) NOT NULL CHECK (likelihood IN ('VeryLow', 'Low', 'Medium', 'High', 'VeryHigh')),
    impact VARCHAR(20) NOT NULL CHECK (impact IN ('VeryLow', 'Low', 'Medium', 'High', 'VeryHigh')),
    risk_score INTEGER NOT NULL CHECK (risk_score >= 1 AND risk_score <= 25),
    inherent_risk_score INTEGER CHECK (inherent_risk_score >= 1 AND inherent_risk_score <= 25),
    residual_risk_score INTEGER CHECK (residual_risk_score >= 1 AND residual_risk_score <= 25),
    mitigation_plan TEXT,
    mitigation_deadline DATE,
    mitigation_status VARCHAR(50) NOT NULL DEFAULT 'NotStarted' CHECK (mitigation_status IN ('NotStarted', 'InProgress', 'Completed', 'OnHold')),
    owner_id UUID NOT NULL,
    reviewer_id UUID,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board committees table
CREATE TABLE IF NOT EXISTS board_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    charter_url VARCHAR(500),
    formation_date DATE NOT NULL,
    dissolution_date DATE,
    members JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shareholders table
CREATE TABLE IF NOT EXISTS shareholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Individual', 'Institution', 'Government')),
    ownership_percentage DECIMAL(5,2) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    shares_held BIGINT NOT NULL,
    share_class VARCHAR(50) NOT NULL,
    voting_rights DECIMAL(5,2) NOT NULL CHECK (voting_rights >= 0 AND voting_rights <= 100),
    dividend_rights DECIMAL(5,2) NOT NULL CHECK (dividend_rights >= 0 AND dividend_rights <= 100),
    nationality VARCHAR(2) CHECK (nationality IN ('MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM')),
    beneficial_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table for entity changes
CREATE TABLE IF NOT EXISTS entity_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'COMPLIANCE_UPDATE')),
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_country_code ON entities(country_code);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_parent_id ON entities(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_consolidation_group ON entities(consolidation_group);
CREATE INDEX IF NOT EXISTS idx_entities_compliance_score ON entities(compliance_score);
CREATE INDEX IF NOT EXISTS idx_entities_risk_score ON entities(risk_score);

CREATE INDEX IF NOT EXISTS idx_entity_relationships_parent ON entity_relationships(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_child ON entity_relationships(child_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_type ON entity_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_consolidation_reports_group ON consolidation_reports(group_id);
CREATE INDEX IF NOT EXISTS idx_consolidation_reports_period ON consolidation_reports(reporting_period);
CREATE INDEX IF NOT EXISTS idx_consolidation_reports_status ON consolidation_reports(status);

CREATE INDEX IF NOT EXISTS idx_entity_compliance_entity ON entity_compliance(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_compliance_status ON entity_compliance(status);
CREATE INDEX IF NOT EXISTS idx_entity_compliance_due_date ON entity_compliance(due_date);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_entity ON risk_assessments(entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_category ON risk_assessments(risk_category);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score ON risk_assessments(risk_score);

CREATE INDEX IF NOT EXISTS idx_entity_audit_logs_entity ON entity_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_audit_logs_user ON entity_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_audit_logs_created ON entity_audit_logs(created_at);

-- Triggers for audit logging
CREATE OR REPLACE FUNCTION log_entity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO entity_audit_logs (entity_id, user_id, action, new_value)
        VALUES (NEW.id, NEW.created_by, 'CREATE', row_to_json(NEW)::text);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO entity_audit_logs (entity_id, user_id, action, old_value, new_value)
        VALUES (NEW.id, NEW.updated_by, 'UPDATE', row_to_json(OLD)::text, row_to_json(NEW)::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO entity_audit_logs (entity_id, user_id, action, old_value)
        VALUES (OLD.id, OLD.updated_by, 'DELETE', row_to_json(OLD)::text);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entity_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON entities
    FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER trigger_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_entity_relationships_updated_at
    BEFORE UPDATE ON entity_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_consolidation_groups_updated_at
    BEFORE UPDATE ON consolidation_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_consolidation_reports_updated_at
    BEFORE UPDATE ON consolidation_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_entity_compliance_updated_at
    BEFORE UPDATE ON entity_compliance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_risk_assessments_updated_at
    BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_entity_compliance_score(entity_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_requirements INTEGER;
    completed_requirements INTEGER;
    score INTEGER;
BEGIN
    -- Count total applicable requirements
    SELECT COUNT(*) INTO total_requirements
    FROM compliance_requirements cr
    WHERE cr.country_code = (SELECT country_code FROM entities WHERE id = entity_uuid)
    AND cr.entity_types @> ARRAY[(SELECT entity_type FROM entities WHERE id = entity_uuid)]
    AND cr.industry_sectors @> ARRAY[(SELECT industry_sector FROM entities WHERE id = entity_uuid)];

    -- Count completed requirements
    SELECT COUNT(*) INTO completed_requirements
    FROM entity_compliance ec
    JOIN compliance_requirements cr ON ec.compliance_requirement_id = cr.id
    WHERE ec.entity_id = entity_uuid
    AND ec.status = 'Completed'
    AND cr.country_code = (SELECT country_code FROM entities WHERE id = entity_uuid)
    AND cr.entity_types @> ARRAY[(SELECT entity_type FROM entities WHERE id = entity_uuid)]
    AND cr.industry_sectors @> ARRAY[(SELECT industry_sector FROM entities WHERE id = entity_uuid)];

    -- Calculate score
    IF total_requirements > 0 THEN
        score := (completed_requirements * 100) / total_requirements;
    ELSE
        score := 100;
    END IF;

    -- Update entity compliance score
    UPDATE entities SET compliance_score = score WHERE id = entity_uuid;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to get entity hierarchy
CREATE OR REPLACE FUNCTION get_entity_hierarchy(entity_uuid UUID)
RETURNS TABLE (
    level INTEGER,
    entity_id UUID,
    entity_name VARCHAR(255),
    entity_type VARCHAR(50),
    country_code VARCHAR(2),
    relationship_type VARCHAR(50),
    ownership_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy AS (
        -- Base case: the starting entity
        SELECT 
            0 as level,
            e.id as entity_id,
            e.name as entity_name,
            e.entity_type,
            e.country_code,
            NULL::VARCHAR(50) as relationship_type,
            100.0 as ownership_percentage
        FROM entities e
        WHERE e.id = entity_uuid
        
        UNION ALL
        
        -- Recursive case: children
        SELECT 
            h.level + 1,
            e.id,
            e.name,
            e.entity_type,
            e.country_code,
            er.relationship_type,
            er.ownership_percentage
        FROM hierarchy h
        JOIN entity_relationships er ON er.parent_entity_id = h.entity_id
        JOIN entities e ON e.id = er.child_entity_id
        WHERE h.level < 10  -- Prevent infinite recursion
    )
    SELECT * FROM hierarchy ORDER BY level, entity_name;
END;
$$ LANGUAGE plpgsql;

-- Insert sample compliance requirements for SEA countries
INSERT INTO compliance_requirements (country_code, jurisdiction_level, entity_types, industry_sectors, name, description, legal_reference, regulatory_body, frequency, category, priority, is_mandatory) VALUES
-- Malaysia
('MY', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'SST Registration', 'Sales and Service Tax registration requirement', 'Sales Tax Act 2018', 'Royal Malaysian Customs Department', 'Annually', 'Tax', 'Critical', true),
('MY', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'Corporate Tax Filing', 'Annual corporate tax return filing', 'Income Tax Act 1967', 'Inland Revenue Board of Malaysia', 'Annually', 'Tax', 'Critical', true),
('MY', 'National', ARRAY['PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'MFRS Compliance', 'Malaysian Financial Reporting Standards compliance', 'Companies Act 2016', 'Securities Commission Malaysia', 'Quarterly', 'Financial', 'Critical', true),

-- Singapore
('SG', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'GST Registration', 'Goods and Services Tax registration', 'GST Act', 'Inland Revenue Authority of Singapore', 'Quarterly', 'Tax', 'Critical', true),
('SG', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'Corporate Tax Filing', 'Annual corporate tax return filing', 'Income Tax Act', 'Inland Revenue Authority of Singapore', 'Annually', 'Tax', 'Critical', true),
('SG', 'National', ARRAY['PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'SFRS Compliance', 'Singapore Financial Reporting Standards compliance', 'Companies Act', 'Accounting and Corporate Regulatory Authority', 'Quarterly', 'Financial', 'Critical', true),

-- Thailand
('TH', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'VAT Registration', 'Value Added Tax registration', 'Revenue Code', 'Revenue Department', 'Monthly', 'Tax', 'Critical', true),
('TH', 'National', ARRAY['PrivateCompany', 'PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'Corporate Tax Filing', 'Annual corporate tax return filing', 'Revenue Code', 'Revenue Department', 'Annually', 'Tax', 'Critical', true),
('TH', 'National', ARRAY['PublicCompany'], ARRAY['Technology', 'Financial', 'Manufacturing'], 'TFRS Compliance', 'Thai Financial Reporting Standards compliance', 'Public Limited Companies Act', 'Securities and Exchange Commission', 'Quarterly', 'Financial', 'Critical', true)

ON CONFLICT DO NOTHING; 

-- ========================================
-- SHRM (Strategic Human Resource Management)
-- ========================================

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    employment_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'terminated', 'probation', 'contract')),
    hire_date DATE NOT NULL,
    termination_date DATE,
    salary DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    manager_id UUID REFERENCES employees(id),
    organization_id UUID NOT NULL,
    
    -- Enhanced fields for SEA compliance
    employee_id VARCHAR(50) UNIQUE, -- Company employee ID
    national_id VARCHAR(50), -- National ID number
    passport_number VARCHAR(50),
    nationality VARCHAR(2) CHECK (nationality IN ('MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM')),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) CHECK (country IN ('MY', 'SG', 'TH', 'ID', 'PH', 'VN', 'BN', 'KH', 'LA', 'MM')),
    
    -- Emergency contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Bank details for payroll
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_swift_code VARCHAR(20),
    
    -- Tax information
    tax_id VARCHAR(50),
    tax_exemption_status BOOLEAN DEFAULT false,
    
    -- Benefits and allowances
    benefits JSONB DEFAULT '{}',
    allowances JSONB DEFAULT '{}',
    
    -- Performance and reviews
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    last_review_date DATE,
    next_review_date DATE,
    
    -- Leave management
    annual_leave_balance INTEGER DEFAULT 0,
    sick_leave_balance INTEGER DEFAULT 0,
    other_leave_balance INTEGER DEFAULT 0,
    
    -- Compliance and documentation
    documents JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    training_records JSONB DEFAULT '[]',
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT valid_salary CHECK (salary >= 0),
    CONSTRAINT valid_hire_date CHECK (hire_date <= CURRENT_DATE),
    CONSTRAINT valid_termination_date CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

-- Payroll records table
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    
    -- Basic pay
    basic_salary DECIMAL(12,2) NOT NULL,
    gross_pay DECIMAL(12,2) NOT NULL,
    net_pay DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Allowances
    allowances JSONB DEFAULT '{}',
    allowance_total DECIMAL(12,2) DEFAULT 0,
    
    -- Deductions
    deductions JSONB DEFAULT '{}',
    deduction_total DECIMAL(12,2) DEFAULT 0,
    
    -- Tax calculations
    tax_amount DECIMAL(12,2) DEFAULT 0,
    social_security_amount DECIMAL(12,2) DEFAULT 0,
    other_taxes DECIMAL(12,2) DEFAULT 0,
    
    -- Overtime and bonuses
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_rate DECIMAL(8,2) DEFAULT 0,
    overtime_amount DECIMAL(12,2) DEFAULT 0,
    bonus_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Leave and absences
    leave_days INTEGER DEFAULT 0,
    absence_days INTEGER DEFAULT 0,
    leave_deduction DECIMAL(12,2) DEFAULT 0,
    
    -- Status and processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    payment_reference VARCHAR(100),
    
    -- Compliance
    tax_year INTEGER NOT NULL,
    tax_period VARCHAR(20),
    compliance_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_pay_period CHECK (pay_period_end >= pay_period_start),
    CONSTRAINT valid_pay_date CHECK (pay_date >= pay_period_end),
    CONSTRAINT valid_gross_pay CHECK (gross_pay >= basic_salary),
    CONSTRAINT valid_net_pay CHECK (net_pay <= gross_pay)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    
    -- Approval workflow
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_by UUID NOT NULL,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Documentation
    supporting_documents JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_days_requested CHECK (days_requested > 0)
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_date DATE NOT NULL,
    
    -- Review details
    reviewer_id UUID NOT NULL REFERENCES employees(id),
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('probation', 'annual', 'promotion', 'special')),
    
    -- Performance ratings
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    technical_skills DECIMAL(3,2) CHECK (technical_skills >= 0 AND technical_skills <= 5),
    communication DECIMAL(3,2) CHECK (communication >= 0 AND communication <= 5),
    teamwork DECIMAL(3,2) CHECK (teamwork >= 0 AND teamwork <= 5),
    leadership DECIMAL(3,2) CHECK (leadership >= 0 AND leadership <= 5),
    problem_solving DECIMAL(3,2) CHECK (problem_solving >= 0 AND problem_solving <= 5),
    
    -- Review content
    achievements TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    comments TEXT,
    
    -- Outcomes
    salary_increase DECIMAL(8,2) DEFAULT 0,
    promotion_position VARCHAR(100),
    next_review_date DATE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_review_period CHECK (review_period_end >= review_period_start),
    CONSTRAINT valid_review_date CHECK (review_date >= review_period_end)
);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    training_name VARCHAR(255) NOT NULL,
    training_type VARCHAR(100) NOT NULL CHECK (training_type IN ('mandatory', 'optional', 'certification', 'skill_development')),
    provider VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INTEGER,
    
    -- Completion details
    status VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'failed', 'cancelled')),
    completion_date DATE,
    score DECIMAL(5,2),
    certificate_url VARCHAR(500),
    
    -- Cost and approval
    cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    compliance_required BOOLEAN DEFAULT false,
    renewal_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_training_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_score CHECK (score IS NULL OR (score >= 0 AND score <= 100))
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES employees(id),
    organization_id UUID NOT NULL,
    
    -- Budget and planning
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    headcount_limit INTEGER,
    current_headcount INTEGER DEFAULT 0,
    
    -- Location and contact
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'planned')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    organization_id UUID NOT NULL,
    
    -- Job details
    job_description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    
    -- Compensation
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    benefits JSONB DEFAULT '{}',
    
    -- Classification
    level INTEGER,
    category VARCHAR(50),
    employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'freelance')),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- HR policies table
CREATE TABLE IF NOT EXISTS hr_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('leave', 'compensation', 'performance', 'conduct', 'safety', 'other')),
    description TEXT,
    content TEXT NOT NULL,
    
    -- Applicability
    applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'employees', 'managers', 'executives')),
    departments TEXT[],
    positions TEXT[],
    
    -- Version control
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Approval
    approved_by UUID NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- HR audit logs table
CREATE TABLE IF NOT EXISTS hr_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
    user_id UUID NOT NULL,
    
    -- Change details
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_period ON payroll_records(pay_period_start, pay_period_end);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON payroll_records(status);
CREATE INDEX IF NOT EXISTS idx_payroll_records_tax_year ON payroll_records(tax_year);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_date ON performance_reviews(review_date);

CREATE INDEX IF NOT EXISTS idx_training_records_employee ON training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(status);
CREATE INDEX IF NOT EXISTS idx_training_records_type ON training_records(training_type);

CREATE INDEX IF NOT EXISTS idx_departments_organization ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);

CREATE INDEX IF NOT EXISTS idx_positions_organization ON positions(organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);

CREATE INDEX IF NOT EXISTS idx_hr_audit_logs_table_record ON hr_audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_hr_audit_logs_user ON hr_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_audit_logs_created ON hr_audit_logs(created_at);

-- Triggers for audit logging
CREATE OR REPLACE FUNCTION log_hr_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO hr_audit_logs (table_name, record_id, action, user_id, new_value)
        VALUES (TG_TABLE_NAME, NEW.id, 'CREATE', COALESCE(NEW.created_by, 'system'), row_to_json(NEW)::text);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO hr_audit_logs (table_name, record_id, action, user_id, old_value, new_value)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', COALESCE(NEW.updated_by, 'system'), row_to_json(OLD)::text, row_to_json(NEW)::text);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO hr_audit_logs (table_name, record_id, action, user_id, old_value)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', COALESCE(OLD.updated_by, 'system'), row_to_json(OLD)::text);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to HR tables
CREATE TRIGGER trigger_employees_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON employees
    FOR EACH ROW EXECUTE FUNCTION log_hr_changes();

CREATE TRIGGER trigger_payroll_records_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON payroll_records
    FOR EACH ROW EXECUTE FUNCTION log_hr_changes();

CREATE TRIGGER trigger_leave_requests_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION log_hr_changes();

CREATE TRIGGER trigger_performance_reviews_audit_logs
    AFTER INSERT OR UPDATE OR DELETE ON performance_reviews
    FOR EACH ROW EXECUTE FUNCTION log_hr_changes();

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payroll_records_updated_at
    BEFORE UPDATE ON payroll_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_training_records_updated_at
    BEFORE UPDATE ON training_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_hr_policies_updated_at
    BEFORE UPDATE ON hr_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate employee leave balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(employee_uuid UUID, leave_type VARCHAR(50))
RETURNS INTEGER AS $$
DECLARE
    total_entitled INTEGER;
    total_taken INTEGER;
    balance INTEGER;
BEGIN
    -- Get total entitled days (from employee record or policy)
    SELECT 
        CASE 
            WHEN leave_type = 'annual' THEN annual_leave_balance
            WHEN leave_type = 'sick' THEN sick_leave_balance
            ELSE other_leave_balance
        END INTO total_entitled
    FROM employees 
    WHERE id = employee_uuid;

    -- Get total days taken
    SELECT COALESCE(SUM(days_requested), 0) INTO total_taken
    FROM leave_requests 
    WHERE employee_id = employee_uuid 
    AND leave_type = leave_type
    AND status = 'approved';

    -- Calculate balance
    balance := COALESCE(total_entitled, 0) - COALESCE(total_taken, 0);
    
    RETURN GREATEST(balance, 0); -- Ensure non-negative balance
END;
$$ LANGUAGE plpgsql;

-- Function to get employee hierarchy
CREATE OR REPLACE FUNCTION get_employee_hierarchy(employee_uuid UUID)
RETURNS TABLE (
    level INTEGER,
    employee_id UUID,
    employee_name TEXT,
    position TEXT,
    department TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy AS (
        -- Base case: the starting employee
        SELECT 
            0 as level,
            e.id as employee_id,
            (e.first_name || ' ' || e.last_name) as employee_name,
            e.position,
            e.department
        FROM employees e
        WHERE e.id = employee_uuid
        
        UNION ALL
        
        -- Recursive case: direct reports
        SELECT 
            h.level + 1,
            e.id,
            (e.first_name || ' ' || e.last_name),
            e.position,
            e.department
        FROM hierarchy h
        JOIN employees e ON e.manager_id = h.employee_id
        WHERE h.level < 5  -- Prevent infinite recursion
    )
    SELECT * FROM hierarchy ORDER BY level, employee_name;
END;
$$ LANGUAGE plpgsql;

-- Insert sample departments
INSERT INTO departments (name, code, description, organization_id, created_by) VALUES
('Human Resources', 'HR', 'Human Resources Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
('Information Technology', 'IT', 'Information Technology Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
('Finance', 'FIN', 'Finance and Accounting Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
('Marketing', 'MKT', 'Marketing and Communications Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
('Sales', 'SALES', 'Sales and Business Development Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
('Operations', 'OPS', 'Operations and Logistics Department', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')

ON CONFLICT (name) DO NOTHING;

-- Insert sample positions
INSERT INTO positions (title, department_id, organization_id, employment_type, created_by) VALUES
('HR Manager', (SELECT id FROM departments WHERE name = 'Human Resources'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('HR Specialist', (SELECT id FROM departments WHERE name = 'Human Resources'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('Software Engineer', (SELECT id FROM departments WHERE name = 'Information Technology'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('IT Manager', (SELECT id FROM departments WHERE name = 'Information Technology'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('Financial Analyst', (SELECT id FROM departments WHERE name = 'Finance'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('Marketing Manager', (SELECT id FROM departments WHERE name = 'Marketing'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('Sales Representative', (SELECT id FROM departments WHERE name = 'Sales'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000'),
('Operations Manager', (SELECT id FROM departments WHERE name = 'Operations'), '00000000-0000-0000-0000-000000000000', 'full_time', '00000000-0000-0000-0000-000000000000')

ON CONFLICT DO NOTHING;

-- ========================================
-- CRITICAL SHRM ENHANCEMENTS
-- ========================================

-- Attendance tracking table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Clock in/out times
    clock_in_time TIMESTAMP WITH TIME ZONE,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    
    -- Location tracking
    clock_in_location JSONB, -- {lat, lng, address, ip_address}
    clock_out_location JSONB,
    
    -- Work hours calculation
    total_hours DECIMAL(4,2) DEFAULT 0,
    regular_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    overtime_rate DECIMAL(3,2) DEFAULT 1.5, -- 1.5x, 2.0x, etc.
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'leave')),
    notes TEXT,
    
    -- Approval workflow
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_attendance_per_day UNIQUE (employee_id, date),
    CONSTRAINT valid_clock_times CHECK (clock_out_time IS NULL OR clock_out_time >= clock_in_time)
);

-- Probation and contract management
CREATE TABLE IF NOT EXISTS employment_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Contract details
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('permanent', 'contract', 'probation', 'intern', 'freelance')),
    contract_number VARCHAR(100) UNIQUE,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    probation_end_date DATE,
    confirmation_date DATE,
    
    -- Terms
    salary DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    notice_period_days INTEGER DEFAULT 30,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'renewed')),
    
    -- Renewal tracking
    renewal_reminder_date DATE,
    renewal_status VARCHAR(20) CHECK (renewal_status IN ('pending', 'approved', 'rejected', 'not_required')),
    
    -- Document
    contract_document_url VARCHAR(500),
    signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT valid_contract_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_probation_date CHECK (probation_end_date IS NULL OR probation_end_date >= start_date)
);

-- Statutory reporting (Malaysia specific)
CREATE TABLE IF NOT EXISTS statutory_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('form_e', 'cp8d', 'cp58', 'ea_form', 'epf', 'socso', 'eis')),
    reporting_period VARCHAR(10) NOT NULL, -- YYYY-MM format
    tax_year INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    
    -- Data
    report_data JSONB NOT NULL,
    generated_file_url VARCHAR(500),
    
    -- Submission details
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID REFERENCES employees(id),
    approval_reference VARCHAR(100),
    
    -- Compliance
    compliance_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES employees(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_statutory_report UNIQUE (organization_id, report_type, reporting_period, tax_year)
);

-- Bank file formats for payroll
CREATE TABLE IF NOT EXISTS bank_transfer_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID NOT NULL, -- Reference to payroll batch
    
    -- Bank details
    bank_name VARCHAR(100) NOT NULL CHECK (bank_name IN ('cimb', 'maybank', 'rhb', 'public_bank', 'hong_leong', 'ambank')),
    file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('csv', 'fixed_width', 'xml')),
    
    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_size INTEGER,
    
    -- Processing status
    status VARCHAR(20) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'uploaded', 'processed', 'failed')),
    
    -- Bank response
    bank_reference VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Metadata
    total_amount DECIMAL(15,2) NOT NULL,
    total_records INTEGER NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Enhanced security: Field-level encryption for sensitive data
CREATE TABLE IF NOT EXISTS encrypted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    
    -- Encrypted data
    encrypted_value TEXT NOT NULL,
    encryption_key_id VARCHAR(100) NOT NULL,
    encryption_algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_encrypted_field UNIQUE (table_name, record_id, field_name)
);

-- Notification and reminder system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES employees(id),
    
    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN ('reminder', 'approval', 'alert', 'announcement', 'compliance')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Delivery
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'slack', 'whatsapp')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    
    -- Action tracking
    action_required BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    action_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    related_entity_type VARCHAR(50), -- 'employee', 'payroll', 'leave', etc.
    related_entity_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Document templates and e-signature
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    
    -- Template details
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('contract', 'offer_letter', 'policy', 'form', 'report')),
    description TEXT,
    
    -- Content
    template_content TEXT NOT NULL,
    merge_fields JSONB DEFAULT '[]', -- Available merge fields
    variables JSONB DEFAULT '{}', -- Default values
    
    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    
    -- Approval
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Generated documents
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES document_templates(id),
    employee_id UUID REFERENCES employees(id),
    
    -- Document details
    document_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_size INTEGER,
    
    -- Content
    generated_content TEXT,
    merge_data JSONB DEFAULT '{}', -- Actual data used
    
    -- E-signature
    requires_signature BOOLEAN DEFAULT false,
    signature_status VARCHAR(20) DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'expired')),
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES employees(id),
    signature_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'archived')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Leave encashment and carry forward
CREATE TABLE IF NOT EXISTS leave_encashments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Encashment details
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'other')),
    days_encashed INTEGER NOT NULL,
    rate_per_day DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    
    -- Period
    encashment_period VARCHAR(10) NOT NULL, -- YYYY-MM
    encashment_date DATE NOT NULL,
    
    -- Processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Payroll integration
    payroll_record_id UUID REFERENCES payroll_records(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL
);

-- Termination and exit management
CREATE TABLE IF NOT EXISTS termination_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Termination details
    termination_type VARCHAR(50) NOT NULL CHECK (termination_type IN ('resignation', 'termination', 'retirement', 'contract_end', 'redundancy')),
    reason TEXT,
    
    -- Dates
    notice_date DATE NOT NULL,
    last_working_date DATE NOT NULL,
    termination_date DATE NOT NULL,
    
    -- Settlement
    final_settlement_amount DECIMAL(12,2),
    leave_encashment_amount DECIMAL(12,2),
    other_benefits_amount DECIMAL(12,2),
    
    -- Exit process
    exit_interview_date DATE,
    exit_interview_conducted_by UUID REFERENCES employees(id),
    exit_interview_notes TEXT,
    
    -- Handover
    handover_completed BOOLEAN DEFAULT false,
    handover_date DATE,
    handover_notes TEXT,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_clock_in ON attendance_records(clock_in_time);

CREATE INDEX IF NOT EXISTS idx_employment_contracts_employee ON employment_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employment_contracts_status ON employment_contracts(status);
CREATE INDEX IF NOT EXISTS idx_employment_contracts_end_date ON employment_contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_employment_contracts_probation ON employment_contracts(probation_end_date);

CREATE INDEX IF NOT EXISTS idx_statutory_reports_org_type ON statutory_reports(organization_id, report_type);
CREATE INDEX IF NOT EXISTS idx_statutory_reports_period ON statutory_reports(reporting_period);
CREATE INDEX IF NOT EXISTS idx_statutory_reports_status ON statutory_reports(status);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_files_bank ON bank_transfer_files(bank_name);
CREATE INDEX IF NOT EXISTS idx_bank_transfer_files_status ON bank_transfer_files(status);

CREATE INDEX IF NOT EXISTS idx_encrypted_fields_table_record ON encrypted_fields(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_document_templates_org_category ON document_templates(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_generated_documents_employee ON generated_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);

CREATE INDEX IF NOT EXISTS idx_leave_encashments_employee ON leave_encashments(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_encashments_status ON leave_encashments(status);

CREATE INDEX IF NOT EXISTS idx_termination_records_employee ON termination_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_termination_records_status ON termination_records(status);

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_employment_contracts_updated_at
    BEFORE UPDATE ON employment_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_statutory_reports_updated_at
    BEFORE UPDATE ON statutory_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bank_transfer_files_updated_at
    BEFORE UPDATE ON bank_transfer_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_encrypted_fields_updated_at
    BEFORE UPDATE ON encrypted_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_generated_documents_updated_at
    BEFORE UPDATE ON generated_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leave_encashments_updated_at
    BEFORE UPDATE ON leave_encashments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_termination_records_updated_at
    BEFORE UPDATE ON termination_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for critical business logic

-- Function to calculate overtime hours and rates
CREATE OR REPLACE FUNCTION calculate_overtime_hours(
    employee_uuid UUID,
    start_date DATE,
    end_date DATE
) RETURNS TABLE (
    total_hours DECIMAL(4,2),
    regular_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2),
    overtime_amount DECIMAL(10,2)
) AS $$
DECLARE
    emp_salary DECIMAL(12,2);
    emp_currency VARCHAR(3);
    daily_rate DECIMAL(10,2);
    hourly_rate DECIMAL(8,2);
    total_work_hours DECIMAL(4,2) := 0;
    regular_work_hours DECIMAL(4,2) := 0;
    overtime_work_hours DECIMAL(4,2) := 0;
    overtime_pay DECIMAL(10,2) := 0;
    record RECORD;
BEGIN
    -- Get employee salary
    SELECT salary, currency INTO emp_salary, emp_currency
    FROM employees WHERE id = employee_uuid;
    
    -- Calculate daily and hourly rates
    daily_rate := emp_salary / 26; -- Assuming 26 working days per month
    hourly_rate := daily_rate / 8; -- Assuming 8 hours per day
    
    -- Calculate hours for the period
    FOR record IN 
        SELECT total_hours, overtime_hours, overtime_rate
        FROM attendance_records 
        WHERE employee_id = employee_uuid 
        AND date BETWEEN start_date AND end_date
        AND status = 'present'
    LOOP
        total_work_hours := total_work_hours + COALESCE(record.total_hours, 0);
        regular_work_hours := regular_work_hours + COALESCE(record.total_hours - record.overtime_hours, 0);
        overtime_work_hours := overtime_work_hours + COALESCE(record.overtime_hours, 0);
        overtime_pay := overtime_pay + (COALESCE(record.overtime_hours, 0) * hourly_rate * COALESCE(record.overtime_rate, 1.5));
    END LOOP;
    
    RETURN QUERY SELECT 
        total_work_hours,
        regular_work_hours,
        overtime_work_hours,
        overtime_pay;
END;
$$ LANGUAGE plpgsql;

-- Function to check probation status and auto-promote
CREATE OR REPLACE FUNCTION check_probation_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if probation period has ended
    IF NEW.probation_end_date IS NOT NULL 
    AND NEW.probation_end_date <= CURRENT_DATE 
    AND NEW.status = 'active' 
    AND NEW.contract_type = 'probation' THEN
        
        -- Auto-promote to permanent
        UPDATE employment_contracts 
        SET 
            contract_type = 'permanent',
            confirmation_date = CURRENT_DATE,
            status = 'active',
            updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Update employee status
        UPDATE employees 
        SET 
            employment_status = 'active',
            updated_at = NOW()
        WHERE id = NEW.employee_id;
        
        -- Create notification
        INSERT INTO notifications (
            recipient_id, type, title, message, priority, 
            delivery_method, status, action_required, 
            related_entity_type, related_entity_id, created_by
        ) VALUES (
            NEW.employee_id, 'announcement', 'Probation Confirmed', 
            'Congratulations! Your probation period has been completed and you are now a permanent employee.',
            'high', 'email', 'pending', false, 'employee', NEW.employee_id, NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for probation status check
CREATE TRIGGER trigger_check_probation_status
    AFTER INSERT OR UPDATE ON employment_contracts
    FOR EACH ROW EXECUTE FUNCTION check_probation_status();

-- Function to generate bank file for payroll
CREATE OR REPLACE FUNCTION generate_bank_file(
    payroll_run_id UUID,
    bank_name VARCHAR(100)
) RETURNS TEXT AS $$
DECLARE
    file_content TEXT := '';
    record RECORD;
    bank_format VARCHAR(20);
BEGIN
    -- Determine file format based on bank
    CASE bank_name
        WHEN 'cimb' THEN bank_format := 'csv';
        WHEN 'maybank' THEN bank_format := 'fixed_width';
        WHEN 'rhb' THEN bank_format := 'csv';
        ELSE bank_format := 'csv';
    END CASE;
    
    -- Generate header based on bank format
    CASE bank_format
        WHEN 'csv' THEN
            file_content := 'Account Number,Account Name,Amount,Reference' || E'\n';
        WHEN 'fixed_width' THEN
            file_content := 'HDR' || LPAD('', 97, ' ') || E'\n';
    END CASE;
    
    -- Generate records
    FOR record IN 
        SELECT 
            e.bank_account_number,
            e.first_name || ' ' || e.last_name as full_name,
            pr.net_pay,
            'PAYROLL-' || pr.pay_period_start as reference
        FROM payroll_records pr
        JOIN employees e ON e.id = pr.employee_id
        WHERE pr.id = payroll_run_id
        AND pr.status = 'processed'
    LOOP
        CASE bank_format
            WHEN 'csv' THEN
                file_content := file_content || 
                    record.bank_account_number || ',' ||
                    record.full_name || ',' ||
                    record.net_pay || ',' ||
                    record.reference || E'\n';
            WHEN 'fixed_width' THEN
                file_content := file_content || 
                    LPAD(record.bank_account_number, 20) ||
                    LPAD(record.full_name, 40) ||
                    LPAD(record.net_pay::TEXT, 15) ||
                    LPAD(record.reference, 20) || E'\n';
        END CASE;
    END LOOP;
    
    -- Add footer for fixed width
    IF bank_format = 'fixed_width' THEN
        file_content := file_content || 'TRL' || LPAD('', 97, ' ');
    END IF;
    
    RETURN file_content;
END;
$$ LANGUAGE plpgsql;

-- Function to mask sensitive data for display
CREATE OR REPLACE FUNCTION mask_sensitive_data(
    data_value TEXT,
    data_type VARCHAR(20)
) RETURNS TEXT AS $$
BEGIN
    CASE data_type
        WHEN 'nric' THEN
            -- Mask NRIC: 851212-XX-XX62
            RETURN LEFT(data_value, 6) || '-XX-XX' || RIGHT(data_value, 2);
        WHEN 'bank_account' THEN
            -- Mask bank account: 1234-XX-XX-5678
            RETURN LEFT(data_value, 4) || '-XX-XX-' || RIGHT(data_value, 4);
        WHEN 'phone' THEN
            -- Mask phone: +60 12-XXX-5678
            RETURN LEFT(data_value, 6) || '-XXX-' || RIGHT(data_value, 4);
        WHEN 'email' THEN
            -- Mask email: j***@company.com
            RETURN LEFT(data_value, 1) || '***@' || SPLIT_PART(data_value, '@', 2);
        ELSE
            RETURN data_value;
    END CASE;
END;
$$ LANGUAGE plpgsql;