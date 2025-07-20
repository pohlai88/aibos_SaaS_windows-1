-- ========================================
-- PERFORMANCE ISOLATION SCHEMA
-- ========================================

-- Module Sandboxes Table
CREATE TABLE IF NOT EXISTS module_sandboxes (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    version TEXT NOT NULL,
    isolation_level TEXT NOT NULL CHECK (isolation_level IN ('light', 'medium', 'strict', 'custom')),
    resource_limits JSONB NOT NULL,
    throttle_rules JSONB DEFAULT '[]',
    monitoring JSONB NOT NULL,
    auto_scaling JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'throttled', 'scaling')),
    status_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, tenant_id, version)
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id TEXT NOT NULL REFERENCES module_sandboxes(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    version TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cpu_usage NUMERIC(5,2) DEFAULT 0,
    cpu_load NUMERIC(5,2) DEFAULT 0,
    cpu_throttled BOOLEAN DEFAULT false,
    memory_used INTEGER DEFAULT 0,
    memory_peak INTEGER DEFAULT 0,
    memory_limit INTEGER DEFAULT 0,
    memory_exceeded BOOLEAN DEFAULT false,
    api_requests_per_second INTEGER DEFAULT 0,
    api_requests_per_minute INTEGER DEFAULT 0,
    api_requests_per_hour INTEGER DEFAULT 0,
    api_throttled BOOLEAN DEFAULT false,
    api_response_time INTEGER DEFAULT 0,
    db_connections INTEGER DEFAULT 0,
    db_active_queries INTEGER DEFAULT 0,
    db_slow_queries INTEGER DEFAULT 0,
    db_throttled BOOLEAN DEFAULT false,
    storage_used INTEGER DEFAULT 0,
    storage_files INTEGER DEFAULT 0,
    storage_exceeded BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical', 'throttled', 'suspended')),
    violations JSONB DEFAULT '[]'
);

-- Performance Violations Table
CREATE TABLE IF NOT EXISTS performance_violations (
    id TEXT PRIMARY KEY,
    sandbox_id TEXT NOT NULL REFERENCES module_sandboxes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('cpu', 'memory', 'api', 'database', 'storage')),
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'blocking')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    value NUMERIC(10,2) NOT NULL,
    limit_value NUMERIC(10,2) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('throttled', 'suspended', 'alerted', 'none')),
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

-- Throttle Rules Table
CREATE TABLE IF NOT EXISTS throttle_rules (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    tenant_id UUID,
    type TEXT NOT NULL CHECK (type IN ('cpu', 'memory', 'api', 'database', 'storage')),
    condition TEXT NOT NULL CHECK (condition IN ('exceeds', 'below', 'equals')),
    threshold NUMERIC(10,2) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('throttle', 'suspend', 'alert', 'restart')),
    duration INTEGER NOT NULL DEFAULT 300,
    cooldown INTEGER NOT NULL DEFAULT 60,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Alerts Table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('warning', 'critical', 'blocking')),
    message TEXT NOT NULL,
    metrics JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

-- Resource Usage History Table
CREATE TABLE IF NOT EXISTS resource_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id TEXT NOT NULL REFERENCES module_sandboxes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    cpu_avg_usage NUMERIC(5,2) DEFAULT 0,
    cpu_peak_usage NUMERIC(5,2) DEFAULT 0,
    memory_avg_used INTEGER DEFAULT 0,
    memory_peak_used INTEGER DEFAULT 0,
    api_total_requests INTEGER DEFAULT 0,
    api_avg_response_time INTEGER DEFAULT 0,
    db_total_queries INTEGER DEFAULT 0,
    db_slow_queries INTEGER DEFAULT 0,
    storage_used INTEGER DEFAULT 0,
    violations_count INTEGER DEFAULT 0,
    throttling_events INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sandbox_id, date, hour)
);

-- Throttling Events Table
CREATE TABLE IF NOT EXISTS throttling_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id TEXT NOT NULL REFERENCES module_sandboxes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('cpu', 'memory', 'api', 'database', 'storage')),
    level TEXT NOT NULL CHECK (level IN ('light', 'medium', 'strict')),
    reason TEXT NOT NULL,
    duration INTEGER NOT NULL,
    metrics_snapshot JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true
);

