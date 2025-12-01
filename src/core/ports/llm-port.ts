import { GenerationOptions } from '../types/llm-types.js';

/**
 * Defines the contract for Large Language Model provider operations.
 * Isolates core business logic from external service implementations.
 */
export interface LlmPort {
  /**
   * Verify service availability and connectivity.
   *
   * @returns Promise that resolves to true if service is accessible, false otherwise
   */
  checkConnection(): Promise<boolean>;

  /**
   * Verify model availability in the local registry.
   *
   * @param modelName - Model identifier to verify
   * @returns Promise that resolves to true if model exists locally, false otherwise
   * @throws {ValidationError} When modelName is invalid or empty
   */
  checkModel(modelName: string): Promise<boolean>;

  /**
   * Create a custom model instance from constructor-injected configuration.
   *
   * @param modelName - Name for the custom model instance
   * @returns Promise that resolves when model creation is complete
   * @throws {SystemError} When service is unavailable during creation
   */
  createModel(modelName: string): Promise<void>;

  /**
   * Download (pull) a model from the remote registry to local storage.
   * Returns raw progress stream data without any UI components.
   *
   * @param modelName - Model identifier to download (e.g., 'qwen2.5-coder:1.5b')
   * @returns Promise that resolves when download is complete
   * @throws {SystemError} When service is unavailable during download
   * @throws {ValidationError} When modelName is invalid or empty
   */
  pullModel(modelName: string): Promise<void>;

  /**
   * Generate text using specified model and parameters.
   *
   * @param prompt - Input text and context for generation
   * @param options - Configuration parameters for generation behavior
   * @returns Promise that resolves to the generated text
   * @throws {ValidationError} When prompt is empty or options are invalid
   * @throws {SystemError} When model is unavailable or generation fails
   */
  generate(prompt: string, options: GenerationOptions): Promise<string>;
}
