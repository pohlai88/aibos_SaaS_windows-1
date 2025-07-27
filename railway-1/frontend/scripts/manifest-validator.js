#!/usr/bin/env node

/**
 * 🧠 AI-BOS Manifest Validator
 * Lean Architecture Manifesto Compliant
 *
 * Validates all manifests for:
 * - Schema compliance
 * - Permission structure
 * - Dependency resolution
 * - Configuration integrity
 * - Security validation
 */

const fs = require('fs');
const path = require('path');

// ==================== MANIFEST SCHEMAS ====================

const CORE_MANIFEST_SCHEMA = {
  required: ['id', 'version', 'type', 'enabled'],
  optional: ['description', 'author', 'dependencies', 'permissions', 'config'],
  types: {
    id: 'string',
    version: 'string',
    type: 'string',
    enabled: 'boolean',
    description: 'string',
    author: 'string',
    dependencies: 'array',
    permissions: 'object',
    config: 'object'
  }
};

const MODULE_MANIFEST_SCHEMA = {
  required: ['id', 'version', 'type', 'enabled', 'permissions'],
  optional: ['description', 'author', 'dependencies', 'config', 'features', 'components'],
  types: {
    id: 'string',
    version: 'string',
    type: 'string',
    enabled: 'boolean',
    description: 'string',
    author: 'string',
    dependencies: 'array',
    permissions: 'object',
    config: 'object',
    features: 'object',
    components: 'object'
  }
};

// ==================== VALIDATION FUNCTIONS ====================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function validateSchema(manifest, schema, manifestPath) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in manifest)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, value] of Object.entries(manifest)) {
    const expectedType = schema.types[field];
    if (expectedType) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== expectedType) {
        errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
      }
    }
  }

  // Check for unknown fields
  const allFields = [...schema.required, ...schema.optional];
  for (const field of Object.keys(manifest)) {
    if (!allFields.includes(field)) {
      warnings.push(`Unknown field: ${field}`);
    }
  }

  return { errors, warnings };
}

function validatePermissions(permissions, manifestPath) {
  const errors = [];
  const warnings = [];

  if (!permissions || typeof permissions !== 'object') {
    errors.push('Permissions must be an object');
    return { errors, warnings };
  }

  // Check permission structure
  for (const [resource, actions] of Object.entries(permissions)) {
    if (!Array.isArray(actions)) {
      errors.push(`Permissions for ${resource} must be an array`);
      continue;
    }

    // Validate action names
    for (const action of actions) {
      if (typeof action !== 'string') {
        errors.push(`Action must be a string: ${action}`);
      }

      // Check for common action patterns
      const validActions = ['view', 'create', 'edit', 'delete', 'execute', 'configure', 'monitor'];
      if (!validActions.includes(action)) {
        warnings.push(`Unusual action name: ${action}`);
      }
    }
  }

  return { errors, warnings };
}

function validateDependencies(dependencies, manifestPath) {
  const errors = [];
  const warnings = [];

  if (!dependencies || !Array.isArray(dependencies)) {
    return { errors, warnings };
  }

  for (const dep of dependencies) {
    if (typeof dep !== 'string') {
      errors.push(`Dependency must be a string: ${dep}`);
    }

    // Check for circular dependencies (basic check)
    if (dep === path.basename(manifestPath, '.json')) {
      errors.push(`Circular dependency detected: ${dep}`);
    }
  }

  return { errors, warnings };
}

function validateConfig(config, manifestPath) {
  const errors = [];
  const warnings = [];

  if (!config || typeof config !== 'object') {
    return { errors, warnings };
  }

  // Check for sensitive information in config
  const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
  for (const key of Object.keys(config)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      warnings.push(`Potentially sensitive config key: ${key}`);
    }
  }

  return { errors, warnings };
}

function validateVersion(version, manifestPath) {
  const errors = [];

  if (!version || typeof version !== 'string') {
    errors.push('Version must be a string');
    return errors;
  }

  // Check semantic versioning
  const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  if (!semverPattern.test(version)) {
    errors.push(`Invalid version format: ${version}. Expected semantic versioning (e.g., 1.0.0)`);
  }

  return errors;
}

