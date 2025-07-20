-- Metadata Terms Schema for AI-BOS OS
-- This schema supports the metadata-driven approach with term prefixes
-- to ensure consistency across metadata registry, data governance, and database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Metadata Terms Table
CREATE TABLE metadata_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    term_name VARCHAR(255) NOT NULL,
    term_prefix VARCHAR(255) NOT NULL UNIQUE, -- e.g., 'term_customer_email'
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN (
        'short_text', 'long_text', 'short_date', 'long_date', 
        'number', 'decimal', 'boolean', 'email', 'url', 
        'phone', 'json', 'array'
    )),
    domain VARCHAR(50) NOT NULL CHECK (domain IN (
        'accounting', 'finance', 'hr', 'sales', 'marketing', 
        'operations', 'compliance', 'customer', 'vendor', 
        'employee', 'inventory', 'project', 'reporting', 
        'audit', 'tax', 'general'
    )),
    is_required BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_pii BOOLEAN DEFAULT FALSE,
    security_level VARCHAR(50) NOT NULL DEFAULT 'internal' CHECK (security_level IN (
        'public', 'internal', 'confidential', 'restricted'
    )),
    compliance_standards TEXT[] DEFAULT '{}',
    allowed_values TEXT[] DEFAULT '{}', -- For ENUM types
    default_value TEXT,
    validation_rules JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    synonyms TEXT[] DEFAULT '{}',
    usage_context TEXT[] DEFAULT '{}',
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'deprecated', 'archived'
    )),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT metadata_terms_prefix_format CHECK (
        term_prefix ~ '^term_[a-z_]+_[a-z0-9_]+$'
    ),
    CONSTRAINT metadata_terms_pii_security CHECK (
        NOT (is_pii = TRUE AND security_level = 'public')
    )
);

-- Metadata Mappings Table (for term relationships)
CREATE TABLE metadata_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    source_term_id UUID NOT NULL REFERENCES metadata_terms(id) ON DELETE CASCADE,
    target_term_id UUID NOT NULL REFERENCES metadata_terms(id) ON DELETE CASCADE,
    mapping_type VARCHAR(20) NOT NULL CHECK (mapping_type IN ('exact', 'fuzzy', 'transform')),
    confidence_score DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    transformation_rules JSONB DEFAULT '{}',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT metadata_mappings_unique_relationship UNIQUE (source_term_id, target_term_id)
);

-- Metadata Usage Tracking Table
CREATE TABLE metadata_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    term_id UUID NOT NULL REFERENCES metadata_terms(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    usage_type VARCHAR(20) NOT NULL CHECK (usage_type IN ('read', 'write', 'transform')),
    frequency INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metadata Change Log Table
CREATE TABLE metadata_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    term_id UUID NOT NULL REFERENCES metadata_terms(id) ON DELETE CASCADE,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN (
        'created', 'updated', 'deleted', 'status_changed'
    )),
    old_values JSONB,
    new_values JSONB NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database Field Mappings Table (for database integration)
CREATE TABLE database_field_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    term_id UUID NOT NULL REFERENCES metadata_terms(id) ON DELETE CASCADE,
    database_name VARCHAR(255) NOT NULL,
    schema_name VARCHAR(255) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    column_name VARCHAR(255) NOT NULL,
    column_type VARCHAR(100) NOT NULL,
    is_nullable BOOLEAN DEFAULT TRUE,
    column_default TEXT,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE,
    foreign_key_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT database_field_mappings_unique_column UNIQUE (
        organization_id, database_name, schema_name, table_name, column_name
    )
);

-- Data Governance Rules Table
CREATE TABLE data_governance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    term_id UUID REFERENCES metadata_terms(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'validation', 'encryption', 'masking', 'retention', 'access_control'
    )),
    rule_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Audits Table
CREATE TABLE compliance_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    audit_date DATE NOT NULL,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN (
        'gdpr', 'sox', 'hipaa', 'pci_dss', 'iso_27001', 'custom'
    )),
    terms_audited INTEGER DEFAULT 0,
    terms_compliant INTEGER DEFAULT 0,
    terms_non_compliant INTEGER DEFAULT 0,
    compliance_score DECIMAL(5,2) DEFAULT 0.00,
    audit_details JSONB DEFAULT '{}',
    auditor VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_metadata_terms_organization ON metadata_terms(organization_id);
CREATE INDEX idx_metadata_terms_prefix ON metadata_terms(term_prefix);
CREATE INDEX idx_metadata_terms_domain ON metadata_terms(domain);
CREATE INDEX idx_metadata_terms_status ON metadata_terms(status);
CREATE INDEX idx_metadata_terms_security ON metadata_terms(security_level);
CREATE INDEX idx_metadata_terms_created_at ON metadata_terms(created_at);

CREATE INDEX idx_metadata_mappings_organization ON metadata_mappings(organization_id);
CREATE INDEX idx_metadata_mappings_source ON metadata_mappings(source_term_id);
CREATE INDEX idx_metadata_mappings_target ON metadata_mappings(target_term_id);

CREATE INDEX idx_metadata_usage_organization ON metadata_usage(organization_id);
CREATE INDEX idx_metadata_usage_term ON metadata_usage(term_id);
CREATE INDEX idx_metadata_usage_table ON metadata_usage(table_name, column_name);
CREATE INDEX idx_metadata_usage_last_accessed ON metadata_usage(last_accessed);

