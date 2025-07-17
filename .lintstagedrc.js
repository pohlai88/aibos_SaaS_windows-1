module.exports = {
  // TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write', 'git add'],

  // JSON files
  '**/*.json': ['prettier --write', 'git add'],

  // Markdown files
  '**/*.md': ['prettier --write', 'git add'],

  // YAML files
  '**/*.{yml,yaml}': ['prettier --write', 'git add'],

  // CSS and SCSS files
  '**/*.{css,scss,sass}': ['prettier --write', 'git add'],

  // HTML files
  '**/*.html': ['prettier --write', 'git add'],

  // Configuration files
  '**/*.{config.js,config.ts}': ['eslint --fix', 'prettier --write', 'git add'],

  // Test files
  '**/*.{test.ts,test.tsx,spec.ts,spec.tsx}': ['eslint --fix', 'prettier --write', 'git add'],

  // Shell scripts
  '**/*.{sh,bat}': ['prettier --write', 'git add'],

  // Docker files
  'Dockerfile*': ['prettier --write', 'git add'],

  // Git files
  '**/*.{gitignore,gitattributes}': ['prettier --write', 'git add'],

  // Environment files
  '**/*.env*': ['prettier --write', 'git add'],

  // SQL files
  '**/*.sql': ['prettier --write', 'git add'],

  // XML files
  '**/*.xml': ['prettier --write', 'git add'],
};
