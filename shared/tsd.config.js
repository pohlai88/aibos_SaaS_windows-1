export default {
  directory: './test/types',
  files: ['**/*.test-d.ts'],
  compilerOptions: {
    strict: true,
    noImplicitAny: true,
    noUncheckedIndexedAccess: true,
    exactOptionalPropertyTypes: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    allowUnusedLabels: false,
    allowUnreachableCode: false,
  },
}; 