import { PromptParameters } from '../../../core/index.js';

/**
 * Builds a user prompt for generating conventional commit messages
 * @param params - Object containing commit type, diff, status, and optional retry error
 * @returns Formatted prompt string for LLM
 */
export function buildUserPrompt({
  commitType,
  diff,
  status,
  retryError,
}: PromptParameters): string {
  let prompt = `Generate a conventional commit message for the following changes:

Commit Type: ${commitType}
Current Status: ${status}

Git Diff:
${diff}

Please provide a commit message that follows the conventional commit format: ${commitType}: description`;

  if (retryError !== undefined && retryError.length > 0) {
    prompt += `

Previous attempt failed with: ${retryError}
Please fix the issue and try again.`;
  }

  return prompt;
}
