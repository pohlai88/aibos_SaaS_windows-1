#!/usr/bin/env node

import { Command } from 'commander';
import { ConcurrentUsersService } from '../services/concurrent-users-service';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const program = new Command();

// ========================================
// MICRO-DEVELOPER ECOSYSTEM COMMANDS
// ========================================

program
  .command('init')
  .description('Initialize as a micro-developer for AI-BOS')
  .option('-n, --name <name>', 'Your developer name')
  .option('-e, --email <email>', 'Your email address')
  .option('-s, --specialty <specialty>', 'Your development specialty')
  .action(async (options) => {
    const spinner = ora('Initializing micro-developer profile...').start();
    
    try {
      // Create developer profile
      const profile = {
        name: options.name || 'Anonymous Developer',
        email: options.email || 'dev@aibos.local',
        specialty: options.specialty || 'general',
        createdAt: new Date().toISOString(),
        projects: [],
        contributions: 0,
        reputation: 0
      };

      // Create .aibos directory
      const aibosDir = path.join(process.cwd(), '.aibos');
      if (!fs.existsSync(aibosDir)) {
        fs.mkdirSync(aibosDir, { recursive: true });
      }

      // Save profile
      fs.writeFileSync(
        path.join(aibosDir, 'profile.json'),
        JSON.stringify(profile, null, 2)
      );

      // Create project templates
      const templatesDir = path.join(aibosDir, 'templates');
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
      }

      spinner.succeed('Micro-developer profile created successfully!');
      console.log(chalk.green(`\n🎉 Welcome to AI-BOS Micro-Developer Program!`));
      console.log(chalk.blue(`Name: ${profile.name}`));
      console.log(chalk.blue(`Specialty: ${profile.specialty}`));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.gray(`  • aibos create-module - Create your first module`));
      console.log(chalk.gray(`  • aibos browse-marketplace - Explore existing modules`));
      console.log(chalk.gray(`  • aibos contribute - Contribute to existing modules`));

    } catch (error) {
      spinner.fail(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('create-module')
  .description('Create a new AI-BOS module')
  .requiredOption('-n, --name <name>', 'Module name')
  .option('-d, --description <description>', 'Module description')
  .option('-t, --type <type>', 'Module type (accounting, crm, inventory, custom)', 'custom')
  .option('-v, --version <version>', 'Module version', '1.0.0')
  .action(async (options) => {
    const spinner = ora(`Creating module: ${options.name}`).start();
    
    try {
      const moduleDir = path.join(process.cwd(), options.name);
      
      if (fs.existsSync(moduleDir)) {
        spinner.fail(`Module directory already exists: ${options.name}`);
        process.exit(1);
      }

      // Create module structure
      fs.mkdirSync(moduleDir, { recursive: true });
      
      // Create package.json
      const packageJson = {
        name: `@aibos/${options.name}`,
        version: options.version,
        description: options.description || `AI-BOS ${options.name} module`,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          dev: 'tsc --watch',
          test: 'jest',
          lint: 'eslint src --ext .ts'
        },
        dependencies: {
          '@aibos/core-types': 'workspace:*',
          '@aibos/ledger-sdk': 'workspace:*'
        },
        devDependencies: {
          typescript: '^5.3.0',
          '@types/node': '^20.10.0'
        },
        keywords: ['aibos', 'module', options.type],
        author: 'AI-BOS Micro-Developer',
        license: 'MIT'
      };

      fs.writeFileSync(
        path.join(moduleDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create TypeScript config
      const tsConfig = {
        extends: '../../tsconfig.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src'
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      };

      fs.writeFileSync(
        path.join(moduleDir, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );

      // Create source directory and files
      const srcDir = path.join(moduleDir, 'src');
      fs.mkdirSync(srcDir, { recursive: true });

      // Create main module file
      const moduleCode = `import { ModuleInterface } from '@aibos/core-types';

export interface ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Config {
  // Add your module configuration here
}

export class ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Module implements ModuleInterface {
  private config: ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Config;

  constructor(config: ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Config) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('Initializing ${options.name} module...');
    // Add initialization logic
  }

  async start(): Promise<void> {
    console.log('Starting ${options.name} module...');
    // Add start logic
  }

  async stop(): Promise<void> {
    console.log('Stopping ${options.name} module...');
    // Add stop logic
  }

  getMetadata() {
    return {
      name: '${options.name}',
      version: '${options.version}',
      type: '${options.type}',
      description: '${options.description || `AI-BOS ${options.name} module`}',
      author: 'AI-BOS Micro-Developer'
    };
  }
}

export default ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Module;
`;

      fs.writeFileSync(
        path.join(srcDir, 'index.ts'),
        moduleCode
      );

      // Create README
      const readme = `# ${options.name.charAt(0).toUpperCase() + options.name.slice(1)} Module

${options.description || `AI-BOS ${options.name} module`}

## Installation

\`\`\`bash
# Install the module
aibos install-module @aibos/${options.name}

# Or install locally for development
cd ${options.name}
pnpm install
pnpm build
\`\`\`

## Usage

\`\`\`typescript
import { ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Module } from '@aibos/${options.name}';

const module = new ${options.name.charAt(0).toUpperCase() + options.name.slice(1)}Module({
  // Add your configuration
});

await module.initialize();
await module.start();
\`\`\`

## Development

\`\`\`bash
# Start development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
\`\`\`

## Contributing

This module was created by an AI-BOS Micro-Developer. To contribute:

1. Fork the module
2. Make your changes
3. Submit a pull request
4. Get reviewed by the community

## License

MIT License - see LICENSE file for details
`;

      fs.writeFileSync(
        path.join(moduleDir, 'README.md'),
        readme
      );

      spinner.succeed(`Module "${options.name}" created successfully!`);
      console.log(chalk.green(`\n📁 Module created at: ${moduleDir}`));
      console.log(chalk.blue(`\nNext steps:`));
      console.log(chalk.gray(`  cd ${options.name}`));
      console.log(chalk.gray(`  pnpm install`));
      console.log(chalk.gray(`  pnpm dev`));
      console.log(chalk.gray(`  aibos publish-module - Publish to marketplace`));

    } catch (error) {
      spinner.fail(`Failed to create module: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('publish-module')
  .description('Publish your module to the AI-BOS marketplace')
  .option('-p, --path <path>', 'Path to module directory', '.')
  .option('-v, --version <version>', 'Version to publish')
  .option('-m, --message <message>', 'Release message')
  .action(async (options) => {
    const spinner = ora('Publishing module to marketplace...').start();
    
    try {
      const modulePath = path.resolve(options.path);
      const packageJsonPath = path.join(modulePath, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        spinner.fail('No package.json found. Are you in a module directory?');
        process.exit(1);
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Validate module
      if (!packageJson.name?.startsWith('@aibos/')) {
        spinner.fail('Module name must start with @aibos/');
        process.exit(1);
      }

      // Build module
      spinner.text = 'Building module...';
      try {
        execSync('pnpm build', { cwd: modulePath, stdio: 'pipe' });
      } catch (error) {
        spinner.fail('Build failed. Please fix errors before publishing.');
        process.exit(1);
      }

      // Create module package
      spinner.text = 'Creating module package...';
      const moduleData = {
        name: packageJson.name,
        version: options.version || packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        keywords: packageJson.keywords,
        dependencies: packageJson.dependencies,
        files: ['dist/**/*', 'src/**/*', 'README.md', 'LICENSE'],
        publishDate: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        reviews: []
      };

      // Save to local registry
      const registryDir = path.join(process.cwd(), '.aibos', 'registry');
      if (!fs.existsSync(registryDir)) {
        fs.mkdirSync(registryDir, { recursive: true });
      }

      const moduleFile = path.join(registryDir, `${packageJson.name.replace('@aibos/', '')}.json`);
      fs.writeFileSync(moduleFile, JSON.stringify(moduleData, null, 2));

      spinner.succeed(`Module "${packageJson.name}" published successfully!`);
      console.log(chalk.green(`\n📦 Version: ${moduleData.version}`));
      console.log(chalk.blue(`\nNext steps:`));
      console.log(chalk.gray(`  • Share your module with the community`));
      console.log(chalk.gray(`  • Get feedback and reviews`));
      console.log(chalk.gray(`  • Earn reputation points`));

    } catch (error) {
      spinner.fail(`Failed to publish module: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('browse-marketplace')
  .description('Browse available modules in the marketplace')
  .option('-c, --category <category>', 'Filter by category')
  .option('-s, --sort <sort>', 'Sort by (popularity, rating, date)', 'popularity')
  .option('-l, --limit <limit>', 'Number of modules to show', '10')
  .action(async (options) => {
    const spinner = ora('Loading marketplace...').start();
    
    try {
      // Load local registry
      const registryDir = path.join(process.cwd(), '.aibos', 'registry');
      const modules = [];

      if (fs.existsSync(registryDir)) {
        const files = fs.readdirSync(registryDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const moduleData = JSON.parse(
              fs.readFileSync(path.join(registryDir, file), 'utf8')
            );
            modules.push(moduleData);
          }
        }
      }

      // Add sample modules for demonstration
      const sampleModules = [
        {
          name: '@aibos/advanced-accounting',
          version: '2.1.0',
          description: 'Advanced accounting features with AI-powered insights',
          author: 'FinanceExpert',
          keywords: ['accounting', 'ai', 'advanced'],
          downloads: 1250,
          rating: 4.8,
          publishDate: '2024-01-10T10:00:00.000Z'
        },
        {
          name: '@aibos/smart-inventory',
          version: '1.5.2',
          description: 'Intelligent inventory management with predictive analytics',
          author: 'SupplyChainPro',
          keywords: ['inventory', 'analytics', 'predictive'],
          downloads: 890,
          rating: 4.6,
          publishDate: '2024-01-08T15:30:00.000Z'
        },
        {
          name: '@aibos/crm-automation',
          version: '1.2.1',
          description: 'Automated CRM workflows and lead management',
          author: 'SalesGuru',
          keywords: ['crm', 'automation', 'workflow'],
          downloads: 567,
          rating: 4.4,
          publishDate: '2024-01-05T09:15:00.000Z'
        }
      ];

      const allModules = [...modules, ...sampleModules];

      // Filter and sort
      let filteredModules = allModules;
      if (options.category) {
        filteredModules = allModules.filter(m => 
          m.keywords?.some(k => k.toLowerCase().includes(options.category.toLowerCase()))
        );
      }

      // Sort modules
      filteredModules.sort((a, b) => {
        switch (options.sort) {
          case 'rating':
            return b.rating - a.rating;
          case 'date':
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          case 'popularity':
          default:
            return b.downloads - a.downloads;
        }
      });

      // Limit results
      filteredModules = filteredModules.slice(0, parseInt(options.limit));

      spinner.succeed(`Found ${filteredModules.length} modules`);

      // Display modules
      const table = new Table({
        head: ['Module', 'Version', 'Rating', 'Downloads', 'Author'],
        colWidths: [25, 10, 8, 12, 15]
      });

      filteredModules.forEach(module => {
        table.push([
          chalk.blue(module.name),
          module.version,
          chalk.yellow(`${module.rating}⭐`),
          module.downloads.toLocaleString(),
          chalk.green(module.author)
        ]);
      });

      console.log('\n' + chalk.bold('🛍️  AI-BOS Module Marketplace'));
      console.log('='.repeat(80));
      console.log(table.toString());

      console.log(chalk.gray(`\nCommands:`));
      console.log(chalk.gray(`  aibos install-module <name> - Install a module`));
      console.log(chalk.gray(`  aibos view-module <name> - View module details`));
      console.log(chalk.gray(`  aibos review-module <name> - Review a module`));

    } catch (error) {
      spinner.fail(`Failed to load marketplace: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('install-module <name>')
  .description('Install a module from the marketplace')
  .option('-v, --version <version>', 'Specific version to install')
  .option('-g, --global', 'Install globally')
  .action(async (name, options) => {
    const spinner = ora(`Installing module: ${name}`).start();
    
    try {
      // Check if module exists in registry
      const registryDir = path.join(process.cwd(), '.aibos', 'registry');
      const moduleFile = path.join(registryDir, `${name.replace('@aibos/', '')}.json`);
      
      if (!fs.existsSync(moduleFile)) {
        spinner.fail(`Module "${name}" not found in marketplace`);
        console.log(chalk.gray(`Try: aibos browse-marketplace`));
        process.exit(1);
      }

      const moduleData = JSON.parse(fs.readFileSync(moduleFile, 'utf8'));
      
      // Create modules directory
      const modulesDir = path.join(process.cwd(), 'modules');
      if (!fs.existsSync(modulesDir)) {
        fs.mkdirSync(modulesDir, { recursive: true });
      }

      // Create module directory
      const moduleDir = path.join(modulesDir, name.replace('@aibos/', ''));
      if (fs.existsSync(moduleDir)) {
        spinner.fail(`Module already installed: ${name}`);
        process.exit(1);
      }

      fs.mkdirSync(moduleDir, { recursive: true });

      // Create module manifest
      const manifest = {
        ...moduleData,
        installedAt: new Date().toISOString(),
        installedBy: 'micro-developer',
        status: 'installed'
      };

      fs.writeFileSync(
        path.join(moduleDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Update download count
      moduleData.downloads = (moduleData.downloads || 0) + 1;
      fs.writeFileSync(moduleFile, JSON.stringify(moduleData, null, 2));

      spinner.succeed(`Module "${name}" installed successfully!`);
      console.log(chalk.green(`\n📦 Version: ${moduleData.version}`));
      console.log(chalk.blue(`📁 Location: ${moduleDir}`));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.gray(`  • Import and use the module in your code`));
      console.log(chalk.gray(`  • aibos list-modules - View installed modules`));
      console.log(chalk.gray(`  • aibos uninstall-module ${name} - Remove module`));

    } catch (error) {
      spinner.fail(`Failed to install module: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('list-modules')
  .description('List installed modules')
  .action(async () => {
    const spinner = ora('Loading installed modules...').start();
    
    try {
      const modulesDir = path.join(process.cwd(), 'modules');
      const modules = [];

      if (fs.existsSync(modulesDir)) {
        const moduleDirs = fs.readdirSync(modulesDir);
        for (const dir of moduleDirs) {
          const manifestFile = path.join(modulesDir, dir, 'manifest.json');
          if (fs.existsSync(manifestFile)) {
            const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
            modules.push(manifest);
          }
        }
      }

      spinner.succeed(`Found ${modules.length} installed modules`);

      if (modules.length === 0) {
        console.log(chalk.gray('\nNo modules installed yet.'));
        console.log(chalk.gray('Try: aibos browse-marketplace'));
        return;
      }

      const table = new Table({
        head: ['Module', 'Version', 'Status', 'Installed', 'Downloads'],
        colWidths: [25, 10, 12, 20, 12]
      });

      modules.forEach(module => {
        table.push([
          chalk.blue(module.name),
          module.version,
          chalk.green(module.status),
          new Date(module.installedAt).toLocaleDateString(),
          module.downloads?.toLocaleString() || '0'
        ]);
      });

      console.log('\n' + chalk.bold('📦 Installed Modules'));
      console.log('='.repeat(80));
      console.log(table.toString());

    } catch (error) {
      spinner.fail(`Failed to list modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

program
  .command('contribute')
  .description('Contribute to existing modules or the AI-BOS ecosystem')
  .option('-m, --module <name>', 'Contribute to specific module')
  .option('-t, --type <type>', 'Contribution type (bug-fix, feature, documentation)', 'feature')
  .action(async (options) => {
    const spinner = ora('Setting up contribution...').start();
    
    try {
      // Load developer profile
      const profileFile = path.join(process.cwd(), '.aibos', 'profile.json');
      let profile;

      if (fs.existsSync(profileFile)) {
        profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
      } else {
        spinner.fail('Developer profile not found. Run "aibos init" first.');
        process.exit(1);
      }

      const contribution = {
        id: `contrib_${Date.now()}`,
        type: options.type,
        module: options.module || 'ecosystem',
        developer: profile.name,
        status: 'draft',
        createdAt: new Date().toISOString(),
        description: '',
        changes: []
      };

      // Create contribution directory
      const contribDir = path.join(process.cwd(), '.aibos', 'contributions');
      if (!fs.existsSync(contribDir)) {
        fs.mkdirSync(contribDir, { recursive: true });
      }

      const contribFile = path.join(contribDir, `${contribution.id}.json`);
      fs.writeFileSync(contribFile, JSON.stringify(contribution, null, 2));

      spinner.succeed('Contribution setup complete!');
      console.log(chalk.green(`\n🎯 Contribution ID: ${contribution.id}`));
      console.log(chalk.blue(`Type: ${contribution.type}`));
      console.log(chalk.blue(`Module: ${contribution.module}`));
      console.log(chalk.gray(`\nNext steps:`));
      console.log(chalk.gray(`  • Edit the contribution file: ${contribFile}`));
      console.log(chalk.gray(`  • aibos submit-contribution ${contribution.id} - Submit for review`));
      console.log(chalk.gray(`  • aibos view-contributions - View your contributions`));

    } catch (error) {
      spinner.fail(`Failed to setup contribution: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// EXISTING CONCURRENT USERS COMMANDS
// ========================================

// Initialize service for concurrent users commands
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

// Add existing concurrent users commands
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
      
    } catch (error) {
      spinner.fail(`Failed to load metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// ========================================
// UTILITY FUNCTIONS
// ========================================

function parseTimeString(timeStr: string): number {
  const now = Date.now();
  
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
  .name('aibos')
  .description('AI-BOS Micro-Developer CLI - Build, Share, and Contribute')
  .version('1.0.0');

// Add help text
program.addHelpText('after', `

Micro-Developer Ecosystem:
  aibos init                    Initialize as a micro-developer
  aibos create-module          Create a new AI-BOS module
  aibos publish-module         Publish module to marketplace
  aibos browse-marketplace     Browse available modules
  aibos install-module <name>  Install a module
  aibos list-modules           List installed modules
  aibos contribute             Contribute to ecosystem

Concurrent Users Monitoring:
  aibos current                Get current concurrent users
  aibos metrics                Get comprehensive metrics
  aibos monitor                Real-time monitoring

Examples:
  $ aibos init -n "John Doe" -s "accounting"
  $ aibos create-module -n "smart-tax" -d "AI-powered tax calculations"
  $ aibos publish-module -p ./smart-tax
  $ aibos browse-marketplace --category accounting
  $ aibos install-module @aibos/smart-tax
  $ aibos contribute -m @aibos/smart-tax -t feature

Environment Variables:
  REDIS_URL          Redis connection URL
  SUPABASE_URL       Supabase project URL
  SUPABASE_KEY       Supabase service role key
`);

// Parse arguments
program.parse(); 