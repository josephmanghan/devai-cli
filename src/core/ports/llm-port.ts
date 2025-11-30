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
   * Create a custom model instance from configuration.
   *
   * @param modelName - Name for the custom model instance
   * @param modelDefinition - Complete model configuration definition
   * @returns Promise that resolves when model creation is complete
   * @throws {ValidationError} When modelDefinition is malformed or invalid
   * @throws {SystemError} When service is unavailable during creation
   */
  createModel(modelName: string, modelDefinition: string): Promise<void>;

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

/**
 * Configuration parameters for text generation.
 * Controls model behavior, output characteristics, and resource management.
 */
export interface GenerationOptions {
  /**
   * Model identifier to use for generation.
   */
  model: string;

  /**
   * Controls randomness in output (optional).
   * Range: 0.0-1.0, where lower values produce more deterministic responses.
   */
  temperature?: number;

  /**
   * Maximum context window size for generation (optional).
   * Controls how much of the prompt context the model considers.
   */
  num_ctx?: number;

  /**
   * Model memory retention duration in time units (optional).
   * Controls how long the model stays loaded in memory after generation.
   */
  keep_alive?: number;
}
