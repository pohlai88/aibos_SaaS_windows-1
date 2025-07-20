#!/usr/bin/env node

/* eslint-env node */
/* global console, process */

/**
 * Index Signature Fixer
 * Automatically fixes index signature access issues in TypeScript files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

class IndexSignatureFixer {
  constructor() {
    this.fixCount = 0;
    this.errors = [];
  }

  async run() {
    console.log('🔧 Index Signature Fixer');
    console.log('='.repeat(50));

    try {
      // Get TypeScript files with errors
      const files = this.getFilesWithErrors();

      for (const file of files) {
        await this.fixFile(file);
      }

      console.log(`\n✅ Fixed ${this.fixCount} index signature issues`);

      if (this.errors.length > 0) {
        console.log('\n⚠️  Some files could not be fixed:');
        this.errors.forEach(error => console.log(`   - ${error}`));
      }
    } catch (error) {
      console.error('💥 Index Signature Fixer failed:', error);
      process.exit(1);
    }
  }

  getFilesWithErrors() {
    try {
      const output = execSync('npm run type-check', { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('TS4111') || line.includes('index signature')) {
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
        if (line.includes('TS4111') || line.includes('index signature')) {
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

      // Fix pattern 1: Convert dot notation to bracket notation
      content = this.fixDotNotation(content);

      // Fix pattern 2: Add index signatures to interfaces/types
      content = this.addIndexSignatures(content);

      if (content !== originalContent) {
        writeFileSync(file, content);
        this.fixCount++;
        console.log(`  ✅ Fixed index signatures in ${file}`);
      } else {
        console.log(`  ℹ️  No fixes needed in ${file}`);
      }
    } catch (error) {
      this.errors.push(`Error fixing ${file}: ${error.message}`);
      console.log(`  ❌ Failed to fix ${file}`);
    }
  }

  fixDotNotation(content) {
    // Find potential index signature objects
    const objectRegex = /interface\s+(\w+)\s*{[^}]*\[\s*\w+\s*:\s*string\s*\][^}]*}/g;
    const matches = content.matchAll(objectRegex);
    const indexTypes = new Set();

    for (const match of matches) {
      indexTypes.add(match[1]);
    }

    // Convert dot notation to bracket notation for these types
    for (const type of indexTypes) {
      const accessRegex = new RegExp(`(\\b${type}\\b.*?)\\.(\\w+)`, 'g');
      content = content.replace(accessRegex, (match, obj, prop) => {
        return `${obj}['${prop}']`;
      });
    }

    return content;
  }

  addIndexSignatures(content) {
    // Add index signatures to interfaces that might need them
    const interfaceRegex = /interface\s+(\w+)\s*{([^}]*)}/g;

    return content.replace(interfaceRegex, (match, name, body) => {
      if (this.needsIndexSignature(content, name)) {
        const hasIndexSignature = body.includes('[');
        if (!hasIndexSignature) {
          const newBody = body.trim() + (body.trim() ? ',\n  ' : '') + '[key: string]: any;';
          return `interface ${name} {${newBody}}`;
        }
      }
      return match;
    });
  }

  needsIndexSignature(content, typeName) {
    // Check if type is used with dynamic property access
    const dynamicAccessRegex = new RegExp(`\\b${typeName}\\b.*?\\[.*?\\]`, 'g');
    return dynamicAccessRegex.test(content);
  }
}

// Run the fixer
const fixer = new IndexSignatureFixer();
fixer.run().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
