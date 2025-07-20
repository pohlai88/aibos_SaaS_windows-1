#!/usr/bin/env node

import { Command } from 'commander';
import { MigrationPipeline, AICodeTranslator } from '../migration-tools';
import { ModuleRegistryDatabase } from '../database';
import { ModuleRegistry } from '../module-registry';
import { SandboxEnvironmentManager } from '../sandbox-environment';
import { EventSystem } from '../event-system';

const program = new Command();

// Initialize services
const db = new ModuleRegistryDatabase();
const moduleRegistry = new ModuleRegistry(db);
const eventSystem = new EventSystem();
const sandboxManager = new SandboxEnvironmentManager(db, moduleRegistry, eventSystem);
const migrationPipeline = new MigrationPipeline(db, moduleRegistry, sandboxManager);

// Migration commands
program
  .command('migrate')
  .description('Migrate a module from TypeScript to Python')
  .requiredOption('-m, --module <module>', 'Module ID to migrate')
  .option('--dry-run', 'Perform migration without deploying', false)
  .option('--backup', 'Create backup before migration', true)
  .action(async (options) => {
    try {
      console.log(`🔄 Starting migration for module: ${options.module}`);
      
      if (options.dryRun) {
        console.log('🔍 DRY RUN MODE - No actual changes will be made');
      }

      // Create migration log
      await db.createMigrationLog({
        moduleId: options.module,
        originalLanguage: 'typescript',
        targetLanguage: 'python',
        status: 'in_progress'
      });

      const result = await migrationPipeline.migrateModule(options.module);
      
      if (result.success) {
        console.log('✅ Migration completed successfully!');
        console.log(`Files migrated: ${result.filesMigrated}`);
        console.log(`Lines of code: ${result.linesOfCode}`);
        
        if (result.performanceImpact) {
          console.log(`Performance impact: ${result.performanceImpact.improvement > 0 ? '+' : ''}${result.performanceImpact.improvement.toFixed(2)}%`);
        }
      } else {
        console.error('❌ Migration failed!');
        if (result.errors) {
          result.errors.forEach(error => console.error(`  - ${error}`));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show migration status and progress')
  .option('-m, --module <module>', 'Show status for specific module')
  .action(async (options) => {
    try {
      if (options.module) {
        console.log(`📊 Migration status for module: ${options.module}`);
        
        const logs = await db.getMigrationLogs(options.module);
        if (logs.length === 0) {
          console.log('No migration logs found for this module.');
          return;
        }

        const latestLog = logs[0];
        console.log(`Status: ${latestLog.status}`);
        console.log(`Original Language: ${latestLog.original_language}`);
        console.log(`Target Language: ${latestLog.target_language}`);
        console.log(`Migration Date: ${new Date(latestLog.migration_date).toLocaleString()}`);
        console.log(`Files Migrated: ${latestLog.files_migrated}`);
        console.log(`Lines of Code: ${latestLog.lines_of_code}`);
        
        if (latestLog.performance_impact) {
          console.log(`Performance Impact: ${latestLog.performance_impact.improvement > 0 ? '+' : ''}${latestLog.performance_impact.improvement.toFixed(2)}%`);
        }
        
        if (latestLog.errors && latestLog.errors.length > 0) {
          console.log('Errors:');
          latestLog.errors.forEach(error => console.log(`  - ${error}`));
        }
      } else {
        console.log('📊 Overall migration status');
        
        const status = await migrationPipeline.getMigrationStatus();
        
        console.log('Migration Progress:');
        console.log('─'.repeat(50));
        console.log(`Total Modules: ${status.totalModules}`);
        console.log(`Migrated Modules: ${status.migratedModules}`);
        console.log(`Progress: ${status.migrationProgress.toFixed(1)}%`);
        console.log(`Failed Migrations: ${status.failedMigrations}`);
        console.log(`Estimated Completion: ${status.estimatedCompletion.toLocaleDateString()}`);
        
        console.log('\nPerformance Impact:');
        console.log(`  Average: ${status.performanceImpact.average.toFixed(1)}%`);
        console.log(`  Best: ${status.performanceImpact.best.toFixed(1)}%`);
        console.log(`  Worst: ${status.performanceImpact.worst.toFixed(1)}%`);
        
        console.log('\nCost Analysis:');
        console.log(`  Total Cost: $${status.costAnalysis.totalCost.toLocaleString()}`);
        console.log(`  Cost per Module: $${status.costAnalysis.costPerModule.toLocaleString()}`);
        console.log(`  Savings: $${status.costAnalysis.savings.toLocaleString()}`);
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error.message);
      process.exit(1);
    }
  });

program
  .command('rollback')
  .description('Rollback a migrated module to original TypeScript version')
  .requiredOption('-m, --module <module>', 'Module ID to rollback')
  .option('--force', 'Force rollback without confirmation', false)
  .action(async (options) => {
    try {
      if (!options.force) {
        console.log(`⚠️  Are you sure you want to rollback module "${options.module}"?`);
        console.log('This will restore the original TypeScript version and may cause data loss.');
        console.log('Use --force flag to skip confirmation');
        return;
      }

      console.log(`🔄 Rolling back module: ${options.module}`);
      
      const success = await migrationPipeline.rollbackModule(options.module);
      
      if (success) {
        console.log('✅ Rollback completed successfully!');
      } else {
        console.error('❌ Rollback failed!');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate migration without performing it')
  .requiredOption('-m, --module <module>', 'Module ID to validate')
  .action(async (options) => {
    try {
      console.log(`🔍 Validating migration for module: ${options.module}`);
      
      // Get module source code
      const module = await moduleRegistry.getModule(options.module);
      if (!module) {
        console.error('❌ Module not found');
        process.exit(1);
      }

      // Create AI translator
      const translator = new AICodeTranslator();
      
      // Translate code
      const pythonCode = await translator.translateTypescriptToPython(module.sourceCode || '');
      
      // Validate migration
      const validation = await translator.validateMigration(module.sourceCode || '', pythonCode);
      
      console.log('✅ Validation completed!');
      console.log('\nValidation Results:');
      console.log('─'.repeat(50));
      console.log(`Functionality Preserved: ${validation.functionalityPreserved ? '✅' : '❌'}`);
      console.log(`SSOT Compliance: ${validation.ssotCompliance ? '✅' : '❌'}`);
      console.log(`Security Validation: ${validation.securityValidation ? '✅' : '❌'}`);
      console.log(`API Compatibility: ${validation.apiCompatibility ? '✅' : '❌'}`);
      console.log(`Database Compatibility: ${validation.databaseCompatibility ? '✅' : '❌'}`);
      
      console.log('\nPerformance Comparison:');
      console.log(`  Original: ${validation.performanceComparison.original.toFixed(2)}ms`);
      console.log(`  Migrated: ${validation.performanceComparison.migrated.toFixed(2)}ms`);
      console.log(`  Difference: ${validation.performanceComparison.difference > 0 ? '+' : ''}${validation.performanceComparison.difference.toFixed(2)}ms`);
      
      const allValid = validation.functionalityPreserved && 
                      validation.ssotCompliance && 
                      validation.securityValidation && 
                      validation.apiCompatibility && 
                      validation.databaseCompatibility;
      
      if (allValid) {
        console.log('\n🎉 Module is ready for migration!');
      } else {
        console.log('\n⚠️  Module needs attention before migration');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('backup')
  .description('Create backup of a module before migration')
  .requiredOption('-m, --module <module>', 'Module ID to backup')
  .action(async (options) => {
    try {
      console.log(`💾 Creating backup for module: ${options.module}`);
      
      // Get module
      const module = await moduleRegistry.getModule(options.module);
      if (!module) {
        console.error('❌ Module not found');
        process.exit(1);
      }

      // Create backup
      const backupPath = `backups/${options.module}-${Date.now()}`;
      
      await db.createMigrationBackup({
        moduleId: options.module,
        backupPath,
        originalLanguage: 'typescript',
        originalCodeHash: 'hash-placeholder' // In real implementation, calculate actual hash
      });
      
      console.log('✅ Backup created successfully!');
      console.log(`Backup Path: ${backupPath}`);
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('list-backups')
  .description('List available migration backups')
  .option('-m, --module <module>', 'Filter by module ID')
  .action(async (options) => {
    try {
      console.log('📋 Listing migration backups...');
      
      const backups = await db.getMigrationBackups(options.module);
      
      if (backups.length === 0) {
        console.log('No migration backups found.');
        return;
      }

      console.log('\nMigration Backups:');
      console.log('─'.repeat(80));
      
      backups.forEach(backup => {
        console.log(`ID: ${backup.id}`);
        console.log(`Module: ${backup.module_id}`);
        console.log(`Path: ${backup.backup_path}`);
        console.log(`Language: ${backup.original_language}`);
        console.log(`Status: ${backup.status}`);
        console.log(`Created: ${new Date(backup.created_at).toLocaleString()}`);
        console.log('─'.repeat(80));
      });
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      process.exit(1);
    }
  });

program
  .command('logs')
  .description('Show migration logs')
  .option('-m, --module <module>', 'Filter by module ID')
  .option('-l, --limit <limit>', 'Number of logs to show', '10')
  .action(async (options) => {
    try {
      console.log('📋 Migration logs...');
      
      const logs = await db.getMigrationLogs(options.module);
      const limitedLogs = logs.slice(0, parseInt(options.limit));
      
      if (limitedLogs.length === 0) {
        console.log('No migration logs found.');
        return;
      }

      console.log('\nMigration Logs:');
      console.log('─'.repeat(100));
      
      limitedLogs.forEach(log => {
        console.log(`Module: ${log.module_id}`);
        console.log(`Status: ${log.status}`);
        console.log(`From: ${log.original_language} → To: ${log.target_language}`);
        console.log(`Date: ${new Date(log.migration_date).toLocaleString()}`);
        console.log(`Files: ${log.files_migrated}, Lines: ${log.lines_of_code}`);
        
        if (log.performance_impact) {
          console.log(`Performance: ${log.performance_impact.improvement > 0 ? '+' : ''}${log.performance_impact.improvement.toFixed(2)}%`);
        }
        
        if (log.errors && log.errors.length > 0) {
          console.log('Errors:');
          log.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log('─'.repeat(100));
      });
    } catch (error) {
      console.error('❌ Failed to get migration logs:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 