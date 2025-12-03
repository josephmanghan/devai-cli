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

/**
 * Configuration for creating and using custom Ollama models.
 * Extends GenerationOptions with model creation metadata.
 */
export interface OllamaModelConfig extends GenerationOptions {
  /**
   * Base model identifier to create the custom model from.
   */
  readonly baseModel: string;

  /**
   * System prompt to be baked into the custom model.
   */
  readonly systemPrompt: string;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

/**
 * Progress update interface for async streaming operations.
 * Used by headless adapters to communicate progress without UI dependencies.
 */
export interface ProgressUpdate {
  /**
   * Status message describing the current operation.
   */
  status: string;

  /**
   * Current progress count (optional).
   */
  current?: number;

  /**
   * Total count for progress calculation (optional).
   */
  total?: number;
}
