/**
 * VAPID Key Generator Script
 * Run this once to generate VAPID keys for push notifications
 * 
 * Usage: npx ts-node scripts/generate-vapid-keys.ts
 * Or: node -e "require('web-push').generateVAPIDKeys()"
 */

// Check if running directly
const webpush = require('web-push');

const keys = webpush.generateVAPIDKeys();

console.log('\n🔑 Generated VAPID Keys for Push Notifications\n');
console.log('Add these to your .env file:\n');
console.log('----------------------------------------');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('----------------------------------------\n');
console.log('⚠️  Keep VAPID_PRIVATE_KEY secret! Never commit it to git.\n');
