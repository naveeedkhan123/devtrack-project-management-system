const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const config = require('./config/env');
const logger = require('./utils/logger');
const User = require('./models/User');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if initial seed is needed
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Database is empty. Auto-seeding initial demo data...');
        const { seedDatabase } = require('./seeds/seedData');
        await seedDatabase();
      }
    } catch (seedErr) {
      logger.warn('Seed check warning:', seedErr.message);
    }

    const server = app.listen(config.port, () => {
      logger.info(`===============================================`);
      logger.info(`  🚀 DevTrack REST API running in ${config.nodeEnv} mode`);
      logger.info(`  📡 Port: http://localhost:${config.port}`);
      logger.info(`  🌐 Health: http://localhost:${config.port}/health`);
      logger.info(`===============================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Closing HTTP server & database...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('DevTrack API server cleanly shut down.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return server;
  } catch (err) {
    logger.error('Fatal error starting server:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
