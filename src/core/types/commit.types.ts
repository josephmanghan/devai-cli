/**
 * Available actions for commit message workflow
 */
export enum CommitAction {
  APPROVE = 'APPROVE',
  EDIT = 'EDIT',
  REGENERATE = 'REGENERATE',
  PROVIDE_PROMPT = 'PROVIDE_PROMPT',
  CANCEL = 'CANCEL',
}

/**
 * Available conventional commit types
 */
export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'style'
  | 'refactor'
  | 'perf'
  | 'test'
  | 'build'
  | 'ci'
  | 'chore'
  | 'revert';

/**
 * Array of all supported commit types
 */
export const COMMIT_TYPES: readonly CommitType[] = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const;

/**
 * Human-readable descriptions for each commit type
 */
export const COMMIT_TYPE_DESCRIPTIONS: Record<CommitType, string> = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style:
    'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  perf: 'A code change that improves performance',
  test: 'Adding missing tests or correcting existing tests',
  build: 'Changes that affect the build system or external dependencies',
  ci: 'Changes to our CI configuration files and scripts',
  chore: "Other changes that don't modify src or test files",
  revert: 'Reverts a previous commit',
} as const;

/**
 * Input parameters for commit generation use case
 */
export interface GenerateCommitInput {
  readonly commitType: string;
  readonly diff: string;
  readonly status: string;
  readonly userPrompt?: string;
}
