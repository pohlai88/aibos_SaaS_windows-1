-- ========================================
-- THIRD-PARTY SECURITY SCHEMA
-- ========================================

-- Security Scans Table
CREATE TABLE IF NOT EXISTS security_scans (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    scan_type TEXT NOT NULL CHECK (scan_type IN ('static', 'dynamic', 'behavioral', 'dependency')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'scanning', 'passed', 'failed', 'blocked')),
    results JSONB DEFAULT '[]',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_duration INTEGER DEFAULT 0,
    scanner_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Results Table
CREATE TABLE IF NOT EXISTS security_results (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('vulnerability', 'malware', 'suspicious_code', 'dependency_issue', 'permission_violation')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    code_snippet TEXT,
    cve_id TEXT,
    remediation TEXT,
    confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Containers Table
CREATE TABLE IF NOT EXISTS module_containers (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    container_type TEXT NOT NULL CHECK (container_type IN ('docker', 'firecracker', 'gvisor', 'custom')),
    image TEXT NOT NULL,
    resources JSONB NOT NULL,
    security JSONB NOT NULL,
    networking JSONB NOT NULL,
    filesystem JSONB NOT NULL,
    environment JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'running', 'stopped', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version)
);

-- Code Validation Table
CREATE TABLE IF NOT EXISTS code_validations (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    validation_type TEXT NOT NULL CHECK (validation_type IN ('syntax', 'semantic', 'security', 'performance', 'compliance')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'validating', 'passed', 'failed')),
    results JSONB DEFAULT '[]',
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validator_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation Results Table
CREATE TABLE IF NOT EXISTS validation_results (
    id TEXT PRIMARY KEY,
    validation_id TEXT NOT NULL REFERENCES code_validations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('error', 'warning', 'info')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    location TEXT NOT NULL,
    rule TEXT NOT NULL,
    suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle Analysis Table
CREATE TABLE IF NOT EXISTS bundle_analyses (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    bundle_size BIGINT DEFAULT 0,
    file_count INTEGER DEFAULT 0,
    dependencies JSONB DEFAULT '[]',
    suspicious_patterns JSONB DEFAULT '[]',
    obfuscated_code BOOLEAN DEFAULT false,
    minified_code BOOLEAN DEFAULT false,
    source_maps BOOLEAN DEFAULT false,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version)
);

-- Dependency Information Table
CREATE TABLE IF NOT EXISTS dependency_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_analysis_id TEXT NOT NULL REFERENCES bundle_analyses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    license TEXT,
    vulnerabilities INTEGER DEFAULT 0,
    size BIGINT DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('production', 'development', 'peer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suspicious Patterns Table
CREATE TABLE IF NOT EXISTS suspicious_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_analysis_id TEXT NOT NULL REFERENCES bundle_analyses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('eval', 'exec', 'require', 'import', 'network', 'file_system', 'process')),
    pattern TEXT NOT NULL,
    location TEXT NOT NULL,
    risk TEXT NOT NULL CHECK (risk IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Policies Table
CREATE TABLE IF NOT EXISTS security_policies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rules JSONB DEFAULT '[]',
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Rules Table
CREATE TABLE IF NOT EXISTS security_rules (
    id TEXT PRIMARY KEY,
    policy_id TEXT NOT NULL REFERENCES security_policies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pattern', 'function', 'api', 'dependency', 'permission')),
    pattern TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('allow', 'deny', 'warn', 'quarantine')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    examples JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quarantine Entries Table
CREATE TABLE IF NOT EXISTS quarantine_entries (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    reason TEXT NOT NULL,
    security_issues JSONB DEFAULT '[]',
    quarantine_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'quarantined' CHECK (status IN ('quarantined', 'reviewed', 'approved', 'rejected')),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version)
);

-- Container Runtime Logs Table
CREATE TABLE IF NOT EXISTS container_runtime_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id TEXT NOT NULL REFERENCES module_containers(id) ON DELETE CASCADE,
    log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('scan_started', 'scan_completed', 'vulnerability_found', 'container_started', 'container_stopped', 'quarantine_triggered', 'policy_violation')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developer Security Profiles Table
CREATE TABLE IF NOT EXISTS developer_security_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id TEXT NOT NULL,
    trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    modules_submitted INTEGER DEFAULT 0,
    modules_approved INTEGER DEFAULT 0,
    modules_quarantined INTEGER DEFAULT 0,
    security_violations INTEGER DEFAULT 0,
    last_violation_date TIMESTAMP WITH TIME ZONE,
    security_badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(developer_id)
);

