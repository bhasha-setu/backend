// src/middleware/notFound.middleware.ts
import { Request, Response } from 'express';
import { ResponseUtility } from '../utilities/response.utility.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtility.error(
    res,
    `Route not found: [${req.method}] ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND
  );
};

