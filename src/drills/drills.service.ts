// src/drills/drills.service.ts
import { prisma } from '../database/prisma.client.js';
import { DevanagariUtility } from '../utilities/devanagari.utility.js';
import { AudioCadenceUtility } from '../utilities/audioCadence.utility.js';
import { DRILL_TYPES, DRILL_XP_REWARDS, DrillType } from '../lib/constants/drill.constants.js';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';

export interface EvaluateAnswerDto {
  drillType: string;
  typedWord: string;
  expectedWord?: string;
  levelId?: string;
}

export interface VoiceTurnDto {
  spokenText: string;
  drillType?: string;
  decibels?: number;
  pitchHz?: number;
}

export class DrillsService {
  /**
   * Retrieves full dynamic drill configuration by drill type.
   */
  public async getDrillByType(drillType: string, userId: string) {
    const drill = await prisma.drill.findFirst({
      where: { drillType: drillType.toUpperCase() },
      include: {
        level: true,
      },
    });

    if (!drill) {
      throw new AppError(`Drill '${drillType}' not found`, HTTP_STATUS.NOT_FOUND);
    }

    // Fetch user recent attempts on this drill
    const recentAttempts = await prisma.userDrillAttempt.findMany({
      where: {
        userId,
        drillId: drill.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    return {
      id: drill.id,
      levelId: drill.levelId,
      levelTitle: drill.level.title,
      drillType: drill.drillType,
      title: drill.title,
      categoryOverline: drill.categoryOverline,
      scenario: drill.scenario,
      hindiPrompt: drill.hindiPrompt,
      englishTranslation: drill.englishTranslation,
      romanPrompt: drill.romanPrompt,
      targetWord: drill.targetWord,
      phoneticHint: drill.phoneticHint,
      audioClipId: drill.audioClipId,
      defaultSpeed: drill.defaultSpeed,
      audioDuration: drill.audioDuration,
      availableSpeeds: [1.0, 0.8, 0.75],
      xpAward: drill.xpAward,
      comboMultiplier: drill.comboMultiplier,
      metadata: drill.metadata,
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        isCorrect: a.isCorrect,
        score: a.score,
        xpAwarded: a.xpAwarded,
        attemptType: a.attemptType,
        createdAt: a.createdAt,
      })),
    };
  }

