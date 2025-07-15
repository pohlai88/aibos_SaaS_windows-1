import React, { useState, useCallback } from 'react';

// Types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'file' 
  | 'hidden';

export type FieldOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
};

export type FieldValidation = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => string | undefined;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  disabled?: boolean;
  hidden?: boolean;
  width?: 'full' | 'half' | 'third' | 'quarter';
  section?: string;
  dependsOn?: string;
  dependsOnValue?: any;
};

export type FormSection = {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
};

export type FormBuilderProps = {
  fields: FormField[];
  sections?: FormSection[];
  values?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
  onSubmit?: (values: Record<string, any>) => void;
  variant?: 'default' | 'compact' | 'spacious';
  className?: string;
  loading?: boolean;
  showSubmit?: boolean;
  submitLabel?: string;
  showReset?: boolean;
  resetLabel?: string;
};

const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  sections = [],
  values = {},
  onValuesChange,
  onSubmit,
  variant = 'default',
  className = '',
  loading = false,
  showSubmit = true,
  submitLabel = 'Submit',
  showReset = false,
  resetLabel = 'Reset'
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const validateField = useCallback((field: FormField, value: any): string | undefined => {
    const { validation } = field;
    if (!validation) return undefined;

    if (validation.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (validation.minLength && value && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && value && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    if (validation.min && value && Number(value) < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }

    if (validation.max && value && Number(value) > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }

    if (validation.pattern && value && !new RegExp(validation.pattern).test(value)) {
      return `${field.label} format is invalid`;
    }

    if (validation.custom) {
      return validation.custom(value);
    }

    return undefined;
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    const newValues = { ...values, [fieldId]: value };
    onValuesChange?.(newValues);

    // Validate the field
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldId]: error || ''
      }));
    }
  }, [values, onValuesChange, fields, validateField]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      if (field.hidden || field.type === 'hidden') return;
      
      const error = validateField(field, values[field.id]);
      if (error) {
        newErrors[field.id] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onSubmit?.(values);
    }
  }, [fields, values, validateField, onSubmit]);

  const handleReset = useCallback(() => {
    const resetValues: Record<string, any> = {};
    fields.forEach(field => {
      resetValues[field.id] = field.defaultValue || '';
    });
    onValuesChange?.(resetValues);
    setErrors({});
  }, [fields, onValuesChange]);

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (field.hidden) return false;
    
    if (field.dependsOn) {
      const dependentValue = values[field.dependsOn];
      return dependentValue === field.dependsOnValue;
    }
    
    return true;
  }, [values]);

  const getFormClasses = () => {
    const baseClasses = "space-y-6";
    
    const variantClasses = {
      default: "",
      compact: "space-y-4",
      spacious: "space-y-8"
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${className}`;
  };

  const getFieldWrapperClasses = (field: FormField) => {
    const baseClasses = "space-y-2";
    
    const widthClasses = {
      full: "col-span-1",
      half: "col-span-1 md:col-span-2",
      third: "col-span-1 md:col-span-3",
      quarter: "col-span-1 md:col-span-4"
    };
    
    return `${baseClasses} ${widthClasses[field.width || 'full']}`;
  };

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const fieldValue = values[field.id] || field.defaultValue || '';
    const fieldError = errors[field.id];

    const commonProps = {
      id: field.id,
      name: field.id,
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        handleFieldChange(field.id, value);
      },
      disabled: field.disabled || loading,
      className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        fieldError ? 'border-red-300' : 'border-gray-300'
      } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`,
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  disabled={field.disabled || loading}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...commonProps}
              checked={Boolean(fieldValue)}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        );

      case 'date':
        return <input {...commonProps} type="date" />;

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFieldChange(field.id, file);
            }}
            className={`${commonProps.className} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
          />
        );

      case 'hidden':
        return <input {...commonProps} type="hidden" />;

      default:
        return <input {...commonProps} type={field.type} />;
    }
  };

  const renderSection = (section: FormSection) => {
    const sectionFields = fields.filter(field => field.section === section.id);
    const isCollapsed = collapsedSections.has(section.id);

    if (sectionFields.length === 0) return null;

    return (
      <div key={section.id} className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          {section.collapsible && (
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
        
        {(!section.collapsible || !isCollapsed) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {sectionFields.map(field => (
              <div key={field.id} className={getFieldWrapperClasses(field)}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                )}
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-sm text-red-600 mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUnsectionedFields = () => {
    const unsectionedFields = fields.filter(field => !field.section);
    
    if (unsectionedFields.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {unsectionedFields.map(field => (
          <div key={field.id} className={getFieldWrapperClasses(field)}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-sm text-red-600 mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={getFormClasses()}>
      {/* Render sections */}
      {sections.map(renderSection)}
      
      {/* Render unsectioned fields */}
      {renderUnsectionedFields()}
      
      {/* Form actions */}
      {(showSubmit || showReset) && (
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLabel}
            </button>
          )}
          {showSubmit && (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : submitLabel}
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default FormBuilder; 