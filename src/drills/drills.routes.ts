// src/drills/drills.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { drillsController } from './drills.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

// Validation Schemas
const evaluateAnswerSchema = {
  body: z.object({
    drillType: z.string().min(1, 'drillType is required (e.g. BOLLYWOOD, STREET_FOOD)'),
    typedWord: z.string().min(1, 'typedWord cannot be empty'),
    expectedWord: z.string().optional(),
    levelId: z.string().optional(),
    userId: z.string().optional(),
  }),
};

const evaluateVoiceSchema = {
  body: z.object({
    spokenText: z.string().min(1, 'spokenText cannot be empty'),
    drillType: z.string().optional(),
    decibels: z.number().optional(),
    pitchHz: z.number().optional(),
    userId: z.string().optional(),
  }),
};

const getDrillSchema = {
  params: z.object({
    drillType: z.string().min(1, 'drillType is required'),
  }),
};

const getAudioSchema = {
  params: z.object({
    clipId: z.string().min(1, 'clipId is required'),
  }),
  query: z.object({
    speed: z.string().optional(),
  }),
};

// Route Definitions
router.get('/audio/:clipId', validateRequest(getAudioSchema), drillsController.getAudioMetadata);
router.get('/:drillType', validateRequest(getDrillSchema), drillsController.getDrill);
router.post('/evaluate/answer', validateRequest(evaluateAnswerSchema), drillsController.evaluateAnswer);
router.post('/evaluate/voice', validateRequest(evaluateVoiceSchema), drillsController.evaluateVoice);

export default router;

