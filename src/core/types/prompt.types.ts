/**
 * Parameters for building user prompts
 */
export interface PromptParameters {
  readonly commitType: string;
  readonly diff: string;
  readonly status: string;
  readonly retryError?: string;
}
