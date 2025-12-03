/**
 * Context object containing validated git repository information
 * for commit generation operations.
 */
export interface CommitContext {
  /** The staged changes diff content */
  diff: string;
  /** The current git branch name */
  branch: string;
}

/**
 * Result of commit generation operation
 */
export interface GenerateCommitOutput {
  readonly commitMessage: string;
  readonly attemptsMade: number;
}
