/**
 * Defines the contract for Git repository operations.
 * Isolates core business logic from shell command implementations.
 */
export interface GitPort {
  /**
   * Checks if the current directory is a Git repository.
   *
   * @returns Promise that resolves to true if inside a git repository, false otherwise
   */
  isGitRepository(): Promise<boolean>;

  /**
   * Gets the staged changes diff from the git repository.
   *
   * @returns Promise that resolves to the staged diff content, empty string if no staged changes
   * @throws {UserError} When not in a git repository or git command fails
   * @throws {SystemError} When git binary is not available
   */
  getStagedDiff(): Promise<string>;

  /**
   * Gets the current branch name of the git repository.
   *
   * @returns Promise that resolves to the current branch name
   * @throws {UserError} When not in a git repository or git command fails
   * @throws {SystemError} When git binary is not available
   */
  getBranchName(): Promise<string>;

  /**
   * Commits staged changes with the provided message.
   *
   * @param message - The commit message to use
   * @returns Promise that resolves when commit is successful
   * @throws {UserError} When no staged changes, invalid message, or git command fails
   * @throws {SystemError} When git binary is not available
   */
  commitChanges(message: string): Promise<void>;
}
