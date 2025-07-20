/**
 * AI-BOS OS Template System
 * 
 * Features:
 * - 4 Dashboard Templates (2 Light, 2 Dark themes)
 * - Tenant Customization (upload skins)
 * - Semantic Component Recognition
 * - Smart Skin Application
 * - Theme Switching
 * - Real-time Preview
 */

class TemplateSystem {
    constructor() {
        this.currentTheme = 'developer-light';
        this.availableThemes = {
            'developer-light': {
                name: 'Developer Workspace Light',
                description: 'Clean, modern workspace for developers',
                category: 'light'
            },
            'developer-dark': {
                name: 'Developer Workspace Dark',
                description: 'Dark theme for extended coding sessions',
                category: 'dark'
            },
            'enterprise-light': {
                name: 'Enterprise Light',
                description: 'Professional business dashboard',
                category: 'light'
            },
            'enterprise-dark': {
                name: 'Enterprise Dark',
                description: 'Sophisticated dark enterprise theme',
                category: 'dark'
            }
        };
        
        this.customSkins = {};
        this.semanticComponents = new Map();
        
        this.init();
    }

    init() {
        this.loadTheme(this.currentTheme);
        this.setupEventListeners();
        this.detectSemanticComponents();
        this.setupSkinUpload();
    }

    /**
     * Load and apply a theme
     */
    loadTheme(themeName) {
        if (!this.availableThemes[themeName]) {
            console.error(`Theme ${themeName} not found`);
            return;
        }

        this.currentTheme = themeName;
        const theme = this.availableThemes[themeName];
        
        // Apply base theme CSS variables
        this.applyThemeVariables(themeName);
        
        // Apply custom skins if available
        this.applyCustomSkins();
        
        // Update UI
        this.updateThemeUI();
        
        // Save preference
        localStorage.setItem('aibos-theme', themeName);
        
        console.log(`Theme loaded: ${theme.name}`);
    }

    /**
     * Apply theme CSS variables
     */
    applyThemeVariables(themeName) {
        const root = document.documentElement;
        const variables = this.getThemeVariables(themeName);
        
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    }

    /**
     * Get theme CSS variables
     */
    getThemeVariables(themeName) {
        const themes = {
            'developer-light': {
                'primary-bg': '#ffffff',
                'secondary-bg': '#f8fafc',
                'tertiary-bg': '#f1f5f9',
                'primary-text': '#1e293b',
                'secondary-text': '#64748b',
                'accent-color': '#3b82f6',
                'accent-hover': '#2563eb',
                'success-color': '#10b981',
                'warning-color': '#f59e0b',
                'error-color': '#ef4444',
                'border-color': '#e2e8f0',
                'shadow-color': 'rgba(0, 0, 0, 0.1)',
                'card-bg': '#ffffff',
                'input-bg': '#ffffff',
                'button-primary-bg': '#3b82f6',
                'button-primary-text': '#ffffff',
                'button-secondary-bg': '#f1f5f9',
                'button-secondary-text': '#64748b'
            },
            'developer-dark': {
                'primary-bg': '#0f172a',
                'secondary-bg': '#1e293b',
                'tertiary-bg': '#334155',
                'primary-text': '#f8fafc',
                'secondary-text': '#cbd5e1',
                'accent-color': '#60a5fa',
                'accent-hover': '#3b82f6',
                'success-color': '#34d399',
                'warning-color': '#fbbf24',
                'error-color': '#f87171',
                'border-color': '#475569',
                'shadow-color': 'rgba(0, 0, 0, 0.3)',
                'card-bg': '#1e293b',
                'input-bg': '#334155',
                'button-primary-bg': '#60a5fa',
                'button-primary-text': '#0f172a',
                'button-secondary-bg': '#475569',
                'button-secondary-text': '#cbd5e1'
            },
            'enterprise-light': {
                'primary-bg': '#ffffff',
                'secondary-bg': '#f9fafb',
                'tertiary-bg': '#f3f4f6',
                'primary-text': '#111827',
                'secondary-text': '#6b7280',
                'accent-color': '#1f2937',
                'accent-hover': '#111827',
                'success-color': '#059669',
                'warning-color': '#d97706',
                'error-color': '#dc2626',
                'border-color': '#d1d5db',
                'shadow-color': 'rgba(0, 0, 0, 0.05)',
                'card-bg': '#ffffff',
                'input-bg': '#ffffff',
                'button-primary-bg': '#1f2937',
                'button-primary-text': '#ffffff',
                'button-secondary-bg': '#f3f4f6',
                'button-secondary-text': '#374151'
            },
            'enterprise-dark': {
                'primary-bg': '#111827',
                'secondary-bg': '#1f2937',
                'tertiary-bg': '#374151',
                'primary-text': '#f9fafb',
                'secondary-text': '#d1d5db',
                'accent-color': '#fbbf24',
                'accent-hover': '#f59e0b',
                'success-color': '#10b981',
                'warning-color': '#f59e0b',
                'error-color': '#ef4444',
                'border-color': '#4b5563',
                'shadow-color': 'rgba(0, 0, 0, 0.25)',
                'card-bg': '#1f2937',
                'input-bg': '#374151',
                'button-primary-bg': '#fbbf24',
                'button-primary-text': '#111827',
                'button-secondary-bg': '#4b5563',
                'button-secondary-text': '#d1d5db'
            }
        };

        return themes[themeName] || themes['developer-light'];
    }

