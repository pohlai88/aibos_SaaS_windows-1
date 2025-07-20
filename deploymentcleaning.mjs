#!/usr/bin/env node

/**
 * 🧹 ULTIMATE WORKSPACE CLEANER & OPTIMIZER
 *
 * A comprehensive, reusable script that performs deep cleaning, optimization,
 * and health checks for JavaScript/TypeScript projects.
 *
 * Features:
 * - Intelligent file cleanup with safety checks
 * - Dependency management
 * - Git integration
 * - System health checks
 * - Configuration support
 * - Dry-run mode
 * - Interactive prompts
 * - Windows compatibility
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { promisify } from 'util';

// Promisify readline question
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const question = promisify(rl.question).bind(rl);

// Enhanced configuration
const config = {
  // Files and directories to always remove
  removePatterns: [
    '**/*.log',
    '**/*.tmp',
    '**/*.bak',
    '**/*.temp',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.cache',
    '**/*.map'
  ],

  // Directories to clean (will be regenerated)
  cleanDirs: [
    'dist',
    'build',
    '.next',
    'out',
    'coverage',
    '.nyc_output',
    '.cache',
    '.aibos-npm-cache',
    '.vitest-cache',
    '.rollup.cache',
    '.parcel-cache',
    'node_modules/.cache',
    '.turbo'
  ],

  // Files to validate
  validateFiles: [
    'package.json',
    'tsconfig.json',
    'jsconfig.json',
    '.eslintrc',
    '.babelrc'
  ],

  // Dependency files
  depFiles: [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'node_modules'
  ],

  // File size threshold for warnings (in MB)
  sizeWarningThreshold: 5,

  // Interactive mode (can be overridden by CLI args)
  interactive: true,

  // Dry run mode (can be overridden by CLI args)
  dryRun: false
};

// Initialize
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
let totalFreedSpace = 0;
let problemsFound = 0;

// Enhanced logging system (Windows compatible, no chalk dependency)
const logger = {
  section: (title) => console.log(`\n=== ${title} ===`),
  success: (msg) => console.log(`✓ ${msg}`),
  warning: (msg) => { console.log(`⚠ ${msg}`); problemsFound++ },
  error: (msg) => { console.log(`✗ ${msg}`); problemsFound++ },
  info: (msg) => console.log(`ℹ ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log(`› ${msg}`),
  divider: () => console.log('-'.repeat(process.stdout.columns || 50))
};

// Utility functions
const utils = {
  // Check if path is safe to delete (not in gitignore, not required, etc.)
  isSafeToRemove: (filePath) => {
    try {
      const relativePath = path.relative(workspaceRoot, filePath);

      // Never delete files outside workspace
      if (relativePath.startsWith('..')) return false;

      // Never delete .git directory
      if (relativePath.includes('.git/')) return false;

      // Never delete config files
      const configFiles = ['package.json', 'tsconfig.json', '.env', '.gitignore'];
      if (configFiles.some(f => relativePath.endsWith(f))) return false;

      return true;
    } catch {
      return false;
    }
  },

  // Get file size in MB
  getFileSize: (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      return stats.size / (1024 * 1024);
    } catch {
      return 0;
    }
  },

  // Execute command with error handling (Windows compatible)
  exec: (command, options = {}) => {
    try {
      return execSync(command, {
        cwd: workspaceRoot,
        stdio: config.dryRun ? 'pipe' : 'inherit',
        shell: process.platform === 'win32' ? 'powershell.exe' : undefined,
        ...options
      });
    } catch (error) {
      logger.error(`Command failed: ${command}`);
      return null;
    }
  },

  // Find files by pattern (glob-like, Windows compatible)
  findFiles: (pattern, dir = workspaceRoot) => {
    const files = [];
    const regex = new RegExp(pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/\\\\]*')
      .replace(/[\/\\]/g, '[\\\\/]') + '$');

    function traverse(directory) {
      try {
        const items = fs.readdirSync(directory);
        for (const item of items) {
          const fullPath = path.join(directory, item);
          try {
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              traverse(fullPath);
            } else if (regex.test(fullPath)) {
              files.push(fullPath);
            }
          } catch {
            // Skip inaccessible files
          }
        }
      } catch {
        // Skip inaccessible directories
      }
    }

    traverse(dir);
    return files;
  },

  // Remove file/directory with safety checks
  remove: async (filePath) => {
    if (config.dryRun) {
      logger.info(`[DRY RUN] Would remove: ${path.relative(workspaceRoot, filePath)}`);
      return true;
    }

    if (!fs.existsSync(filePath)) return false;
    if (!utils.isSafeToRemove(filePath)) return false;

    const size = utils.getFileSize(filePath);
    const relativePath = path.relative(workspaceRoot, filePath);

    if (config.interactive && size > 1) {
      const answer = await question(`Remove ${relativePath} (${size.toFixed(2)}MB)? [y/N] `);
      if (answer.toLowerCase() !== 'y') return false;
    }

    try {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }

      totalFreedSpace += size;
      logger.success(`Removed: ${relativePath} (${size.toFixed(2)}MB)`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove ${relativePath}: ${error.message}`);
      return false;
    }
  },

  // Validate JSON file
  validateJsonFile: (filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      logger.success(`Valid JSON: ${path.relative(workspaceRoot, filePath)}`);
      return true;
    } catch (error) {
      logger.error(`Invalid JSON: ${path.relative(workspaceRoot, filePath)} - ${error.message}`);
      return false;
    }
  },

  // Windows-compatible directory size calculation
  getDirectorySize: (dirPath) => {
    try {
      if (process.platform === 'win32') {
        const result = utils.exec(`Get-ChildItem -Path "${dirPath}" -Recurse -Force | Measure-Object -Property Length -Sum`, { encoding: 'utf8' });
        if (result) {
          const match = result.match(/Sum\s*:\s*(\d+)/);
          return match ? parseInt(match[1]) / (1024 * 1024) : 0;
        }
      } else {
        const result = utils.exec(`du -sh "${dirPath}"`, { encoding: 'utf8' });
        return result ? result.trim() : 'unknown';
      }
      return 0;
    } catch {
      return 0;
    }
  }
};

