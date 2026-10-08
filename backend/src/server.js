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

    // Initialize automatic Mongoose persistence hooks
    initPersistence();

    // Attempt to restore persistent database state from disk
    let restored = false;
    try {
      restored = await restoreDatabaseSnapshot();
    } catch (restoreErr) {
      logger.warn('[Persistence] Snapshot restore warning:', restoreErr.message);
    }

    // Check if initial seed is needed (only if database is empty and no snapshot was restored)
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Database is empty. Auto-seeding initial demo data...');
        const { seedDatabase } = require('./seeds/seedData');
        await seedDatabase();
        // Immediately persist initial seed snapshot
        await saveDatabaseSnapshot();
      } else if (!restored) {
        // Persist existing documents if any
        await saveDatabaseSnapshot();
      }
    } catch (seedErr) {
      logger.warn('Seed check warning:', seedErr.message);
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
      logger.info(`${signal} received. Flushing database snapshot & shutting down...`);
      try {
        await saveDatabaseSnapshot();
      } catch (flushErr) {
        logger.error('Error saving snapshot during shutdown:', flushErr.message);
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
