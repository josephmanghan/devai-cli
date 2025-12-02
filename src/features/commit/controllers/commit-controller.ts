/* eslint-disable n/no-process-exit */
import { Command } from 'commander';

import {
  CommitAction,
  CommitUiPort,
  EditorPort,
  GitPort,
  SystemError,
  UserError,
  ValidationError,
} from '../../../core/index.js';
import { GenerateCommit, ValidatePreconditions } from '../index.js';

export class CommitController {
  constructor(
    private readonly gitPort: GitPort,
    private readonly editorPort: EditorPort,
    private readonly ui: CommitUiPort,
    private readonly validatePreconditions: ValidatePreconditions,
    private readonly generateCommit: GenerateCommit
  ) {}

  /**
   * Registers the commit command with the Commander.js program.
   * @param program - The Commander.js program instance
   */
  register(program: Command): void {
    program
      .command('commit')
      .description(
        'Generate a conventional commit message and commit staged changes'
      )
      .action(async () => {
        await this.execute();
      });
  }

  /**
   * Executes the commit workflow orchestration.
   */
  async execute(): Promise<void> {
    try {
      const context = await this.validatePreconditions.execute();

      const commitType = await this.ui.selectCommitType();

      const generatedMessage = await this.generateCommit.execute({
        diff: context.diff,
        status: context.branch,
        commitType,
      });

      await this.ui.previewMessage(generatedMessage);

      const action = await this.ui.selectCommitAction();

      await this.handleCommitAction(action, generatedMessage);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async handleCommitAction(
    action: CommitAction,
    message: string
  ): Promise<void> {
    const actionHandler = this.getActionHandler(action);
    await actionHandler(message);
  }

  private getActionHandler(
    action: CommitAction
  ): (message: string) => Promise<void> {
    switch (action) {
      case CommitAction.APPROVE:
        return async (msg: string) => await this.gitPort.commitChanges(msg);

      case CommitAction.EDIT:
        return async (msg: string) => await this.handleEditAction(msg);

      case CommitAction.REGENERATE:
        return async () => await this.execute();

      case CommitAction.CANCEL:
        return async () => process.exit(0);

      default:
        throw new ValidationError('Invalid commit action selected');
    }
  }

  private async handleEditAction(message: string): Promise<void> {
    const editedMessage = await this.editorPort.edit(message);
    await this.gitPort.commitChanges(editedMessage);
  }

  private handleError(error: unknown): never {
    if (this.isAppError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw new SystemError(
        'Unexpected error occurred',
        this.getErrorMessage(error)
      );
    }

    throw new SystemError('Unknown error occurred', this.getErrorString(error));
  }

  private isAppError(
    error: unknown
  ): error is UserError | SystemError | ValidationError {
    return (
      error instanceof UserError ||
      error instanceof SystemError ||
      error instanceof ValidationError
    );
  }

  private getErrorMessage(error: Error): string {
    return error.message !== '' ? error.message : 'No error details available';
  }

  private getErrorString(error: unknown): string {
    const errorString = String(error);
    return errorString !== '' ? errorString : 'Unknown error type';
  }
}
