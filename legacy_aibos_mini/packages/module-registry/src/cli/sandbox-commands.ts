#!/usr/bin/env node

import { Command } from 'commander';
import { SandboxEnvironmentManager } from '../sandbox-environment';
import { ModuleRegistryDatabase } from '../database';
import { ModuleRegistry } from '../module-registry';
import { EventSystem } from '../event-system';

const program = new Command();

// Initialize services
const db = new ModuleRegistryDatabase();
const moduleRegistry = new ModuleRegistry(db);
const eventSystem = new EventSystem();
const sandboxManager = new SandboxEnvironmentManager(db, moduleRegistry, eventSystem);

// Sandbox environment commands
program
  .command('create')
  .description('Create a new sandbox environment')
  .requiredOption('-n, --name <name>', 'Sandbox name')
  .requiredOption('-o, --owner <owner>', 'Sandbox owner')
  .option('-t, --type <type>', 'Environment type (development|testing|staging)', 'development')
  .option('-m, --modules <modules>', 'Comma-separated list of modules to install')
  .option('--cpu <cpu>', 'CPU limit (e.g., "2 cores")', '2 cores')
  .option('--memory <memory>', 'Memory limit (e.g., "4GB")', '4GB')
  .option('--storage <storage>', 'Storage limit (e.g., "50GB")', '50GB')
  .action(async (options) => {
    try {
      console.log('🏖️ Creating sandbox environment...');
      
      const modules = options.modules ? options.modules.split(',') : [];
      
      const sandbox = await sandboxManager.createSandbox({
        name: options.name,
        owner: options.owner,
        type: options.type,
        modules,
        resources: {
          cpu: options.cpu,
          memory: options.memory,
          storage: options.storage
        }
      });

      console.log('✅ Sandbox created successfully!');
      console.log(`ID: ${sandbox.id}`);
      console.log(`Name: ${sandbox.name}`);
      console.log(`Type: ${sandbox.type}`);
      console.log(`Modules: ${sandbox.modules.join(', ') || 'None'}`);
      console.log(`Expires: ${sandbox.expiresAt.toLocaleString()}`);
    } catch (error) {
      console.error('❌ Failed to create sandbox:', error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List sandbox environments')
  .option('-o, --owner <owner>', 'Filter by owner')
  .action(async (options) => {
    try {
      console.log('📋 Listing sandbox environments...');
      
      const sandboxes = await sandboxManager.listSandboxes(options.owner);
      
      if (sandboxes.length === 0) {
        console.log('No sandbox environments found.');
        return;
      }

      console.log('\nSandbox Environments:');
      console.log('─'.repeat(80));
      
      sandboxes.forEach(sandbox => {
        console.log(`ID: ${sandbox.id}`);
        console.log(`Name: ${sandbox.name}`);
        console.log(`Owner: ${sandbox.owner}`);
        console.log(`Type: ${sandbox.type}`);
        console.log(`Status: ${sandbox.status}`);
        console.log(`Modules: ${sandbox.modules.length}`);
        console.log(`Created: ${new Date(sandbox.created_at).toLocaleString()}`);
        console.log(`Expires: ${new Date(sandbox.expires_at).toLocaleString()}`);
        console.log('─'.repeat(80));
      });
    } catch (error) {
      console.error('❌ Failed to list sandboxes:', error.message);
      process.exit(1);
    }
  });

program
  .command('access')
  .description('Access a sandbox environment')
  .requiredOption('-i, --id <id>', 'Sandbox ID')
  .action(async (options) => {
    try {
      console.log(`🔗 Accessing sandbox: ${options.id}`);
      
      const sandbox = await sandboxManager.getSandbox(options.id);
      if (!sandbox) {
        console.error('❌ Sandbox not found');
        process.exit(1);
      }

      console.log('✅ Sandbox accessed successfully!');
      console.log(`Name: ${sandbox.name}`);
      console.log(`Type: ${sandbox.type}`);
      console.log(`Status: ${sandbox.status}`);
      console.log(`Access URL: https://sandbox-${options.id}.aibos.com`);
      console.log(`API Endpoint: https://api-sandbox-${options.id}.aibos.com`);
    } catch (error) {
      console.error('❌ Failed to access sandbox:', error.message);
      process.exit(1);
    }
  });

program
  .command('destroy')
  .description('Destroy a sandbox environment')
  .requiredOption('-i, --id <id>', 'Sandbox ID')
  .option('-f, --force', 'Force destruction without confirmation')
  .action(async (options) => {
    try {
      if (!options.force) {
        const sandbox = await sandboxManager.getSandbox(options.id);
        if (!sandbox) {
          console.error('❌ Sandbox not found');
          process.exit(1);
        }

        console.log(`⚠️  Are you sure you want to destroy sandbox "${sandbox.name}"?`);
        console.log('This action cannot be undone.');
        
        // In a real CLI, you'd prompt for confirmation
        console.log('Use --force flag to skip confirmation');
        return;
      }

      console.log(`🗑️  Destroying sandbox: ${options.id}`);
      
      await sandboxManager.destroySandbox(options.id);
      
      console.log('✅ Sandbox destroyed successfully!');
    } catch (error) {
      console.error('❌ Failed to destroy sandbox:', error.message);
      process.exit(1);
    }
  });

// Module testing commands
program
  .command('test-module')
  .description('Test a module in a sandbox environment')
  .requiredOption('-m, --module <module>', 'Module ID')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .action(async (options) => {
    try {
      console.log(`🧪 Testing module ${options.module} in sandbox ${options.sandbox}...`);
      
      const report = await sandboxManager.testModuleInSandbox(options.module, options.sandbox);
      
      console.log('✅ Testing completed!');
      console.log('\nTest Results:');
      console.log('─'.repeat(50));
      
      // Unit tests
      console.log('Unit Tests:');
      report.testResults.unitTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
        console.log(`  ${status} ${test.name} (${test.duration}ms)`);
        if (test.error) console.log(`    Error: ${test.error}`);
      });
      
      // Integration tests
      console.log('\nIntegration Tests:');
      report.testResults.integrationTests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
        console.log(`  ${status} ${test.name} (${test.duration}ms)`);
        if (test.error) console.log(`    Error: ${test.error}`);
      });
      
      // Compliance
      console.log('\nCompliance:');
      console.log(`  SSOT: ${report.compliance.ssotCompliance ? '✅' : '❌'}`);
      console.log(`  Security: ${report.compliance.securityCompliance ? '✅' : '❌'}`);
      console.log(`  Performance: ${report.compliance.performanceCompliance ? '✅' : '❌'}`);
      
      // Recommendations
      if (report.recommendations.length > 0) {
        console.log('\nRecommendations:');
        report.recommendations.forEach(rec => console.log(`  • ${rec}`));
      }
    } catch (error) {
      console.error('❌ Failed to test module:', error.message);
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Install a module in a sandbox environment')
  .requiredOption('-m, --module <module>', 'Module ID')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .action(async (options) => {
    try {
      console.log(`📦 Installing module ${options.module} in sandbox ${options.sandbox}...`);
      
      await sandboxManager.installModuleInSandbox(options.module, options.sandbox);
      
      console.log('✅ Module installed successfully!');
    } catch (error) {
      console.error('❌ Failed to install module:', error.message);
      process.exit(1);
    }
  });

program
  .command('uninstall')
  .description('Uninstall a module from a sandbox environment')
  .requiredOption('-m, --module <module>', 'Module ID')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .action(async (options) => {
    try {
      console.log(`🗑️  Uninstalling module ${options.module} from sandbox ${options.sandbox}...`);
      
      await sandboxManager.uninstallModuleFromSandbox(options.module, options.sandbox);
      
      console.log('✅ Module uninstalled successfully!');
    } catch (error) {
      console.error('❌ Failed to uninstall module:', error.message);
      process.exit(1);
    }
  });

// Data management commands
program
  .command('clone-data')
  .description('Clone production data to a sandbox environment')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .option('--from <source>', 'Source environment (production|staging)', 'production')
  .option('--anonymize', 'Anonymize sensitive data', true)
  .action(async (options) => {
    try {
      console.log(`📋 Cloning ${options.from} data to sandbox ${options.sandbox}...`);
      
      await sandboxManager.cloneProductionData(options.sandbox, options.anonymize);
      
      console.log('✅ Data cloned successfully!');
    } catch (error) {
      console.error('❌ Failed to clone data:', error.message);
      process.exit(1);
    }
  });

program
  .command('generate-data')
  .description('Generate synthetic data in a sandbox environment')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .requiredOption('--schema <schema>', 'Data schema (customers|transactions|documents)')
  .requiredOption('--count <count>', 'Number of records to generate', '1000')
  .action(async (options) => {
    try {
      console.log(`🎲 Generating ${options.count} ${options.schema} records in sandbox ${options.sandbox}...`);
      
      await sandboxManager.generateSyntheticData(options.sandbox, options.schema, parseInt(options.count));
      
      console.log('✅ Synthetic data generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate data:', error.message);
      process.exit(1);
    }
  });

program
  .command('monitor')
  .description('Monitor sandbox environment performance')
  .requiredOption('-s, --sandbox <sandbox>', 'Sandbox ID')
  .action(async (options) => {
    try {
      console.log(`📊 Monitoring sandbox: ${options.sandbox}`);
      
      const performance = await sandboxManager.monitorPerformance(options.sandbox);
      
      console.log('Performance Metrics:');
      console.log('─'.repeat(40));
      console.log(`CPU Usage: ${performance.cpu.toFixed(1)}%`);
      console.log(`Memory Usage: ${performance.memory.toFixed(1)}%`);
      console.log(`Storage Usage: ${performance.storage.toFixed(1)}%`);
      console.log(`Network Usage: ${performance.network.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Failed to monitor sandbox:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 