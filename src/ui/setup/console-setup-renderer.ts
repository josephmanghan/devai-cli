import ora, { type Ora } from 'ora';

import { SetupUiPort } from '../../core/ports/setup-ui-port.js';
import type { OllamaModelConfig } from '../../core/types/llm-types.js';
import type { ProgressUpdate } from '../../core/types/ui.types.js';

/**
 * Console implementation of the SetupUiPort interface.
 * Handles all visual output using ora spinners and console methods.
 */
export class ConsoleSetupRenderer implements SetupUiPort {
  private activeSpinner: Ora | null = null;

  /**
   * Display introductory message for setup process.
   */
  showIntro(): void {
    console.log('🔧 Configuring Ollama integration...\n');
  }

  /**
   * Display completion message with configuration details.
   * @param config - The final model configuration
   */
  showOutro(config: OllamaModelConfig): void {
    console.log('\n✅ Setup complete!');
    console.log('\nModels configured:');
    console.log(`  • Base model: ${config.baseModel}`);
    console.log(`  • Custom model: ${config.model}`);
    console.log('\n🚀 Ready to generate commits:');
    console.log('  ollatool commit');
  }

  /**
   * Signal start of a validation check.
   * @param step - Type of check being performed
   * @param details - Optional additional context
   */
  onCheckStarted(
    step: 'daemon' | 'base-model' | 'custom-model',
    details?: string
  ): void {
    const message = this.getCheckStartedMessage(step, details);
    this.activeSpinner = ora(message).start();
  }

  private getCheckStartedMessage(
    step: 'daemon' | 'base-model' | 'custom-model',
    details?: string
  ): string {
    switch (step) {
      case 'daemon':
        return 'Checking Ollama daemon...';
      case 'base-model':
        return details ?? 'Checking base model...';
      case 'custom-model':
        return details ?? 'Checking custom model...';
    }
  }

  /**
   * Signal successful completion of a validation check.
   * @param step - Type of check that succeeded
   * @param message - Optional success message
   */
  onCheckSuccess(
    step: 'daemon' | 'base-model' | 'custom-model',
    message?: string
  ): void {
    if (this.activeSpinner === null) return;

    const successMessage = message ?? this.getDefaultSuccessMessage(step);
    this.activeSpinner.succeed(successMessage);
    this.activeSpinner = null;
  }

  /**
   * Signal failure of a validation check.
   * @param step - Type of check that failed
   * @param error - The error that occurred
   */
  onCheckFailure(
    step: 'daemon' | 'base-model' | 'custom-model',
    error: Error
  ): void {
    if (this.activeSpinner === null) return;

    const failureMessage =
      error.message.length > 0
        ? error.message
        : this.getDefaultFailureMessage(step);

    this.activeSpinner.fail(failureMessage);
    this.activeSpinner = null;
  }

  /**
   * Handle progress updates from async operations.
   * Updates the active spinner text with progress information.
   * @param progress - Current progress information
   */
  onProgress(progress: ProgressUpdate): void {
    if (this.activeSpinner === null) return;

    const message = this.buildProgressMessage(progress);
    this.activeSpinner.text = message;
  }

  private buildProgressMessage(progress: ProgressUpdate): string {
    if (progress.current !== undefined && progress.total !== undefined) {
      return `${progress.status} (${progress.current}/${progress.total})`;
    }
    return progress.status;
  }

  /**
   * Show warning for missing base model.
   */
  showBaseModelMissingWarning(baseModel: string): void {
    if (this.activeSpinner !== null) {
      this.activeSpinner.warn(
        `Base model '${baseModel}' not found - will auto-pull`
      );
      this.activeSpinner = null;
    }
  }

  /**
   * Show pull start message.
   */
  showPullStartMessage(): void {
    console.log('\n📥 Pulling base model. This may take a few minutes...');
    console.log('   Press Ctrl+C to exit if needed\n');
  }

  /**
   * Start pull spinner with specified model name.
   */
  startPullSpinner(modelName: string): void {
    this.activeSpinner = ora(`Pulling ${modelName}...`).start();
  }

  private getDefaultSuccessMessage(step: string): string {
    switch (step) {
      case 'daemon':
        return 'Ollama daemon is running';
      default:
        return `${step} check completed`;
    }
  }

  private getDefaultFailureMessage(step: string): string {
    switch (step) {
      case 'daemon':
        return 'Ollama daemon not running';
      case 'base-model':
        return 'Failed to check base model';
      case 'custom-model':
        return 'Failed to create custom model';
      default:
        return `${step} failed`;
    }
  }
}
