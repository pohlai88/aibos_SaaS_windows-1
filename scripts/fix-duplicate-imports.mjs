#!/usr/bin/env node
/**
 * Fix Duplicate Clock Imports
 * Removes duplicate Clock imports from lucide-react
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixDuplicateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find lucide-react import block and fix duplicates
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/g;
    const match = importRegex.exec(content);

    if (match) {
      const imports = match[1]
        .split(',')
        .map(imp => imp.trim())
        .filter(imp => imp.length > 0);

      // Remove duplicates
      const uniqueImports = [...new Set(imports)];

      if (imports.length !== uniqueImports.length) {
        const newImportBlock = `import {\n  ${uniqueImports.join(',\n  ')}\n} from 'lucide-react';`;
        content = content.replace(match[0], newImportBlock);

        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed duplicates in: ${filePath}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Fix specific files with duplicate Clock imports
const filesToFix = [
  path.join(__dirname, '..', 'shared', 'ui-components', 'src', 'feedback', 'ConfirmDialog.tsx'),
  path.join(__dirname, '..', 'shared', 'ui-components', 'src', 'layout', 'Breadcrumb.tsx'),
  path.join(__dirname, '..', 'shared', 'ui-components', 'src', 'layout', 'Tabs.tsx')
];

console.log('🔧 Fixing duplicate Clock imports...');

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    fixDuplicateImports(file);
  }
}

console.log('🎉 Duplicate import fixes completed!');
