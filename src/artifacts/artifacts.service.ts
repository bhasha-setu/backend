// src/artifacts/artifacts.service.ts
import { prisma } from '../database/prisma.client.js';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export class ArtifactsService {
  /**
   * Retrieves full Cultural Artifacts Shelf metadata for the user.
   * Maps directly to bhasha-setu-frontend/src/components/dashboard/ArtifactsModal.tsx
   */
  public async getArtifactsShelf(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artifacts: {
          select: {
            artifactId: true,
            unlockedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const allArtifacts = await prisma.artifact.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const userUnlockedMap = new Map(
      user.artifacts.map((ua) => [ua.artifactId, ua.unlockedAt])
    );

    const formattedArtifacts = allArtifacts.map((art) => {
      const isUnlocked = userUnlockedMap.has(art.id);
      return {
        id: art.id,
        slug: art.slug,
        name: art.name,
        icon: art.icon,
        level: art.levelName,
        description: art.description,
        bonus: art.bonus,
        unlockCondition: art.unlockCondition,
        unlocked: isUnlocked,
        unlockedAt: userUnlockedMap.get(art.id) || null,
      };
    });

    const unlockedCount = formattedArtifacts.filter((a) => a.unlocked).length;

    return {
      header: {
        overline: 'BHASHA SETU ARCHIVE',
        title: 'Cultural Artifacts Shelf',
        subtitle: 'Artifacts unlocked through 100% active recall and spoken dialogue.',
        unlockedRatio: `${unlockedCount}/${formattedArtifacts.length}`,
      },
      artifacts: formattedArtifacts,
      unlockedArtifactIds: user.artifacts.map((a) => a.artifactId),
      isGoldenDiyaUnlocked: user.isGoldenDiyaUnlocked,
    };
  }

  /**
   * Unlocks an artifact, persists to user_artifacts, and applies XP boost.
   */
  public async unlockArtifact(userId: string, artifactId: string) {
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact) {
      throw new AppError(`Artifact '${artifactId}' not found`, HTTP_STATUS.NOT_FOUND);
    }

    // Check if already unlocked
    const existing = await prisma.userArtifact.findUnique({
      where: {
        userId_artifactId: {
          userId,
          artifactId,
        },
      },
    });

    if (existing) {
      return {
        alreadyUnlocked: true,
        artifactId,
        name: artifact.name,
        message: `Artifact '${artifact.name}' was already unlocked!`,
      };
    }

    // Upsert unlock record
    const userArtifact = await prisma.userArtifact.create({
      data: {
        userId,
        artifactId,
      },
    });

    const isGoldenDiya = artifactId === 'golden-diya';
    const bonusXp = isGoldenDiya ? 100 : 35;

    // Award bonus XP and set golden diya flag if applicable
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: bonusXp },
        isGoldenDiyaUnlocked: isGoldenDiya ? true : undefined,
      },
    });

    return {
      alreadyUnlocked: false,
      artifactId,
      name: artifact.name,
      icon: artifact.icon,
      bonus: artifact.bonus,
      bonusXpAwarded: bonusXp,
      totalXp: updatedUser.xp,
      unlockedAt: userArtifact.unlockedAt,
    };
  }
}

export const artifactsService = new ArtifactsService();

