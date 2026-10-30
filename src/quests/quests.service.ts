// src/quests/quests.service.ts
import { prisma } from '../database/prisma.client.js';
import { QUEST_DEFAULTS, QUEST_LEVEL_STATUS, QuestLevelStatus } from '../lib/constants/quest.constants.js';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export class QuestsService {
  /**
   * Retrieves full dynamic Quest Map metadata for the mobile client.
   * Replaces hardcoded Quest Map, river crossing path, levels, and milestone chest.
   */
  public async getQuestMap(userId: string) {
    // 1. Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artifacts: {
          select: { artifactId: true },
        },
        levelProgress: true,
      },
    });

    if (!user) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Fetch all stages along the River Crossing Path
    const stages = await prisma.questStage.findMany({
      orderBy: { stageNumber: 'asc' },
    });

    // 3. Fetch all quest levels
    const levels = await prisma.questLevel.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        drills: {
          select: {
            id: true,
            drillType: true,
            title: true,
            xpAward: true,
          },
        },
      },
    });

    // Map user progress to level status and stars
    const progressMap = new Map(
      user.levelProgress.map((p) => [p.levelId, p])
    );

    const formattedLevels = levels.map((lvl) => {
      const userProg = progressMap.get(lvl.id);
      const status: QuestLevelStatus = (userProg?.status as QuestLevelStatus) || (lvl.defaultStatus as QuestLevelStatus);
      const stars = userProg?.stars ?? (status === QUEST_LEVEL_STATUS.MASTERED ? 3 : 0);

      return {
        id: lvl.id,
        levelNumber: lvl.levelNumber,
        slug: lvl.slug,
        title: lvl.title,
        subtitle: lvl.subtitle,
        tagOverline: lvl.tagOverline,
        icon: lvl.icon,
        route: lvl.route,
        status,
        stars,
        xpReward: lvl.xpReward,
        ctaLabel: lvl.ctaLabel,
        isIndented: lvl.isIndented,
        drills: lvl.drills,
      };
    });

    // Calculate current river stage
    const activeLevel = formattedLevels.find((l) => l.status === QUEST_LEVEL_STATUS.ACTIVE);
    const currentStage = activeLevel ? activeLevel.levelNumber : QUEST_DEFAULTS.CURRENT_DEFAULT_STAGE;

    return {
      hud: {
        streakDays: user.streak,
        xpPoints: user.xp,
        currentLevel: user.currentLevelId,
        isGoldenDiyaUnlocked: user.isGoldenDiyaUnlocked,
      },
      riverTrail: {
        currentStage,
        totalStages: stages.length || QUEST_DEFAULTS.TOTAL_STAGES,
        stages: stages.map((s) => ({
          stageNumber: s.stageNumber,
          name: s.name,
          subtitle: s.subtitle,
          description: s.description,
          isCompleted: s.isCompleted,
        })),
      },
      levels: formattedLevels,
      milestoneChest: {
        currentXp: user.xp,
        targetXp: QUEST_DEFAULTS.CHEST_TARGET_XP,
        progressPercent: Math.min(100, Math.round((user.xp / QUEST_DEFAULTS.CHEST_TARGET_XP) * 100)),
      },
      heroCard: {
        unlockedArtifactIds: user.artifacts.map((a) => a.artifactId),
        dailyGoalTitle: '100% Active Recall Challenge',
        dailyGoalSubtitle: 'Speak aloud or type in Devanagari. No passive 4-choice crutches.',
      },
    };
  }

  /**
   * Retrieves single level detail including all drills and audio prompt metadata.
   */
  public async getLevelById(levelId: string, userId: string) {
    const level = await prisma.questLevel.findUnique({
      where: { id: levelId },
      include: {
        drills: true,
        userProgress: {
          where: { userId },
        },
      },
    });

    if (!level) {
      throw new AppError(`Quest level '${levelId}' not found`, HTTP_STATUS.NOT_FOUND);
    }

    const progress = level.userProgress[0];

    return {
      ...level,
      userStatus: progress?.status || level.defaultStatus,
      userStars: progress?.stars || 0,
      userScore: progress?.score || 0,
    };
  }

  /**
   * Completes a quest level, updates user XP, awards stars, unlocks next stage.
   */
  public async completeQuestLevel(userId: string, levelId: string, stars = 3, score = 100) {
    const level = await prisma.questLevel.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      throw new AppError(`Level '${levelId}' does not exist`, HTTP_STATUS.NOT_FOUND);
    }

    // Upsert level progress
    const progress = await prisma.userLevelProgress.upsert({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
      update: {
        status: QUEST_LEVEL_STATUS.MASTERED,
        stars,
        score,
        completedAt: new Date(),
      },
      create: {
        userId,
        levelId,
        status: QUEST_LEVEL_STATUS.MASTERED,
        stars,
        score,
        completedAt: new Date(),
      },
    });

    // Award XP to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: level.xpReward },
      },
    });

    // If there is a next level, set it as active
    const nextLevel = await prisma.questLevel.findFirst({
      where: { levelNumber: level.levelNumber + 1 },
    });

    if (nextLevel) {
      await prisma.userLevelProgress.upsert({
        where: {
          userId_levelId: {
            userId,
            levelId: nextLevel.id,
          },
        },
        update: {
          status: QUEST_LEVEL_STATUS.ACTIVE,
        },
        create: {
          userId,
          levelId: nextLevel.id,
          status: QUEST_LEVEL_STATUS.ACTIVE,
          stars: 0,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { currentLevelId: nextLevel.id },
      });
    }

    return {
      completedLevelId: levelId,
      starsAwarded: stars,
      xpAwarded: level.xpReward,
      totalXp: updatedUser.xp,
      nextLevelId: nextLevel?.id || null,
      progress,
    };
  }
}

export const questsService = new QuestsService();

