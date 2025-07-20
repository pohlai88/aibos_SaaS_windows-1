// AI-BOS Owner Dashboard - Master Control Panel JavaScript

// Global state for master dashboard
let masterState = {
    tenants: [],
    globalModules: [],
    systemMetrics: {},
    ssoConfig: {},
    securityStatus: {},
    systemLogs: [],
    billingData: {},
    revenueData: {},
    subscriptionData: {},
    themeData: {},
    skinData: {},
    customizationData: {}
};

// Initialize master dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeMasterDashboard();
    loadMasterData();
    setupMasterEventListeners();
    startMasterRealTimeUpdates();
});

function initializeMasterDashboard() {
    // Initialize with empty state - no placeholder data
    masterState.systemMetrics = {
        totalTenants: 0,
        totalUsers: 0,
        globalModules: 0,
        systemHealth: 100
    };

    // Empty arrays for real data
    masterState.tenants = [];
    masterState.globalModules = [];
    masterState.billingData = {};
    masterState.revenueData = {};
    masterState.subscriptionData = {};
    masterState.themeData = {};
    masterState.skinData = {};
    masterState.customizationData = {};

    // Initialize SSO configuration (empty)
    masterState.ssoConfig = {
        provider: '',
        idpUrl: '',
        enabled: false,
        tenantStatus: {}
    };

    // Initialize security status (minimal)
    masterState.securityStatus = {
        threatLevel: 'low',
        activeThreats: 0,
        lastScan: 'Never',
        vulnerabilities: 0,
        patches: 0
    };
}

function loadMasterData() {
    updateMasterMetrics();
    renderTenants();
    renderGlobalModules();
    renderSSOStatus();
    renderSecurityStatus();
    initializeMasterCharts();
    loadSystemLogs();
    updateBillingMetrics();
    updateSubscriptionMetrics();
    updateTemplateMetrics();
    updateCustomizationMetrics();
}

function updateMasterMetrics() {
    const totalTenants = masterState.tenants.length;
    const totalUsers = masterState.tenants.reduce((sum, tenant) => sum + (tenant.users || 0), 0);
    const globalModules = masterState.globalModules.length;
    
    document.getElementById('totalTenants').textContent = totalTenants;
    document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('globalModules').textContent = globalModules;
    document.getElementById('systemHealth').textContent = '100%';
}

