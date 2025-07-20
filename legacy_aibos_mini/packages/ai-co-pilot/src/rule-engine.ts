/**
 * AI-BOS Co-Pilot Rule Engine
 * 
 * This engine enforces strict coding standards and prevents forbidden patterns
 * that could compromise the AI-BOS OS ecosystem.
 * 
 * NEW: Includes Metadata Registry compliance checking as SSOT
 */

export interface RuleViolation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
  file?: string;
  suggestion?: string;
}

export interface CodeAnalysisResult {
  isValid: boolean;
  violations: RuleViolation[];
  suggestions: string[];
  complianceScore: number;
  autoCorrections?: AutoCorrection[];
}

export interface AutoCorrection {
  original: string;
  corrected: string;
  confidence: number;
  type: 'naming' | 'enum' | 'field';
}

export interface MetadataValidationResult {
  isValid: boolean;
  corrections: AutoCorrection[];
  requiresManualReview: boolean;
  unresolved: {
    fieldName: string;
    suggestions: string[];
    action: 'register_local' | 'map_existing' | 'reject';
  }[];
}

export class AICoPilotRuleEngine {
  private rules: Map<string, RegExp> = new Map();
  private forbiddenExports: string[] = ['Export', 'export_to', 'ExportTo'];
  private forbiddenPatterns: RegExp[] = [];
  private metadataRegistry: any; // Will be injected

  constructor(metadataRegistry?: any) {
    this.metadataRegistry = metadataRegistry;
    this.initializeRules();
  }

