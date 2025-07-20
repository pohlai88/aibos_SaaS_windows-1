-- AI-BOS Module Registry Database Schema
-- This schema supports the complete module ecosystem

-- Developers table
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    website VARCHAR(255),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    author UUID REFERENCES developers(id),
    category VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    dependencies TEXT[] DEFAULT '{}',
    requirements JSONB,
    permissions JSONB,
    entry_points JSONB,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    license VARCHAR(100),
    documentation_url VARCHAR(255),
    repository_url VARCHAR(255),
    website_url VARCHAR(255),
    files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module reviews table
CREATE TABLE module_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(100) REFERENCES modules(id),
    developer_id UUID REFERENCES developers(id),
    reviewer_id UUID,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    files JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module installations table
CREATE TABLE module_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(100) REFERENCES modules(id),
    organization_id UUID NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'installed',
    location VARCHAR(255),
    configuration JSONB DEFAULT '{}',
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uninstalled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module revenue table
CREATE TABLE module_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(100) REFERENCES modules(id),
    developer_id UUID REFERENCES developers(id),
    organization_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'subscription', 'refund'
    status VARCHAR(50) DEFAULT 'completed',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module ratings table
CREATE TABLE module_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(100) REFERENCES modules(id),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, organization_id, user_id)
);

-- Module analytics table
CREATE TABLE module_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(100) REFERENCES modules(id),
    organization_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'view', 'install', 'uninstall', 'error'
    event_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module categories table
CREATE TABLE module_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO module_categories (id, name, description, icon, color, sort_order) VALUES
('accounting', 'Accounting', 'Financial management and accounting modules', 'calculator', '#10B981', 1),
('crm', 'CRM', 'Customer relationship management modules', 'users', '#3B82F6', 2),
('hr', 'HR', 'Human resources and employee management modules', 'user-check', '#8B5CF6', 3),
('workflow', 'Workflow', 'Business process automation and workflow modules', 'git-branch', '#F59E0B', 4),
('procurement', 'Procurement', 'Procurement and supplier management modules', 'shopping-cart', '#EF4444', 5),
('tax', 'Tax', 'Tax calculation and compliance modules', 'file-text', '#06B6D4', 6),
('reporting', 'Reporting', 'Analytics and reporting modules', 'bar-chart', '#84CC16', 7),
('integration', 'Integration', 'Third-party integrations and APIs', 'link', '#6366F1', 8),
('utility', 'Utility', 'Utility and helper modules', 'tool', '#6B7280', 9),
('custom', 'Custom', 'Custom and specialized modules', 'code', '#EC4899', 10);

-- Indexes for performance
CREATE INDEX idx_modules_author ON modules(author);
CREATE INDEX idx_modules_category ON modules(category);
CREATE INDEX idx_modules_status ON modules(status);
CREATE INDEX idx_modules_created_at ON modules(created_at);
CREATE INDEX idx_modules_downloads ON modules(downloads DESC);
CREATE INDEX idx_modules_rating ON modules(rating DESC);

CREATE INDEX idx_module_reviews_module_id ON module_reviews(module_id);
CREATE INDEX idx_module_reviews_developer_id ON module_reviews(developer_id);
CREATE INDEX idx_module_reviews_status ON module_reviews(status);

CREATE INDEX idx_module_installations_module_id ON module_installations(module_id);
CREATE INDEX idx_module_installations_organization_id ON module_installations(organization_id);
CREATE INDEX idx_module_installations_status ON module_installations(status);

CREATE INDEX idx_module_revenue_developer_id ON module_revenue(developer_id);
CREATE INDEX idx_module_revenue_module_id ON module_revenue(module_id);
CREATE INDEX idx_module_revenue_transaction_date ON module_revenue(transaction_date);

CREATE INDEX idx_module_ratings_module_id ON module_ratings(module_id);
CREATE INDEX idx_module_ratings_rating ON module_ratings(rating);

