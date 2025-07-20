#!/usr/bin/env node

import { Command } from 'commander';
import { MultiVersionService } from '../services/multi-version-service';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const program = new Command();

// Initialize service
const initializeService = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required'));
    process.exit(1);
  }
  
  return new MultiVersionService(redisUrl, supabaseUrl, supabaseKey);
};

// ========================================
// VERSION MANAGEMENT COMMANDS
// ========================================

program
  .command('list-versions <moduleId>')
  .description('List all versions of a module')
  .action(async (moduleId) => {
    const spinner = ora(`Loading versions for module: ${moduleId}`).start();
    try {
      const service = initializeService();
      const versions = await service.getModuleVersions(moduleId);
      spinner.succeed(`Found ${versions.length} versions`);
      
      if (versions.length === 0) {
        console.log(chalk.gray('No versions found for this module.'));
        return;
      }

      const table = new Table({
        head: ['Version', 'Status', 'Release Date', 'Breaking Changes', 'Migration Required'],
        colWidths: [12, 12, 20, 15, 18]
      });

      versions.forEach(version => {
        table.push([
          chalk.blue(version.version),
          getStatusColor(version.status),
          new Date(version.releaseDate).toLocaleDateString(),
          version.breakingChanges ? chalk.red('Yes') : chalk.green('No'),
          version.migrationRequired ? chalk.yellow('Yes') : chalk.green('No')
        ]);
      });

      console.log('\n' + chalk.bold(`📦 Module Versions: ${moduleId}`));
      console.log('='.repeat(80));
      console.log(table.toString());

    } catch (error) {
      spinner.fail(`Failed to load versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('check-compatibility')
  .description('Check compatibility between module versions')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-f, --from <version>', 'Source version')
  .requiredOption('-t, --to <version>', 'Target version')
  .action(async (options) => {
    const spinner = ora('Checking version compatibility...').start();
    try {
      const service = initializeService();
      const compatibility = await service.checkCompatibility(
        options.from,
        options.to,
        options.module
      );
      spinner.succeed('Compatibility check completed');
      
      console.log('\n' + chalk.bold('🔍 Version Compatibility Analysis'));
      console.log('='.repeat(60));
      
      const table = new Table({
        head: ['Property', 'Value'],
        colWidths: [25, 35]
      });

      table.push(
        ['Source Version', chalk.blue(compatibility.sourceVersion)],
        ['Target Version', chalk.blue(compatibility.targetVersion)],
        ['Compatibility', getCompatibilityColor(compatibility.compatibility)],
        ['Risk Level', getRiskColor(compatibility.riskLevel)],
        ['Estimated Downtime', `${compatibility.estimatedDowntime} minutes`],
        ['Migration Path', compatibility.migrationPath.join(' → ')]
      );

      console.log(table.toString());

      if (compatibility.requiredActions.length > 0) {
        console.log('\n' + chalk.bold('⚠️  Required Actions:'));
        compatibility.requiredActions.forEach((action, index) => {
          console.log(chalk.yellow(`  ${index + 1}. ${action}`));
        });
      }

    } catch (error) {
      spinner.fail(`Failed to check compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('migrate-tenant')
  .description('Migrate a tenant to a new module version')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Target version')
  .option('-f, --force', 'Force migration even with breaking changes')
  .option('-p, --preserve-customizations', 'Preserve tenant customizations')
  .option('-r, --rollback-on-failure', 'Rollback on migration failure')
  .option('-s, --scheduled-time <time>', 'Schedule migration for specific time')
  .action(async (options) => {
    const spinner = ora(`Migrating tenant ${options.tenant} to version ${options.version}...`).start();
    try {
      const service = initializeService();
      const migration = await service.migrateTenant(
        options.tenant,
        options.module,
        options.version,
        {
          force: options.force,
          preserveCustomizations: options.preserveCustomizations,
          rollbackOnFailure: options.rollbackOnFailure,
          scheduledTime: options.scheduledTime
        }
      );
      spinner.succeed('Migration initiated successfully');
      
      console.log('\n' + chalk.bold('🚀 Migration Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migration.id}`));
      console.log(chalk.blue(`From: ${migration.fromVersion}`));
      console.log(chalk.blue(`To: ${migration.toVersion}`));
      console.log(chalk.blue(`Status: ${getMigrationStatusColor(migration.status)}`));
      console.log(chalk.blue(`Start Time: ${new Date(migration.startTime).toLocaleString()}`));

    } catch (error) {
      spinner.fail(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('rollback-tenant')
  .description('Rollback a tenant to a previous version')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .option('-v, --version <version>', 'Target rollback version')
  .action(async (options) => {
    const spinner = ora(`Rolling back tenant ${options.tenant}...`).start();
    try {
      const service = initializeService();
      const migration = await service.rollbackTenant(
        options.tenant,
        options.module,
        options.version
      );
      spinner.succeed('Rollback completed successfully');
      
      console.log('\n' + chalk.bold('🔄 Rollback Details'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Migration ID: ${migration.id}`));
      console.log(chalk.blue(`From: ${migration.fromVersion}`));
      console.log(chalk.blue(`To: ${migration.toVersion}`));
      console.log(chalk.blue(`Status: ${getMigrationStatusColor(migration.status)}`));

    } catch (error) {
      spinner.fail(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// SIDE-BY-SIDE VERSION COMMANDS
// ========================================

program
  .command('enable-side-by-side')
  .description('Enable side-by-side version deployment')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'New version to deploy')
  .action(async (options) => {
    const spinner = ora('Enabling side-by-side version deployment...').start();
    try {
      const service = initializeService();
      const newInstanceId = await service.enableSideBySideVersions(
        options.tenant,
        options.module,
        options.version
      );
      spinner.succeed('Side-by-side deployment enabled');
      
      console.log('\n' + chalk.bold('🔄 Side-by-Side Deployment'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`New Instance ID: ${newInstanceId}`));
      console.log(chalk.blue(`Tenant: ${options.tenant}`));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`New Version: ${options.version}`));
      console.log(chalk.gray('\nBoth versions are now running simultaneously.'));
      console.log(chalk.gray('Use traffic routing to control which version serves requests.'));

    } catch (error) {
      spinner.fail(`Side-by-side deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('force-upgrade-all')
  .description('Force upgrade all tenants to a specific version')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Target version')
  .option('-b, --batch-size <size>', 'Number of tenants per batch', '10')
  .option('-d, --delay <ms>', 'Delay between batches in milliseconds', '5000')
  .option('-e, --exclude <tenants>', 'Comma-separated list of tenants to exclude')
  .action(async (options) => {
    const spinner = ora('Starting forced upgrade for all tenants...').start();
    try {
      const service = initializeService();
      const excludeTenants = options.exclude ? options.exclude.split(',') : undefined;
      
      const migrations = await service.forceUpgradeAll(
        options.module,
        options.version,
        {
          batchSize: parseInt(options.batchSize),
          delayBetweenBatches: parseInt(options.delay),
          excludeTenants
        }
      );
      spinner.succeed(`Forced upgrade completed for ${migrations.length} tenants`);
      
      console.log('\n' + chalk.bold('🚀 Forced Upgrade Summary'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`Target Version: ${options.version}`));
      console.log(chalk.blue(`Total Migrations: ${migrations.length}`));
      console.log(chalk.blue(`Batch Size: ${options.batchSize}`));
      console.log(chalk.blue(`Delay Between Batches: ${options.delay}ms`));
      
      if (excludeTenants) {
        console.log(chalk.blue(`Excluded Tenants: ${excludeTenants.join(', ')}`));
      }

      const statusCounts = migrations.reduce((acc, migration) => {
        acc[migration.status] = (acc[migration.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n' + chalk.bold('Migration Status:'));
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${getMigrationStatusColor(status)}: ${count}`);
      });

    } catch (error) {
      spinner.fail(`Forced upgrade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// FEATURE FLAG COMMANDS
// ========================================

program
  .command('update-feature-flags')
  .description('Update feature flags for a tenant')
  .requiredOption('-t, --tenant <tenantId>', 'Tenant ID')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-f, --flags <flags>', 'JSON string of feature flags')
  .action(async (options) => {
    const spinner = ora('Updating feature flags...').start();
    try {
      const service = initializeService();
      const flags = JSON.parse(options.flags);
      
      await service.updateFeatureFlags(
        options.tenant,
        options.module,
        flags
      );
      spinner.succeed('Feature flags updated successfully');
      
      console.log('\n' + chalk.bold('🎛️  Feature Flags Updated'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Tenant: ${options.tenant}`));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.gray('\nUpdated Flags:'));
      Object.entries(flags).forEach(([flag, value]) => {
        console.log(`  ${flag}: ${value ? chalk.green('enabled') : chalk.red('disabled')}`);
      });

    } catch (error) {
      spinner.fail(`Failed to update feature flags: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// ANALYTICS COMMANDS
// ========================================

program
  .command('version-usage-stats <moduleId>')
  .description('Get version usage statistics for a module')
  .action(async (moduleId) => {
    const spinner = ora('Loading version usage statistics...').start();
    try {
      const service = initializeService();
      const stats = await service.getVersionUsageStats(moduleId);
      spinner.succeed('Usage statistics loaded');
      
      if (Object.keys(stats).length === 0) {
        console.log(chalk.gray('No usage statistics available for this module.'));
        return;
      }

      const table = new Table({
        head: ['Version', 'Tenant Count', 'Percentage'],
        colWidths: [12, 15, 15]
      });

      const totalTenants = Object.values(stats).reduce((sum, count) => sum + count, 0);

      Object.entries(stats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([version, count]) => {
          const percentage = ((count / totalTenants) * 100).toFixed(1);
          table.push([
            chalk.blue(version),
            count.toString(),
            `${percentage}%`
          ]);
        });

      console.log('\n' + chalk.bold(`📊 Version Usage Statistics: ${moduleId}`));
      console.log('='.repeat(60));
      console.log(table.toString());
      console.log(chalk.gray(`Total Tenants: ${totalTenants}`));

    } catch (error) {
      spinner.fail(`Failed to load usage statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('tenants-by-version')
  .description('Get all tenants using a specific version')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Version to check')
  .action(async (options) => {
    const spinner = ora(`Finding tenants using version ${options.version}...`).start();
    try {
      const service = initializeService();
      const tenants = await service.getTenantsByVersion(options.module, options.version);
      spinner.succeed(`Found ${tenants.length} tenants using version ${options.version}`);
      
      if (tenants.length === 0) {
        console.log(chalk.gray(`No tenants found using version ${options.version}.`));
        return;
      }

      const table = new Table({
        head: ['Tenant ID', 'Status', 'Last Accessed', 'Customizations'],
        colWidths: [20, 12, 20, 15]
      });

      tenants.forEach(tenant => {
        table.push([
          tenant.tenantId,
          getTenantStatusColor(tenant.status),
          new Date(tenant.lastAccessed).toLocaleDateString(),
          tenant.customizations.length.toString()
        ]);
      });

      console.log('\n' + chalk.bold(`👥 Tenants Using Version ${options.version}`));
      console.log('='.repeat(80));
      console.log(table.toString());

    } catch (error) {
      spinner.fail(`Failed to find tenants: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// DEPRECATION COMMANDS
// ========================================

program
  .command('deprecate-version')
  .description('Deprecate a module version')
  .requiredOption('-m, --module <moduleId>', 'Module ID')
  .requiredOption('-v, --version <version>', 'Version to deprecate')
  .requiredOption('-e, --end-of-life <date>', 'End of life date (ISO string)')
  .option('-p, --migration-path <path>', 'Comma-separated migration path')
  .action(async (options) => {
    const spinner = ora(`Deprecating version ${options.version}...`).start();
    try {
      const service = initializeService();
      const migrationPath = options.migrationPath ? options.migrationPath.split(',') : [];
      
      await service.deprecateVersion(
        options.module,
        options.version,
        options.endOfLife,
        migrationPath
      );
      spinner.succeed(`Version ${options.version} deprecated successfully`);
      
      console.log('\n' + chalk.bold('⚠️  Version Deprecated'));
      console.log('='.repeat(50));
      console.log(chalk.blue(`Module: ${options.module}`));
      console.log(chalk.blue(`Version: ${options.version}`));
      console.log(chalk.blue(`End of Life: ${new Date(options.endOfLife).toLocaleDateString()}`));
      
      if (migrationPath.length > 0) {
        console.log(chalk.blue(`Migration Path: ${migrationPath.join(' → ')}`));
      }

      console.log(chalk.yellow('\nAffected tenants have been notified of the deprecation.'));

    } catch (error) {
      spinner.fail(`Failed to deprecate version: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'stable': return chalk.green('stable');
    case 'active': return chalk.blue('active');
    case 'beta': return chalk.yellow('beta');
    case 'deprecated': return chalk.red('deprecated');
    default: return chalk.gray(status);
  }
}

function getCompatibilityColor(compatibility: string): string {
  switch (compatibility) {
    case 'compatible': return chalk.green('compatible');
    case 'breaking': return chalk.red('breaking');
    case 'deprecated': return chalk.yellow('deprecated');
    case 'unknown': return chalk.gray('unknown');
    default: return chalk.gray(compatibility);
  }
}

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

function getTenantStatusColor(status: string): string {
  switch (status) {
    case 'active': return chalk.green('active');
    case 'migrating': return chalk.yellow('migrating');
    case 'customized': return chalk.blue('customized');
    case 'deprecated': return chalk.red('deprecated');
    default: return chalk.gray(status);
  }
}

// ========================================
// PROGRAM SETUP
// ========================================

program
  .name('aibos-versions')
  .description('AI-BOS Multi-Version Module Management CLI')
  .version('1.0.0');

// Add help text
program.addHelpText('after', `

Multi-Version Management Examples:
  $ aibos-versions list-versions accounting
  $ aibos-versions check-compatibility -m accounting -f 1.0.0 -t 2.0.0
  $ aibos-versions migrate-tenant -t tenant123 -m accounting -v 2.0.0
  $ aibos-versions enable-side-by-side -t tenant123 -m accounting -v 2.0.0
  $ aibos-versions force-upgrade-all -m accounting -v 2.0.0 --batch-size 5
  $ aibos-versions update-feature-flags -t tenant123 -m accounting -f '{"new_ui": true}'
  $ aibos-versions version-usage-stats accounting
  $ aibos-versions deprecate-version -m accounting -v 1.0.0 -e 2024-12-31

Environment Variables:
  REDIS_URL          Redis connection URL
  SUPABASE_URL       Supabase project URL
  SUPABASE_KEY       Supabase service role key
`);

// Parse arguments
program.parse(); 