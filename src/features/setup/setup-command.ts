import { Command } from 'commander';
import { Ollama } from 'ollama';
import ora, { type Ora } from 'ora';
import type { OllamaModelConfig } from '../../core/types/llm-types.js';
import { AppError, SystemError } from '../../core/types/errors.types.js';
import { OllamaAdapter } from '../../infrastructure/llm/ollama-adapter.js';

// TODO failed to implement /ui pattern. Need to do design research.

/**
 * TODO: Redesign needed - factory violates clean architecture, should use DI injection via application service.
 *
 * `createOllamaAdapter` factory function lives in the features/ layer (setup-command.ts:13-21).
 * This creates a dependency from feature → infrastructure (importing `OllamaAdapter`).
 * Should be: Application service layer handles adapter instantiation, feature layer receives adapter via DI.
 */
export function createOllamaAdapter(config: OllamaModelConfig): OllamaAdapter {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    config.baseModel,
    config.systemPrompt,
    config.parameters
  );
}

/**
 * Command handler for `ollatool setup`.
 * Orchestrates Ollama environment validation and model provisioning.
 */
export class SetupCommand {
  private readonly modelConfig: OllamaModelConfig;
  private readonly adapter: OllamaAdapter;

  // TODO adapterFactor pattern is problematic. This has been done for testing purposes, which is bad.
  constructor(
    modelConfig: OllamaModelConfig,
    adapterFactory?: () => OllamaAdapter
  ) {
    this.modelConfig = modelConfig;
    this.adapter = adapterFactory
      ? adapterFactory()
      : createOllamaAdapter(modelConfig);
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
      this.setupStart();

      await this.validateDaemon(this.adapter);
      await this.validateBaseModel(this.adapter);
      await this.provisionCustomModel(this.adapter);

      this.setupSuccess();
    } catch (error) {
      this.handleError(error);
    }
  }

  private setupStart(): void {
    console.log('🔧 Configuring Ollama integration...\n');
  }

  private setupSuccess(): void {
    console.log('\n✅ Setup complete!');
    console.log('\nModels configured:');
    console.log(`  • Base model: ${this.modelConfig.baseModel}`);
    console.log(`  • Custom model: ${this.modelConfig.model}`);
    console.log('\n🚀 Ready to generate commits:');
    console.log('  ollatool commit');
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
      `Checking base model (${this.modelConfig.baseModel})...`
    ).start();

    try {
      const baseModelExists = await this.checkBaseModelAvailability(adapter);
      if (baseModelExists) {
        this.handleBaseModelAvailable(spinner);
      } else {
        await this.handleBaseModelMissingAndPull(adapter, spinner);
      }
    } catch (error) {
      this.handleBaseModelError(error, spinner);
    }
  }

  private async handleBaseModelMissingAndPull(
    adapter: OllamaAdapter,
    spinner: Ora
  ): Promise<void> {
    this.handleBaseModelMissing(spinner);
    await this.autoPullBaseModel(adapter, spinner);
  }

  private async checkBaseModelAvailability(
    adapter: OllamaAdapter
  ): Promise<boolean> {
    return await adapter.checkModel(this.modelConfig.baseModel);
  }

  private handleBaseModelAvailable(spinner: Ora): void {
    spinner.succeed(
      `✓ Base model '${this.modelConfig.baseModel}' is available`
    );
  }

  private handleBaseModelMissing(spinner: Ora): void {
    spinner.warn(
      `⚠ Base model '${this.modelConfig.baseModel}' not found - will auto-pull`
    );
  }

  private async autoPullBaseModel(
    adapter: OllamaAdapter,
    spinner: Ora
  ): Promise<void> {
    try {
      this.showPullStartMessage();
      this.startPullSpinner(spinner);

      await adapter.pullModel(this.modelConfig.baseModel);

      this.showPullSuccess(spinner);
    } catch (error) {
      this.showPullFailure(spinner, error);
    }
  }

  private showPullStartMessage(): void {
    console.log('\n📥 Pulling base model. This may take a few minutes...');
    console.log('   Press Ctrl+C to exit if needed\n');
  }

  private startPullSpinner(spinner: Ora): void {
    spinner.text = `Pulling ${this.modelConfig.baseModel}...`;
    spinner.start();
  }

  private showPullSuccess(spinner: Ora): void {
    spinner.succeed(
      `✓ Base model '${this.modelConfig.baseModel}' pulled successfully`
    );
  }

  private showPullFailure(spinner: Ora, error: unknown): never {
    spinner.fail(`✗ Failed to pull '${this.modelConfig.baseModel}'`);
    this.handlePullError(error);
  }

  private handlePullError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    const manualPullCommand = `ollama pull ${this.modelConfig.baseModel}`;

    throw new SystemError(
      `Failed to auto-pull '${this.modelConfig.baseModel}'`,
      `Try manually: ${manualPullCommand}\n\nCheck network connection and Ollama daemon status.`
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
      `Checking custom model (${this.modelConfig.model})...`
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
    const customModelExists = await adapter.checkModel(this.modelConfig.model);

    if (customModelExists) {
      spinner.succeed(
        `✓ Custom model '${this.modelConfig.model}' already exists`
      );
      return;
    }

    await this.createCustomModel(spinner);
  }

  private async createCustomModel(spinner: Ora): Promise<void> {
    spinner.text = `Creating custom model '${this.modelConfig.model}'...`;
    await this.adapter.createModel(this.modelConfig.model);
    spinner.succeed(
      `✓ Custom model '${this.modelConfig.model}' created successfully`
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
