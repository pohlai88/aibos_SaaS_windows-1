import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

// Shared plugin configuration
const sharedPlugins = [
  nodeResolve({
    preferBuiltins: true,
    exportConditions: ['node', 'import', 'require'],
  }),
  commonjs({
    ignoreDynamicRequires: true,
    esmExternals: true,
  }),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: './dist',
    exclude: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
  }),
];

// Production plugins
const productionPlugins = [
  terser({
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      properties: {
        regex: /^_/,
      },
    },
  }),
];

export default defineConfig([
  // Primary bundle (ESM + CJS)
  {
    input: 'index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true,
        exports: 'named',
        generatedCode: 'es2015',
        preserveModules: true,
        preserveModulesRoot: '.',
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        plugins: productionPlugins,
        generatedCode: 'es2015',
      },
    ],
    plugins: sharedPlugins,
    external: ['zod', 'redis', 'pg', 'express', 'jose', 'stripe'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      unknownGlobalSideEffects: false,
    },
  },

  // Types utilities
  {
    input: 'types/index.ts',
    output: {
      file: 'dist/types/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
      generatedCode: 'es2015',
      preserveModules: true,
      preserveModulesRoot: 'types',
    },
    plugins: [
      ...sharedPlugins,
      typescript({
        declarationDir: './dist/types',
      }),
    ],
    external: ['zod'],
    treeshake: {
      moduleSideEffects: false,
    },
  },

  // Library utilities
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/lib/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
      generatedCode: 'es2015',
      preserveModules: true,
      preserveModulesRoot: 'lib',
    },
    plugins: [
      ...sharedPlugins,
      typescript({
        declarationDir: './dist/lib',
      }),
    ],
    external: ['zod', 'redis', 'pg'],
    treeshake: {
      moduleSideEffects: false,
    },
  },

  // Shared utilities
  {
    input: 'utils/index.ts',
    output: {
      file: 'dist/utils/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
      generatedCode: 'es2015',
      preserveModules: true,
      preserveModulesRoot: 'utils',
    },
    plugins: [
      ...sharedPlugins,
      typescript({
        declarationDir: './dist/utils',
      }),
    ],
    external: ['zod'],
    treeshake: {
      moduleSideEffects: false,
    },
  },

  // Validation helpers
  {
    input: 'validation/index.ts',
    output: {
      file: 'dist/validation/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
      generatedCode: 'es2015',
      preserveModules: true,
      preserveModulesRoot: 'validation',
    },
    plugins: [
      ...sharedPlugins,
      typescript({
        declarationDir: './dist/validation',
      }),
    ],
    external: ['zod'],
    treeshake: {
      moduleSideEffects: false,
    },
  },

  // Metadata types
  {
    input: 'types/metadata/index.ts',
    output: {
      file: 'dist/types/metadata/index.mjs',
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
      generatedCode: 'es2015',
      preserveModules: true,
      preserveModulesRoot: 'types/metadata',
    },
    plugins: [
      ...sharedPlugins,
      typescript({
        declarationDir: './dist/types/metadata',
      }),
    ],
    external: ['zod'],
    treeshake: {
      moduleSideEffects: false,
    },
  },
]);
