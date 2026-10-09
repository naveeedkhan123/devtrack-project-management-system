const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  logger.info(`MongoDB connected successfully to: ${mongoose.connection.host || 'instance'}`);
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
