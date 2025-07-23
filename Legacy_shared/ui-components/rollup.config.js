import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  input: {
    index: 'src/index.ts',
    'primitives/button': 'src/primitives/Button/Button.tsx',
    'primitives/input': 'src/primitives/Input/Input.tsx',
    'primitives/modal': 'src/primitives/Modal/Modal.tsx',
    'primitives/badge': 'src/primitives/Badge/Badge.tsx',
    'layout/grid': 'src/layout/Grid/Grid.tsx',
    'layout/sidebar': 'src/layout/Sidebar/Sidebar.tsx',
    'data/datatable': 'src/data/DataTable/DataTable.tsx',
    'core/compliance': 'src/core/compliance/withCompliance.tsx',
    'core/performance': 'src/core/performance/withPerformance.tsx',
    'core/enterprise-provider': 'src/core/EnterpriseProvider.tsx',
    utils: 'src/utils/cn.ts'
  },
  output: [
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      sourcemap: true,
      exports: 'named'
    },
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: [
    'react',
    'react-dom',
    'class-variance-authority',
    'clsx',
    'tailwind-merge'
  ],
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**']
    })
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  },
  onwarn(warning, warn) {
    // Suppress circular dependency warnings for now
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
});
