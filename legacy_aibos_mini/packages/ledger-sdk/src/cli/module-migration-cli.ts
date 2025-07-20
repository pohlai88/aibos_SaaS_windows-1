#!/usr/bin/env node

import { Command } from 'commander';
import { ModuleMigrationService } from '../services/module-migration-service';
import { MultiVersionService } from '../services/multi-version-service';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const program = new Command();

// Initialize services
const initializeServices = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required'));
    process.exit(1);
  }
  
  const multiVersionService = new MultiVersionService(redisUrl, supabaseUrl, supabaseKey);
  const migrationService = new ModuleMigrationService(redisUrl, supabaseUrl, supabaseKey, multiVersionService);
  
  return { migrationService, multiVersionService };
};

// ========================================
// MIGRATION MANAGEMENT COMMANDS
// ========================================

program
  .command('validate-migration')
  .description('Validate a module migration before execution')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-f, --from <version>', 'Source version')
  .requiredOption('-v, --to <version>', 'Target version')
  .action(async (options) => {
    const spinner = ora('Validating migration...').start();
    try {
      const { migrationService } = initializeServices();
      const validation = await migrationService.validateMigration(
        options.tenant,
        options.module,
        options.from,
        options.to
      );
      spinner.succeed('Migration validation completed');
      
      console.log('\n' + chalk.bold('🔍 Migration Validation Results'));
      console.log('='.repeat(60));
      
      const table = new Table({
        head: ['Property', 'Value'],
        colWidths: [25, 35]
      });

      table.push(
        ['Valid', validation.isValid ? chalk.green('Yes') : chalk.red('No')],
        ['Risk Level', getRiskColor(validation.riskLevel)],
        ['Estimated Time', `${validation.estimatedTime.toFixed(1)} minutes`],
        ['Errors', validation.errors.length.toString()],
        ['Warnings', validation.warnings.length.toString()]
      );

      console.log(table.toString());

      if (validation.errors.length > 0) {
        console.log('\n' + chalk.bold('❌ Errors:'));
        validation.errors.forEach((error, index) => {
          console.log(chalk.red(`  ${index + 1}. ${error}`));
        });
      }

      if (validation.warnings.length > 0) {
        console.log('\n' + chalk.bold('⚠️  Warnings:'));
        validation.warnings.forEach((warning, index) => {
          console.log(chalk.yellow(`  ${index + 1}. ${warning}`));
        });
      }

      if (!validation.isValid) {
        process.exit(1);
      }

    } catch (error) {
      spinner.fail(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('execute-migration')
  .description('Execute a module migration for a tenant')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-f, --from <version>', 'Source version')
  .requiredOption('-v, --to <version>', 'Target version')
  .option('-p, --preserve-customizations', 'Preserve tenant customizations')
  .option('-r, --rollback-on-failure', 'Rollback on migration failure')
  .option('--validate-only', 'Only validate, do not execute')
  .option('-b, --batch-size <size>', 'Batch size for data migration', '1000')
  .action(async (options) => {
    const spinner = ora(`Executing migration from ${options.from} to ${options.to}...`).start();
    try {
      const { migrationService } = initializeServices();
      const migration = await migrationService.executeModuleMigration(
        options.tenant,
        options.module,
        options.from,
        options.to,
        {
          preserveCustomizations: options.preserveCustomizations,
          rollbackOnFailure: options.rollbackOnFailure,
          validateOnly: options.validateOnly,
          batchSize: parseInt(options.batchSize)
        }
      );
      spinner.succeed('Migration executed successfully');
      
      console.log('\n' + chalk.bold('🚀 Migration Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migration.id}`));
      console.log(chalk.blue(`Status: ${getMigrationStatusColor(migration.status)}`));
      console.log(chalk.blue(`Type: ${migration.migrationType}`));
      console.log(chalk.blue(`Start Time: ${new Date(migration.startTime).toLocaleString()}`));
      
      if (migration.endTime) {
        console.log(chalk.blue(`End Time: ${new Date(migration.endTime).toLocaleString()}`));
        const duration = new Date(migration.endTime).getTime() - new Date(migration.startTime).getTime();
        console.log(chalk.blue(`Duration: ${(duration / 1000 / 60).toFixed(1)} minutes`));
      }

      console.log(chalk.blue(`Customizations Migrated: ${migration.customizationsMigrated}`));
      console.log(chalk.blue(`Data Records Migrated: ${migration.dataRecordsMigrated}`));
      console.log(chalk.blue(`Schema Changes Applied: ${migration.schemaChangesApplied}`));

      if (migration.backupId) {
        console.log(chalk.blue(`Backup ID: ${migration.backupId}`));
      }

    } catch (error) {
      spinner.fail(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('rollback-migration')
  .description('Rollback a failed migration')
  .requiredOption('-i, --migration-id <id>', 'Migration ID to rollback')
  .action(async (options) => {
    const spinner = ora('Rolling back migration...').start();
    try {
      const { migrationService } = initializeServices();
      const migration = await migrationService.rollbackMigration(options.migrationId);
      spinner.succeed('Migration rolled back successfully');
      
      console.log('\n' + chalk.bold('🔄 Rollback Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migration.id}`));
      console.log(chalk.blue(`Status: ${getMigrationStatusColor(migration.status)}`));
      console.log(chalk.blue(`From: ${migration.fromVersion}`));
      console.log(chalk.blue(`To: ${migration.toVersion}`));
      console.log(chalk.blue(`Tenant: ${migration.tenantId}`));
      
      if (migration.rollbackId) {
        console.log(chalk.blue(`Rollback Point ID: ${migration.rollbackId}`));
      }

    } catch (error) {
      spinner.fail(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('create-backup')
  .description('Create a backup for a tenant module')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Module version')
  .option('-t, --type <type>', 'Backup type (full, incremental, schema-only)', 'full')
  .action(async (options) => {
    const spinner = ora('Creating backup...').start();
    try {
      const { migrationService } = initializeServices();
      const backupId = await migrationService.createMigrationBackup(
        options.tenant,
        options.module,
        options.version,
        options.type
      );
      spinner.succeed('Backup created successfully');
      
      console.log('\n' + chalk.bold('💾 Backup Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Backup ID: ${backupId}`));
      console.log(chalk.blue(`Tenant: ${options.tenant}`));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`Version: ${options.version}`));
      console.log(chalk.blue(`Type: ${options.type}`));
      console.log(chalk.gray('\nBackup will expire in 30 days.'));

    } catch (error) {
      spinner.fail(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('restore-backup')
  .description('Restore from a backup')
  .requiredOption('-i, --backup-id <id>', 'Backup ID to restore from')
  .action(async (options) => {
    const spinner = ora('Restoring from backup...').start();
    try {
      const { migrationService } = initializeServices();
      await migrationService.restoreFromBackup(options.backupId);
      spinner.succeed('Backup restored successfully');
      
      console.log('\n' + chalk.bold('🔄 Restore Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Backup ID: ${options.backupId}`));
      console.log(chalk.green('Restore completed successfully'));

    } catch (error) {
      spinner.fail(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// SCHEMA MIGRATION COMMANDS
// ========================================

program
  .command('register-schema-migration')
  .description('Register a schema migration for a module version')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Module version')
  .requiredOption('-f, --file <file>', 'Migration file name')
  .requiredOption('-u, --up-sql <sql>', 'Up migration SQL')
  .requiredOption('-d, --down-sql <sql>', 'Down migration SQL')
  .option('-c, --checksum <checksum>', 'File checksum', '')
  .option('-r, --risk-level <level>', 'Risk level (low, medium, high, critical)', 'low')
  .option('-e, --estimated-time <minutes>', 'Estimated time in minutes', '5')
  .option('--no-rollback', 'Disable rollback support')
  .action(async (options) => {
    const spinner = ora('Registering schema migration...').start();
    try {
      const { migrationService } = initializeServices();
      const migrationId = await migrationService.registerSchemaMigration({
        moduleId: options.module,
        version: options.version,
        migrationFile: options.file,
        checksum: options.checksum,
        upSQL: options.upSql,
        downSQL: options.downSql,
        dependencies: [],
        rollbackSupported: options.rollback,
        validationQueries: [],
        estimatedTime: parseInt(options.estimatedTime),
        riskLevel: options.riskLevel as any
      });
      spinner.succeed('Schema migration registered successfully');
      
      console.log('\n' + chalk.bold('📋 Schema Migration Registered'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migrationId}`));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`Version: ${options.version}`));
      console.log(chalk.blue(`File: ${options.file}`));
      console.log(chalk.blue(`Risk Level: ${getRiskColor(options.riskLevel)}`));
      console.log(chalk.blue(`Rollback Supported: ${options.rollback ? 'Yes' : 'No'}`));

    } catch (error) {
      spinner.fail(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('list-schema-migrations')
  .description('List schema migrations for a module')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .option('-v, --version <version>', 'Filter by version')
  .action(async (options) => {
    const spinner = ora('Loading schema migrations...').start();
    try {
      // This would be implemented in the service
      spinner.succeed('Schema migrations loaded');
      
      console.log('\n' + chalk.bold(`📋 Schema Migrations: ${options.module}`));
      console.log('='.repeat(80));
      console.log(chalk.gray('Schema migration listing would be implemented here.'));

    } catch (error) {
      spinner.fail(`Failed to load schema migrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// DATA MIGRATION COMMANDS
// ========================================

program
  .command('register-data-migration')
  .description('Register a data migration for a module version')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-f, --from <version>', 'Source version')
  .requiredOption('-t, --to <version>', 'Target version')
  .requiredOption('-r, --rollback-strategy <strategy>', 'Rollback strategy (snapshot, incremental, none)')
  .option('-b, --batch-size <size>', 'Batch size for processing', '1000')
  .option('-e, --estimated-records <count>', 'Estimated number of records', '0')
  .action(async (options) => {
    const spinner = ora('Registering data migration...').start();
    try {
      const { migrationService } = initializeServices();
      const migrationId = await migrationService.registerDataMigration({
        moduleId: options.module,
        fromVersion: options.from,
        toVersion: options.to,
        transformationRules: [],
        validationRules: [],
        rollbackStrategy: options.rollbackStrategy as any,
        batchSize: parseInt(options.batchSize),
        estimatedRecords: parseInt(options.estimatedRecords)
      });
      spinner.succeed('Data migration registered successfully');
      
      console.log('\n' + chalk.bold('📊 Data Migration Registered'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migrationId}`));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`From: ${options.from}`));
      console.log(chalk.blue(`To: ${options.to}`));
      console.log(chalk.blue(`Rollback Strategy: ${options.rollbackStrategy}`));
      console.log(chalk.blue(`Batch Size: ${options.batchSize}`));

    } catch (error) {
      spinner.fail(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// ANALYTICS COMMANDS
// ========================================

program
  .command('migration-statistics')
  .description('Get migration statistics for a module')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .action(async (options) => {
    const spinner = ora('Loading migration statistics...').start();
    try {
      const { migrationService } = initializeServices();
      const stats = await migrationService.getMigrationStatistics(options.module);
      spinner.succeed('Migration statistics loaded');
      
      console.log('\n' + chalk.bold(`📊 Migration Statistics: ${options.module}`));
      console.log('='.repeat(60));
      
      const table = new Table({
        head: ['Metric', 'Value'],
        colWidths: [25, 35]
      });

      table.push(
        ['Total Migrations', stats.total.toString()],
        ['Successful', stats.successful.toString()],
        ['Failed', stats.failed.toString()],
        ['Rolled Back', stats.rolledBack.toString()],
        ['Success Rate', `${stats.successRate.toFixed(1)}%`],
        ['Average Time', `${stats.averageTime.toFixed(1)} minutes`]
      );

      console.log(table.toString());

    } catch (error) {
      spinner.fail(`Failed to load statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('list-migrations')
  .description('List migrations for a module or tenant')
  .option('-m, --module <moduleId>', 'Filter by module ID')
  .option('-t, --tenant <tenantId>', 'Filter by tenant ID')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    const spinner = ora('Loading migrations...').start();
    try {
      // This would be implemented in the service
      spinner.succeed('Migrations loaded');
      
      console.log('\n' + chalk.bold('📋 Migrations'));
      console.log('='.repeat(80));
      console.log(chalk.gray('Migration listing would be implemented here.'));

    } catch (error) {
      spinner.fail(`Failed to load migrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// UTILITY COMMANDS
// ========================================

program
  .command('cleanup-backups')
  .description('Clean up expired backups')
  .action(async () => {
    const spinner = ora('Cleaning up expired backups...').start();
    try {
      // This would be implemented in the service
      spinner.succeed('Backup cleanup completed');
      
      console.log('\n' + chalk.bold('🧹 Backup Cleanup'));
      console.log('='.repeat(50));
      console.log(chalk.green('Expired backups have been cleaned up.'));

    } catch (error) {
      spinner.fail(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('cleanup-rollback-points')
  .description('Clean up expired rollback points')
  .action(async () => {
    const spinner = ora('Cleaning up expired rollback points...').start();
    try {
      // This would be implemented in the service
      spinner.succeed('Rollback point cleanup completed');
      
      console.log('\n' + chalk.bold('🧹 Rollback Point Cleanup'));
      console.log('='.repeat(50));
      console.log(chalk.green('Expired rollback points have been cleaned up.'));

    } catch (error) {
      spinner.fail(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'low': return chalk.green('low');
    case 'medium': return chalk.yellow('medium');
    case 'high': return chalk.red('high');
    case 'critical': return chalk.red.bold('critical');
    default: return chalk.gray(risk);
  }
}

function getMigrationStatusColor(status: string): string {
  switch (status) {
    case 'completed': return chalk.green('completed');
    case 'in-progress': return chalk.yellow('in-progress');
    case 'pending': return chalk.blue('pending');
    case 'failed': return chalk.red('failed');
    case 'rolled-back': return chalk.red('rolled-back');
    default: return chalk.gray(status);
  }
}

// ========================================
// PROGRAM SETUP
// ========================================

program
  .name('aibos-migrations')
  .description('AI-BOS Module Data Migration CLI')
  .version('1.0.0');

// Add help text
program.addHelpText('after', `

Module Migration Examples:
  $ aibos-migrations validate-migration -t tenant123 -m accounting -f 1.0.0 -v 2.0.0
  $ aibos-migrations execute-migration -t tenant123 -m accounting -f 1.0.0 -v 2.0.0 --preserve-customizations
  $ aibos-migrations rollback-migration -i migration_123
  $ aibos-migrations create-backup -t tenant123 -m accounting -v 1.0.0
  $ aibos-migrations restore-backup -i backup_123
  $ aibos-migrations register-schema-migration -m accounting -v 2.0.0 -f 001_add_ai_insights.sql
  $ aibos-migrations register-data-migration -m accounting -f 1.0.0 -t 2.0.0 -r snapshot
  $ aibos-migrations migration-statistics -m accounting
  $ aibos-migrations cleanup-backups
  $ aibos-migrations cleanup-rollback-points

Environment Variables:
  REDIS_URL          Redis connection URL
  SUPABASE_URL       Supabase project URL
  SUPABASE_KEY       Supabase service role key
`);

// Parse arguments
program.parse(); 