#!/usr/bin/env node
/**
 * Fix Import Syntax Issues
 * Resolves verbatimModuleSyntax type import requirements
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ImportSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.errorCount = 0;
  }

  log(message, type = 'info') {
    const prefix = { info: '💡', success: '✅', warning: '⚠️', error: '❌' }[type];
    console.log(`${prefix} ${message}`);
  }

  findTypeScriptFiles(dir) {
    const files = [];

    const scan = (directory) => {
      try {
        const items = fs.readdirSync(directory);
        for (const item of items) {
          const fullPath = path.join(directory, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
            scan(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    scan(dir);
    return files;
  }

  fixImportSyntax(content) {
    let updated = content;
    let changes = 0;

    // Pattern 1: Regular import that should be type-only
    // import { TypeName } from 'module' -> import type { TypeName } from 'module'
    const typeOnlyPatterns = [
      // Common type-only imports
      /import\s+\{\s*([^}]*(?:Type|Interface|Schema|Config|Props|State|Context|Options|Params|Result|Response|Request|Error|Handler|Validator)[^}]*)\s*\}\s+from\s+(['"][^'"]+['"])/g,

      // Specific patterns from our errors
      /import\s+\{\s*(AIRequest|ApiResponse|PaginatedResponse|PaginatedApiResponse|ApiError|StandardApiError|PaginationParams|PaginationQueryParams|CommonErrors|UserRole|Permission|PermissionCheck|LogContext|TenantRole|User|Tenant|Billing|Subscription|Currency|ISODate|ReactNode)\s*\}\s+from\s+(['"][^'"]+['"])/g
    ];

    typeOnlyPatterns.forEach(pattern => {
      updated = updated.replace(pattern, (match, imports, module) => {
        // Check if already type-only
        if (match.includes('import type')) return match;

        changes++;
        return `import type { ${imports} } from ${module}`;
      });
    });

    // Pattern 2: Mixed imports - separate types from values
    const mixedImportPattern = /import\s+\{\s*([^}]+)\s*\}\s+from\s+(['"][^'"]+['"])/g;

    updated = updated.replace(mixedImportPattern, (match, imports, module) => {
      if (match.includes('import type')) return match;

      const importList = imports.split(',').map(imp => imp.trim());
      const types = [];
      const values = [];

      importList.forEach(imp => {
        // Heuristics for type vs value
        if (imp.match(/^[A-Z].*(?:Type|Interface|Schema|Config|Props|State|Context|Options|Params|Result|Response|Request|Error|Handler|Validator)$/) ||
            imp.match(/^(AIRequest|ApiResponse|User|Tenant|Permission|ReactNode|ISODate)$/)) {
          types.push(imp);
        } else {
          values.push(imp);
        }
      });

      if (types.length > 0 && values.length > 0) {
        changes++;
        return `import { ${values.join(', ')} } from ${module};\nimport type { ${types.join(', ')} } from ${module}`;
      }

      return match;
    });

    return { content: updated, changes };
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.fixImportSyntax(content);

      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content);
        this.fixedFiles.push({
          file: filePath,
          changes: result.changes
        });
        this.log(`Fixed ${result.changes} import issues in ${path.basename(filePath)}`, 'success');
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  }

  async execute() {
    this.log('🔧 Starting Import Syntax Fixer...', 'info');

    // Get current error count
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('No TypeScript errors found!', 'success');
      return;
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorLines = errorOutput.split('\n').filter(line =>
        line.includes('error TS1484') || line.includes('type-only import')
      );
      this.errorCount = errorLines.length;
      this.log(`Found ${this.errorCount} import syntax errors`, 'warning');
    }

    // Process all TypeScript files
    const files = this.findTypeScriptFiles('shared');
    this.log(`Processing ${files.length} TypeScript files...`, 'info');

    for (const file of files) {
      await this.processFile(file);
    }

    // Verify fixes
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('🎉 All import syntax errors fixed!', 'success');
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
      const remainingErrors = errorOutput.split('\n').filter(line =>
        line.includes('error TS')
      ).length;

      this.log(`${remainingErrors} TypeScript errors remaining`, 'warning');
    }

    // Report
    console.log('\n📊 Import Syntax Fix Report:');
    console.log(`Files processed: ${files.length}`);
    console.log(`Files fixed: ${this.fixedFiles.length}`);
    console.log(`Total changes: ${this.fixedFiles.reduce((sum, f) => sum + f.changes, 0)}`);

    if (this.fixedFiles.length > 0) {
      console.log('\nFixed files:');
      this.fixedFiles.forEach(f => {
        console.log(`  - ${path.basename(f.file)}: ${f.changes} changes`);
      });
    }
  }
}

new ImportSyntaxFixer().execute().catch(console.error);
