import { execa } from 'execa';

import { GitPort } from '../../core/ports/git-port.js';
import { SystemError, UserError } from '../../core/types/errors.types.js';

/**
 * Shell-based Git adapter implementation using execa for command execution.
 * Provides Git repository operations by executing shell commands.
 */
export class ShellGitAdapter implements GitPort {
  /**
   * Creates a new ShellGitAdapter instance.
   * @param workingDirectory - Optional working directory for git commands
   */
  constructor(private readonly workingDirectory?: string) {}

  /**
   * Checks if the current directory is a Git repository.
   * @returns Promise that resolves to true if inside a git repository, false otherwise
   */
  async isGitRepository(): Promise<boolean> {
    try {
      const { exitCode } = await execa(
        'git',
        ['rev-parse', '--is-inside-work-tree'],
        {
          cwd: this.workingDirectory,
          reject: false,
        }
      );
      return exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Gets the staged changes diff from the git repository.
   * @returns Promise that resolves to the staged diff content, empty string if no staged changes
   * @throws {UserError} When not in a git repository
   * @throws {SystemError} When git binary is not available
   */
  async getStagedDiff(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['diff', '--cached'], {
        cwd: this.workingDirectory,
      });
      return stdout;
    } catch (error) {
      throw this.wrapGitError(error, 'Failed to get staged diff');
    }
  }

  /**
   * Gets the current branch name of the git repository.
   * @returns Promise that resolves to the current branch name
   * @throws {UserError} When not in a git repository
   * @throws {SystemError} When git binary is not available
   */
  async getBranchName(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['branch', '--show-current'], {
        cwd: this.workingDirectory,
      });
      return stdout.trim();
    } catch {
      return await this.getFallbackBranchName();
    }
  }

  private async getFallbackBranchName(): Promise<string> {
    try {
      const { stdout } = await execa('git', ['rev-parse', '--short', 'HEAD'], {
        cwd: this.workingDirectory,
      });
      return `HEAD-${stdout.trim()}`;
    } catch (error) {
      throw this.wrapGitError(error, 'Failed to get branch name');
    }
  }

  /**
   * Commits staged changes with the provided message.
   * @param message - The commit message to use
   * @returns Promise that resolves when commit is successful
   * @throws {UserError} When no staged changes or invalid message
   * @throws {SystemError} When git binary is not available
   */
  async commitChanges(message: string): Promise<void> {
    if (message.trim().length === 0) {
      throw new UserError(
        'Commit message cannot be empty',
        'Provide a valid commit message'
      );
    }

    try {
      await execa('git', ['commit', '-m', message], {
        cwd: this.workingDirectory,
      });
    } catch (error) {
      throw this.wrapGitError(error, 'Failed to commit changes');
    }
  }

  /**
   * Wraps git command errors into appropriate domain error types.
   * @param error - The error from git command execution
   * @param defaultMessage - Default error message for unknown errors
   * @returns AppError instance with appropriate type and remediation
   */
  private wrapGitError(
    error: unknown,
    defaultMessage: string
  ): UserError | SystemError {
    if (error instanceof Error) {
      const specificError = this.getSpecificGitError(error);
      if (specificError !== null) return specificError;
    }

    return this.createDefaultError(error, defaultMessage);
  }

  /**
   * Creates a default error for unknown git errors.
   * @param error - The original error
   * @param defaultMessage - Default error message
   * @returns SystemError for unknown git errors
   */
  private createDefaultError(
    error: unknown,
    defaultMessage: string
  ): SystemError {
    return new SystemError(
      defaultMessage,
      error instanceof Error ? error.message : String(error)
    );
  }

  /**
   * Maps specific git error conditions to appropriate domain error types.
   * @param error - The git command error
   * @returns AppError instance or null if no specific mapping exists
   */
  private getSpecificGitError(error: Error): UserError | SystemError | null {
    if (this.isNotGitRepositoryError(error)) {
      return new UserError('Not a git repository', 'Initialize with: git init');
    }
    if (this.isGitNotFoundError(error)) {
      return new SystemError(
        'Git not found',
        'Install Git: https://git-scm.com/downloads'
      );
    }
    if (this.isNoStagedChangesError(error)) {
      return new UserError(
        'No staged changes',
        'Stage changes with: git add <files>'
      );
    }

    return null;
  }

  /**
   * Checks if error indicates not a git repository.
   * @param error - The error to check
   * @returns True if error indicates not a git repository
   */
  private isNotGitRepositoryError(error: Error): boolean {
    return (
      error.message.includes('not a git repository') ||
      error.message.includes('fatal: not a git repository') ||
      error.message.includes('not in a git repository')
    );
  }

  /**
   * Checks if error indicates git binary not found.
   * @param error - The error to check
   * @returns True if error indicates git binary not found
   */
  private isGitNotFoundError(error: Error): boolean {
    return (
      error.message.includes('ENOENT') ||
      error.message.includes('command not found') ||
      error.message.includes('git: command not found')
    );
  }

  /**
   * Checks if error indicates no staged changes.
   * @param error - The error to check
   * @returns True if error indicates no staged changes
   */
  private isNoStagedChangesError(error: Error): boolean {
    return (
      error.message.includes('nothing to commit') ||
      error.message.includes('no changes added to commit') ||
      error.message.includes('no staged changes')
    );
  }
}
