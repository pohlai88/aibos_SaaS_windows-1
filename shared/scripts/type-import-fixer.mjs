#!/usr/bin/env node

/* eslint-env node */
/* global console, process */

/**
 * Type Import Fixer
 * Automatically fixes type-only import issues in TypeScript files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

class TypeImportFixer {
  constructor() {
    this.fixCount = 0;
    this.errors = [];
  }

  async run() {
    console.log('🔧 Type Import Fixer');
    console.log('='.repeat(50));

    try {
      // Get TypeScript files with errors
      const files = this.getFilesWithErrors();

      for (const file of files) {
        await this.fixFile(file);
      }

      console.log(`\n✅ Fixed ${this.fixCount} type import issues`);

      if (this.errors.length > 0) {
        console.log('\n⚠️  Some files could not be fixed:');
        this.errors.forEach(error => console.log(`   - ${error}`));
      }
    } catch (error) {
      console.error('💥 Type Import Fixer failed:', error);
      process.exit(1);
    }
  }

  getFilesWithErrors() {
    try {
      const output = execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('TS1484') || line.includes('verbatimModuleSyntax')) {
          const match = line.match(/^([^:]+):/);
          if (match) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    } catch (error) {
      // Expected to fail with type errors
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const lines = output.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('TS1484') || line.includes('verbatimModuleSyntax')) {
          const match = line.match(/^([^:]+):/);
          if (match) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    }
  }

  async fixFile(file) {
    if (!existsSync(file)) {
      this.errors.push(`File not found: ${file}`);
      return;
    }

    try {
      console.log(`\n🔧 Fixing ${file}...`);
      let content = readFileSync(file, 'utf8');
      const originalContent = content;

      // Fix pattern 1: Convert mixed imports to separate type imports
      content = this.fixMixedImports(content);

      // Fix pattern 2: Add 'type' modifier to type-only imports
      content = this.fixTypeOnlyImports(content);

      if (content !== originalContent) {
        writeFileSync(file, content);
        this.fixCount++;
        console.log(`  ✅ Fixed type imports in ${file}`);
      } else {
        console.log(`  ℹ️  No fixes needed in ${file}`);
      }
    } catch (error) {
      this.errors.push(`Error fixing ${file}: ${error.message}`);
      console.log(`  ❌ Failed to fix ${file}`);
    }
  }

  fixMixedImports(content) {
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g;

    return content.replace(importRegex, (match, imports, source) => {
      const importItems = imports.split(',').map(item => item.trim());
      const typeImports = [];
      const valueImports = [];

      for (const item of importItems) {
        if (this.isTypeOnlyUsage(content, item)) {
          typeImports.push(item);
        } else {
          valueImports.push(item);
        }
      }

      let result = '';
      if (valueImports.length > 0) {
        result += `import { ${valueImports.join(', ')} } from '${source}';\n`;
      }
      if (typeImports.length > 0) {
        result += `import type { ${typeImports.join(', ')} } from '${source}';`;
      }

      return result;
    });
  }

  fixTypeOnlyImports(content) {
    const typeImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g;

    return content.replace(typeImportRegex, (match, imports, source) => {
      if (this.isTypeOnlyImport(content, imports)) {
        return `import type { ${imports} } from '${source}';`;
      }
      return match;
    });
  }

  isTypeOnlyUsage(content, importName) {
    const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
    const matches = content.match(usageRegex) || [];

    const typeUsageRegex = new RegExp(`(:\\s*${importName}|extends\\s+${importName}|implements\\s+${importName}|<${importName}>)`, 'g');
    const typeMatches = content.match(typeUsageRegex) || [];

    return typeMatches.length > 0 && matches.length === typeMatches.length + 1;
  }

  isTypeOnlyImport(content, imports) {
    const importItems = imports.split(',').map(item => item.trim());
    return importItems.every(item => this.isTypeOnlyUsage(content, item));
  }
}

// Run the fixer
const fixer = new TypeImportFixer();
fixer.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
