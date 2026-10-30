// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import questsRouter from './quests/quests.routes.js';
import drillsRouter from './drills/drills.routes.js';
import artifactsRouter from './artifacts/artifacts.routes.js';
import profileRouter from './profile/profile.routes.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { ResponseUtility } from './utilities/response.utility.js';
import { webSocketManager } from './websockets/websocket.manager.js';
import { ZEN_THEME_METADATA } from './lib/constants/zen.constants.js';

export const createApp = (): Application => {
  const app = express();

  // Security & Core Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Custom Request Logger
  app.use(requestLogger);

  // Health & Information Check
  app.get('/health', (_req, res) => {
    ResponseUtility.success(res, {
      status: 'healthy',
      app: ZEN_THEME_METADATA.brandName,
      tagline: ZEN_THEME_METADATA.tagline,
      version: ZEN_THEME_METADATA.version,
      activeWebSockets: webSocketManager.getActiveConnectionCount(),
      timestamp: new Date().toISOString(),
    });
  });

  // Feature Routes Mount
  app.use('/api/quests', questsRouter);
  app.use('/api/drills', drillsRouter);
  app.use('/api/artifacts', artifactsRouter);
  app.use('/api/profile', profileRouter);

  // Wire Contract Aliases (Compatibility with AI microservice & spec paths)
  app.use('/api/evaluation', drillsRouter);
  app.use('/api/voice', drillsRouter);

  // Unmatched Routes & Global Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

