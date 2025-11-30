/**
 * Large Language Model related types and interfaces.
 * Shared across the core domain for LLM operations.
 */

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