    /**
     * Detect semantic components in the DOM
     */
    detectSemanticComponents() {
        const selectors = {
            'button': 'button, .btn, [role="button"]',
            'card': '.card, .dashboard-card, .widget',
            'input': 'input, textarea, select',
            'navigation': 'nav, .navbar, .sidebar',
            'table': 'table, .table',
            'modal': '.modal, .dialog, [role="dialog"]',
            'alert': '.alert, .notification, .toast',
            'progress': '.progress, .progress-bar',
            'badge': '.badge, .tag, .label'
        };

        Object.entries(selectors).forEach(([componentType, selector]) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.semanticComponents.set(element, componentType);
                this.applyComponentSkin(element, componentType);
            });
        });

        // Watch for new components
        this.observeNewComponents();
    }

    /**
     * Observe for new components being added
     */
    observeNewComponents() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.detectSemanticComponents();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Apply skin to a specific component
     */
    applyComponentSkin(element, componentType) {
        const skin = this.customSkins[componentType];
        if (!skin) return;

        // Apply custom skin while preserving layout
        Object.entries(skin).forEach(([property, value]) => {
            if (property.startsWith('--')) {
                element.style.setProperty(property, value);
            } else {
                element.style[property] = value;
            }
        });
    }

    /**
     * Apply all custom skins
     */
    applyCustomSkins() {
        this.semanticComponents.forEach((componentType, element) => {
            this.applyComponentSkin(element, componentType);
        });
    }

    /**
     * Setup skin upload functionality
     */
    setupSkinUpload() {
        const uploadArea = document.getElementById('skin-upload-area');
        if (!uploadArea) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleSkinUpload(e.dataTransfer.files);
        });

        const fileInput = document.getElementById('skin-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleSkinUpload(e.target.files);
            });
        }
    }

    /**
     * Handle skin file upload
     */
    handleSkinUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const skin = JSON.parse(e.target.result);
                        this.uploadCustomSkin(skin);
                    } catch (error) {
                        this.showNotification('Invalid skin file format', 'error');
                    }
                };
                reader.readAsText(file);
            } else if (file.type === 'text/css') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadCustomCSS(e.target.result);
                };
                reader.readAsText(file);
            }
        });
    }

    /**
     * Upload custom skin JSON
     */
    uploadCustomSkin(skin) {
        if (skin.componentType && skin.styles) {
            this.customSkins[skin.componentType] = skin.styles;
            this.applyCustomSkins();
            this.showNotification(`Skin applied for ${skin.componentType}`, 'success');
        }
    }

    /**
     * Upload custom CSS
     */
    uploadCustomCSS(css) {
        const styleId = 'custom-skin-css';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = css;
        this.showNotification('Custom CSS applied', 'success');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme switcher
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('change', (e) => {
                this.loadTheme(e.target.value);
            });
        }

        // Theme preview buttons
        document.querySelectorAll('.theme-preview').forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.loadTheme(theme);
            });
        });

        // Skin reset button
        const resetSkinsBtn = document.getElementById('reset-skins');
        if (resetSkinsBtn) {
            resetSkinsBtn.addEventListener('click', () => {
                this.resetCustomSkins();
            });
        }
    }

    /**
     * Reset all custom skins
     */
    resetCustomSkins() {
        this.customSkins = {};
        this.semanticComponents.forEach((componentType, element) => {
            // Reset to theme defaults
            const themeVars = this.getThemeVariables(this.currentTheme);
            Object.keys(themeVars).forEach(key => {
                element.style.removeProperty(`--${key}`);
            });
        });
        
        // Remove custom CSS
        const customCSS = document.getElementById('custom-skin-css');
        if (customCSS) {
            customCSS.remove();
        }
        
        this.showNotification('All custom skins reset', 'success');
    }

    /**
     * Update theme UI elements
     */
    updateThemeUI() {
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.value = this.currentTheme;
        }

        // Update theme preview buttons
        document.querySelectorAll('.theme-preview').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.theme === this.currentTheme) {
                button.classList.add('active');
            }
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Export current theme configuration
     */
    exportThemeConfig() {
        const config = {
            currentTheme: this.currentTheme,
            customSkins: this.customSkins,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aibos-theme-${this.currentTheme}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import theme configuration
     */
    importThemeConfig(config) {
        if (config.currentTheme) {
            this.loadTheme(config.currentTheme);
        }
        
        if (config.customSkins) {
            this.customSkins = { ...this.customSkins, ...config.customSkins };
            this.applyCustomSkins();
        }
        
        this.showNotification('Theme configuration imported', 'success');
    }

    /**
     * Get theme information
     */
    getThemeInfo(themeName) {
        return this.availableThemes[themeName] || null;
    }

    /**
     * Get all available themes
     */
    getAllThemes() {
        return this.availableThemes;
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize template system
const templateSystem = new TemplateSystem();

// Export for global access
window.TemplateSystem = templateSystem; 