CREATE INDEX idx_module_analytics_module_id ON module_analytics(module_id);
CREATE INDEX idx_module_analytics_event_type ON module_analytics(event_type);
CREATE INDEX idx_module_analytics_created_at ON module_analytics(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_analytics ENABLE ROW LEVEL SECURITY;

-- Developers can only see their own data
CREATE POLICY "Developers can view own data" ON developers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Developers can update own data" ON developers
    FOR UPDATE USING (auth.uid() = id);

-- Module visibility policies
CREATE POLICY "Public modules are viewable by all" ON modules
    FOR SELECT USING (status = 'published');

CREATE POLICY "Developers can view own modules" ON modules
    FOR SELECT USING (author = auth.uid());

CREATE POLICY "Developers can insert own modules" ON modules
    FOR INSERT WITH CHECK (author = auth.uid());

CREATE POLICY "Developers can update own modules" ON modules
    FOR UPDATE USING (author = auth.uid());

-- Review policies
CREATE POLICY "Developers can view own reviews" ON module_reviews
    FOR SELECT USING (developer_id = auth.uid());

CREATE POLICY "Developers can insert own reviews" ON module_reviews
    FOR INSERT WITH CHECK (developer_id = auth.uid());

-- Installation policies
CREATE POLICY "Organizations can view own installations" ON module_installations
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Organizations can insert own installations" ON module_installations
    FOR INSERT WITH CHECK (organization_id = auth.jwt() ->> 'organization_id');

-- Revenue policies
CREATE POLICY "Developers can view own revenue" ON module_revenue
    FOR SELECT USING (developer_id = auth.uid());

-- Rating policies
CREATE POLICY "Users can view all ratings" ON module_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON module_ratings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ratings" ON module_ratings
    FOR UPDATE USING (user_id = auth.uid());

-- Analytics policies
CREATE POLICY "Organizations can view own analytics" ON module_analytics
    FOR SELECT USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Organizations can insert own analytics" ON module_analytics
    FOR INSERT WITH CHECK (organization_id = auth.jwt() ->> 'organization_id');

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_module_downloads()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE modules 
    SET downloads = downloads + 1 
    WHERE id = NEW.module_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_module_downloads
    AFTER INSERT ON module_installations
    FOR EACH ROW
    EXECUTE FUNCTION update_module_downloads();

-- Function to calculate module rating
CREATE OR REPLACE FUNCTION calculate_module_rating(module_id_param VARCHAR(100))
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT AVG(rating) INTO avg_rating
    FROM module_ratings
    WHERE module_id = module_id_param;
    
    UPDATE modules 
    SET rating = COALESCE(avg_rating, 0)
    WHERE id = module_id_param;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update module rating when ratings change
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_module_rating(NEW.module_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_module_rating
    AFTER INSERT OR UPDATE OR DELETE ON module_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_module_rating();

-- Function to get developer revenue summary
CREATE OR REPLACE FUNCTION get_developer_revenue_summary(developer_id_param UUID)
RETURNS TABLE(
    total_revenue DECIMAL(12,2),
    total_modules INTEGER,
    monthly_revenue DECIMAL(12,2),
    top_module VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(mr.amount), 0) as total_revenue,
        COUNT(DISTINCT m.id) as total_modules,
        COALESCE(SUM(CASE 
            WHEN mr.transaction_date >= NOW() - INTERVAL '30 days' 
            THEN mr.amount 
            ELSE 0 
        END), 0) as monthly_revenue,
        (SELECT m2.id 
         FROM modules m2 
         JOIN module_revenue mr2 ON m2.id = mr2.module_id 
         WHERE mr2.developer_id = developer_id_param 
         GROUP BY m2.id 
         ORDER BY SUM(mr2.amount) DESC 
         LIMIT 1) as top_module
    FROM modules m
    LEFT JOIN module_revenue mr ON m.id = mr.module_id AND mr.developer_id = developer_id_param
    WHERE m.author = developer_id_param;
END;
$$ LANGUAGE plpgsql; 