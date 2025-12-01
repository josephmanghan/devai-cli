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
