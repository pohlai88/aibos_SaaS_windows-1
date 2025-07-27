#!/usr/bin/env node

/**
 * AI-BOS Backend Syntax Recovery Script
 * Fixes all corrupted syntax with underscores in backend files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_DIR = path.join(__dirname, '../railway-1/backend/src');

// Patterns to fix
const FIX_PATTERNS = [
  // Route handlers
  { pattern: /_async\s*\(/g, replacement: 'async (' },
  { pattern: /_req/g, replacement: 'req' },
  { pattern: /_res/g, replacement: 'res' },
  { pattern: /_next/g, replacement: 'next' },
  { pattern: /_filename/g, replacement: 'filename' },
  { pattern: /_eventType/g, replacement: 'eventType' },
  { pattern: /_message/g, replacement: 'message' },
  { pattern: /_error/g, replacement: 'error' },
  { pattern: /_data/g, replacement: 'data' },
  { pattern: /_client/g, replacement: 'client' },
  { pattern: /_ws/g, replacement: 'ws' },
  { pattern: /_req\.socket/g, replacement: 'req.socket' },

  // Event handlers
  { pattern: /_\('([^']+)'/g, replacement: "('$1'" },
  { pattern: /_\('([^']+)',\s*_\(/g, replacement: "('$1', (" },
  { pattern: /_\('([^']+)',\s*_async\s*\(/g, replacement: "('$1', async (" },

  // Function calls
  { pattern: /_\('/g, replacement: "'" },
  { pattern: /_\(/g, replacement: '(' },
  { pattern: /_\)/g, replacement: ')' },

  // Variables
  { pattern: /_PORT/g, replacement: 'PORT' },
  { pattern: /_NODE_ENV/g, replacement: 'NODE_ENV' },
  { pattern: /_manifestsDir/g, replacement: 'manifestsDir' },

  // Method calls
  { pattern: /\.on\(_/g, replacement: '.on(' },
  { pattern: /\.forEach\(_/g, replacement: '.forEach(' },
  { pattern: /\.listen\(_/g, replacement: '.listen(' },
  { pattern: /\.close\(_/g, replacement: '.close(' },
  { pattern: /\.emit\(_/g, replacement: '.emit(' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixed = false;

    for (const { pattern, replacement } of FIX_PATTERNS) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    }

    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findTypeScriptFiles(dir) {
  const files = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

function main() {
  console.log('🔧 AI-BOS Backend Syntax Recovery Script');
  console.log('==========================================');

  if (!fs.existsSync(BACKEND_DIR)) {
    console.error(`❌ Backend directory not found: ${BACKEND_DIR}`);
    process.exit(1);
  }

  const files = findTypeScriptFiles(BACKEND_DIR);
  console.log(`📁 Found ${files.length} TypeScript files to check`);

  let fixedCount = 0;

  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Fixed ${fixedCount} files`);
  console.log(`📁 Total files checked: ${files.length}`);

  if (fixedCount > 0) {
    console.log('\n🧪 Running type check to verify fixes...');
    try {
      execSync('npm run type-check', {
        cwd: path.join(__dirname, '../railway-1/backend'),
        stdio: 'inherit'
      });
      console.log('✅ Type check passed!');
    } catch (error) {
      console.log('⚠️ Type check still has issues - manual review needed');
    }
  } else {
    console.log('✅ No syntax corruption found');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, findTypeScriptFiles, FIX_PATTERNS };
