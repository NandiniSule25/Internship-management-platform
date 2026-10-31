const { PrismaClient } = require('@prisma/client');
const config = require('./env');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Periodic keep-alive ping for serverless databases (like Neon)
// Prevents Neon from suspending after 5 minutes of idle time during active development
let keepAliveTimer = null;

function startKeepAlive() {
  if (keepAliveTimer) return;
  // Ping every 3.5 minutes (210,000 ms)
  keepAliveTimer = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      // If Neon was suspended, the ping will trigger a re-wake
      if (!err.message?.includes('57P01')) {
        console.warn('⚠️ Keep-alive ping woke database.');
      }
    }
  }, 210000);

  // Prevent keeping event loop alive if everything else exits
  if (keepAliveTimer.unref) keepAliveTimer.unref();
}

/**
 * Connect to PostgreSQL and verify connection
 */
async function connectDB() {
  try {
    await prisma.$connect();
    // Warm-up query to wake up Neon compute if suspended
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL database connected & warmed up successfully via Prisma');
    startKeepAlive();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    throw error;
  }
}

/**
 * Disconnect from PostgreSQL on server shutdown
 */
async function disconnectDB() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  await prisma.$disconnect();
  console.log('🔌 PostgreSQL database connection closed');
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};
