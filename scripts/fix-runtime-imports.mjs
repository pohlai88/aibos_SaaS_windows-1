#!/usr/bin/env node
/**
 * Fix Runtime Import Issues
 * Corrects imports that were incorrectly marked as type-only
 */

import fs from 'fs';
import path from 'path';

class RuntimeImportFixer {
  constructor() {
    this.fixedFiles = [];
  }

  log(message, type = 'info') {
    const prefix = { info: '💡', success: '✅', warning: '⚠️', error: '❌' }[type];
    console.log(`${prefix} ${message}`);
  }

  fixFile(filePath) {
    if (!fs.existsSync(filePath)) return false;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Specific fixes for runtime values that were incorrectly marked as type-only
    const fixes = [
      // React hooks are runtime values, not types
      {
        pattern: /import type \{ ([^}]*(?:useEffect|useState|useRef|useMemo|useCallback)[^}]*) \} from 'react'/g,
        replacement: 'import { $1 } from \'react\''
      },

      // Enums are runtime values when used with z.nativeEnum
      {
        pattern: /import type \{ (UserRole) \} from ([^;]+);/g,
        replacement: 'import { $1 } from $2;'
      },

      {
        pattern: /import type \{ (Permission) \} from ([^;]+);/g,
        replacement: 'import { $1 } from $2;'
      },

      // API error codes when used in runtime mappings
      {
        pattern: /import type \{ (ApiErrorCode) \} from ([^;]+);/g,
        replacement: 'import { $1 } from $2;'
      },

      // Schemas when used in runtime validation
      {
        pattern: /import type \{ (UserSchema) \} from ([^;]+);/g,
        replacement: 'import { $1 } from $2;'
      }
    ];

    fixes.forEach(fix => {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) changed = true;
    });

    // Fix specific runtime usage issues
    const runtimeFixes = [
      // Fix body undefined issue in fetch
      {
        pattern: /body: data \? JSON\.stringify\(data\) : undefined,/g,
        replacement: 'body: data ? JSON.stringify(data) : null,'
      },

      // Fix property access from index signature
      {
        pattern: /process\.env\.NODE_ENV/g,
        replacement: 'process.env[\'NODE_ENV\']'
      },

      // Remove unused imports
      {
        pattern: /import type \{ [^}]*ISODate[^}]* \} from [^;]+;\n/g,
        replacement: ''
      }
    ];

    runtimeFixes.forEach(fix => {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) changed = true;
    });

    if (changed) {
      fs.writeFileSync(filePath, content);
      return true;
    }

    return false;
  }

  async execute() {
    this.log('🔧 Fixing Runtime Import Issues...', 'info');

    // Target specific problematic files
    const filesToFix = [
      'shared/ui-components/src/utils/ssrUtils.ts',
      'shared/utils/apiFetcher.ts',
      'shared/utils/permissionHandlers.ts',
      'shared/utils/protectedFetch.ts',
      'shared/validation/roles.schema.ts',
      'shared/validation/user.schema.ts',
      'shared/validation/user.validation.ts',
      'shared/validation/api.validation.ts',
      'shared/validation/assertions.ts',
      'vite.config.ts'
    ];

    let fixedCount = 0;

    for (const file of filesToFix) {
      if (this.fixFile(file)) {
        this.fixedFiles.push(file);
        fixedCount++;
        this.log(`Fixed runtime imports in ${path.basename(file)}`, 'success');
      }
    }

    // Add type definitions for missing dependencies
    const viteTypesPath = 'types/vite-plugins.d.ts';
    const viteTypes = `
// Type definitions for Vite plugins
declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}

declare module 'rollup-plugin-visualizer' {
  export const visualizer: any;
}

declare module 'vite-plugin-pwa' {
  export const VitePWA: any;
}

declare module 'vite-plugin-compression2' {
  export const compression: any;
}
`;

    fs.writeFileSync(viteTypesPath, viteTypes);
    this.log('Added Vite plugin type definitions', 'success');

    console.log(`\n📊 Runtime Import Fix Results:`);
    console.log(`Files fixed: ${fixedCount}`);
    console.log(`Type definitions added: 1`);

    return fixedCount;
  }
}

new RuntimeImportFixer().execute().catch(console.error);
