-- ========================================
-- MODULE DATA MIGRATION SCHEMA
-- ========================================

-- Module Migrations Table
CREATE TABLE IF NOT EXISTS module_migrations (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    from_version TEXT NOT NULL,
    to_version TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'rolled-back')),
    migration_type TEXT NOT NULL CHECK (migration_type IN ('schema', 'data', 'both')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    errors JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    rollback_data JSONB DEFAULT '{}',
    migration_steps JSONB DEFAULT '[]',
    customizations_migrated INTEGER DEFAULT 0,
    data_records_migrated INTEGER DEFAULT 0,
    schema_changes_applied INTEGER DEFAULT 0,
    backup_id TEXT,
    rollback_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration Steps Table
CREATE TABLE IF NOT EXISTS migration_steps (
    id TEXT PRIMARY KEY,
    migration_id TEXT NOT NULL REFERENCES module_migrations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('backup', 'schema', 'data', 'customization', 'validation', 'cleanup')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'skipped')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    error TEXT,
    details JSONB DEFAULT '{}',
    rollback_supported BOOLEAN DEFAULT false,
    rollback_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    migration_file TEXT NOT NULL,
    checksum TEXT NOT NULL,
    up_sql TEXT NOT NULL,
    down_sql TEXT NOT NULL,
    dependencies JSONB DEFAULT '[]',
    rollback_supported BOOLEAN DEFAULT true,
    validation_queries JSONB DEFAULT '[]',
    estimated_time INTEGER DEFAULT 0,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, migration_file)
);

-- Data Migrations Table
CREATE TABLE IF NOT EXISTS data_migrations (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    from_version TEXT NOT NULL,
    to_version TEXT NOT NULL,
    transformation_rules JSONB DEFAULT '[]',
    validation_rules JSONB DEFAULT '[]',
    rollback_strategy TEXT NOT NULL CHECK (rollback_strategy IN ('snapshot', 'incremental', 'none')),
    batch_size INTEGER DEFAULT 1000,
    estimated_records INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, from_version, to_version)
);

-- Migration Backups Table
CREATE TABLE IF NOT EXISTS migration_backups (
    id TEXT PRIMARY KEY,
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'schema-only')),
    backup_data JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    size BIGINT DEFAULT 0
);

-- Rollback Points Table
CREATE TABLE IF NOT EXISTS rollback_points (
    id TEXT PRIMARY KEY,
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    rollback_data JSONB NOT NULL,
    migration_id TEXT NOT NULL REFERENCES module_migrations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    description TEXT
);

-- Module Schema Registry Table
CREATE TABLE IF NOT EXISTS module_schema_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    schema_definition JSONB NOT NULL,
    table_definitions JSONB NOT NULL,
    index_definitions JSONB DEFAULT '[]',
    constraint_definitions JSONB DEFAULT '[]',
    trigger_definitions JSONB DEFAULT '[]',
    function_definitions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version)
);

-- Tenant Schema Instances Table
CREATE TABLE IF NOT EXISTS tenant_schema_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    schema_instance JSONB NOT NULL,
    table_instances JSONB NOT NULL,
    custom_tables JSONB DEFAULT '[]',
    custom_columns JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, module_id)
);

-- Migration Validation Rules Table
CREATE TABLE IF NOT EXISTS migration_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('data-integrity', 'schema-consistency', 'business-logic', 'performance')),
    validation_query TEXT NOT NULL,
    expected_result JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, rule_name)
);

-- Migration Dependencies Table
CREATE TABLE IF NOT EXISTS migration_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id TEXT NOT NULL,
    dependency_type TEXT NOT NULL CHECK (dependency_type IN ('module', 'schema', 'data', 'external')),
    dependency_id TEXT NOT NULL,
    dependency_version TEXT,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration Execution Logs Table
CREATE TABLE IF NOT EXISTS migration_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id TEXT NOT NULL REFERENCES module_migrations(id) ON DELETE CASCADE,
    step_id TEXT,
    log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Module Migrations Indexes
CREATE INDEX IF NOT EXISTS idx_module_migrations_module_id ON module_migrations(module_id);
CREATE INDEX IF NOT EXISTS idx_module_migrations_tenant_id ON module_migrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_module_migrations_status ON module_migrations(status);
CREATE INDEX IF NOT EXISTS idx_module_migrations_start_time ON module_migrations(start_time);
CREATE INDEX IF NOT EXISTS idx_module_migrations_versions ON module_migrations(from_version, to_version);

