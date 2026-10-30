// src/profile/profile.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { profileController } from './profile.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const updatePreferencesSchema = {
  body: z.object({
    isSilentMode: z.boolean().optional(),
    isAudioMuted: z.boolean().optional(),
    playbackSpeed: z.number().optional(),
    userId: z.string().optional(),
  }),
};

const chatMessageSchema = {
  body: z.object({
    sender: z.enum(['nani', 'user']),
    hindiText: z.string().min(1, 'hindiText is required'),
    englishSubtext: z.string().min(1, 'englishSubtext is required'),
    duration: z.string().optional(),
    timestamp: z.string().optional(),
    fluencyScore: z.number().optional(),
    respectWord: z.string().optional(),
    userId: z.string().optional(),
  }),
};

router.get('/', profileController.getProfile);
router.patch('/preferences', validateRequest(updatePreferencesSchema), profileController.updatePreferences);
router.get('/weekly-streak', profileController.getWeeklyStreak);
router.get('/milestones', profileController.getCulturalMilestones);
router.get('/nani-chat', profileController.getNaniChat);
router.post('/nani-chat', validateRequest(chatMessageSchema), profileController.postChatMessage);

export default router;

