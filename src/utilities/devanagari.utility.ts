// src/utilities/devanagari.utility.ts

export class DevanagariUtility {
  /**
   * Normalizes Devanagari string by removing zero-width joiners,
   * collapsing whitespace, stripping extra punctuation, and standardizing matras.
   */
  public static normalize(text: string): string {
    if (!text) return '';

    return text
      .trim()
      // Remove Zero-Width Non-Joiner (ZWNJ) and Zero-Width Joiner (ZWJ)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Remove trailing common punctuation like ! ? " ' “ ”
      .replace(/[!?.,;:"'“”।]/g, '')
      // Collapse multiple whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Performs an active-recall exact match between user-typed word and expected answer.
   */
  public static isExactMatch(userInput: string, expected: string): boolean {
    const cleanUser = this.normalize(userInput);
    const cleanExpected = this.normalize(expected);
    return cleanUser === cleanExpected;
  }

  /**
   * Calculates similarity percentage between two Devanagari words/phrases.
   */
  public static calculateMatchScore(userInput: string, expected: string): number {
    const cleanUser = this.normalize(userInput);
    const cleanExpected = this.normalize(expected);

    if (cleanUser === cleanExpected) return 1.0;
    if (!cleanUser || !cleanExpected) return 0.0;

    // Levenshtein distance on characters
    const a = cleanUser;
    const b = cleanExpected;
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    const similarity = (maxLength - distance) / maxLength;
    return Math.max(0, Math.min(1, Number(similarity.toFixed(2))));
  }
}

