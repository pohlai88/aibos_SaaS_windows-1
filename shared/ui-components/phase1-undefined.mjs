#!/usr/bin/env node

/**
 * Phase 1A: Undefined Variables & Missing Imports Fix
 * Target: Reduce ~80 errors from no-undef issues
 * Progress: RED → YELLOW Zone (first milestone)
 */

import fs from 'fs/promises';
import path from 'path';

const srcDir = './src';

// High-impact undefined variable fixes
const UNDEFINED_FIXES = {
  // Most common Lucide React icons causing errors
  'CheckCircle': "import { CheckCircle } from 'lucide-react';",
  'Clock': "import { Clock } from 'lucide-react';",
  'Settings': "import { Settings } from 'lucide-react';",
  'TrendingUp': "import { TrendingUp } from 'lucide-react';",
  'TrendingDown': "import { TrendingDown } from 'lucide-react';",
  'AlertTriangle': "import { AlertTriangle } from 'lucide-react';",
  'AlertCircle': "import { AlertCircle } from 'lucide-react';",
  'HelpCircle': "import { HelpCircle } from 'lucide-react';",
  'Star': "import { Star } from 'lucide-react';",
  'ArrowUp': "import { ArrowUp } from 'lucide-react';",
  'ArrowDown': "import { ArrowDown } from 'lucide-react';",
  'Zap': "import { Zap } from 'lucide-react';",
  'Home': "import { Home } from 'lucide-react';",
  'Folder': "import { Folder } from 'lucide-react';",
  'File': "import { File } from 'lucide-react';",
  'Calendar': "import { Calendar } from 'lucide-react';",
  'Plus': "import { Plus } from 'lucide-react';",
  'Trash': "import { Trash } from 'lucide-react';",
  'Copy': "import { Copy } from 'lucide-react';",
  'Save': "import { Save } from 'lucide-react';",
  'Circle': "import { Circle } from 'lucide-react';",
  'Shield': "import { Shield } from 'lucide-react';",
  'Lock': "import { Lock } from 'lucide-react';",
  'Unlock': "import { Unlock } from 'lucide-react';",
  'HardDrive': "import { HardDrive } from 'lucide-react';",
  'Network': "import { Network } from 'lucide-react';",
  'Pause': "import { Pause } from 'lucide-react';",
  'ChevronLeft': "import { ChevronLeft } from 'lucide-react';",
  'ChevronRight': "import { ChevronRight } from 'lucide-react';",
  'Phone': "import { Phone } from 'lucide-react';",
  'Monitor': "import { Monitor } from 'lucide-react';",
  'Tablet': "import { Tablet } from 'lucide-react';",
  'GripVertical': "import { GripVertical } from 'lucide-react';",
  'Code': "import { Code } from 'lucide-react';",
  'Palette': "import { Palette } from 'lucide-react';",

  // Internal component imports
  'Badge': "import { Badge } from '../primitives/Badge';",
  'Button': "import { Button } from '../primitives/Button';",
  'Input': "import { Input } from '../primitives/Input';",
  'Modal': "import { Modal } from '../primitives/Modal';",
  'Progress': "import { Progress } from '../primitives/Progress';",
  'Tooltip': "import { Tooltip } from '../primitives/Tooltip';",
};

