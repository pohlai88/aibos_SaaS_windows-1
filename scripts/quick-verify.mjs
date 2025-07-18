#!/usr/bin/env node
/**
 * Quick TypeScript Verification
 * Check error count after professional recovery
 */

import { execSync } from 'child_process';

console.log('🔍 Verifying TypeScript Error Count...\n');

try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('🎉 SUCCESS: No TypeScript errors found!');
  console.log('✅ Ready for production build');
  process.exit(0);
} catch (error) {
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';

  if (errorOutput) {
    const errorLines = errorOutput.split('\n').filter(line =>
      line.includes('error TS') && !line.includes('Found ')
    );

    const totalErrors = errorLines.length;

    // Categorize remaining errors
    const categories = {
      interfaces: errorLines.filter(line =>
        line.includes('Type ') && line.includes('assignable')
      ).length,
      properties: errorLines.filter(line =>
        line.includes('Property') || line.includes('missing')
      ).length,
      imports: errorLines.filter(line =>
        line.includes('Cannot find') || line.includes('has no exported member')
      ).length,
      types: errorLines.filter(line =>
        line.includes('implicitly has') || line.includes('any type')
      ).length
    };

    console.log(`📊 TypeScript Status Report:`);
    console.log(`   Total Errors: ${totalErrors}`);
    console.log(`   Interface Issues: ${categories.interfaces}`);
    console.log(`   Property Issues: ${categories.properties}`);
    console.log(`   Import Issues: ${categories.imports}`);
    console.log(`   Type Issues: ${categories.types}\n`);

    if (totalErrors < 100) {
      console.log('🟡 SIGNIFICANT PROGRESS: Errors reduced to manageable level');
      console.log('💡 Ready for targeted manual fixes');
    } else if (totalErrors < 500) {
      console.log('🟠 GOOD PROGRESS: Major error reduction achieved');
      console.log('💡 Continue with automated fixing');
    } else {
      console.log('🔴 MORE WORK NEEDED: Still high error count');
    }

    // Show first 5 errors for targeting
    console.log('\n🎯 Top Priority Errors:');
    errorLines.slice(0, 5).forEach((error, i) => {
      console.log(`${i + 1}. ${error.trim()}`);
    });

    process.exit(1);
  }
}
