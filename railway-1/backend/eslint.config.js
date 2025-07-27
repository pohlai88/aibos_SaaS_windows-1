/**
 * Manifest-Driven ESLint Configuration
 * 100% Compliant with Lean Architecture Manifestor Standards
 * AI-Interpretable and Manifest-Driven
 */

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';

// AI Metadata for interpretability
const AI_METADATA = {
  purpose: "code_quality_enforcement",
  target_languages: ["typescript", "javascript", "tsx", "jsx"],
  security_level: "enterprise",
  performance_impact: "minimal",
  runtime_overhead: "zero",
  ai_interpretable: true,
  manifest_driven: true,
  compliance_level: "fortune_500"
};

// Manifest-driven configuration
const MANIFEST_CONFIG = {
  cache: {
    enabled: true,
    location: './.eslintcache',
    strategy: 'intelligent'
  },
  performance: {
    runtime_overhead: 'zero',
    caching_enabled: true,
    parallel_processing: true
  },
  security: {
    level: 'enterprise',
    plugins: ['eslint-plugin-security'],
    rules: [
      'security/detect-object-injection',
      'security/detect-non-literal-regexp',
      'security/detect-unsafe-regex',
      'security/detect-buffer-noassert',
      'security/detect-child-process',
      'security/detect-disable-mustache-escape',
      'security/detect-eval-with-expression',
      'security/detect-no-csrf-before-method-override',
      'security/detect-non-literal-fs-filename',
      'security/detect-non-literal-require',
      'security/detect-possible-timing-attacks',
      'security/detect-pseudoRandomBytes'
    ]
  },
  code_quality: {
    plugins: ['@typescript-eslint', 'eslint-plugin-unicorn', 'eslint-plugin-import'],
    strict_mode: true,
    type_safety: 'full',
    dead_code_prevention: true
  },
  import_organization: {
    enabled: true,
    order: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    newlines_between: true,
    alphabetize: true
  },
  testing: {
    environment: 'jest',
    relaxed_rules: [
      '@typescript-eslint/no-explicit-any',
      '@typescript-eslint/no-non-null-assertion',
      'no-console',
      'unicorn/no-array-for-each',
      'unicorn/no-array-reduce'
    ]
  }
};

// Manifest-driven rules
const MANIFEST_RULES = {
  typescript: {
    'no-unused-vars': {
      level: 'error',
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    },
    'no-explicit-any': 'warn',
    'explicit-function-return-type': 'off',
    'explicit-module-boundary-types': 'off',
    'no-non-null-assertion': 'warn',
    'prefer-const': 'error',
    'no-var-requires': 'error'
  },
  security: {
    'detect-object-injection': 'warn',
    'detect-non-literal-regexp': 'warn',
    'detect-unsafe-regex': 'warn',
    'detect-buffer-noassert': 'warn',
    'detect-child-process': 'warn',
    'detect-disable-mustache-escape': 'warn',
    'detect-eval-with-expression': 'error',
    'detect-no-csrf-before-method-override': 'warn',
    'detect-non-literal-fs-filename': 'warn',
    'detect-non-literal-require': 'warn',
    'detect-possible-timing-attacks': 'warn',
    'detect-pseudoRandomBytes': 'warn'
  },
  unicorn: {
    'prefer-array-some': 'error',
    'prefer-array-find': 'error',
    'prefer-array-index-of': 'error',
    'prefer-includes': 'error',
    'prefer-string-starts-ends-with': 'error',
    'prefer-string-slice': 'error',
    'prefer-optional-catch-binding': 'error',
    'prefer-regexp-test': 'error',
    'prefer-date-now': 'error',
    'prefer-ternary': 'error',
    'no-console-spaces': 'error',
    'no-hex-escape': 'error',
    'no-process-exit': 'error',
    'error-message': 'error',
    'escape-case': 'error',
    'no-array-instanceof': 'error',
    'no-lonely-if': 'error',
    'no-new-buffer': 'error',
    'no-unsafe-regex': 'error',
    'prefer-add-event-listener': 'error',
    'prefer-query-selector': 'error',
    'throw-new-error': 'error',
    'no-for-loop': 'error',
    'prefer-spread': 'error',
    'prefer-array-flat': 'error',
    'prefer-array-flat-map': 'error',
    'prefer-object-from-entries': 'error',
    'prefer-negative-index': 'error',
    'prefer-prototype-methods': 'error',
    'prefer-set-has': 'error',
    'prefer-switch': 'error',
    'prefer-type-error': 'error',
    'require-array-join-separator': 'error',
    'require-number-to-fixed-digits-argument': 'error',
    'require-post-message-target-origin': 'error',
    'string-content': 'error',
    'template-indent': 'error',
    'no-array-callback-reference': 'error',
    'no-array-for-each': 'error',
    'no-array-push-push': 'error',
    'no-array-reduce': 'error',
    'no-document-cookie': 'error',
    'no-empty-file': 'error',
    'no-instanceof-array': 'error',
    'no-useless-undefined': 'error',
    'number-literal-case': 'error',
    'prefer-math-trunc': 'error',
    'prefer-modern-dom-apis': 'error',
    'prefer-number-properties': 'error',
    'prefer-reflect-apply': 'error',
    'prefer-string-replace-all': 'error'
  },
  import: {
    'order': {
      level: 'error',
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    },
    'no-unresolved': 'error',
    'no-duplicates': 'error',
    'no-unused-modules': 'warn',
    'no-relative-parent-imports': 'warn'
  },
  general: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error'
  }
};

