#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { parseNpmrc, generateReport, CONFIG } from './npm-validator.mjs'

console.log('=== NPM Configuration Auto-Remediator ===')
const report = generateReport()
const fixes = report.results.filter(r => !r.valid)

if (fixes.length === 0) {
  console.log('✅ No remediation needed. All settings are compliant.')
  process.exit(0)
}

console.log(`🔧 Remediating ${fixes.length} settings in .npmrc...`)
const currentConfig = parseNpmrc()
for (const { key, expected } of fixes) {
  currentConfig[key] = expected
}
const newContent = Object.entries(currentConfig)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n') + '\n'
writeFileSync(CONFIG.NPMRC_PATH, newContent)
console.log('✅ .npmrc updated. Please re-run validation to confirm compliance.')
