// src/middleware/requestLogger.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utilities/logger.utility.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const color = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';

    Logger.info(`${req.method} ${req.originalUrl} ${color}${statusCode}\x1b[0m - ${duration}ms`);
  });

  next();
};

