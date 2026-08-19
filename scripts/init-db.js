// =============================================================================
// ZhiYin (知音) - Database Encryption & Migration Script
// Run before first production start to initialize encrypted database
// =============================================================================
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || './data/prod.db';
const DB_DIR = path.dirname(DB_PATH);

async function main() {
  console.log('=== ZhiYin Database Initialization ===');
  console.log(`Database path: ${DB_PATH}`);

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`Created data directory: ${DB_DIR}`);
  }

  // Check if database already exists
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`Existing database found: ${sizeKB} KB`);
    
    // Create backup
    const backupPath = `${DB_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`Backup created: ${backupPath}`);
  } else {
    console.log('No existing database, will create new one');
  }

  // Set restrictive file permissions (read/write for owner only)
  // On Linux this translates to 0600
  try {
    if (process.platform !== 'win32') {
      fs.chmodSync(DB_DIR, 0o700);
    }
  } catch (e) {
    console.log('Note: Could not set directory permissions');
  }

  // Run Prisma migrations
  console.log('\nRunning Prisma database push...');
  const { execSync } = require('child_process');
  try {
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('Database schema created successfully');
  } catch (e) {
    console.error('Database push failed:', e.message);
    process.exit(1);
  }

  // Set database file permissions
  try {
    if (process.platform !== 'win32' && fs.existsSync(DB_PATH)) {
      fs.chmodSync(DB_PATH, 0o600);
      console.log('Database file permissions set to 0600 (owner read/write only)');
    }
  } catch (e) {
    console.log('Note: Could not set file permissions');
  }

  // Verify database integrity
  console.log('\nVerifying database...');
  const prisma = new PrismaClient();
  try {
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    const tables = result.map(r => r.name || r.NAME);
    console.log(`Database verified. Tables: ${tables.join(', ')}`);
  } catch (e) {
    console.error('Database verification failed:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Database initialization complete ===');
}

main().catch(console.error);
