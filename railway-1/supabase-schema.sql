-- AI-BOS Platform Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Manifests Table
CREATE TABLE IF NOT EXISTS manifests (
  manifest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manifest_name TEXT NOT NULL,
  description TEXT,
  manifest_json JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Apps Table
CREATE TABLE IF NOT EXISTS apps (
  app_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manifest_id UUID NOT NULL REFERENCES manifests(manifest_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'installed' CHECK (status IN ('installed', 'running', 'stopped', 'error')),
  settings JSONB DEFAULT '{}'::jsonb,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Entities Table
CREATE TABLE IF NOT EXISTS entities (
  entity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  manifest_id UUID REFERENCES manifests(manifest_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  schema_json JSONB NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(app_id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Event Subscriptions Table
CREATE TABLE IF NOT EXISTS event_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(app_id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  handler_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_apps_tenant_id ON apps(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apps_manifest_id ON apps(manifest_id);
CREATE INDEX IF NOT EXISTS idx_entities_tenant_id ON entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_entities_manifest_id ON entities(manifest_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_app_id ON events(app_id);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_tenant_id ON event_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_app_id ON event_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_event_name ON event_subscriptions(event_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tenants
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Admins can manage tenants" ON tenants
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = current_setting('app.user_id')::uuid 
    AND users.role = 'admin'
  ));

-- RLS Policies for Users
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (user_id = current_setting('app.user_id')::uuid);

-- RLS Policies for Manifests
CREATE POLICY "Users can view manifests" ON manifests
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage manifests" ON manifests
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.user_id = current_setting('app.user_id')::uuid 
    AND users.role = 'admin'
  ));

-- RLS Policies for Apps
CREATE POLICY "Users can view apps in their tenant" ON apps
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can manage apps in their tenant" ON apps
  FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for Entities
CREATE POLICY "Users can view entities in their tenant" ON entities
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can manage entities in their tenant" ON entities
  FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for Events
CREATE POLICY "Users can view events in their tenant" ON events
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can create events in their tenant" ON events
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for Event Subscriptions
CREATE POLICY "Users can view subscriptions in their tenant" ON event_subscriptions
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "Users can manage subscriptions in their tenant" ON event_subscriptions
  FOR ALL USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE apps;
ALTER PUBLICATION supabase_realtime ADD TABLE entities;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manifests_updated_at BEFORE UPDATE ON manifests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_subscriptions_updated_at BEFORE UPDATE ON event_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO tenants (tenant_id, name, status) VALUES 
  ('46eecbfa-0b23-4f99-9fc3-85e31a50291b', 'Jack Wee', 'active')
ON CONFLICT (tenant_id) DO NOTHING;

INSERT INTO users (user_id, tenant_id, email, name, role, permissions) VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '46eecbfa-0b23-4f99-9fc3-85e31a50291b', 'jackwee@delettucebear.com', 'AIBOS Admin', 'admin', '["read", "write", "admin"]')
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', tenant_uuid::text, false);
  PERFORM set_config('app.user_id', user_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 