// Environment validation for AI-BOS Platform
require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please set these variables in your .env file or environment.');
  console.error('📖 See env.example for reference.');
  process.exit(1);
}

// Validate Supabase URL format
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ Invalid SUPABASE_URL format. Should be: https://your-project.supabase.co');
  process.exit(1);
}

// Validate JWT secret
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  console.error('❌ JWT_SECRET should be at least 32 characters long for security.');
  process.exit(1);
}

console.log('✅ Environment validation passed');
console.log('🚀 Starting AI-BOS Platform...'); 