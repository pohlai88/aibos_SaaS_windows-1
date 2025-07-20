-- ========================================
-- MULTI-VERSION MODULE HANDLING SCHEMA
-- ========================================

-- Module Versions Table
CREATE TABLE IF NOT EXISTS module_versions (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'deprecated', 'beta', 'stable')),
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_of_life TIMESTAMP WITH TIME ZONE,
    breaking_changes BOOLEAN DEFAULT false,
    migration_required BOOLEAN DEFAULT false,
    dependencies JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    deprecated_features JSONB DEFAULT '[]',
    customizations JSONB DEFAULT '[]',
    tenant_compatibility JSONB DEFAULT '[]',
    performance_metrics JSONB DEFAULT '{}',
    security_patches JSONB DEFAULT '[]',
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version)
);

-- Tenant Module Instances Table
CREATE TABLE IF NOT EXISTS tenant_module_instances (
    id TEXT PRIMARY KEY,
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'migrating', 'deprecated', 'customized')),
    customizations JSONB DEFAULT '[]',
    feature_flags JSONB DEFAULT '{}',
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_metrics JSONB DEFAULT '{}',
    migration_history JSONB DEFAULT '[]',
    rollback_version TEXT,
    custom_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, module_id)
);

-- Migration Records Table
CREATE TABLE IF NOT EXISTS migration_records (
    id TEXT PRIMARY KEY,
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    from_version TEXT NOT NULL,
    to_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'rolled-back')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    errors JSONB DEFAULT '[]',
    customizations_migrated INTEGER DEFAULT 0,
    data_migrated BOOLEAN DEFAULT false,
    migration_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Version Compatibility Matrix Table
CREATE TABLE IF NOT EXISTS version_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    source_version TEXT NOT NULL,
    target_version TEXT NOT NULL,
    compatibility TEXT NOT NULL CHECK (compatibility IN ('compatible', 'breaking', 'deprecated', 'unknown')),
    migration_path JSONB DEFAULT '[]',
    estimated_downtime INTEGER DEFAULT 0,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    required_actions JSONB DEFAULT '[]',
    tested BOOLEAN DEFAULT false,
    test_results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, source_version, target_version)
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    flag_name TEXT NOT NULL,
    flag_description TEXT,
    default_value BOOLEAN DEFAULT false,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('boolean', 'string', 'number', 'json')),
    flag_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, flag_name)
);

-- Tenant Feature Flag Overrides Table
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    flag_name TEXT NOT NULL,
    flag_value JSONB NOT NULL,
    override_reason TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, module_id, flag_name)
);

-- Version Rollback Points Table
CREATE TABLE IF NOT EXISTS version_rollback_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    rollback_data JSONB NOT NULL,
    rollback_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Side-by-Side Version Routing Table
CREATE TABLE IF NOT EXISTS version_routing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    routing_config JSONB NOT NULL,
    traffic_split JSONB DEFAULT '{}',
    routing_rules JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, module_id)
);

-- Version Usage Analytics Table
CREATE TABLE IF NOT EXISTS version_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    usage_date DATE NOT NULL,
    daily_active_users INTEGER DEFAULT 0,
    monthly_active_users INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, tenant_id, usage_date)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Module Versions Indexes
CREATE INDEX IF NOT EXISTS idx_module_versions_module_id ON module_versions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_versions_status ON module_versions(status);
CREATE INDEX IF NOT EXISTS idx_module_versions_release_date ON module_versions(release_date);
CREATE INDEX IF NOT EXISTS idx_module_versions_breaking_changes ON module_versions(breaking_changes);

-- Tenant Module Instances Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_instances_tenant_id ON tenant_module_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_module_id ON tenant_module_instances(module_id);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_version ON tenant_module_instances(version);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_status ON tenant_module_instances(status);
CREATE INDEX IF NOT EXISTS idx_tenant_instances_last_accessed ON tenant_module_instances(last_accessed);

-- Migration Records Indexes
CREATE INDEX IF NOT EXISTS idx_migration_records_tenant_id ON migration_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_migration_records_module_id ON migration_records(module_id);
CREATE INDEX IF NOT EXISTS idx_migration_records_status ON migration_records(status);
CREATE INDEX IF NOT EXISTS idx_migration_records_start_time ON migration_records(start_time);

-- Version Compatibility Indexes
CREATE INDEX IF NOT EXISTS idx_version_compatibility_module_id ON version_compatibility(module_id);
CREATE INDEX IF NOT EXISTS idx_version_compatibility_source ON version_compatibility(source_version);
CREATE INDEX IF NOT EXISTS idx_version_compatibility_target ON version_compatibility(target_version);
CREATE INDEX IF NOT EXISTS idx_version_compatibility_level ON version_compatibility(compatibility);

