// src/profile/profile.service.ts
import { prisma } from '../database/prisma.client.js';
import { AppError } from '../middleware/errorHandler.middleware.js';
import { HTTP_STATUS } from '../lib/constants/app.constants.js';
import { ZEN_COLORS } from '../lib/constants/zen.constants.js';

export interface UpdatePreferencesDto {
  isSilentMode?: boolean;
  isAudioMuted?: boolean;
  playbackSpeed?: number;
}

export interface CreateChatMessageDto {
  sender: 'nani' | 'user';
  hindiText: string;
  englishSubtext: string;
  duration?: string;
  timestamp?: string;
  fluencyScore?: number;
  respectWord?: string;
}

export class ProfileService {
  /**
   * Retrieves full profile information, stats grid, and settings for the user.
   * Maps to bhasha-setu-frontend/src/components/dashboard/ProfileModal.tsx
   */
  public async getUserProfile(userId: string) {
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

    const totalLevels = await prisma.questLevel.count();
    const totalArtifacts = await prisma.artifact.count();
    const masteredCount = user.levelProgress.filter((p) => p.status === 'mastered').length;
    const unlockedArtifactCount = user.artifacts.length;

    // Build stats grid strictly styled with zenTheme colors
    const stats = [
      {
        label: 'Current Streak',
        value: `${user.streak} Days`,
        icon: '🔥',
        color: ZEN_COLORS.terracotta,
      },
      {
        label: 'Total Experience',
        value: `${user.xp} XP`,
        icon: '⚡',
        color: ZEN_COLORS.sageTeal,
      },
      {
        label: 'Mastered Quests',
        value: `${masteredCount}/${totalLevels}`,
        icon: '🗺️',
        color: ZEN_COLORS.ochreAccent,
      },
      {
        label: 'Artifacts Found',
        value: `${unlockedArtifactCount}/${totalArtifacts}`,
        icon: '🏺',
        color: ZEN_COLORS.successGreen,
      },
    ];

    return {
      profile: {
        id: user.id,
        name: user.name,
        title: user.title,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        streak: user.streak,
        currentLevelId: user.currentLevelId,
        isGoldenDiyaUnlocked: user.isGoldenDiyaUnlocked,
      },
      preferences: {
        isSilentMode: user.isSilentMode,
        isAudioMuted: user.isAudioMuted,
        playbackSpeed: user.playbackSpeed,
      },
      stats,
      completedLevels: user.levelProgress.filter((p) => p.status === 'mastered').map((p) => p.levelId),
      unlockedArtifacts: user.artifacts.map((a) => a.artifactId),
    };
  }

  /**
   * Updates user preferences (silent mode, mute, playback speed).
   */
  public async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isSilentMode: dto.isSilentMode !== undefined ? dto.isSilentMode : undefined,
        isAudioMuted: dto.isAudioMuted !== undefined ? dto.isAudioMuted : undefined,
        playbackSpeed: dto.playbackSpeed !== undefined ? dto.playbackSpeed : undefined,
      },
    });

    return {
      userId: updatedUser.id,
      isSilentMode: updatedUser.isSilentMode,
      isAudioMuted: updatedUser.isAudioMuted,
      playbackSpeed: updatedUser.playbackSpeed,
    };
  }

  /**
   * Returns weekly practice streak array ('M', 'T', 'W', 'T', 'F', 'S', 'S').
   */
  public async getWeeklyPracticeStreak(userId: string) {
    const streaks = await prisma.practiceStreak.findMany({
      where: { userId },
      orderBy: { dayIndex: 'asc' },
      take: 7,
    });

    const defaultDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const days = streaks.length === 7
      ? streaks.map((s) => ({
          day: s.dayLabel,
          isCompleted: s.isCompleted,
          xpGained: s.xpGained,
          date: s.date,
        }))
      : defaultDays.map((label, idx) => ({
          day: label,
          isCompleted: true,
          xpGained: 50,
          date: new Date(Date.now() - (6 - idx) * 86400000),
        }));

    const completedDays = days.filter((d) => d.isCompleted).length;

    return {
      title: 'Weekly Practice Streak',
      streakCountLabel: `🔥 ${completedDays} of 7 Days`,
      completedDays,
      totalDays: 7,
      days,
    };
  }

  /**
   * Returns dynamic cultural spoken milestones.
   */
  public async getCulturalMilestones(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artifacts: true,
        levelProgress: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    const completedLevelIds = new Set(
      user.levelProgress.filter((p) => p.status === 'mastered').map((p) => p.levelId)
    );
    const unlockedArtifactIds = new Set(user.artifacts.map((a) => a.artifactId));

    const milestones = await prisma.culturalMilestone.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const evaluatedMilestones = milestones.map((m) => {
      let isDone = false;
      if (m.requiredLevelId && completedLevelIds.has(m.requiredLevelId)) {
        isDone = true;
      }
      if (m.requiredArtifactId && unlockedArtifactIds.has(m.requiredArtifactId)) {
        isDone = true;
      }

      return {
        id: m.id,
        title: m.title,
        desc: m.description,
        done: isDone,
      };
    });

    return {
      title: 'Cultural Spoken Milestones',
      milestones: evaluatedMilestones,
    };
  }

  /**
   * Retrieves WhatsApp chat simulation history with Nani.
   * Maps to INITIAL_CHAT_HISTORY in bhasha-setu-frontend/src/store/useFrontendStore.ts
   */
  public async getNaniChatHistory(userId: string) {
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      contactName: 'Nani (दादी/नानी)',
      status: 'online',
      encryptionNotice: 'Messages are simulated with Indian Cultural Etiquette analysis.',
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        hindiText: m.hindiText,
        englishSubtext: m.englishSubtext,
        duration: m.duration,
        timestamp: m.timestamp,
        fluencyScore: m.fluencyScore,
        respectWord: m.respectWord,
      })),
    };
  }

  /**
   * Appends a message to the Nani WhatsApp chat history and saves it to DB.
   */
  public async saveChatMessage(userId: string, dto: CreateChatMessageDto) {
    const id = `${dto.sender}-turn-${Date.now()}`;
    const timestamp = dto.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const message = await prisma.chatMessage.create({
      data: {
        id,
        userId,
        sender: dto.sender,
        hindiText: dto.hindiText,
        englishSubtext: dto.englishSubtext,
        duration: dto.duration || '0:04',
        timestamp,
        fluencyScore: dto.fluencyScore || null,
        respectWord: dto.respectWord || null,
      },
    });

    return message;
  }
}

export const profileService = new ProfileService();