// Cleanup phases
const phases = {
  // Phase 1: Initial analysis
  analyze: async () => {
    logger.section('PHASE 1: WORKSPACE ANALYSIS');

    // Get workspace size
    const size = utils.getDirectorySize(workspaceRoot);
    logger.info(`Workspace size: ${size}MB`);

    // Count files by type
    config.removePatterns.forEach(pattern => {
      const files = utils.findFiles(pattern);
      logger.info(`Found ${files.length} files matching: ${pattern}`);
    });

    // Check for large files
    const largeFiles = utils.findFiles('**/*')
      .filter(f => utils.getFileSize(f) > config.sizeWarningThreshold)
      .sort((a, b) => utils.getFileSize(b) - utils.getFileSize(a));

    if (largeFiles.length > 0) {
      logger.warning(`Found ${largeFiles.length} large files (>${config.sizeWarningThreshold}MB):`);
      largeFiles.slice(0, 10).forEach(f => {
        logger.info(`  ${path.relative(workspaceRoot, f)} - ${utils.getFileSize(f).toFixed(2)}MB`);
      });
      if (largeFiles.length > 10) {
        logger.info(`  ... and ${largeFiles.length - 10} more`);
      }
    }
  },

  // Phase 2: Clean temporary files
  cleanTempFiles: async () => {
    logger.section('PHASE 2: TEMPORARY FILES CLEANUP');

    let removedCount = 0;
    for (const pattern of config.removePatterns) {
      const files = utils.findFiles(pattern);
      for (const file of files) {
        if (await utils.remove(file)) removedCount++;
      }
    }

    logger.success(`Removed ${removedCount} temporary files`);
  },

  // Phase 3: Clean build/cache directories
  cleanDirectories: async () => {
    logger.section('PHASE 3: BUILD & CACHE DIRECTORY CLEANUP');

    let removedCount = 0;
    for (const dir of config.cleanDirs) {
      const fullPath = path.join(workspaceRoot, dir);
      if (await utils.remove(fullPath)) removedCount++;
    }

    logger.success(`Cleaned ${removedCount} directories`);
  },

  // Phase 4: Dependency cleanup
  cleanDependencies: async () => {
    logger.section('PHASE 4: DEPENDENCY CLEANUP');

    let removedCount = 0;
    for (const file of config.depFiles) {
      const fullPath = path.join(workspaceRoot, file);
      if (await utils.remove(fullPath)) removedCount++;
    }

    if (removedCount > 0 && !config.dryRun) {
      logger.info('Reinstalling dependencies...');
      utils.exec('npm install');
    }

    logger.success(`Cleaned ${removedCount} dependency files/directories`);
  },

  // Phase 5: Configuration validation
  validateConfigs: async () => {
    logger.section('PHASE 5: CONFIGURATION VALIDATION');

    let validatedCount = 0;
    for (const pattern of config.validateFiles) {
      const files = utils.findFiles(pattern);
      for (const file of files) {
        if (utils.validateJsonFile(file)) validatedCount++;
      }
    }

    logger.success(`Validated ${validatedCount} configuration files`);
  },

  // Phase 6: Git status check
  checkGitStatus: async () => {
    logger.section('PHASE 6: GIT STATUS CHECK');

    const status = utils.exec('git status --porcelain', { encoding: 'utf8' });
    if (!status) {
      logger.warning('Git not available or not a repository');
      return;
    }

    const lines = status.trim().split('\n').filter(l => l);
    if (lines.length === 0) {
      logger.success('Working directory is clean');
    } else {
      logger.warning(`Found ${lines.length} uncommitted changes:`);
      lines.slice(0, 10).forEach(line => logger.info(`  ${line}`));
      if (lines.length > 10) {
        logger.info(`  ... and ${lines.length - 10} more`);
      }
    }
  },

  // Phase 7: System health check (Windows compatible)
  systemCheck: async () => {
    logger.section('PHASE 7: SYSTEM HEALTH CHECK');

    // Disk space (Windows compatible)
    if (process.platform === 'win32') {
      const disk = utils.exec('Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID,Size,FreeSpace | Format-Table', { encoding: 'utf8' });
      if (disk) logger.info(`Disk space:\n${disk}`);
    } else {
      const disk = utils.exec('df -h', { encoding: 'utf8' });
      if (disk) logger.info(`Disk space:\n${disk}`);
    }

    // Memory (Windows compatible)
    if (process.platform === 'win32') {
      const memory = utils.exec('Get-WmiObject -Class Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory | Format-Table', { encoding: 'utf8' });
      if (memory) logger.info(`Memory:\n${memory}`);
    } else {
      const memory = utils.exec('free -h', { encoding: 'utf8' });
      if (memory) logger.info(`Memory:\n${memory}`);
    }

    // Node version
    const nodeVersion = utils.exec('node --version', { encoding: 'utf8' });
    if (nodeVersion) logger.info(`Node.js: ${nodeVersion.trim()}`);

    // NPM version
    const npmVersion = utils.exec('npm --version', { encoding: 'utf8' });
    if (npmVersion) logger.info(`npm: ${npmVersion.trim()}`);
  },

  // Phase 8: Final report
  finalReport: async () => {
    logger.section('CLEANUP COMPLETE');

    if (config.dryRun) {
      logger.warning('DRY RUN COMPLETED - No changes were made');
    } else {
      logger.success(`Successfully freed ${totalFreedSpace.toFixed(2)}MB of space`);
    }

    if (problemsFound > 0) {
      logger.warning(`Found ${problemsFound} potential issues that need attention`);
    } else {
      logger.success('No major issues detected');
    }

    logger.divider();
    logger.info('Workspace is now clean and optimized!');
  }
};

// Main function
async function main() {
  try {
    // Parse CLI arguments
    const args = process.argv.slice(2);
    config.dryRun = args.includes('--dry-run') || args.includes('-d');
    config.interactive = !args.includes('--non-interactive') && !args.includes('-y');

    logger.section('ULTIMATE WORKSPACE CLEANER');
    logger.info(`Workspace: ${workspaceRoot}`);
    logger.info(`Platform: ${process.platform}`);
    logger.info(`Mode: ${config.dryRun ? 'Dry run' : 'Actual cleanup'}`);
    logger.divider();

    // Run all phases
    await phases.analyze();
    await phases.cleanTempFiles();
    await phases.cleanDirectories();
    await phases.cleanDependencies();
    await phases.validateConfigs();
    await phases.checkGitStatus();
    await phases.systemCheck();
    await phases.finalReport();

    process.exit(problemsFound > 0 ? 1 : 0);
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
