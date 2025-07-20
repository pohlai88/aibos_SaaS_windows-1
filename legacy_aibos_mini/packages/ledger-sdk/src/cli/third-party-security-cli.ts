#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { ThirdPartySecurityService } from '../services/third-party-security-service';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

// Initialize services
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
const securityService = new ThirdPartySecurityService(
  process.env.REDIS_URL || 'redis://localhost:6379',
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// Utility functions
const printHeader = (title: string) => {
  console.log(chalk.blue.bold(`\n🛡️  ${title}`));
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

// Security Scan Commands
program
  .command('scan:module')
  .description('Perform security scan on a third-party module')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .option('-p, --path <path>', 'Path to module bundle')
  .option('-t, --types <types>', 'Scan types (static,dynamic,behavioral,dependency)')
  .action(async (options) => {
    try {
      printHeader('Security Scan');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'input',
          name: 'bundlePath',
          message: 'Path to module bundle:',
          default: options.path,
          validate: (input) => {
            if (!input) return 'Bundle path is required';
            if (!fs.existsSync(input)) return 'Bundle file does not exist';
            return true;
          }
        },
        {
          type: 'checkbox',
          name: 'scanTypes',
          message: 'Select scan types:',
          choices: [
            { name: 'Static Analysis - Code pattern analysis', value: 'static', checked: true },
            { name: 'Dependency Analysis - Check dependencies', value: 'dependency', checked: true },
            { name: 'Behavioral Analysis - Runtime behavior', value: 'behavioral' },
            { name: 'Dynamic Analysis - Live execution', value: 'dynamic' }
          ],
          default: options.types ? options.types.split(',') : ['static', 'dependency']
        }
      ]);

      console.log(chalk.cyan('\n🔍 Starting security scan...'));
      
      const scan = await securityService.scanModule(
        answers.moduleId,
        answers.version,
        answers.bundlePath,
        answers.scanTypes
      );

      printSuccess(`Security scan completed!`);
      console.log(chalk.cyan(`Scan ID: ${scan.id}`));
      console.log(chalk.cyan(`Status: ${scan.status}`));
      console.log(chalk.cyan(`Risk Score: ${scan.riskScore}/100`));
      console.log(chalk.cyan(`Duration: ${scan.scanDuration}s`));
      console.log(chalk.cyan(`Results: ${scan.results.length} issues found`));

      // Display results
      if (scan.results.length > 0) {
        console.log(chalk.yellow('\n🚨 Security Issues Found:'));
        scan.results.forEach((result, index) => {
          const severityColor = result.severity === 'critical' ? chalk.red :
                               result.severity === 'high' ? chalk.yellow :
                               result.severity === 'medium' ? chalk.blue :
                               chalk.gray;
          
          console.log(`${index + 1}. ${severityColor(result.severity.toUpperCase())}: ${result.title}`);
          console.log(`   ${result.description}`);
          if (result.location) console.log(`   Location: ${result.location}`);
          if (result.codeSnippet) console.log(`   Code: ${result.codeSnippet}`);
          console.log('');
        });
      } else {
        printSuccess('No security issues found!');
      }

    } catch (error) {
      printError(`Security scan failed: ${error.message}`);
    }
  });

