const crypto = require('crypto');
const fs = require('fs');

// Generate a 256-bit (32 bytes) encryption key for AES-256
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate multiple keys for different purposes
const keys = {
  GOVERNANCE_ENCRYPTION_KEY: generateEncryptionKey(),
  DATABASE_ENCRYPTION_KEY: generateEncryptionKey(),
  AUDIT_LOG_ENCRYPTION_KEY: generateEncryptionKey(),
  JWT_SECRET: crypto.randomBytes(64).toString('hex')
};

console.log('Generated Encryption Keys:');
console.log('========================');
Object.entries(keys).forEach(([name, key]) => {
  console.log(`${name}=${key}`);
});

// Optionally save to .env.local file
const envContent = Object.entries(keys)
  .map(([name, key]) => `${name}=${key}`)
  .join('\n');

fs.writeFileSync('.env.local.generated', envContent);
console.log('\n✅ Keys saved to .env.local.generated');
console.log('⚠️  Remember to add these to your .env.local file and keep them secure!');