import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: [
    'react',
    'react-dom',
    'framer-motion',
    'lucide-react',
    'class-variance-authority',
    'clsx',
    'tailwind-merge'
  ],
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**']
    })
  ],
  onwarn(warning, warn) {
    // Skip certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
    warn(warning);
  }
}); 