-- Migration Steps Indexes
CREATE INDEX IF NOT EXISTS idx_migration_steps_migration_id ON migration_steps(migration_id);
CREATE INDEX IF NOT EXISTS idx_migration_steps_status ON migration_steps(status);
CREATE INDEX IF NOT EXISTS idx_migration_steps_type ON migration_steps(type);

-- Schema Migrations Indexes
CREATE INDEX IF NOT EXISTS idx_schema_migrations_module_id ON schema_migrations(module_id);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_risk_level ON schema_migrations(risk_level);

-- Data Migrations Indexes
CREATE INDEX IF NOT EXISTS idx_data_migrations_module_id ON data_migrations(module_id);
CREATE INDEX IF NOT EXISTS idx_data_migrations_versions ON data_migrations(from_version, to_version);

-- Migration Backups Indexes
CREATE INDEX IF NOT EXISTS idx_migration_backups_tenant_id ON migration_backups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_migration_backups_module_id ON migration_backups(module_id);
CREATE INDEX IF NOT EXISTS idx_migration_backups_created_at ON migration_backups(created_at);
CREATE INDEX IF NOT EXISTS idx_migration_backups_expires_at ON migration_backups(expires_at);

-- Rollback Points Indexes
CREATE INDEX IF NOT EXISTS idx_rollback_points_tenant_id ON rollback_points(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rollback_points_module_id ON rollback_points(module_id);
CREATE INDEX IF NOT EXISTS idx_rollback_points_migration_id ON rollback_points(migration_id);

-- Schema Registry Indexes
CREATE INDEX IF NOT EXISTS idx_schema_registry_module_id ON module_schema_registry(module_id);
CREATE INDEX IF NOT EXISTS idx_schema_registry_version ON module_schema_registry(version);

-- Tenant Schema Instances Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_schema_tenant_id ON tenant_schema_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_schema_module_id ON tenant_schema_instances(module_id);

-- Validation Rules Indexes
CREATE INDEX IF NOT EXISTS idx_validation_rules_module_id ON migration_validation_rules(module_id);
CREATE INDEX IF NOT EXISTS idx_validation_rules_version ON migration_validation_rules(version);
CREATE INDEX IF NOT EXISTS idx_validation_rules_severity ON migration_validation_rules(severity);

-- Migration Dependencies Indexes
CREATE INDEX IF NOT EXISTS idx_migration_dependencies_migration_id ON migration_dependencies(migration_id);
CREATE INDEX IF NOT EXISTS idx_migration_dependencies_type ON migration_dependencies(dependency_type);

-- Execution Logs Indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_migration_id ON migration_execution_logs(migration_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_timestamp ON migration_execution_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON migration_execution_logs(log_level);

-- ========================================
-- FUNCTIONS AND PROCEDURES
-- ========================================

-- Function to execute SQL with tenant isolation
CREATE OR REPLACE FUNCTION execute_sql(
    sql_query TEXT,
    tenant_id UUID
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    tenant_schema TEXT;
BEGIN
    -- Get tenant schema
    tenant_schema := 'tenant_' || tenant_id::TEXT;
    
    -- Set search path to tenant schema
    SET search_path TO tenant_schema, public;
    
    -- Execute SQL query
    EXECUTE sql_query;
    
    -- Return success result
    result := jsonb_build_object(
        'success', true,
        'tenant_id', tenant_id,
        'schema', tenant_schema
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'tenant_id', tenant_id,
            'schema', tenant_schema
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    schema_name TEXT;
BEGIN
    schema_name := 'tenant_' || tenant_uuid::TEXT;
    
    -- Create schema if it doesn't exist
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(schema_name);
    
    RETURN schema_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to backup tenant data
CREATE OR REPLACE FUNCTION backup_tenant_data(
    tenant_uuid UUID,
    module_name TEXT,
    backup_type TEXT DEFAULT 'full'
)
RETURNS JSONB AS $$
DECLARE
    schema_name TEXT;
    backup_data JSONB := '{}';
    table_name TEXT;
    table_data JSONB;
BEGIN
    schema_name := 'tenant_' || tenant_uuid::TEXT;
    
    -- Get all tables in tenant schema
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = schema_name 
        AND tablename LIKE module_name || '_%'
    LOOP
        -- Get table data
        EXECUTE format(
            'SELECT jsonb_agg(to_jsonb(t.*)) FROM %I.%I t',
            schema_name,
            table_name
        ) INTO table_data;
        
        -- Add to backup data
        backup_data := backup_data || jsonb_build_object(table_name, COALESCE(table_data, '[]'::jsonb));
    END LOOP;
    
    RETURN backup_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore tenant data
CREATE OR REPLACE FUNCTION restore_tenant_data(
    tenant_uuid UUID,
    module_name TEXT,
    backup_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    schema_name TEXT;
    table_name TEXT;
    table_data JSONB;
    column_names TEXT[];
    insert_sql TEXT;
BEGIN
    schema_name := 'tenant_' || tenant_uuid::TEXT;
    
    -- Ensure schema exists
    PERFORM create_tenant_schema(tenant_uuid);
    
    -- Restore each table
    FOR table_name, table_data IN SELECT * FROM jsonb_each(backup_data)
    LOOP
        -- Get column names from first record
        SELECT array_agg(key) INTO column_names
        FROM jsonb_object_keys((table_data->0)) AS key;
        
        -- Build insert SQL
        insert_sql := format(
            'INSERT INTO %I.%I (%s) SELECT %s FROM jsonb_populate_recordset(null::%I.%I, %L)',
            schema_name,
            table_name,
            array_to_string(column_names, ', '),
            array_to_string(column_names, ', '),
            schema_name,
            table_name,
            table_data
        );
        
        -- Execute insert
        EXECUTE insert_sql;
    END LOOP;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate migration
CREATE OR REPLACE FUNCTION validate_migration(
    tenant_uuid UUID,
    module_name TEXT,
    target_version TEXT
)
RETURNS JSONB AS $$
DECLARE
    validation_result JSONB := '{}';
    rule RECORD;
    query_result JSONB;
    is_valid BOOLEAN := true;
    errors JSONB := '[]';
    warnings JSONB := '[]';
BEGIN
    -- Get validation rules for the module version
    FOR rule IN 
        SELECT * FROM migration_validation_rules 
        WHERE module_id = module_name AND version = target_version
    LOOP
        -- Execute validation query
        EXECUTE rule.validation_query INTO query_result;
        
        -- Check if validation passed
        IF rule.expected_result IS NOT NULL AND query_result != rule.expected_result THEN
            is_valid := false;
            
            IF rule.severity = 'error' THEN
                errors := errors || jsonb_build_object(
                    'rule', rule.rule_name,
                    'message', rule.description,
                    'expected', rule.expected_result,
                    'actual', query_result
                );
            ELSE
                warnings := warnings || jsonb_build_object(
                    'rule', rule.rule_name,
                    'message', rule.description,
                    'expected', rule.expected_result,
                    'actual', query_result
                );
            END IF;
        END IF;
    END LOOP;
    
    -- Build result
    validation_result := jsonb_build_object(
        'is_valid', is_valid,
        'errors', errors,
        'warnings', warnings,
        'tenant_id', tenant_uuid,
        'module_id', module_name,
        'target_version', target_version
    );
    
    RETURN validation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get migration statistics
CREATE OR REPLACE FUNCTION get_migration_statistics(module_name TEXT)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'successful', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed'),
        'rolled_back', COUNT(*) FILTER (WHERE status = 'rolled-back'),
        'average_time', AVG(EXTRACT(EPOCH FROM (end_time - start_time))) FILTER (WHERE end_time IS NOT NULL),
        'success_rate', (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100)
    ) INTO stats
    FROM module_migrations
    WHERE module_id = module_name;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired backups
CREATE OR REPLACE FUNCTION cleanup_expired_backups()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM migration_backups 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired rollback points
CREATE OR REPLACE FUNCTION cleanup_expired_rollback_points()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rollback_points 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update schema registry updated_at
CREATE OR REPLACE FUNCTION update_schema_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schema_registry_updated_at
    BEFORE UPDATE ON module_schema_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_schema_registry_updated_at();

-- Trigger to update tenant schema instances updated_at
CREATE OR REPLACE FUNCTION update_tenant_schema_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_schema_updated_at
    BEFORE UPDATE ON tenant_schema_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_schema_updated_at();

-- Trigger to log migration execution
CREATE OR REPLACE FUNCTION log_migration_execution()
RETURNS TRIGGER AS $$
BEGIN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO migration_execution_logs (
            migration_id,
            log_level,
            message,
            details
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.status = 'completed' THEN 'info'
                WHEN NEW.status = 'failed' THEN 'error'
                WHEN NEW.status = 'rolled-back' THEN 'warning'
                ELSE 'info'
            END,
            'Migration status changed to ' || NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'module_id', NEW.module_id,
                'tenant_id', NEW.tenant_id
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_migration_execution
    AFTER UPDATE ON module_migrations
    FOR EACH ROW
    EXECUTE FUNCTION log_migration_execution();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View for migration overview
CREATE OR REPLACE VIEW migration_overview AS
SELECT 
    module_id,
    COUNT(*) as total_migrations,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_migrations,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_migrations,
    COUNT(*) FILTER (WHERE status = 'rolled-back') as rolled_back_migrations,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))) FILTER (WHERE end_time IS NOT NULL) as avg_duration_seconds,
    (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100) as success_rate
FROM module_migrations
GROUP BY module_id
ORDER BY module_id;

-- View for migration details
CREATE OR REPLACE VIEW migration_details AS
SELECT 
    mm.id,
    mm.module_id,
    mm.from_version,
    mm.to_version,
    mm.tenant_id,
    mm.status,
    mm.migration_type,
    mm.start_time,
    mm.end_time,
    mm.customizations_migrated,
    mm.data_records_migrated,
    mm.schema_changes_applied,
    EXTRACT(EPOCH FROM (mm.end_time - mm.start_time)) as duration_seconds,
    mm.errors,
    mm.warnings
FROM module_migrations mm
ORDER BY mm.start_time DESC;

-- View for migration step analysis
CREATE OR REPLACE VIEW migration_step_analysis AS
SELECT 
    ms.migration_id,
    mm.module_id,
    mm.tenant_id,
    ms.name,
    ms.type,
    ms.status,
    ms.start_time,
    ms.end_time,
    EXTRACT(EPOCH FROM (ms.end_time - ms.start_time)) as duration_seconds,
    ms.error,
    ms.rollback_supported
FROM migration_steps ms
JOIN module_migrations mm ON ms.migration_id = mm.id
ORDER BY ms.start_time DESC;

-- View for backup statistics
CREATE OR REPLACE VIEW backup_statistics AS
SELECT 
    module_id,
    backup_type,
    COUNT(*) as total_backups,
    AVG(size) as avg_size_bytes,
    MIN(created_at) as oldest_backup,
    MAX(created_at) as newest_backup,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_backups
FROM migration_backups
GROUP BY module_id, backup_type
ORDER BY module_id, backup_type;

-- View for schema migration registry
CREATE OR REPLACE VIEW schema_migration_registry AS
SELECT 
    module_id,
    version,
    migration_file,
    risk_level,
    estimated_time,
    rollback_supported,
    created_at
FROM schema_migrations
ORDER BY module_id, version, created_at;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Insert sample schema migrations
INSERT INTO schema_migrations (id, module_id, version, migration_file, checksum, up_sql, down_sql, risk_level, estimated_time) VALUES
('schema_accounting_1.1.0_001', 'accounting', '1.1.0', '001_add_financial_reports.sql', 'abc123', 
 'CREATE TABLE IF NOT EXISTS financial_reports (id UUID PRIMARY KEY, name TEXT, data JSONB);',
 'DROP TABLE IF EXISTS financial_reports;',
 'low', 5),
('schema_accounting_2.0.0_001', 'accounting', '2.0.0', '001_add_ai_insights.sql', 'def456',
 'ALTER TABLE financial_reports ADD COLUMN ai_insights JSONB;',
 'ALTER TABLE financial_reports DROP COLUMN ai_insights;',
 'medium', 10);

-- Insert sample data migrations
INSERT INTO data_migrations (id, module_id, from_version, to_version, transformation_rules, rollback_strategy, batch_size) VALUES
('data_accounting_1.0.0_1.1.0', 'accounting', '1.0.0', '1.1.0', 
 '[{"id": "transform_1", "sourceTable": "ledger_entries", "targetTable": "financial_reports", "transformationType": "copy"}]',
 'snapshot', 1000),
('data_accounting_1.1.0_2.0.0', 'accounting', '1.1.0', '2.0.0',
 '[{"id": "transform_2", "sourceTable": "financial_reports", "targetTable": "financial_reports", "transformationType": "transform"}]',
 'incremental', 500);

-- Insert sample validation rules
INSERT INTO migration_validation_rules (module_id, version, rule_name, rule_type, validation_query, expected_result, severity, description) VALUES
('accounting', '2.0.0', 'data_integrity_check', 'data-integrity', 
 'SELECT COUNT(*) FROM financial_reports WHERE ai_insights IS NULL;', 
 '{"count": 0}', 'error', 'Ensure all financial reports have AI insights'),
('accounting', '2.0.0', 'performance_check', 'performance',
 'SELECT COUNT(*) FROM financial_reports;',
 '{"count": {"operator": ">", "value": 0}}', 'warning', 'Ensure financial reports table has data'); 