  /**
   * Evaluates typed Devanagari answers (Screen 2: Bollywood & Screen 4: Street Food).
   * Exact active-recall verification with zero multiple-choice guessing.
   */
  public async evaluateAnswer(userId: string, dto: EvaluateAnswerDto) {
    const normalizedType = dto.drillType.toUpperCase();
    const drill = await prisma.drill.findFirst({
      where: { drillType: normalizedType },
    });

    const expected = dto.expectedWord || drill?.targetWord || '';
    if (!expected) {
      throw new AppError('Expected target word could not be resolved for drill', HTTP_STATUS.BAD_REQUEST);
    }

    const isMatch = DevanagariUtility.isExactMatch(dto.typedWord, expected);
    const confidenceScore = DevanagariUtility.calculateMatchScore(dto.typedWord, expected);

    const baseReward = DRILL_XP_REWARDS[normalizedType as DrillType] || drill?.xpAward || 20;
    const awardedXp = isMatch ? baseReward : 0;
    const comboMultiplier = isMatch ? (drill?.comboMultiplier || 2) : 1;

    const feedbackHindi = isMatch
      ? `शानदार! बिल्कुल सही उत्तर। '${expected}'`
      : `करीब हैं! सही उत्तर '${expected}' था। दोबारा प्रयास करें।`;

    const feedbackEnglish = isMatch
      ? 'Splendid! Exact active recall match.'
      : `Keep going! The intended word was '${expected}'.`;

    // Persist attempt in database
    if (drill) {
      await prisma.userDrillAttempt.create({
        data: {
          userId,
          drillId: drill.id,
          userInput: dto.typedWord,
          isCorrect: isMatch,
          score: Math.round(confidenceScore * 100),
          xpAwarded: awardedXp,
          feedbackHindi,
          feedbackEnglish,
          attemptType: 'TYPING',
        },
      });

      // Update user XP & level progress on success
      if (isMatch) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: awardedXp },
          },
        });

        await prisma.userLevelProgress.upsert({
          where: {
            userId_levelId: {
              userId,
              levelId: drill.levelId,
            },
          },
          update: {
            status: 'mastered',
            stars: 3,
            score: 100,
            completedAt: new Date(),
          },
          create: {
            userId,
            levelId: drill.levelId,
            status: 'mastered',
            stars: 3,
            score: 100,
            completedAt: new Date(),
          },
        });
      }
    }

    return {
      isCorrect: isMatch,
      confidenceScore,
      xpAwarded: awardedXp,
      comboMultiplier,
      feedbackHindi,
      feedbackEnglish,
      normalizedUserText: DevanagariUtility.normalize(dto.typedWord),
      expectedNormalized: DevanagariUtility.normalize(expected),
    };
  }

  /**
   * Evaluates spoken Hindi voice turn for cadence, acoustic energy, and cultural respect.
   * Matches Wire Contract 6.2 for Screen 3 & Screen 5.
   */
  public async evaluateVoiceTurn(userId: string, dto: VoiceTurnDto) {
    const decibels = dto.decibels ?? 85.0;
    const pitchHz = dto.pitchHz ?? 220.0;

    const evaluation = AudioCadenceUtility.evaluateVoiceTurn(dto.spokenText, decibels, pitchHz);

    // If Golden Diya unlocked, persist artifact unlock in user inventory
    if (evaluation.isGoldenDiyaUnlocked) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isGoldenDiyaUnlocked: true,
          xp: { increment: evaluation.xpAwarded },
        },
      });

      await prisma.userArtifact.upsert({
        where: {
          userId_artifactId: {
            userId,
            artifactId: 'golden-diya',
          },
        },
        update: {},
        create: {
          userId,
          artifactId: 'golden-diya',
        },
      });

      await prisma.userLevelProgress.upsert({
        where: {
          userId_levelId: {
            userId,
            levelId: 'LEVEL_4',
          },
        },
        update: {
          status: 'mastered',
          stars: 3,
          score: evaluation.fluencyScore,
          completedAt: new Date(),
        },
        create: {
          userId,
          levelId: 'LEVEL_4',
          status: 'mastered',
          stars: 3,
          score: evaluation.fluencyScore,
          completedAt: new Date(),
        },
      });
    } else {
      // Award partial XP for speech attempt
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: evaluation.xpAwarded },
        },
      });
    }

    // Record voice attempt
    const drillType = (dto.drillType || DRILL_TYPES.NANI_BOSS).toUpperCase();
    const drill = await prisma.drill.findFirst({
      where: { drillType },
    });

    if (drill) {
      await prisma.userDrillAttempt.create({
        data: {
          userId,
          drillId: drill.id,
          userInput: dto.spokenText,
          isCorrect: evaluation.fluencyScore >= 80,
          score: evaluation.fluencyScore,
          xpAwarded: evaluation.xpAwarded,
          feedbackHindi: evaluation.feedbackSummary,
          feedbackEnglish: evaluation.pedagogicalTip,
          attemptType: 'VOICE',
          decibels,
          pitchHz,
          respectMarker: evaluation.respectMarkerUsed,
        },
      });
    }

    return {
      fluencyScore: evaluation.fluencyScore,
      respectScore: evaluation.respectScore,
      respectMarkersFound: evaluation.respectMarkerUsed ? [evaluation.respectMarkerUsed] : [],
      informalMarkersFound: evaluation.informalMarkerUsed ? [evaluation.informalMarkerUsed] : [],
      unlockGoldenDiya: evaluation.isGoldenDiyaUnlocked,
      xpAwarded: evaluation.xpAwarded,
      pedagogicalTip: evaluation.pedagogicalTip,
      feedbackSummary: evaluation.feedbackSummary,
      cadenceLabel: evaluation.cadenceLabel,
    };
  }

  /**
   * Retrieves prompt audio metadata and playback speeds for slow enunciation pills.
   */
  public getAudioPromptMetadata(clipId: string, speed = 1.0) {
    const clips: Record<string, { title: string; baseDurationSeconds: number; tag: string }> = {
      'kabhi-kabhi-lyric': {
        title: 'Kabhi Kabhie Lyric Harmony',
        baseDurationSeconds: 5.0,
        tag: '🎵 1976 CLASSIC',
      },
      'cricket-commentary-crowd': {
        title: 'Wankhede Commentary Roar',
        baseDurationSeconds: 4.0,
        tag: '🏏 WANKHEDE CROWD',
      },
      'pani-puri-order': {
        title: 'Pani Puri Cart Customer Prompt',
        baseDurationSeconds: 4.2,
        tag: '🍲 OLD DELHI CHAAT',
      },
      'nani-diwali-call': {
        title: 'Nani Diwali WhatsApp Greeting',
        baseDurationSeconds: 14.0,
        tag: '🪔 WHATSAPP AUDIO',
      },
    };

    const targetClip = clips[clipId] || {
      title: 'Hindi Speech Prompt',
      baseDurationSeconds: 4.0,
      tag: '🔊 AUDIO PROMPT',
    };

    const adjustedDuration = (targetClip.baseDurationSeconds / speed).toFixed(1);
    const minutes = Math.floor(Number(adjustedDuration) / 60);
    const seconds = Math.floor(Number(adjustedDuration) % 60).toString().padStart(2, '0');

    return {
      clipId,
      title: targetClip.title,
      tag: targetClip.tag,
      speed,
      durationLabel: `${minutes}:${seconds}`,
      durationSeconds: Number(adjustedDuration),
      waveformPillBars: [45, 75, 100, 85, 90, 60, 40],
    };
  }
}

export const drillsService = new DrillsService();