  /**
   * Initialize all coding rules including metadata compliance
   */
  private initializeRules(): void {
    // Forbidden exports
    this.forbiddenExports.forEach(exportName => {
      this.rules.set(`forbidden-export-${exportName}`, 
        new RegExp(`\\b${exportName}\\b`, 'g')
      );
    });

    // CommonJS patterns (forbidden in ESM-only environment)
    this.rules.set('no-commonjs-require', /require\s*\(/g);
    this.rules.set('no-commonjs-module', /module\.exports/g);
    this.rules.set('no-commonjs-exports', /exports\./g);

    // TypeScript strict mode violations
    this.rules.set('no-any-type', /\bany\b/g);
    this.rules.set('no-var-declaration', /\bvar\b/g);

    // Naming conventions
    this.rules.set('kebab-case-required', /[A-Z]+[a-z]*/g);

    // Security patterns
    this.rules.set('no-eval', /\beval\s*\(/g);
    this.rules.set('no-innerHTML', /\.innerHTML\s*=/g);
    this.rules.set('no-outerHTML', /\.outerHTML\s*=/g);

    // Performance patterns
    this.rules.set('no-console-in-production', /console\.(log|warn|error|info)/g);

    // NEW: Metadata Registry compliance rules
    this.rules.set('no-hardcoded-enums', /enum\s+[A-Za-z_$][A-Za-z0-9_$]*\s*{/g);
    this.rules.set('snake-case-fields', /[a-z]+_[a-z_]+/g);
    this.rules.set('pascal-case-fields', /[A-Z][a-z]+[A-Z][A-Za-z]*/g);
  }

  /**
   * NEW: Comprehensive metadata compliance checking
   */
  async validateMetadataCompliance(code: string, filePath?: string): Promise<MetadataValidationResult> {
    const corrections: AutoCorrection[] = [];
    const unresolved: any[] = [];
    let requiresManualReview = false;

    // 1. Auto-correct naming conventions
    const namingCorrections = await this.autoCorrectNaming(code);
    corrections.push(...namingCorrections);

    // 2. Validate field references against registry
    if (this.metadataRegistry) {
      const fieldValidation = await this.validateFieldReferences(code);
      corrections.push(...fieldValidation.corrections);
      unresolved.push(...fieldValidation.unresolved);
      requiresManualReview = fieldValidation.requiresManualReview;
    }

    // 3. Check for hardcoded enums
    const enumViolations = this.checkHardcodedEnums(code);
    corrections.push(...enumViolations);

    return {
      isValid: corrections.length === 0 && unresolved.length === 0,
      corrections,
      requiresManualReview,
      unresolved
    };
  }

  /**
   * NEW: Auto-correct naming conventions
   */
  private async autoCorrectNaming(code: string): Promise<AutoCorrection[]> {
    const corrections: AutoCorrection[] = [];
    
    // Convert snake_case to camelCase
    const snakeCasePattern = /\b[a-z]+(?:_[a-z]+)+\b/g;
    const snakeMatches = code.matchAll(snakeCasePattern);
    
    for (const match of snakeMatches) {
      const original = match[0];
      const corrected = this.snakeToCamel(original);
      const confidence = this.calculateNamingConfidence(original, corrected);
      
      corrections.push({
        original,
        corrected,
        confidence,
        type: 'naming'
      });
    }

    // Convert PascalCase fields to camelCase (if not class names)
    const pascalPattern = /\b[A-Z][a-z]+(?:[A-Z][a-z]*)*\b/g;
    const pascalMatches = code.matchAll(pascalPattern);
    
    for (const match of pascalMatches) {
      const original = match[0];
      // Skip if it's likely a class name or component
      if (!this.isLikelyClassName(original, code, match.index!)) {
        const corrected = original.charAt(0).toLowerCase() + original.slice(1);
        const confidence = 0.8; // Medium confidence for PascalCase conversion
        
        corrections.push({
          original,
          corrected,
          confidence,
          type: 'naming'
        });
      }
    }

    return corrections;
  }

  /**
   * NEW: Validate field references against metadata registry
   */
  private async validateFieldReferences(code: string): Promise<{
    corrections: AutoCorrection[];
    unresolved: any[];
    requiresManualReview: boolean;
  }> {
    const corrections: AutoCorrection[] = [];
    const unresolved: any[] = [];
    let requiresManualReview = false;

    // Extract field references from code
    const fieldPattern = /(?:interface|type)\s+\w+\s*{[^}]*}|(?:const|let|var)\s+\w+\s*[:=]/g;
    const matches = code.matchAll(fieldPattern);
    
    for (const match of matches) {
      const fieldName = this.extractFieldName(match[0]);
      if (fieldName) {
        const validation = await this.metadataRegistry.validateField(fieldName);
        
        if (!validation.isValid) {
          const suggestions = await this.metadataRegistry.suggestCorrection(fieldName);
          
          if (suggestions.length > 0) {
            const bestMatch = suggestions[0];
            const confidence = this.calculateFieldConfidence(fieldName, bestMatch);
            
            if (confidence > 0.7) {
              corrections.push({
                original: fieldName,
                corrected: bestMatch,
                confidence,
                type: 'field'
              });
            } else {
              unresolved.push({
                fieldName,
                suggestions,
                action: confidence > 0.5 ? 'map_existing' : 'register_local'
              });
              requiresManualReview = true;
            }
          } else {
            unresolved.push({
              fieldName,
              suggestions: [],
              action: 'register_local'
            });
            requiresManualReview = true;
          }
        }
      }
    }

    return { corrections, unresolved, requiresManualReview };
  }

  /**
   * NEW: Check for hardcoded enums
   */
  private checkHardcodedEnums(code: string): AutoCorrection[] {
    const corrections: AutoCorrection[] = [];
    const enumPattern = /enum\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*{([^}]*)}/g;
    const matches = code.matchAll(enumPattern);
    
    for (const match of matches) {
      const enumName = match[1];
      const enumBody = match[2];
      
      corrections.push({
        original: match[0],
        corrected: `const ${enumName} = await metadataRegistry.getEnum('${this.camelToSnake(enumName)}');`,
        confidence: 0.9,
        type: 'enum'
      });
    }

    return corrections;
  }

  /**
   * NEW: Apply auto-corrections to code
   */
  async autoCorrect(code: string): Promise<{
    correctedCode: string;
    corrections: AutoCorrection[];
    requiresManualReview: boolean;
  }> {
    const metadataValidation = await this.validateMetadataCompliance(code);
    let correctedCode = code;
    
    // Apply high-confidence corrections automatically
    const autoApplyCorrections = metadataValidation.corrections.filter(c => c.confidence > 0.9);
    
    for (const correction of autoApplyCorrections) {
      correctedCode = correctedCode.replace(
        new RegExp(this.escapeRegExp(correction.original), 'g'),
        correction.corrected
      );
    }

    return {
      correctedCode,
      corrections: metadataValidation.corrections,
      requiresManualReview: metadataValidation.requiresManualReview
    };
  }

  /**
   * Analyze code for rule violations
   */
  analyzeCode(code: string, filePath?: string): CodeAnalysisResult {
    const violations: RuleViolation[] = [];
    const suggestions: string[] = [];

    // Check each rule
    for (const [ruleName, pattern] of this.rules) {
      const matches = code.matchAll(pattern);
      
      for (const match of matches) {
        const violation = this.createViolation(ruleName, match, code, filePath);
        if (violation) {
          violations.push(violation);
        }
      }
    }

    // Check for forbidden exports in module declarations
    this.checkForbiddenExports(code, violations, filePath);

    // Check for proper ESM syntax
    this.checkESMSyntax(code, violations, filePath);

    // Check for TypeScript best practices
    this.checkTypeScriptBestPractices(code, violations, filePath);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(violations, code.length);

    // Generate suggestions
    suggestions.push(...this.generateSuggestions(violations));

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      suggestions,
      complianceScore
    };
  }

