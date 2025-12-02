/**
 * Core types for commit-related functionality
 * Following hexagonal architecture - these types are used across all layers
 */

export enum CommitAction {
  APPROVE = 'APPROVE',
  EDIT = 'EDIT',
  REGENERATE = 'REGENERATE',
  CANCEL = 'CANCEL',
}

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
