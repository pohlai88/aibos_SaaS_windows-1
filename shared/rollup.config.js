import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  // Main bundle
  {
    input: 'index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.min.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        plugins: [terser()]
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist'
      })
    ],
    external: ['zod', 'redis', 'pg', 'express']
  },
  
  // Types bundle
  {
    input: 'types/index.ts',
    output: {
      file: 'dist/types/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types'
      })
    ],
    external: ['zod']
  },
  
  // Lib bundle
  {
    input: 'lib/index.ts',
    output: {
      file: 'dist/lib/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/lib'
      })
    ],
    external: ['zod', 'redis', 'pg']
  },
  
  // Utils bundle
  {
    input: 'utils/index.ts',
    output: {
      file: 'dist/utils/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/utils'
      })
    ],
    external: ['zod']
  },
  
  // Validation bundle
  {
    input: 'validation/index.ts',
    output: {
      file: 'dist/validation/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/validation'
      })
    ],
    external: ['zod']
  },
  
  // Metadata bundle
  {
    input: 'types/metadata/index.ts',
    output: {
      file: 'dist/types/metadata/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types/metadata'
      })
    ],
    external: ['zod']
  }
]; 