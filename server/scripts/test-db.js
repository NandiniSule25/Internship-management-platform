const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('====================================================');
  console.log('🔍 Testing PostgreSQL Database Connection with Prisma');
  console.log('====================================================');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.error('Please configure your PostgreSQL connection in server/.env');
    process.exit(1);
  }

  // Mask database URL for secure display (preserve host & db name, hide credentials)
  try {
    const parsedUrl = new URL(process.env.DATABASE_URL);
    const maskedHost = parsedUrl.host;
    const dbName = parsedUrl.pathname.replace('/', '');
    console.log(`🎯 Target Host: ${maskedHost}`);
    console.log(`🗄️ Database Name: ${dbName || 'default'}`);
  } catch {
    console.log('🎯 Target: [Configured via DATABASE_URL]');
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  const startTime = Date.now();
  try {
    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connection established successfully!');

    // Execute raw query to verify PostgreSQL version and time
    console.log('⏳ Executing verification query (SELECT version())...');
    const versionResult = await prisma.$queryRaw`SELECT version()`;
    const latency = Date.now() - startTime;

    console.log(`⚡ Response Latency: ${latency}ms`);
    if (versionResult && versionResult[0]) {
      console.log(`📦 PostgreSQL Version: ${versionResult[0].version}`);
    }

    // Check if tables are defined in schema
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      const tableNames = tableCheck.map((t) => t.table_name);
      console.log(`📋 Existing Public Tables (${tableNames.length}):`, tableNames.join(', ') || 'None (pending migration/push)');
    } catch (e) {
      console.log('ℹ️ Table check skipped:', e.message);
    }

    console.log('====================================================');
    console.log('🎉 Database connection test PASSED!');
    console.log('====================================================');
  } catch (error) {
    console.error('====================================================');
    console.error('❌ Database connection test FAILED!');
    console.error('Error Details:', error.message);
    console.error('====================================================');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
