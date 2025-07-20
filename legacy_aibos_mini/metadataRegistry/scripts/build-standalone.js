const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building standalone Metadata Registry module...');

try {
  // Clean previous build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // Type check
  console.log('📝 Type checking...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });

  // Build with Next.js
  console.log('🔨 Building application...');
  execSync('npx next build', { stdio: 'inherit' });

  // Run isolation test
  console.log('🧪 Running isolation tests...');
  execSync('node scripts/test-isolation.js', { stdio: 'inherit' });

  console.log('✅ Standalone build completed successfully!');
  console.log('📦 Module is ready for independent deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}