program
  .command('scan:list')
  .description('List security scans')
  .option('-m, --module <module>', 'Filter by module ID')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (options) => {
    try {
      printHeader('Security Scans');

      let query = supabase
        .from('security_scans')
        .select('*')
        .order('scan_date', { ascending: false });

      if (options.module) query = query.eq('module_id', options.module);
      if (options.status) query = query.eq('status', options.status);

      const { data: scans, error } = await query;

      if (error) throw error;

      if (!scans || scans.length === 0) {
        printInfo('No security scans found.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Scan ID'),
          chalk.cyan('Module'),
          chalk.cyan('Version'),
          chalk.cyan('Type'),
          chalk.cyan('Status'),
          chalk.cyan('Risk Score'),
          chalk.cyan('Date')
        ],
        colWidths: [15, 15, 10, 12, 10, 10, 20]
      });

      scans.forEach(scan => {
        const statusColor = scan.status === 'passed' ? chalk.green :
                           scan.status === 'failed' ? chalk.red :
                           scan.status === 'blocked' ? chalk.red.bold :
                           chalk.yellow;
        
        const riskColor = scan.risk_score > 80 ? chalk.red :
                         scan.risk_score > 50 ? chalk.yellow :
                         chalk.green;
        
        table.push([
          scan.id.substring(0, 12) + '...',
          scan.module_id,
          scan.version,
          scan.scan_type,
          statusColor(scan.status),
          riskColor(scan.risk_score),
          new Date(scan.scan_date).toLocaleDateString()
        ]);
      });

      console.log(table.toString());

    } catch (error) {
      printError(`Failed to list scans: ${error.message}`);
    }
  });

// Container Management Commands
program
  .command('container:create')
  .description('Create secure container for third-party module')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .option('-t, --type <type>', 'Container type (docker|firecracker|gvisor)')
  .action(async (options) => {
    try {
      printHeader('Create Secure Container');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'list',
          name: 'containerType',
          message: 'Container type:',
          choices: [
            { name: 'Docker - Standard containerization', value: 'docker' },
            { name: 'Firecracker - Lightweight VMs', value: 'firecracker' },
            { name: 'gVisor - Application kernel', value: 'gvisor' }
          ],
          default: options.type || 'docker'
        }
      ]);

      console.log(chalk.cyan('\n🔒 Creating secure container...'));
      
      const container = await securityService.createSecureContainer(
        answers.moduleId,
        answers.version,
        answers.containerType
      );

      printSuccess(`Secure container created!`);
      console.log(chalk.cyan(`Container ID: ${container.id}`));
      console.log(chalk.cyan(`Type: ${container.containerType}`));
      console.log(chalk.cyan(`Image: ${container.image}`));
      console.log(chalk.cyan(`CPU: ${container.resources.cpu} cores`));
      console.log(chalk.cyan(`Memory: ${container.resources.memory} MB`));
      console.log(chalk.cyan(`Storage: ${container.resources.storage} MB`));
      console.log(chalk.cyan(`Network: ${container.networking.isolated ? 'Isolated' : 'Restricted'}`));

    } catch (error) {
      printError(`Failed to create container: ${error.message}`);
    }
  });

program
  .command('container:run')
  .description('Run module in secure container')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .option('-e, --entry <entry>', 'Entry point')
  .action(async (options) => {
    try {
      printHeader('Run Module in Container');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'input',
          name: 'entryPoint',
          message: 'Entry point:',
          default: options.entry || 'npm start',
          validate: (input) => input.length > 0 ? true : 'Entry point is required'
        }
      ]);

      console.log(chalk.cyan('\n🚀 Starting module in secure container...'));
      
      const result = await securityService.runModuleInContainer(
        answers.moduleId,
        answers.version,
        answers.entryPoint
      );

      printSuccess(`Module started in container!`);
      console.log(chalk.cyan(`Container ID: ${result.containerId}`));
      console.log(chalk.cyan(`Status: ${result.status}`));
      
      if (result.logs.length > 0) {
        console.log(chalk.cyan('\n📋 Container Logs:'));
        result.logs.forEach(log => {
          console.log(`  ${log}`);
        });
      }

    } catch (error) {
      printError(`Failed to run module: ${error.message}`);
    }
  });

