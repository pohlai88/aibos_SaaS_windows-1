/**
 * AI-BOS Init Command
 *
 * Scaffolds a complete AI-BOS application with enterprise-grade structure,
 * configuration, and best practices.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { logger } from '../utils/logger';
import { validateProjectName, validatePackageName } from '../utils/validation';
import { generateProjectStructure } from '../generators/project';
import { installDependencies } from '../utils/dependencies';

interface InitOptions {
  name?: string;
  template?: string;
  typescript?: boolean;
  testing?: boolean;
  docker?: boolean;
  ci?: boolean;
  force?: boolean;
  skipInstall?: boolean;
}

export function initCommand(program: Command) {
  program
    .command('init [name]')
    .description('Initialize a new AI-BOS application')
    .option('-t, --template <template>', 'Project template to use')
    .option('--typescript', 'Use TypeScript (default: true)')
    .option('--no-typescript', 'Use JavaScript')
    .option('--testing', 'Include testing setup (default: true)')
    .option('--no-testing', 'Skip testing setup')
    .option('--docker', 'Include Docker configuration (default: true)')
    .option('--no-docker', 'Skip Docker configuration')
    .option('--ci', 'Include CI/CD configuration (default: true)')
    .option('--no-ci', 'Skip CI/CD configuration')
    .option('-f, --force', 'Overwrite existing directory')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (name: string, options: InitOptions) => {
      try {
        await initProject(name, options);
      } catch (error) {
        logger.error('Failed to initialize project:', error);
        process.exit(1);
      }
    });
}

async function initProject(name?: string, options: InitOptions = {}) {
  // Display welcome message
  logger.info(chalk.blue.bold('🚀 Welcome to AI-BOS Platform!'));
  logger.info(chalk.gray("Let's create your enterprise-grade application.\n"));

  // Collect project information
  const answers = await collectProjectInfo(name, options);

  // Validate project name
  if (!validateProjectName(answers.name)) {
    logger.error('Invalid project name. Use only lowercase letters, numbers, and hyphens.');
    process.exit(1);
  }

  // Determine project path
  const projectPath = path.resolve(answers.name);

  // Check if directory exists
  if (fs.existsSync(projectPath) && !answers.force) {
    logger.error(`Directory ${answers.name} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  // Create project structure
  const spinner = ora('Creating project structure...').start();

  try {
    await generateProjectStructure(projectPath, answers);
    spinner.succeed('Project structure created successfully!');
  } catch (error) {
    spinner.fail('Failed to create project structure');
    throw error;
  }

  // Install dependencies
  if (!answers.skipInstall) {
    const installSpinner = ora('Installing dependencies...').start();

    try {
      await installDependencies(projectPath, answers);
      installSpinner.succeed('Dependencies installed successfully!');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      logger.warn('You can run "npm install" manually to install dependencies.');
    }
  }

  // Display success message
  displaySuccessMessage(answers.name, projectPath);
}

async function collectProjectInfo(name?: string, options: InitOptions = {}): Promise<any> {
  const questions = [];

  // Project name
  if (!name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'What is your project name?',
      default: 'my-aibos-app',
      validate: (input: string) => {
        if (!validateProjectName(input)) {
          return 'Project name must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    });
  }

  // Template selection
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: [
        { name: 'E-commerce Platform', value: 'ecommerce' },
        { name: 'CRM System', value: 'crm' },
        { name: 'Project Management', value: 'project-management' },
        { name: 'Analytics Dashboard', value: 'analytics' },
        { name: 'Minimal Starter', value: 'minimal' },
      ],
      default: 'minimal',
    });
  }

  // TypeScript
  if (options.typescript === undefined) {
    questions.push({
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: true,
    });
  }

  // Testing
  if (options.testing === undefined) {
    questions.push({
      type: 'confirm',
      name: 'testing',
      message: 'Include testing setup?',
      default: true,
    });
  }

  // Docker
  if (options.docker === undefined) {
    questions.push({
      type: 'confirm',
      name: 'docker',
      message: 'Include Docker configuration?',
      default: true,
    });
  }

  // CI/CD
  if (options.ci === undefined) {
    questions.push({
      type: 'confirm',
      name: 'ci',
      message: 'Include CI/CD configuration?',
      default: true,
    });
  }

  // Database
  questions.push({
    type: 'list',
    name: 'database',
    message: 'Which database would you like to use?',
    choices: [
      { name: 'PostgreSQL (Recommended)', value: 'postgresql' },
      { name: 'MySQL', value: 'mysql' },
      { name: 'SQLite (Development)', value: 'sqlite' },
      { name: 'MongoDB', value: 'mongodb' },
    ],
    default: 'postgresql',
  });

  // Cache
  questions.push({
    type: 'list',
    name: 'cache',
    message: 'Which cache would you like to use?',
    choices: [
      { name: 'Redis (Recommended)', value: 'redis' },
      { name: 'Memory (Development)', value: 'memory' },
      { name: 'None', value: 'none' },
    ],
    default: 'redis',
  });

  // Get answers
  const answers = await inquirer.prompt(questions);

  // Merge with options
  return {
    name: name || answers.name,
    template: options.template || answers.template,
    typescript: options.typescript !== undefined ? options.typescript : answers.typescript,
    testing: options.testing !== undefined ? options.testing : answers.testing,
    docker: options.docker !== undefined ? options.docker : answers.docker,
    ci: options.ci !== undefined ? options.ci : answers.ci,
    database: answers.database,
    cache: answers.cache,
    force: options.force || false,
    skipInstall: options.skipInstall || false,
  };
}

function displaySuccessMessage(projectName: string, projectPath: string) {
  logger.info('\n' + chalk.green.bold('✅ Project created successfully!'));
  logger.info('\n' + chalk.blue.bold('Next steps:'));
  logger.info(chalk.gray(`  cd ${projectName}`));
  logger.info(chalk.gray('  npm run dev          # Start development server'));
  logger.info(chalk.gray('  npm test             # Run tests'));
  logger.info(chalk.gray('  npm run build        # Build for production'));
  logger.info(chalk.gray('  npm run deploy       # Deploy to production'));

  logger.info('\n' + chalk.blue.bold('Documentation:'));
  logger.info(chalk.gray('  https://docs.aibos.com'));
  logger.info(chalk.gray('  https://github.com/aibos/shared'));

  logger.info('\n' + chalk.blue.bold('Support:'));
  logger.info(chalk.gray('  Discord: https://discord.gg/aibos'));
  logger.info(chalk.gray('  Issues: https://github.com/aibos/shared/issues'));

  logger.info('\n' + chalk.yellow.bold('Happy coding! 🚀'));
}