-- Feature Flags Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_module_id ON feature_flags(module_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_version ON feature_flags(version);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(flag_name);

-- Tenant Feature Flags Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant_id ON tenant_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_module_id ON tenant_feature_flags(module_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_flag_name ON tenant_feature_flags(flag_name);

-- Version Routing Indexes
CREATE INDEX IF NOT EXISTS idx_version_routing_tenant_id ON version_routing(tenant_id);
CREATE INDEX IF NOT EXISTS idx_version_routing_module_id ON version_routing(module_id);
CREATE INDEX IF NOT EXISTS idx_version_routing_active ON version_routing(active);

-- Usage Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_module_id ON version_usage_analytics(module_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_version ON version_usage_analytics(version);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_tenant_id ON version_usage_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_usage_date ON version_usage_analytics(usage_date);

-- ========================================
-- FUNCTIONS AND PROCEDURES
-- ========================================

-- Function to get compatible versions
CREATE OR REPLACE FUNCTION get_compatible_versions(
    module_name TEXT,
    current_version TEXT
)
RETURNS TABLE (
    version TEXT,
    compatibility TEXT,
    risk_level TEXT,
    estimated_downtime INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vc.target_version,
        vc.compatibility,
        vc.risk_level,
        vc.estimated_downtime
    FROM version_compatibility vc
    WHERE vc.module_id = module_name 
    AND vc.source_version = current_version
    ORDER BY vc.risk_level, vc.estimated_downtime;
END;
$$ LANGUAGE plpgsql;

-- Function to get version usage statistics
CREATE OR REPLACE FUNCTION get_version_usage_stats(
    module_name TEXT,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    version TEXT,
    tenant_count INTEGER,
    total_users INTEGER,
    total_transactions INTEGER,
    error_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mv.version,
        COUNT(DISTINCT tmi.tenant_id) as tenant_count,
        SUM(ua.daily_active_users) as total_users,
        SUM(ua.total_transactions) as total_transactions,
        CASE 
            WHEN SUM(ua.total_transactions) > 0 
            THEN (SUM(ua.error_count)::NUMERIC / SUM(ua.total_transactions)::NUMERIC) * 100
            ELSE 0 
        END as error_rate
    FROM module_versions mv
    LEFT JOIN tenant_module_instances tmi ON mv.module_id = tmi.module_id AND mv.version = tmi.version
    LEFT JOIN version_usage_analytics ua ON mv.module_id = ua.module_id AND mv.version = ua.version
    WHERE mv.module_id = module_name
    AND ua.usage_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY mv.version
    ORDER BY mv.release_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to create rollback point
CREATE OR REPLACE FUNCTION create_rollback_point(
    tenant_uuid UUID,
    module_name TEXT,
    version_name TEXT,
    rollback_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    rollback_id UUID;
    instance_data JSONB;
BEGIN
    -- Get current instance data
    SELECT custom_config INTO instance_data
    FROM tenant_module_instances
    WHERE tenant_id = tenant_uuid AND module_id = module_name;
    
    -- Create rollback point
    INSERT INTO version_rollback_points (
        tenant_id,
        module_id,
        version,
        rollback_data,
        rollback_reason
    ) VALUES (
        tenant_uuid,
        module_name,
        version_name,
        instance_data,
        rollback_reason
    ) RETURNING id INTO rollback_id;
    
    RETURN rollback_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check feature flag
CREATE OR REPLACE FUNCTION check_feature_flag(
    tenant_uuid UUID,
    module_name TEXT,
    flag_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    flag_value JSONB;
BEGIN
    -- Check tenant override first
    SELECT flag_value INTO flag_value
    FROM tenant_feature_flags
    WHERE tenant_id = tenant_uuid 
    AND module_id = module_name 
    AND flag_name = flag_name;
    
    -- If no override, get default value
    IF flag_value IS NULL THEN
        SELECT default_value INTO flag_value
        FROM feature_flags
        WHERE module_id = module_name 
        AND flag_name = flag_name
        ORDER BY version DESC
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(flag_value, 'false'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Function to get migration path
CREATE OR REPLACE FUNCTION get_migration_path(
    module_name TEXT,
    from_version TEXT,
    to_version TEXT
)
RETURNS TEXT[] AS $$
DECLARE
    path TEXT[];
BEGIN
    SELECT migration_path INTO path
    FROM version_compatibility
    WHERE module_id = module_name 
    AND source_version = from_version 
    AND target_version = to_version;
    
    RETURN COALESCE(path, ARRAY[from_version, to_version]);
END;
$$ LANGUAGE plpgsql;

-- Function to update tenant version
CREATE OR REPLACE FUNCTION update_tenant_version(
    tenant_uuid UUID,
    module_name TEXT,
    new_version TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tenant_module_instances
    SET 
        version = new_version,
        updated_at = NOW()
    WHERE tenant_id = tenant_uuid AND module_id = module_name;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update module_versions updated_at
CREATE OR REPLACE FUNCTION update_module_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_module_versions_updated_at
    BEFORE UPDATE ON module_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_module_versions_updated_at();

-- Trigger to update tenant_module_instances updated_at
CREATE OR REPLACE FUNCTION update_tenant_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_instances_updated_at
    BEFORE UPDATE ON tenant_module_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_instances_updated_at();

-- Trigger to update feature_flags updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_flags_updated_at();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View for version compatibility matrix
CREATE OR REPLACE VIEW version_compatibility_matrix AS
SELECT 
    module_id,
    source_version,
    target_version,
    compatibility,
    risk_level,
    estimated_downtime,
    tested
FROM version_compatibility
ORDER BY module_id, source_version, target_version;

-- View for tenant version distribution
CREATE OR REPLACE VIEW tenant_version_distribution AS
SELECT 
    module_id,
    version,
    COUNT(tenant_id) as tenant_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tenants,
    COUNT(CASE WHEN status = 'customized' THEN 1 END) as customized_tenants,
    COUNT(CASE WHEN status = 'deprecated' THEN 1 END) as deprecated_tenants
FROM tenant_module_instances
GROUP BY module_id, version
ORDER BY module_id, version;

-- View for migration statistics
CREATE OR REPLACE VIEW migration_statistics AS
SELECT 
    module_id,
    from_version,
    to_version,
    COUNT(*) as total_migrations,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_migrations,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_migrations,
    COUNT(CASE WHEN status = 'rolled-back' THEN 1 END) as rollbacks,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_migration_time_seconds
FROM migration_records
WHERE end_time IS NOT NULL
GROUP BY module_id, from_version, to_version
ORDER BY module_id, from_version, to_version;

-- View for feature flag usage
CREATE OR REPLACE VIEW feature_flag_usage AS
SELECT 
    ff.module_id,
    ff.version,
    ff.flag_name,
    ff.default_value,
    COUNT(tff.tenant_id) as override_count,
    COUNT(CASE WHEN tff.flag_value::text = 'true' THEN 1 END) as enabled_count,
    COUNT(CASE WHEN tff.flag_value::text = 'false' THEN 1 END) as disabled_count
FROM feature_flags ff
LEFT JOIN tenant_feature_flags tff ON ff.module_id = tff.module_id AND ff.flag_name = tff.flag_name
GROUP BY ff.module_id, ff.version, ff.flag_name, ff.default_value
ORDER BY ff.module_id, ff.version, ff.flag_name;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Insert sample module versions
INSERT INTO module_versions (id, module_id, version, status, breaking_changes, migration_required, features, deprecated_features) VALUES
('version_accounting_1.0.0', 'accounting', '1.0.0', 'stable', false, false, '["basic-ledger", "chart-of-accounts"]', '[]'),
('version_accounting_1.1.0', 'accounting', '1.1.0', 'stable', false, false, '["basic-ledger", "chart-of-accounts", "financial-reports"]', '[]'),
('version_accounting_2.0.0', 'accounting', '2.0.0', 'stable', true, true, '["basic-ledger", "chart-of-accounts", "financial-reports", "ai-insights"]', '["old-reporting"]'),
('version_accounting_2.1.0', 'accounting', '2.1.0', 'stable', false, false, '["basic-ledger", "chart-of-accounts", "financial-reports", "ai-insights", "automated-reconciliation"]', '["old-reporting"]');

-- Insert sample version compatibility
INSERT INTO version_compatibility (module_id, source_version, target_version, compatibility, risk_level, estimated_downtime, required_actions) VALUES
('accounting', '1.0.0', '1.1.0', 'compatible', 'low', 5, '[]'),
('accounting', '1.1.0', '2.0.0', 'breaking', 'high', 60, '["review-breaking-changes", "update-integrations", "test-thoroughly"]'),
('accounting', '2.0.0', '2.1.0', 'compatible', 'low', 10, '[]'),
('accounting', '1.0.0', '2.0.0', 'breaking', 'critical', 120, '["major-migration-required", "data-transformation", "extensive-testing"]');

-- Insert sample feature flags
INSERT INTO feature_flags (module_id, version, flag_name, flag_description, default_value, flag_type) VALUES
('accounting', '2.0.0', 'ai_insights_enabled', 'Enable AI-powered insights', false, 'boolean'),
('accounting', '2.0.0', 'new_ui_enabled', 'Enable new user interface', true, 'boolean'),
('accounting', '2.1.0', 'auto_reconciliation_enabled', 'Enable automated reconciliation', false, 'boolean'); 