// Bundle Validation Commands
program
  .command('bundle:validate')
  .description('Validate JavaScript bundle for malicious code')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .option('-p, --path <path>', 'Path to bundle file')
  .action(async (options) => {
    try {
      printHeader('Bundle Validation');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'input',
          name: 'bundlePath',
          message: 'Path to bundle file:',
          default: options.path,
          validate: (input) => {
            if (!input) return 'Bundle path is required';
            if (!fs.existsSync(input)) return 'Bundle file does not exist';
            return true;
          }
        }
      ]);

      console.log(chalk.cyan('\n🔍 Analyzing bundle...'));
      
      const analysis = await securityService.validateBundle(
        answers.moduleId,
        answers.version,
        answers.bundlePath
      );

      printSuccess(`Bundle analysis completed!`);
      console.log(chalk.cyan(`Analysis ID: ${analysis.id}`));
      console.log(chalk.cyan(`Bundle Size: ${(analysis.bundleSize / 1024 / 1024).toFixed(2)} MB`));
      console.log(chalk.cyan(`File Count: ${analysis.fileCount}`));
      console.log(chalk.cyan(`Dependencies: ${analysis.dependencies.length}`));
      console.log(chalk.cyan(`Suspicious Patterns: ${analysis.suspiciousPatterns.length}`));
      console.log(chalk.cyan(`Obfuscated: ${analysis.obfuscatedCode ? 'Yes' : 'No'}`));
      console.log(chalk.cyan(`Minified: ${analysis.minifiedCode ? 'Yes' : 'No'}`));
      console.log(chalk.cyan(`Source Maps: ${analysis.sourceMaps ? 'Yes' : 'No'}`));

      // Display suspicious patterns
      if (analysis.suspiciousPatterns.length > 0) {
        console.log(chalk.yellow('\n🚨 Suspicious Patterns Found:'));
        analysis.suspiciousPatterns.forEach((pattern, index) => {
          const riskColor = pattern.risk === 'critical' ? chalk.red :
                           pattern.risk === 'high' ? chalk.yellow :
                           pattern.risk === 'medium' ? chalk.blue :
                           chalk.gray;
          
          console.log(`${index + 1}. ${riskColor(pattern.risk.toUpperCase())}: ${pattern.type}`);
          console.log(`   ${pattern.description}`);
          console.log(`   Pattern: ${pattern.pattern}`);
          console.log('');
        });
      } else {
        printSuccess('No suspicious patterns found!');
      }

      // Display dependencies
      if (analysis.dependencies.length > 0) {
        console.log(chalk.cyan('\n📦 Dependencies:'));
        analysis.dependencies.forEach(dep => {
          const vulnColor = dep.vulnerabilities > 0 ? chalk.red : chalk.green;
          console.log(`  ${dep.name}@${dep.version} (${dep.type}) - ${vulnColor(dep.vulnerabilities)} vulnerabilities`);
        });
      }

    } catch (error) {
      printError(`Bundle validation failed: ${error.message}`);
    }
  });

// Quarantine Management Commands
program
  .command('quarantine:add')
  .description('Quarantine a suspicious module')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .option('-r, --reason <reason>', 'Quarantine reason')
  .action(async (options) => {
    try {
      printHeader('Quarantine Module');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'input',
          name: 'reason',
          message: 'Quarantine reason:',
          default: options.reason || 'Security violation detected',
          validate: (input) => input.length > 0 ? true : 'Reason is required'
        }
      ]);

      // Get security issues from latest scan
      const { data: latestScan, error: scanError } = await supabase
        .from('security_scans')
        .select('results')
        .eq('module_id', answers.moduleId)
        .eq('version', answers.version)
        .order('scan_date', { ascending: false })
        .limit(1)
        .single();

      if (scanError && scanError.code !== 'PGRST116') throw scanError;

      const securityIssues = latestScan?.results || [];

      console.log(chalk.cyan('\n🚫 Quarantining module...'));
      
      const quarantine = await securityService.quarantineModule(
        answers.moduleId,
        answers.version,
        answers.reason,
        securityIssues
      );

      printSuccess(`Module quarantined successfully!`);
      console.log(chalk.cyan(`Quarantine ID: ${quarantine.id}`));
      console.log(chalk.cyan(`Reason: ${quarantine.reason}`));
      console.log(chalk.cyan(`Security Issues: ${quarantine.securityIssues.length}`));
      console.log(chalk.cyan(`Status: ${quarantine.status}`));

    } catch (error) {
      printError(`Failed to quarantine module: ${error.message}`);
    }
  });

