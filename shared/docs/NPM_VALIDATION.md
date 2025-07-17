# AI-BOS Enterprise NPM Configuration Validation & Remediation

## Overview

This guide describes how to enforce, validate, and auto-remediate npm configuration for the AI-BOS platform using automated scripts.

---

## 1. Validation

**Script:** `npm run npm:validate`

- Checks `.npmrc` and live npm config against enterprise standards.
- Writes a detailed report to `.reports/npm-config-audit.json`.
- Fails with exit code 1 if any setting is non-compliant.

**Example Output:**

```
=== NPM Configuration Validation ===
Checked 38 enterprise requirements

✅ All configurations match enterprise standards
```

**If there are mismatches:**

```
❌ Validation failed:
- audit-level (.npmrc): Expected "critical", got "moderate"
...
```

---

## 2. Auto-remediation

**Script:** `node scripts/npm-remediator.mjs`

- Automatically updates `.npmrc` to match all enterprise standards.
- Only changes non-compliant settings.
- Safe to run repeatedly.

**Example Output:**

```
=== NPM Configuration Auto-Remediator ===
🔧 Remediating 2 settings in .npmrc...
✅ .npmrc updated. Please re-run validation to confirm compliance.
```

---

## 3. CI/CD & Pre-commit Integration

- **CI:** Add `npm run npm:validate` as a required step in your pipeline.
- **Pre-commit:** Use Husky to run validation before every commit:
  ```bash
  npx husky add .husky/pre-commit "npm run npm:validate"
  ```

---

## 4. Reports & Hygiene

- All validation reports are saved in `.reports/` (add this to `.gitignore`).
- Review `.reports/npm-config-audit.json` for compliance history.

---

## 5. Troubleshooting

- If validation fails, run the remediator or manually update `.npmrc`.
- If auto-remediation does not resolve all issues, check for typos or conflicting global/user configs.

---

## 6. Security & Best Practices

- Never commit secrets or tokens in `.npmrc`.
- Always validate config before publishing or deploying.
- Use the validator and remediator as part of onboarding and CI.

---

## 7. Extending Standards

- Update `ENTERPRISE_STANDARDS` in `scripts/npm-validator.mjs` as your requirements evolve.
- Re-run validation after any standards change.

---

## 8. Support

- For issues, review the validation report and consult the AI-BOS DevOps team.
