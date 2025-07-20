import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface BusinessContext {
  userRole: UserRole;
  workflowStage: WorkflowStage;
  entityType: EntityType;
  permissions: Permission[];
  tenantId?: string;
  region?: string;
  environment: 'development' | 'staging' | 'production'
}

interface UserRole {
  id: string;
  name: string;
  level: 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[]
}

interface WorkflowStage {
  id: string;
  name: string;
  phase: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean
}

interface EntityType {
  id: string;
  name: string;
  category: 'franchise' | 'outlet' | 'hq' | 'partner' | 'customer';
  hasChildren: boolean;
  parentId?: string
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'publish';
  granted: boolean
}

interface ContextAdaptation {
  type: 'visibility' | 'behavior' | 'styling' | 'data' | 'validation';
  condition: ContextCondition;
  action: ContextAction;
  priority: number
}

interface ContextCondition {
  userRole?: string[];
  workflowStage?: string[];
  entityType?: string[];
  permissions?: string[];
  custom?: (context: BusinessContext) => boolean
}

interface ContextAction {
  type: 'show' | 'hide' | 'disable' | 'enable' | 'modify' | 'custom';
  value?: any;
  custom?: (props: any,
  context: BusinessContext) => any
}

interface ContextAwareContextType {
  // Context management
  businessContext: BusinessContext;
  updateContext: (updates: Partial<BusinessContext>) => void;
  setUserRole: (role: UserRole) => void;
  setWorkflowStage: (stage: WorkflowStage) => void;
  setEntityType: (entity: EntityType) => void;

  // Adaptation system
  registerAdaptation: (componentId: string,
  adaptation: ContextAdaptation) => void;
  unregisterAdaptation: (componentId: string,
  adaptationId: string) => void;
  getAdaptations: (componentId: string) => ContextAdaptation[];

  // Permission checking
  hasPermission: (permission: string) => boolean;
  canPerformAction: (resource: string,
  action: string) => boolean;

  // Context-aware utilities
  getContextualValue: <T>(values: Record<string, T>, defaultValue: T) => T;
  getContextualProps: (baseProps: any,
  adaptations: ContextAdaptation[]) => any
}

// Default business context
const DEFAULT_BUSINESS_CONTEXT: BusinessContext = {
  userRole: {
    id: 'user',
  name: 'Standard User',
    level: 'user',
  permissions: ['read']
  },
  workflowStage: {
    id: 'draft',
  name: 'Draft',
    phase: 'draft',
  canEdit: true,
    canDelete: true,
  canPublish: false
  },
  entityType: {
    id: 'outlet',
  name: 'Outlet',
    category: 'outlet',
  hasChildren: false
  },
  permissions: [
    { id: 'read',
  name: 'Read', resource: '*',
  action: 'read', granted: true },
    { id: 'create',
  name: 'Create', resource: '*',
  action: 'create', granted: false },
    { id: 'update',
  name: 'Update', resource: '*',
  action: 'update', granted: false },
    { id: 'delete',
  name: 'Delete', resource: '*',
  action: 'delete', granted: false }
  ],
  environment: 'development'
};

// Context adaptation engine
class ContextAdaptationEngine {
  private adaptations: Map<string, ContextAdaptation[]> = new Map();

  registerAdaptation(componentId: string,
  adaptation: ContextAdaptation): void {
    if (!this.adaptations.has(componentId)) {
      this.adaptations.set(componentId, [])
}

    const componentAdaptations = this.adaptations.get(componentId)!;
    componentAdaptations.push(adaptation);

    // Sort by priority (higher priority first)
    componentAdaptations.sort((a, b) => b.priority - a.priority)
}

  unregisterAdaptation(componentId: string,
  adaptationId: string): void {
    const componentAdaptations = this.adaptations.get(componentId);
    if (componentAdaptations) {
      const index = componentAdaptations.findIndex(a => a.id === adaptationId);
      if (index !== -1) {
        componentAdaptations.splice(index, 1)
}
    }
  }

  getAdaptations(componentId: string): ContextAdaptation[] {
    return this.adaptations.get(componentId) || []
}

