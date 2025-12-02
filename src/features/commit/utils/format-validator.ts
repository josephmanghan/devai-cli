import { ValidationResult } from '../../../core/index.js';

/**
 * Validates basic commit message structure using regex pattern /^\w+: .+$/
 * @param message - The commit message to validate
 * @returns ValidationResult indicating if message matches expected pattern
 */
export function validateStructure(message: string): ValidationResult {
  if (!isValidInput(message)) {
    return createInvalidInputResult();
  }

  const trimmedMessage = message.trim();
  if (isEmpty(trimmedMessage)) {
    return createInvalidInputResult();
  }

  return validateCommitPattern(trimmedMessage);
}

/**
 * Type guard to check if message is a valid string
 * @param message - Value to check
 * @returns True if message is a valid string
 */
function isValidInput(message: unknown): message is string {
  return (
    message !== null && message !== undefined && typeof message === 'string'
  );
}

/**
 * Checks if a message string is empty
 * @param message - String to check
 * @returns True if message is empty
 */
function isEmpty(message: string): boolean {
  return message.length === 0;
}

/**
 * Creates a validation result for invalid input
 * @returns ValidationResult indicating invalid input with appropriate error message
 */
function createInvalidInputResult(): ValidationResult {
  return {
    isValid: false,
    error: 'Message must be a non-empty string',
  };
}

/**
 * Validates commit message against basic pattern requirement
 * @param message - Message to validate
 * @returns ValidationResult indicating if pattern matches
 */
function validateCommitPattern(message: string): ValidationResult {
  const commitPattern = /^\w+: .+$/;

  if (!commitPattern.test(message)) {
    return {
      isValid: false,
      error: 'Message must follow format: type: description',
    };
  }

  return { isValid: true };
}

/**
 * Validates commit type format
 * @param type - Commit type to validate
 * @returns ValidationResult indicating if type is valid
 */
function validateType(type: string): ValidationResult {
  if (type.length === 0 || type.match(/^\w+$/) === null) {
    return {
      isValid: false,
      error: 'Commit type must contain only word characters',
    };
  }

  return { isValid: true };
}

/**
 * Validates commit description format and length
 * @param description - Description to validate
 * @returns ValidationResult indicating if description is valid
 */
function validateDescription(description: string): ValidationResult {
  if (description.length === 0) {
    return {
      isValid: false,
      error: 'Commit description cannot be empty',
    };
  }

  if (description.length > 100) {
    return {
      isValid: false,
      error: 'Commit description must be 100 characters or less',
    };
  }

  return { isValid: true };
}

/**
 * Parses a commit message into type and description components
 * @param message - The commit message to parse
 * @returns Object with type and description, or null if no colon found
 */
function parseCommitMessage(
  message: string
): { type: string; description: string } | null {
  const colonIndex = message.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }

  const type = message.substring(0, colonIndex).trim();
  const description = message.substring(colonIndex + 1).trim();

  return { type, description };
}

/**
 * Validates commit message with detailed type and description checks
 * @param message - The commit message to validate
 * @returns ValidationResult with detailed validation feedback
 */
export function validateMessage(message: string): ValidationResult {
  if (!isValidInput(message)) {
    return createInvalidInputResult();
  }

  const trimmedMessage = message.trim();
  const parts = parseCommitMessage(trimmedMessage);

  if (parts === null) {
    return {
      isValid: false,
      error:
        'Commit message must follow conventional commit format: type: description',
    };
  }

  return validateMessageParts(parts);
}

/**
 * Validates both type and description parts of a commit message
 * @param parts - Object containing type and description to validate
 * @returns ValidationResult with combined validation feedback
 */
function validateMessageParts(parts: {
  type: string;
  description: string;
}): ValidationResult {
  const typeValidation = validateType(parts.type);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  return validateDescription(parts.description);
}
