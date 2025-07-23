#!/usr/bin/env node

/**
 * Template Validation Script
 *
 * Validates community templates for:
 * - Schema compliance
 * - Required fields
 * - File structure
 * - Dependencies
 * - Security checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Template schema validation
const templateSchema = {
  required: ['id', 'name', 'description', 'version', 'author', 'category', 'tags', 'files'],
  optional: ['preview', 'screenshots', 'dependencies', 'requirements', 'license', 'readme'],
  types: {
    id: 'string',
    name: 'string',
    description: 'string',
    version: 'string',
    author: 'object',
    category: 'string',
    tags: 'array',
    files: 'array',
    preview: 'string',
    screenshots: 'array',
    dependencies: 'object',
    requirements: 'object',
    license: 'string',
    readme: 'string',
  },
};

// Security checks
const securityChecks = {
  forbiddenPatterns: [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\([^,]*,\s*[^)]*\)/,
    /setInterval\s*\([^,]*,\s*[^)]*\)/,
    /document\.write/,
    /innerHTML\s*=/,
    /outerHTML\s*=/,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  ],
  allowedDomains: ['https://api.aibos.com', 'https://cdn.aibos.com', 'https://templates.aibos.com'],
};

/**
 * Validate template schema
 */
function validateSchema(template, templatePath) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of templateSchema.required) {
    if (!template.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, expectedType] of Object.entries(templateSchema.types)) {
    if (template.hasOwnProperty(field)) {
      const actualType = Array.isArray(template[field]) ? 'array' : typeof template[field];
      if (actualType !== expectedType) {
        errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Validate specific fields
  if (template.version && !/^\d+\.\d+\.\d+$/.test(template.version)) {
    errors.push('Invalid version format. Use semantic versioning (e.g., 1.0.0)');
  }

  if (template.author && typeof template.author === 'object') {
    if (!template.author.name || !template.author.email) {
      errors.push('Author must have name and email fields');
    }
  }

  if (template.tags && Array.isArray(template.tags)) {
    if (template.tags.length === 0) {
      warnings.push('Template has no tags');
    }
    if (template.tags.length > 10) {
      warnings.push('Template has too many tags (max 10)');
    }
  }

  return { errors, warnings };
}

/**
 * Validate template files
 */
function validateFiles(template, templatePath) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(template.files)) {
    errors.push('Files must be an array');
    return { errors, warnings };
  }

  for (const file of template.files) {
    const filePath = path.join(templatePath, file.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      errors.push(`File not found: ${file.path}`);
      continue;
    }

    // Check file size
    const stats = fs.statSync(filePath);
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (stats.size > maxSize) {
      errors.push(`File too large: ${file.path} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // Check file type
    const allowedExtensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
      '.md',
      '.css',
      '.scss',
      '.html',
    ];
    const ext = path.extname(file.path);
    if (!allowedExtensions.includes(ext)) {
      warnings.push(`Unusual file extension: ${file.path}`);
    }

    // Security checks for code files
    if (['.js', '.jsx', '.ts', '.tsx', '.html'].includes(ext)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for forbidden patterns
      for (const pattern of securityChecks.forbiddenPatterns) {
        if (pattern.test(content)) {
          errors.push(`Security issue in ${file.path}: forbidden pattern detected`);
        }
      }

      // Check for external URLs
      const urlPattern = /https?:\/\/[^\s"']+/g;
      const urls = content.match(urlPattern) || [];
      for (const url of urls) {
        const isAllowed = securityChecks.allowedDomains.some((domain) => url.startsWith(domain));
        if (!isAllowed) {
          warnings.push(`External URL in ${file.path}: ${url}`);
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate template dependencies
 */
function validateDependencies(template) {
  const errors = [];
  const warnings = [];

  if (template.dependencies) {
    for (const [pkg, version] of Object.entries(template.dependencies)) {
      // Check if package name is valid
      if (!/^[a-zA-Z0-9@\-_\/]+$/.test(pkg)) {
        errors.push(`Invalid package name: ${pkg}`);
      }

      // Check if version is valid
      if (typeof version === 'string') {
        if (!/^[\^~]?\d+\.\d+\.\d+/.test(version)) {
          warnings.push(`Unusual version format for ${pkg}: ${version}`);
        }
      }
    }
  }

  return { errors, warnings };
}

/**
 * Validate template metadata
 */
function validateMetadata(template) {
  const errors = [];
  const warnings = [];

  // Check description length
  if (template.description) {
    if (template.description.length < 10) {
      errors.push('Description too short (minimum 10 characters)');
    }
    if (template.description.length > 500) {
      warnings.push('Description too long (maximum 500 characters)');
    }
  }

  // Check name format
  if (template.name) {
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(template.name)) {
      warnings.push('Template name contains unusual characters');
    }
    if (template.name.length > 50) {
      errors.push('Template name too long (maximum 50 characters)');
    }
  }

  // Check category
  const validCategories = [
    'e-commerce',
    'blog',
    'portfolio',
    'dashboard',
    'landing-page',
    'social-media',
    'education',
    'healthcare',
    'finance',
    'entertainment',
    'utility',
    'game',
    'other',
  ];
  if (template.category && !validCategories.includes(template.category)) {
    warnings.push(`Unknown category: ${template.category}`);
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
function validateTemplate(templatePath) {
  console.log(`\n🔍 Validating template: ${path.basename(templatePath)}`);

  const errors = [];
  const warnings = [];

  try {
    // Read template.json
    const templateJsonPath = path.join(templatePath, 'template.json');
    if (!fs.existsSync(templateJsonPath)) {
      errors.push('template.json not found');
      return { errors, warnings };
    }

    const templateContent = fs.readFileSync(templateJsonPath, 'utf8');
    const template = JSON.parse(templateContent);

    // Run validations
    const schemaResult = validateSchema(template, templatePath);
    const filesResult = validateFiles(template, templatePath);
    const depsResult = validateDependencies(template);
    const metadataResult = validateMetadata(template);

    errors.push(...schemaResult.errors);
    errors.push(...filesResult.errors);
    errors.push(...depsResult.errors);
    errors.push(...metadataResult.errors);

    warnings.push(...schemaResult.warnings);
    warnings.push(...filesResult.warnings);
    warnings.push(...depsResult.warnings);
    warnings.push(...metadataResult.warnings);
  } catch (error) {
    errors.push(`Failed to parse template: ${error.message}`);
  }

  return { errors, warnings };
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);
  const templatesDir = args[0] || './templates';

  console.log('🚀 AI-BOS Template Validator');
  console.log('============================');

  if (!fs.existsSync(templatesDir)) {
    console.error(`❌ Templates directory not found: ${templatesDir}`);
    process.exit(1);
  }

  const templateDirs = fs.readdirSync(templatesDir).filter((item) => {
    const itemPath = path.join(templatesDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  if (templateDirs.length === 0) {
    console.log('ℹ️  No templates found to validate');
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const templateDir of templateDirs) {
    const templatePath = path.join(templatesDir, templateDir);
    const result = validateTemplate(templatePath);

    results.push({
      name: templateDir,
      ...result,
    });

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    // Print results for this template
    if (result.errors.length > 0) {
      console.log(`❌ ${result.errors.length} error(s):`);
      result.errors.forEach((error) => console.log(`   - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  ${result.warnings.length} warning(s):`);
      result.warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('✅ Template is valid');
    }
  }

  // Summary
  console.log('\n📊 Validation Summary');
  console.log('====================');
  console.log(`Total templates: ${templateDirs.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ Validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ All templates are valid');
    if (totalWarnings > 0) {
      console.log(`⚠️  ${totalWarnings} warnings found (consider addressing them)`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateTemplate,
  validateSchema,
  validateFiles,
  validateDependencies,
  validateMetadata,
};
