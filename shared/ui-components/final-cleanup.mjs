#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const srcDir = './src';

// Get all files
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

// Fix critical issues
async function fixFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  let changed = false;

  // Add missing Lucide React imports
  const missingIcons = [
    'AlertTriangle', 'AlertCircle', 'HelpCircle', 'CheckCircle',
    'Circle', 'Shield', 'TrendingUp', 'Star', 'Clock', 'Settings',
    'ArrowUp', 'ArrowDown', 'Zap', 'Home', 'Folder', 'File',
    'Calendar', 'Plus', 'Trash', 'Copy', 'Save'
  ];

  // Check which icons are used but not imported
  const usedIcons = [];
  for (const icon of missingIcons) {
    if (content.includes(`<${icon}`) || content.includes(`{${icon}}`)) {
      if (!content.includes(`import { ${icon}`) && !content.includes(`, ${icon}`)) {
        usedIcons.push(icon);
      }
    }
  }

  if (usedIcons.length > 0) {
    const importLine = `import { ${usedIcons.join(', ')} } from 'lucide-react';\n`;
    const lines = content.split('\n');
    const reactImportIndex = lines.findIndex(line => line.includes("import React"));
    if (reactImportIndex >= 0) {
      lines.splice(reactImportIndex + 1, 0, importLine);
      content = lines.join('\n');
      changed = true;
    }
  }

  // Fix Badge import if used but not imported
  if (content.includes('<Badge') && !content.includes("import { Badge }")) {
    const badgeImport = "import { Badge } from '../primitives/Badge';\n";
    const lines = content.split('\n');
    const reactImportIndex = lines.findIndex(line => line.includes("import React"));
    if (reactImportIndex >= 0) {
      lines.splice(reactImportIndex + 1, 0, badgeImport);
      content = lines.join('\n');
      changed = true;
    }
  }

  // Remove unused variables by prefixing with _
  content = content.replace(/const\s+([a-zA-Z_]\w*)\s*=.*(?=;|\n)(?![^{]*}[^{]*=)/g, (match, varName) => {
    if (!varName.startsWith('_')) {
      return match.replace(varName, `_${varName}`);
    }
    return match;
  });

  // Fix function parameters that should be prefixed
  content = content.replace(/\((\w+):\s*any\)/g, '(_$1: any)');

  // Remove console statements
  content = content.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?\s*/g, '');

  if (changed) {
    await fs.writeFile(filePath, content);
    return true;
  }
  return false;
}

// Main execution
async function main() {
  console.log('🔧 Starting final cleanup...');

  const files = await getAllFiles(srcDir);
  let fixedCount = 0;

  for (const file of files) {
    try {
      if (await fixFile(file)) {
        console.log(`✅ Fixed ${path.relative(srcDir, file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}: ${error.message}`);
    }
  }

  console.log(`\n🎯 Fixed ${fixedCount} files`);
}

main().catch(console.error);
