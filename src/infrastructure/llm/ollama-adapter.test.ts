import type { Ollama } from 'ollama';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { SystemError, UserError,ValidationError } from '../../core/types/errors.types.js';
import { OllamaAdapter } from './ollama-adapter.js';

describe('OllamaAdapter', () => {
  let adapter: OllamaAdapter;
  let mockOllamaClient: Ollama;

  beforeEach(() => {
    mockOllamaClient = {
      list: vi.fn(),
      create: vi.fn(),
      generate: vi.fn(),
    } as unknown as Ollama;

    adapter = new OllamaAdapter(mockOllamaClient);
  });

  describe('checkConnection', () => {
    it('returns true when Ollama daemon is running', async () => {
      vi.mocked(mockOllamaClient.list).mockResolvedValue({ models: [] });

      const result = await adapter.checkConnection();

      expect(result).toBe(true);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });

    it('returns false when Ollama daemon is not running', async () => {
      const connectionError = new Error('ECONNREFUSED');
      vi.mocked(mockOllamaClient.list).mockRejectedValue(connectionError);

      const result = await adapter.checkConnection();

      expect(result).toBe(false);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkModel', () => {
    it('returns true when model exists in available models', async () => {
      const mockModels = {
        models: [
          { name: 'llama2', modified_at: '2023-08-15T10:00:00Z', size: 1234567890 },
          { name: 'custom-model', modified_at: '2023-08-15T10:00:00Z', size: 1234567890 },
        ],
      };
      vi.mocked(mockOllamaClient.list).mockResolvedValue(mockModels);

      const result = await adapter.checkModel('custom-model');

      expect(result).toBe(true);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });

    it('returns false when model does not exist', async () => {
      const mockModels = {
        models: [
          { name: 'llama2', modified_at: '2023-08-15T10:00:00Z', size: 1234567890 },
        ],
      };
      vi.mocked(mockOllamaClient.list).mockResolvedValue(mockModels);

      const result = await adapter.checkModel('missing-model');

      expect(result).toBe(false);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });

    it('throws SystemError when Ollama daemon is not running', async () => {
      const connectionError = new Error('ECONNREFUSED');
      vi.mocked(mockOllamaClient.list).mockRejectedValue(connectionError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(SystemError);
    });

    it('throws UserError when model not found with 404 error', async () => {
      const notFoundError = new Error('404 - Model not found');
      vi.mocked(mockOllamaClient.list).mockRejectedValue(notFoundError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(UserError);
    });

    it('throws SystemError when request times out', async () => {
      const timeoutError = new Error('Request timeout');
      vi.mocked(mockOllamaClient.list).mockRejectedValue(timeoutError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(SystemError);
    });
  });

  describe('createModel', () => {
    it('creates model successfully', async () => {
      const mockResponse = { status: 'success' };
      vi.mocked(mockOllamaClient.create).mockResolvedValue(mockResponse);

      await expect(adapter.createModel('test-model', 'FROM base\nSYSTEM custom system')).resolves.not.toThrow();

      expect(mockOllamaClient.create).toHaveBeenCalledWith({
        model: 'test-model',
        stream: false,
      });
    });

    it('throws ValidationError when model creation fails', async () => {
      const createError = new Error('Invalid model definition');
      vi.mocked(mockOllamaClient.create).mockRejectedValue(createError);

      await expect(adapter.createModel('test-model', 'invalid')).rejects.toThrow(ValidationError);
    });

    it('throws SystemError when daemon is unavailable during creation', async () => {
      const connectionError = new Error('ECONNREFUSED');
      vi.mocked(mockOllamaClient.create).mockRejectedValue(connectionError);

      await expect(adapter.createModel('test-model', 'FROM base')).rejects.toThrow(SystemError);
    });
  });

  describe('generate', () => {
    const mockOptions = {
      model: 'llama2',
      temperature: 0.2,
      num_ctx: 131072,
      keep_alive: 0,
    };

    it('generates text successfully', async () => {
      const mockResponse = {
        response: '  Generated text response  ',
        done: true,
        context: [1, 2, 3],
      };
      vi.mocked(mockOllamaClient.generate).mockResolvedValue(mockResponse);

      const result = await adapter.generate('Test prompt', mockOptions);

      expect(result).toBe('Generated text response');
      expect(mockOllamaClient.generate).toHaveBeenCalledWith({
        model: 'llama2',
        prompt: 'Test prompt',
        keep_alive: 0,
        options: {
          temperature: 0.2,
          num_ctx: 131072,
        },
      });
    });

    it('handles undefined optional parameters', async () => {
      const mockResponse = {
        response: 'Response',
        done: true,
      };
      vi.mocked(mockOllamaClient.generate).mockResolvedValue(mockResponse);

      const minimalOptions = { model: 'llama2' };
      const result = await adapter.generate('Test prompt', minimalOptions);

      expect(result).toBe('Response');
      expect(mockOllamaClient.generate).toHaveBeenCalledWith({
        model: 'llama2',
        prompt: 'Test prompt',
        keep_alive: undefined,
        options: {
          temperature: undefined,
          num_ctx: undefined,
        },
      });
    });

    it('throws SystemError when generation fails', async () => {
      const generateError = new Error('Generation failed');
      vi.mocked(mockOllamaClient.generate).mockRejectedValue(generateError);

      await expect(adapter.generate('Test prompt', mockOptions)).rejects.toThrow(SystemError);
    });

    it('throws UserError when model not found during generation', async () => {
      const notFoundError = new Error('404 - Model not found');
      vi.mocked(mockOllamaClient.generate).mockRejectedValue(notFoundError);

      await expect(adapter.generate('Test prompt', mockOptions)).rejects.toThrow(UserError);
    });
  });

  describe('error handling', () => {
    it('wraps unknown errors as SystemError by default', async () => {
      vi.mocked(mockOllamaClient.list).mockRejectedValue('Unknown error');

      await expect(adapter.checkModel('test')).rejects.toThrow(SystemError);
    });

    it('preserves error message in wrapped errors', async () => {
      const originalError = new Error('Custom error message');
      vi.mocked(mockOllamaClient.list).mockRejectedValue(originalError);

      try {
        await adapter.checkModel('test');
      } catch (error) {
        expect(error).toBeInstanceOf(SystemError);
        expect((error as SystemError).message).toBe('Failed to check model existence');
      }
    });
  });
});