// ==================== MAIN VALIDATION FUNCTION ====================

function validateManifest(manifestPath) {
  log(`Validating manifest: ${manifestPath}`);

  const errors = [];
  const warnings = [];

  try {
    // Read and parse manifest
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);

    // Determine schema based on type
    const schema = manifest.type === 'module' ? MODULE_MANIFEST_SCHEMA : CORE_MANIFEST_SCHEMA;

    // Validate schema
    const schemaResult = validateSchema(manifest, schema, manifestPath);
    errors.push(...schemaResult.errors);
    warnings.push(...schemaResult.warnings);

    // Validate version
    const versionErrors = validateVersion(manifest.version, manifestPath);
    errors.push(...versionErrors);

    // Validate permissions
    if (manifest.permissions) {
      const permResult = validatePermissions(manifest.permissions, manifestPath);
      errors.push(...permResult.errors);
      warnings.push(...permResult.warnings);
    }

    // Validate dependencies
    if (manifest.dependencies) {
      const depResult = validateDependencies(manifest.dependencies, manifestPath);
      errors.push(...depResult.errors);
      warnings.push(...depResult.warnings);
    }

    // Validate config
    if (manifest.config) {
      const configResult = validateConfig(manifest.config, manifestPath);
      errors.push(...configResult.errors);
      warnings.push(...configResult.warnings);
    }

    // Report results
    if (errors.length === 0 && warnings.length === 0) {
      log(`✅ ${manifestPath} - Valid`);
    } else {
      if (errors.length > 0) {
        log(`❌ ${manifestPath} - ${errors.length} errors`, 'error');
        errors.forEach(error => log(`  - ${error}`, 'error'));
      }
      if (warnings.length > 0) {
        log(`⚠️  ${manifestPath} - ${warnings.length} warnings`, 'warning');
        warnings.forEach(warning => log(`  - ${warning}`, 'warning'));
      }
    }

    return { valid: errors.length === 0, errors, warnings };

  } catch (error) {
    log(`❌ ${manifestPath} - Failed to parse: ${error.message}`, 'error');
    return { valid: false, errors: [error.message], warnings: [] };
  }
}

function validateAllManifests() {
  log('🧠 Starting AI-BOS Manifest Validation');
  log('Following Lean Architecture Manifesto principles');

  const manifestPaths = [
    'src/manifests/core/app.manifest.json',
    'src/manifests/core/auth.manifest.json',
    'src/manifests/modules/ai-engine.manifest.json',
    'src/manifests/modules/consciousness.manifest.json',
    'src/manifests/modules/analytics.manifest.json',
    'src/manifests/modules/security.manifest.json',
    'src/manifests/modules/collaboration.manifest.json',
    'src/manifests/modules/billing.manifest.json',
    'src/manifests/modules/realtime.manifest.json',
    'src/manifests/modules/monitoring.manifest.json',
    'src/manifests/modules/teams.manifest.json',
    'src/manifests/modules/workflow-automation.manifest.json'
  ];

  let totalErrors = 0;
  let totalWarnings = 0;
  let validManifests = 0;

  for (const manifestPath of manifestPaths) {
    if (fs.existsSync(manifestPath)) {
      const result = validateManifest(manifestPath);
      if (result.valid) {
        validManifests++;
      }
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    } else {
      log(`⚠️  Manifest not found: ${manifestPath}`, 'warning');
    }
  }

  // Summary
  log('\n📊 Manifest Validation Summary');
  log(`✅ Valid manifests: ${validManifests}`);
  log(`❌ Total errors: ${totalErrors}`);
  log(`⚠️  Total warnings: ${totalWarnings}`);

  if (totalErrors === 0) {
    log('🎉 All manifests are valid!');
    return true;
  } else {
    log('❌ Manifest validation failed!', 'error');
    return false;
  }
}

// ==================== SCRIPT EXECUTION ====================

if (require.main === module) {
  const success = validateAllManifests();
  process.exit(success ? 0 : 1);
}

module.exports = { validateManifest, validateAllManifests };
