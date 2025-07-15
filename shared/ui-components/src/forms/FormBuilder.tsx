import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { Badge } from '../primitives/Badge';
import { Tooltip } from '../primitives/Tooltip';
import { Progress } from '../primitives/Progress';
import { 
  Plus, 
  Trash, 
  Copy, 
  Eye, 
  EyeOff, 
  Settings, 
  Save,
  Download,
  Upload,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  DragHandle,
  Code,
  Palette,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';

const formBuilderVariants = cva(
  'w-full bg-background border border-border rounded-lg',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        minimal: 'border-0',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'custom';
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  aiFeatures?: {
    smartValidation?: boolean;
    autoComplete?: boolean;
    predictiveDefault?: boolean;
    usageOptimization?: boolean;
  };
  metadata?: {
    category?: string;
    priority?: number;
    usageCount?: number;
    lastModified?: Date;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
  conditional?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
}

export interface FormBuilderProps extends VariantProps<typeof formBuilderVariants> {
  sections: FormSection[];
  onSubmit?: (data: Record<string, any>) => void;
  onSave?: (form: { sections: FormSection[] }) => void;
  onLoad?: (form: { sections: FormSection[] }) => void;
  className?: string;
  
  // Form state
  initialData?: Record<string, any>;
  loading?: boolean;
  error?: string | null;
  
  // Builder mode
  builderMode?: boolean;
  onFieldAdd?: (sectionId: string, field: FormField) => void;
  onFieldUpdate?: (sectionId: string, fieldId: string, field: FormField) => void;
  onFieldDelete?: (sectionId: string, fieldId: string) => void;
  onSectionAdd?: (section: FormSection) => void;
  onSectionUpdate?: (sectionId: string, section: FormSection) => void;
  onSectionDelete?: (sectionId: string) => void;
  
  // AI Features
  aiFeatures?: {
    smartValidation?: boolean;
    autoComplete?: boolean;
    predictiveDefault?: boolean;
    usageOptimization?: boolean;
    formOptimization?: boolean;
    accessibilityEnhancement?: boolean;
  };
  
  // Advanced features
  features?: {
    autoSave?: boolean;
    autoSaveInterval?: number;
    validation?: boolean;
    conditionalLogic?: boolean;
    multiStep?: boolean;
    progressTracking?: boolean;
    exportImport?: boolean;
  };
  
  // Performance
  performance?: {
    enableMemoization?: boolean;
    enableDebouncing?: boolean;
    enableLazyLoading?: boolean;
  };
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  sections,
  onSubmit,
  onSave,
  onLoad,
  className,
  initialData = {},
  loading = false,
  error = null,
  builderMode = false,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onSectionAdd,
  onSectionUpdate,
  onSectionDelete,
  aiFeatures = {},
  features = {},
  performance = {},
  variant = 'default',
  size = 'md',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [usageStats, setUsageStats] = useState<Record<string, { count: number; lastUsed: Date }>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any[]>>({});
  const [showBuilder, setShowBuilder] = useState(false);
  const [dragState, setDragState] = useState<{ isDragging: boolean; draggedId: string | null }>({
    isDragging: false,
    draggedId: null,
  });

  // AI-powered form optimization
  const optimizeForm = useCallback(() => {
    if (!aiFeatures.formOptimization) return;
    
    // Analyze usage patterns and suggest optimizations
    const frequentlyUsed = Object.entries(usageStats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5);
    
    const suggestions = frequentlyUsed.map(([fieldId, stats]) => ({
      fieldId,
      suggestion: `Move ${fieldId} to top based on ${stats.count} uses`,
      priority: stats.count,
    }));
    
    return suggestions;
  }, [aiFeatures.formOptimization, usageStats]);

  // AI-powered smart validation
  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (!field.validation) return null;
    
    // Basic validation
    if (field.required && !value) {
      return `${field.label} is required`;
    }
    
    if (field.validation.minLength && String(value).length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }
    
    if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
      return `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }
    
    if (field.validation.min && Number(value) < field.validation.min) {
      return `${field.label} must be at least ${field.validation.min}`;
    }
    
    if (field.validation.max && Number(value) > field.validation.max) {
      return `${field.label} must be no more than ${field.validation.max}`;
    }
    
    if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
      return `${field.label} format is invalid`;
    }
    
    // AI-powered smart validation
    if (aiFeatures.smartValidation && field.validation.custom) {
      return field.validation.custom(value);
    }
    
    return null;
  }, [aiFeatures.smartValidation]);

  // AI-powered auto-complete suggestions
  const getAutoCompleteSuggestions = useCallback((fieldId: string, value: string) => {
    if (!aiFeatures.autoComplete) return [];
    
    const field = sections
      .flatMap(s => s.fields)
      .find(f => f.id === fieldId);
    
    if (!field) return [];
    
    // Generate suggestions based on field type and usage
    const suggestions: string[] = [];
    
    if (field.type === 'email') {
      suggestions.push('user@example.com', 'admin@company.com', 'support@domain.com');
    } else if (field.type === 'text') {
      const fieldUsage = usageStats[fieldId];
      if (fieldUsage && fieldUsage.count > 5) {
        suggestions.push('Frequently used value', 'Common input', 'Popular choice');
      }
    }
    
    return suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));
  }, [aiFeatures.autoComplete, sections, usageStats]);

  // Handle field value changes
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Update usage stats
    setUsageStats(prev => ({
      ...prev,
      [fieldId]: {
        count: (prev[fieldId]?.count || 0) + 1,
        lastUsed: new Date(),
      },
    }));
    
    // Validate field
    const field = sections
      .flatMap(s => s.fields)
      .find(f => f.id === fieldId);
    
    if (field) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: error || '',
      }));
    }
    
    // Auto-save
    if (features.autoSave) {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        onSave?.({ sections });
        setAutoSaveStatus('saved');
      }, features.autoSaveInterval || 2000);
    }
  }, [sections, validateField, features.autoSave, features.autoSaveInterval, onSave]);

  // Check conditional logic
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (!field.conditional) return true;
    
    const { field: conditionalField, operator, value } = field.conditional;
    const conditionalValue = formData[conditionalField];
    
    switch (operator) {
      case 'equals':
        return conditionalValue === value;
      case 'not_equals':
        return conditionalValue !== value;
      case 'contains':
        return String(conditionalValue).includes(String(value));
      case 'greater_than':
        return Number(conditionalValue) > Number(value);
      case 'less_than':
        return Number(conditionalValue) < Number(value);
      default:
        return true;
    }
  }, [formData]);

  // Check section visibility
  const isSectionVisible = useCallback((section: FormSection): boolean => {
    if (!section.conditional) return true;
    
    const { field, operator, value } = section.conditional;
    const conditionalValue = formData[field];
    
    switch (operator) {
      case 'equals':
        return conditionalValue === value;
      case 'not_equals':
        return conditionalValue !== value;
      case 'contains':
        return String(conditionalValue).includes(String(value));
      case 'greater_than':
        return Number(conditionalValue) > Number(value);
      case 'less_than':
        return Number(conditionalValue) < Number(value);
      default:
        return true;
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: Record<string, string> = {};
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (isFieldVisible(field)) {
          const error = validateField(field, formData[field.id]);
          if (error) {
            errors[field.id] = error;
          }
        }
      });
    });
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      onSubmit?.(formData);
    }
  }, [sections, formData, validateField, isFieldVisible, onSubmit]);

  // Render field based on type
  const renderField = useCallback((field: FormField) => {
    if (!isFieldVisible(field)) return null;
    
    const value = formData[field.id] || field.defaultValue || '';
    const error = validationErrors[field.id];
    const suggestions = getAutoCompleteSuggestions(field.id, String(value));
    
    const commonProps = {
      id: field.id,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleFieldChange(field.id, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      className: cn(
        'w-full',
        error && 'border-red-500 focus:border-red-500'
      ),
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              {...commonProps}
              type={field.type}
            />
            {suggestions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Suggestions: {suggestions.join(', ')}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2">
            <textarea
              {...commonProps}
              rows={4}
              className={cn(
                'w-full p-3 border border-border rounded-md resize-vertical',
                error && 'border-red-500 focus:border-red-500'
              )}
            />
            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2">
            <select
              {...commonProps}
              className={cn(
                'w-full p-3 border border-border rounded-md',
                error && 'border-red-500 focus:border-red-500'
              )}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="rounded"
              />
              <span>{field.label}</span>
            </label>
            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="rounded-full"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {error && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="p-4 border border-dashed border-border rounded-md text-center text-muted-foreground">
            Custom field type: {field.type}
          </div>
        );
    }
  }, [formData, validationErrors, isFieldVisible, handleFieldChange, getAutoCompleteSuggestions]);

  // Calculate form progress
  const formProgress = useMemo(() => {
    const totalFields = sections
      .filter(isSectionVisible)
      .flatMap(s => s.fields)
      .filter(isFieldVisible).length;
    
    const filledFields = sections
      .filter(isSectionVisible)
      .flatMap(s => s.fields)
      .filter(isFieldVisible)
      .filter(f => formData[f.id] && formData[f.id] !== '').length;
    
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  }, [sections, formData, isSectionVisible, isFieldVisible]);

  if (loading) {
    return (
      <div className={cn(formBuilderVariants({ variant, size }), className)}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(formBuilderVariants({ variant, size }), className)}>
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Error Loading Form
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(formBuilderVariants({ variant, size }), className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Dynamic Form</h2>
            {features.progressTracking && (
              <div className="flex items-center gap-2">
                <Progress value={formProgress} size="sm" className="w-32" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(formProgress)}% complete
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Auto-save status */}
            {features.autoSave && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Clock className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Saved
                  </>
                )}
                {autoSaveStatus === 'error' && (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    Save failed
                  </>
                )}
              </div>
            )}
            
            {/* AI Features indicator */}
            {aiFeatures.formOptimization && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                AI Active
              </div>
            )}
            
            {/* Builder mode toggle */}
            {builderMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBuilder(!showBuilder)}
              >
                {showBuilder ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showBuilder ? 'Hide' : 'Show'} Builder
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {sections
          .filter(isSectionVisible)
          .map((section, sectionIndex) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </div>
                
                {section.collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSectionUpdate?.(section.id, {
                        ...section,
                        collapsed: !section.collapsed,
                      });
                    }}
                  >
                    {section.collapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {/* Section Fields */}
              {!section.collapsed && (
                <div className="space-y-4">
                  {section.fields
                    .filter(isFieldVisible)
                    .map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label htmlFor={field.id} className="block text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                          {field.metadata?.priority && (
                            <Badge variant="outline" size="sm" className="ml-2">
                              Priority {field.metadata.priority}
                            </Badge>
                          )}
                        </label>
                        
                        {renderField(field)}
                        
                        {/* AI Features */}
                        {aiFeatures.usageOptimization && field.metadata?.usageCount && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Used {field.metadata.usageCount} times
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        
        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            {features.exportImport && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const formData = { sections };
                    const blob = new Blob([JSON.stringify(formData, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'form-config.json';
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          try {
                            const formData = JSON.parse(e.target?.result as string);
                            onLoad?.(formData);
                          } catch (error) {
                            console.error('Error loading form:', error);
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData(initialData)}
            >
              Reset
            </Button>
            
            <Button type="submit">
              Submit
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 