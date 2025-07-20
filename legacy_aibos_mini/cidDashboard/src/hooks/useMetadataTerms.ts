import { useState, useEffect } from 'react';
import { MetadataRegistryService, Domain, DataType, type MetadataTerm } from '../../../metadataRegistry/src/services/metadata-registry-service';

interface UseMetadataTermsOptions {
  organizationId: string;
  supabaseUrl: string;
  supabaseKey: string;
  domain?: Domain;
  dataType?: DataType;
  includeInactive?: boolean;
}

interface MetadataTermsState {
  terms: MetadataTerm[];
  groupedTerms: {
    [domain: string]: {
      terms: MetadataTerm[];
      count: number;
      compliance_score: number;
    };
  };
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    draft: number;
    deprecated: number;
    domains: string[];
    compliance_average: number;
  };
}

export function useMetadataTerms(options: UseMetadataTermsOptions) {
  const [state, setState] = useState<MetadataTermsState>({
    terms: [],
    groupedTerms: {},
    loading: true,
    error: null,
    stats: {
      total: 0,
      active: 0,
      draft: 0,
      deprecated: 0,
      domains: [],
      compliance_average: 0
    }
  });

  const [metadataService] = useState(() => new MetadataRegistryService(options.supabaseUrl, options.supabaseKey));

  useEffect(() => {
    loadMetadataTerms();
  }, [options.organizationId, options.domain, options.dataType, options.includeInactive]);

  const loadMetadataTerms = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get terms for CID dashboard
      const groupedTerms = await metadataService.getTermsForCIDDashboard(options.organizationId);
      
      // Flatten terms for easier access
      const allTerms = Object.values(groupedTerms).flatMap(group => group.terms);

      // Calculate statistics
      const stats = calculateStats(allTerms);

      setState({
        terms: allTerms,
        groupedTerms,
        loading: false,
        error: null,
        stats
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load metadata terms'
      }));
    }
  };

  const calculateStats = (terms: MetadataTerm[]) => {
    const total = terms.length;
    const active = terms.filter(t => t.status === 'active').length;
    const draft = terms.filter(t => t.status === 'draft').length;
    const deprecated = terms.filter(t => t.status === 'deprecated').length;
    const domains = [...new Set(terms.map(t => t.domain))];
    
    // Calculate average compliance score
    const complianceScores = terms.map(term => {
      let score = 0;
      switch (term.security_level) {
        case 'restricted': score += 4; break;
        case 'confidential': score += 3; break;
        case 'internal': score += 2; break;
        case 'public': score += 1; break;
      }
      score += term.compliance_standards.length * 2;
      if (term.is_pii) score += 3;
      if (term.is_sensitive) score += 2;
      return Math.min(score, 10);
    });
    
    const compliance_average = complianceScores.length > 0 
      ? complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length 
      : 0;

    return {
      total,
      active,
      draft,
      deprecated,
      domains,
      compliance_average: Math.round(compliance_average * 10) / 10
    };
  };

  const searchTerms = async (query: string) => {
    try {
      const results = await metadataService.searchTerms(query, options.organizationId, {
        domain: options.domain,
        dataType: options.dataType,
        includeInactive: options.includeInactive
      });
      return results;
    } catch (error: any) {
      console.error('Error searching terms:', error);
      return [];
    }
  };

  const getTermsByDomain = async (domain: Domain) => {
    try {
      return await metadataService.getTermsByDomain(domain, options.organizationId);
    } catch (error: any) {
      console.error('Error getting terms by domain:', error);
      return [];
    }
  };

  const validateDataAgainstTerm = (data: any, termId: string) => {
    const term = state.terms.find(t => t.id === termId);
    if (!term) {
      return { isValid: false, errors: ['Term not found'] };
    }
    return metadataService.validateDataAgainstTerm(data, term);
  };

  const getTermByPrefix = async (prefix: string) => {
    try {
      return await metadataService.getTermByPrefix(prefix, options.organizationId);
    } catch (error: any) {
      console.error('Error getting term by prefix:', error);
      return null;
    }
  };

  const generateTermPrefix = (domain: Domain, name: string) => {
    return metadataService.generateTermPrefix(domain, name);
  };

  return {
    ...state,
    searchTerms,
    getTermsByDomain,
    validateDataAgainstTerm,
    getTermByPrefix,
    generateTermPrefix,
    refresh: loadMetadataTerms
  };
} 