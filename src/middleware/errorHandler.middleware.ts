// src/middleware/errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utilities/logger.utility.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  Logger.error(`Error on [${req.method}] ${req.originalUrl}:`, err.message || err);

  // Operational AppError
  if (err instanceof AppError) {
    ResponseUtility.error(res, err.message, err.statusCode);
    return;
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    ResponseUtility.error(res, 'A record with this unique value already exists.', HTTP_STATUS.CONFLICT);
    return;
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    ResponseUtility.error(res, 'Requested resource was not found.', HTTP_STATUS.NOT_FOUND);
    return;
  }

  // Catch-all
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  ResponseUtility.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

