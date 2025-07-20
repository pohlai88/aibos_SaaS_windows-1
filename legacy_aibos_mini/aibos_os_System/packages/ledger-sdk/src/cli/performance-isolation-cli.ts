#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { PerformanceIsolationService } from '../services/performance-isolation-service';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

const program = new Command();

// Initialize services
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
const performanceService = new PerformanceIsolationService(
  process.env.REDIS_URL || 'redis://localhost:6379',
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// Utility functions
const printHeader = (title: string) => {
  console.log(chalk.blue.bold(`\n🔧 ${title}`));
  console.log(chalk.gray('─'.repeat(50)));
};

const printSuccess = (message: string) => {
  console.log(chalk.green(`✅ ${message}`));
};

const printError = (message: string) => {
  console.log(chalk.red(`❌ ${message}`));
};

const printWarning = (message: string) => {
  console.log(chalk.yellow(`⚠️  ${message}`));
};

const printInfo = (message: string) => {
  console.log(chalk.blue(`ℹ️  ${message}`));
};

// Sandbox Management Commands
program
  .command('sandbox:create')
  .description('Create a new sandbox for a module')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .option('-l, --level <level>', 'Isolation level (light|medium|strict|custom)', 'medium')
  .action(async (options) => {
    try {
      printHeader('Creating Module Sandbox');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleId',
          message: 'Module ID:',
          default: options.module,
          validate: (input) => input.length > 0 ? true : 'Module ID is required'
        },
        {
          type: 'input',
          name: 'tenantId',
          message: 'Tenant ID:',
          default: options.tenant,
          validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
        },
        {
          type: 'input',
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'list',
          name: 'isolationLevel',
          message: 'Isolation level:',
          choices: [
            { name: 'Light - Basic resource limits', value: 'light' },
            { name: 'Medium - Standard limits (recommended)', value: 'medium' },
            { name: 'Strict - Restrictive limits', value: 'strict' },
            { name: 'Custom - Define your own limits', value: 'custom' }
          ],
          default: options.level
        }
      ]);

      const sandboxId = await performanceService.createSandbox(
        answers.moduleId,
        answers.tenantId,
        answers.version,
        answers.isolationLevel
      );

      printSuccess(`Sandbox created successfully!`);
      console.log(chalk.cyan(`Sandbox ID: ${sandboxId}`));
      console.log(chalk.cyan(`Module: ${answers.moduleId}`));
      console.log(chalk.cyan(`Tenant: ${answers.tenantId}`));
      console.log(chalk.cyan(`Version: ${answers.version}`));
      console.log(chalk.cyan(`Isolation Level: ${answers.isolationLevel}`));

    } catch (error) {
      printError(`Failed to create sandbox: ${error.message}`);
    }
  });

program
  .command('sandbox:list')
  .description('List all sandboxes')
  .option('-m, --module <module>', 'Filter by module ID')
  .option('-t, --tenant <tenant>', 'Filter by tenant ID')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    try {
      printHeader('Module Sandboxes');

      const { data: sandboxes, error } = await supabase
        .from('module_sandboxes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!sandboxes || sandboxes.length === 0) {
        printInfo('No sandboxes found.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Sandbox ID'),
          chalk.cyan('Module'),
          chalk.cyan('Tenant'),
          chalk.cyan('Version'),
          chalk.cyan('Level'),
          chalk.cyan('Status'),
          chalk.cyan('Created')
        ],
        colWidths: [20, 15, 15, 10, 10, 10, 20]
      });

      sandboxes.forEach(sandbox => {
        const statusColor = sandbox.status === 'active' ? chalk.green : 
                           sandbox.status === 'suspended' ? chalk.red :
                           chalk.yellow;
        
        table.push([
          sandbox.id.substring(0, 18) + '...',
          sandbox.module_id,
          sandbox.tenant_id.substring(0, 8) + '...',
          sandbox.version,
          sandbox.isolation_level,
          statusColor(sandbox.status),
          new Date(sandbox.created_at).toLocaleDateString()
        ]);
      });

      console.log(table.toString());

    } catch (error) {
      printError(`Failed to list sandboxes: ${error.message}`);
    }
  });

