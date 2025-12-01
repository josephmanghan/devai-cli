/**
 * Parameters for building user prompts
 */
export interface PromptParameters {
  readonly commitType: string;
  readonly diff: string;
  readonly status: string;
}

/**
 * Builds a user prompt for generating conventional commit messages
 * @param params - Object containing commit type, diff, and status
 * @returns Formatted prompt string for LLM
 */
export function buildUserPrompt({
  commitType,
  diff,
  status,
}: PromptParameters): string {
  return `Generate a conventional commit message for the following changes:

Commit Type: ${commitType}
Current Status: ${status}

Git Diff:
${diff}

Please provide a commit message that follows the conventional commit format: ${commitType}: description`;
}
