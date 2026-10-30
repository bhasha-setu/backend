// src/lib/constants/quest.constants.ts

export const QUEST_LEVEL_IDS = {
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
  LEVEL_4: 'LEVEL_4',
} as const;

export type QuestLevelId = typeof QUEST_LEVEL_IDS[keyof typeof QUEST_LEVEL_IDS];

export const QUEST_LEVEL_STATUS = {
  MASTERED: 'mastered',
  ACTIVE: 'active',
  LOCKED: 'locked',
} as const;

export type QuestLevelStatus = typeof QUEST_LEVEL_STATUS[keyof typeof QUEST_LEVEL_STATUS];

export const QUEST_DEFAULTS = {
  TOTAL_STAGES: 4,
  CURRENT_DEFAULT_STAGE: 3,
  CHEST_TARGET_XP: 500,
  BASE_STREAK_DAYS: 7,
  BASE_USER_XP: 480,
} as const;

