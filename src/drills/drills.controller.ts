// src/drills/drills.controller.ts
import { Request, Response, NextFunction } from 'express';
import { drillsService } from './drills.service.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';

export class DrillsController {
  public async getDrill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const drillType = String(req.params.drillType);
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await drillsService.getDrillByType(drillType, userId);
      ResponseUtility.success(res, data, `Drill '${drillType}' retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }

  public async evaluateAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const result = await drillsService.evaluateAnswer(userId, req.body);
      ResponseUtility.success(res, result, 'Devanagari answer evaluated');
    } catch (error) {
      next(error);
    }
  }

  public async evaluateVoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const result = await drillsService.evaluateVoiceTurn(userId, req.body);
      ResponseUtility.success(res, result, 'Spoken voice turn evaluated');
    } catch (error) {
      next(error);
    }
  }

  public async getAudioMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clipId = String(req.params.clipId);
      const speed = Number(req.query.speed) || 1.0;
      const data = drillsService.getAudioPromptMetadata(clipId, speed);
      ResponseUtility.success(res, data, `Audio prompt metadata for '${clipId}' retrieved`);
    } catch (error) {
      next(error);
    }
  }
}

export const drillsController = new DrillsController();

