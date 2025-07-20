// AI-BOS Developer Workspace Dashboard JavaScript

// Global state
let dashboardState = {
    metrics: {
        totalModules: 0,
        activeModules: 0,
        completedTasks: 0,
        systemUptime: 0
    },
    charts: {},
    customWidgets: [],
    activityFeed: []
};

// Analytics Framework
class AnalyticsFramework {
    constructor() {
        this.metrics = new Map();
        this.widgets = new Map();
        this.charts = new Map();
        this.customMetrics = new Map();
    }

    // Register a new metric
    registerMetric(name, config) {
        this.metrics.set(name, {
            ...config,
            value: 0,
            history: [],
            lastUpdated: Date.now()
        });
    }

    // Update metric value
    updateMetric(name, value, metadata = {}) {
        const metric = this.metrics.get(name);
        if (metric) {
            metric.history.push({
                value,
                timestamp: Date.now(),
                metadata
            });
            metric.value = value;
            metric.lastUpdated = Date.now();
            
            // Keep only last 100 entries
            if (metric.history.length > 100) {
                metric.history = metric.history.slice(-100);
            }
        }
    }

    // Register a custom widget
    registerWidget(name, config) {
        this.widgets.set(name, {
            ...config,
            id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
    }

    // Create custom metric
    createCustomMetric(name, calculation, config = {}) {
        this.customMetrics.set(name, {
            calculation,
            config,
            value: 0,
            lastCalculated: Date.now()
        });
    }

    // Calculate custom metric
    calculateCustomMetric(name) {
        const metric = this.customMetrics.get(name);
        if (metric && metric.calculation) {
            metric.value = metric.calculation(this.metrics);
            metric.lastCalculated = Date.now();
            return metric.value;
        }
        return 0;
    }

    // Get analytics data
    getAnalytics(timeRange = '24h') {
        const now = Date.now();
        const ranges = {
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            'all': Infinity
        };

        const cutoff = now - (ranges[timeRange] || ranges['24h']);
        
        const analytics = {
            metrics: {},
            charts: {},
            widgets: Array.from(this.widgets.values()),
            customMetrics: {}
        };

        // Process metrics
        for (const [name, metric] of this.metrics) {
            analytics.metrics[name] = {
                current: metric.value,
                history: metric.history.filter(h => h.timestamp >= cutoff),
                change: this.calculateChange(metric.history, cutoff)
            };
        }

        // Process custom metrics
        for (const [name, metric] of this.customMetrics) {
            analytics.customMetrics[name] = {
                value: this.calculateCustomMetric(name),
                config: metric.config
            };
        }

        return analytics;
    }

    // Calculate percentage change
    calculateChange(history, cutoff) {
        const recent = history.filter(h => h.timestamp >= cutoff);
        const older = history.filter(h => h.timestamp < cutoff && h.timestamp >= cutoff - (cutoff - Date.now()) / 2);
        
        if (recent.length === 0 || older.length === 0) return 0;
        
        const recentAvg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, h) => sum + h.value, 0) / older.length;
        
        if (olderAvg === 0) return 0;
        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }
}

// Initialize analytics framework
const analytics = new AnalyticsFramework();

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadAnalytics();
    setupEventListeners();
    startRealTimeUpdates();
});

function initializeDashboard() {
    // Register default metrics
    analytics.registerMetric('totalModules', {
        title: 'Total Modules',
        icon: '📦',
        unit: '',
        description: 'Total number of uploaded modules'
    });

    analytics.registerMetric('activeModules', {
        title: 'Active Modules',
        icon: '⚡',
        unit: '',
        description: 'Currently active modules'
    });

    analytics.registerMetric('completedTasks', {
        title: 'Tasks Completed',
        icon: '📝',
        unit: '',
        description: 'Number of completed tasks'
    });

    analytics.registerMetric('systemUptime', {
        title: 'System Uptime',
        icon: '⏱️',
        unit: 'h',
        description: 'System uptime in hours'
    });

    // Register custom metrics
    analytics.createCustomMetric('productivityScore', (metrics) => {
        const totalModules = metrics.get('totalModules')?.value || 0;
        const completedTasks = metrics.get('completedTasks')?.value || 0;
        return Math.round((totalModules * 0.4 + completedTasks * 0.6) * 10);
    }, {
        title: 'Productivity Score',
        icon: '📈',
        unit: '/100'
    });

    // Initialize with sample data
    analytics.updateMetric('totalModules', 12);
    analytics.updateMetric('activeModules', 8);
    analytics.updateMetric('completedTasks', 25);
    analytics.updateMetric('systemUptime', 168);

    // Load activity feed
    loadActivityFeed();
}