program
  .command('sandbox:metrics')
  .description('Get performance metrics for a sandbox')
  .option('-s, --sandbox <sandbox>', 'Sandbox ID')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .action(async (options) => {
    try {
      printHeader('Performance Metrics');

      let moduleId, tenantId, version;
      
      if (options.sandbox) {
        const parts = options.sandbox.split('_');
        if (parts.length >= 4) {
          moduleId = parts[1];
          tenantId = parts[2];
          version = parts[3];
        }
      } else {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'moduleId',
            message: 'Module ID:',
            default: options.module,
            validate: (input) => input.length > 0 ? true : 'Module ID is required'
          },
          {
            type: 'input',
            name: 'tenantId',
            message: 'Tenant ID:',
            default: options.tenant,
            validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
          },
          {
            type: 'input',
            name: 'version',
            message: 'Module version:',
            default: options.version || '1.0.0',
            validate: (input) => input.length > 0 ? true : 'Version is required'
          }
        ]);
        
        moduleId = answers.moduleId;
        tenantId = answers.tenantId;
        version = answers.version;
      }

      const metrics = await performanceService.getPerformanceMetrics(
        moduleId,
        tenantId,
        version
      );

      if (!metrics) {
        printWarning('No metrics found for this sandbox.');
        return;
      }

      console.log(chalk.cyan(`\nModule: ${metrics.moduleId}`));
      console.log(chalk.cyan(`Tenant: ${metrics.tenantId}`));
      console.log(chalk.cyan(`Version: ${metrics.version}`));
      console.log(chalk.cyan(`Status: ${metrics.status}`));
      console.log(chalk.cyan(`Timestamp: ${metrics.timestamp}`));

      // CPU Metrics
      console.log(chalk.yellow('\n🖥️  CPU Metrics:'));
      console.log(`  Usage: ${chalk.bold(metrics.metrics.cpu.usage.toFixed(1))}%`);
      console.log(`  Load: ${chalk.bold(metrics.metrics.cpu.load.toFixed(2))}`);
      console.log(`  Throttled: ${metrics.metrics.cpu.throttled ? chalk.red('Yes') : chalk.green('No')}`);

      // Memory Metrics
      console.log(chalk.yellow('\n💾 Memory Metrics:'));
      console.log(`  Used: ${chalk.bold(metrics.metrics.memory.used)} MB`);
      console.log(`  Peak: ${chalk.bold(metrics.metrics.memory.peak)} MB`);
      console.log(`  Limit: ${chalk.bold(metrics.metrics.memory.limit)} MB`);
      console.log(`  Exceeded: ${metrics.metrics.memory.exceeded ? chalk.red('Yes') : chalk.green('No')}`);

      // API Metrics
      console.log(chalk.yellow('\n🌐 API Metrics:'));
      console.log(`  Requests/sec: ${chalk.bold(metrics.metrics.api.requestsPerSecond)}`);
      console.log(`  Requests/min: ${chalk.bold(metrics.metrics.api.requestsPerMinute)}`);
      console.log(`  Response Time: ${chalk.bold(metrics.metrics.api.responseTime)}ms`);
      console.log(`  Throttled: ${metrics.metrics.api.throttled ? chalk.red('Yes') : chalk.green('No')}`);

      // Database Metrics
      console.log(chalk.yellow('\n🗄️  Database Metrics:'));
      console.log(`  Connections: ${chalk.bold(metrics.metrics.database.connections)}`);
      console.log(`  Active Queries: ${chalk.bold(metrics.metrics.database.activeQueries)}`);
      console.log(`  Slow Queries: ${chalk.bold(metrics.metrics.database.slowQueries)}`);
      console.log(`  Throttled: ${metrics.metrics.database.throttled ? chalk.red('Yes') : chalk.green('No')}`);

      // Storage Metrics
      console.log(chalk.yellow('\n💿 Storage Metrics:'));
      console.log(`  Used: ${chalk.bold(metrics.metrics.storage.used)} MB`);
      console.log(`  Files: ${chalk.bold(metrics.metrics.storage.files)}`);
      console.log(`  Exceeded: ${metrics.metrics.storage.exceeded ? chalk.red('Yes') : chalk.green('No')}`);

      // Violations
      if (metrics.violations.length > 0) {
        console.log(chalk.red('\n🚨 Performance Violations:'));
        metrics.violations.forEach(violation => {
          const severityColor = violation.severity === 'critical' ? chalk.red :
                               violation.severity === 'warning' ? chalk.yellow :
                               chalk.blue;
          
          console.log(`  ${severityColor(violation.severity.toUpperCase())}: ${violation.message}`);
          console.log(`    Value: ${violation.value}, Limit: ${violation.limit}`);
          console.log(`    Action: ${violation.action}`);
        });
      }

    } catch (error) {
      printError(`Failed to get metrics: ${error.message}`);
    }
  });

