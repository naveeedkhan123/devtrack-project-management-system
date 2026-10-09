const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (
  nodeEnv === 'production' ? undefined : 'devtrack-local-development-secret-only'
);

if (nodeEnv === 'production') {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured in production');
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production');
  }
  if (!process.env.CLIENT_URL) {
    throw new Error('CLIENT_URL must be configured in production');
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devtrack',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  enableLocalSnapshots: process.env.ENABLE_LOCAL_SNAPSHOTS === 'true',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
};

module.exports = config;
