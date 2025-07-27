#!/usr/bin/env node

/**
 * AI-BOS Manifest Duplicate Keys Fix Script
 * Fixes duplicate object keys in manifest files by restructuring routes
 */

const fs = require('fs');
const path = require('path');

const MANIFESTS_DIR = path.join(__dirname, '../railway-1/backend/src/manifests');

function fixManifestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);

    if (!manifest.api || !manifest.api.routes) {
      return false;
    }

    const routes = manifest.api.routes;
    const newRoutes = {};
    let fixed = false;

    // Group routes by path and method
    for (const [routePath, routeConfig] of Object.entries(routes)) {
      if (!newRoutes[routePath]) {
        newRoutes[routePath] = {};
      }

      if (routeConfig.method) {
        // Old format: { method: "GET", ... }
        newRoutes[routePath][routeConfig.method] = {
          permissions: routeConfig.permissions,
          rateLimit: routeConfig.rateLimit,
          validation: routeConfig.validation
        };
        fixed = true;
      } else {
        // Already in new format or other structure
        newRoutes[routePath] = routeConfig;
      }
    }

    if (fixed) {
      manifest.api.routes = newRoutes;
      fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findManifestFiles(dir) {
  const files = [];

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.manifest.json')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

function main() {
  console.log('🔧 AI-BOS Manifest Duplicate Keys Fix Script');
  console.log('=============================================');

  if (!fs.existsSync(MANIFESTS_DIR)) {
    console.error(`❌ Manifests directory not found: ${MANIFESTS_DIR}`);
    process.exit(1);
  }

  const files = findManifestFiles(MANIFESTS_DIR);
  console.log(`📁 Found ${files.length} manifest files to check`);

  let fixedCount = 0;

  for (const file of files) {
    if (fixManifestFile(file)) {
      fixedCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Fixed ${fixedCount} files`);
  console.log(`📁 Total files checked: ${files.length}`);

  if (fixedCount > 0) {
    console.log('\n🧪 Running JSON validation...');
    let validationErrors = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content); // This will throw if JSON is invalid
      } catch (error) {
        console.error(`❌ JSON validation failed for ${path.relative(process.cwd(), file)}:`, error.message);
        validationErrors++;
      }
    }

    if (validationErrors === 0) {
      console.log('✅ All manifest files are valid JSON');
    } else {
      console.log(`❌ ${validationErrors} files have JSON validation errors`);
    }
  } else {
    console.log('✅ No duplicate key issues found');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixManifestFile, findManifestFiles };
