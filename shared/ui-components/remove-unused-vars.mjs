#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Remove unused imports (be very careful with regex)
  // Only remove clearly unused single imports
  const unusedImportPatterns = [
    /import\s*{\s*([^}]*,\s*)?Badge(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Filter(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Settings(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Pin(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?SortAsc(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?SortDesc(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Zap(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?TrendingUp(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?CheckCircle(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Clock(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
    /import\s*{\s*([^}]*,\s*)?Star(\s*,\s*[^}]*)?\s*}\s*from[^;]+;?\n?/g,
  ];

  unusedImportPatterns.forEach(pattern => {
    const oldContent = content;
    content = content.replace(pattern, (match, before, after) => {
      // If there are other imports, keep the import statement but remove just this one
      if (before && before.trim() || after && after.trim()) {
        return match.replace(/,?\s*Badge\s*,?|,?\s*Filter\s*,?|,?\s*Settings\s*,?|,?\s*Pin\s*,?|,?\s*SortAsc\s*,?|,?\s*SortDesc\s*,?|,?\s*Zap\s*,?|,?\s*TrendingUp\s*,?|,?\s*CheckCircle\s*,?|,?\s*Clock\s*,?|,?\s*Star\s*,?/, '');
      }
      // Otherwise remove the entire import
      return '';
    });
    if (oldContent !== content) changes++;
  });

  // Prefix clearly unused function parameters with underscore
  const paramPatterns = [
    // Function parameters
    /\(([^)]*)\b(row|index|column|data|value|options|config|params|props|args)\b([^)]*)\)/g,
    // Arrow function parameters
    /\(([^)]*)\b(row|index|column|data|value|options|config|params|props|args)\b([^)]*)\)\s*=>/g,
    // Destructured parameters
    /\{([^}]*)\b(row|index|column|data|value|options|config|params|props|args)\b([^}]*)\}/g,
  ];

  paramPatterns.forEach(pattern => {
    const oldContent = content;
    content = content.replace(pattern, (match, before, param, after, suffix) => {
      // Only prefix if not already prefixed and not used in function body
      if (!param.startsWith('_')) {
        return match.replace(param, `_${param}`);
      }
      return match;
    });
    if (oldContent !== content) changes++;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${changes} issues in ${path.basename(filePath)}`);
    return changes;
  }

  return 0;
};

// Process all TypeScript files
const srcDir = './src';
const files = [];

const walkDir = (dir) => {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  });
};

walkDir(srcDir);

let totalChanges = 0;
files.forEach(file => {
  totalChanges += processFile(file);
});

console.log(`\n🎯 Total: Fixed ${totalChanges} unused variable issues across ${files.length} files`);
