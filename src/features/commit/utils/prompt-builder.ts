import { PromptParameters } from '../../../core/index.js';

export type { PromptParameters };

/**
 * Builds a user prompt for generating conventional commit messages
 * @param params - Object containing commit type, diff, status, and optional retry error
 * @returns Formatted prompt string for LLM
 */
function getBasePrompt(commitType: string, status: string): string {
  return `Generate a conventional commit message for the following changes:

Commit Type: ${commitType}
Current Status: ${status}`;
}

function getUserContext(userPrompt?: string): string {
  return userPrompt !== undefined && userPrompt.length > 0
    ? `\n\nUser Context: ${userPrompt}`
    : '';
}

function getRetryInfo(retryError?: string): string {
  return retryError !== undefined && retryError.length > 0
    ? `\n\nPrevious attempt failed with: ${retryError}\nPlease fix the issue and try again.`
    : '';
}

export function buildUserPrompt({
  commitType,
  diff,
  status,
  retryError,
  userPrompt,
}: PromptParameters): string {
  const basePrompt = getBasePrompt(commitType, status);
  const userContext = getUserContext(userPrompt);
  const retryInfo = getRetryInfo(retryError);

  return `${basePrompt}${userContext}

Git Diff:
${diff}

Please provide a commit message that follows the conventional commit format: ${commitType}: description${retryInfo}`;
}
