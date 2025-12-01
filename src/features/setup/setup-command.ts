import { Command } from 'commander';

import { LlmPort } from '../../core/ports/llm-port.js';
import { SetupUiPort } from '../../core/ports/setup-ui-port.js';
import { AppError, SystemError } from '../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../core/types/llm-types.js';

// TODO we potentially should re-architect this file, though it is imported

/**
 * Command handler for `ollatool setup`.
 * Orchestrates Ollama environment validation and model provisioning using dependency injection.
 */
export class SetupCommand {
  private readonly modelConfig: OllamaModelConfig;

  constructor(
    modelConfig: OllamaModelConfig,
    private readonly llm: LlmPort,
    private readonly ui: SetupUiPort
  ) {
    this.modelConfig = modelConfig;
  }

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

  private async execute(): Promise<void> {
    try {
      this.ui.showIntro();

      await this.validateDaemon();
      await this.validateBaseModel();
      await this.provisionCustomModel();

      this.ui.showOutro(this.modelConfig);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async validateDaemon(): Promise<void> {
    this.ui.onCheckStarted('daemon');

    try {
      const isRunning = await this.llm.checkConnection();
      await this.handleDaemonCheckResult(isRunning);
    } catch (error) {
      this.handleDaemonCheckError(error);
    }
  }

  private async handleDaemonCheckResult(isRunning: boolean): Promise<void> {
    if (isRunning) {
      this.ui.onCheckSuccess('daemon');
      return;
    }

    const error = new SystemError(
      'Ollama daemon is not running or accessible',
      'Start Ollama: ollama serve\n\nOr install from: https://ollama.com/download'
    );
    this.ui.onCheckFailure('daemon', error);
    throw error;
  }

  private handleDaemonCheckError(error: unknown): never {
    if (error instanceof AppError) {
      this.ui.onCheckFailure('daemon', error);
      throw error;
    }

    const systemError = new SystemError(
      'Failed to check daemon status',
      'Ensure Ollama is properly installed'
    );
    this.ui.onCheckFailure('daemon', systemError);
    throw systemError;
  }

  private async validateBaseModel(): Promise<void> {
    this.ui.onCheckStarted(
      'base-model',
      `Checking base model (${this.modelConfig.baseModel})...`
    );

    try {
      const baseModelExists = await this.llm.checkModel(
        this.modelConfig.baseModel
      );
      await this.handleBaseModelCheckResult(baseModelExists);
    } catch (error) {
      this.handleBaseModelError(error);
    }
  }

  private async handleBaseModelCheckResult(
    baseModelExists: boolean
  ): Promise<void> {
    if (baseModelExists) {
      this.ui.onCheckSuccess(
        'base-model',
        `Base model '${this.modelConfig.baseModel}' is available`
      );
      return;
    }

    await this.handleBaseModelMissingAndPull();
  }

  private async handleBaseModelMissingAndPull(): Promise<void> {
    this.ui.onCheckStarted('base-model');
    this.ui.showBaseModelMissingWarning(this.modelConfig.baseModel);

    try {
      await this.pullBaseModel();
      this.ui.onCheckSuccess(
        'base-model',
        `Base model '${this.modelConfig.baseModel}' pulled successfully`
      );
    } catch (error) {
      this.handlePullError(error);
    }
  }

  private async pullBaseModel(): Promise<void> {
    this.ui.showPullStartMessage();
    this.ui.startPullSpinner(this.modelConfig.baseModel);

    const stream = this.llm.pullModel(this.modelConfig.baseModel);
    for await (const progress of stream) {
      this.ui.onProgress(progress);
    }
  }

  private handlePullError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    const manualPullCommand = `ollama pull ${this.modelConfig.baseModel}`;
    const systemError = new SystemError(
      `Failed to auto-pull '${this.modelConfig.baseModel}'`,
      `Try manually: ${manualPullCommand}\n\nCheck network connection and Ollama daemon status.`
    );

    this.ui.onCheckFailure('base-model', systemError);
    throw systemError;
  }

  private handleBaseModelError(error: unknown): never {
    if (error instanceof AppError) {
      this.ui.onCheckFailure('base-model', error);
      throw error;
    }

    const systemError = new SystemError(
      'Failed to validate base model',
      'Check Ollama daemon status'
    );
    this.ui.onCheckFailure('base-model', systemError);
    throw systemError;
  }

  private async provisionCustomModel(): Promise<void> {
    this.ui.onCheckStarted(
      'custom-model',
      `Checking custom model (${this.modelConfig.model})...`
    );

    try {
      await this.checkAndProvisionCustomModel();
    } catch (error) {
      this.handleCustomModelError(error);
    }
  }

  private async checkAndProvisionCustomModel(): Promise<void> {
    const customModelExists = await this.llm.checkModel(this.modelConfig.model);

    if (customModelExists) {
      this.ui.onCheckSuccess(
        'custom-model',
        `Custom model '${this.modelConfig.model}' already exists`
      );
      return;
    }

    await this.createCustomModel();
  }

  private async createCustomModel(): Promise<void> {
    this.ui.onCheckStarted(
      'custom-model',
      `Creating custom model '${this.modelConfig.model}'...`
    );

    try {
      await this.createAndStreamModel();
      this.ui.onCheckSuccess(
        'custom-model',
        `Custom model '${this.modelConfig.model}' created successfully`
      );
    } catch (error) {
      this.handleCustomModelError(error);
    }
  }

  private async createAndStreamModel(): Promise<void> {
    const stream = this.llm.createModel(this.modelConfig.model);
    for await (const progress of stream) {
      this.ui.onProgress(progress);
    }
  }

  private handleCustomModelError(error: unknown): never {
    if (error instanceof AppError) {
      this.ui.onCheckFailure('custom-model', error);
      throw error;
    }

    const systemError = new SystemError(
      'Failed to provision custom model',
      'Check base model availability'
    );
    this.ui.onCheckFailure('custom-model', systemError);
    throw systemError;
  }

  private handleError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    const systemError = new SystemError(
      'An unexpected error occurred during setup',
      'This may indicate a bug or configuration issue. Please report this issue with the details above.'
    );
    throw systemError;
  }
}
