/**
 * AI-BOS Co-Pilot Rule Engine
 * 
 * This engine enforces strict coding standards and prevents forbidden patterns
 * that could compromise the AI-BOS OS ecosystem.
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
}

export class AICoPilotRuleEngine {
  private rules: Map<string, RegExp> = new Map();
  private forbiddenExports: string[] = ['Export', 'export_to', 'ExportTo'];
  private forbiddenPatterns: RegExp[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize all coding rules
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
    const errorWeight = 10;
    const warningWeight = 5;
    const infoWeight = 1;
    
    const totalWeight = violations.reduce((sum, violation) => {
      switch (violation.severity) {
        case 'error': return sum + errorWeight;
        case 'warning': return sum + warningWeight;
        case 'info': return sum + infoWeight;
        default: return sum;
      }
    }, 0);
    
    const maxScore = 100;
    const penalty = Math.min(totalWeight, maxScore);
    
    return Math.max(0, maxScore - penalty);
  }

  /**
   * Generate suggestions based on violations
   */
  private generateSuggestions(violations: RuleViolation[]): string[] {
    const suggestions: string[] = [];
    
    if (violations.some(v => v.rule.includes('forbidden-export'))) {
      suggestions.push('Review all exports and ensure they follow proper naming conventions');
    }
    
    if (violations.some(v => v.rule.includes('commonjs'))) {
      suggestions.push('Convert all CommonJS patterns to ES6 modules');
    }
    
    if (violations.some(v => v.rule.includes('any-type'))) {
      suggestions.push('Replace "any" types with specific TypeScript types');
    }
    
    if (violations.some(v => v.rule.includes('console'))) {
      suggestions.push('Remove console statements for production code');
    }
    
    return suggestions;
  }

  /**
   * Validate module metadata
   */
  validateModuleMetadata(metadata: any): CodeAnalysisResult {
    const violations: RuleViolation[] = [];
    
    // Check for forbidden exports in metadata
    if (metadata.exports) {
      for (const [key, value] of Object.entries(metadata.exports)) {
        for (const forbidden of this.forbiddenExports) {
          if (key.includes(forbidden)) {
            violations.push({
              rule: 'forbidden-export-metadata',
              message: `Forbidden export in metadata: "${key}"`,
              severity: 'error',
              suggestion: `Replace with proper name: "${this.suggestBetterName(key)}"`
            });
          }
        }
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      suggestions: this.generateSuggestions(violations),
      complianceScore: violations.length === 0 ? 100 : 50
    };
  }
}

// Export singleton instance
export const aiCoPilotRuleEngine = new AICoPilotRuleEngine(); 