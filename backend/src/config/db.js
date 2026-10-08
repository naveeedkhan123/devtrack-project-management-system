const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let uri = config.mongoUri;

    // Use in-memory MongoDB for test environment or fallback if configured
    if (config.nodeEnv === 'test') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        uri = mongodInstance.getUri();
        logger.info('Using MongoDB Memory Server for test environment');
      } catch (memErr) {
        logger.warn('Could not start MongoMemoryServer, falling back to configured URI:', memErr.message);
      }
    }

    mongoose.set('strictQuery', false);

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      logger.info(`MongoDB Connected successfully to: ${mongoose.connection.host || 'instance'}`);
    } catch (primaryErr) {
      // If connecting to localhost fails in development, try in-memory fallback
      if (config.nodeEnv !== 'production' && !mongodInstance) {
        logger.warn(`Primary MongoDB connection failed (${primaryErr.message}). Attempting in-memory database fallback...`);
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongodInstance = await MongoMemoryServer.create();
          const fallbackUri = mongodInstance.getUri();
          await mongoose.connect(fallbackUri);
          logger.info(`Connected to in-memory fallback MongoDB: ${fallbackUri}`);
          return;
        } catch (fallbackErr) {
          logger.error('In-memory MongoDB fallback also failed:', fallbackErr.message);
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
