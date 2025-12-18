/**
 * Validation utilities for clinical notes field
 * Ensures that only appropriate characters are used in clinical documentation
 */

/**
 * Regex pattern to detect emoji characters
 * Covers:
 * - Emoji range (U+1F000 to U+1F9FF)
 * - Emoji variation selectors
 * - Zero-width joiners
 * - Surrogate pairs
 * - Combining marks that form emoji
 */
/* eslint-disable no-misleading-character-class */
const EMOJI_PATTERN =
  /(?:[\u2600-\u26FF]|[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udeec]|\ud83c[\udf00-\udfff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203C|\u2049|\u25AA|\u25AB|\u25B6|\u25C0|\u25FB|\u25FC|\u25FD|\u25FE|\u2B50|\u2B55|\u2934|\u2935|[\u2190-\u21ff])/g;
/* eslint-enable no-misleading-character-class */

/**
 * Pattern for allowed special characters in clinical notes
 * Allows: letters, numbers, spaces, common punctuation, and medical notation
 */
const ALLOWED_SPECIAL_CHARS = /^[a-zA-Z0-9\s.,\-:;()\[\]/\\±<>=×÷]*$/;

/**
 * Pattern for control characters that should be rejected
 * Excludes line breaks and standard whitespace
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS_PATTERN = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g;

/**
 * Pattern for zero-width characters
 */
// eslint-disable-next-line no-misleading-character-class
const ZERO_WIDTH_CHARACTERS_PATTERN = /[\u200B\u200C\u200D\uFEFF]/g;

/**
 * Check if input contains emoji characters
 * @param input - The text to check
 * @returns boolean - True if emoji is detected, false otherwise
 */
export const containsEmoji = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  EMOJI_PATTERN.lastIndex = 0; // Reset regex state
  return EMOJI_PATTERN.test(input);
};

/**
 * Check if input contains control characters (excluding line breaks)
 * @param input - The text to check
 * @returns boolean - True if control characters are detected
 */
export const containsControlCharacters = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  CONTROL_CHARACTERS_PATTERN.lastIndex = 0;
  return CONTROL_CHARACTERS_PATTERN.test(input);
};

/**
 * Check if input contains zero-width characters
 * @param input - The text to check
 * @returns boolean - True if zero-width characters are detected
 */
export const containsZeroWidthCharacters = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  ZERO_WIDTH_CHARACTERS_PATTERN.lastIndex = 0;
  return ZERO_WIDTH_CHARACTERS_PATTERN.test(input);
};

/**
 * Validate clinical notes field
 * Checks for emoji, control characters, and zero-width characters
 * @param input - The text to validate
 * @returns object with validation result and error message
 */
export const validateClinicalNotes = (
  input: string,
): {
  isValid: boolean;
  errorMessage?: string;
} => {
  if (!input || typeof input !== 'string') {
    return { isValid: true };
  }

  if (containsEmoji(input)) {
    return {
      isValid: false,
      errorMessage: 'notes.emojiNotAllowed',
    };
  }

  if (containsControlCharacters(input)) {
    return {
      isValid: false,
      errorMessage: 'notes.controlCharactersNotAllowed',
    };
  }

  if (containsZeroWidthCharacters(input)) {
    return {
      isValid: false,
      errorMessage: 'notes.hiddenCharactersNotAllowed',
    };
  }

  return { isValid: true };
};

/**
 * Sanitize clinical notes by removing invalid characters
 * @param input - The text to sanitize
 * @returns string - Sanitized text
 */
export const sanitizeClinicalNotes = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  let sanitized = input;

  // Remove emoji
  sanitized = sanitized.replace(EMOJI_PATTERN, '');

  // Remove control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Remove zero-width characters
  sanitized = sanitized.replace(ZERO_WIDTH_CHARACTERS_PATTERN, '');

  return sanitized;
};

/**
 * Get detailed validation feedback for clinical notes
 * @param input - The text to validate
 * @returns object with validation details and specific issues found
 */
export const getDetailedValidationFeedback = (
  input: string,
): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  if (!input || typeof input !== 'string') {
    return { isValid: true, issues: [] };
  }

  if (containsEmoji(input)) {
    issues.push('emoji');
  }

  if (containsControlCharacters(input)) {
    issues.push('controlCharacters');
  }

  if (containsZeroWidthCharacters(input)) {
    issues.push('zeroWidthCharacters');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};
