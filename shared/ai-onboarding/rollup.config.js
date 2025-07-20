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
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-markdown',
      'react-syntax-highlighter',
      'prismjs',
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

  // Assistant module
  {
    input: 'src/assistant/index.ts',
    output: [
      {
        file: 'dist/assistant/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/assistant/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/assistant',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Learning paths module
  {
    input: 'src/learning-paths/index.ts',
    output: [
      {
        file: 'dist/learning-paths/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/learning-paths/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/learning-paths',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Tutorials module
  {
    input: 'src/tutorials/index.ts',
    output: [
      {
        file: 'dist/tutorials/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/tutorials/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-markdown',
      'react-syntax-highlighter',
      'prismjs',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/tutorials',
      }),
      isProduction && terser(),
    ].filter(Boolean),
  },

  // Assessment module
  {
    input: 'src/assessment/index.ts',
    output: [
      {
        file: 'dist/assessment/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/assessment/index.mjs',
        format: 'esm',
        sourcemap: !isProduction,
      },
    ],
    external: [
      'react',
      'react-dom',
      '@aibos/shared',
      '@aibos/visual-dev',
      'framer-motion',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'zod',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/assessment',
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
