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

/**
 * Controller for the commit workflow
 */
export class CommitController {
  private stageAll = false;

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
        const options = program.opts();
        await this.execute(options.all);
      });
  }

  /**
   * Executes the commit workflow orchestration.
   */
  async execute(stageAll = false): Promise<void> {
    try {
      this.stageAll = stageAll;

      if (stageAll) {
        await this.gitPort.stageAllChanges();
      }

      const context = await this.validatePreconditions.execute();

      const commitType = await this.ui.selectCommitType();

      const generatedMessage = await this.generateMessageWithSpinner(
        context.diff,
        context.branch,
        commitType
      );

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
        return async () => await this.execute(this.stageAll);

      case CommitAction.PROVIDE_PROMPT:
        return async (msg: string) => await this.handleProvidePromptAction(msg);

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

  private async handleProvidePromptAction(
    currentMessage: string
  ): Promise<void> {
    try {
      const newMessage = await this.generateNewMessageWithUserPrompt();
      await this.continueWorkflowWithMessage(newMessage);
    } catch {
      await this.continueWorkflowWithMessage(currentMessage);
    }
  }

  private async generateNewMessageWithUserPrompt(): Promise<string> {
    const userPrompt = await this.ui.captureUserPrompt();
    const context = await this.validatePreconditions.execute();
    const commitType = await this.ui.selectCommitType();

    return await this.generateMessageWithUserPrompt(
      context.diff,
      context.branch,
      commitType,
      userPrompt
    );
  }

  private async continueWorkflowWithMessage(message: string): Promise<void> {
    await this.ui.previewMessage(message);
    const action = await this.ui.selectCommitAction();
    await this.handleCommitAction(action, message);
  }

  private async generateMessageWithUserPrompt(
    diff: string,
    status: string,
    commitType: string,
    userPrompt: string
  ): Promise<string> {
    return await this.withSpinner(
      'Generating commit message with your context...',
      async () => {
        return await this.generateCommit.execute({
          diff,
          status,
          commitType,
          userPrompt,
        });
      }
    );
  }

  private async withSpinner<T>(
    message: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.ui.startThinking(message);
    try {
      const result = await operation();
      this.ui.stopThinking();
      return result;
    } catch (error) {
      this.ui.stopThinking();
      throw error;
    }
  }

  private async generateMessageWithSpinner(
    diff: string,
    status: string,
    commitType: string
  ): Promise<string> {
    return await this.withSpinner('Generating commit message...', async () => {
      return await this.generateCommit.execute({
        diff,
        status,
        commitType,
      });
    });
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
