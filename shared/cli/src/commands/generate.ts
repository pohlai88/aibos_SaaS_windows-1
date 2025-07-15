/**
 * AI-BOS Generate Command
 * 
 * Generates AI-BOS components including entities, events, manifests,
 * and other platform-specific code with enterprise-grade structure.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import { generateEntity } from '../generators/entity';
import { generateEvent } from '../generators/event';
import { generateManifest } from '../generators/manifest';
import { generateTest } from '../generators/test';
import { generateAPI } from '../generators/api';
import { generateUI } from '../generators/ui';

interface GenerateOptions {
  type?: string;
  name?: string;
  template?: string;
  force?: boolean;
  dryRun?: boolean;
}

export function generateCommand(program: Command) {
  program
    .command('generate <type> [name]')
    .alias('g')
    .description('Generate AI-BOS components')
    .option('-t, --template <template>', 'Template to use')
    .option('-f, --force', 'Overwrite existing files')
    .option('--dry-run', 'Show what would be generated without creating files')
    .action(async (type: string, name: string, options: GenerateOptions) => {
      try {
        await generateComponent(type, name, options);
      } catch (error) {
        logger.error('Failed to generate component:', error);
        process.exit(1);
      }
    });
}

async function generateComponent(type: string, name?: string, options: GenerateOptions = {}) {
  // Validate generation type
  const validTypes = ['entity', 'event', 'manifest', 'test', 'api', 'ui', 'component'];
  
  if (!validTypes.includes(type)) {
    logger.error(`Invalid generation type: ${type}`);
    logger.info(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Collect component information
  const answers = await collectComponentInfo(type, name, options);
  
  // Validate component name
  if (!validateComponentName(answers.name)) {
    logger.error('Invalid component name. Use PascalCase for components.');
    process.exit(1);
  }

  // Check if files already exist
  if (!options.force && !options.dryRun) {
    const existingFiles = await checkExistingFiles(type, answers.name);
    if (existingFiles.length > 0) {
      logger.warn(`Files already exist: ${existingFiles.join(', ')}`);
      const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to overwrite existing files?',
        default: false
      }]);
      
      if (!overwrite) {
        logger.info('Generation cancelled.');
        return;
      }
    }
  }

  // Generate component
  const spinner = ora(`Generating ${type}...`).start();
  
  try {
    const generatedFiles = await generateComponentFiles(type, answers, options);
    spinner.succeed(`${type} generated successfully!`);
    
    // Display generated files
    if (generatedFiles.length > 0) {
      logger.info('\n' + chalk.blue.bold('Generated files:'));
      generatedFiles.forEach(file => {
        logger.info(chalk.gray(`  ${file}`));
      });
    }
    
    // Display next steps
    displayNextSteps(type, answers.name);
    
  } catch (error) {
    spinner.fail(`Failed to generate ${type}`);
    throw error;
  }
}

async function collectComponentInfo(type: string, name?: string, options: GenerateOptions = {}): Promise<any> {
  const questions = [];

  // Component name
  if (!name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: `What is your ${type} name?`,
      validate: (input: string) => {
        if (!validateComponentName(input)) {
          return `${type} name must be in PascalCase`;
        }
        return true;
      }
    });
  }

  // Type-specific questions
  switch (type) {
    case 'entity':
      questions.push(
        {
          type: 'input',
          name: 'description',
          message: 'Entity description:',
          default: 'A business entity'
        },
        {
          type: 'confirm',
          name: 'audit',
          message: 'Include audit trail?',
          default: true
        },
        {
          type: 'confirm',
          name: 'validation',
          message: 'Include validation rules?',
          default: true
        },
        {
          type: 'input',
          name: 'fields',
          message: 'Entity fields (comma-separated):',
          default: 'id, name, email, createdAt'
        }
      );
      break;

    case 'event':
      questions.push(
        {
          type: 'input',
          name: 'description',
          message: 'Event description:',
          default: 'A business event'
        },
        {
          type: 'confirm',
          name: 'persistence',
          message: 'Enable event persistence?',
          default: true
        },
        {
          type: 'input',
          name: 'payload',
          message: 'Event payload fields (comma-separated):',
          default: 'id, data, timestamp'
        }
      );
      break;

    case 'manifest':
      questions.push(
        {
          type: 'input',
          name: 'version',
          message: 'Manifest version:',
          default: '1.0.0'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Application description:',
          default: 'AI-BOS application'
        },
        {
          type: 'confirm',
          name: 'compliance',
          message: 'Include compliance frameworks?',
          default: true
        },
        {
          type: 'confirm',
          name: 'security',
          message: 'Include security features?',
          default: true
        }
      );
      break;

    case 'api':
      questions.push(
        {
          type: 'list',
          name: 'method',
          message: 'HTTP method:',
          choices: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          default: 'GET'
        },
        {
          type: 'input',
          name: 'path',
          message: 'API path:',
          default: '/api/v1'
        },
        {
          type: 'confirm',
          name: 'validation',
          message: 'Include request validation?',
          default: true
        },
        {
          type: 'confirm',
          name: 'authentication',
          message: 'Include authentication?',
          default: true
        }
      );
      break;

    case 'ui':
    case 'component':
      questions.push(
        {
          type: 'list',
          name: 'framework',
          message: 'UI framework:',
          choices: ['React', 'Vue', 'Angular', 'Svelte'],
          default: 'React'
        },
        {
          type: 'list',
          name: 'type',
          message: 'Component type:',
          choices: ['form', 'table', 'chart', 'modal', 'custom'],
          default: 'custom'
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Use TypeScript?',
          default: true
        },
        {
          type: 'confirm',
          name: 'testing',
          message: 'Include tests?',
          default: true
        }
      );
      break;
  }

  // Get answers
  const answers = await inquirer.prompt(questions);
  
  return {
    name: name || answers.name,
    description: answers.description,
    audit: answers.audit,
    validation: answers.validation,
    fields: answers.fields,
    persistence: answers.persistence,
    payload: answers.payload,
    version: answers.version,
    compliance: answers.compliance,
    security: answers.security,
    method: answers.method,
    path: answers.path,
    authentication: answers.authentication,
    framework: answers.framework,
    type: answers.type,
    typescript: answers.typescript,
    testing: answers.testing
  };
}

function validateComponentName(name: string): boolean {
  // PascalCase validation
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

async function checkExistingFiles(type: string, name: string): Promise<string[]> {
  const existingFiles = [];
  const basePath = process.cwd();
  
  switch (type) {
    case 'entity':
      const entityFiles = [
        `src/entities/${name}.ts`,
        `src/entities/${name}.test.ts`,
        `src/schemas/${name}.ts`
      ];
      for (const file of entityFiles) {
        if (fs.existsSync(path.join(basePath, file))) {
          existingFiles.push(file);
        }
      }
      break;

    case 'event':
      const eventFiles = [
        `src/events/${name}.ts`,
        `src/events/${name}.test.ts`,
        `src/schemas/${name}.ts`
      ];
      for (const file of eventFiles) {
        if (fs.existsSync(path.join(basePath, file))) {
          existingFiles.push(file);
        }
      }
      break;

    case 'manifest':
      const manifestFiles = [
        `src/manifests/${name}.ts`,
        `src/manifests/${name}.json`
      ];
      for (const file of manifestFiles) {
        if (fs.existsSync(path.join(basePath, file))) {
          existingFiles.push(file);
        }
      }
      break;

    case 'api':
      const apiFiles = [
        `src/api/${name}.ts`,
        `src/api/${name}.test.ts`
      ];
      for (const file of apiFiles) {
        if (fs.existsSync(path.join(basePath, file))) {
          existingFiles.push(file);
        }
      }
      break;

    case 'ui':
    case 'component':
      const uiFiles = [
        `src/components/${name}.tsx`,
        `src/components/${name}.test.tsx`,
        `src/components/${name}.stories.tsx`
      ];
      for (const file of uiFiles) {
        if (fs.existsSync(path.join(basePath, file))) {
          existingFiles.push(file);
        }
      }
      break;
  }
  
  return existingFiles;
}

async function generateComponentFiles(type: string, answers: any, options: GenerateOptions): Promise<string[]> {
  const generatedFiles: string[] = [];
  
  switch (type) {
    case 'entity':
      generatedFiles.push(...await generateEntity(answers, options));
      break;
      
    case 'event':
      generatedFiles.push(...await generateEvent(answers, options));
      break;
      
    case 'manifest':
      generatedFiles.push(...await generateManifest(answers, options));
      break;
      
    case 'test':
      generatedFiles.push(...await generateTest(answers, options));
      break;
      
    case 'api':
      generatedFiles.push(...await generateAPI(answers, options));
      break;
      
    case 'ui':
    case 'component':
      generatedFiles.push(...await generateUI(answers, options));
      break;
  }
  
  return generatedFiles;
}

function displayNextSteps(type: string, name: string) {
  logger.info('\n' + chalk.blue.bold('Next steps:'));
  
  switch (type) {
    case 'entity':
      logger.info(chalk.gray(`  npm run test src/entities/${name}.test.ts`));
      logger.info(chalk.gray(`  npm run build`));
      break;
      
    case 'event':
      logger.info(chalk.gray(`  npm run test src/events/${name}.test.ts`));
      logger.info(chalk.gray(`  npm run dev`));
      break;
      
    case 'manifest':
      logger.info(chalk.gray(`  npm run validate-manifest`));
      logger.info(chalk.gray(`  npm run deploy`));
      break;
      
    case 'api':
      logger.info(chalk.gray(`  npm run test src/api/${name}.test.ts`));
      logger.info(chalk.gray(`  npm run dev`));
      break;
      
    case 'ui':
    case 'component':
      logger.info(chalk.gray(`  npm run test src/components/${name}.test.tsx`));
      logger.info(chalk.gray(`  npm run storybook`));
      break;
  }
  
  logger.info(chalk.gray(`  # Import and use your ${type}`));
  logger.info(chalk.gray(`  import { ${name} } from './src/${type}s/${name}';`));
} 