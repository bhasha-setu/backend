// src/utilities/audioCadence.utility.ts
import { RESPECT_MARKERS, INFORMAL_MARKERS, RESPECT_FEEDBACK } from '../lib/constants/respect.constants.js';
import { APP_CONSTANTS } from '../lib/constants/app.constants.js';

export interface FluencyEvaluationResult {
  fluencyScore: number;
  respectMarkerUsed: string | null;
  informalMarkerUsed: string | null;
  respectScore: number;
  unlockedArtifactId: string | null;
  xpAwarded: number;
  isGoldenDiyaUnlocked: boolean;
  feedbackSummary: string;
  pedagogicalTip: string;
  cadenceLabel: string;
}

export class AudioCadenceUtility {
  /**
   * Scans Hindi text for cultural honorific markers (आप, जी, नमस्ते, प्रणाम, etc.)
   */
  public static detectRespectMarker(text: string): string | null {
    if (!text) return null;
    for (const marker of RESPECT_MARKERS) {
      if (text.includes(marker)) {
        return marker;
      }
    }
    return null;
  }

  /**
   * Scans Hindi text for informal pronouns (तू, तेरा, आदि)
   */
  public static detectInformalMarker(text: string): string | null {
    if (!text) return null;
    for (const marker of INFORMAL_MARKERS) {
      if (new RegExp(`\\b${marker}\\b`, 'u').test(text) || text.includes(marker)) {
        return marker;
      }
    }
    return null;
  }

  /**
   * Evaluates spoken voice turn for fluency, acoustic energy, pitch, and cultural respect.
   */
  public static evaluateVoiceTurn(
    spokenText: string,
    decibels = 85.0,
    pitchHz = 220.0
  ): FluencyEvaluationResult {
    const respectMarker = this.detectRespectMarker(spokenText);
    const informalMarker = this.detectInformalMarker(spokenText);

    let baseScore = 75;

    // Decibel resonance boost (80 to 95 dB is optimal speech roar/projection)
    if (decibels >= 80 && decibels <= 96) {
      baseScore += 10;
    } else if (decibels > 96) {
      baseScore += 8;
    }

    // Pitch cadence resonance boost (180 - 280 Hz is natural spoken cadence)
    if (pitchHz >= 180 && pitchHz <= 280) {
      baseScore += 5;
    }

    // Cultural etiquette adjustment
    if (respectMarker) {
      baseScore += 8;
    }
    if (informalMarker) {
      baseScore -= 15;
    }

    const fluencyScore = Math.min(99, Math.max(50, baseScore));
    const respectScore = respectMarker ? 1.0 : informalMarker ? 0.3 : 0.7;
    const isGoldenDiyaUnlocked = fluencyScore >= APP_CONSTANTS.GOLDEN_DIYA_FLUENCY_THRESHOLD && !informalMarker;
    const xpAwarded = isGoldenDiyaUnlocked ? 100 : fluencyScore >= 75 ? 50 : 25;

    let pedagogicalTip: string = RESPECT_FEEDBACK.PERFECT_RESPECT;
    if (informalMarker) {
      pedagogicalTip = RESPECT_FEEDBACK.INFORMAL_DETECTED;
    } else if (!respectMarker) {
      pedagogicalTip = RESPECT_FEEDBACK.MISSING_RESPECT;
    }

    return {
      fluencyScore,
      respectMarkerUsed: respectMarker,
      informalMarkerUsed: informalMarker,
      respectScore,
      unlockedArtifactId: isGoldenDiyaUnlocked ? 'golden-diya' : null,
      xpAwarded,
      isGoldenDiyaUnlocked,
      feedbackSummary: `✓✓ ${fluencyScore}% Natural Fluency`,
      pedagogicalTip,
      cadenceLabel: fluencyScore >= 85 ? 'natural cadence' : 'steady cadence',
    };
  }

  /**
   * Computes stadium crowd roar percentage from raw acoustic decibels.
   */
  public static computeRoarPercentage(decibels: number): {
    roarPercentage: number;
    stadiumReaction: string;
    xpEarned: number;
  } {
    // Normal speech is ~60dB, stadium roar goes up to 100dB
    const normalized = Math.min(100, Math.max(20, Math.round(((decibels - 40) / 60) * 100)));
    const reaction = normalized >= 85 ? 'CHOWKA_CHHAKKA' : normalized >= 70 ? 'CROWD_CHEER' : 'CROWD_MURMUR';
    const xp = normalized >= 85 ? 35 : 20;

    return {
      roarPercentage: normalized,
      stadiumReaction: reaction,
      xpEarned: xp,
    };
  }
}

