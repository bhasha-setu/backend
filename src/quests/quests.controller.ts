// src/quests/quests.controller.ts
import { Request, Response, NextFunction } from 'express';
import { questsService } from './quests.service.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';

export class QuestsController {
  public async getQuestMap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await questsService.getQuestMap(userId);
      ResponseUtility.success(res, data, 'Quest map metadata retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getLevelDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const levelId = String(req.params.levelId);
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await questsService.getLevelById(levelId, userId);
      ResponseUtility.success(res, data, `Quest level '${levelId}' details retrieved`);
    } catch (error) {
      next(error);
    }
  }

  public async completeQuestLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const levelId = String(req.params.levelId);
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const stars = Number(req.body.stars) || 3;
      const score = Number(req.body.score) || 100;

      const result = await questsService.completeQuestLevel(userId, levelId, stars, score);
      ResponseUtility.success(res, result, `Quest level '${levelId}' marked as completed`);
    } catch (error) {
      next(error);
    }
  }
}

export const questsController = new QuestsController();

