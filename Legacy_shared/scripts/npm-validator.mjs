#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'

const CONFIG = {
  NPMRC_PATH: './.npmrc',
  REPORT_PATH: './.reports/npm-config-audit.json',
  ENTERPRISE_STANDARDS: {
    // Registry
    registry: 'https://registry.npmjs.org/',
    '@aibos:registry': 'https://registry.npmjs.org/',
    // Security
    'audit-level': 'critical',
    'engine-strict': 'true',
    'strict-peer-dependencies': 'true',
    'package-lock-only': 'true',
    'omit': 'optional',
    'save-exact': 'true',
    'save-prefix': '',
    'lockfile-version': '3',
    'legacy-peer-deps': 'false',
    // Performance
    'cache': '.aibos-npm-cache',
    'prefer-offline': 'true',
    'prefer-dedupe': 'true',
    'maxsockets': '3',
    'fetch-retries': '2',
    'fetch-retry-mintimeout': '10000',
    // Compliance
    'loglevel': 'error',
    'color': 'false',
    'unicode': 'false',
    'tmp': '/var/tmp',
    'scripts-prepend-node-path': 'true',
    // CI/CD
    'ci': 'true',
    'ignore-scripts': 'true',
    'foreground-scripts': 'false',
    'offline': 'false',
    // Workspaces
    'workspaces-update': 'false',
    'link-workspace-packages': 'false',
  }
}

function parseNpmrc() {
  return readFileSync(CONFIG.NPMRC_PATH, 'utf-8')
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('#')
    })
    .reduce((config, line) => {
      const [rawKey, ...values] = line.split('=')
      const key = rawKey.trim()
      const value = values.join('=').trim()
      if (key) config[key] = value.replace(/^"+|"+$/g, '') // Remove wrapping quotes
      return config
    }, {})
}

function generateReport() {
  // Ensure .reports/ exists
  if (!existsSync('./.reports')) mkdirSync('./.reports', { recursive: true })
  const currentConfig = parseNpmrc()
  const npmRuntimeConfig = JSON.parse(execSync('npm config list --json').toString())
  const report = {
    meta: {
      timestamp: new Date().toISOString(),
      npmVersion: execSync('npm --version').toString().trim(),
      nodeVersion: process.version
    },
    results: Object.entries(CONFIG.ENTERPRISE_STANDARDS).map(([key, expected]) => {
      const actual = currentConfig[key] ?? npmRuntimeConfig[key]
      const source = currentConfig[key] ? '.npmrc' : 'runtime'
      return { key, expected, actual, source, valid: actual === expected }
    })
  }
  writeFileSync(CONFIG.REPORT_PATH, JSON.stringify(report, null, 2))
  return report
}

// CLI execution
if (process.argv[1] === (process.env.npm_execpath || process.argv[1])) {
  const report = generateReport()
  const failedChecks = report.results.filter(r => !r.valid)
  console.log('=== NPM Configuration Validation ===')
  console.log(`Checked ${report.results.length} enterprise requirements`)
  if (failedChecks.length > 0) {
    console.error('\n❌ Validation failed:')
    failedChecks.forEach(({ key, expected, actual, source }) => {
      console.error(`- ${key} (${source}): Expected "${expected}", got "${actual}"`)
    })
    process.exit(1)
  } else {
    console.log('\n✅ All configurations match enterprise standards')
  }
}

export { parseNpmrc, generateReport, CONFIG }
