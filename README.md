## Linting & Code Quality (ESLint)

This project uses a world-class ESLint configuration with advanced plugins for TypeScript, React, Node.js, security, documentation, and project boundaries.

### Usage

- Run `npm run lint` to check code quality.
- Run `npm run lint:fix` to auto-fix issues.
- For faster CI, use `npm run lint -- --cache` (uses `.eslintcache`).

### Key Plugins

- `@typescript-eslint` for TypeScript best practices
- `eslint-plugin-react` and `eslint-plugin-react-hooks` for React
- `vitest` for testing
- `eslint-plugin-security` for security
- `eslint-plugin-perfectionist`, `eslint-plugin-unicorn`, `eslint-plugin-sonarjs` for code quality
- `eslint-plugin-testing-library` for React component tests
- `eslint-plugin-jsdoc` for documentation
- `eslint-plugin-boundaries` for project structure

### Custom Rules

- Prefix unused variables with `_` to silence linter warnings
- Strict import order and boundaries
- JSDoc required for exported functions/types

### Performance

- `.eslintcache` is used for faster linting; it is ignored by git
- For large codebases, always use the `--cache` flag in CI/CD

### Team Customizations

- See `eslint.config.js` and `CONTRIBUTING.md` for team-specific overrides and guidance