  evaluateCondition(condition: ContextCondition,
  context: BusinessContext): boolean {
    // Check user role
    if (condition.userRole && !condition.userRole.includes(context.userRole.id)) {
      return false
}

    // Check workflow stage
    if (condition.workflowStage && !condition.workflowStage.includes(context.workflowStage.id)) {
      return false
}

    // Check entity type
    if (condition.entityType && !condition.entityType.includes(context.entityType.id)) {
      return false
}

    // Check permissions
    if (condition.permissions) {
      const hasAllPermissions = condition.permissions.every(permission =>
        context.permissions.some(p => p.id === permission && p.granted)
      );
      if (!hasAllPermissions) {
        return false
}
    }

    // Check custom condition
    if (condition.custom && !condition.custom(context)) {
      return false
}

    return true
}

  applyAdaptations(props: any,
  adaptations: ContextAdaptation[], context: BusinessContext): any {
    let adaptedProps = { ...props };

    adaptations.forEach(adaptation => {
      if (this.evaluateCondition(adaptation.condition, context)) {
        adaptedProps = this.applyAction(adaptedProps, adaptation.action, context)
}
    });

    return adaptedProps
}

  private applyAction(props: any,
  action: ContextAction, context: BusinessContext): any {
    switch (action.type) {
      case 'show':
        return { ...props, hidden: false,
  disabled: false };

      case 'hide':
        return { ...props, hidden: true };

      case 'disable':
        return { ...props, disabled: true };

      case 'enable':
        return { ...props, disabled: false };

      case 'modify':
        return { ...props, ...action.value };

      case 'custom':
        if (action.custom) {
          return action.custom(props, context)
}
        return props;

      default:
        return props
}
  }
}

// Context
const ContextAwareContext = createContext<ContextAwareContextType | null>(null);

// Provider Component
interface ContextAwareProviderProps {
  children: ReactNode;
  initialContext?: Partial<BusinessContext>;
  enableAuditTrail?: boolean
}

export const ContextAwareProvider: React.FC<ContextAwareProviderProps> = ({
  children,
  initialContext = {},
  enableAuditTrail = true
}) => {
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    ...DEFAULT_BUSINESS_CONTEXT,
    ...initialContext
  });

  const adaptationEngine = useRef(new ContextAdaptationEngine());

  const updateContext = (updates: Partial<BusinessContext>) => {
    setBusinessContext(prev => ({ ...prev, ...updates }));

    if (enableAuditTrail) {
      auditLogger.info('Business context updated', { updates })
}
  };

  const setUserRole = (role: UserRole) => {
    updateContext({ userRole: role })
};

  const setWorkflowStage = (stage: WorkflowStage) => {
    updateContext({ workflowStage: stage })
};

  const setEntityType = (entity: EntityType) => {
    updateContext({ entityType: entity })
};

  const registerAdaptation = (componentId: string,
  adaptation: ContextAdaptation) => {
    adaptationEngine.current.registerAdaptation(componentId, adaptation);

    if (enableAuditTrail) {
      auditLogger.info('Context adaptation registered', { componentId, adaptation })
}
  };

  const unregisterAdaptation = (componentId: string,
  adaptationId: string) => {
    adaptationEngine.current.unregisterAdaptation(componentId, adaptationId)
};

  const getAdaptations = (componentId: string): ContextAdaptation[] => {
    return adaptationEngine.current.getAdaptations(componentId)
};

  const hasPermission = (permission: string): boolean => {
    return businessContext.permissions.some(p => p.id === permission && p.granted)
};

  const canPerformAction = (resource: string,
  action: string): boolean => {
    return businessContext.permissions.some(p =>
      (p.resource === resource || p.resource === '*') &&
      p.action === action &&
      p.granted
    )
};

  const getContextualValue = <T,>(values: Record<string, T>, defaultValue: T): T => {
    // Try to find a value based on current context
    const contextKey = `${businessContext.userRole.id}-${businessContext.entityType.id}`;
    if (values[contextKey]) return values[contextKey];

    const roleKey = businessContext.userRole.id;
    if (values[roleKey]) return values[roleKey];

    const entityKey = businessContext.entityType.id;
    if (values[entityKey]) return values[entityKey];

    return defaultValue
};

  const getContextualProps = (baseProps: any,
  adaptations: ContextAdaptation[]): any => {
    return adaptationEngine.current.applyAdaptations(baseProps, adaptations, businessContext)
};

  const value: ContextAwareContextType = {
    businessContext,
    updateContext,
    setUserRole,
    setWorkflowStage,
    setEntityType,
    registerAdaptation,
    unregisterAdaptation,
    getAdaptations,
    hasPermission,
    canPerformAction,
    getContextualValue,
    getContextualProps
  };

  return (
    <ContextAwareContext.Provider value={value}>
      {children}
    </ContextAwareContext.Provider>
  )
};

