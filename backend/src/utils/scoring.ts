import { LETTER_SCORES } from '@cyber-etymology/shared';

export interface ScoreCalculationResult {
  word: string;
  letters: LetterScore[];
  totalScore: number;
}

export interface LetterScore {
  letter: string;
  value: number;
  position: number;
}

/**
 * Calculate word score using letter values
 */
export function calculateWordScore(word: string): number {
  return word
    .toLowerCase()
    .split('')
    .reduce((sum, char) => {
      return sum + (LETTER_SCORES[char as keyof typeof LETTER_SCORES] || 0);
    }, 0);
}

/**
 * Get detailed score breakdown with letter positions
 */
export function getDetailedScoreBreakdown(word: string): ScoreCalculationResult {
  const normalized = word.toLowerCase();
  const letters: LetterScore[] = normalized.split('').map((char, position) => ({
    letter: char,
    value: LETTER_SCORES[char as keyof typeof LETTER_SCORES] || 0,
    position,
  }));

  const totalScore = letters.reduce((sum, { value }) => sum + value, 0);

  return {
    word: normalized,
    letters,
    totalScore,
  };
}

/**
 * Calculate team round score from multiple answers
 */
export function calculateRoundScore(wordScores: number[]): number {
  return wordScores.reduce((sum, score) => sum + score, 0);
}

/**
 * Calculate team total score across all rounds
 */
export function calculateTotalScore(roundScores: number[][]): number {
  return roundScores.flat().reduce((sum, score) => sum + score, 0);
}

/**
 * Compare scores for leaderboard ranking
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareScores(scoreA: number, scoreB: number): number {
  if (scoreA < scoreB) return -1;
  if (scoreA > scoreB) return 1;
  return 0;
}

/**
 * Get top N teams by score with tie-breaking by time
 */
export interface TeamWithScore {
  teamId: string;
  teamName: string;
  score: number;
  timeTaken: number; // milliseconds
}

export function rankTeams(teams: TeamWithScore[]): TeamWithScore[] {
  return teams.sort((a, b) => {
    // Primary: Higher score wins
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker: Lower time wins (faster response)
    return a.timeTaken - b.timeTaken;
  });
}

/**
 * Get top N teams
 */
export function getTopTeams(teams: TeamWithScore[], limit: number): TeamWithScore[] {
  return rankTeams(teams).slice(0, limit);
}

/**
 * Check if there's a tie at a specific position
 */
export function hasTieAtPosition(
  teams: TeamWithScore[],
  position: number
): boolean {
  if (position >= teams.length - 1) return false;

  const ranked = rankTeams(teams);
  const currentTeam = ranked[position];
  const nextTeam = ranked[position + 1];

  return currentTeam.score === nextTeam.score;
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return score.toString().padStart(4, '0');
}

/**
 * Get score multiplier based on difficulty
 * (Can be extended for different game modes)
 */
export function getScoreMultiplier(questionType: 'START' | 'CONTAIN'): number {
  return questionType === 'START' ? 1.0 : 1.2; // CONTAIN questions worth 20% more
}

/**
 * Apply difficulty multiplier to score
 */
export function applyMultiplier(score: number, multiplier: number): number {
  return Math.round(score * multiplier);
}

/**
 * Calculate average score per question
 */
export function calculateAverageScore(totalScore: number, questionCount: number): number {
  return Math.round(totalScore / questionCount);
}