-- Security Compliance Reports Table
CREATE TABLE IF NOT EXISTS security_compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL,
    version TEXT NOT NULL,
    compliance_standard TEXT NOT NULL CHECK (compliance_standard IN ('OWASP', 'NIST', 'ISO27001', 'SOC2', 'GDPR')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'passed', 'failed')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    findings JSONB DEFAULT '[]',
    report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    auditor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, version, compliance_standard)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Security Scans Indexes
CREATE INDEX IF NOT EXISTS idx_security_scans_module_id ON security_scans(module_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_version ON security_scans(version);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status);
CREATE INDEX IF NOT EXISTS idx_security_scans_scan_type ON security_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_security_scans_risk_score ON security_scans(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_scans_scan_date ON security_scans(scan_date);

-- Security Results Indexes
CREATE INDEX IF NOT EXISTS idx_security_results_scan_id ON security_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_security_results_type ON security_results(type);
CREATE INDEX IF NOT EXISTS idx_security_results_severity ON security_results(severity);
CREATE INDEX IF NOT EXISTS idx_security_results_cve_id ON security_results(cve_id);

-- Module Containers Indexes
CREATE INDEX IF NOT EXISTS idx_module_containers_module_id ON module_containers(module_id);
CREATE INDEX IF NOT EXISTS idx_module_containers_version ON module_containers(version);
CREATE INDEX IF NOT EXISTS idx_module_containers_container_type ON module_containers(container_type);
CREATE INDEX IF NOT EXISTS idx_module_containers_status ON module_containers(status);

-- Code Validations Indexes
CREATE INDEX IF NOT EXISTS idx_code_validations_module_id ON code_validations(module_id);
CREATE INDEX IF NOT EXISTS idx_code_validations_version ON code_validations(version);
CREATE INDEX IF NOT EXISTS idx_code_validations_validation_type ON code_validations(validation_type);
CREATE INDEX IF NOT EXISTS idx_code_validations_status ON code_validations(status);

-- Bundle Analysis Indexes
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_module_id ON bundle_analyses(module_id);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_version ON bundle_analyses(version);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_obfuscated_code ON bundle_analyses(obfuscated_code);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_minified_code ON bundle_analyses(minified_code);

-- Dependency Info Indexes
CREATE INDEX IF NOT EXISTS idx_dependency_info_bundle_analysis_id ON dependency_info(bundle_analysis_id);
CREATE INDEX IF NOT EXISTS idx_dependency_info_name ON dependency_info(name);
CREATE INDEX IF NOT EXISTS idx_dependency_info_vulnerabilities ON dependency_info(vulnerabilities);

-- Suspicious Patterns Indexes
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_bundle_analysis_id ON suspicious_patterns(bundle_analysis_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_type ON suspicious_patterns(type);
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_risk ON suspicious_patterns(risk);

-- Security Policies Indexes
CREATE INDEX IF NOT EXISTS idx_security_policies_enabled ON security_policies(enabled);
CREATE INDEX IF NOT EXISTS idx_security_policies_severity ON security_policies(severity);

-- Security Rules Indexes
CREATE INDEX IF NOT EXISTS idx_security_rules_policy_id ON security_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_security_rules_type ON security_rules(type);
CREATE INDEX IF NOT EXISTS idx_security_rules_action ON security_rules(action);

-- Quarantine Entries Indexes
CREATE INDEX IF NOT EXISTS idx_quarantine_entries_module_id ON quarantine_entries(module_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_entries_version ON quarantine_entries(version);
CREATE INDEX IF NOT EXISTS idx_quarantine_entries_status ON quarantine_entries(status);
CREATE INDEX IF NOT EXISTS idx_quarantine_entries_quarantine_date ON quarantine_entries(quarantine_date);

-- Container Runtime Logs Indexes
CREATE INDEX IF NOT EXISTS idx_container_runtime_logs_container_id ON container_runtime_logs(container_id);
CREATE INDEX IF NOT EXISTS idx_container_runtime_logs_log_level ON container_runtime_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_container_runtime_logs_timestamp ON container_runtime_logs(timestamp);

-- Security Events Indexes
CREATE INDEX IF NOT EXISTS idx_security_events_module_id ON security_events(module_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);

-- Developer Security Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_developer_security_profiles_developer_id ON developer_security_profiles(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_security_profiles_trust_score ON developer_security_profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_developer_security_profiles_security_badge ON developer_security_profiles(security_badge);

-- Security Compliance Reports Indexes
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_module_id ON security_compliance_reports(module_id);
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_compliance_standard ON security_compliance_reports(compliance_standard);
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_status ON security_compliance_reports(status);
CREATE INDEX IF NOT EXISTS idx_security_compliance_reports_score ON security_compliance_reports(score);

-- ========================================
-- FUNCTIONS AND PROCEDURES
-- ========================================

-- Function to get security scan summary
CREATE OR REPLACE FUNCTION get_security_scan_summary(module_uuid TEXT, version_uuid TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    latest_scan RECORD;
    total_scans INTEGER;
    passed_scans INTEGER;
    failed_scans INTEGER;
BEGIN
    -- Get latest scan
    SELECT * INTO latest_scan
    FROM security_scans
    WHERE module_id = module_uuid AND version = version_uuid
    ORDER BY scan_date DESC
    LIMIT 1;
    
    -- Get scan statistics
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status IN ('failed', 'blocked')) as failed
    INTO total_scans, passed_scans, failed_scans
    FROM security_scans
    WHERE module_id = module_uuid AND version = version_uuid;
    
    -- Build result
    result := jsonb_build_object(
        'latest_scan', CASE 
            WHEN latest_scan IS NULL THEN NULL
            ELSE jsonb_build_object(
                'status', latest_scan.status,
                'risk_score', latest_scan.risk_score,
                'scan_date', latest_scan.scan_date,
                'results_count', jsonb_array_length(latest_scan.results)
            )
        END,
        'statistics', jsonb_build_object(
            'total_scans', total_scans,
            'passed_scans', passed_scans,
            'failed_scans', failed_scans,
            'success_rate', CASE WHEN total_scans > 0 THEN (passed_scans::float / total_scans * 100)::numeric(5,2) ELSE 0 END
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if module is secure
CREATE OR REPLACE FUNCTION is_module_secure(module_uuid TEXT, version_uuid TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    latest_scan RECORD;
    quarantine_entry RECORD;
BEGIN
    -- Check if module is quarantined
    SELECT * INTO quarantine_entry
    FROM quarantine_entries
    WHERE module_id = module_uuid AND version = version_uuid AND status = 'quarantined';
    
    IF quarantine_entry IS NOT NULL THEN
        RETURN false;
    END IF;
    
    -- Check latest security scan
    SELECT * INTO latest_scan
    FROM security_scans
    WHERE module_id = module_uuid AND version = version_uuid
    ORDER BY scan_date DESC
    LIMIT 1;
    
    IF latest_scan IS NULL THEN
        RETURN false; -- No scan performed
    END IF;
    
    -- Module is secure if scan passed and risk score is low
    RETURN latest_scan.status = 'passed' AND latest_scan.risk_score <= 30;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate developer trust score
CREATE OR REPLACE FUNCTION calculate_developer_trust_score(developer_uuid TEXT)
RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 50;
    approved_bonus INTEGER;
    quarantined_penalty INTEGER;
    violation_penalty INTEGER;
    final_score INTEGER;
BEGIN
    -- Calculate bonuses and penalties
    SELECT 
        COALESCE(modules_approved * 2, 0),
        COALESCE(modules_quarantined * -10, 0),
        COALESCE(security_violations * -15, 0)
    INTO approved_bonus, quarantined_penalty, violation_penalty
    FROM developer_security_profiles
    WHERE developer_id = developer_uuid;
    
    -- Calculate final score
    final_score := base_score + approved_bonus + quarantined_penalty + violation_penalty;
    
    -- Ensure score is within bounds
    RETURN GREATEST(0, LEAST(100, final_score));
END;
$$ LANGUAGE plpgsql;

-- Function to get security statistics
CREATE OR REPLACE FUNCTION get_security_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_scans INTEGER;
    passed_scans INTEGER;
    failed_scans INTEGER;
    quarantined_modules INTEGER;
    avg_risk_score NUMERIC;
    top_vulnerabilities TEXT[];
BEGIN
    -- Get scan statistics
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status IN ('failed', 'blocked')) as failed,
        AVG(risk_score) as avg_risk
    INTO total_scans, passed_scans, failed_scans, avg_risk_score
    FROM security_scans;
    
    -- Get quarantined modules count
    SELECT COUNT(*) INTO quarantined_modules
    FROM quarantine_entries
    WHERE status = 'quarantined';
    
    -- Get top vulnerabilities (simplified)
    SELECT ARRAY_AGG(DISTINCT title) INTO top_vulnerabilities
    FROM (
        SELECT title
        FROM security_results
        WHERE type = 'vulnerability'
        GROUP BY title
        ORDER BY COUNT(*) DESC
        LIMIT 5
    ) as top_vulns;
    
    -- Build result
    result := jsonb_build_object(
        'total_scans', total_scans,
        'passed_scans', passed_scans,
        'failed_scans', failed_scans,
        'quarantined_modules', quarantined_modules,
        'average_risk_score', COALESCE(avg_risk_score, 0),
        'top_vulnerabilities', COALESCE(top_vulnerabilities, '{}'::TEXT[])
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to quarantine module automatically
CREATE OR REPLACE FUNCTION auto_quarantine_module(
    module_uuid TEXT,
    version_uuid TEXT,
    reason_uuid TEXT
)
RETURNS TEXT AS $$
DECLARE
    quarantine_id TEXT;
    security_issues JSONB;
BEGIN
    -- Get security issues from latest scan
    SELECT results INTO security_issues
    FROM security_scans
    WHERE module_id = module_uuid AND version = version_uuid
    ORDER BY scan_date DESC
    LIMIT 1;
    
    -- Generate quarantine ID
    quarantine_id := 'quarantine_' || module_uuid || '_' || version_uuid;
    
    -- Insert quarantine entry
    INSERT INTO quarantine_entries (
        id,
        module_id,
        version,
        reason,
        security_issues,
        status
    ) VALUES (
        quarantine_id,
        module_uuid,
        version_uuid,
        reason_uuid,
        COALESCE(security_issues, '[]'::jsonb),
        'quarantined'
    );
    
    -- Create security event
    INSERT INTO security_events (
        module_id,
        version,
        event_type,
        severity,
        description
    ) VALUES (
        module_uuid,
        version_uuid,
        'quarantine_triggered',
        'high',
        'Module automatically quarantined due to security issues'
    );
    
    RETURN quarantine_id;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old security data
CREATE OR REPLACE FUNCTION cleanup_old_security_data(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old security scans
    DELETE FROM security_scans
    WHERE scan_date < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old container logs
    DELETE FROM container_runtime_logs
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    -- Delete old security events
    DELETE FROM security_events
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update security scans updated_at
CREATE OR REPLACE FUNCTION update_security_scans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_security_scans_updated_at
    BEFORE UPDATE ON security_scans
    FOR EACH ROW
    EXECUTE FUNCTION update_security_scans_updated_at();

-- Trigger to update module containers updated_at
CREATE OR REPLACE FUNCTION update_module_containers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_module_containers_updated_at
    BEFORE UPDATE ON module_containers
    FOR EACH ROW
    EXECUTE FUNCTION update_module_containers_updated_at();

-- Trigger to update code validations updated_at
CREATE OR REPLACE FUNCTION update_code_validations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_code_validations_updated_at
    BEFORE UPDATE ON code_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_code_validations_updated_at();

-- Trigger to update security policies updated_at
CREATE OR REPLACE FUNCTION update_security_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_security_policies_updated_at
    BEFORE UPDATE ON security_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_security_policies_updated_at();

-- Trigger to update security rules updated_at
CREATE OR REPLACE FUNCTION update_security_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_security_rules_updated_at
    BEFORE UPDATE ON security_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_security_rules_updated_at();

-- Trigger to update quarantine entries updated_at
CREATE OR REPLACE FUNCTION update_quarantine_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quarantine_entries_updated_at
    BEFORE UPDATE ON quarantine_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_quarantine_entries_updated_at();

-- Trigger to update developer security profiles updated_at
CREATE OR REPLACE FUNCTION update_developer_security_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_developer_security_profiles_updated_at
    BEFORE UPDATE ON developer_security_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_developer_security_profiles_updated_at();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View for security overview
CREATE OR REPLACE VIEW security_overview AS
SELECT 
    ms.module_id,
    ms.version,
    ms.status as scan_status,
    ms.risk_score,
    ms.scan_date as last_scan,
    qe.status as quarantine_status,
    mc.status as container_status,
    ba.obfuscated_code,
    ba.minified_code,
    ba.bundle_size
FROM security_scans ms
LEFT JOIN LATERAL (
    SELECT * FROM security_scans 
    WHERE module_id = ms.module_id AND version = ms.version
    ORDER BY scan_date DESC 
    LIMIT 1
) latest_scan ON true
LEFT JOIN quarantine_entries qe ON ms.module_id = qe.module_id AND ms.version = qe.version
LEFT JOIN module_containers mc ON ms.module_id = mc.module_id AND ms.version = mc.version
LEFT JOIN bundle_analyses ba ON ms.module_id = ba.module_id AND ms.version = ba.version
ORDER BY ms.scan_date DESC;

-- View for security violations summary
CREATE OR REPLACE VIEW security_violations_summary AS
SELECT 
    module_id,
    type,
    severity,
    COUNT(*) as violation_count,
    COUNT(*) FILTER (WHERE confidence > 80) as high_confidence_violations,
    MAX(created_at) as last_violation
FROM security_results
GROUP BY module_id, type, severity
ORDER BY violation_count DESC;

-- View for developer security profiles
CREATE OR REPLACE VIEW developer_security_profiles_summary AS
SELECT 
    dsp.developer_id,
    dsp.trust_score,
    dsp.modules_submitted,
    dsp.modules_approved,
    dsp.modules_quarantined,
    dsp.security_violations,
    CASE 
        WHEN dsp.trust_score >= 80 THEN 'Trusted'
        WHEN dsp.trust_score >= 60 THEN 'Verified'
        WHEN dsp.trust_score >= 40 THEN 'New'
        ELSE 'Restricted'
    END as trust_level,
    CASE 
        WHEN dsp.modules_submitted > 0 THEN 
            (dsp.modules_approved::float / dsp.modules_submitted * 100)::numeric(5,2)
        ELSE 0
    END as approval_rate
FROM developer_security_profiles dsp
ORDER BY dsp.trust_score DESC;

-- View for container security status
CREATE OR REPLACE VIEW container_security_status AS
SELECT 
    mc.module_id,
    mc.version,
    mc.container_type,
    mc.status as container_status,
    mc.security->>'readOnly' as read_only,
    mc.security->>'noPrivileged' as no_privileged,
    mc.networking->>'isolated' as network_isolated,
    crl.log_level,
    crl.message,
    crl.timestamp as log_timestamp
FROM module_containers mc
LEFT JOIN container_runtime_logs crl ON mc.id = crl.container_id
ORDER BY crl.timestamp DESC;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================

-- Insert sample security policies
INSERT INTO security_policies (id, name, description, rules, severity, enabled) VALUES
('policy_1', 'No Eval Usage', 'Prevent use of eval() and Function()', 
 '[{"id": "rule_1", "type": "pattern", "pattern": "eval\\\\s*\\\\(", "action": "deny", "severity": "critical", "description": "Block eval() usage", "examples": ["eval(code)", "eval(\\"alert(1)\\")"]}]',
 'critical', true),
('policy_2', 'No File System Access', 'Prevent unauthorized file system access',
 '[{"id": "rule_2", "type": "pattern", "pattern": "fs\\\\.", "action": "deny", "severity": "high", "description": "Block file system access", "examples": ["fs.readFile()", "fs.writeFile()"]}]',
 'high', true),
('policy_3', 'No Network Access', 'Prevent unauthorized network access',
 '[{"id": "rule_3", "type": "pattern", "pattern": "http\\\\.|https\\\\.|fetch\\\\s*\\\\(", "action": "warn", "severity": "medium", "description": "Warn about network access", "examples": ["fetch(url)", "http.get()"]}]',
 'medium', true);

-- Insert sample security rules
INSERT INTO security_rules (id, policy_id, type, pattern, action, severity, description, examples) VALUES
('rule_1', 'policy_1', 'pattern', 'eval\\s*\\(', 'deny', 'critical', 'Block eval() usage', '["eval(code)", "eval(\"alert(1)\")"]'),
('rule_2', 'policy_2', 'pattern', 'fs\\.', 'deny', 'high', 'Block file system access', '["fs.readFile()", "fs.writeFile()"]'),
('rule_3', 'policy_3', 'pattern', 'http\\.|https\\.|fetch\\s*\\(', 'warn', 'medium', 'Warn about network access', '["fetch(url)", "http.get()"]'); 