import {
  CommitContext,
  GitPort,
  LlmPort,
  SystemError,
  UserError,
} from '../../../core/index.js';

/**
 * Validates all prerequisites before starting expensive AI generation.
 * Implements sequential validation chain to provide fast, clear feedback.
 */
export class ValidatePreconditions {
  constructor(
    private readonly gitPort: GitPort,
    private readonly llmPort: LlmPort
  ) {}

  /**
   * Executes sequential validation of all prerequisites.
   *
   * @returns Promise<CommitContext> containing staged diff and branch name
   * @throws {SystemError} When Ollama daemon is not running (exit code 3)
   * @throws {UserError} When current directory is not a git repository (exit code 2)
   * @throws {UserError} When no staged changes exist (exit code 2)
   */
  async execute(): Promise<CommitContext> {
    await this.validateDaemonConnection();
    await this.validateGitRepository();
    const stagedDiff = await this.validateStagedChanges();
    const branchName = await this.gitPort.getBranchName();

    return { diff: stagedDiff, branch: branchName };
  }

  /**
   * Validates Ollama daemon connectivity.
   */
  private async validateDaemonConnection(): Promise<void> {
    const isDaemonConnected = await this.llmPort.checkConnection();
    if (!isDaemonConnected) {
      throw new SystemError(
        'Ollama daemon is not running or accessible',
        'Start the Ollama daemon and ensure it is accepting connections'
      );
    }
  }

  /**
   * Validates that current directory is a git repository.
   */
  private async validateGitRepository(): Promise<void> {
    const isGitRepo = await this.gitPort.isGitRepository();
    if (!isGitRepo) {
      throw new UserError(
        'Current directory is not a git repository',
        'Navigate to a git repository or initialize one with `git init`'
      );
    }
  }

  /**
   * Validates that staged changes exist and returns the diff.
   */
  private async validateStagedChanges(): Promise<string> {
    const stagedDiff = await this.gitPort.getStagedDiff();
    if (stagedDiff.trim() === '') {
      throw new UserError(
        'No staged changes found',
        'Stage changes using `git add <files>` or `git add .` before running this command'
      );
    }
    return stagedDiff;
  }
}
