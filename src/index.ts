// src/index.ts
import http from 'http';
import dotenv from 'dotenv';

// 1. Initialize environment variables
dotenv.config();

import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.client.js';
import { webSocketManager } from './websockets/websocket.manager.js';
import { APP_CONSTANTS } from './lib/constants/app.constants.js';
import { Logger } from './utilities/logger.utility.js';

async function bootstrap() {
  // 2. Connect to PostgreSQL via Prisma
  await connectDatabase();

  // 3. Create Express app & HTTP Server
  const app = createApp();
  const server = http.createServer(app);

  // 4. Initialize WebSocket Server attached to HTTP Server
  webSocketManager.init(server);

  // 5. Start Server
  const port = APP_CONSTANTS.DEFAULT_PORT;
  server.listen(port, () => {
    Logger.info(`🚀 Bhasha Setu Backend is running on http://localhost:${port}`);
    Logger.info(`🎙️ Real-time WebSockets attached on ws://localhost:${port}${APP_CONSTANTS.WS_PATH}`);
    Logger.info(`📚 Health check endpoint available at http://localhost:${port}/health`);
  });

  // 6. Graceful Shutdown Handlers
  const shutdown = async (signal: string) => {
    Logger.info(`🛑 Received ${signal}. Gracefully shutting down...`);

    // Close WebSocket connections
    await webSocketManager.shutdown();

    // Close HTTP Server
    server.close(() => {
      Logger.info('🛑 HTTP Server closed');
    });

    // Disconnect Database
    await disconnectDatabase();

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  Logger.error('❌ Failed to bootstrap Bhasha Setu Backend:', error);
  process.exit(1);
});

