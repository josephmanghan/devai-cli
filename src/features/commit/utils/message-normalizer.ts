/**
 * Parses a commit message to extract type and the rest of the message
 * @param message - The commit message to parse
 * @returns Object with type and rest of message, or null if no colon found
 */
function parseMessageParts(
  message: string
): { type: string; rest: string } | null {
  const colonIndex = message.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }

  const type = message.substring(0, colonIndex).trim();
  const rest = message.substring(colonIndex + 1).trim();

  return { type, rest };
}

/**
 * Formats a commit message with optional body content
 * @param type - The commit type
 * @param subject - The commit subject line
 * @param bodyLines - Array of body line strings
 * @returns Formatted commit message string
 */
function formatMessageWithBody(
  type: string,
  subject: string,
  bodyLines: string[]
): string {
  if (bodyLines.length === 0) {
    return `${type}: ${subject}`;
  }

  const body = joinBodyLines(bodyLines);
  return `${type}: ${subject}\n\n${body}`;
}

/**
 * Joins body lines with double newlines for commit message format
 * @param bodyLines - Array of body line strings
 * @returns Joined body lines with proper spacing
 */
function joinBodyLines(bodyLines: string[]): string {
  return bodyLines.join('\n\n');
}

/**
 * Extracts non-empty lines from content and trims whitespace
 * @param content - String content to extract lines from
 * @returns Array of trimmed, non-empty lines
 */
function extractLines(content: string): string[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Normalizes commit message format with proper blank line separator
 * @param message - The commit message to normalize
 * @returns Normalized commit message with proper formatting
 */
export function normalizeFormat(message: string): string {
  if (!isValidString(message)) {
    return '';
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return '';
  }

  return normalizeMessageStructure(trimmedMessage);
}

/**
 * Type guard to check if a value is a valid non-null string
 * @param value - Value to check
 * @returns True if value is a valid string
 */
function isValidString(value: unknown): value is string {
  return value !== null && value !== undefined && typeof value === 'string';
}

/**
 * Normalizes the structure of a commit message by parsing and reformatting
 * @param message - The message structure to normalize
 * @returns Normalized message string
 */
function normalizeMessageStructure(message: string): string {
  const parts = parseMessageParts(message);
  if (parts === null) {
    return message;
  }

  if (parts.rest.length === 0) {
    return parts.type;
  }

  return normalizeMessageWithBody(parts);
}

/**
 * Normalizes a message with body content by extracting subject and body lines
 * @param parts - Object containing message type and rest content
 * @returns Formatted message with proper body structure
 */
function normalizeMessageWithBody(parts: {
  type: string;
  rest: string;
}): string {
  const lines = extractLines(parts.rest);

  if (lines.length === 0) {
    return parts.type;
  }

  const subject = lines[0];
  const bodyLines = lines.slice(1);

  return formatMessageWithBody(parts.type, subject, bodyLines);
}
