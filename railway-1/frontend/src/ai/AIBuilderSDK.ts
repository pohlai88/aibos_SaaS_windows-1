// ==================== AI BUILDER SDK - STEVE JOBS PHASE 2 ====================
// **"Everyone becomes a creator"** - Natural language → Working apps

import { AppManifest, manifestLoader } from '../runtime/ManifestLoader';

// ==================== TYPES ====================
export interface PromptRequest {
  prompt: string;
  context?: {
    userRole?: string;
    businessDomain?: string;
    existingApps?: string[];
    preferences?: {
      theme?: 'light' | 'dark' | 'auto';
      complexity?: 'simple' | 'moderate' | 'advanced';
      style?: 'minimal' | 'modern' | 'classic';
    };
  };
}

export interface PromptResponse {
  success: boolean;
  manifest?: AppManifest;
  components?: GeneratedComponent[];
  workflows?: GeneratedWorkflow[];
  suggestions?: string[];
  error?: string;
  confidence: number; // 0-1
  reasoning: string;
}

export interface GeneratedComponent {
  name: string;
  type: 'form' | 'list' | 'chart' | 'dashboard' | 'modal' | 'custom';
  props: Record<string, any>;
  children?: GeneratedComponent[];
  validation?: ValidationRule[];
  styling?: StyleDefinition;
}

export interface GeneratedWorkflow {
  name: string;
  steps: WorkflowStep[];
  triggers: string[];
  conditions?: ConditionRule[];
}

export interface WorkflowStep {
  id: string;
  type: 'api_call' | 'data_transform' | 'ui_action' | 'condition' | 'notification';
  action: string;
  parameters: Record<string, any>;
  next?: string;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface StyleDefinition {
  theme: 'light' | 'dark' | 'auto';
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  layout?: 'grid' | 'flex' | 'stack';
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'validate';
}

// ==================== PROMPT TEMPLATES ====================
const PROMPT_TEMPLATES = {
  FORM: "Create a form to {action} with fields for {fields}",
  LIST: "Build a list view to display {items} with {features}",
  DASHBOARD: "Design a dashboard showing {metrics} with {visualizations}",
  WORKFLOW: "Create a workflow that {process} when {trigger}",
  INTEGRATION: "Connect {source} to {destination} to {purpose}",
};

// ==================== AI BUILDER SDK CLASS ====================
export class AIBuilderSDK {
  private static instance: AIBuilderSDK;
  private promptHistory: PromptRequest[] = [];
  private generatedApps: Map<string, AppManifest> = new Map();

  static getInstance(): AIBuilderSDK {
    if (!AIBuilderSDK.instance) {
      AIBuilderSDK.instance = new AIBuilderSDK();
    }
    return AIBuilderSDK.instance;
  }

  // ==================== CORE METHODS ====================

  /**
   * Generate app from natural language prompt
   * Steve Jobs Philosophy: "Make it simple, make it work"
   */
  async generateFromPrompt(request: PromptRequest): Promise<PromptResponse> {
    try {
      console.log(`🤖 AI Builder: Processing prompt: "${request.prompt}"`);

      // Analyze prompt intent
      const intent = this.analyzePromptIntent(request.prompt);

      // Generate manifest based on intent
      const manifest = await this.generateManifest(intent, request.context);

      // Generate components
      const components = await this.generateComponents(intent, manifest);

      // Generate workflows
      const workflows = await this.generateWorkflows(intent, manifest);

      // Calculate confidence
      const confidence = this.calculateConfidence(intent, manifest, components);

      // Generate suggestions
      const suggestions = this.generateSuggestions(intent, manifest);

      // Store in history
      this.promptHistory.push(request);
      this.generatedApps.set(manifest.app_id, manifest);

      return {
        success: true,
        manifest,
        components,
        workflows,
        suggestions,
        confidence,
        reasoning: this.generateReasoning(intent, manifest),
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0,
        reasoning: 'Failed to process prompt',
      };
    }
  }

