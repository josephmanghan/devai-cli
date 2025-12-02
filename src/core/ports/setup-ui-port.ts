import { OllamaModelConfig, ProgressUpdate } from '../types/index.js';

/**
 * UI port for setup operations.
 * Decouples feature logic from console/visual implementation details.
 */
export interface SetupUiPort {
  /**
   * Display introductory message for setup process.
   */
  showIntro(): void;

  /**
   * Display completion message with configuration details.
   * @param config - The final model configuration
   */
  showOutro(config: OllamaModelConfig): void;

  /**
   * Signal start of a validation check.
   * @param step - Type of check being performed
   * @param details - Optional additional context
   */
  onCheckStarted(
    step: 'daemon' | 'base-model' | 'custom-model',
    details?: string
  ): void;

  /**
   * Signal successful completion of a validation check.
   * @param step - Type of check that succeeded
   * @param message - Optional success message
   */
  onCheckSuccess(
    step: 'daemon' | 'base-model' | 'custom-model',
    message?: string
  ): void;

  /**
   * Signal failure of a validation check.
   * @param step - Type of check that failed
   * @param error - The error that occurred
   */
  onCheckFailure(
    step: 'daemon' | 'base-model' | 'custom-model',
    error: Error
  ): void;

  /**
   * Handle progress updates from async operations.
   * @param progress - Current progress information
   */
  onProgress(progress: ProgressUpdate): void;

  /**
   * Show warning for missing base model.
   * @param baseModel - The name of the missing base model
   */
  showBaseModelMissingWarning(baseModel: string): void;

  /**
   * Show pull start message.
   */
  showPullStartMessage(): void;

  /**
   * Start pull spinner with specified model name.
   * @param modelName - The name of the model being pulled
   */
  startPullSpinner(modelName: string): void;
}
