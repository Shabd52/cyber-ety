import {
  LETTER_SCORES,
  TECH_GLOSSARY,
  PROGRAMMING_LANGUAGES,
  COMMON_PROPER_NOUNS,
  ERROR_MESSAGES,
} from '@cyber-etymology/shared';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  errorCode?: string;
}

export interface ScoreBreakdown {
  word: string;
  letters: { letter: string; value: number }[];
  totalScore: number;
}

/**
 * Main word validation function
 * Checks all rules and returns validation result
 */
export function validateWord(
  word: string,
  questionType: 'START' | 'CONTAIN',
  givenLetters: string[]
): ValidationResult {
  // Normalize input
  const normalizedWord = word.toLowerCase().trim();

  // Check if word is empty
  if (!normalizedWord) {
    return {
      isValid: false,
      message: 'Word cannot be empty.',
      errorCode: 'EMPTY_WORD',
    };
  }

  // Check word length (minimum 2 characters)
  if (normalizedWord.length < 2) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.WORD_TOO_SHORT,
      errorCode: 'TOO_SHORT',
    };
  }

  // Check only alphabets
  if (!/^[a-z]+$/.test(normalizedWord)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.CONTAINS_NON_ALPHABETS,
      errorCode: 'NON_ALPHABETIC',
    };
  }

  // Check if it's a programming language
  if (PROGRAMMING_LANGUAGES.includes(normalizedWord)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.IS_PROGRAMMING_LANGUAGE,
      errorCode: 'PROGRAMMING_LANGUAGE',
    };
  }

  // Check if it's a common proper noun
  if (COMMON_PROPER_NOUNS.includes(normalizedWord)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.IS_PROPER_NOUN,
      errorCode: 'PROPER_NOUN',
    };
  }

  // Check if word is tech-related (in glossary)
  if (!TECH_GLOSSARY.includes(normalizedWord)) {
    return {
      isValid: false,
      message: ERROR_MESSAGES.NOT_TECH_RELATED,
      errorCode: 'NOT_TECH_RELATED',
    };
  }

  // Question type specific validation
  if (questionType === 'START') {
    const requiredLetter = givenLetters[0].toLowerCase();
    if (!normalizedWord.startsWith(requiredLetter)) {
      return {
        isValid: false,
        message: `${ERROR_MESSAGES.INVALID_START_LETTER} Word must start with "${requiredLetter.toUpperCase()}".`,
        errorCode: 'INVALID_START_LETTER',
      };
    }
  } else if (questionType === 'CONTAIN') {
    const normalizedLetters = givenLetters.map((l) => l.toLowerCase());
    for (const letter of normalizedLetters) {
      if (!normalizedWord.includes(letter)) {
        return {
          isValid: false,
          message: `${ERROR_MESSAGES.INVALID_CONTAIN_LETTERS} Word must contain all letters: ${normalizedLetters
            .join(', ')
            .toUpperCase()}`,
          errorCode: 'INVALID_CONTAIN_LETTERS',
        };
      }
    }
  }

  return {
    isValid: true,
    message: 'Word is valid.',
  };
}

/**
 * Calculate score for a valid word
 */
export function calculateScore(word: string): number {
  const normalizedWord = word.toLowerCase().trim();
  return normalizedWord.split('').reduce((sum, char) => {
    return sum + (LETTER_SCORES[char as keyof typeof LETTER_SCORES] || 0);
  }, 0);
}

/**
 * Get detailed score breakdown
 */
export function getScoreBreakdown(word: string): ScoreBreakdown {
  const normalizedWord = word.toLowerCase().trim();
  const letters = normalizedWord.split('').map((letter) => ({
    letter,
    value: LETTER_SCORES[letter as keyof typeof LETTER_SCORES] || 0,
  }));

  const totalScore = letters.reduce((sum, { value }) => sum + value, 0);

  return {
    word: normalizedWord,
    letters,
    totalScore,
  };
}

/**
 * Batch validate multiple words
 */
export function validateWordBatch(
  words: string[],
  questionType: 'START' | 'CONTAIN',
  givenLetters: string[]
): ValidationResult[] {
  return words.map((word) => validateWord(word, questionType, givenLetters));
}

/**
 * Check if word can potentially be valid (basic format check)
 * Used for real-time feedback without full validation
 */
export function canWordBeValid(word: string): ValidationResult {
  const normalizedWord = word.toLowerCase().trim();

  if (!normalizedWord) {
    return {
      isValid: false,
      message: 'Word cannot be empty.',
    };
  }

  if (!/^[a-z]+$/.test(normalizedWord)) {
    return {
      isValid: false,
      message: 'Only alphabetic characters are allowed.',
    };
  }

  return {
    isValid: true,
    message: 'Word format is valid.',
  };
}

/**
 * Get validation rule descriptions for UI display
 */
export function getValidationRuleDescriptions(): Record<string, string> {
  return {
    ONLY_ALPHABETS: 'Only English alphabetic characters allowed (A-Z, no numbers or symbols)',
    NO_PLURALS: 'Plural words (ending with "s") are not allowed',
    NO_ING_SUFFIX: 'Words ending with "ing" are not allowed',
    NO_ED_SUFFIX: 'Words ending with "ed" are not allowed',
    NO_ACRONYMS: 'Acronyms (all uppercase words) are not allowed',
    NO_PROPER_NOUNS: 'Proper nouns and brand names are not allowed',
    NO_PROGRAMMING_LANGUAGES: 'Programming language names are not allowed',
    MUST_BE_TECH_RELATED:
      'Word must be technology or computer science related',
    START_QUESTION: 'Word must start with the given letter',
    CONTAIN_QUESTION: 'Word must contain all given letters',
  };
}

/**
 * Get common tech words for hint/suggestion
 */
export function getTechGlossary(): string[] {
  return TECH_GLOSSARY.sort();
}

/**
 * Filter tech glossary by starting letter
 */
export function getTechWordsByLetter(letter: string): string[] {
  const normalizedLetter = letter.toLowerCase();
  return TECH_GLOSSARY.filter((word) => word.startsWith(normalizedLetter)).sort();
}

/**
 * Filter tech glossary by containing letters
 */
export function getTechWordsContainingLetters(letters: string[]): string[] {
  const normalizedLetters = letters.map((l) => l.toLowerCase());
  return TECH_GLOSSARY.filter((word) =>
    normalizedLetters.every((letter) => word.includes(letter))
  ).sort();
}

/**
 * Check if a word exists in tech glossary
 */
export function isTechWord(word: string): boolean {
  return TECH_GLOSSARY.includes(word.toLowerCase());
}
