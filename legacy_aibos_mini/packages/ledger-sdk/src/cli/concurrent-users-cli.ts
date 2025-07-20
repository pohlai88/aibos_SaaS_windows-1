#!/usr/bin/env node

import { Command } from 'commander';
import { ConcurrentUsersService } from '../services/concurrent-users-service';
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
  
  return new ConcurrentUsersService(redisUrl, supabaseUrl, supabaseKey);
};

// ========================================
// CURRENT CONCURRENT USERS COMMANDS
// ========================================

program
  .command('current')
  .description('Get current concurrent users')
  .action(async () => {
    const spinner = ora('Getting current concurrent users...').start();
    try {
      const service = initializeService();
      const count = await service.getCurrentConcurrentUsers();
      spinner.succeed(`Current concurrent users: ${chalk.blue(count)}`);
    } catch (error) {
      spinner.fail(`Failed to get current users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('metrics')
  .description('Get comprehensive concurrent user metrics')
  .action(async () => {
    const spinner = ora('Loading metrics...').start();
    try {
      const service = initializeService();
      const metrics = await service.getConcurrentUserMetrics();
      spinner.succeed('Metrics loaded successfully');
      
      console.log('\n' + chalk.bold('📊 Concurrent Users Metrics'));
      console.log('='.repeat(50));
      
      // Main metrics
      const mainTable = new Table({
        head: ['Metric', 'Value'],
        colWidths: [20, 15]
      });
      
      mainTable.push(
        ['Current Users', chalk.blue(metrics.current)],
        ['Peak Users (24h)', chalk.yellow(metrics.peak)],
        ['Average Users (1h)', chalk.green(metrics.average)],
        ['Error Rate', `${(metrics.errorRate * 100).toFixed(2)}%`]
      );
      
      console.log(mainTable.toString());
      
      // Response time metrics
      console.log('\n' + chalk.bold('⏱️  Response Time'));
      const responseTable = new Table({
        head: ['Percentile', 'Response Time'],
        colWidths: [15, 15]
      });
      
      responseTable.push(
        ['P50 (Median)', `${metrics.responseTime.p50}ms`],
        ['P95', `${metrics.responseTime.p95}ms`],
        ['P99', `${metrics.responseTime.p99}ms`]
      );
      
      console.log(responseTable.toString());
      
      // Resource utilization
      console.log('\n' + chalk.bold('💻 Resource Utilization'));
      const resourceTable = new Table({
        head: ['Resource', 'Usage'],
        colWidths: [15, 15]
      });
      
      resourceTable.push(
        ['CPU', `${metrics.resourceUtilization.cpu}%`],
        ['Memory', `${metrics.resourceUtilization.memory}%`],
        ['Database', `${metrics.resourceUtilization.database}%`]
      );
      
      console.log(resourceTable.toString());
      
      // Module usage
      console.log('\n' + chalk.bold('📦 Users by Module'));
      const moduleTable = new Table({
        head: ['Module', 'Users'],
        colWidths: [15, 10]
      });
      
      Object.entries(metrics.byModule).forEach(([module, count]) => {
        moduleTable.push([module, count.toString()]);
      });
      
      console.log(moduleTable.toString());
      
      // Top organizations
      console.log('\n' + chalk.bold('🏢 Top Organizations'));
      const orgTable = new Table({
        head: ['Organization', 'Users'],
        colWidths: [20, 10]
      });
      
      Object.entries(metrics.byOrganization).slice(0, 5).forEach(([orgId, count]) => {
        orgTable.push([orgId.substring(0, 8) + '...', count.toString()]);
      });
      
      console.log(orgTable.toString());
      
    } catch (error) {
      spinner.fail(`Failed to load metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// MODULE AND ORGANIZATION COMMANDS
// ========================================

program
  .command('module <moduleId>')
  .description('Get concurrent users for a specific module')
  .action(async (moduleId) => {
    const spinner = ora(`Getting concurrent users for module: ${moduleId}`).start();
    try {
      const service = initializeService();
      const count = await service.getConcurrentUsersByModule(moduleId);
      spinner.succeed(`Module ${chalk.blue(moduleId)}: ${chalk.green(count)} concurrent users`);
    } catch (error) {
      spinner.fail(`Failed to get module users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('organization <organizationId>')
  .description('Get concurrent users for a specific organization')
  .action(async (organizationId) => {
    const spinner = ora(`Getting concurrent users for organization: ${organizationId}`).start();
    try {
      const service = initializeService();
      const count = await service.getConcurrentUsersByOrganization(organizationId);
      spinner.succeed(`Organization ${chalk.blue(organizationId)}: ${chalk.green(count)} concurrent users`);
    } catch (error) {
      spinner.fail(`Failed to get organization users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// HISTORICAL DATA COMMANDS
// ========================================

program
  .command('peak')
  .description('Get peak concurrent users')
  .option('-s, --start <start>', 'Start time (ISO string or relative like "1h", "24h")')
  .option('-e, --end <end>', 'End time (ISO string or relative like "1h", "24h")')
  .action(async (options) => {
    const spinner = ora('Getting peak concurrent users...').start();
    try {
      const service = initializeService();
      
      let startTime = Date.now() - 24 * 60 * 60 * 1000; // Default: 24 hours ago
      let endTime = Date.now();
      
      if (options.start) {
        startTime = parseTimeString(options.start);
      }
      if (options.end) {
        endTime = parseTimeString(options.end);
      }
      
      const peak = await service.getPeakConcurrentUsers(startTime, endTime);
      const startDate = new Date(startTime).toLocaleString();
      const endDate = new Date(endTime).toLocaleString();
      
      spinner.succeed(`Peak concurrent users: ${chalk.yellow(peak)} (${startDate} to ${endDate})`);
    } catch (error) {
      spinner.fail(`Failed to get peak users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('average')
  .description('Get average concurrent users')
  .option('-s, --start <start>', 'Start time (ISO string or relative like "1h", "24h")')
  .option('-e, --end <end>', 'End time (ISO string or relative like "1h", "24h")')
  .action(async (options) => {
    const spinner = ora('Getting average concurrent users...').start();
    try {
      const service = initializeService();
      
      let startTime = Date.now() - 60 * 60 * 1000; // Default: 1 hour ago
      let endTime = Date.now();
      
      if (options.start) {
        startTime = parseTimeString(options.start);
      }
      if (options.end) {
        endTime = parseTimeString(options.end);
      }
      
      const average = await service.getAverageConcurrentUsers(startTime, endTime);
      const startDate = new Date(startTime).toLocaleString();
      const endDate = new Date(endTime).toLocaleString();
      
      spinner.succeed(`Average concurrent users: ${chalk.green(average.toFixed(2))} (${startDate} to ${endDate})`);
    } catch (error) {
      spinner.fail(`Failed to get average users: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('trend')
  .description('Show concurrent users trend (last 24 hours)')
  .action(async () => {
    const spinner = ora('Loading trend data...').start();
    try {
      const service = initializeService();
      const trend = await service.getConcurrentUsersTrend();
      spinner.succeed('Trend data loaded');
      
      console.log('\n' + chalk.bold('📈 Concurrent Users Trend (24h)'));
      console.log('='.repeat(60));
      
      const trendTable = new Table({
        head: ['Time', 'Users', 'Chart'],
        colWidths: [15, 10, 30]
      });
      
      const maxCount = Math.max(...trend.map(p => p.count));
      
      trend.forEach((point, index) => {
        const time = new Date(point.timestamp).toLocaleTimeString();
        const barLength = maxCount > 0 ? Math.round((point.count / maxCount) * 20) : 0;
        const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
        
        trendTable.push([
          time,
          point.count.toString(),
          bar
        ]);
      });
      
      console.log(trendTable.toString());
      
    } catch (error) {
      spinner.fail(`Failed to load trend: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// REAL-TIME MONITORING COMMANDS
// ========================================

program
  .command('monitor')
  .description('Monitor concurrent users in real-time')
  .option('-i, --interval <seconds>', 'Update interval in seconds', '5')
  .action(async (options) => {
    const interval = parseInt(options.interval) * 1000;
    const service = initializeService();
    
    console.log(chalk.bold('🔄 Real-time Concurrent Users Monitor'));
    console.log(chalk.gray(`Update interval: ${options.interval} seconds`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    const updateDisplay = async () => {
      try {
        const count = await service.getRealtimeConcurrentUsers();
        const timestamp = new Date().toLocaleTimeString();
        
        // Clear line and update
        process.stdout.write('\r');
        process.stdout.write(chalk.blue(`[${timestamp}] `) + 
                           chalk.bold(`Concurrent Users: ${chalk.green(count)}`));
      } catch (error) {
        console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    // Initial update
    await updateDisplay();
    
    // Set up interval
    const intervalId = setInterval(updateDisplay, interval);
    
    // Handle cleanup
    process.on('SIGINT', () => {
      clearInterval(intervalId);
      console.log('\n' + chalk.yellow('Monitoring stopped'));
      process.exit(0);
    });
  });

// ========================================
// ADMIN COMMANDS
// ========================================

program
  .command('health')
  .description('Check system health')
  .action(async () => {
    const spinner = ora('Checking system health...').start();
    try {
      const service = initializeService();
      const count = await service.getCurrentConcurrentUsers();
      
      spinner.succeed('System is healthy');
      console.log(chalk.green(`✓ Current concurrent users: ${count}`));
      console.log(chalk.green('✓ Redis connection: OK'));
      console.log(chalk.green('✓ Database connection: OK'));
      
    } catch (error) {
      spinner.fail('System health check failed');
      console.log(chalk.red(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('track')
  .description('Track user activity (for testing)')
  .requiredOption('-u, --user <userId>', 'User ID')
  .requiredOption('-o, --org <organizationId>', 'Organization ID')
  .requiredOption('-s, --session <sessionId>', 'Session ID')
  .option('-m, --module <moduleId>', 'Module ID')
  .action(async (options) => {
    const spinner = ora('Tracking user activity...').start();
    try {
      const service = initializeService();
      
      await service.trackUserActivity({
        userId: options.user,
        organizationId: options.org,
        sessionId: options.session,
        moduleId: options.module,
        userAgent: 'CLI Test',
        ipAddress: '127.0.0.1',
        isActive: true
      });
      
      spinner.succeed('User activity tracked successfully');
      console.log(chalk.green(`✓ User: ${options.user}`));
      console.log(chalk.green(`✓ Organization: ${options.org}`));
      console.log(chalk.green(`✓ Session: ${options.session}`));
      if (options.module) {
        console.log(chalk.green(`✓ Module: ${options.module}`));
      }
      
    } catch (error) {
      spinner.fail(`Failed to track activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// UTILITY FUNCTIONS
// ========================================

function parseTimeString(timeStr: string): number {
  const now = Date.now();
  
  // Handle relative time strings
  if (timeStr.endsWith('h')) {
    const hours = parseInt(timeStr.slice(0, -1));
    return now - (hours * 60 * 60 * 1000);
  }
  if (timeStr.endsWith('m')) {
    const minutes = parseInt(timeStr.slice(0, -1));
    return now - (minutes * 60 * 1000);
  }
  if (timeStr.endsWith('d')) {
    const days = parseInt(timeStr.slice(0, -1));
    return now - (days * 24 * 60 * 60 * 1000);
  }
  
  // Handle ISO string
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  return date.getTime();
}

// ========================================
// PROGRAM SETUP
// ========================================

program
  .name('aibos-concurrent-users')
  .description('AI-BOS Concurrent Users Monitoring CLI')
  .version('1.0.0');

// Add help text
program.addHelpText('after', `

Examples:
  $ aibos-concurrent-users current
  $ aibos-concurrent-users metrics
  $ aibos-concurrent-users module accounting
  $ aibos-concurrent-users peak --start 24h --end now
  $ aibos-concurrent-users monitor --interval 10
  $ aibos-concurrent-users track -u user123 -o org456 -s session789 -m accounting

Environment Variables:
  REDIS_URL          Redis connection URL (default: redis://localhost:6379)
  SUPABASE_URL       Supabase project URL
  SUPABASE_KEY       Supabase service role key
`);

// Parse arguments
program.parse(); 