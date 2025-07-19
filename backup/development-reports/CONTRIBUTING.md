# Contributing to AI-BOS

## Code Quality & Linting

- This project uses a world-class ESLint configuration (see `eslint.config.js`).
- All code must pass `npm run lint` before merging.
- Use `npm run lint:fix` to auto-fix issues.
- Prefix unused variables with `_` to silence linter warnings.
- JSDoc is required for all exported functions, classes, and types.
- Strict import order and architectural boundaries are enforced.
- For React component tests, follow best practices from `eslint-plugin-testing-library`.

## Performance

- Use `eslint --cache` for faster local and CI runs.
- `.eslintcache` is ignored by git.

## Customization

- If you need to override or relax a rule, document the reason in this file.
- For team-specific rules, add a section below and update `eslint.config.js` accordingly.

---

## Team-Specific Customizations

(Add any team or project-specific linting rules, exceptions, or guidance here.)

---

## .gitignore Policy

### Security First

- **Never commit secrets**: `.env`, `.key`, `.pem`, `.cert`, `.secret` files
- **Use environment variables**: Store secrets in `.env.example` (template only)
- **Validate before push**: Run `bash scripts/validate-gitignore.sh` locally

### Build Artifacts

- **Always ignore**: `dist/`, `build/`, `.next/`, `.output/`, `.cache/`
- **Monorepo support**: Use `**/dist/` to ignore all subproject builds
- **Allowlist exceptions**: Use `!packages/core/dist/` for specific packages

### Dependencies

- **Ignore all**: `node_modules/`, `.pnpm-store/`, `.yarn/cache/`
- **Lock files**: Commit `package-lock.json` and `yarn.lock` (but not `.bun.lockb`)

### Testing & Coverage

- **Ignore test outputs**: `coverage/`, `playwright-report/`, `test-results/`
- **Cache files**: `.eslintcache`, `.prettiercache`, `vitest_cache/`

### IDE & OS Files

- **Editor files**: `.vscode/`, `.idea/`, `*.swp`, `*.swo`
- **OS files**: `.DS_Store`, `Thumbs.db`, `.Trashes`

### Adding New Patterns

1. **Check industry standards**: Reference Google, Vercel, Microsoft patterns
2. **Test locally**: Verify the pattern works as expected
3. **Update validation script**: Add checks to `scripts/validate-gitignore.sh`
4. **Document here**: Add explanation for team members

### CI Integration

- **Automated validation**: CI runs `scripts/validate-gitignore.sh` on every PR
- **Security scanning**: GitHub secret scanning is enabled
- **Large file detection**: Files >10MB trigger warnings

### Troubleshooting

- **If validation fails**: Check for committed secrets or build artifacts
- **If large files detected**: Consider using Git LFS
- **If patterns not working**: Verify syntax and test with `git check-ignore`
