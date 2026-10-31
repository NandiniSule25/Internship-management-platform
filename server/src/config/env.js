const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file inside server/
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-key-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate required environment variables
if (!config.databaseUrl) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set in server/.env');
}

module.exports = config;
