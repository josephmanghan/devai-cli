import type { Ollama } from 'ollama';

import { LlmPort } from '../../core/ports/llm-port.js';
import { AppError, SystemError, UserError,ValidationError } from '../../core/types/errors.types.js';
import type { GenerationOptions } from '../../core/types/llm-types.js';

/**
 * Ollama implementation of the LLM port interface.
 * Provides model operations using the official Ollama SDK.
 */
export class OllamaAdapter implements LlmPort {
  constructor(private readonly ollamaClient: Ollama) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.ollamaClient.list();
      return true;
    } catch {
      return false;
    }
  }

  async checkModel(modelName: string): Promise<boolean> {
    try {
      const models = await this.ollamaClient.list();
      return models.models.some(model => model.name === modelName);
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to check model existence');
    }
  }

  async createModel(modelName: string, _modelDefinition: string): Promise<void> {
    try {
      await this.ollamaClient.create({
        model: modelName,
        stream: false,
      });
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to create model', 'validation');
    }
  }

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

  private wrapOllamaError(error: unknown, defaultMessage: string, defaultType?: 'system' | 'validation' | 'user'): AppError {
    if (error instanceof Error) {
      const specificError = this.getSpecificOllamaError(error);
      if (specificError !== null) return specificError;
    }

    const ERROR_CLASS = defaultType === 'validation' ? ValidationError :
                        defaultType === 'user' ? UserError : SystemError;
    return new ERROR_CLASS(defaultMessage, error instanceof Error ? error.message : String(error));
  }

  private getSpecificOllamaError(error: Error): AppError | null {
    if (this.isConnectionError(error)) {
      return new SystemError('Ollama daemon not running', 'Start Ollama: ollama serve');
    }
    if (this.isNotFoundError(error)) {
      return new UserError('Model not found', 'Pull the model: ollama pull <model-name>');
    }
    if (this.isTimeoutError(error)) {
      return new SystemError('Ollama request timeout', 'Check Ollama status and network connectivity');
    }
    return null;
  }

  private isConnectionError(error: Error): boolean {
    return error.message.includes('ECONNREFUSED') || error.message.includes('connect');
  }

  private isNotFoundError(error: Error): boolean {
    return error.message.includes('404') || error.message.includes('not found');
  }

  private isTimeoutError(error: Error): boolean {
    return error.message.includes('timeout') || error.message.includes('TIMEOUT');
  }
}