-- Auto Scaling Events Table
CREATE TABLE IF NOT EXISTS auto_scaling_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sandbox_id TEXT NOT NULL REFERENCES module_sandboxes(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('scale_up', 'scale_down')),
    reason TEXT NOT NULL,
    old_instances INTEGER NOT NULL,
    new_instances INTEGER NOT NULL,
    trigger_metric TEXT NOT NULL,
    trigger_value NUMERIC(10,2) NOT NULL,
    threshold_value NUMERIC(10,2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Resource Limits Templates Table
CREATE TABLE IF NOT EXISTS resource_limits_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    isolation_level TEXT NOT NULL CHECK (isolation_level IN ('light', 'medium', 'strict', 'custom')),
    resource_limits JSONB NOT NULL,
    throttle_rules JSONB DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Performance Baselines Table
CREATE TABLE IF NOT EXISTS module_performance_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    baseline_type TEXT NOT NULL CHECK (baseline_type IN ('normal', 'peak', 'idle')),
    cpu_avg_usage NUMERIC(5,2) NOT NULL,
    cpu_peak_usage NUMERIC(5,2) NOT NULL,
    memory_avg_used INTEGER NOT NULL,
    memory_peak_used INTEGER NOT NULL,
    api_avg_requests_per_second INTEGER NOT NULL,
    api_peak_requests_per_second INTEGER NOT NULL,
    api_avg_response_time INTEGER NOT NULL,
    db_avg_connections INTEGER NOT NULL,
    db_avg_queries_per_minute INTEGER NOT NULL,
    storage_avg_used INTEGER NOT NULL,
    sample_size INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, baseline_type)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Module Sandboxes Indexes
CREATE INDEX IF NOT EXISTS idx_module_sandboxes_module_id ON module_sandboxes(module_id);
CREATE INDEX IF NOT EXISTS idx_module_sandboxes_tenant_id ON module_sandboxes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_module_sandboxes_status ON module_sandboxes(status);
CREATE INDEX IF NOT EXISTS idx_module_sandboxes_isolation_level ON module_sandboxes(isolation_level);

-- Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_sandbox_id ON performance_metrics(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status ON performance_metrics(status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_cpu_usage ON performance_metrics(cpu_usage);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_memory_used ON performance_metrics(memory_used);

-- Performance Violations Indexes
CREATE INDEX IF NOT EXISTS idx_performance_violations_sandbox_id ON performance_violations(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_performance_violations_type ON performance_violations(type);
CREATE INDEX IF NOT EXISTS idx_performance_violations_severity ON performance_violations(severity);
CREATE INDEX IF NOT EXISTS idx_performance_violations_timestamp ON performance_violations(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_violations_resolved ON performance_violations(resolved);

-- Throttle Rules Indexes
CREATE INDEX IF NOT EXISTS idx_throttle_rules_module_id ON throttle_rules(module_id);
CREATE INDEX IF NOT EXISTS idx_throttle_rules_tenant_id ON throttle_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_throttle_rules_type ON throttle_rules(type);
CREATE INDEX IF NOT EXISTS idx_throttle_rules_enabled ON throttle_rules(enabled);

-- Performance Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_performance_alerts_module_id ON performance_alerts(module_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_tenant_id ON performance_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(type);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_acknowledged ON performance_alerts(acknowledged);

-- Resource Usage History Indexes
CREATE INDEX IF NOT EXISTS idx_resource_usage_sandbox_id ON resource_usage_history(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_date ON resource_usage_history(date);
CREATE INDEX IF NOT EXISTS idx_resource_usage_hour ON resource_usage_history(hour);

-- Throttling Events Indexes
CREATE INDEX IF NOT EXISTS idx_throttling_events_sandbox_id ON throttling_events(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_throttling_events_type ON throttling_events(type);
CREATE INDEX IF NOT EXISTS idx_throttling_events_started_at ON throttling_events(started_at);
CREATE INDEX IF NOT EXISTS idx_throttling_events_active ON throttling_events(active);

-- Auto Scaling Events Indexes
CREATE INDEX IF NOT EXISTS idx_auto_scaling_sandbox_id ON auto_scaling_events(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_auto_scaling_action ON auto_scaling_events(action);
CREATE INDEX IF NOT EXISTS idx_auto_scaling_timestamp ON auto_scaling_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_auto_scaling_completed ON auto_scaling_events(completed);

-- ========================================
-- FUNCTIONS AND PROCEDURES
-- ========================================

-- Function to get current performance status
CREATE OR REPLACE FUNCTION get_performance_status(sandbox_uuid TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    latest_metrics RECORD;
BEGIN
    -- Get latest metrics
    SELECT * INTO latest_metrics
    FROM performance_metrics
    WHERE sandbox_id = sandbox_uuid
    ORDER BY timestamp DESC
    LIMIT 1;
    
    IF latest_metrics IS NULL THEN
        RETURN jsonb_build_object('status', 'unknown', 'message', 'No metrics available');
    END IF;
    
    -- Build result
    result := jsonb_build_object(
        'status', latest_metrics.status,
        'cpu_usage', latest_metrics.cpu_usage,
        'memory_used', latest_metrics.memory_used,
        'api_requests_per_second', latest_metrics.api_requests_per_second,
        'violations_count', jsonb_array_length(latest_metrics.violations),
        'timestamp', latest_metrics.timestamp
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if throttling is needed
CREATE OR REPLACE FUNCTION check_throttling_needed(
    sandbox_uuid TEXT,
    metric_type TEXT,
    current_value NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
    throttle_rule RECORD;
    sandbox_config RECORD;
BEGIN
    -- Get sandbox configuration
    SELECT * INTO sandbox_config
    FROM module_sandboxes
    WHERE id = sandbox_uuid;
    
    IF sandbox_config IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check throttle rules
    FOR throttle_rule IN 
        SELECT * FROM jsonb_array_elements(sandbox_config.throttle_rules) AS rule
        WHERE rule->>'type' = metric_type
        AND (rule->>'enabled')::boolean = true
    LOOP
        IF (rule->>'condition') = 'exceeds' AND current_value > (rule->>'threshold')::numeric THEN
            RETURN true;
        ELSIF (rule->>'condition') = 'below' AND current_value < (rule->>'threshold')::numeric THEN
            RETURN true;
        ELSIF (rule->>'condition') = 'equals' AND current_value = (rule->>'threshold')::numeric THEN
            RETURN true;
        END IF;
    END LOOP;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to apply throttling
CREATE OR REPLACE FUNCTION apply_throttling(
    sandbox_uuid TEXT,
    throttle_type TEXT,
    throttle_level TEXT,
    reason TEXT
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    -- Create throttling event
    INSERT INTO throttling_events (
        sandbox_id,
        type,
        level,
        reason,
        duration,
        active
    ) VALUES (
        sandbox_uuid,
        throttle_type,
        throttle_level,
        reason,
        CASE 
            WHEN throttle_level = 'light' THEN 60
            WHEN throttle_level = 'medium' THEN 300
            WHEN throttle_level = 'strict' THEN 600
            ELSE 300
        END,
        true
    ) RETURNING id INTO event_id;
    
    -- Update sandbox status
    UPDATE module_sandboxes
    SET 
        status = 'throttled',
        status_reason = reason,
        updated_at = NOW()
    WHERE id = sandbox_uuid;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to end throttling
CREATE OR REPLACE FUNCTION end_throttling(event_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sandbox_uuid TEXT;
BEGIN
    -- Get sandbox ID
    SELECT sandbox_id INTO sandbox_uuid
    FROM throttling_events
    WHERE id = event_uuid;
    
    -- End throttling event
    UPDATE throttling_events
    SET 
        ended_at = NOW(),
        active = false
    WHERE id = event_uuid;
    
    -- Update sandbox status
    UPDATE module_sandboxes
    SET 
        status = 'active',
        status_reason = 'Throttling ended',
        updated_at = NOW()
    WHERE id = sandbox_uuid;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance statistics
CREATE OR REPLACE FUNCTION get_performance_statistics(
    module_name TEXT,
    days_back INTEGER DEFAULT 7
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_sandboxes', COUNT(DISTINCT ms.id),
        'active_sandboxes', COUNT(DISTINCT ms.id) FILTER (WHERE ms.status = 'active'),
        'suspended_sandboxes', COUNT(DISTINCT ms.id) FILTER (WHERE ms.status = 'suspended'),
        'throttled_sandboxes', COUNT(DISTINCT ms.id) FILTER (WHERE ms.status = 'throttled'),
        'avg_cpu_usage', AVG(pm.cpu_usage),
        'avg_memory_usage', AVG(pm.memory_used),
        'total_violations', COUNT(pv.id),
        'critical_violations', COUNT(pv.id) FILTER (WHERE pv.severity = 'critical'),
        'throttling_events', COUNT(te.id),
        'performance_alerts', COUNT(pa.id)
    ) INTO result
    FROM module_sandboxes ms
    LEFT JOIN performance_metrics pm ON ms.id = pm.sandbox_id
    LEFT JOIN performance_violations pv ON ms.id = pv.sandbox_id
    LEFT JOIN throttling_events te ON ms.id = te.sandbox_id
    LEFT JOIN performance_alerts pa ON ms.module_id = pa.module_id
    WHERE ms.module_id = module_name
    AND pm.timestamp >= NOW() - INTERVAL '1 day' * days_back;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old metrics
CREATE OR REPLACE FUNCTION cleanup_old_metrics(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM performance_metrics
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate hourly metrics
CREATE OR REPLACE FUNCTION aggregate_hourly_metrics()
RETURNS INTEGER AS $$
DECLARE
    aggregated_count INTEGER := 0;
    hour_record RECORD;
BEGIN
    -- Aggregate metrics by hour
    FOR hour_record IN 
        SELECT 
            sandbox_id,
            DATE(timestamp) as date,
            EXTRACT(hour FROM timestamp) as hour,
            AVG(cpu_usage) as cpu_avg_usage,
            MAX(cpu_usage) as cpu_peak_usage,
            AVG(memory_used) as memory_avg_used,
            MAX(memory_used) as memory_peak_used,
            SUM(api_requests_per_second) as api_total_requests,
            AVG(api_response_time) as api_avg_response_time,
            SUM(db_connections) as db_total_queries,
            SUM(db_slow_queries) as db_slow_queries,
            MAX(storage_used) as storage_used,
            COUNT(*) as violations_count
        FROM performance_metrics
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
        GROUP BY sandbox_id, DATE(timestamp), EXTRACT(hour FROM timestamp)
    LOOP
        INSERT INTO resource_usage_history (
            sandbox_id,
            date,
            hour,
            cpu_avg_usage,
            cpu_peak_usage,
            memory_avg_used,
            memory_peak_used,
            api_total_requests,
            api_avg_response_time,
            db_total_queries,
            db_slow_queries,
            storage_used,
            violations_count
        ) VALUES (
            hour_record.sandbox_id,
            hour_record.date,
            hour_record.hour,
            hour_record.cpu_avg_usage,
            hour_record.cpu_peak_usage,
            hour_record.memory_avg_used,
            hour_record.memory_peak_used,
            hour_record.api_total_requests,
            hour_record.api_avg_response_time,
            hour_record.db_total_queries,
            hour_record.db_slow_queries,
            hour_record.storage_used,
            hour_record.violations_count
        )
        ON CONFLICT (sandbox_id, date, hour) 
        DO UPDATE SET
            cpu_avg_usage = EXCLUDED.cpu_avg_usage,
            cpu_peak_usage = EXCLUDED.cpu_peak_usage,
            memory_avg_used = EXCLUDED.memory_avg_used,
            memory_peak_used = EXCLUDED.memory_peak_used,
            api_total_requests = EXCLUDED.api_total_requests,
            api_avg_response_time = EXCLUDED.api_avg_response_time,
            db_total_queries = EXCLUDED.db_total_queries,
            db_slow_queries = EXCLUDED.db_slow_queries,
            storage_used = EXCLUDED.storage_used,
            violations_count = EXCLUDED.violations_count;
        
        aggregated_count := aggregated_count + 1;
    END LOOP;
    
    RETURN aggregated_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update sandboxes updated_at
CREATE OR REPLACE FUNCTION update_sandboxes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sandboxes_updated_at
    BEFORE UPDATE ON module_sandboxes
    FOR EACH ROW
    EXECUTE FUNCTION update_sandboxes_updated_at();

-- Trigger to update throttle rules updated_at
CREATE OR REPLACE FUNCTION update_throttle_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_throttle_rules_updated_at
    BEFORE UPDATE ON throttle_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_throttle_rules_updated_at();

-- Trigger to update resource limits templates updated_at
CREATE OR REPLACE FUNCTION update_resource_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_templates_updated_at
    BEFORE UPDATE ON resource_limits_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_templates_updated_at();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View for current performance overview
CREATE OR REPLACE VIEW current_performance_overview AS
SELECT 
    ms.module_id,
    ms.tenant_id,
    ms.version,
    ms.isolation_level,
    ms.status,
    pm.cpu_usage,
    pm.memory_used,
    pm.api_requests_per_second,
    pm.status as performance_status,
    pm.timestamp as last_updated
FROM module_sandboxes ms
LEFT JOIN LATERAL (
    SELECT * FROM performance_metrics 
    WHERE sandbox_id = ms.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) pm ON true
ORDER BY pm.timestamp DESC;

-- View for performance violations summary
CREATE OR REPLACE VIEW performance_violations_summary AS
SELECT 
    module_id,
    type,
    severity,
    COUNT(*) as violation_count,
    COUNT(*) FILTER (WHERE resolved = false) as active_violations,
    MAX(timestamp) as last_violation
FROM performance_violations pv
JOIN module_sandboxes ms ON pv.sandbox_id = ms.id
GROUP BY module_id, type, severity
ORDER BY violation_count DESC;

-- View for throttling events summary
CREATE OR REPLACE VIEW throttling_events_summary AS
SELECT 
    ms.module_id,
    te.type,
    te.level,
    COUNT(*) as event_count,
    AVG(EXTRACT(EPOCH FROM (te.ended_at - te.started_at))) as avg_duration_seconds,
    MAX(te.started_at) as last_event
FROM throttling_events te
JOIN module_sandboxes ms ON te.sandbox_id = ms.id
GROUP BY ms.module_id, te.type, te.level
ORDER BY event_count DESC;

-- View for resource usage trends
CREATE OR REPLACE VIEW resource_usage_trends AS
SELECT 
    ms.module_id,
    ruh.date,
    ruh.hour,
    AVG(ruh.cpu_avg_usage) as avg_cpu_usage,
    MAX(ruh.cpu_peak_usage) as max_cpu_usage,
    AVG(ruh.memory_avg_used) as avg_memory_used,
    MAX(ruh.memory_peak_used) as max_memory_used,
    SUM(ruh.api_total_requests) as total_api_requests,
    AVG(ruh.api_avg_response_time) as avg_response_time,
    SUM(ruh.violations_count) as total_violations
FROM resource_usage_history ruh
JOIN module_sandboxes ms ON ruh.sandbox_id = ms.id
GROUP BY ms.module_id, ruh.date, ruh.hour
ORDER BY ruh.date DESC, ruh.hour DESC;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Insert sample resource limits templates
INSERT INTO resource_limits_templates (name, description, isolation_level, resource_limits, is_default) VALUES
('Light Isolation', 'Basic resource limits for trusted modules', 'light', 
 '{"cpu": {"maxUsage": 50, "burstLimit": 80, "throttleThreshold": 40}, "memory": {"maxUsage": 512, "softLimit": 256, "hardLimit": 1024}, "api": {"requestsPerSecond": 100, "requestsPerMinute": 5000, "requestsPerHour": 100000, "burstLimit": 200}, "database": {"maxConnections": 10, "maxQueryTime": 30, "maxResultSize": 100}, "storage": {"maxDiskUsage": 1024, "maxFileSize": 50, "maxFiles": 1000}}',
 true),
('Medium Isolation', 'Standard resource limits for most modules', 'medium',
 '{"cpu": {"maxUsage": 30, "burstLimit": 60, "throttleThreshold": 25}, "memory": {"maxUsage": 256, "softLimit": 128, "hardLimit": 512}, "api": {"requestsPerSecond": 50, "requestsPerMinute": 2500, "requestsPerHour": 50000, "burstLimit": 100}, "database": {"maxConnections": 5, "maxQueryTime": 15, "maxResultSize": 50}, "storage": {"maxDiskUsage": 512, "maxFileSize": 25, "maxFiles": 500}}',
 false),
('Strict Isolation', 'Restrictive resource limits for untrusted modules', 'strict',
 '{"cpu": {"maxUsage": 15, "burstLimit": 30, "throttleThreshold": 12}, "memory": {"maxUsage": 128, "softLimit": 64, "hardLimit": 256}, "api": {"requestsPerSecond": 20, "requestsPerMinute": 1000, "requestsPerHour": 20000, "burstLimit": 40}, "database": {"maxConnections": 2, "maxQueryTime": 10, "maxResultSize": 25}, "storage": {"maxDiskUsage": 256, "maxFileSize": 10, "maxFiles": 250}}',
 false);

-- Insert sample throttle rules
INSERT INTO throttle_rules (id, module_id, type, condition, threshold, action, duration, cooldown, enabled) VALUES
('rule_global_cpu_1', 'global', 'cpu', 'exceeds', 80, 'throttle', 300, 60, true),
('rule_global_memory_1', 'global', 'memory', 'exceeds', 90, 'suspend', 60, 300, true),
('rule_global_api_1', 'global', 'api', 'exceeds', 100, 'throttle', 60, 30, true); 