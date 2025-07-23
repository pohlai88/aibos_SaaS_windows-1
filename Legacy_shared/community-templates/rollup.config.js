import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { visualizer } from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig([
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      '@aibos/template-validator',
      '@aibos/analytics',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'fuse.js',
      'react-virtualized',
      'react-intersection-observer',
      'react-preview',
      'react-dropzone',
      'react-hot-toast',
      'date-fns',
      'lodash-es',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
      }),
      isProduction && terser(),
      isAnalyze &&
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
  },

  // Marketplace module
  {
    input: 'src/marketplace/index.ts',
    output: [
      {
        file: 'dist/marketplace/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/marketplace/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      '@aibos/template-validator',
      '@aibos/analytics',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'fuse.js',
      'react-virtualized',
      'react-intersection-observer',
      'react-preview',
      'react-hot-toast',
      'date-fns',
      'lodash-es',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/marketplace',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Browser module
  {
    input: 'src/browser/index.ts',
    output: [
      {
        file: 'dist/browser/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/browser/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      '@aibos/template-validator',
      '@aibos/analytics',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'fuse.js',
      'react-virtualized',
      'react-intersection-observer',
      'react-preview',
      'date-fns',
      'lodash-es',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/browser',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Installer module
  {
    input: 'src/installer/index.ts',
    output: [
      {
        file: 'dist/installer/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/installer/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      '@aibos/template-validator',
      '@aibos/analytics',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-dropzone',
      'react-hot-toast',
      'lodash-es',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/installer',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Publisher module
  {
    input: 'src/publisher/index.ts',
    output: [
      {
        file: 'dist/publisher/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/publisher/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      '@aibos/template-validator',
      '@aibos/analytics',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-dropzone',
      'react-hot-toast',
      'date-fns',
      'lodash-es',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/publisher',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Type declarations bundle
  {
    input: 'dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
]);
