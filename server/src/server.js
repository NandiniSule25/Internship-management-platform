const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

async function startServer() {
  try {
    // Attempt database connection
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 Server running in ${config.nodeEnv} mode`);
      console.log(`📡 Listening on: http://localhost:${config.port}`);
      console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
      console.log(`🗄️ Database health: http://localhost:${config.port}/api/health/db`);
      console.log('====================================================');
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
