// src/artifacts/artifacts.controller.ts
import { Request, Response, NextFunction } from 'express';
import { artifactsService } from './artifacts.service.js';
import { ResponseUtility } from '../utilities/response.utility.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';

export class ArtifactsController {
  public async getArtifacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const data = await artifactsService.getArtifactsShelf(userId);
      ResponseUtility.success(res, data, 'Artifacts shelf retrieved');
    } catch (error) {
      next(error);
    }
  }

  public async unlockArtifact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const artifactId = String(req.params.artifactId);
      const userId = req.body.userId || (req.headers['x-user-id'] as string) || APP_CONSTANTS.DEFAULT_USER_ID;
      const result = await artifactsService.unlockArtifact(userId, artifactId);
      ResponseUtility.success(res, result, `Artifact '${artifactId}' processed`);
    } catch (error) {
      next(error);
    }
  }
}

export const artifactsController = new ArtifactsController();

