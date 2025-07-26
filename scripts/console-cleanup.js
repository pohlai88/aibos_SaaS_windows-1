#!/usr/bin/env node

/**
 * 🧠 AI-BOS Console Logging Cleanup Script
 * Replaces all console.log statements with structured logging
 */

const fs = require('fs');
const path = require('path');

class ConsoleCleanupScript {
  constructor() {
    this.processedFiles = 0;
    this.replacedLogs = 0;
    this.errors = [];
  }

  async cleanupWorkspace() {
    console.log('🧹 Starting console logging cleanup...');

    const workspaces = [
      'railway-1/frontend/src',
      'railway-1/backend/src',
      'shared/src'
    ];

    for (const workspace of workspaces) {
      if (fs.existsSync(workspace)) {
        await this.cleanupDirectory(workspace);
      }
    }

    this.printSummary();
  }

  async cleanupDirectory(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        await this.cleanupDirectory(fullPath);
      } else if (this.isCodeFile(file.name)) {
        await this.cleanupFile(fullPath);
      }
    }
  }

  isCodeFile(filename) {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  async cleanupFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;

      // Replace console.log statements
      const consoleLogRegex = /console\.log\s*\(\s*([^)]+)\s*\)/g;
      content = content.replace(consoleLogRegex, (match, args) => {
        modified = true;
        this.replacedLogs++;

        // Extract the message from the console.log arguments
        const message = this.extractMessage(args);
        const context = this.extractContext(filePath, message);

        return `logger.info(${message}, ${JSON.stringify(context)})`;
      });

      // Replace console.error statements
      const consoleErrorRegex = /console\.error\s*\(\s*([^)]+)\s*\)/g;
      content = content.replace(consoleErrorRegex, (match, args) => {
        modified = true;
        this.replacedLogs++;

        const message = this.extractMessage(args);
        const context = this.extractContext(filePath, message);

        return `logger.error(${message}, ${JSON.stringify(context)})`;
      });

      // Replace console.warn statements
      const consoleWarnRegex = /console\.warn\s*\(\s*([^)]+)\s*\)/g;
      content = content.replace(consoleWarnRegex, (match, args) => {
        modified = true;
        this.replacedLogs++;

        const message = this.extractMessage(args);
        const context = this.extractContext(filePath, message);

        return `logger.warn(${message}, ${JSON.stringify(context)})`;
      });

      // Replace console.info statements
      const consoleInfoRegex = /console\.info\s*\(\s*([^)]+)\s*\)/g;
      content = content.replace(consoleInfoRegex, (match, args) => {
        modified = true;
        this.replacedLogs++;

        const message = this.extractMessage(args);
        const context = this.extractContext(filePath, message);

        return `logger.info(${message}, ${JSON.stringify(context)})`;
      });

      // Add logger import if needed
      if (modified && !content.includes('import.*logger')) {
        const importStatement = this.getImportStatement(filePath);
        if (importStatement) {
          content = importStatement + '\n' + content;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.processedFiles++;
        console.log(`✅ Cleaned: ${filePath}`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.warn(`⚠️  Error processing ${filePath}:`, error.message);
    }
  }

  extractMessage(args) {
    // Handle template literals, strings, and expressions
    if (args.includes('`')) {
      // Template literal
      return args;
    } else if (args.includes("'") || args.includes('"')) {
      // String literal
      return args;
    } else {
      // Expression - wrap in template literal
      return `\`${args}\``;
    }
  }

  extractContext(filePath, message) {
    const module = this.extractModule(filePath);
    const context = {
      module,
      file: path.basename(filePath),
      type: 'console_replacement'
    };

    // Add specific context based on message content
    if (message.includes('AI') || message.includes('Model')) {
      context.type = 'ai_operation';
    } else if (message.includes('Error') || message.includes('Failed')) {
      context.type = 'error';
    } else if (message.includes('Warning') || message.includes('Warn')) {
      context.type = 'warning';
    } else if (message.includes('Performance') || message.includes('Time')) {
      context.type = 'performance';
    }

    return context;
  }

  extractModule(filePath) {
    const parts = filePath.split(path.sep);
    const srcIndex = parts.indexOf('src');
    if (srcIndex !== -1 && parts[srcIndex + 1]) {
      return parts[srcIndex + 1];
    }
    return 'unknown';
  }

  getImportStatement(filePath) {
    if (filePath.includes('frontend')) {
      return "import { logger } from '@aibos/shared-infrastructure/logging';";
    } else if (filePath.includes('backend')) {
      return "import { logger } from '@aibos/shared-infrastructure/logging';";
    } else if (filePath.includes('shared')) {
      return "import { logger } from './logger';";
    }
    return null;
  }

  printSummary() {
    console.log('\n📊 Console Cleanup Summary');
    console.log('==========================');
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Console statements replaced: ${this.replacedLogs}`);

    if (this.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${this.errors.length}`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Review the changes for accuracy');
    console.log('2. Test the application to ensure logging works correctly');
    console.log('3. Update any remaining console statements manually');
    console.log('4. Configure external logging services for production');
  }
}

async function main() {
  const cleanup = new ConsoleCleanupScript();

  try {
    await cleanup.cleanupWorkspace();
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ConsoleCleanupScript;
