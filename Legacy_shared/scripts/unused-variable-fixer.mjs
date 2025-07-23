#!/usr/bin/env node

/* eslint-env node */
/* global console, process */

/**
 * Unused Variable Fixer
 * Automatically fixes unused variable warnings in TypeScript files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

class UnusedVariableFixer {
  constructor() {
    this.fixCount = 0;
    this.errors = [];
  }

  async run() {
    console.log('🔧 Unused Variable Fixer');
    console.log('='.repeat(50));

    try {
      // Get TypeScript files with errors
      const files = this.getFilesWithErrors();

      for (const file of files) {
        await this.fixFile(file);
      }

      console.log(`\n✅ Fixed ${this.fixCount} unused variable issues`);

      if (this.errors.length > 0) {
        console.log('\n⚠️  Some files could not be fixed:');
        this.errors.forEach(error => console.log(`   - ${error}`));
      }
    } catch (error) {
      console.error('💥 Unused Variable Fixer failed:', error);
      process.exit(1);
    }
  }

  getFilesWithErrors() {
    try {
      const output = execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('TS6133')) {
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
        if (line.includes('TS6133')) {
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

      // Fix pattern 1: Remove unused imports
      content = this.removeUnusedImports(content);

      // Fix pattern 2: Prefix unused variables with underscore
      content = this.prefixUnusedVariables(content);

      if (content !== originalContent) {
        writeFileSync(file, content);
        this.fixCount++;
        console.log(`  ✅ Fixed unused variables in ${file}`);
      } else {
        console.log(`  ℹ️  No fixes needed in ${file}`);
      }
    } catch (error) {
      this.errors.push(`Error fixing ${file}: ${error.message}`);
      console.log(`  ❌ Failed to fix ${file}`);
    }
  }

  removeUnusedImports(content) {
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]\s*;?\s*\n?/g;

    return content.replace(importRegex, (match, imports, source) => {
      const importItems = imports.split(',').map(item => item.trim());
      const usedImports = importItems.filter(item => {
        const usageRegex = new RegExp(`\\b${item}\\b`, 'g');
        const matches = content.match(usageRegex) || [];
        return matches.length > 1; // More than just the import declaration
      });

      if (usedImports.length === 0) {
        return ''; // Remove entire import
      } else if (usedImports.length < importItems.length) {
        return `import { ${usedImports.join(', ')} } from '${source}';\n`;
      }
      return match;
    });
  }

  prefixUnusedVariables(content) {
    // Fix function parameters
    content = content.replace(/\((.*?)\)/g, (match, params) => {
      if (!params.trim()) return match;

      const fixedParams = params.split(',').map(param => {
        param = param.trim();
        if (param.startsWith('_')) return param;

        const name = param.split(':')[0].trim().split('=')[0].trim();
        if (name && !this.isVariableUsed(content, name)) {
          return param.replace(name, `_${name}`);
        }
        return param;
      });

      return `(${fixedParams.join(', ')})`;
    });

    // Fix variable declarations
    content = content.replace(/(?:let|const|var)\s+(\w+)(\s*:[^=;]+)?(\s*=[^;]+)?;/g, (match, name, type = '', value = '') => {
      if (name.startsWith('_')) return match;
      if (!this.isVariableUsed(content, name)) {
        return match.replace(name, `_${name}`);
      }
      return match;
    });

    return content;
  }

  isVariableUsed(content, name) {
    const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
    const matches = content.match(usageRegex) || [];
    return matches.length > 1; // More than just the declaration
  }
}

// Run the fixer
const fixer = new UnusedVariableFixer();
fixer.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