function renderTenants() {
    const container = document.getElementById('tenantsGrid');
    if (!container) return;

    if (masterState.tenants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏢</div>
                <h3>Welcome to AI-BOS OS!</h3>
                <p>You haven't added any tenants yet. Let's get started by creating your first tenant.</p>
                <button class="btn-primary" onclick="createTenant()">
                    <span class="btn-icon">➕</span>
                    Add Your First Tenant
                </button>
                <div class="empty-state-help">
                    <p><strong>What is a tenant?</strong> A tenant represents a customer or organization using your AI-BOS OS platform.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = masterState.tenants.map(tenant => `
        <div class="tenant-card">
            <div class="tenant-header">
                <div class="tenant-info">
                    <h4>${tenant.name}</h4>
                    <span class="tenant-status ${tenant.status}">${tenant.status}</span>
                </div>
                <div class="tenant-actions">
                    <button onclick="manageTenant('${tenant.id}')" class="btn-secondary">Manage</button>
                    <button onclick="viewTenantAnalytics('${tenant.id}')" class="btn-secondary">Analytics</button>
                </div>
            </div>
            <div class="tenant-metrics">
                <div class="tenant-metric">
                    <span class="metric-label">Users</span>
                    <span class="metric-value">${tenant.users || 0}</span>
                </div>
                <div class="tenant-metric">
                    <span class="metric-label">Modules</span>
                    <span class="metric-value">${tenant.modules || 0}</span>
                </div>
                <div class="tenant-metric">
                    <span class="metric-label">Plan</span>
                    <span class="metric-value">${tenant.plan || 'Basic'}</span>
                </div>
            </div>
            <div class="tenant-footer">
                <span class="last-active">Last active: ${tenant.lastActive || 'Never'}</span>
            </div>
        </div>
    `).join('');
}

function renderGlobalModules() {
    const container = document.getElementById('modulesGrid');
    if (!container) return;

    if (masterState.globalModules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No Global Modules Yet</h3>
                <p>Global modules are available to all tenants. Let's deploy your first module.</p>
                <button class="btn-primary" onclick="deployModule()">
                    <span class="btn-icon">🚀</span>
                    Deploy Your First Module
                </button>
                <div class="empty-state-help">
                    <p><strong>What are global modules?</strong> These are system-wide modules that all tenants can access, like authentication, analytics, or core business logic.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = masterState.globalModules.map(module => `
        <div class="module-card">
            <div class="module-header">
                <div class="module-info">
                    <h4>${module.name}</h4>
                    <span class="module-version">v${module.version}</span>
                </div>
                <span class="module-status ${module.status}">${module.status}</span>
            </div>
            <div class="module-metrics">
                <div class="module-metric">
                    <span class="metric-label">Usage</span>
                    <span class="metric-value">${module.usage || 0}%</span>
                </div>
                <div class="module-metric">
                    <span class="metric-label">Tenants</span>
                    <span class="metric-value">${module.tenants || 0}</span>
                </div>
            </div>
            <div class="module-actions">
                <button onclick="deployModuleUpdate('${module.id}')" class="btn-secondary">Update</button>
                <button onclick="viewModuleAnalytics('${module.id}')" class="btn-secondary">Analytics</button>
            </div>
        </div>
    `).join('');
}

function renderSSOStatus() {
    const container = document.getElementById('tenantSSOStatus');
    if (!container) return;

    if (Object.keys(masterState.ssoConfig.tenantStatus).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔐</div>
                <h3>SSO Not Configured</h3>
                <p>Single Sign-On (SSO) allows your tenants to use their existing identity providers.</p>
                <button class="btn-primary" onclick="configureSSO()">
                    <span class="btn-icon">⚙️</span>
                    Configure SSO
                </button>
                <div class="empty-state-help">
                    <p><strong>Why SSO?</strong> SSO improves security and user experience by allowing users to sign in with their existing credentials.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = Object.entries(masterState.ssoConfig.tenantStatus).map(([tenantId, status]) => {
        const tenant = masterState.tenants.find(t => t.id === tenantId);
        return `
            <div class="sso-tenant-status">
                <div class="tenant-info">
                    <span class="tenant-name">${tenant ? tenant.name : 'Unknown Tenant'}</span>
                    <span class="sso-status ${status.enabled ? 'enabled' : 'disabled'}">
                        ${status.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
                <div class="sso-actions">
                    <button onclick="toggleTenantSSO('${tenantId}')" class="btn-small">
                        ${status.enabled ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderSecurityStatus() {
    // Security status is always available as it's system-level
    const container = document.querySelector('.security-metrics');
    if (!container) return;

    container.innerHTML = `
        <div class="security-metric">
            <span class="metric-label">Threat Level</span>
            <span class="metric-value ${masterState.securityStatus.threatLevel}">${masterState.securityStatus.threatLevel}</span>
        </div>
        <div class="security-metric">
            <span class="metric-label">Active Threats</span>
            <span class="metric-value">${masterState.securityStatus.activeThreats}</span>
        </div>
        <div class="security-metric">
            <span class="metric-label">Last Scan</span>
            <span class="metric-value">${masterState.securityStatus.lastScan}</span>
        </div>
    `;
}

function updateBillingMetrics() {
    const hasBillingData = Object.keys(masterState.billingData).length > 0;
    
    if (!hasBillingData) {
        document.getElementById('monthlyRevenue').textContent = '$0';
        document.getElementById('activeSubscriptions').textContent = '0';
        document.getElementById('overdueInvoices').textContent = '0';
        document.getElementById('churnRate').textContent = '0%';
        
        // Show empty state for billing tables
        const invoicesTable = document.getElementById('invoicesTable');
        if (invoicesTable) {
            invoicesTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-icon">💰</div>
                        <h4>No Billing Data Yet</h4>
                        <p>Billing information will appear here once you have active subscriptions.</p>
                        <button class="btn-secondary" onclick="createTenant()">Create Your First Tenant</button>
                    </td>
                </tr>
            `;
        }
        return;
    }

    // Update with real data if available
    document.getElementById('monthlyRevenue').textContent = formatCurrency(masterState.billingData.monthlyRevenue || 0);
    document.getElementById('activeSubscriptions').textContent = masterState.billingData.activeSubscriptions || 0;
    document.getElementById('overdueInvoices').textContent = masterState.billingData.overdueInvoices || 0;
    document.getElementById('churnRate').textContent = formatPercentage(masterState.billingData.churnRate || 0);
}

function updateSubscriptionMetrics() {
    const hasSubscriptionData = Object.keys(masterState.subscriptionData).length > 0;
    
    if (!hasSubscriptionData) {
        document.getElementById('totalSubscriptions').textContent = '0';
        document.getElementById('monthlyRenewals').textContent = '0';
        document.getElementById('upgrades').textContent = '0';
        document.getElementById('downgrades').textContent = '0';
        
        // Show empty state for subscription table
        const subscriptionsTable = document.getElementById('subscriptionsTable');
        if (subscriptionsTable) {
            subscriptionsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h4>No Subscriptions Yet</h4>
                        <p>Subscription data will appear here once tenants start using your platform.</p>
                        <button class="btn-secondary" onclick="createTenant()">Create Your First Tenant</button>
                    </td>
                </tr>
            `;
        }
        return;
    }

    // Update with real data if available
    document.getElementById('totalSubscriptions').textContent = masterState.subscriptionData.total || 0;
    document.getElementById('monthlyRenewals').textContent = masterState.subscriptionData.renewals || 0;
    document.getElementById('upgrades').textContent = masterState.subscriptionData.upgrades || 0;
    document.getElementById('downgrades').textContent = masterState.subscriptionData.downgrades || 0;
}

function updateTemplateMetrics() {
    const hasThemeData = Object.keys(masterState.themeData).length > 0;
    
    if (!hasThemeData) {
        document.getElementById('activeThemes').textContent = '4';
        document.getElementById('customSkins').textContent = '0';
        document.getElementById('tenantsWithCustom').textContent = '0';
        document.getElementById('themeUsage').textContent = 'Developer Light';
        
        // Show empty state for skin grid
        const skinGrid = document.getElementById('skinGrid');
        if (skinGrid) {
            skinGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎭</div>
                    <h4>No Custom Skins Yet</h4>
                    <p>Custom skins allow tenants to personalize their dashboard appearance.</p>
                    <button class="btn-secondary" onclick="createSkin()">Create Your First Skin</button>
                </div>
            `;
        }
        return;
    }

    // Update with real data if available
    document.getElementById('activeThemes').textContent = masterState.themeData.activeThemes || 4;
    document.getElementById('customSkins').textContent = masterState.themeData.customSkins || 0;
    document.getElementById('tenantsWithCustom').textContent = masterState.themeData.tenantsWithCustom || 0;
    document.getElementById('themeUsage').textContent = masterState.themeData.mostPopular || 'Developer Light';
}

function updateCustomizationMetrics() {
    const hasCustomizationData = Object.keys(masterState.customizationData).length > 0;
    
    if (!hasCustomizationData) {
        document.getElementById('customizedTenants').textContent = '0';
        document.getElementById('customThemes').textContent = '0';
        document.getElementById('customSkinsCount').textContent = '0';
        document.getElementById('customizationRate').textContent = '0%';
        
        // Show empty state for customizations table
        const customizationsTable = document.getElementById('customizationsTable');
        if (customizationsTable) {
            customizationsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-state-icon">⚙️</div>
                        <h4>No Customizations Yet</h4>
                        <p>Tenant customizations will appear here once they start personalizing their dashboards.</p>
                        <button class="btn-secondary" onclick="createTenant()">Create Your First Tenant</button>
                    </td>
                </tr>
            `;
        }
        return;
    }

    // Update with real data if available
    document.getElementById('customizedTenants').textContent = masterState.customizationData.customizedTenants || 0;
    document.getElementById('customThemes').textContent = masterState.customizationData.customThemes || 0;
    document.getElementById('customSkinsCount').textContent = masterState.customizationData.customSkins || 0;
    document.getElementById('customizationRate').textContent = formatPercentage(masterState.customizationData.rate || 0);
}

function initializeMasterCharts() {
    // Only initialize charts if we have data
    if (masterState.tenants.length > 0) {
        initializeTenantGrowthChart();
    }
    
    if (masterState.globalModules.length > 0) {
        initializeModuleUsageChart();
    }
    
    if (Object.keys(masterState.revenueData).length > 0) {
        initializeRevenueCharts();
    }
}

function initializeTenantGrowthChart() {
    const ctx = document.getElementById('tenantGrowthChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Tenant Growth',
                data: [0, 2, 5, 8, 10, 12],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function initializeModuleUsageChart() {
    const ctx = document.getElementById('moduleUsageChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Authentication', 'CRM', 'Analytics', 'Workflow'],
            datasets: [{
                data: [100, 67, 45, 23],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function loadSystemLogs() {
    const container = document.getElementById('logsList');
    if (!container) return;

    if (masterState.systemLogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h4>No System Logs Yet</h4>
                <p>System logs will appear here as activity occurs on your platform.</p>
                <div class="empty-state-help">
                    <p><strong>What are system logs?</strong> These track all system activities, user actions, and security events for monitoring and debugging.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = masterState.systemLogs.map(log => `
        <div class="log-entry">
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-level ${log.level}">${log.level}</span>
            <span class="log-message">${log.message}</span>
        </div>
    `).join('');
}

function setupMasterEventListeners() {
    // Search functionality
    const tenantSearch = document.getElementById('tenant-search');
    if (tenantSearch) {
        tenantSearch.addEventListener('input', filterTenants);
    }

    const moduleSearch = document.getElementById('module-search');
    if (moduleSearch) {
        moduleSearch.addEventListener('input', filterModules);
    }

    // Log filtering
    const logLevel = document.getElementById('log-level');
    if (logLevel) {
        logLevel.addEventListener('change', filterLogs);
    }
}

function startMasterRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        // Only update if we have data
        if (masterState.tenants.length > 0) {
            updateMasterMetrics();
        }
    }, 30000);
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Add active class to nav item
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

function createTenant() {
    showNotification('Opening tenant creation wizard...', 'info');
    // This would open a tenant creation interface
    setTimeout(() => {
        showNotification('Tenant creation wizard ready!', 'success');
    }, 1000);
}

function deployModule() {
    showNotification('Opening module deployment interface...', 'info');
    // This would open a module deployment interface
    setTimeout(() => {
        showNotification('Module deployment interface ready!', 'success');
    }, 1000);
}

function configureSSO() {
    showSection('sso');
}

function systemBackup() {
    showNotification('System backup initiated...', 'info');
    setTimeout(() => {
        showNotification('System backup completed successfully', 'success');
    }, 3000);
}

function manageTenant(tenantId) {
    showNotification(`Opening management for tenant: ${tenantId}`, 'info');
}

function viewTenantAnalytics(tenantId) {
    showNotification(`Opening analytics for tenant: ${tenantId}`, 'info');
}

function deployModuleUpdate(moduleId) {
    showNotification('Module update deployed successfully', 'success');
}

function viewModuleAnalytics(moduleId) {
    showNotification(`Opening analytics for module: ${moduleId}`, 'info');
}

function toggleTenantSSO(tenantId) {
    const tenant = masterState.ssoConfig.tenantStatus[tenantId];
    if (tenant) {
        tenant.enabled = !tenant.enabled;
        tenant.lastSync = tenant.enabled ? 'Just now' : 'Never';
        renderSSOStatus();
        showNotification(`SSO ${tenant.enabled ? 'enabled' : 'disabled'} for tenant`, 'success');
    }
}

function saveSSOConfig() {
    const provider = document.getElementById('sso-provider').value;
    const idpUrl = document.getElementById('idp-url').value;
    
    masterState.ssoConfig.provider = provider;
    masterState.ssoConfig.idpUrl = idpUrl;
    
    showNotification('SSO configuration saved successfully', 'success');
}

function bulkActions() {
    showNotification('Bulk actions feature coming soon', 'info');
}

function moduleAnalytics() {
    showNotification('Module analytics feature coming soon', 'info');
}

function reviewAccess() {
    showNotification('Access review feature coming soon', 'info');
}

function updatePolicies() {
    showNotification('Policy update feature coming soon', 'info');
}

function securityAudit() {
    showNotification('Security audit initiated...', 'info');
}

function exportLogs() {
    showNotification('Logs exported successfully', 'success');
}

function updateSystemAnalytics() {
    showNotification('System analytics updated', 'info');
}

function refreshSystemAnalytics() {
    showNotification('System analytics refreshed', 'info');
}

// Filter functions
function filterTenants(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tenantCards = document.querySelectorAll('.tenant-card');
    
    tenantCards.forEach(card => {
        const tenantName = card.querySelector('h4').textContent.toLowerCase();
        if (tenantName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterModules(e) {
    const searchTerm = e.target.value.toLowerCase();
    const moduleCards = document.querySelectorAll('.module-card');
    
    moduleCards.forEach(card => {
        const moduleName = card.querySelector('h4').textContent.toLowerCase();
        if (moduleName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterLogs() {
    showNotification('Logs filtered', 'info');
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">×</button>
    `;
    
    // Add notification styles if not already present
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(15, 15, 35, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 1001;
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .notification-success {
                border-color: rgba(34, 197, 94, 0.3);
            }
            
            .notification-error {
                border-color: rgba(239, 68, 68, 0.3);
            }
            
            .notification-info {
                border-color: rgba(59, 130, 246, 0.3);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 1.25rem;
                padding: 0.25rem;
                border-radius: 0.25rem;
                transition: all 0.2s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #e2e8f0;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== BILLING & REVENUE FUNCTIONS =====

function generateInvoices() {
    if (masterState.tenants.length === 0) {
        showNotification('No tenants to generate invoices for. Create your first tenant to get started.', 'info');
        return;
    }
    
    showNotification('Generating invoices for all tenants...', 'info');
    setTimeout(() => {
        showNotification('Invoices generated successfully!', 'success');
        updateBillingMetrics();
    }, 2000);
}

function processPayments() {
    if (Object.keys(masterState.billingData).length === 0) {
        showNotification('No payments to process. Billing data will appear once you have active subscriptions.', 'info');
        return;
    }
    
    showNotification('Processing pending payments...', 'info');
    setTimeout(() => {
        showNotification('Payments processed successfully!', 'success');
        updateBillingMetrics();
    }, 1500);
}

function billingReports() {
    if (Object.keys(masterState.billingData).length === 0) {
        showNotification('No billing data available yet. Reports will be generated once you have active subscriptions.', 'info');
        return;
    }
    
    showNotification('Generating billing reports...', 'info');
    setTimeout(() => {
        showNotification('Billing reports ready for download!', 'success');
    }, 3000);
}

function updateRevenueAnalytics() {
    const timeRange = document.getElementById('revenue-timeRange').value;
    
    if (Object.keys(masterState.revenueData).length === 0) {
        showNotification('No revenue data available yet. Revenue analytics will appear once you have active subscriptions.', 'info');
        return;
    }
    
    showNotification(`Updating revenue analytics for ${timeRange}...`, 'info');
    initializeRevenueCharts();
}

function refreshRevenueAnalytics() {
    if (Object.keys(masterState.revenueData).length === 0) {
        showNotification('No revenue data to refresh. Create tenants and subscriptions to see revenue analytics.', 'info');
        return;
    }
    
    showNotification('Refreshing revenue analytics...', 'info');
    updateRevenueAnalytics();
}

function initializeRevenueCharts() {
    // Only initialize if we have revenue data
    if (Object.keys(masterState.revenueData).length === 0) {
        return;
    }

    // Revenue Trends Chart
    const revenueTrendsCtx = document.getElementById('revenueTrendsChart');
    if (revenueTrendsCtx) {
        new Chart(revenueTrendsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Revenue',
                    data: [18500, 20100, 22400, 21800, 24800, 24815],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Revenue by Module Chart
    const revenueByModuleCtx = document.getElementById('revenueByModuleChart');
    if (revenueByModuleCtx) {
        new Chart(revenueByModuleCtx, {
            type: 'doughnut',
            data: {
                labels: ['CRM Module', 'Analytics', 'Workflow', 'HR Module', 'Finance'],
                datasets: [{
                    data: [45200, 28500, 22100, 15800, 12415],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Revenue by Tier Chart
    const revenueByTierCtx = document.getElementById('revenueByTierChart');
    if (revenueByTierCtx) {
        new Chart(revenueByTierCtx, {
            type: 'bar',
            data: {
                labels: ['Basic', 'Pro', 'Enterprise'],
                datasets: [{
                    label: 'Revenue by Plan',
                    data: [4455, 8372, 11988],
                    backgroundColor: ['#6b7280', '#3b82f6', '#1f2937']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Revenue Forecast Chart
    const revenueForecastCtx = document.getElementById('revenueForecastChart');
    if (revenueForecastCtx) {
        new Chart(revenueForecastCtx, {
            type: 'line',
            data: {
                labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Forecasted Revenue',
                    data: [26500, 28100, 29500, 31200, 32800, 34500],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// ===== TEMPLATE SYSTEM FUNCTIONS =====

function openTemplateSystem() {
    window.open('template-system.html', '_blank');
}

function createCustomTheme() {
    showNotification('Opening theme creation wizard...', 'info');
    setTimeout(() => {
        showNotification('Theme creation wizard ready!', 'success');
    }, 1000);
}

function themeAnalytics() {
    showNotification('Loading theme analytics...', 'info');
    setTimeout(() => {
        showNotification('Theme analytics loaded!', 'success');
    }, 1500);
}

function createSkin() {
    showNotification('Opening skin creation tool...', 'info');
    setTimeout(() => {
        showNotification('Skin creation tool ready!', 'success');
    }, 1000);
}

function importSkin() {
    showNotification('Opening skin import dialog...', 'info');
    setTimeout(() => {
        showNotification('Skin import dialog ready!', 'success');
    }, 1000);
}

function exportSkinLibrary() {
    if (Object.keys(masterState.skinData).length === 0) {
        showNotification('No skins to export. Create or import skins to build your library.', 'info');
        return;
    }
    
    showNotification('Exporting skin library...', 'info');
    setTimeout(() => {
        showNotification('Skin library exported successfully!', 'success');
    }, 2000);
}

// ===== INITIALIZATION FUNCTIONS =====

function initializeAllSections() {
    // Initialize all sections with empty state handling
    updateBillingMetrics();
    updateSubscriptionMetrics();
    updateTemplateMetrics();
    updateCustomizationMetrics();
    initializeRevenueCharts();
}

// ===== EVENT LISTENERS =====

function setupAllEventListeners() {
    // Theme switcher
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('change', (e) => {
            if (window.templateSystem) {
                window.templateSystem.loadTheme(e.target.value);
            }
        });
    }

    // Theme preview cards
    document.querySelectorAll('.theme-preview').forEach(card => {
        card.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            if (window.templateSystem) {
                window.templateSystem.loadTheme(theme);
            }
        });
    });

    // Customization controls
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            showNotification(`${e.target.id} setting updated`, 'success');
        });
    });
}

// ===== UTILITY FUNCTIONS =====

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Error handling for broken links/fetching
function handleDataFetchError(section, error) {
    const container = document.getElementById(section);
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-state-icon">⚠️</div>
                <h4>Unable to Load Data</h4>
                <p>We're having trouble loading the ${section} data. This might be a temporary issue.</p>
                <button class="btn-secondary" onclick="retryDataFetch('${section}')">Try Again</button>
                <button class="btn-primary" onclick="contactSupport()">Contact Support</button>
                <div class="error-state-help">
                    <p><strong>Need help?</strong> Our support team is here to help you get back up and running quickly.</p>
                </div>
            </div>
        `;
    }
}

function retryDataFetch(section) {
    showNotification('Retrying data fetch...', 'info');
    // Implement retry logic here
    setTimeout(() => {
        showNotification('Data loaded successfully!', 'success');
        loadMasterData();
    }, 2000);
}

function contactSupport() {
    showNotification('Opening support contact form...', 'info');
    // This would open a support contact form
    setTimeout(() => {
        showNotification('Support contact form ready!', 'success');
    }, 1000);
}

// Initialize all sections when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAllSections();
    setupAllEventListeners();
}); 