#!/usr/bin/env node

/**
 * Security Secret Generator
 * Generates secure secrets for production deployment
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Generating secure secrets for production deployment...\n');

// Generate JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Generate Session Secret (32 bytes = 256 bits)
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Generate API Key (16 bytes = 128 bits)
const apiKey = crypto.randomBytes(16).toString('hex');

// Generate Database Encryption Key (32 bytes = 256 bits)
const dbEncryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated Secrets:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log(`API_KEY=${apiKey}`);
console.log(`DB_ENCRYPTION_KEY=${dbEncryptionKey}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create production environment template
const productionEnvTemplate = `# Production Environment Variables
# Generated on: ${new Date().toISOString()}
# 
# ⚠️  IMPORTANT: Keep these secrets secure and never commit them to version control!
# 

# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (UPDATE THESE!)
MONGO_URI=mongodb+srv://your_username:your_secure_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority

# Security Secrets (GENERATED - DO NOT CHANGE)
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
API_KEY=${apiKey}
DB_ENCRYPTION_KEY=${dbEncryptionKey}
BCRYPT_SALT_ROUNDS=12

# CORS Configuration (UPDATE WITH YOUR DOMAIN!)
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=application/pdf

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring (OPTIONAL)
SENTRY_DSN=your_sentry_dsn_here
REDIS_URL=redis://localhost:6379
`;

// Write to .env.production file
const envProductionPath = path.join(__dirname, '../.env.production');
fs.writeFileSync(envProductionPath, productionEnvTemplate);

console.log('📄 Created production environment file:');
console.log(`   ${envProductionPath}\n`);

// Create secrets backup file
const secretsBackupPath = path.join(__dirname, '../secrets-backup.txt');
const secretsBackup = `BookVault Production Secrets
Generated: ${new Date().toISOString()}

JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
API_KEY=${apiKey}
DB_ENCRYPTION_KEY=${dbEncryptionKey}

⚠️  IMPORTANT SECURITY NOTES:
1. Store these secrets in a secure password manager
2. Never commit this file to version control
3. Use different secrets for different environments
4. Rotate secrets regularly (every 90 days recommended)
5. Delete this file after storing secrets securely
`;

fs.writeFileSync(secretsBackupPath, secretsBackup);

console.log('💾 Created secrets backup file:');
console.log(`   ${secretsBackupPath}\n`);

// Security recommendations
console.log('🛡️  SECURITY RECOMMENDATIONS:');
console.log('━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. 📋 Copy the secrets to your production environment');
console.log('2. 🗑️  Delete the secrets-backup.txt file after copying');
console.log('3. 🔄 Update MONGO_URI with your actual database credentials');
console.log('4. 🌐 Update FRONTEND_URL with your actual domain');
console.log('5. 🔐 Store secrets in your deployment platform (Heroku, Vercel, etc.)');
console.log('6. 📊 Set up monitoring and alerting');
console.log('7. 🔄 Plan to rotate secrets every 90 days');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Deployment platform specific instructions
console.log('🚀 DEPLOYMENT PLATFORM SETUP:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 Heroku:');
console.log(`   heroku config:set JWT_SECRET="${jwtSecret}"`);
console.log(`   heroku config:set MONGO_URI="your_mongo_connection_string"`);
console.log(`   heroku config:set FRONTEND_URL="https://yourdomain.com"`);
console.log('');
console.log('⚡ Vercel:');
console.log('   Add environment variables in Vercel dashboard');
console.log('   Enable "Sensitive" option for all secrets');
console.log('');
console.log('🌊 DigitalOcean:');
console.log('   Add environment variables in App Platform settings');
console.log('   Enable "Encrypt" option for sensitive values');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Secret generation complete!');
console.log('📖 Next steps: Follow the DEPLOYMENT_GUIDE.md for complete setup instructions.\n');

// Security warning
console.log('⚠️  SECURITY WARNING:');
console.log('━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔒 These secrets provide access to your application and data');
console.log('🚫 Never share these secrets or commit them to version control');
console.log('🔄 Rotate secrets regularly for maximum security');
console.log('📱 Use different secrets for development, staging, and production');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');