  /**
   * Analyze prompt intent
   * Steve Jobs Philosophy: "Think different"
   */
  private analyzePromptIntent(prompt: string) {
    const lowerPrompt = prompt.toLowerCase();

    // Detect app type
    let appType = 'custom';
    if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
      appType = 'form';
    } else if (lowerPrompt.includes('list') || lowerPrompt.includes('table')) {
      appType = 'list';
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('chart')) {
      appType = 'dashboard';
    } else if (lowerPrompt.includes('workflow') || lowerPrompt.includes('process')) {
      appType = 'workflow';
    }

    // Detect business domain
    let domain = 'general';
    if (lowerPrompt.includes('customer') || lowerPrompt.includes('contact')) {
      domain = 'crm';
    } else if (lowerPrompt.includes('order') || lowerPrompt.includes('product')) {
      domain = 'ecommerce';
    } else if (lowerPrompt.includes('employee') || lowerPrompt.includes('hr')) {
      domain = 'hr';
    } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('invoice')) {
      domain = 'finance';
    }

    // Extract entities
    const entities = this.extractEntities(prompt);

    return {
      appType,
      domain,
      entities,
      complexity: this.assessComplexity(prompt),
      features: this.extractFeatures(prompt),
    };
  }

  /**
   * Generate manifest from intent
   * Steve Jobs Philosophy: "Quality is more important than quantity"
   */
  private async generateManifest(intent: any, context?: any): Promise<AppManifest> {
    const appId = this.generateAppId(intent.domain, intent.appType);
    const name = this.generateAppName(intent);
    const permissions = this.determinePermissions(intent);

    return {
      app_id: appId,
      name,
      version: '1.0.0',
      description: this.generateDescription(intent),
      author: context?.userRole || 'AI-BOS Builder',
      ui: `components/${intent.appType}`,
      data_model: intent.domain !== 'general' ? `models/${intent.domain}.json` : undefined,
      permissions,
      theme: context?.preferences?.theme || 'auto',
      entry: 'App.tsx',
      dependencies: this.determineDependencies(intent),
      metadata: {
        category: intent.domain.toUpperCase(),
        tags: this.generateTags(intent),
        icon: this.generateIcon(intent),
      },
      lifecycle: {
        onMount: 'initializeApp',
        onError: 'handleError',
        onDestroy: 'cleanup',
      },
      security: {
        sandboxed: true,
        allowedDomains: ['api.aibos.com'],
        maxMemory: 50,
        timeout: 5000,
      },
    };
  }

  /**
   * Generate components from intent
   * Steve Jobs Philosophy: "Design is how it works"
   */
  private async generateComponents(intent: any, manifest: AppManifest): Promise<GeneratedComponent[]> {
    const components: GeneratedComponent[] = [];

    switch (intent.appType) {
      case 'form':
        components.push(this.generateFormComponent(intent, manifest));
        break;
      case 'list':
        components.push(this.generateListComponent(intent, manifest));
        break;
      case 'dashboard':
        components.push(this.generateDashboardComponent(intent, manifest));
        break;
      default:
        components.push(this.generateCustomComponent(intent, manifest));
    }

    return components;
  }

  /**
   * Generate workflows from intent
   * Steve Jobs Philosophy: "Automation is the future"
   */
  private async generateWorkflows(intent: any, manifest: AppManifest): Promise<GeneratedWorkflow[]> {
    const workflows: GeneratedWorkflow[] = [];

    // Generate data workflows
    if (intent.entities.includes('save') || intent.entities.includes('submit')) {
      workflows.push({
        name: 'Data Submission',
        steps: [
          {
            id: 'validate',
            type: 'data_transform',
            action: 'validate_form',
            parameters: { formId: 'main-form' },
            next: 'save'
          },
          {
            id: 'save',
            type: 'api_call',
            action: 'save_data',
            parameters: { endpoint: '/api/data', method: 'POST' },
            next: 'notify'
          },
          {
            id: 'notify',
            type: 'notification',
            action: 'show_success',
            parameters: { message: 'Data saved successfully' }
          }
        ],
        triggers: ['form_submit'],
      });
    }

    return workflows;
  }

  // ==================== COMPONENT GENERATORS ====================

  /**
   * Generate form component
   * Steve Jobs Philosophy: "User experience is everything"
   */
  private generateFormComponent(intent: any, manifest: AppManifest): GeneratedComponent {
    const fields = this.extractFormFields(intent);

    return {
      name: 'MainForm',
      type: 'form',
      props: {
        title: manifest.name,
        submitLabel: 'Submit',
        resetLabel: 'Reset',
      },
      children: fields.map(field => ({
        name: field.name,
        type: 'input',
        props: {
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          required: field.required,
        },
        validation: field.validation,
      })),
      styling: {
        theme: manifest.theme || 'auto',
        layout: 'stack',
        spacing: 'comfortable',
      },
    };
  }

  /**
   * Generate list component
   * Steve Jobs Philosophy: "Information architecture matters"
   */
  private generateListComponent(intent: any, manifest: AppManifest): GeneratedComponent {
    return {
      name: 'DataList',
      type: 'list',
      props: {
        title: manifest.name,
        searchable: true,
        sortable: true,
        pagination: true,
        itemsPerPage: 10,
      },
      children: this.extractListColumns(intent).map(column => ({
        name: column.name,
        type: 'column',
        props: {
          header: column.label,
          field: column.field,
          sortable: column.sortable,
          filterable: column.filterable,
        },
      })),
      styling: {
        theme: manifest.theme || 'auto',
        layout: 'grid',
        spacing: 'compact',
      },
    };
  }

  /**
   * Generate dashboard component
   * Steve Jobs Philosophy: "Visual design is communication"
   */
  private generateDashboardComponent(intent: any, manifest: AppManifest): GeneratedComponent {
    return {
      name: 'MainDashboard',
      type: 'dashboard',
      props: {
        title: manifest.name,
        refreshInterval: 30000,
        layout: 'grid',
      },
      children: this.extractDashboardWidgets(intent).map(widget => ({
        name: widget.name,
        type: widget.type,
        props: {
          title: widget.title,
          data: widget.data,
          size: widget.size,
        },
      })),
      styling: {
        theme: manifest.theme || 'auto',
        layout: 'grid',
        spacing: 'comfortable',
      },
    };
  }

  /**
   * Generate custom component
   * Steve Jobs Philosophy: "Innovation distinguishes leaders"
   */
  private generateCustomComponent(intent: any, manifest: AppManifest): GeneratedComponent {
    return {
      name: 'CustomApp',
      type: 'custom',
      props: {
        title: manifest.name,
        description: manifest.description,
      },
      children: [],
      styling: {
        theme: manifest.theme || 'auto',
        layout: 'flex',
        spacing: 'comfortable',
      },
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Extract entities from prompt
   * Steve Jobs Philosophy: "Attention to detail"
   */
  private extractEntities(prompt: string): string[] {
    const entities: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Common entities
    const commonEntities = [
      'save', 'load', 'create', 'edit', 'delete', 'view', 'search', 'filter',
      'sort', 'export', 'import', 'validate', 'submit', 'cancel', 'reset'
    ];

    commonEntities.forEach(entity => {
      if (lowerPrompt.includes(entity)) {
        entities.push(entity);
      }
    });

    return entities;
  }

  /**
   * Assess complexity of prompt
   * Steve Jobs Philosophy: "Simplicity is the ultimate sophistication"
   */
  private assessComplexity(prompt: string): 'simple' | 'moderate' | 'advanced' {
    const wordCount = prompt.split(' ').length;
    const hasComplexTerms = /workflow|integration|automation|api|database/i.test(prompt);

    if (wordCount < 10 && !hasComplexTerms) return 'simple';
    if (wordCount < 20 || hasComplexTerms) return 'moderate';
    return 'advanced';
  }

  /**
   * Extract features from prompt
   * Steve Jobs Philosophy: "Focus on what matters"
   */
  private extractFeatures(prompt: string): string[] {
    const features: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('search')) features.push('search');
    if (lowerPrompt.includes('filter')) features.push('filter');
    if (lowerPrompt.includes('sort')) features.push('sort');
    if (lowerPrompt.includes('export')) features.push('export');
    if (lowerPrompt.includes('import')) features.push('import');
    if (lowerPrompt.includes('chart')) features.push('charts');
    if (lowerPrompt.includes('notification')) features.push('notifications');

    return features;
  }

  /**
   * Generate app ID
   * Steve Jobs Philosophy: "Naming is important"
   */
  private generateAppId(domain: string, appType: string): string {
    const timestamp = Date.now().toString(36);
    return `${domain}.${appType}.${timestamp}`;
  }

  /**
   * Generate app name
   * Steve Jobs Philosophy: "Branding matters"
   */
  private generateAppName(intent: any): string {
    const domainNames = {
      crm: 'Customer',
      ecommerce: 'Product',
      hr: 'Employee',
      finance: 'Financial',
      general: 'Business'
    };

    const typeNames = {
      form: 'Form',
      list: 'Manager',
      dashboard: 'Dashboard',
      workflow: 'Workflow',
      custom: 'App'
    };

    const domainName = domainNames[intent.domain] || 'Business';
    const typeName = typeNames[intent.appType] || 'App';

    return `${domainName} ${typeName}`;
  }

  /**
   * Determine permissions based on intent
   * Steve Jobs Philosophy: "Security by design"
   */
  private determinePermissions(intent: any): string[] {
    const permissions: string[] = [];

    // Base permissions
    permissions.push('ui.modal', 'ui.toast');

    // Domain-specific permissions
    switch (intent.domain) {
      case 'crm':
        permissions.push('read.contacts', 'write.contacts');
        break;
      case 'ecommerce':
        permissions.push('read.products', 'write.products', 'read.orders');
        break;
      case 'hr':
        permissions.push('read.users', 'write.users');
        break;
      case 'finance':
        permissions.push('read.analytics', 'write.analytics');
        break;
    }

    // Feature-specific permissions
    if (intent.features.includes('notifications')) {
      permissions.push('system.notifications');
    }

    return permissions;
  }

  /**
   * Determine dependencies
   * Steve Jobs Philosophy: "Keep it simple"
   */
  private determineDependencies(intent: any): string[] {
    const dependencies = ['@aibos/ui-components'];

    if (intent.domain !== 'general') {
      dependencies.push('@aibos/data-layer');
    }

    if (intent.features.includes('charts')) {
      dependencies.push('@aibos/charts');
    }

    return dependencies;
  }

  /**
   * Generate description
   * Steve Jobs Philosophy: "Communication is key"
   */
  private generateDescription(intent: any): string {
    return `AI-generated ${intent.appType} for ${intent.domain} management. Built with natural language processing.`;
  }

  /**
   * Generate tags
   * Steve Jobs Philosophy: "Organization matters"
   */
  private generateTags(intent: any): string[] {
    return [intent.domain, intent.appType, 'ai-generated', ...intent.features];
  }

  /**
   * Generate icon
   * Steve Jobs Philosophy: "Visual design is communication"
   */
  private generateIcon(intent: any): string {
    const icons = {
      form: '/icons/form.svg',
      list: '/icons/list.svg',
      dashboard: '/icons/dashboard.svg',
      workflow: '/icons/workflow.svg',
      custom: '/icons/app.svg',
    };

    return icons[intent.appType] || icons.custom;
  }

  /**
   * Extract form fields
   * Steve Jobs Philosophy: "User experience is everything"
   */
  private extractFormFields(intent: any): any[] {
    // This would use NLP to extract field information
    // For now, return common fields based on domain
    const commonFields = {
      crm: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'company', label: 'Company', type: 'text' },
      ],
      ecommerce: [
        { name: 'title', label: 'Product Title', type: 'text', required: true },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'select' },
      ],
      hr: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'department', label: 'Department', type: 'select' },
      ],
    };

    return commonFields[intent.domain] || [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ];
  }

  /**
   * Extract list columns
   * Steve Jobs Philosophy: "Information architecture matters"
   */
  private extractListColumns(intent: any): any[] {
    const commonColumns = {
      crm: [
        { name: 'name', label: 'Name', field: 'name', sortable: true, filterable: true },
        { name: 'email', label: 'Email', field: 'email', sortable: true, filterable: true },
        { name: 'company', label: 'Company', field: 'company', sortable: true, filterable: true },
        { name: 'actions', label: 'Actions', field: 'actions', sortable: false, filterable: false },
      ],
      ecommerce: [
        { name: 'title', label: 'Product', field: 'title', sortable: true, filterable: true },
        { name: 'price', label: 'Price', field: 'price', sortable: true, filterable: false },
        { name: 'category', label: 'Category', field: 'category', sortable: true, filterable: true },
        { name: 'actions', label: 'Actions', field: 'actions', sortable: false, filterable: false },
      ],
    };

    return commonColumns[intent.domain] || [
      { name: 'title', label: 'Title', field: 'title', sortable: true, filterable: true },
      { name: 'created', label: 'Created', field: 'created', sortable: true, filterable: false },
      { name: 'actions', label: 'Actions', field: 'actions', sortable: false, filterable: false },
    ];
  }

  /**
   * Extract dashboard widgets
   * Steve Jobs Philosophy: "Visual design is communication"
   */
  private extractDashboardWidgets(intent: any): any[] {
    return [
      { name: 'SummaryCard', type: 'card', title: 'Summary', data: 'summary', size: 'small' },
      { name: 'ChartWidget', type: 'chart', title: 'Analytics', data: 'analytics', size: 'medium' },
      { name: 'RecentActivity', type: 'list', title: 'Recent Activity', data: 'activity', size: 'large' },
    ];
  }

  /**
   * Calculate confidence score
   * Steve Jobs Philosophy: "Quality is more important than quantity"
   */
  private calculateConfidence(intent: any, manifest: AppManifest, components: GeneratedComponent[]): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for clear intent
    if (intent.appType !== 'custom') confidence += 0.2;
    if (intent.domain !== 'general') confidence += 0.1;
    if (components.length > 0) confidence += 0.1;
    if (manifest.permissions.length > 0) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning
   * Steve Jobs Philosophy: "Transparency builds trust"
   */
  private generateReasoning(intent: any, manifest: AppManifest): string {
    return `Generated ${intent.appType} app for ${intent.domain} domain with ${manifest.permissions.length} permissions. Confidence: ${this.calculateConfidence(intent, manifest, []) * 100}%`;
  }

  /**
   * Generate suggestions
   * Steve Jobs Philosophy: "Always be helpful"
   */
  private generateSuggestions(intent: any, manifest: AppManifest): string[] {
    const suggestions: string[] = [];

    if (intent.complexity === 'simple') {
      suggestions.push('Consider adding search functionality');
      suggestions.push('Add data validation rules');
    }

    if (intent.domain === 'crm') {
      suggestions.push('Add contact import/export features');
      suggestions.push('Integrate with email system');
    }

    return suggestions;
  }

  // ==================== PUBLIC API ====================

  /**
   * Get prompt history
   */
  getPromptHistory(): PromptRequest[] {
    return [...this.promptHistory];
  }

  /**
   * Get generated apps
   */
  getGeneratedApps(): AppManifest[] {
    return Array.from(this.generatedApps.values());
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.promptHistory = [];
    this.generatedApps.clear();
  }
}

// ==================== EXPORT SINGLETON ====================
export const aiBuilderSDK = AIBuilderSDK.getInstance();

// ==================== EXAMPLE USAGE ====================
export const EXAMPLE_PROMPTS = [
  "Create a form to collect customer contact information",
  "Build a dashboard showing sales analytics with charts",
  "Make a list view to manage product inventory",
  "Create a workflow to process customer orders",
  "Build a form to onboard new employees",
];
