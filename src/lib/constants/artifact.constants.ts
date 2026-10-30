// src/lib/constants/artifact.constants.ts

export const ARTIFACT_IDS = {
  VINTAGE_MIC: 'vintage-mic',
  CRICKET_BALL: 'cricket-ball',
  CHAI_KULHAD: 'chai-kulhad',
  GOLDEN_DIYA: 'golden-diya',
} as const;

export type ArtifactId = typeof ARTIFACT_IDS[keyof typeof ARTIFACT_IDS];

export const ARTIFACT_DEFINITIONS = [
  {
    id: ARTIFACT_IDS.VINTAGE_MIC,
    name: 'Vintage Mic',
    icon: '🎙️',
    level: 'Level 1: Bollywood Studio',
    description: 'Mastered spontaneous lyric enunciation without multiple-choice cues.',
    bonus: '+20 XP Active Recall Boost',
  },
  {
    id: ARTIFACT_IDS.CRICKET_BALL,
    name: 'Cricket Ball',
    icon: '🏏',
    level: 'Level 2: Cricket Commentary',
    description: 'Spoke match-winning commentary with authentic Wankhede stadium cadence.',
    bonus: '+35 XP Fluency Cadence',
  },
  {
    id: ARTIFACT_IDS.CHAI_KULHAD,
    name: 'Chai Kulhad',
    icon: '☕',
    level: 'Level 3: Street Food Masterchef',
    description: 'Negotiated authentic street food portions using zero English crutches.',
    bonus: '+50 XP Negotiation Mastery',
  },
  {
    id: ARTIFACT_IDS.GOLDEN_DIYA,
    name: 'Golden Diya',
    icon: '🪔',
    level: 'Boss Level: Diwali Call with Nani',
    description: 'Maintained 3-minute live conversational Hindi with natural respect markers.',
    bonus: '+100 XP Cultural Fluency',
  },
] as const;