async function getAllFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(fullPath)));
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixFileUndefinedIssues(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  const original = content;
  let fixes = 0;

  // Find all undefined variables used in this file
  const usedUndefined = [];
  Object.keys(UNDEFINED_FIXES).forEach(variable => {
    const patterns = [
      new RegExp(`<${variable}[\\s/>]`, 'g'),     // JSX usage
      new RegExp(`{${variable}}`, 'g'),           // Object reference
      new RegExp(`${variable}\\s*=`, 'g'),        // Assignment
      new RegExp(`${variable}\\(`, 'g'),          // Function call
      new RegExp(`\\b${variable}\\b`, 'g')        // General reference
    ];

    const isUsed = patterns.some(pattern => pattern.test(content));
    const isImported = content.includes(`import { ${variable}`) ||
                      content.includes(`, ${variable}`) ||
                      content.includes(`import ${variable}`);

    if (isUsed && !isImported) {
      usedUndefined.push(variable);
    }
  });

  // Add missing imports
  if (usedUndefined.length > 0) {
    const lines = content.split('\n');
    const reactImportIndex = lines.findIndex(line => line.includes("import React"));
    const insertIndex = reactImportIndex >= 0 ? reactImportIndex + 1 : 0;

    // Group by import source
    const lucideIcons = usedUndefined.filter(v => UNDEFINED_FIXES[v].includes('lucide-react'));
    const componentImports = usedUndefined.filter(v => UNDEFINED_FIXES[v].includes('../primitives/'));

    if (lucideIcons.length > 0) {
      const lucideImport = `import { ${lucideIcons.join(', ')} } from 'lucide-react';`;
      lines.splice(insertIndex, 0, lucideImport);
      fixes += lucideIcons.length;
    }

    if (componentImports.length > 0) {
      componentImports.forEach(comp => {
        lines.splice(insertIndex, 0, UNDEFINED_FIXES[comp]);
        fixes++;
      });
    }

    content = lines.join('\n');
  }

  // Fix common variable naming pollution that causes undefined errors
  const namingFixes = {
    // Fix _variable references that should be variable
    '_value': 'value',
    '_data': 'data',
    '_row': 'row',
    '_column': 'column',
    '_options': 'options',
    '_config': 'config'
  };

  Object.entries(namingFixes).forEach(([from, to]) => {
    // Only fix usage, not type definitions
    const usageRegex = new RegExp(`\\b${from}\\b(?![:]|\\s*:)`, 'g');
    const beforeCount = (content.match(usageRegex) || []).length;
    content = content.replace(usageRegex, to);
    const afterCount = (content.match(usageRegex) || []).length;
    fixes += beforeCount - afterCount;
  });

  if (content !== original) {
    await fs.writeFile(filePath, content);
    return fixes;
  }
  return 0;
}

async function main() {
  console.log('🎯 Phase 1A: Fixing Undefined Variables & Missing Imports');
  console.log('Target: ~80 error reduction (RED → YELLOW zone progress)\n');

  const files = await getAllFiles(srcDir);
  let totalFixes = 0;
  const fileResults = [];

  for (const file of files) {
    try {
      const fixes = await fixFileUndefinedIssues(file);
      if (fixes > 0) {
        const relativePath = path.relative(srcDir, file);
        console.log(`✅ Fixed ${fixes} undefined issues in ${relativePath}`);
        totalFixes += fixes;
        fileResults.push({ file: relativePath, fixes });
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}: ${error.message}`);
    }
  }

  console.log(`\n📊 Phase 1A Results:`);
  console.log(`   Total fixes applied: ${totalFixes}`);
  console.log(`   Files modified: ${fileResults.length}`);
  console.log(`   Estimated error reduction: ~${Math.min(80, totalFixes)}`);

  // Show progress estimation
  const currentErrors = 544; // From baseline
  const estimatedReduction = Math.min(80, totalFixes);
  const newErrorCount = currentErrors - estimatedReduction;
  const yellowTarget = 400;

  console.log(`\n🎯 Progress to YELLOW Zone:`);
  console.log(`   Before: ${currentErrors} errors`);
  console.log(`   After: ~${newErrorCount} errors`);
  console.log(`   Target: ${yellowTarget} errors`);

  const progressPercent = ((currentErrors - newErrorCount) / (currentErrors - yellowTarget)) * 100;
  console.log(`   Progress: ${Math.min(100, progressPercent).toFixed(1)}% to YELLOW zone`);

  if (newErrorCount <= yellowTarget) {
    console.log(`\n🎉 YELLOW ZONE ACHIEVED! 🟡`);
    console.log(`Next: Continue to GREEN zone with Phase 2!`);
  } else {
    const remaining = newErrorCount - yellowTarget;
    console.log(`\n⏭️  Next Steps:`);
    console.log(`   Still need to reduce ${remaining} more errors`);
    console.log(`   Run: npm run cleanup:phase1-react`);
    console.log(`   Then: npm run cleanup:phase1-types`);
  }

  console.log(`\n📈 Check progress: npm run zone:check`);
  console.log(`🔧 Continue: npm run cleanup:phase1-react`);
}

main().catch(console.error);