// Throttling Commands
program
  .command('throttle:apply')
  .description('Apply throttling to a module')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .option('-y, --type <type>', 'Resource type (cpu|memory|api|database|storage)')
  .option('-l, --level <level>', 'Throttle level (light|medium|strict)', 'medium')
  .action(async (options) => {
    try {
      printHeader('Applying Throttling');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleId',
          message: 'Module ID:',
          default: options.module,
          validate: (input) => input.length > 0 ? true : 'Module ID is required'
        },
        {
          type: 'input',
          name: 'tenantId',
          message: 'Tenant ID:',
          default: options.tenant,
          validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
        },
        {
          type: 'input',
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'list',
          name: 'type',
          message: 'Resource type to throttle:',
          choices: [
            { name: 'CPU Usage', value: 'cpu' },
            { name: 'Memory Usage', value: 'memory' },
            { name: 'API Requests', value: 'api' },
            { name: 'Database Connections', value: 'database' },
            { name: 'Storage Usage', value: 'storage' }
          ],
          default: options.type
        },
        {
          type: 'list',
          name: 'level',
          message: 'Throttle level:',
          choices: [
            { name: 'Light - Reduce by 20%', value: 'light' },
            { name: 'Medium - Reduce by 50%', value: 'medium' },
            { name: 'Strict - Reduce by 80%', value: 'strict' }
          ],
          default: options.level
        }
      ]);

      await performanceService.applyThrottling(
        answers.moduleId,
        answers.tenantId,
        answers.version,
        answers.type,
        answers.level
      );

      printSuccess(`Throttling applied successfully!`);
      console.log(chalk.cyan(`Module: ${answers.moduleId}`));
      console.log(chalk.cyan(`Resource: ${answers.type}`));
      console.log(chalk.cyan(`Level: ${answers.level}`));

    } catch (error) {
      printError(`Failed to apply throttling: ${error.message}`);
    }
  });

program
  .command('throttle:list')
  .description('List active throttling events')
  .action(async () => {
    try {
      printHeader('Active Throttling Events');

      const { data: events, error } = await supabase
        .from('throttling_events')
        .select('*')
        .eq('active', true)
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (!events || events.length === 0) {
        printInfo('No active throttling events found.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Event ID'),
          chalk.cyan('Sandbox'),
          chalk.cyan('Type'),
          chalk.cyan('Level'),
          chalk.cyan('Reason'),
          chalk.cyan('Started'),
          chalk.cyan('Duration')
        ],
        colWidths: [15, 20, 10, 10, 20, 20, 10]
      });

      events.forEach(event => {
        table.push([
          event.id.substring(0, 12) + '...',
          event.sandbox_id.substring(0, 18) + '...',
          event.type,
          event.level,
          event.reason.substring(0, 17) + '...',
          new Date(event.started_at).toLocaleString(),
          `${event.duration}s`
        ]);
      });

      console.log(table.toString());

    } catch (error) {
      printError(`Failed to list throttling events: ${error.message}`);
    }
  });

