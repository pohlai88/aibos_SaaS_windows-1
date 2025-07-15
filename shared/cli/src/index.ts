#!/usr/bin/env node

/**
 * AI-BOS CLI - Enterprise-Grade Development Tools
 * 
 * Comprehensive CLI for AI-BOS platform development with scaffolding,
 * code generation, testing, and deployment tools.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import updateNotifier from 'update-notifier';
import { version } from '../package.json';

// Import commands
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { validateCommand } from './commands/validate';
import { testCommand } from './commands/test';
import { deployCommand } from './commands/deploy';
import { migrateCommand } from './commands/migrate';
import { monitorCommand } from './commands/monitor';
import { docsCommand } from './commands/docs';

// Import utilities
import { checkNodeVersion, checkDependencies } from './utils/checks';
import { displayBanner, displayHelp } from './utils/display';
import { logger } from './utils/logger';

// Check for updates
updateNotifier({ pkg: require('../package.json') }).notify();

async function main() {
  try {
    // Pre-flight checks
    await checkNodeVersion();
    await checkDependencies();

    // Display banner
    displayBanner();

    // Create CLI program
    const program = new Command();

    // Basic program setup
    program
      .name('aibos')
      .description('AI-BOS Platform Development Tools')
      .version(version, '-v, --version')
      .usage('<command> [options]');

    // Global options
    program
      .option('-d, --debug', 'Enable debug mode')
      .option('-q, --quiet', 'Suppress output')
      .option('--no-color', 'Disable colored output');

    // Register commands
    initCommand(program);
    generateCommand(program);
    validateCommand(program);
    testCommand(program);
    deployCommand(program);
    migrateCommand(program);
    monitorCommand(program);
    docsCommand(program);

    // Custom help
    program.on('--help', () => {
      displayHelp();
    });

    // Handle unknown commands
    program.on('command:*', () => {
      logger.error(`Unknown command: ${program.args.join(' ')}`);
      logger.info('Run --help for available commands');
      process.exit(1);
    });

    // Parse arguments
    await program.parseAsync(process.argv);

    // If no command provided, show help
    if (!process.argv.slice(2).length) {
      program.outputHelp();
    }

  } catch (error) {
    logger.error('CLI execution failed:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run CLI
if (require.main === module) {
  main();
}

export { main }; 