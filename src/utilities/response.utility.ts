// src/utilities/response.utility.ts
import { Response } from 'express';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any;
}

export class ResponseUtility {
  public static success<T>(
    res: Response,
    data: T,
    message = 'Request successful',
    statusCode: number = HTTP_STATUS.OK,
    meta?: Record<string, any>
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message = 'An unexpected error occurred',
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: any
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      errors: errors ?? null,
    };
    return res.status(statusCode).json(payload);
  }
}