  /**
   * Check for forbidden exports specifically
   */
  private checkForbiddenExports(code: string, violations: RuleViolation[], filePath?: string): void {
    const exportPatterns = [
      /export\s+{\s*([^}]+)\s*}/g,
      /export\s+default\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      /export\s+(const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];

    for (const pattern of exportPatterns) {
      const matches = code.matchAll(pattern);
      
      for (const match of matches) {
        const exportedItems = match[1] || match[2];
        if (exportedItems) {
          for (const forbidden of this.forbiddenExports) {
            if (exportedItems.includes(forbidden)) {
              violations.push({
                rule: 'forbidden-export',
                message: `Forbidden export found: "${forbidden}". Use proper naming conventions.`,
                severity: 'error',
                line: this.getLineNumber(code, match.index!),
                column: this.getColumnNumber(code, match.index!),
                file: filePath,
                suggestion: `Replace "${forbidden}" with a proper name like "${this.suggestBetterName(forbidden)}"`
              });
            }
          }
        }
      }
    }
  }

  /**
   * Check ESM syntax compliance
   */
  private checkESMSyntax(code: string, violations: RuleViolation[], filePath?: string): void {
    // Check for proper import/export syntax
    const hasImports = /import\s+/.test(code);
    const hasExports = /export\s+/.test(code);
    const hasRequire = /require\s*\(/.test(code);
    const hasModuleExports = /module\.exports/.test(code);

    if (!hasImports && !hasExports && (hasRequire || hasModuleExports)) {
      violations.push({
        rule: 'esm-required',
        message: 'File must use ESM syntax (import/export) instead of CommonJS (require/module.exports)',
        severity: 'error',
        file: filePath,
        suggestion: 'Convert to ESM syntax using import/export statements'
      });
    }
  }

  /**
   * Check TypeScript best practices
   */
  private checkTypeScriptBestPractices(code: string, violations: RuleViolation[], filePath?: string): void {
    // Check for explicit return types on functions
    const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/g;
    const matches = code.matchAll(functionPattern);
    
    for (const match of matches) {
      const functionName = match[1];
      const functionStart = match.index!;
      const functionEnd = this.findFunctionEnd(code, functionStart);
      const functionBody = code.substring(functionStart, functionEnd);
      
      if (!functionBody.includes(':') && !functionBody.includes('=>')) {
        violations.push({
          rule: 'explicit-return-type',
          message: `Function "${functionName}" should have explicit return type annotation`,
          severity: 'warning',
          line: this.getLineNumber(code, functionStart),
          file: filePath,
          suggestion: `Add return type: function ${functionName}(): ReturnType {`
        });
      }
    }
  }

  /**
   * Create a violation object
   */
  private createViolation(ruleName: string, match: RegExpMatchArray, code: string, filePath?: string): RuleViolation | null {
    const matchText = match[0];
    const index = match.index!;

    // Skip if it's in a comment or string
    if (this.isInCommentOrString(code, index)) {
      return null;
    }

    const severity = this.getRuleSeverity(ruleName);
    const message = this.getRuleMessage(ruleName, matchText);
    const suggestion = this.getRuleSuggestion(ruleName, matchText);

    return {
      rule: ruleName,
      message,
      severity,
      line: this.getLineNumber(code, index),
      column: this.getColumnNumber(code, index),
      file: filePath,
      suggestion
    };
  }

  /**
   * Check if position is in comment or string
   */
  private isInCommentOrString(code: string, index: number): boolean {
    const before = code.substring(0, index);
    
    // Check for single-line comment
    const lastNewline = before.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const line = before.substring(lineStart);
    
    if (line.includes('//')) {
      return true;
    }
    
    // Check for multi-line comment
    const commentStart = before.lastIndexOf('/*');
    const commentEnd = before.lastIndexOf('*/');
    
    if (commentStart > commentEnd) {
      return true;
    }
    
    // Check for string literals (simplified)
    const singleQuotes = (before.match(/'/g) || []).length;
    const doubleQuotes = (before.match(/"/g) || []).length;
    
    return (singleQuotes % 2 === 1) || (doubleQuotes % 2 === 1);
  }

  /**
   * Get line number from character index
   */
  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Get column number from character index
   */
  private getColumnNumber(code: string, index: number): number {
    const before = code.substring(0, index);
    const lastNewline = before.lastIndexOf('\n');
    return lastNewline === -1 ? index + 1 : index - lastNewline;
  }

  /**
   * Find the end of a function
   */
  private findFunctionEnd(code: string, start: number): number {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = start; i < code.length; i++) {
      const char = code[i];
      
      if (char === '"' || char === "'") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return i + 1;
          }
        }
      }
    }
    
    return code.length;
  }

  /**
   * Get rule severity
   */
  private getRuleSeverity(ruleName: string): 'error' | 'warning' | 'info' {
    const errorRules = ['forbidden-export', 'no-commonjs-require', 'no-eval', 'no-innerHTML'];
    const warningRules = ['no-any-type', 'no-console-in-production', 'explicit-return-type'];
    
    if (errorRules.some(rule => ruleName.includes(rule))) {
      return 'error';
    } else if (warningRules.some(rule => ruleName.includes(rule))) {
      return 'warning';
    }
    
    return 'info';
  }

  /**
   * Get rule message
   */
  private getRuleMessage(ruleName: string, matchText: string): string {
    const messages: Record<string, string> = {
      'forbidden-export': `Forbidden export pattern found: "${matchText}"`,
      'no-commonjs-require': 'CommonJS require() is not allowed in ESM environment',
      'no-commonjs-module': 'CommonJS module.exports is not allowed in ESM environment',
      'no-any-type': 'Avoid using "any" type, use specific types instead',
      'no-var-declaration': 'Use "const" or "let" instead of "var"',
      'no-eval': 'eval() is not allowed for security reasons',
      'no-innerHTML': 'innerHTML can be dangerous, use safer alternatives',
      'no-console-in-production': 'console statements should be removed in production'
    };
    
    return messages[ruleName] || `Rule violation: ${ruleName}`;
  }

  /**
   * Get rule suggestion
   */
  private getRuleSuggestion(ruleName: string, matchText: string): string {
    const suggestions: Record<string, string> = {
      'forbidden-export': `Use proper naming: ${this.suggestBetterName(matchText)}`,
      'no-commonjs-require': 'Use ES6 import syntax instead',
      'no-commonjs-module': 'Use ES6 export syntax instead',
      'no-any-type': 'Replace with specific type or unknown',
      'no-var-declaration': 'Replace with const or let',
      'no-eval': 'Use safer alternatives like JSON.parse()',
      'no-innerHTML': 'Use textContent or createElement instead',
      'no-console-in-production': 'Use proper logging library'
    };
    
    return suggestions[ruleName] || 'Review and fix according to AI-BOS coding standards';
  }

  /**
   * Suggest better name for forbidden exports
   */
  private suggestBetterName(forbiddenName: string): string {
    const suggestions: Record<string, string> = {
      'Export': 'exportData',
      'export_to': 'exportTo',
      'ExportTo': 'exportTo'
    };
    
    return suggestions[forbiddenName] || forbiddenName.replace(/[A-Z]/g, (match, index) => 
      index === 0 ? match.toLowerCase() : match
    );
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(violations: RuleViolation[], codeLength: number): number {
    if (codeLength === 0) return 100;
    
    const errorWeight = 10;
    const warningWeight = 5;
    const infoWeight = 1;
    
    const totalPenalty = violations.reduce((penalty, violation) => {
      switch (violation.severity) {
        case 'error':
          return penalty + errorWeight;
        case 'warning':
          return penalty + warningWeight;
        case 'info':
          return penalty + infoWeight;
        default:
          return penalty;
      }
    }, 0);
    
    const maxPenalty = codeLength * 0.1; // 10% of code length as max penalty
    const actualPenalty = Math.min(totalPenalty, maxPenalty);
    
    return Math.max(0, 100 - (actualPenalty / maxPenalty) * 100);
  }

  /**
   * Generate suggestions based on violations
   */
  private generateSuggestions(violations: RuleViolation[]): string[] {
    const suggestions: string[] = [];
    
    violations.forEach(violation => {
      if (violation.suggestion) {
        suggestions.push(`${violation.rule}: ${violation.suggestion}`);
      }
    });
    
    return suggestions;
  }

  /**
   * Validate module metadata against AI-BOS standards
   */
  validateModuleMetadata(metadata: any): CodeAnalysisResult {
    const violations: RuleViolation[] = [];
    
    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'author'];
    requiredFields.forEach(field => {
      if (!metadata[field]) {
        violations.push({
          rule: 'required-metadata-field',
          message: `Missing required metadata field: ${field}`,
          severity: 'error',
          suggestion: `Add ${field} to module metadata`
        });
      }
    });
    
    // Check naming conventions
    if (metadata.name && !/^[a-z][a-z0-9-]*$/.test(metadata.name)) {
      violations.push({
        rule: 'metadata-naming-convention',
        message: `Module name should follow kebab-case: ${metadata.name}`,
        severity: 'warning',
        suggestion: `Rename to: ${metadata.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      });
    }
    
    const complianceScore = this.calculateComplianceScore(violations, 1);
    const suggestions = this.generateSuggestions(violations);
    
    return {
      isValid: violations.length === 0,
      violations,
      suggestions,
      complianceScore
    };
  }
}