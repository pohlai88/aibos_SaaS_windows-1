-- ========================================
-- DATA GOVERNANCE INTEGRATION SCHEMA
-- ========================================

-- Governance Metadata (Enriched metadata with governance data)
CREATE TABLE IF NOT EXISTS governance_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metadata_field_id UUID NOT NULL REFERENCES metadata_registry(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- CRIP Classification
    crip_classification TEXT NOT NULL DEFAULT 'internal' CHECK (crip_classification IN ('critical', 'restricted', 'internal', 'public')),
    crip_justification TEXT,
    crip_assigned_by UUID REFERENCES users(id),
    crip_assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEA Compliance
    sea_compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (sea_compliance_status IN ('compliant', 'non_compliant', 'pending', 'review_required')),
    sea_standards TEXT[] DEFAULT '{}', -- GDPR, CCPA, SOX, etc.
    sea_compliance_notes TEXT,
    sea_last_reviewed TIMESTAMP WITH TIME ZONE,
    sea_reviewed_by UUID REFERENCES users(id),
    
    -- Business Rules
    business_rules JSONB DEFAULT '{}',
    rule_violations JSONB DEFAULT '[]',
    rule_last_checked TIMESTAMP WITH TIME ZONE,
    
    -- Encryption Requirements
    encryption_required BOOLEAN DEFAULT FALSE,
    encryption_method TEXT, -- AES256, RSA, etc.
    encryption_key_id TEXT,
    
    -- Data Lineage
    data_source TEXT,
    data_lineage JSONB DEFAULT '{}',
    upstream_dependencies TEXT[] DEFAULT '{}',
    downstream_dependencies TEXT[] DEFAULT '{}',
    
    -- Quality Metrics
    data_quality_score NUMERIC(3,2) DEFAULT 0.0,
    completeness_score NUMERIC(3,2) DEFAULT 0.0,
    accuracy_score NUMERIC(3,2) DEFAULT 0.0,
    consistency_score NUMERIC(3,2) DEFAULT 0.0,
    
    -- Governance Status
    governance_status TEXT NOT NULL DEFAULT 'draft' CHECK (governance_status IN ('draft', 'under_review', 'approved', 'rejected', 'archived')),
    governance_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(metadata_field_id, organization_id)
);

-- Governance Audit Log (Detailed governance actions)
CREATE TABLE IF NOT EXISTS governance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    governance_metadata_id UUID REFERENCES governance_metadata(id) ON DELETE SET NULL,
    metadata_field_id UUID REFERENCES metadata_registry(id) ON DELETE SET NULL,
    
    -- Action Details
    action_type TEXT NOT NULL CHECK (action_type IN (
        'classification_assigned', 'classification_changed', 'compliance_reviewed', 
        'rule_violation_detected', 'rule_violation_resolved', 'encryption_applied',
        'data_quality_assessed', 'governance_approved', 'governance_rejected'
    )),
    action_description TEXT NOT NULL,
    
    -- Context
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Before/After State
    old_values JSONB,
    new_values JSONB,
    
    -- Risk Assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_notes TEXT,
    
    -- Compliance Impact
    compliance_impact TEXT[] DEFAULT '{}',
    requires_notification BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Classification Rules (Auto-classification logic)
CREATE TABLE IF NOT EXISTS data_classification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    rule_name TEXT NOT NULL,
    rule_description TEXT,
    
    -- Pattern Matching
    field_name_patterns TEXT[] DEFAULT '{}',
    data_type_patterns TEXT[] DEFAULT '{}',
    content_patterns TEXT[] DEFAULT '{}',
    
    -- Classification Output
    target_crip_classification TEXT NOT NULL CHECK (target_crip_classification IN ('critical', 'restricted', 'internal', 'public')),
    target_sea_standards TEXT[] DEFAULT '{}',
    encryption_required BOOLEAN DEFAULT FALSE,
    
    -- Rule Metadata
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, rule_name)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_governance_metadata_org_field ON governance_metadata(organization_id, metadata_field_id);
CREATE INDEX IF NOT EXISTS idx_governance_metadata_crip ON governance_metadata(crip_classification);
CREATE INDEX IF NOT EXISTS idx_governance_metadata_sea_status ON governance_metadata(sea_compliance_status);
CREATE INDEX IF NOT EXISTS idx_governance_metadata_status ON governance_metadata(governance_status);
CREATE INDEX IF NOT EXISTS idx_governance_metadata_encryption ON governance_metadata(encryption_required);