// Module Management Commands
program
  .command('module:suspend')
  .description('Suspend a module due to performance issues')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .option('-r, --reason <reason>', 'Suspension reason')
  .action(async (options) => {
    try {
      printHeader('Suspending Module');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleId',
          message: 'Module ID:',
          default: options.module,
          validate: (input) => input.length > 0 ? true : 'Module ID is required'
        },
        {
          type: 'input',
          name: 'tenantId',
          message: 'Tenant ID:',
          default: options.tenant,
          validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
        },
        {
          type: 'input',
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'input',
          name: 'reason',
          message: 'Suspension reason:',
          default: options.reason || 'Performance violation',
          validate: (input) => input.length > 0 ? true : 'Reason is required'
        }
      ]);

      await performanceService.suspendModule(
        answers.moduleId,
        answers.tenantId,
        answers.version,
        answers.reason
      );

      printSuccess(`Module suspended successfully!`);
      console.log(chalk.cyan(`Module: ${answers.moduleId}`));
      console.log(chalk.cyan(`Reason: ${answers.reason}`));

    } catch (error) {
      printError(`Failed to suspend module: ${error.message}`);
    }
  });

program
  .command('module:resume')
  .description('Resume a suspended module')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .action(async (options) => {
    try {
      printHeader('Resuming Module');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleId',
          message: 'Module ID:',
          default: options.module,
          validate: (input) => input.length > 0 ? true : 'Module ID is required'
        },
        {
          type: 'input',
          name: 'tenantId',
          message: 'Tenant ID:',
          default: options.tenant,
          validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
        },
        {
          type: 'input',
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        }
      ]);

      await performanceService.resumeModule(
        answers.moduleId,
        answers.tenantId,
        answers.version
      );

      printSuccess(`Module resumed successfully!`);
      console.log(chalk.cyan(`Module: ${answers.moduleId}`));

    } catch (error) {
      printError(`Failed to resume module: ${error.message}`);
    }
  });

// Alerts Commands
program
  .command('alerts:list')
  .description('List performance alerts')
  .option('-m, --module <module>', 'Filter by module ID')
  .option('-t, --tenant <tenant>', 'Filter by tenant ID')
  .option('-s, --status <status>', 'Filter by status (active|acknowledged|resolved)')
  .action(async (options) => {
    try {
      printHeader('Performance Alerts');

      const alerts = await performanceService.getPerformanceAlerts(
        options.module,
        options.tenant,
        options.status as any
      );

      if (alerts.length === 0) {
        printInfo('No alerts found.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Alert ID'),
          chalk.cyan('Module'),
          chalk.cyan('Tenant'),
          chalk.cyan('Type'),
          chalk.cyan('Message'),
          chalk.cyan('Timestamp'),
          chalk.cyan('Status')
        ],
        colWidths: [15, 15, 15, 10, 30, 20, 15]
      });

      alerts.forEach(alert => {
        const typeColor = alert.type === 'critical' ? chalk.red :
                         alert.type === 'warning' ? chalk.yellow :
                         chalk.blue;
        
        const statusColor = alert.resolved ? chalk.green :
                           alert.acknowledged ? chalk.yellow :
                           chalk.red;
        
        table.push([
          alert.id.substring(0, 12) + '...',
          alert.moduleId,
          alert.tenantId.substring(0, 8) + '...',
          typeColor(alert.type),
          alert.message.substring(0, 27) + '...',
          new Date(alert.timestamp).toLocaleString(),
          statusColor(alert.resolved ? 'resolved' : alert.acknowledged ? 'acknowledged' : 'active')
        ]);
      });

      console.log(table.toString());

    } catch (error) {
      printError(`Failed to list alerts: ${error.message}`);
    }
  });

program
  .command('alerts:acknowledge')
  .description('Acknowledge a performance alert')
  .option('-i, --id <id>', 'Alert ID')
  .action(async (options) => {
    try {
      printHeader('Acknowledging Alert');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'alertId',
          message: 'Alert ID:',
          default: options.id,
          validate: (input) => input.length > 0 ? true : 'Alert ID is required'
        }
      ]);

      await performanceService.acknowledgeAlert(answers.alertId);

      printSuccess(`Alert acknowledged successfully!`);
      console.log(chalk.cyan(`Alert ID: ${answers.alertId}`));

    } catch (error) {
      printError(`Failed to acknowledge alert: ${error.message}`);
    }
  });