// Build rules from manifest
function buildRulesFromManifest() {
  const rules = {};

  // TypeScript rules
  Object.entries(MANIFEST_RULES.typescript).forEach(([rule, config]) => {
    if (typeof config === 'object' && config.level) {
      rules[`@typescript-eslint/${rule}`] = [config.level, ...Object.entries(config)
        .filter(([key]) => key !== 'level')
        .map(([, value]) => value)];
    } else {
      rules[`@typescript-eslint/${rule}`] = config;
    }
  });

  // Security rules
  Object.entries(MANIFEST_RULES.security).forEach(([rule, level]) => {
    rules[rule] = level;
  });

  // Unicorn rules
  Object.entries(MANIFEST_RULES.unicorn).forEach(([rule, level]) => {
    rules[`unicorn/${rule}`] = level;
  });

  // Import rules
  Object.entries(MANIFEST_RULES.import).forEach(([rule, config]) => {
    if (typeof config === 'object' && config.level) {
      rules[`import/${rule}`] = [config.level, ...Object.entries(config)
        .filter(([key]) => key !== 'level')
        .map(([, value]) => value)];
    } else {
      rules[`import/${rule}`] = config;
    }
  });

  // General rules
  Object.entries(MANIFEST_RULES.general).forEach(([rule, config]) => {
    rules[rule] = config;
  });

  return rules;
}

// Manifest-driven ESLint configuration
export default [
  js.configs.recommended,
  {
    // Global configuration for performance and caching (manifest-driven)
    linterOptions: {
      cache: MANIFEST_CONFIG.cache.enabled,
      cacheLocation: MANIFEST_CONFIG.cache.location,
      reportUnusedDisableDirectives: 'error'
    }
  },
  {
    // TypeScript configuration (manifest-driven)
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'security': security,
      'unicorn': unicorn,
      'import': importPlugin,
    },
    rules: buildRulesFromManifest()
  },
  {
    // JavaScript configuration (manifest-driven)
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'security': security,
      'import': importPlugin,
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    // Testing configuration (manifest-driven)
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*'],
    env: { jest: true },
    rules: MANIFEST_CONFIG.testing.relaxed_rules.reduce((acc, rule) => {
      acc[rule] = 'off';
      return acc;
    }, {})
  },
  prettier,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'out/**',
      '**/*.min.js',
      '**/*.bundle.js',
      'coverage/**',
      '*.config.js',
    ],
  },
];

// Export AI metadata for interpretability
export { AI_METADATA, MANIFEST_CONFIG, MANIFEST_RULES };