CREATE INDEX IF NOT EXISTS idx_governance_audit_log_org ON governance_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_governance_audit_log_action ON governance_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_governance_audit_log_performed_at ON governance_audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_governance_audit_log_risk ON governance_audit_log(risk_level);

CREATE INDEX IF NOT EXISTS idx_classification_rules_org ON data_classification_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_classification_rules_active ON data_classification_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_classification_rules_priority ON data_classification_rules(priority);

-- Functions for Governance Automation
CREATE OR REPLACE FUNCTION auto_classify_metadata_field()
RETURNS TRIGGER AS $$
DECLARE
    rule_record RECORD;
    matched_rule RECORD;
    highest_priority INTEGER := 999999;
BEGIN
    -- Find matching classification rules
    FOR rule_record IN 
        SELECT * FROM data_classification_rules 
        WHERE organization_id = NEW.organization_id 
        AND is_active = TRUE 
        ORDER BY priority ASC
    LOOP
        -- Check if field name matches patterns
        IF array_length(rule_record.field_name_patterns, 1) > 0 THEN
            IF NOT (NEW.field_name ~* ANY(rule_record.field_name_patterns)) THEN
                CONTINUE;
            END IF;
        END IF;
        
        -- Check if data type matches patterns
        IF array_length(rule_record.data_type_patterns, 1) > 0 THEN
            IF NOT (NEW.data_type = ANY(rule_record.data_type_patterns)) THEN
                CONTINUE;
            END IF;
        END IF;
        
        -- If we reach here, rule matches
        IF rule_record.priority < highest_priority THEN
            matched_rule := rule_record;
            highest_priority := rule_record.priority;
        END IF;
    END LOOP;
    
    -- Apply the highest priority matching rule
    IF matched_rule.id IS NOT NULL THEN
        INSERT INTO governance_metadata (
            metadata_field_id,
            organization_id,
            crip_classification,
            crip_justification,
            sea_standards,
            encryption_required,
            governance_status
        ) VALUES (
            NEW.id,
            NEW.organization_id,
            matched_rule.target_crip_classification,
            'Auto-classified by rule: ' || matched_rule.rule_name,
            matched_rule.target_sea_standards,
            matched_rule.encryption_required,
            'approved'
        ) ON CONFLICT (metadata_field_id, organization_id) DO UPDATE SET
            crip_classification = matched_rule.target_crip_classification,
            crip_justification = 'Auto-classified by rule: ' || matched_rule.rule_name,
            sea_standards = matched_rule.target_sea_standards,
            encryption_required = matched_rule.encryption_required,
            updated_at = NOW();
            
        -- Log the auto-classification
        INSERT INTO governance_audit_log (
            organization_id,
            metadata_field_id,
            action_type,
            action_description,
            performed_by,
            new_values
        ) VALUES (
            NEW.organization_id,
            NEW.id,
            'classification_assigned',
            'Auto-classified as ' || matched_rule.target_crip_classification || ' by rule: ' || matched_rule.rule_name,
            NEW.created_by::UUID,
            jsonb_build_object(
                'crip_classification', matched_rule.target_crip_classification,
                'rule_applied', matched_rule.rule_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-classification
CREATE TRIGGER trigger_auto_classify_metadata
    AFTER INSERT ON metadata_registry
    FOR EACH ROW
    EXECUTE FUNCTION auto_classify_metadata_field();

-- Function to get governance dashboard metrics
CREATE OR REPLACE FUNCTION get_governance_dashboard_metrics(org_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_fields', COUNT(*),
        'classified_fields', COUNT(*) FILTER (WHERE gm.crip_classification IS NOT NULL),
        'critical_fields', COUNT(*) FILTER (WHERE gm.crip_classification = 'critical'),
        'encrypted_fields', COUNT(*) FILTER (WHERE gm.encryption_required = TRUE),
        'compliant_fields', COUNT(*) FILTER (WHERE gm.sea_compliance_status = 'compliant'),
        'pending_review', COUNT(*) FILTER (WHERE gm.governance_status = 'under_review'),
        'avg_quality_score', ROUND(AVG(gm.data_quality_score), 2),
        'recent_violations', COUNT(*) FILTER (WHERE gal.action_type = 'rule_violation_detected' AND gal.performed_at > NOW() - INTERVAL '7 days')
    ) INTO result
    FROM metadata_registry mr
    LEFT JOIN governance_metadata gm ON mr.id = gm.metadata_field_id AND gm.organization_id = org_id
    LEFT JOIN governance_audit_log gal ON gm.id = gal.governance_metadata_id AND gal.performed_at > NOW() - INTERVAL '7 days';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;