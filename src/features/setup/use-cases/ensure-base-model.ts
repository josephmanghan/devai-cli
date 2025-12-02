import {
  BaseModelResult,
  LlmPort,
  ProgressUpdate,
  SystemError,
} from '../../../core/index.js';

/**
 * Ensures base model exists, auto-pulling if necessary.
 * Single responsibility: Validate and provision base model availability.
 * Yields progress updates for UI rendering.
 */
export class EnsureBaseModel {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly modelName: string
  ) {}

  /**
   * Executes base model provisioning as an async generator.
   * Yields progress updates and returns result status.
   *
   * @yields {ProgressUpdate} Progress events during pull
   * @returns {BaseModelResult} Status of base model (existed or pulled)
   * @throws {SystemError} When model validation or pull fails
   */
  async *execute(): AsyncGenerator<ProgressUpdate, BaseModelResult> {
    const baseModelExists = await this.llmPort.checkModel(this.modelName);

    if (baseModelExists) {
      return { existed: true };
    }

    const stream = this.llmPort.pullModel(this.modelName);

    try {
      for await (const progress of stream) {
        yield progress;
      }
    } catch (error) {
      this.handlePullError(error);
    }

    return { existed: false, pulled: true };
  }

  /**
   * Handles pull errors and throws appropriate exceptions.
   */
  private handlePullError(error: unknown): never {
    if (error instanceof SystemError) {
      throw error;
    }

    const manualPullCommand = `ollama pull ${this.modelName}`;
    throw new SystemError(
      `Failed to auto-pull '${this.modelName}'`,
      `Try manually: ${manualPullCommand}\n\nCheck network connection and Ollama daemon status.`
    );
  }
}
