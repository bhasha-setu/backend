// src/quests/quests.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { questsController } from './quests.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

// Validation Schemas
const completeLevelSchema = {
  params: z.object({
    levelId: z.string().min(1, 'Level ID is required'),
  }),
  body: z.object({
    stars: z.number().min(1).max(3).optional(),
    score: z.number().min(0).max(100).optional(),
    userId: z.string().optional(),
  }),
};

const getLevelSchema = {
  params: z.object({
    levelId: z.string().min(1, 'Level ID is required'),
  }),
};

// Route Definitions
router.get('/map', questsController.getQuestMap);
router.get('/levels/:levelId', validateRequest(getLevelSchema), questsController.getLevelDetails);
router.post('/levels/:levelId/complete', validateRequest(completeLevelSchema), questsController.completeQuestLevel);

export default router;

