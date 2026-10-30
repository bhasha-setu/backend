// src/artifacts/artifacts.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { artifactsController } from './artifacts.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

const unlockArtifactSchema = {
  params: z.object({
    artifactId: z.string().min(1, 'Artifact ID is required'),
  }),
  body: z.object({
    userId: z.string().optional(),
  }),
};

router.get('/', artifactsController.getArtifacts);
router.post('/:artifactId/unlock', validateRequest(unlockArtifactSchema), artifactsController.unlockArtifact);

export default router;

