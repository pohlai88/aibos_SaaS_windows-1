/**
 * AI-BOS OS Web Application
 * Main JavaScript for the module management interface
 */

class AIBOSApp {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.modules = [];
        this.uploadedFiles = [];
        this.currentSection = 'dashboard';
        this.refreshInterval = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing AI-BOS OS Web Application...');
        
        // Show loading screen
        this.showLoading();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Check API connection
        await this.checkAPIHealth();
        
        // Load initial data
        await this.loadDashboardData();
        await this.loadModules();
        
        // Hide loading and show main app
        this.hideLoading();
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        console.log('✅ AI-BOS OS Web Application initialized');
    }

    setupEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Search functionality
        const searchInput = document.getElementById('module-search');
        searchInput.addEventListener('input', this.handleSearch.bind(this));
        
        // Settings
        const apiEndpoint = document.getElementById('api-endpoint');
        apiEndpoint.addEventListener('change', this.updateAPIEndpoint.bind(this));
        
        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    showLoading() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
    }

    async checkAPIHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();
            
            if (data.success) {
                this.updateSystemStatus('online');
                console.log('✅ API connection established');
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            console.error('❌ API connection failed:', error);
            this.updateSystemStatus('offline');
            this.showNotification('API connection failed. Please check the server.', 'error');
        }
    }

    updateSystemStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        statusIndicator.className = `status-indicator ${status}`;
        statusText.textContent = `System ${status === 'online' ? 'Online' : 'Offline'}`;
    }

    async loadDashboardData() {
        try {
            // Load module statistics
            const [modulesResponse, systemResponse] = await Promise.all([
                fetch(`${this.apiBase}/modules/stats/overview`),
                fetch(`${this.apiBase}/system/status`)
            ]);
            
            const modulesData = await modulesResponse.json();
            const systemData = await systemResponse.json();
            
            if (modulesData.success) {
                this.updateDashboardStats(modulesData.stats);
            }
            
            if (systemData.success) {
                this.updateSystemUptime(systemData.status.uptime);
            }
            
        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('total-modules').textContent = stats.total;
        document.getElementById('active-modules').textContent = stats.active;
        document.getElementById('installed-modules').textContent = stats.installed;
        
        // Update module types chart
        this.updateModuleTypesChart(stats.byType);
    }

    updateSystemUptime(uptime) {
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        let uptimeText = '';
        if (hours > 0) uptimeText += `${hours}h `;
        if (minutes > 0) uptimeText += `${minutes}m `;
        uptimeText += `${seconds}s`;
        
        document.getElementById('system-uptime').textContent = uptimeText;
    }

    updateModuleTypesChart(types) {
        const chartContainer = document.getElementById('module-types-chart');
        
        if (Object.keys(types).length === 0) {
            chartContainer.innerHTML = '<p>No modules installed yet</p>';
            return;
        }
        
        // Simple chart visualization
        let chartHTML = '<div class="chart-bars">';
        for (const [type, count] of Object.entries(types)) {
            const percentage = (count / Object.values(types).reduce((a, b) => a + b, 0)) * 100;
            chartHTML += `
                <div class="chart-bar">
                    <div class="bar-fill" style="height: ${percentage}%"></div>
                    <span class="bar-label">${type}</span>
                    <span class="bar-value">${count}</span>
                </div>
            `;
        }
        chartHTML += '</div>';
        
        chartContainer.innerHTML = chartHTML;
    }

    async loadModules() {
        try {
            const response = await fetch(`${this.apiBase}/modules`);
            const data = await response.json();
            
            if (data.success) {
                this.modules = data.modules;
                this.renderModules();
            }
        } catch (error) {
            console.error('❌ Failed to load modules:', error);
            this.showNotification('Failed to load modules', 'error');
        }
    }

    renderModules() {
        const modulesList = document.getElementById('modules-list');
        
        if (this.modules.length === 0) {
            modulesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <h3>No modules found</h3>
                    <p>Upload your first module to get started</p>
                    <button class="btn-primary" onclick="showUploadModal()">
                        <i class="fas fa-plus"></i>
                        Upload Module
                    </button>
                </div>
            `;
            return;
        }
        
        modulesList.innerHTML = this.modules.map(module => this.createModuleCard(module)).join('');
    }

    createModuleCard(module) {
        const statusClass = module.status === 'active' ? 'active' : 
                           module.status === 'installed' ? 'installed' : 
                           module.status === 'installing' ? 'installing' : 'inactive';
        
        return `
            <div class="module-card" data-module-id="${module.id}">
                <div class="module-header">
                    <div class="module-info">
                        <h3>${module.name}</h3>
                        <p>${module.description || 'No description'}</p>
                    </div>
                    <div class="module-actions">
                        <button class="btn-secondary" onclick="showModuleDetails('${module.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${module.status === 'active' ? `
                            <button class="btn-secondary" onclick="installModule('${module.id}')">
                                <i class="fas fa-download"></i>
                            </button>
                        ` : ''}
                        <button class="btn-secondary" onclick="deleteModule('${module.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="module-meta">
                    <span><i class="fas fa-tag"></i> ${module.type}</span>
                    <span><i class="fas fa-code-branch"></i> v${module.version}</span>
                    <span class="module-status ${statusClass}">
                        <i class="fas fa-circle"></i>
                        ${module.status}
                    </span>
                </div>
            </div>
        `;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    async handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        await this.uploadFiles(files);
    }

    async handleFileSelect(e) {
        const files = Array.from(e.target.files);
        await this.uploadFiles(files);
    }

    async uploadFiles(files) {
        if (files.length === 0) return;
        
        this.showUploadProgress();
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await this.uploadSingleFile(file, i + 1, files.length);
        }
        
        this.hideUploadProgress();
        this.showNotification(`${files.length} file(s) uploaded successfully`, 'success');
        
        // Refresh modules list
        await this.loadModules();
    }

    async uploadSingleFile(file, current, total) {
        const formData = new FormData();
        formData.append('module', file);
        
        try {
            const response = await fetch(`${this.apiBase}/upload/module`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.uploadedFiles.push(data.file);
                this.updateUploadProgress((current / total) * 100);
                this.addUploadedFile(data.file);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
        }
    }

    showUploadProgress() {
        document.getElementById('upload-progress').style.display = 'block';
        this.updateUploadProgress(0);
    }

    hideUploadProgress() {
        document.getElementById('upload-progress').style.display = 'none';
    }

    updateUploadProgress(percentage) {
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `Uploading... ${Math.round(percentage)}%`;
    }

    addUploadedFile(file) {
        const uploadedFiles = document.getElementById('uploaded-files');
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="file-details">
                    <h4>${file.originalName}</h4>
                    <p>${this.formatFileSize(file.size)} • ${new Date(file.uploadedAt).toLocaleString()}</p>
                </div>
            </div>
            <button class="btn-secondary" onclick="deleteUploadedFile('${file.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        uploadedFiles.appendChild(fileItem);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const moduleCards = document.querySelectorAll('.module-card');
        
        moduleCards.forEach(card => {
            const moduleName = card.querySelector('h3').textContent.toLowerCase();
            const moduleDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (moduleName.includes(query) || moduleDesc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateAPIEndpoint(e) {
        this.apiBase = e.target.value + '/api';
        this.showNotification('API endpoint updated', 'info');
    }

    startAutoRefresh() {
        const interval = document.getElementById('refresh-interval').value;
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
            this.loadModules();
        }, parseInt(interval));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async loadTaskMaster() {
        const container = document.getElementById('taskmaster-app');
        container.innerHTML = `<div class="taskmaster-controls">
            <input type="text" id="task-title" placeholder="Task title" class="setting-input" style="width: 40%; margin-right: 1rem;">
            <input type="text" id="task-desc" placeholder="Description (optional)" class="setting-input" style="width: 40%; margin-right: 1rem;">
            <button class="btn-primary" id="add-task-btn"><i class="fas fa-plus"></i> Add Task</button>
        </div>
        <div id="task-list" class="taskmaster-list" style="margin-top:2rem;"></div>`;
        document.getElementById('add-task-btn').onclick = () => this.addTask();
        this.renderTasks();
    }

    async fetchTasks() {
        try {
            const res = await fetch(`${this.apiBase}/tasks`);
            const data = await res.json();
            this.tasks = data.tasks || [];
        } catch {
            this.tasks = [];
        }
    }

    async renderTasks() {
        await this.fetchTasks();
        const list = document.getElementById('task-list');
        if (!list) return;
        if (this.tasks.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><h3>No tasks yet</h3></div>';
            return;
        }
        list.innerHTML = this.tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-main">
                    <span class="task-title">${task.title}</span>
                    <span class="task-status ${task.status}">${task.status}</span>
                </div>
                <div class="task-desc">${task.description || ''}</div>
                <div class="task-meta">
                    <span>Created: ${new Date(task.createdAt).toLocaleString()}</span>
                    <span>Updated: ${new Date(task.updatedAt).toLocaleString()}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-secondary" onclick="editTask('${task.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-secondary" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    async addTask() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-desc').value.trim();
        if (!title) return this.showNotification('Task title required', 'error');
        await fetch(`${this.apiBase}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        this.renderTasks();
    }
}

// Global functions for HTML onclick handlers
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    
    app.currentSection = section;
}

function showUploadModal() {
    app.showModal('upload-modal');
}

function hideUploadModal() {
    app.hideModal('upload-modal');
}

function showSystemInfo() {
    app.showModal('system-modal');
    loadSystemInfo();
}

function hideSystemModal() {
    app.hideModal('system-modal');
}

async function loadSystemInfo() {
    try {
        const response = await fetch(`${app.apiBase}/system/info`);
        const data = await response.json();
        
        if (data.success) {
            const content = document.getElementById('system-info-content');
            content.innerHTML = `
                <div class="system-info-grid">
                    <div class="info-item">
                        <label>Platform:</label>
                        <span>${data.system.platform} ${data.system.arch}</span>
                    </div>
                    <div class="info-item">
                        <label>Hostname:</label>
                        <span>${data.system.hostname}</span>
                    </div>
                    <div class="info-item">
                        <label>Memory:</label>
                        <span>${Math.round(data.system.freeMemory / 1024 / 1024)}MB free / ${Math.round(data.system.totalMemory / 1024 / 1024)}MB total</span>
                    </div>
                    <div class="info-item">
                        <label>CPU Cores:</label>
                        <span>${data.system.cpus}</span>
                    </div>
                    <div class="info-item">
                        <label>Uptime:</label>
                        <span>${Math.round(data.system.uptime / 3600)} hours</span>
                    </div>
                    <div class="info-item">
                        <label>Version:</label>
                        <span>${data.system.version}</span>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Failed to load system info:', error);
    }
}

async function refreshModules() {
    await app.loadModules();
    app.showNotification('Modules refreshed', 'success');
}

async function submitModule() {
    const form = document.getElementById('upload-form');
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`${app.apiBase}/modules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('module-name'),
                description: formData.get('module-description'),
                version: formData.get('module-version'),
                type: formData.get('module-type')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            app.showNotification('Module created successfully', 'success');
            hideUploadModal();
            form.reset();
            await app.loadModules();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Failed to create module:', error);
        app.showNotification(`Failed to create module: ${error.message}`, 'error');
    }
}

async function installModule(moduleId) {
    try {
        const response = await fetch(`${app.apiBase}/modules/${moduleId}/install`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            app.showNotification('Module installation started', 'success');
            await app.loadModules();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Failed to install module:', error);
        app.showNotification(`Failed to install module: ${error.message}`, 'error');
    }
}

async function deleteModule(moduleId) {
    if (!confirm('Are you sure you want to delete this module?')) return;
    
    try {
        const response = await fetch(`${app.apiBase}/modules/${moduleId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            app.showNotification('Module deleted successfully', 'success');
            await app.loadModules();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Failed to delete module:', error);
        app.showNotification(`Failed to delete module: ${error.message}`, 'error');
    }
}

async function deleteUploadedFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
        const response = await fetch(`${app.apiBase}/upload/file/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: fileId // In a real app, you'd need the actual filename
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            app.showNotification('File deleted successfully', 'success');
            // Remove from UI
            const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
            if (fileItem) fileItem.remove();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Failed to delete file:', error);
        app.showNotification(`Failed to delete file: ${error.message}`, 'error');
    }
}

// Task Master global functions
async function editTask(id) {
    const task = app.tasks.find(t => t.id === id);
    if (!task) return;
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null) return;
    const newDesc = prompt('Edit description:', task.description || '');
    const newStatus = prompt('Edit status (open, in-progress, done):', task.status);
    await fetch(`${app.apiBase}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, status: newStatus })
    });
    app.renderTasks();
}
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    await fetch(`${app.apiBase}/tasks/${id}`, { method: 'DELETE' });
    app.renderTasks();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AIBOSApp();
    // Load Task Master UI when section is shown
    document.querySelector('[onclick="showSection(\'taskmaster\')"]').addEventListener('click', () => app.loadTaskMaster());
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 30, 46, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1001;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease;
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
    
    .notification i {
        font-size: 1.25rem;
    }
    
    .notification-success i {
        color: #22c55e;
    }
    
    .notification-error i {
        color: #ef4444;
    }
    
    .notification-info i {
        color: #3b82f6;
    }
    
    .notification button {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s ease;
    }
    
    .notification button:hover {
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
    
    .system-info-grid {
        display: grid;
        gap: 1rem;
    }
    
    .info-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
    }
    
    .info-item label {
        font-weight: 600;
        color: #94a3b8;
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #94a3b8;
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #667eea;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #e2e8f0;
    }
    
    .chart-bars {
        display: flex;
        align-items: end;
        gap: 1rem;
        height: 150px;
    }
    
    .chart-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    
    .bar-fill {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 0.25rem;
        min-height: 20px;
    }
    
    .bar-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-align: center;
    }
    
    .bar-value {
        font-size: 0.875rem;
        font-weight: 600;
        color: #e2e8f0;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 

// Add Task Master styles
const taskMasterStyles = `
.taskmaster-controls { display: flex; align-items: center; gap: 1rem; }
.taskmaster-list { display: flex; flex-direction: column; gap: 1.5rem; }
.task-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 1rem 1.5rem; }
.task-main { display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; font-weight: 600; }
.task-title { flex: 1; }
.task-status { padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 500; background: #22223b; color: #fff; margin-left: 1rem; }
.task-status.open { background: #3b82f6; }
.task-status[status='in-progress'], .task-status.in-progress { background: #f59e0b; }
.task-status.done { background: #22c55e; }
.task-desc { color: #94a3b8; margin: 0.5rem 0; }
.task-meta { color: #94a3b8; font-size: 0.85rem; display: flex; gap: 2rem; }
.task-actions { margin-top: 0.5rem; display: flex; gap: 0.5rem; }
`;
const styleSheet2 = document.createElement('style');
styleSheet2.textContent = taskMasterStyles;
document.head.appendChild(styleSheet2);

// Open Analytics Dashboard
function openDashboard() {
    window.open('dashboard.html', '_blank');
}

// Open Owner Dashboard
function openOwnerDashboard() {
    window.open('owner-dashboard.html', '_blank');
}

// Open Tenant Master
function openTenantMaster() {
    window.open('tenant-master.html', '_blank');
}

// Open Template System
function openTemplateSystem() {
    window.open('template-system.html', '_blank');
} 