// src/profile/profile.controller.ts
import { Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';

export class ProfileController {
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.getUserProfile(userId);
      ResponseUtility.success(res, data, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.updatePreferences(userId, req.body);
      ResponseUtility.success(res, data, 'Preferences updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getWeeklyStreak(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.getWeeklyPracticeStreak(userId);
      ResponseUtility.success(res, data, 'Weekly streak retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getCulturalMilestones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.getCulturalMilestones(userId);
      ResponseUtility.success(res, data, 'Cultural milestones retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async getNaniChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.getNaniChatHistory(userId);
      ResponseUtility.success(res, data, 'Nani WhatsApp chat history retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async postChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await profileService.saveChatMessage(userId, req.body);
      ResponseUtility.success(res, data, 'Chat message saved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();

