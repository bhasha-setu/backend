// src/lib/constants/respect.constants.ts

export const RESPECT_MARKERS = [
  'आप',
  'जी',
  'नमस्ते',
  'प्रणाम',
  'चरण',
  'धन्यवाद',
  'कृपा',
  'नानी जी',
  'दादी जी',
] as const;

export const INFORMAL_MARKERS = [
  'तू',
  'तेरा',
  'तेरे',
  'तुझे',
  'तूने',
] as const;

export const RESPECT_FEEDBACK = {
  PERFECT_RESPECT: 'Perfect cultural etiquette! Nani gives you her blessings.',
  MISSING_RESPECT: 'Friendly reminder: When addressing elders like Nani, use honorific "आप" or "जी" rather than informal "तू".',
  INFORMAL_DETECTED: 'Informal tone detected. In traditional Hindi culture, honorifics express deep affection and respect.',
} as const;

