-- ========================================
-- CONCURRENT USERS TRACKING SCHEMA
-- ========================================

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    organization_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    module_id TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Concurrent Users History Table
CREATE TABLE IF NOT EXISTS concurrent_users_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concurrent_users INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Usage Tracking
CREATE TABLE IF NOT EXISTS module_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    organization_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
    action_details JSONB,
    response_time INTEGER, -- in milliseconds
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL, -- 'response_time', 'error_rate', 'cpu_usage', 'memory_usage'
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT, -- 'ms', 'percentage', 'count'
    module_id TEXT,
    organization_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Utilization Table
CREATE TABLE IF NOT EXISTS resource_utilization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpu_usage NUMERIC NOT NULL,
    memory_usage NUMERIC NOT NULL,
    database_connections INTEGER NOT NULL,
    active_sessions INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts and Thresholds Table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL, -- 'high_concurrency', 'high_error_rate', 'high_response_time'
    threshold_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_org_id ON user_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_module_id ON user_sessions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Concurrent Users History Indexes
CREATE INDEX IF NOT EXISTS idx_concurrent_users_history_timestamp ON concurrent_users_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_concurrent_users_history_count ON concurrent_users_history(concurrent_users);

-- Module Usage Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_module_usage_module_id ON module_usage_tracking(module_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_org_id ON module_usage_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_module_usage_timestamp ON module_usage_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_module_usage_action_type ON module_usage_tracking(action_type);

-- Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_module ON performance_metrics(module_id);

-- Resource Utilization Indexes
CREATE INDEX IF NOT EXISTS idx_resource_utilization_timestamp ON resource_utilization(timestamp);

-- Performance Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp);

-- ========================================
-- FUNCTIONS AND PROCEDURES
-- ========================================

-- Function to get average concurrent users
CREATE OR REPLACE FUNCTION get_average_concurrent_users(
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(concurrent_users), 0)
        FROM concurrent_users_history
        WHERE timestamp BETWEEN start_time AND end_time
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get peak concurrent users
CREATE OR REPLACE FUNCTION get_peak_concurrent_users(
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(MAX(concurrent_users), 0)
        FROM concurrent_users_history
        WHERE timestamp BETWEEN start_time AND end_time
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get current concurrent users
CREATE OR REPLACE FUNCTION get_current_concurrent_users()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions
        WHERE is_active = true 
        AND last_activity > NOW() - INTERVAL '1 minute'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get concurrent users by module
CREATE OR REPLACE FUNCTION get_concurrent_users_by_module(module_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT us.user_id)
        FROM user_sessions us
        WHERE us.module_id = module_name
        AND us.is_active = true 
        AND us.last_activity > NOW() - INTERVAL '1 minute'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get concurrent users by organization
CREATE OR REPLACE FUNCTION get_concurrent_users_by_organization(org_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT user_id)
        FROM user_sessions
        WHERE organization_id = org_id
        AND is_active = true 
        AND last_activity > NOW() - INTERVAL '1 minute'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE last_activity < NOW() - INTERVAL '5 minutes';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to record performance alert
CREATE OR REPLACE FUNCTION record_performance_alert(
    alert_type TEXT,
    threshold_value NUMERIC,
    current_value NUMERIC,
    severity TEXT,
    message TEXT
)
RETURNS UUID AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO performance_alerts (
        alert_type,
        threshold_value,
        current_value,
        severity,
        message
    ) VALUES (
        alert_type,
        threshold_value,
        current_value,
        severity,
        message
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update user_sessions updated_at
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sessions_updated_at();

-- Trigger to record performance metrics on module usage
CREATE OR REPLACE FUNCTION record_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Record response time metric
    IF NEW.response_time IS NOT NULL THEN
        INSERT INTO performance_metrics (
            metric_type,
            metric_value,
            metric_unit,
            module_id,
            organization_id
        ) VALUES (
            'response_time',
            NEW.response_time,
            'ms',
            NEW.module_id,
            NEW.organization_id
        );
    END IF;
    
    -- Record error rate if there's an error
    IF NEW.success = false THEN
        INSERT INTO performance_metrics (
            metric_type,
            metric_value,
            metric_unit,
            module_id,
            organization_id
        ) VALUES (
            'error_rate',
            1,
            'count',
            NEW.module_id,
            NEW.organization_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_performance_metrics
    AFTER INSERT ON module_usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION record_performance_metrics();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View for current active sessions
CREATE OR REPLACE VIEW current_active_sessions AS
SELECT 
    us.user_id,
    us.organization_id,
    us.module_id,
    us.last_activity,
    us.user_agent,
    us.ip_address
FROM user_sessions us
WHERE us.is_active = true 
AND us.last_activity > NOW() - INTERVAL '1 minute';

-- View for module usage summary
CREATE OR REPLACE VIEW module_usage_summary AS
SELECT 
    module_id,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) as total_actions,
    AVG(response_time) as avg_response_time,
    COUNT(*) FILTER (WHERE success = false) as error_count,
    COUNT(*) FILTER (WHERE success = false)::NUMERIC / COUNT(*)::NUMERIC as error_rate
FROM module_usage_tracking
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY module_id;

-- View for organization usage summary
CREATE OR REPLACE VIEW organization_usage_summary AS
SELECT 
    organization_id,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT module_id) as active_modules,
    COUNT(*) as total_actions,
    AVG(response_time) as avg_response_time
FROM module_usage_tracking
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY organization_id;

-- View for performance alerts summary
CREATE OR REPLACE VIEW performance_alerts_summary AS
SELECT 
    alert_type,
    severity,
    COUNT(*) as alert_count,
    MAX(timestamp) as latest_alert
FROM performance_alerts
WHERE is_resolved = false
GROUP BY alert_type, severity;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Insert sample concurrent users history
INSERT INTO concurrent_users_history (concurrent_users, timestamp) VALUES
(150, NOW() - INTERVAL '2 hours'),
(200, NOW() - INTERVAL '1 hour'),
(180, NOW() - INTERVAL '30 minutes'),
(220, NOW() - INTERVAL '15 minutes'),
(250, NOW() - INTERVAL '5 minutes'),
(280, NOW() - INTERVAL '1 minute');

-- Insert sample resource utilization
INSERT INTO resource_utilization (cpu_usage, memory_usage, database_connections, active_sessions) VALUES
(65, 78, 45, 280),
(70, 82, 50, 300),
(68, 80, 48, 290); 