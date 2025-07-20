'use client';

import React, { useState, useEffect } from 'react';
import { 
  MetadataRegistryService, 
  DataType, 
  Domain, 
  MetadataStatus, 
  SecurityLevel,
  ComplianceStandard,
  type MetadataTerm,
  type ValidationRule
} from '../services/metadata-registry-service';
import { Button, Input, Badge, Select, Textarea, Checkbox } from './ui';
import { 
  Plus, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  Database,
  Tag,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react';

interface MetadataTermEntryProps {
  organizationId: string;
  supabaseUrl: string;
  supabaseKey: string;
  onTermCreated?: (term: MetadataTerm) => void;
  onCancel?: () => void;
  initialData?: Partial<MetadataTerm>;
}

export default function MetadataTermEntry({
  organizationId,
  supabaseUrl,
  supabaseKey,
  onTermCreated,
  onCancel,
  initialData
}: MetadataTermEntryProps) {
  const [metadataService] = useState(() => new MetadataRegistryService(supabaseUrl, supabaseKey));
  
  // Form state
  const [formData, setFormData] = useState({
    term_name: initialData?.term_name || '',
    display_name: initialData?.display_name || '',
    description: initialData?.description || '',
    data_type: initialData?.data_type || DataType.SHORT_TEXT,
    domain: initialData?.domain || Domain.GENERAL,
    is_required: initialData?.is_required || false,
    is_sensitive: initialData?.is_sensitive || false,
    is_pii: initialData?.is_pii || false,
    security_level: initialData?.security_level || SecurityLevel.INTERNAL,
    compliance_standards: initialData?.compliance_standards || [],
    allowed_values: initialData?.allowed_values || [],
    default_value: initialData?.default_value || '',
    tags: initialData?.tags || [],
    synonyms: initialData?.synonyms || [],
    usage_context: initialData?.usage_context || [],
    validation_rules: initialData?.validation_rules || []
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [generatedPrefix, setGeneratedPrefix] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSynonym, setNewSynonym] = useState('');
  const [newContext, setNewContext] = useState('');

  // Validation rule state
  const [newValidationRule, setNewValidationRule] = useState({
    rule_type: 'regex' as const,
    rule_value: '',
    error_message: '',
    is_critical: false
  });

  useEffect(() => {
    if (formData.term_name && formData.domain) {
      const prefix = metadataService.generateTermPrefix(formData.domain, formData.term_name);
      setGeneratedPrefix(prefix);
    }
  }, [formData.term_name, formData.domain]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove') => {
    setFormData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const addValidationRule = () => {
    if (newValidationRule.rule_value && newValidationRule.error_message) {
      setFormData(prev => ({
        ...prev,
        validation_rules: [...prev.validation_rules, { ...newValidationRule }]
      }));
      setNewValidationRule({
        rule_type: 'regex',
        rule_value: '',
        error_message: '',
        is_critical: false
      });
    }
  };

  const removeValidationRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      validation_rules: prev.validation_rules.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.term_name.trim()) {
      newErrors.push('Term name is required');
    }

    if (!formData.display_name.trim()) {
      newErrors.push('Display name is required');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (formData.data_type === DataType.ARRAY && formData.allowed_values.length === 0) {
      newErrors.push('Allowed values are required for array/enum data types');
    }

    if (formData.is_pii && formData.security_level === SecurityLevel.PUBLIC) {
      newErrors.push('PII data cannot have public security level');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const termData = {
        ...formData,
        term_prefix: generatedPrefix,
        version: '1.0.0',
        status: MetadataStatus.DRAFT,
        created_by: 'current-user'
      };

      const newTerm = await metadataService.registerMetadataTerm(termData, organizationId);
      
      if (onTermCreated) {
        onTermCreated(newTerm);
      }
    } catch (error: any) {
      setErrors([error.message || 'Failed to create metadata term']);
    } finally {
      setLoading(false);
    }
  };

  const getDataTypeDescription = (dataType: DataType): string => {
    const descriptions: Record<DataType, string> = {
      [DataType.SHORT_TEXT]: 'Short text field (up to 255 characters)',
      [DataType.LONG_TEXT]: 'Long text field (unlimited characters)',
      [DataType.SHORT_DATE]: 'Date only (YYYY-MM-DD)',
      [DataType.LONG_DATE]: 'Date and time (YYYY-MM-DD HH:MM:SS)',
      [DataType.NUMBER]: 'Integer number',
      [DataType.DECIMAL]: 'Decimal number with precision',
      [DataType.BOOLEAN]: 'True/False value',
      [DataType.EMAIL]: 'Email address format',
      [DataType.URL]: 'URL/website address',
      [DataType.PHONE]: 'Phone number format',
      [DataType.JSON]: 'JSON object or array',
      [DataType.ARRAY]: 'List of predefined values (enum)'
    };
    return descriptions[dataType];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Metadata Term</h2>
          <p className="text-gray-600">Define a new metadata term with controlled vocabulary</p>
        </div>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="mt-2 ml-6 list-disc text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term Name *
            </label>
            <Input
              value={formData.term_name}
              onChange={(e) => handleInputChange('term_name', e.target.value)}
              placeholder="e.g., customer_email"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="e.g., Customer Email Address"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated Prefix
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={generatedPrefix}
                readOnly
                className="w-full bg-gray-50"
              />
              <Badge variant="secondary" className="text-xs">
                Auto-generated
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the purpose and usage of this metadata term..."
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Type *
              </label>
              <Select
                value={formData.data_type}
                onValueChange={(value) => handleInputChange('data_type', value as DataType)}
              >
                {Object.values(DataType).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {getDataTypeDescription(formData.data_type)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain *
              </label>
              <Select
                value={formData.domain}
                onValueChange={(value) => handleInputChange('domain', value as Domain)}
              >
                {Object.values(Domain).map(domain => (
                  <option key={domain} value={domain}>
                    {domain.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Level *
              </label>
              <Select
                value={formData.security_level}
                onValueChange={(value) => handleInputChange('security_level', value as SecurityLevel)}
              >
                {Object.values(SecurityLevel).map(level => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Data Classification
              </label>
              <div className="space-y-2">
                <Checkbox
                  checked={formData.is_required}
                  onCheckedChange={(checked) => handleInputChange('is_required', checked)}
                  label="Required Field"
                />
                <Checkbox
                  checked={formData.is_sensitive}
                  onCheckedChange={(checked) => handleInputChange('is_sensitive', checked)}
                  label="Sensitive Data"
                />
                <Checkbox
                  checked={formData.is_pii}
                  onCheckedChange={(checked) => handleInputChange('is_pii', checked)}
                  label="Personally Identifiable Information (PII)"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compliance Standards
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ComplianceStandard).map(standard => (
                <Checkbox
                  key={standard}
                  checked={formData.compliance_standards.includes(standard)}
                  onCheckedChange={(checked) => {
                    const newStandards = checked
                      ? [...formData.compliance_standards, standard]
                      : formData.compliance_standards.filter(s => s !== standard);
                    handleInputChange('compliance_standards', newStandards);
                  }}
                  label={standard.replace('_', ' ').toUpperCase()}
                />
              ))}
            </div>
          </div>

          {(formData.data_type === DataType.ARRAY || formData.data_type === DataType.SHORT_TEXT) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Values
              </label>
              <div className="space-y-2">
                {formData.allowed_values.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => {
                        const newValues = [...formData.allowed_values];
                        newValues[index] = e.target.value;
                        handleInputChange('allowed_values', newValues);
                      }}
                      placeholder="Enter allowed value"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayChange('allowed_values', value, 'remove')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayChange('allowed_values', '', 'add')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tags */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        handleArrayChange('tags', newTag.trim(), 'add');
                        setNewTag('');
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newTag.trim()) {
                        handleArrayChange('tags', newTag.trim(), 'add');
                        setNewTag('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleArrayChange('tags', tag, 'remove')}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Synonyms */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Synonyms
              </h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newSynonym}
                    onChange={(e) => setNewSynonym(e.target.value)}
                    placeholder="Add synonym"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSynonym.trim()) {
                        handleArrayChange('synonyms', newSynonym.trim(), 'add');
                        setNewSynonym('');
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newSynonym.trim()) {
                        handleArrayChange('synonyms', newSynonym.trim(), 'add');
                        setNewSynonym('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.synonyms.map((synonym, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {synonym}
                      <button
                        onClick={() => handleArrayChange('synonyms', synonym, 'remove')}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create Metadata Term
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 