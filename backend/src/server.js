const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const config = require('./config/env');
const logger = require('./utils/logger');
const User = require('./models/User');
const {
  initPersistence,
  restoreDatabaseSnapshot,
  saveDatabaseSnapshot,
} = require('./services/persistenceService');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    if (config.nodeEnv !== 'production') {
      if (config.enableLocalSnapshots) {
        initPersistence();
        await restoreDatabaseSnapshot();
      }

      // Demo accounts are only created in development; production data is never seeded at startup.
      try {
        const userCount = await User.countDocuments();
        logger.info(userCount === 0 ? 'Database is empty. Seeding demo data...' : 'Reconciling additive demo catalog...');
        const { seedDatabase } = require('./seeds/seedData');
        await seedDatabase();
        if (config.enableLocalSnapshots) {
          await saveDatabaseSnapshot();
        }
      } catch (seedErr) {
        logger.warn('Seed check warning:', seedErr.message);
      }
    }

    // Start server with fallback if port is in use (e.g. macOS AirPlay on port 5000)
    const listenOnPort = (portToTry) => {
      return new Promise((resolve, reject) => {
        const serverInstance = app.listen(portToTry, () => {
          logger.info(`===============================================`);
          logger.info(`  🚀 DevTrack REST API running in ${config.nodeEnv} mode`);
          logger.info(`  📡 Port: http://localhost:${portToTry}`);
          logger.info(`  🌐 Health: http://localhost:${portToTry}/health`);
          logger.info(`===============================================`);
          resolve(serverInstance);
        });

        serverInstance.on('error', async (err) => {
          if (err.code === 'EADDRINUSE') {
            const nextPort = portToTry === 5000 ? 5001 : portToTry + 1;
            logger.warn(`Port ${portToTry} is in use (e.g. macOS AirPlay). Retrying on port ${nextPort}...`);
            try {
              const retryServer = await listenOnPort(nextPort);
              resolve(retryServer);
            } catch (retryErr) {
              reject(retryErr);
            }
          } else {
            reject(err);
          }
        });
      });
    };

    const server = await listenOnPort(config.port);

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down...`);
      if (config.nodeEnv !== 'production' && config.enableLocalSnapshots) {
        await saveDatabaseSnapshot();
      }
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