program
  .command('quarantine:list')
  .description('List quarantined modules')
  .action(async () => {
    try {
      printHeader('Quarantined Modules');

      const { data: quarantined, error } = await supabase
        .from('quarantine_entries')
        .select('*')
        .eq('status', 'quarantined')
        .order('quarantine_date', { ascending: false });

      if (error) throw error;

      if (!quarantined || quarantined.length === 0) {
        printInfo('No quarantined modules found.');
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Module ID'),
          chalk.cyan('Version'),
          chalk.cyan('Reason'),
          chalk.cyan('Issues'),
          chalk.cyan('Quarantined'),
          chalk.cyan('Status')
        ],
        colWidths: [15, 10, 30, 8, 20, 12]
      });

      quarantined.forEach(entry => {
        table.push([
          entry.module_id,
          entry.version,
          entry.reason.substring(0, 27) + '...',
          entry.security_issues?.length || 0,
          new Date(entry.quarantine_date).toLocaleDateString(),
          chalk.red(entry.status)
        ]);
      });

      console.log(table.toString());

    } catch (error) {
      printError(`Failed to list quarantined modules: ${error.message}`);
    }
  });

program
  .command('quarantine:review')
  .description('Review a quarantined module')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .action(async (options) => {
    try {
      printHeader('Review Quarantined Module');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        },
        {
          type: 'list',
          name: 'decision',
          message: 'Review decision:',
          choices: [
            { name: 'Approve - Release from quarantine', value: 'approved' },
            { name: 'Reject - Keep quarantined', value: 'rejected' }
          ]
        },
        {
          type: 'input',
          name: 'notes',
          message: 'Review notes:',
          default: ''
        }
      ]);

      console.log(chalk.cyan('\n📋 Reviewing module...'));
      
      await securityService.reviewQuarantinedModule(
        answers.moduleId,
        answers.version,
        'reviewer123', // In real app, get from auth
        answers.decision,
        answers.notes
      );

      printSuccess(`Module review completed!`);
      console.log(chalk.cyan(`Decision: ${answers.decision}`));
      if (answers.notes) console.log(chalk.cyan(`Notes: ${answers.notes}`));

    } catch (error) {
      printError(`Failed to review module: ${error.message}`);
    }
  });

// Security Statistics Commands
program
  .command('stats:security')
  .description('Get security statistics')
  .action(async () => {
    try {
      printHeader('Security Statistics');

      const stats = await securityService.getSecurityStatistics();

      console.log(chalk.cyan('\n📊 Security Overview:'));
      console.log(`  Total Scans: ${chalk.bold(stats.totalScans)}`);
      console.log(`  Passed Scans: ${chalk.green.bold(stats.passedScans)}`);
      console.log(`  Failed Scans: ${chalk.red.bold(stats.failedScans)}`);
      console.log(`  Quarantined Modules: ${chalk.yellow.bold(stats.quarantinedModules)}`);
      console.log(`  Average Risk Score: ${chalk.bold(stats.averageRiskScore.toFixed(1))}/100`);

      if (stats.topVulnerabilities.length > 0) {
        console.log(chalk.yellow('\n🚨 Top Vulnerabilities:'));
        stats.topVulnerabilities.forEach((vuln, index) => {
          console.log(`  ${index + 1}. ${vuln}`);
        });
      }

      // Get recent security events
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (!error && events && events.length > 0) {
        console.log(chalk.cyan('\n📋 Recent Security Events:'));
        events.forEach(event => {
          const severityColor = event.severity === 'critical' ? chalk.red :
                               event.severity === 'high' ? chalk.yellow :
                               event.severity === 'medium' ? chalk.blue :
                               chalk.gray;
          
          console.log(`  ${severityColor(event.severity.toUpperCase())}: ${event.description}`);
          console.log(`    Module: ${event.module_id}@${event.version}`);
          console.log(`    Time: ${new Date(event.timestamp).toLocaleString()}`);
          console.log('');
        });
      }

    } catch (error) {
      printError(`Failed to get security statistics: ${error.message}`);
    }
  });