function loadAnalytics() {
    const timeRange = document.getElementById('timeRange').value;
    const data = analytics.getAnalytics(timeRange);
    
    // Update metrics display
    updateMetricsDisplay(data.metrics);
    
    // Update charts
    updateCharts(data);
    
    // Update custom widgets
    updateCustomWidgets(data.widgets);
    
    // Update custom metrics
    updateCustomMetrics(data.customMetrics);
}

function updateMetricsDisplay(metrics) {
    for (const [name, data] of Object.entries(metrics)) {
        const element = document.getElementById(name);
        if (element) {
            element.textContent = data.current;
            
            // Update change indicator
            const changeElement = element.parentElement.querySelector('.metric-change');
            if (changeElement) {
                const change = data.change;
                changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                changeElement.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        }
    }
}

function updateCharts(data) {
    // Module Activity Chart
    const moduleCtx = document.getElementById('moduleActivityChart');
    if (moduleCtx && !dashboardState.charts.moduleActivity) {
        dashboardState.charts.moduleActivity = new Chart(moduleCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Module Activity',
                    data: [3, 5, 2, 8, 6, 4, 7],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // Task Progress Chart
    const taskCtx = document.getElementById('taskProgressChart');
    if (taskCtx && !dashboardState.charts.taskProgress) {
        dashboardState.charts.taskProgress = new Chart(taskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [25, 8, 3],
                    backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    // Productivity Chart
    const productivityCtx = document.getElementById('productivityChart');
    if (productivityCtx && !dashboardState.charts.productivity) {
        dashboardState.charts.productivity = new Chart(productivityCtx, {
            type: 'bar',
            data: {
                labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'],
                datasets: [{
                    label: 'Productivity',
                    data: [85, 92, 88, 65, 70, 78, 82, 75],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}

function updateCustomWidgets(widgets) {
    const container = document.getElementById('customWidgets');
    if (!container) return;

    // Clear existing widgets
    container.innerHTML = '';

    if (widgets.length === 0) {
        // Show placeholder
        container.innerHTML = `
            <div class="widget-placeholder">
                <span>📊</span>
                <p>Custom Analytics Widget</p>
                <button onclick="addCustomWidget()">Add Widget</button>
            </div>
        `;
    } else {
        // Render widgets
        widgets.forEach(widget => {
            const widgetElement = createWidgetElement(widget);
            container.appendChild(widgetElement);
        });
    }
}

function createWidgetElement(widget) {
    const element = document.createElement('div');
    element.className = 'widget-card';
    element.innerHTML = `
        <div class="widget-header">
            <span class="widget-icon">${widget.icon || '📊'}</span>
            <span class="widget-title">${widget.title}</span>
            <button class="widget-close" onclick="removeWidget('${widget.id}')">×</button>
        </div>
        <div class="widget-content">
            ${widget.content || 'Widget content'}
        </div>
    `;
    return element;
}

function updateCustomMetrics(metrics) {
    const container = document.getElementById('customMetricsList');
    if (!container) return;

    container.innerHTML = '';
    
    for (const [name, metric] of Object.entries(metrics)) {
        const element = document.createElement('div');
        element.className = 'custom-metric-item';
        element.innerHTML = `
            <span class="metric-icon">${metric.config.icon || '📊'}</span>
            <span class="metric-name">${metric.config.title || name}</span>
            <span class="metric-value">${metric.value}${metric.config.unit || ''}</span>
        `;
        container.appendChild(element);
    }
}

function loadActivityFeed() {
    const activities = [
        { type: 'module', message: 'Uploaded new CRM module', time: '2 minutes ago', icon: '📦' },
        { type: 'task', message: 'Completed task: Database optimization', time: '15 minutes ago', icon: '✅' },
        { type: 'system', message: 'System backup completed', time: '1 hour ago', icon: '💾' },
        { type: 'module', message: 'Updated authentication module', time: '2 hours ago', icon: '🔐' },
        { type: 'task', message: 'Started new task: API documentation', time: '3 hours ago', icon: '📝' }
    ];

    const container = document.getElementById('activityFeed');
    if (!container) return;

    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
                <p class="activity-message">${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Time range change
    document.getElementById('timeRange')?.addEventListener('change', loadAnalytics);
    
    // Refresh button
    document.querySelector('.refresh-btn')?.addEventListener('click', loadAnalytics);
}

function startRealTimeUpdates() {
    // Update metrics every 30 seconds
    setInterval(() => {
        // Simulate real-time updates
        const randomChange = Math.random() * 10 - 5;
        analytics.updateMetric('activeModules', Math.max(0, Math.round(8 + randomChange)));
        
        // Update display
        loadAnalytics();
    }, 30000);
}

// Action functions
function uploadModule() {
    window.location.href = 'index.html';
}

function createTask() {
    // Open task creation modal or redirect
    alert('Task creation feature coming soon!');
}

function systemRestart() {
    if (confirm('Are you sure you want to restart the system?')) {
        alert('System restart initiated...');
    }
}

function openAnalytics() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.style.display = 'flex';
        loadAdvancedAnalytics();
    }
}

function closeAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to button
    const selectedBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

function loadAdvancedAnalytics() {
    // Load performance chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx && !dashboardState.charts.performance) {
        dashboardState.charts.performance = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'CPU Usage',
                    data: [15, 25, 45, 60, 40, 30],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }, {
                    label: 'Memory Usage',
                    data: [30, 35, 50, 70, 55, 40],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    // Load usage chart
    const usageCtx = document.getElementById('usageChart');
    if (usageCtx && !dashboardState.charts.usage) {
        dashboardState.charts.usage = new Chart(usageCtx, {
            type: 'radar',
            data: {
                labels: ['Modules', 'Tasks', 'Analytics', 'System', 'Performance'],
                datasets: [{
                    label: 'Current Usage',
                    data: [85, 70, 60, 90, 75],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    r: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#e2e8f0' }
                    }
                }
            }
        });
    }
}

function addCustomWidget() {
    const widgetName = prompt('Enter widget name:');
    if (widgetName) {
        analytics.registerWidget(widgetName, {
            title: widgetName,
            icon: '📊',
            content: 'Custom widget content'
        });
        loadAnalytics();
    }
}

function removeWidget(widgetId) {
    // Remove widget from analytics framework
    for (const [name, widget] of analytics.widgets) {
        if (widget.id === widgetId) {
            analytics.widgets.delete(name);
            break;
        }
    }
    loadAnalytics();
}

function createCustomMetric() {
    const metricName = prompt('Enter metric name:');
    const metricTitle = prompt('Enter metric title:');
    
    if (metricName && metricTitle) {
        analytics.createCustomMetric(metricName, (metrics) => {
            // Simple calculation example
            return Math.floor(Math.random() * 100);
        }, {
            title: metricTitle,
            icon: '📊',
            unit: ''
        });
        loadAnalytics();
    }
}

function refreshAnalytics() {
    loadAnalytics();
    loadActivityFeed();
}

function updateAnalytics() {
    loadAnalytics();
}

// Export analytics framework for external use
window.AnalyticsFramework = AnalyticsFramework;
window.analytics = analytics; 