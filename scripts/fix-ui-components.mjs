#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const uiComponentsDir = path.join(projectRoot, 'shared', 'ui-components', 'src');

console.log('🔧 Fixing UI Components Syntax Errors...\n');

let totalFixed = 0;
let totalFiles = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixed = false;

    // Fix common syntax errors
    const fixes = [
      // Fix missing semicolons in object properties
      {
        pattern: /(\w+):\s*'([^']+)',?\s*\n\s*(\w+):/g,
        replacement: "$1: '$2',\n  $3:"
      },
      // Fix missing semicolons at end of object properties
      {
        pattern: /(\w+):\s*'([^']+)'\s*\n\s*}/g,
        replacement: "$1: '$2',\n  }"
      },
      // Fix missing commas in object literals
      {
        pattern: /(\w+):\s*'([^']+)'\s*\n\s*(\w+):/g,
        replacement: "$1: '$2',\n  $3:"
      },
      // Fix stray semicolons
      {
        pattern: /;\s*\n\s*;/g,
        replacement: ";\n"
      },
      // Fix malformed import statements
      {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*'([^']+)'\s*;\s*\n\s*import/g,
        replacement: "import { $1 } from '$2';\nimport"
      },
      // Fix missing return statements
      {
        pattern: /}\s*\n\s*;\s*\n\s*}/g,
        replacement: "}\n  }"
      },
      // Fix malformed JSX
      {
        pattern: /\)\s*;\s*\n\s*\)/g,
        replacement: ")\n  )"
      },
      // Fix missing parentheses
      {
        pattern: /\(\s*\)\s*;\s*\n\s*\)/g,
        replacement: "()\n  )"
      }
    ];

    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    });

    // Special fixes for specific files
    if (filePath.includes('MultiTenantThemeManager.tsx')) {
      // Fix the theme definitions array
      content = content.replace(
        /shadows:\s*{\s*([^}]+)\s*}\s*\n\s*}\s*,/g,
        'shadows: {\n    $1\n  }\n},'
      );
      fixed = true;
    }

    if (filePath.includes('NestedThemeProvider.tsx')) {
      // Fix import statements
      content = content.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*'([^']+)'\s*;\s*\n\s*}/g,
        "import { $1 } from '$2';\n}"
      );
      // Fix object literals
      content = content.replace(
        /(\w+):\s*'([^']+)',\s*\n\s*(\w+):/g,
        "$1: '$2',\n  $3:"
      );
      fixed = true;
    }

    if (filePath.includes('animationUtils.ts')) {
      // Fix export statements
      content = content.replace(
        /}\s*;\s*\n\s*}/g,
        "}\n}"
      );
      fixed = true;
    }

    if (filePath.includes('memoryManagement.ts')) {
      // Fix useEffect hooks
      content = content.replace(
        /useEffect\(\s*\(\s*\)\s*=>\s*{\s*\n\s*([^}]+)\s*}\s*,\s*\[\s*\]\s*\)\s*;\s*\n\s*}/g,
        "useEffect(() => {\n  $1\n}, []);\n}"
      );
      fixed = true;
    }

    if (filePath.includes('ssrUtils.ts')) {
      // Fix early returns
      content = content.replace(
        /if\s*\(\s*!\s*isMounted\s*\)\s*return\s*,/g,
        "if (!isMounted) return;"
      );
      fixed = true;
    }

    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(projectRoot, filePath)}`);
      totalFixed++;
    }

    totalFiles++;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  }
}

// Process all UI component files
processDirectory(uiComponentsDir);

console.log(`\n📊 UI Components Fix Report:`);
console.log(`Files processed: ${totalFiles}`);
console.log(`Files fixed: ${totalFixed}`);
console.log(`Total changes: ${totalFixed}`);

if (totalFixed > 0) {
  console.log('\n🎉 UI Components syntax errors have been fixed!');
} else {
  console.log('\n✨ No syntax errors found in UI components.');
}
