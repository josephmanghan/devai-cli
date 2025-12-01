/**
 * Setup command for configuring Ollama integration and provisioning custom model.
 * Implements 3-tier validation: daemon → base model → custom model.
 */

import { Command } from 'commander';
import { Ollama } from 'ollama';
import ora, { type Ora } from 'ora';

import {
  AppError,
  SystemError,
  ValidationError,
} from '../../core/types/errors.types.js';
import { CONVENTIONAL_COMMIT_MODEL_CONFIG } from '../../infrastructure/config/conventional-commit-model.config.js';
import { OllamaAdapter } from '../../infrastructure/llm/ollama-adapter.js';
import { SetupUI } from '../../ui/setup.js';

/**
 * Factory function for creating default OllamaAdapter.
 * Centralizes adapter configuration for consistency.
 */
export function createDefaultAdapter(): OllamaAdapter {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel,
    CONVENTIONAL_COMMIT_MODEL_CONFIG.systemPrompt,
    CONVENTIONAL_COMMIT_MODEL_CONFIG.parameters
  );
}

/**
 * Command handler for `ollatool setup`.
 * Orchestrates Ollama environment validation and model provisioning.
 */
export class SetupCommand {
  constructor(
    private readonly adapter: OllamaAdapter = createDefaultAdapter()
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

  private async execute(): Promise<void> {
    try {
      SetupUI.setupStart();

      await this.validateDaemon(this.adapter);
      await this.validateBaseModel(this.adapter);
      await this.provisionCustomModel(this.adapter);

      SetupUI.setupSuccess();
    } catch (error) {
      this.handleError(error);
    }
  }

  private async validateDaemon(adapter: OllamaAdapter): Promise<void> {
    const spinner = ora('Checking Ollama daemon...').start();

    try {
      const isRunning = await adapter.checkConnection();
      this.handleDaemonCheckResult(isRunning, spinner);
    } catch (error) {
      this.handleDaemonCheckError(error, spinner);
    }
  }

  private handleDaemonCheckResult(isRunning: boolean, spinner: Ora): void {
    if (!isRunning) {
      spinner.fail('✗ Ollama daemon not running');
      throw new SystemError(
        'Ollama daemon is not running or accessible',
        'Start Ollama: ollama serve\n\nOr install from: https://ollama.com/download'
      );
    }

    spinner.succeed('✓ Ollama daemon is running');
  }

  private handleDaemonCheckError(error: unknown, spinner: Ora): never {
    if (error instanceof AppError) {
      throw error;
    }
    spinner.fail('✗ Failed to check Ollama daemon');
    throw new SystemError(
      'Failed to check daemon status',
      'Ensure Ollama is properly installed'
    );
  }

  private async validateBaseModel(adapter: OllamaAdapter): Promise<void> {
    const spinner = ora(
      `Checking base model (${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel})...`
    ).start();

    try {
      const baseModelExists = await adapter.checkModel(
        CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel
      );
      this.handleBaseModelResult(baseModelExists, spinner);
    } catch (error) {
      this.handleBaseModelError(error, spinner);
    }
  }

  private handleBaseModelResult(baseModelExists: boolean, spinner: Ora): void {
    if (!baseModelExists) {
      spinner.fail(
        `✗ Base model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}' not found`
      );
      throw new ValidationError(
        `Base model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}' is required`,
        `Pull the base model: ollama pull ${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}`
      );
    }

    spinner.succeed(
      `✓ Base model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}' is available`
    );
  }

  private handleBaseModelError(error: unknown, spinner: Ora): never {
    if (error instanceof AppError) {
      throw error;
    }
    spinner.fail('✗ Failed to check base model');
    throw new SystemError(
      'Failed to validate base model',
      'Check Ollama daemon status'
    );
  }

  private async provisionCustomModel(adapter: OllamaAdapter): Promise<void> {
    const spinner = ora(
      `Checking custom model (${CONVENTIONAL_COMMIT_MODEL_CONFIG.model})...`
    ).start();

    try {
      await this.checkAndProvisionCustomModel(adapter, spinner);
    } catch (error) {
      this.handleCustomModelError(error, spinner);
    }
  }

  private async checkAndProvisionCustomModel(
    adapter: OllamaAdapter,
    spinner: Ora
  ): Promise<void> {
    const customModelExists = await adapter.checkModel(
      CONVENTIONAL_COMMIT_MODEL_CONFIG.model
    );

    if (customModelExists) {
      spinner.succeed(
        `✓ Custom model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.model}' already exists`
      );
      return;
    }

    await this.createCustomModel(spinner);
  }

  private async createCustomModel(spinner: Ora): Promise<void> {
    spinner.text = `Creating custom model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.model}'...`;
    await this.adapter.createModel(CONVENTIONAL_COMMIT_MODEL_CONFIG.model);
    spinner.succeed(
      `✓ Custom model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.model}' created successfully`
    );
  }

  private handleCustomModelError(error: unknown, spinner: Ora): never {
    if (error instanceof AppError) {
      throw error;
    }
    spinner.fail('✗ Failed to create custom model');
    throw new SystemError(
      'Failed to provision custom model',
      'Check base model availability'
    );
  }

  private handleError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    throw new SystemError(
      'An unexpected error occurred during setup',
      'This may indicate a bug or configuration issue. Please report this issue with the details above.'
    );
  }
}