// Hook
export const useContextAware = () => {
  const context = useContext(ContextAwareContext);
  if (!context) {
    throw new Error('useContextAware must be used within ContextAwareProvider')
}
  return context
};

// HOC for context-aware components
export const withContextAware = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentId: string;
    adaptations?: ContextAdaptation[];
    enablePermissions?: boolean
}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      businessContext,
      registerAdaptation,
      getAdaptations,
      hasPermission,
      canPerformAction,
      getContextualProps
    } = useContextAware();

    const [adaptations, setAdaptations] = useState<ContextAdaptation[]>(options.adaptations || []);

    useEffect(() => {
      // Register default adaptations
      options.adaptations?.forEach(adaptation => {
        registerAdaptation(options.componentId, adaptation)
})
}, []);

    // Get all adaptations for this component
    const allAdaptations = getAdaptations(options.componentId);

    // Apply context-aware adaptations
    const contextualProps = getContextualProps(props, allAdaptations);

    // Check permissions if enabled
    if (options.enablePermissions) {
      const requiredPermission = props['data-permission'] as string;
      if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
          <div style={{
            padding: '20px',
  textAlign: 'center',
            background: '#f8f9fa',
  borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div>Access Denied</div>
            <small>You don't have permission to view this component</small>
          </div>
        )
}
    }

    return <Component {...contextualProps} />
};

  WrappedComponent.displayName = `withContextAware(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Context-aware Data Table Component
export const ContextAwareDataTable: React.FC<{
  data: any[];
  columns: any[];
  enableContextualActions?: boolean
}> = ({ data, columns, enableContextualActions = true }) => {
  const {
    businessContext,
    canPerformAction,
    getContextualValue
  } = useContextAware();

  // Contextual columns based on user role and entity type
  const contextualColumns = columns.filter(column => {
    if (column.contextual) {
      return column.contextual.roles?.includes(businessContext.userRole.id) ||
             column.contextual.entities?.includes(businessContext.entityType.id)
}
    return true
});

  // Contextual actions
  const getContextualActions = (row: any) => {
    if (!enableContextualActions) return [];

    const actions = [];

    if (canPerformAction('data', 'update')) {
      actions.push({ label: 'Edit',
  action: 'edit', icon: '✏️' })
}

    if (canPerformAction('data', 'delete') && businessContext.workflowStage.canDelete) {
      actions.push({ label: 'Delete',
  action: 'delete', icon: '🗑️' })
}

    if (canPerformAction('data', 'publish') && businessContext.workflowStage.canPublish) {
      actions.push({ label: 'Publish',
  action: 'publish', icon: '📤' })
}

    return actions
};

  // Contextual styling
  const tableStyle = getContextualValue({
    'admin': { background: '#f8f9fa',
  border: '2px solid #007bff' },
    'manager': { background: '#fff3cd',
  border: '1px solid #ffc107' },
    'user': { background: '#ffffff',
  border: '1px solid #dee2e6' }
  }, { background: '#ffffff',
  border: '1px solid #dee2e6' });

  return (
    <div style={{
      ...tableStyle,
      borderRadius: '8px',
  padding: '20px'
    }}>
      <h3>Data Table - {businessContext.entityType.name}</h3>
      <p>Role: {businessContext.userRole.name} | Stage: {businessContext.workflowStage.name}</p>

      <table style={{ width: '100%',
  borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {contextualColumns.map((column, index) => (
              <th key={index} style={{
                padding: '12px',
  borderBottom: '2px solid #dee2e6',
                textAlign: 'left'
              }}>
                {column.header}
              </th>
            ))}
            {enableContextualActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {contextualColumns.map((column, colIndex) => (
                <td key={colIndex} style={{
                  padding: '12px',
  borderBottom: '1px solid #dee2e6'
                }}>
                  {row[column.key]}
                </td>
              ))}
              {enableContextualActions && (
                <td style={{ padding: '12px',
  borderBottom: '1px solid #dee2e6' }}>
                  {getContextualActions(row).map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      style={{
                        background: 'none',
  border: 'none',
                        cursor: 'pointer',
  marginRight: '8px',
                        fontSize: '16px'
                      }}
                      title={action.label}
                    >
                      {action.icon}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

// Context Dashboard Component
export const ContextDashboard: React.FC = () => {
  const { businessContext, updateContext } = useContextAware();

  const userRoles: UserRole[] = [
    { id: 'admin',
  name: 'Administrator', level: 'admin',
  permissions: ['read', 'create', 'update', 'delete', 'publish'] },
    { id: 'manager',
  name: 'Manager', level: 'manager',
  permissions: ['read', 'create', 'update'] },
    { id: 'user',
  name: 'Standard User', level: 'user',
  permissions: ['read', 'create'] },
    { id: 'viewer',
  name: 'Viewer', level: 'viewer',
  permissions: ['read'] }
  ];

  const workflowStages: WorkflowStage[] = [
    { id: 'draft',
  name: 'Draft', phase: 'draft',
  canEdit: true, canDelete: true,
  canPublish: false },
    { id: 'review',
  name: 'Review', phase: 'review',
  canEdit: false, canDelete: true,
  canPublish: false },
    { id: 'approved',
  name: 'Approved', phase: 'approved',
  canEdit: false, canDelete: false,
  canPublish: true },
    { id: 'published',
  name: 'Published', phase: 'published',
  canEdit: false, canDelete: false,
  canPublish: false }
  ];

  const entityTypes: EntityType[] = [
    { id: 'franchise',
  name: 'Franchise', category: 'franchise',
  hasChildren: true },
    { id: 'outlet',
  name: 'Outlet', category: 'outlet',
  hasChildren: false },
    { id: 'hq',
  name: 'Headquarters', category: 'hq',
  hasChildren: true },
    { id: 'partner',
  name: 'Partner', category: 'partner',
  hasChildren: false }
  ];

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '500px'
    }}>
      <h3>🎯 Context-Aware System</h3>

      <div style={{ marginBottom: '20px' }}>
        <h4>Current Context</h4>
        <div style={{ background: '#333',
  padding: '15px', borderRadius: '4px' }}>
          <div><strong>Role:</strong> {businessContext.userRole.name}</div>
          <div><strong>Stage:</strong> {businessContext.workflowStage.name}</div>
          <div><strong>Entity:</strong> {businessContext.entityType.name}</div>
          <div><strong>Environment:</strong> {businessContext.environment}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Change User Role</h4>
        <select
          value={businessContext.userRole.id}
          onChange={(e) => {
            const role = userRoles.find(r => r.id === e.target.value);
            if (role) updateContext({ userRole: role })
}}
          style={{
            width: '100%',
  padding: '8px',
            background: '#333',
  color: '#fff',
            border: '1px solid #555',
  borderRadius: '4px',
            marginBottom: '10px'
          }}
        >
          {userRoles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Change Workflow Stage</h4>
        <select
          value={businessContext.workflowStage.id}
          onChange={(e) => {
            const stage = workflowStages.find(s => s.id === e.target.value);
            if (stage) updateContext({ workflowStage: stage })
}}
          style={{
            width: '100%',
  padding: '8px',
            background: '#333',
  color: '#fff',
            border: '1px solid #555',
  borderRadius: '4px',
            marginBottom: '10px'
          }}
        >
          {workflowStages.map(stage => (
            <option key={stage.id} value={stage.id}>{stage.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Change Entity Type</h4>
        <select
          value={businessContext.entityType.id}
          onChange={(e) => {
            const entity = entityTypes.find(et => et.id === e.target.value);
            if (entity) updateContext({ entityType: entity })
}}
          style={{
            width: '100%',
  padding: '8px',
            background: '#333',
  color: '#fff',
            border: '1px solid #555',
  borderRadius: '4px'
          }}
        >
          {entityTypes.map(entity => (
            <option key={entity.id} value={entity.id}>{entity.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h4>Permissions</h4>
        <div style={{ display: 'grid',
  gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {businessContext.permissions.map(permission => (
            <div key={permission.id} style={{
              padding: '4px 8px',
  background: permission.granted ? '#28a745' : '#dc3545',
              borderRadius: '4px',
  fontSize: '12px',
              textAlign: 'center'
            }}>
              {permission.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};
