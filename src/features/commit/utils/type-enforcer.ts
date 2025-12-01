/**
 * Extracts the description part from a commit message after the colon
 * @param message - The commit message to extract description from
 * @returns Description string or null if no colon found
 */
function extractDescription(message: string): string | null {
  const colonIndex = message.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }

  return message.substring(colonIndex + 1).trim();
}

/**
 * Builds a commit message from type and description
 * @param type - The commit type
 * @param description - The commit description or null
 * @returns Formatted commit message string
 */
function buildCommitMessage(type: string, description: string | null): string {
  if (description === null) {
    return type;
  }

  if (description.length === 0) {
    return type;
  }

  return `${type}: ${description}`;
}

/**
 * Overwrites the commit type in a message with the specified type
 * @param originalMessage - The original commit message
 * @param newType - The new commit type to enforce
 * @returns Commit message with enforced type
 */
export function enforceType(originalMessage: string, newType: string): string {
  if (!isValidString(originalMessage)) {
    return '';
  }

  if (!isValidString(newType)) {
    return originalMessage.trim();
  }

  return applyTypeEnforcement(originalMessage, newType);
}

/**
 * Applies type enforcement logic to a commit message
 * @param message - The message to apply type enforcement to
 * @param type - The type to enforce
 * @returns Message with enforced type
 */
function applyTypeEnforcement(message: string, type: string): string {
  const cleanType = type.trim();
  if (cleanType.length === 0) {
    return message.trim();
  }

  if (message.length === 0) {
    return '';
  }

  const cleanMessage = message.trim();

  if (cleanMessage.length === 0) {
    return `${cleanType}: `;
  }

  const description = extractDescription(cleanMessage);

  if (description === null) {
    return `${cleanType}: ${cleanMessage}`;
  }

  return buildCommitMessage(cleanType, description);
}

/**
 * Type guard to check if a value is a valid non-null string
 * @param value - Value to check
 * @returns True if value is a valid string
 */
function isValidString(value: unknown): value is string {
  return value !== null && value !== undefined && typeof value === 'string';
}
