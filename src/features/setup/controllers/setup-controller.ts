import { Command } from 'commander';

import {
  AppError,
  BaseModelResult,
  OllamaModelConfig,
  ProgressUpdate,
  SetupUiPort,
  SystemError,
} from '../../../core/index.js';
import {
  EnsureBaseModel,
  ProvisionCustomModel,
  ValidateOllamaConnection,
} from '../use-cases/index.js';

/**
 * Primary adapter for the `devai-cli setup` command.
 * Orchestrates environment validation and model provisioning workflow.
 * Delegates business logic to use cases and handles UI interactions.
 */
export class SetupController {
  constructor(
    private readonly modelConfig: OllamaModelConfig,
    private readonly validateConnection: ValidateOllamaConnection,
    private readonly ensureBaseModel: EnsureBaseModel,
    private readonly provisionCustomModel: ProvisionCustomModel,
    private readonly ui: SetupUiPort
  ) {}

  /**
   * Registers the setup command with the Commander.js program.
   * @param program - The Commander.js program instance
   */
  register(program: Command): void {
    program
      .command('setup')
      .description('Configure Ollama integration and provision custom model')
      .action(async () => {
        await this.execute();
      });
  }

  /**
   * Executes the setup command workflow orchestration.
   */
  private async execute(): Promise<void> {
    try {
      this.ui.showIntro();

      this.ui.onCheckStarted('daemon');
      await this.validateConnection.execute();
      this.ui.onCheckSuccess('daemon');

      await this.executeBaseModelStep();

      await this.executeCustomModelStep();

      this.ui.showOutro(this.modelConfig);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Executes base model provisioning step with progress handling.
   */
  private async executeBaseModelStep(): Promise<void> {
    this.ui.onCheckStarted(
      'base-model',
      `Checking base model (${this.modelConfig.baseModel})...`
    );

    try {
      const baseResult = await this.runBaseModelProvisioning();
      if (baseResult.existed !== true) {
        this.showBaseModelMissingUI();
      } else {
        this.ui.onCheckSuccess(
          'base-model',
          `Base model '${this.modelConfig.baseModel}' available`
        );
      }
    } catch (error) {
      this.handleStepError('base-model', error);
    }
  }

  /**
   * Shows UI for missing base model.
   */
  private showBaseModelMissingUI(): void {
    this.ui.showBaseModelMissingWarning(this.modelConfig.baseModel);
    this.ui.showPullStartMessage();
    this.ui.startPullSpinner(this.modelConfig.baseModel);
    this.ui.onCheckSuccess(
      'base-model',
      `Base model '${this.modelConfig.baseModel}' available`
    );
  }

  /**
   * Runs base model provisioning and streams progress.
   */
  private async runBaseModelProvisioning(): Promise<BaseModelResult> {
    const generator = this.ensureBaseModel.execute();
    let result = await generator.next();

    while (result.done === false) {
      const progress = result.value as ProgressUpdate;
      this.ui.onProgress(progress);
      result = await generator.next();
    }

    // When done is true, value contains BaseModelResult
    const baseResult = result.value as BaseModelResult;
    if (baseResult === undefined) {
      throw new SystemError('Invalid provisioning result', 'Please try again');
    }
    return baseResult;
  }

  /**
   * Executes custom model provisioning step with progress handling.
   */
  private async executeCustomModelStep(): Promise<void> {
    this.ui.onCheckStarted(
      'custom-model',
      `Checking custom model (${this.modelConfig.model})...`
    );

    try {
      await this.runCustomModelProvisioning();
      this.ui.onCheckSuccess(
        'custom-model',
        `Custom model '${this.modelConfig.model}' ready`
      );
    } catch (error) {
      this.handleStepError('custom-model', error);
    }
  }

  /**
   * Runs custom model provisioning and streams progress.
   */
  private async runCustomModelProvisioning(): Promise<void> {
    const generator = this.provisionCustomModel.execute();
    let result = await generator.next();

    while (result.done === false) {
      const progress = result.value as ProgressUpdate;
      this.ui.onProgress(progress);
      result = await generator.next();
    }
  }

  /**
   * Handles errors for a provisioning step.
   */
  private handleStepError(
    step: 'daemon' | 'base-model' | 'custom-model',
    error: unknown
  ): never {
    if (error instanceof AppError) {
      this.ui.onCheckFailure(step, error);
      throw error;
    }

    const systemError = new SystemError(
      `Failed during ${step} provisioning`,
      'Check configuration and try again'
    );
    this.ui.onCheckFailure(step, systemError);
    throw systemError;
  }

  /**
   * Handles errors and rethrows them for proper exit code handling.
   */
  private handleError(error: unknown): never {
    if (this.isAppError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw new SystemError(
        'Unexpected error occurred during setup',
        this.getErrorMessage(error)
      );
    }

    throw new SystemError(
      'Unknown error during setup',
      this.getErrorString(error)
    );
  }

  /**
   * Type guard for AppError instances.
   */
  private isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Safely extracts error message.
   */
  private getErrorMessage(error: Error): string {
    const message = error.message;
    return message.length > 0 ? message : 'No error details available';
  }

  /**
   * Safely converts unknown error to string.
   */
  private getErrorString(error: unknown): string {
    const errorString = String(error);
    return errorString.length > 0 ? errorString : 'Unknown error type';
  }
}