// Statistics Commands
program
  .command('stats:overview')
  .description('Get performance statistics overview')
  .action(async () => {
    try {
      printHeader('Performance Statistics Overview');

      const stats = await performanceService.getSandboxStatistics();

      console.log(chalk.cyan('\n📊 Sandbox Statistics:'));
      console.log(`  Total Sandboxes: ${chalk.bold(stats.total)}`);
      console.log(`  Active: ${chalk.green.bold(stats.active)}`);
      console.log(`  Suspended: ${chalk.red.bold(stats.suspended)}`);
      console.log(`  Throttled: ${chalk.yellow.bold(stats.throttled)}`);

      console.log(chalk.cyan('\n📈 Resource Usage:'));
      console.log(`  Average CPU: ${chalk.bold(stats.averageCPU.toFixed(1))}%`);
      console.log(`  Average Memory: ${chalk.bold(stats.averageMemory)} MB`);

      // Get recent violations
      const { data: violations, error } = await supabase
        .from('performance_violations')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (!error && violations && violations.length > 0) {
        console.log(chalk.red('\n🚨 Recent Violations:'));
        violations.forEach(violation => {
          const severityColor = violation.severity === 'critical' ? chalk.red :
                               violation.severity === 'warning' ? chalk.yellow :
                               chalk.blue;
          
          console.log(`  ${severityColor(violation.severity.toUpperCase())}: ${violation.message}`);
        });
      }

    } catch (error) {
      printError(`Failed to get statistics: ${error.message}`);
    }
  });

// Resource Limits Commands
program
  .command('limits:update')
  .description('Update resource limits for a sandbox')
  .option('-m, --module <module>', 'Module ID')
  .option('-t, --tenant <tenant>', 'Tenant ID')
  .option('-v, --version <version>', 'Module version')
  .action(async (options) => {
    try {
      printHeader('Updating Resource Limits');

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'moduleId',
          message: 'Module ID:',
          default: options.module,
          validate: (input) => input.length > 0 ? true : 'Module ID is required'
        },
        {
          type: 'input',
          name: 'tenantId',
          message: 'Tenant ID:',
          default: options.tenant,
          validate: (input) => input.length > 0 ? true : 'Tenant ID is required'
        },
        {
          type: 'input',
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'number',
          name: 'cpuMaxUsage',
          message: 'CPU Max Usage (%):',
          default: 30,
          validate: (input) => input > 0 && input <= 100 ? true : 'Must be between 1 and 100'
        },
        {
          type: 'number',
          name: 'memoryMaxUsage',
          message: 'Memory Max Usage (MB):',
          default: 256,
          validate: (input) => input > 0 ? true : 'Must be greater than 0'
        },
        {
          type: 'number',
          name: 'apiRequestsPerSecond',
          message: 'API Requests per Second:',
          default: 50,
          validate: (input) => input > 0 ? true : 'Must be greater than 0'
        }
      ]);

      const limits = {
        cpu: { maxUsage: answers.cpuMaxUsage },
        memory: { maxUsage: answers.memoryMaxUsage },
        api: { requestsPerSecond: answers.apiRequestsPerSecond }
      };

      await performanceService.updateResourceLimits(
        answers.moduleId,
        answers.tenantId,
        answers.version,
        limits
      );

      printSuccess(`Resource limits updated successfully!`);
      console.log(chalk.cyan(`CPU Max: ${answers.cpuMaxUsage}%`));
      console.log(chalk.cyan(`Memory Max: ${answers.memoryMaxUsage} MB`));
      console.log(chalk.cyan(`API Max: ${answers.apiRequestsPerSecond} req/s`));

    } catch (error) {
      printError(`Failed to update limits: ${error.message}`);
    }
  });