// Security Check Commands
program
  .command('check:module')
  .description('Check if module is secure')
  .option('-m, --module <module>', 'Module ID')
  .option('-v, --version <version>', 'Module version')
  .action(async (options) => {
    try {
      printHeader('Module Security Check');

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
          name: 'version',
          message: 'Module version:',
          default: options.version || '1.0.0',
          validate: (input) => input.length > 0 ? true : 'Version is required'
        }
      ]);

      console.log(chalk.cyan('\n🔍 Checking module security...'));
      
      const isQuarantined = await securityService.isModuleQuarantined(
        answers.moduleId,
        answers.version
      );

      if (isQuarantined) {
        printWarning('Module is quarantined!');
        console.log(chalk.red('This module has been quarantined due to security issues.'));
        console.log(chalk.red('It cannot be installed or used until reviewed.'));
        return;
      }

      // Get latest scan
      const { data: latestScan, error } = await supabase
        .from('security_scans')
        .select('*')
        .eq('module_id', answers.moduleId)
        .eq('version', answers.version)
        .order('scan_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!latestScan) {
        printWarning('No security scan found for this module!');
        console.log(chalk.yellow('A security scan should be performed before using this module.'));
        return;
      }

      if (latestScan.status === 'passed' && latestScan.risk_score <= 30) {
        printSuccess('Module is secure!');
        console.log(chalk.green(`Status: ${latestScan.status}`));
        console.log(chalk.green(`Risk Score: ${latestScan.risk_score}/100`));
        console.log(chalk.green(`Last Scan: ${new Date(latestScan.scan_date).toLocaleString()}`));
      } else {
        printWarning('Module has security concerns!');
        console.log(chalk.yellow(`Status: ${latestScan.status}`));
        console.log(chalk.yellow(`Risk Score: ${latestScan.risk_score}/100`));
        console.log(chalk.yellow(`Issues Found: ${latestScan.results?.length || 0}`));
      }

    } catch (error) {
      printError(`Security check failed: ${error.message}`);
    }
  });

// Help command
program
  .command('help')
  .description('Show detailed help')
  .action(() => {
    printHeader('Third-Party Security CLI Help');
    
    console.log(chalk.cyan('\n📋 Available Commands:'));
    console.log(chalk.yellow('\nSecurity Scans:'));
    console.log('  scan:module    - Perform security scan on module');
    console.log('  scan:list      - List security scans');
    
    console.log(chalk.yellow('\nContainer Management:'));
    console.log('  container:create - Create secure container');
    console.log('  container:run    - Run module in container');
    
    console.log(chalk.yellow('\nBundle Validation:'));
    console.log('  bundle:validate - Validate JavaScript bundle');
    
    console.log(chalk.yellow('\nQuarantine Management:'));
    console.log('  quarantine:add    - Quarantine suspicious module');
    console.log('  quarantine:list   - List quarantined modules');
    console.log('  quarantine:review - Review quarantined module');
    
    console.log(chalk.yellow('\nSecurity Statistics:'));
    console.log('  stats:security - Get security statistics');
    
    console.log(chalk.yellow('\nSecurity Checks:'));
    console.log('  check:module   - Check if module is secure');
    
    console.log(chalk.cyan('\n💡 Examples:'));
    console.log('  aibos security scan:module -m accounting -v 1.0.0 -p ./bundle.js');
    console.log('  aibos security container:create -m accounting -v 1.0.0 -t docker');
    console.log('  aibos security bundle:validate -m accounting -v 1.0.0 -p ./bundle.js');
    console.log('  aibos security quarantine:add -m suspicious-module -v 1.0.0 -r "Malicious code detected"');
  });

// Set up program
program
  .name('aibos-security')
  .description('AI-BOS Third-Party Security Management CLI')
  .version('1.0.0');

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 