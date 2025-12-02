import {
  CustomModelResult,
  LlmPort,
  OllamaModelConfig,
  ProgressUpdate,
  SystemError,
} from '../../../core/index.js';

/**
 * Provisions custom model for commit generation.
 * Single responsibility: Validate and create custom model if needed.
 * Yields progress updates for UI rendering.
 */
export class ProvisionCustomModel {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly modelConfig: OllamaModelConfig
  ) {}

  /**
   * Executes custom model provisioning as an async generator.
   * Yields progress updates and returns result status.
   *
   * @yields {ProgressUpdate} Progress events during creation
   * @returns {CustomModelResult} Status of custom model (existed or created)
   * @throws {SystemError} When model creation fails
   */
  async *execute(): AsyncGenerator<ProgressUpdate, CustomModelResult> {
    const customModelExists = await this.llmPort.checkModel(
      this.modelConfig.model
    );

    if (customModelExists) {
      await this.llmPort.deleteModel(this.modelConfig.model);
    }

    const stream = this.llmPort.createModel(this.modelConfig.model);

    try {
      for await (const progress of stream) {
        yield progress;
      }
    } catch (error) {
      this.handleCreationError(error);
    }

    return { existed: customModelExists, created: true };
  }

  /**
   * Handles creation errors and throws appropriate exceptions.
   */
  private handleCreationError(error: unknown): never {
    if (error instanceof SystemError) {
      throw error;
    }

    throw new SystemError(
      'Failed to provision custom model',
      'Check base model availability'
    );
  }
}