// Real-time Monitoring
program
  .command('monitor:realtime')
  .description('Monitor performance in real-time')
  .option('-m, --module <module>', 'Module ID to monitor')
  .option('-t, --tenant <tenant>', 'Tenant ID to monitor')
  .action(async (options) => {
    try {
      printHeader('Real-time Performance Monitoring');

      if (!options.module || !options.tenant) {
        printError('Module ID and Tenant ID are required for real-time monitoring');
        return;
      }

      console.log(chalk.cyan(`Monitoring: ${options.module} (${options.tenant})`));
      console.log(chalk.gray('Press Ctrl+C to stop monitoring\n'));

      const interval = setInterval(async () => {
        try {
          const metrics = await performanceService.getPerformanceMetrics(
            options.module,
            options.tenant,
            '1.0.0' // Default version
          );

          if (metrics) {
            // Clear previous lines
            process.stdout.write('\x1B[2J\x1B[0f');
            
            console.log(chalk.blue.bold(`\n🔧 Real-time Monitoring - ${new Date().toLocaleTimeString()}`));
            console.log(chalk.gray('─'.repeat(50)));
            
            // CPU
            const cpuColor = metrics.metrics.cpu.usage > 80 ? chalk.red :
                           metrics.metrics.cpu.usage > 60 ? chalk.yellow :
                           chalk.green;
            console.log(`🖥️  CPU: ${cpuColor(metrics.metrics.cpu.usage.toFixed(1) + '%')} ${metrics.metrics.cpu.throttled ? chalk.red('(THROTTLED)') : ''}`);
            
            // Memory
            const memColor = metrics.metrics.memory.exceeded ? chalk.red :
                           metrics.metrics.memory.used > metrics.metrics.memory.limit * 0.8 ? chalk.yellow :
                           chalk.green;
            console.log(`💾 Memory: ${memColor(metrics.metrics.memory.used + 'MB')} / ${metrics.metrics.memory.limit}MB ${metrics.metrics.memory.exceeded ? chalk.red('(EXCEEDED)') : ''}`);
            
            // API
            const apiColor = metrics.metrics.api.throttled ? chalk.red : chalk.green;
            console.log(`🌐 API: ${apiColor(metrics.metrics.api.requestsPerSecond + ' req/s')} ${metrics.metrics.api.throttled ? chalk.red('(THROTTLED)') : ''}`);
            
            // Status
            const statusColor = metrics.status === 'normal' ? chalk.green :
                               metrics.status === 'warning' ? chalk.yellow :
                               chalk.red;
            console.log(`📊 Status: ${statusColor(metrics.status.toUpperCase())}`);
            
            // Violations
            if (metrics.violations.length > 0) {
              console.log(chalk.red(`🚨 Violations: ${metrics.violations.length}`));
            }
          }
        } catch (error) {
          console.log(chalk.red(`Error: ${error.message}`));
        }
      }, 2000); // Update every 2 seconds

      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(interval);
        console.log(chalk.yellow('\n\nMonitoring stopped.'));
        process.exit(0);
      });

    } catch (error) {
      printError(`Failed to start monitoring: ${error.message}`);
    }
  });

// Help command
program
  .command('help')
  .description('Show detailed help')
  .action(() => {
    printHeader('Performance Isolation CLI Help');
    
    console.log(chalk.cyan('\n📋 Available Commands:'));
    console.log(chalk.yellow('\nSandbox Management:'));
    console.log('  sandbox:create    - Create a new module sandbox');
    console.log('  sandbox:list      - List all sandboxes');
    console.log('  sandbox:metrics   - Get performance metrics');
    
    console.log(chalk.yellow('\nThrottling:'));
    console.log('  throttle:apply    - Apply throttling to a module');
    console.log('  throttle:list     - List active throttling events');
    
    console.log(chalk.yellow('\nModule Management:'));
    console.log('  module:suspend    - Suspend a module');
    console.log('  module:resume     - Resume a suspended module');
    
    console.log(chalk.yellow('\nAlerts:'));
    console.log('  alerts:list       - List performance alerts');
    console.log('  alerts:acknowledge - Acknowledge an alert');
    
    console.log(chalk.yellow('\nStatistics:'));
    console.log('  stats:overview    - Get performance statistics');
    
    console.log(chalk.yellow('\nResource Limits:'));
    console.log('  limits:update     - Update resource limits');
    
    console.log(chalk.yellow('\nMonitoring:'));
    console.log('  monitor:realtime  - Real-time performance monitoring');
    
    console.log(chalk.cyan('\n💡 Examples:'));
    console.log('  aibos performance sandbox:create -m accounting -t tenant123');
    console.log('  aibos performance throttle:apply -m accounting -t tenant123 -y cpu -l medium');
    console.log('  aibos performance monitor:realtime -m accounting -t tenant123');
  });

// Set up program
program
  .name('aibos-performance')
  .description('AI-BOS Performance Isolation Management CLI')
  .version('1.0.0');

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 