CREATE INDEX idx_metadata_change_log_organization ON metadata_change_log(organization_id);
CREATE INDEX idx_metadata_change_log_term ON metadata_change_log(term_id);
CREATE INDEX idx_metadata_change_log_created_at ON metadata_change_log(created_at);

CREATE INDEX idx_database_field_mappings_organization ON database_field_mappings(organization_id);
CREATE INDEX idx_database_field_mappings_term ON database_field_mappings(term_id);
CREATE INDEX idx_database_field_mappings_database ON database_field_mappings(database_name, schema_name, table_name);

CREATE INDEX idx_data_governance_rules_organization ON data_governance_rules(organization_id);
CREATE INDEX idx_data_governance_rules_term ON data_governance_rules(term_id);
CREATE INDEX idx_data_governance_rules_type ON data_governance_rules(rule_type);
CREATE INDEX idx_data_governance_rules_active ON data_governance_rules(is_active);

CREATE INDEX idx_compliance_audits_organization ON compliance_audits(organization_id);
CREATE INDEX idx_compliance_audits_date ON compliance_audits(audit_date);
CREATE INDEX idx_compliance_audits_type ON compliance_audits(audit_type);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_metadata_terms_updated_at 
    BEFORE UPDATE ON metadata_terms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metadata_usage_updated_at 
    BEFORE UPDATE ON metadata_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_database_field_mappings_updated_at 
    BEFORE UPDATE ON database_field_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_governance_rules_updated_at 
    BEFORE UPDATE ON data_governance_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic change logging
CREATE OR REPLACE FUNCTION log_metadata_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO metadata_change_log (
            organization_id, term_id, change_type, new_values, changed_by
        ) VALUES (
            NEW.organization_id, NEW.id, 'created', to_jsonb(NEW), NEW.created_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO metadata_change_log (
            organization_id, term_id, change_type, old_values, new_values, changed_by
        ) VALUES (
            NEW.organization_id, NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO metadata_change_log (
            organization_id, term_id, change_type, old_values, new_values, changed_by
        ) VALUES (
            OLD.organization_id, OLD.id, 'deleted', to_jsonb(OLD), '{}', 'system'
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_metadata_terms_changes
    AFTER INSERT OR UPDATE OR DELETE ON metadata_terms
    FOR EACH ROW EXECUTE FUNCTION log_metadata_changes();

-- Sample data for testing
INSERT INTO metadata_terms (
    organization_id,
    term_name,
    term_prefix,
    display_name,
    description,
    data_type,
    domain,
    is_required,
    is_sensitive,
    is_pii,
    security_level,
    compliance_standards,
    allowed_values,
    validation_rules,
    tags,
    synonyms,
    status,
    created_by
) VALUES 
-- Customer Domain Terms
(
    uuid_generate_v4(),
    'customer_email',
    'term_customer_email',
    'Customer Email Address',
    'Primary email address for customer communication',
    'email',
    'customer',
    TRUE,
    TRUE,
    TRUE,
    'confidential',
    ARRAY['gdpr', 'ccpa'],
    ARRAY[],
    '[{"rule_type": "regex", "rule_value": "^[^@]+@[^@]+\\.[^@]+$", "error_message": "Invalid email format", "is_critical": true}]',
    ARRAY['contact', 'communication'],
    ARRAY['email', 'e-mail', 'mail'],
    'active',
    'system'
),
-- Finance Domain Terms
(
    uuid_generate_v4(),
    'invoice_amount',
    'term_finance_invoice_amount',
    'Invoice Amount',
    'Total amount due on invoice',
    'decimal',
    'finance',
    TRUE,
    TRUE,
    FALSE,
    'internal',
    ARRAY['sox'],
    ARRAY[],
    '[{"rule_type": "range", "rule_value": "0,999999.99", "error_message": "Amount must be between 0 and 999,999.99", "is_critical": true}]',
    ARRAY['financial', 'billing'],
    ARRAY['amount', 'total', 'sum'],
    'active',
    'system'
),
-- HR Domain Terms
(
    uuid_generate_v4(),
    'employee_status',
    'term_hr_employee_status',
    'Employee Status',
    'Current employment status',
    'array',
    'hr',
    TRUE,
    FALSE,
    FALSE,
    'internal',
    ARRAY['sox'],
    ARRAY['active', 'inactive', 'terminated', 'on_leave'],
    '[{"rule_type": "enum", "rule_value": "", "error_message": "Status must be one of the allowed values", "is_critical": true}]',
    ARRAY['employment', 'status'],
    ARRAY['status', 'employment_status'],
    'active',
    'system'
);

-- Comments for documentation
COMMENT ON TABLE metadata_terms IS 'Core metadata terms with prefix validation for AI-BOS OS';
COMMENT ON COLUMN metadata_terms.term_prefix IS 'Unique prefix following pattern: term_[domain]_[name]';
COMMENT ON COLUMN metadata_terms.validation_rules IS 'JSON array of validation rules for data validation';
COMMENT ON COLUMN metadata_terms.compliance_standards IS 'Array of compliance standards this term must follow';

COMMENT ON TABLE metadata_mappings IS 'Relationships between metadata terms for data lineage';
COMMENT ON TABLE metadata_usage IS 'Tracking of how metadata terms are used across the system';
COMMENT ON TABLE metadata_change_log IS 'Audit trail of all changes to metadata terms';
COMMENT ON TABLE database_field_mappings IS 'Mapping between metadata terms and actual database fields';
COMMENT ON TABLE data_governance_rules IS 'Governance rules applied to metadata terms';
COMMENT ON TABLE compliance_audits IS 'Compliance audit results for metadata terms'; 