import type { Ollama } from 'ollama';
import ora from 'ora';

import { LlmPort } from '../../core/ports/llm-port.js';
import {
  AppError,
  SystemError,
  UserError,
} from '../../core/types/errors.types.js';
import type { GenerationOptions } from '../../core/types/llm-types.js';

/**
 * Ollama implementation of the LLM port interface.
 * Provides model operations using the official Ollama SDK.
 */
export class OllamaAdapter implements LlmPort {
  /**
   * Creates a new Ollama adapter instance.
   * @param ollamaClient - The Ollama SDK client instance
   * @param baseModel - Optional base model for custom model creation
   * @param systemPrompt - Optional system prompt for custom model creation
   * @param parameters - Optional model parameters for custom model creation
   */
  constructor(
    private readonly ollamaClient: Ollama,
    private readonly baseModel?: string,
    private readonly systemPrompt?: string,
    private readonly parameters?: Record<string, unknown>
  ) {}

  /**
   * Checks if the Ollama daemon is running and accessible.
   * @returns Promise that resolves to true if connection is successful, false otherwise
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.ollamaClient.list();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a specific model exists in the Ollama instance.
   * @param modelName - The name of the model to check
   * @returns Promise that resolves to true if model exists, false otherwise
   * @throws {AppError} When connection to Ollama fails or model check encounters errors
   */
  async checkModel(modelName: string): Promise<boolean> {
    try {
      const models = await this.ollamaClient.list();
      return models.models.some(model => model.name === modelName);
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to check model existence');
    }
  }

  /**
   * Creates a new model in Ollama using constructor-injected configuration.
   * @param modelName - The name for the new model
   * @throws {AppError} When model creation fails or daemon is unavailable
   */
  async createModel(modelName: string): Promise<void> {
    try {
      if (await this.modelAlreadyExists(modelName)) {
        return;
      }

      await this.executeCreateModel(modelName);
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to create model');
    }
  }

  private async modelAlreadyExists(modelName: string): Promise<boolean> {
    const modelExists = await this.checkModel(modelName);
    if (modelExists) {
      console.log(`✓ Model '${modelName}' already exists, skipping creation`);
      return true;
    }
    return false;
  }

  /**
   * Generates text using the specified model and options.
   * @param prompt - The input prompt for text generation
   * @param options - Generation options including model, temperature, etc.
   * @returns Promise that resolves to the generated text
   * @throws {AppError} When generation fails or model is not available
   */
  async generate(prompt: string, options: GenerationOptions): Promise<string> {
    try {
      const response = await this.callOllamaGenerate(prompt, options);
      return response.response.trim();
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to generate text', 'system');
    }
  }

  private async callOllamaGenerate(prompt: string, options: GenerationOptions) {
    return await this.ollamaClient.generate({
      model: options.model,
      prompt,
      keep_alive: options.keep_alive,
      options: {
        temperature: options.temperature,
        num_ctx: options.num_ctx,
      },
    });
  }

  private wrapOllamaError(
    error: unknown,
    defaultMessage: string,
    defaultType?: 'system' | 'user'
  ): AppError {
    if (error instanceof Error) {
      const specificError = this.getSpecificOllamaError(error);
      if (specificError !== null) return specificError;
    }

    return this.createDefaultError(error, defaultMessage, defaultType);
  }

  private createDefaultError(
    error: unknown,
    defaultMessage: string,
    defaultType?: 'system' | 'user'
  ): AppError {
    const errorClass = getErrorClass(defaultType);
    return new errorClass(
      defaultMessage,
      error instanceof Error ? error.message : String(error)
    );
  }

  private getSpecificOllamaError(error: Error): AppError | null {
    if (this.isConnectionError(error)) return ERROR_MAP.connection();
    if (this.isNotFoundError(error)) return ERROR_MAP.notFound();
    if (this.isTimeoutError(error)) return ERROR_MAP.timeout();

    return null;
  }

  private isConnectionError(error: Error): boolean {
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('connect')
    );
  }

  private isNotFoundError(error: Error): boolean {
    return error.message.includes('404') || error.message.includes('not found');
  }

  private isTimeoutError(error: Error): boolean {
    return (
      error.message.includes('timeout') || error.message.includes('TIMEOUT')
    );
  }

  private async executeCreateModel(modelName: string): Promise<void> {
    const spinner = ora(`Creating model '${modelName}'...`).start();

    try {
      const stream = await this.createModelStream(modelName);
      await this.processCreationStream(stream, spinner);
      spinner.succeed(`✓ Model '${modelName}' created successfully`);
    } catch (error) {
      spinner.fail(`✗ Failed to create model '${modelName}'`);
      throw this.wrapOllamaError(error, 'Failed to create model');
    }
  }

  private async createModelStream(modelName: string) {
    return await this.ollamaClient.create({
      model: modelName,
      from: this.baseModel,
      system: this.systemPrompt,
      parameters: this.parameters,
      stream: true as const,
    });
  }

  private async processCreationStream(
    stream: AsyncIterable<{ status?: string }>,
    spinner: { text: string }
  ): Promise<void> {
    for await (const progress of stream) {
      if (progress.status !== undefined && progress.status.length > 0) {
        spinner.text = progress.status;
      }
    }
  }
}

/**
 * Maps specific Ollama error conditions to appropriate domain error types.
 */
const ERROR_MAP: Record<string, () => AppError> = {
  connection: () =>
    new SystemError('Ollama daemon not running', 'Start Ollama: ollama serve'),
  notFound: () =>
    new UserError(
      'Model not found',
      'Pull the model: ollama pull <model-name>'
    ),
  timeout: () =>
    new SystemError(
      'Ollama request timeout',
      'Check Ollama status and network connectivity'
    ),
};

/**
 * Returns the appropriate error class based on the default error type.
 * @param defaultType - The type of error to return
 * @returns The error class constructor
 */
const getErrorClass = (defaultType?: 'system' | 'user') =>
  defaultType === 'user' ? UserError : SystemError;
