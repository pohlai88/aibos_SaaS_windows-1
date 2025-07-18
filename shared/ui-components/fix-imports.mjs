#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const fixImports = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix missing commas in import statements
  const fixPatterns = [
    // Fix patterns like "Users," without trailing comma issue
    /import\s*{\s*([^}]*)\s*}\s*from\s*['"]lucide-react['"];/g
  ];

  const originalContent = content;

  // Fix specific broken patterns
  content = content.replace(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"];/g, (match, imports) => {
    // Split by whitespace and commas, filter out empty strings
    const importList = imports.split(/[,\s]+/).filter(item => item.trim().length > 0);
    // Rejoin with proper commas
    const fixedImports = importList.join(', ');
    return `import { ${fixedImports} } from 'lucide-react';`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in ${path.basename(filePath)}`);
    return true;
  }
  return false;
};

// Process all TypeScript files in src
const walkDir = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  });
  return files;
};

const files = walkDir('./src');
let fixedCount = 0;

files.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n🎯 Fixed imports in ${fixedCount} files`);
