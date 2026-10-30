// src/lib/constants/drill.constants.ts

export const DRILL_TYPES = {
  BOLLYWOOD: 'BOLLYWOOD',
  CRICKET: 'CRICKET',
  STREET_FOOD: 'STREET_FOOD',
  NANI_BOSS: 'NANI_BOSS',
} as const;

export type DrillType = typeof DRILL_TYPES[keyof typeof DRILL_TYPES];

export const DRILL_XP_REWARDS = {
  [DRILL_TYPES.BOLLYWOOD]: 20,
  [DRILL_TYPES.CRICKET]: 35,
  [DRILL_TYPES.STREET_FOOD]: 50,
  [DRILL_TYPES.NANI_BOSS]: 100,
} as const;

export const DRILL_AUDIO_SPEEDS = [1.0, 0.8, 0.75] as const;
export type DrillAudioSpeed = typeof DRILL_AUDIO_SPEEDS[number];

export const DRILL_ATTEMPT_TYPES = {
  TYPING: 'TYPING',
  VOICE: 'VOICE',
  SILENT: 'SILENT',
} as const;

export type DrillAttemptType = typeof DRILL_ATTEMPT_TYPES[keyof typeof DRILL_ATTEMPT_TYPES];

