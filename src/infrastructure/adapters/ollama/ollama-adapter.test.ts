import type {
  GenerateResponse,
  ListResponse,
  ModelResponse,
  Ollama,
  ProgressResponse,
} from 'ollama';
import { describe, expect, it, vi } from 'vitest';

import { SystemError, UserError } from '../../../core/types/errors.types.js';
import { OllamaAdapter } from './ollama-adapter.js';

function createMockAsyncIterator(items: ProgressResponse[]) {
  async function* generator() {
    for (const item of items) {
      yield item;
    }
  }

  const iterator = generator();

  return {
    [Symbol.asyncIterator]: () => iterator,
    abort: vi.fn(),
    abortController: new AbortController(),
    itr: iterator,
    doneCallback: vi.fn(),
  };
}

describe('OllamaAdapter', () => {
  const getData = () => {
    const createBaseModel = (
      name: string,
      model: string,
      digest: string
    ): ModelResponse => ({
      name,
      model,
      modified_at: new Date('2023-08-15T10:00:00Z'),
      size: 1234567890,
      digest,
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'llama',
        families: ['llama'],
        parameter_size: '7B',
        quantization_level: 'Q4_0',
      },
      expires_at: new Date('2024-08-15T10:00:00Z'),
      size_vram: 0,
    });

    const mockModels: ListResponse = {
      models: [
        createBaseModel('llama2', 'llama2:latest', 'sha256:abc123'),
        createBaseModel('custom-model', 'custom-model:latest', 'sha256:def456'),
      ],
    };

    const mockOptions = {
      model: 'llama2',
      temperature: 0.2,
      num_ctx: 131072,
      keep_alive: 0,
    };

    const mockGenerateResponse: GenerateResponse = {
      model: 'llama2',
      created_at: new Date('2023-08-15T10:00:00Z'),
      response: 'Generated text response',
      done: true,
      done_reason: 'stop',
      context: [1, 2, 3],
      total_duration: 1000000,
      load_duration: 100000,
      prompt_eval_count: 10,
      prompt_eval_duration: 200000,
      eval_count: 15,
      eval_duration: 700000,
    };

    const mockProgressResponse: ProgressResponse = {
      status: 'success',
      digest: 'sha256:abc123',
      total: 100,
      completed: 100,
    };

    // Base object for progress responses to reduce duplication
    const baseProgress: Omit<ProgressResponse, 'status'> = {
      digest: 'sha256:abc123',
      total: 100,
      completed: 100,
    };

    const mockProgressPullingManifest: ProgressResponse = {
      status: 'pulling manifest',
      digest: '',
      total: 0,
      completed: 0,
    };

    const mockProgressDownloading: ProgressResponse = {
      ...baseProgress,
      status: 'downloading',
      completed: 50,
    };

    const mockProgressDownloadComplete: ProgressResponse = {
      ...baseProgress,
      status: 'downloading',
    };

    const mockProgressVerifying: ProgressResponse = {
      ...baseProgress,
      status: 'verifying',
    };

    return {
      mockModels,
      mockOptions,
      mockGenerateResponse,
      mockProgressResponse,
      mockProgressPullingManifest,
      mockProgressDownloading,
      mockProgressDownloadComplete,
      mockProgressVerifying,
      createBaseModel,
    };
  };

  interface InstanceConfig {
    listResponse?: ListResponse;
    createResponse?: ProgressResponse;
    generateResponse?: GenerateResponse;
    shouldListError?: boolean;
    shouldCreateError?: boolean;
    shouldGenerateError?: boolean;
    baseModel?: string;
    systemPrompt?: string;
    parameters?: Record<string, unknown>;
  }

  const getInstance = (config?: InstanceConfig) => {
    const { mockProgressResponse, mockGenerateResponse } = getData();

    const mockOllamaClient = {
      list: vi.fn().mockResolvedValue(config?.listResponse ?? { models: [] }),
      create: vi
        .fn()
        .mockResolvedValue(config?.createResponse ?? mockProgressResponse),
      generate: vi
        .fn()
        .mockResolvedValue(config?.generateResponse ?? mockGenerateResponse),
      pull: vi.fn().mockResolvedValue(undefined),
    } as unknown as Ollama;

    const adapter = new OllamaAdapter(
      mockOllamaClient,
      config?.baseModel,
      config?.systemPrompt,
      config?.parameters
    );

    return { adapter, mockOllamaClient };
  };

  describe('checkConnection', () => {
    it('should return true when Ollama daemon is running', async () => {
      const { adapter, mockOllamaClient } = getInstance();

      const result = await adapter.checkConnection();

      expect(result).toBe(true);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });

    it('should return false when Ollama daemon is not running', async () => {
      const connectionError = new Error('ECONNREFUSED');
      const { adapter, mockOllamaClient } = getInstance({
        shouldListError: true,
      });
      vi.mocked(mockOllamaClient.list).mockRejectedValue(connectionError);

      const result = await adapter.checkConnection();

      expect(result).toBe(false);
      expect(mockOllamaClient.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkModel', () => {
    it('should return true when model exists in available models', async () => {
      const { mockModels } = getData();
      const { adapter } = getInstance({ listResponse: mockModels });

      const result = await adapter.checkModel('custom-model');

      expect(result).toBe(true);
    });

    it('should return false when model does not exist', async () => {
      const { createBaseModel } = getData();
      const { adapter } = getInstance({
        listResponse: {
          models: [createBaseModel('llama2', 'llama2:latest', 'sha256:abc123')],
        },
      });

      const result = await adapter.checkModel('missing-model');

      expect(result).toBe(false);
    });

    it('should throw SystemError when Ollama daemon is not running', async () => {
      const connectionError = new Error('ECONNREFUSED');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.list).mockRejectedValue(connectionError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(
        SystemError
      );
    });

    it('should throw UserError when model not found with 404 error', async () => {
      const notFoundError = new Error('404 - Model not found');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.list).mockRejectedValue(notFoundError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(UserError);
    });

    it('should throw SystemError when request times out', async () => {
      const timeoutError = new Error('Request timeout');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.list).mockRejectedValue(timeoutError);

      await expect(adapter.checkModel('test-model')).rejects.toThrow(
        SystemError
      );
    });
  });

  describe('createModel', () => {
    it('should yield progress when model already exists (idempotency)', async () => {
      const { mockModels } = getData();
      const { adapter, mockOllamaClient } = getInstance({
        listResponse: mockModels,
      });

      const progressUpdates = [];
      for await (const update of adapter.createModel('custom-model')) {
        progressUpdates.push(update);
      }

      expect(mockOllamaClient.create).not.toHaveBeenCalled();
      expect(progressUpdates).toHaveLength(1);
      expect(progressUpdates[0]).toEqual({
        status: "Model 'custom-model' already exists",
      });
    });

    it('should create model with direct SDK parameters', async () => {
      const baseModel = 'qwen2.5-coder:1.5b';
      const systemPrompt = 'You are a commit expert';
      const parameters = { temperature: 0.2, num_ctx: 131072, keep_alive: 0 };

      const { adapter, mockOllamaClient } = getInstance({
        baseModel,
        systemPrompt,
        parameters,
      });

      const mockStream = createMockAsyncIterator([
        {
          status: 'reading model definition',
          digest: 'abc123',
          total: 100,
          completed: 0,
        },
        {
          status: 'creating model',
          digest: 'abc123',
          total: 100,
          completed: 50,
        },
        { status: 'success', digest: 'abc123', total: 100, completed: 100 },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockOllamaClient.create as any).mockResolvedValue(mockStream);

      const progressUpdates = [];
      for await (const update of adapter.createModel('test-model')) {
        progressUpdates.push(update);
      }

      expect(mockOllamaClient.create).toHaveBeenCalledWith({
        model: 'test-model',
        from: baseModel,
        system: systemPrompt,
        parameters,
        stream: true,
      });

      expect(progressUpdates).toHaveLength(4);
      expect(progressUpdates[0]).toEqual({
        status: 'reading model definition',
      });
      expect(progressUpdates[1]).toEqual({ status: 'creating model' });
      expect(progressUpdates[2]).toEqual({ status: 'success' });
      expect(progressUpdates[3]).toEqual({
        status: "Model 'test-model' created successfully",
      });
    });

    it('should throw SystemError when model creation fails with SDK error', async () => {
      const { adapter, mockOllamaClient } = getInstance({
        baseModel: 'qwen2.5-coder:1.5b',
        systemPrompt: 'You are a commit expert',
        parameters: { temperature: 0.2 },
      });

      const createError = new Error('Invalid model definition');
      vi.mocked(mockOllamaClient.create).mockRejectedValue(createError);

      await expect(async () => {
        for await (const _ of adapter.createModel('test-model')) {
          // Consume the stream to trigger the error
        }
      }).rejects.toThrow(SystemError);
    });

    it('should throw SystemError when daemon is unavailable during creation', async () => {
      const { adapter, mockOllamaClient } = getInstance({
        baseModel: 'qwen2.5-coder:1.5b',
        systemPrompt: 'You are a commit expert',
        parameters: { temperature: 0.2 },
      });

      const connectionError = new Error('ECONNREFUSED');
      vi.mocked(mockOllamaClient.create).mockRejectedValue(connectionError);

      await expect(async () => {
        for await (const _ of adapter.createModel('test-model')) {
          // Consume the stream to trigger the error
        }
      }).rejects.toThrow(SystemError);
    });

    it('should work with minimal constructor (generic adapter)', async () => {
      const { adapter, mockOllamaClient } = getInstance();

      const mockStream = createMockAsyncIterator([
        { status: 'success', digest: 'def456', total: 50, completed: 50 },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockOllamaClient.create as any).mockResolvedValue(mockStream);

      const progressUpdates = [];
      for await (const update of adapter.createModel('test-model')) {
        progressUpdates.push(update);
      }

      expect(progressUpdates).toHaveLength(2);
      expect(mockOllamaClient.create).toHaveBeenCalledWith({
        model: 'test-model',
        from: undefined,
        system: undefined,
        parameters: undefined,
        stream: true,
      });
    });

    it('should create model with constructor-injected configuration', async () => {
      const { adapter, mockOllamaClient } = getInstance({
        baseModel: 'qwen2.5-coder:1.5b',
        systemPrompt: 'You are a commit expert',
        parameters: { temperature: 0.2 },
      });

      const mockStream = createMockAsyncIterator([
        { status: 'success', digest: 'def456', total: 50, completed: 50 },
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockOllamaClient.create as any).mockResolvedValue(mockStream);

      const progressUpdates = [];
      for await (const update of adapter.createModel('test-model')) {
        progressUpdates.push(update);
      }

      expect(progressUpdates).toHaveLength(2);
      expect(mockOllamaClient.create).toHaveBeenCalledWith({
        model: 'test-model',
        from: 'qwen2.5-coder:1.5b',
        system: 'You are a commit expert',
        parameters: { temperature: 0.2 },
        stream: true,
      });
    });
  });

  describe('pullModel', () => {
    it('should yield progress when model already exists (idempotency)', async () => {
      const { mockModels } = getData();
      const { adapter, mockOllamaClient } = getInstance({
        listResponse: mockModels,
      });

      const progressUpdates = [];
      for await (const update of adapter.pullModel('custom-model')) {
        progressUpdates.push(update);
      }

      expect(mockOllamaClient.pull).not.toHaveBeenCalled();
      expect(progressUpdates).toHaveLength(1);
      expect(progressUpdates[0]).toEqual({
        status: "Model 'custom-model' already exists",
      });
    });

    it('should pull model and yield progress when it does not exist', async () => {
      const {
        mockProgressPullingManifest,
        mockProgressDownloading,
        mockProgressDownloadComplete,
        mockProgressVerifying,
        mockProgressResponse,
      } = getData();

      const { adapter, mockOllamaClient } = getInstance({
        listResponse: { models: [] },
      });

      const mockStream = createMockAsyncIterator([
        mockProgressPullingManifest,
        mockProgressDownloading,
        mockProgressDownloadComplete,
        mockProgressVerifying,
        mockProgressResponse,
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockOllamaClient.pull as any).mockResolvedValue(mockStream);

      const progressUpdates = [];
      for await (const update of adapter.pullModel('qwen2.5-coder:1.5b')) {
        progressUpdates.push(update);
      }

      expect(mockOllamaClient.pull).toHaveBeenCalledWith({
        model: 'qwen2.5-coder:1.5b',
        stream: true,
      });

      expect(progressUpdates).toHaveLength(6);
      expect(progressUpdates[0]).toEqual({
        status: 'pulling manifest',
        current: 0,
        total: 0,
      });
      expect(progressUpdates[1]).toEqual({
        status: 'downloading',
        current: 50,
        total: 100,
      });
      expect(progressUpdates[2]).toEqual({
        status: 'downloading',
        current: 100,
        total: 100,
      });
      expect(progressUpdates[3]).toEqual({
        status: 'verifying',
        current: 100,
        total: 100,
      });
      expect(progressUpdates[4]).toEqual({
        status: 'success',
        current: 100,
        total: 100,
      });
      expect(progressUpdates[5]).toEqual({
        status: "Model 'qwen2.5-coder:1.5b' pulled successfully",
      });
    });

    it('should throw SystemError when pull fails with connection error', async () => {
      const { adapter, mockOllamaClient } = getInstance({
        listResponse: { models: [] },
      });

      const connectionError = new Error('ECONNREFUSED');
      vi.mocked(mockOllamaClient.pull).mockRejectedValue(connectionError);

      await expect(async () => {
        for await (const _ of adapter.pullModel('test-model')) {
          // Consume the stream to trigger the error
        }
      }).rejects.toThrow(SystemError);
    });

    it('should throw SystemError when pull fails with network error', async () => {
      const { adapter, mockOllamaClient } = getInstance({
        listResponse: { models: [] },
      });

      const networkError = new Error('Network timeout');
      vi.mocked(mockOllamaClient.pull).mockRejectedValue(networkError);

      await expect(async () => {
        for await (const _ of adapter.pullModel('test-model')) {
          // Consume the stream to trigger the error
        }
      }).rejects.toThrow(SystemError);
    });
  });

  describe('generate', () => {
    it('should generate text successfully', async () => {
      const { mockOptions, mockGenerateResponse } = getData();
      const { adapter, mockOllamaClient } = getInstance({
        generateResponse: mockGenerateResponse,
      });

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

    it('should handle undefined optional parameters', async () => {
      const { mockGenerateResponse } = getData();
      const { adapter, mockOllamaClient } = getInstance({
        generateResponse: {
          ...mockGenerateResponse,
          response: 'Response',
          eval_count: 5,
        },
      });
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

    it('should throw SystemError when generation fails', async () => {
      const { mockOptions } = getData();
      const generateError = new Error('Generation failed');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.generate).mockRejectedValue(generateError);

      await expect(
        adapter.generate('Test prompt', mockOptions)
      ).rejects.toThrow(SystemError);
    });

    it('should throw UserError when model not found during generation', async () => {
      const { mockOptions } = getData();
      const notFoundError = new Error('404 - Model not found');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.generate).mockRejectedValue(notFoundError);

      await expect(
        adapter.generate('Test prompt', mockOptions)
      ).rejects.toThrow(UserError);
    });
  });

  describe('error handling', () => {
    it('should wrap unknown errors as SystemError by default', async () => {
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.list).mockRejectedValue('Unknown error');

      await expect(adapter.checkModel('test')).rejects.toThrow(SystemError);
    });

    it('should preserve error message in wrapped errors', async () => {
      const originalError = new Error('Custom error message');
      const { adapter, mockOllamaClient } = getInstance();
      vi.mocked(mockOllamaClient.list).mockRejectedValue(originalError);

      try {
        await adapter.checkModel('test');
      } catch (error) {
        expect(error).toBeInstanceOf(SystemError);
        expect((error as SystemError).message).toBe(
          'Failed to check model existence'
        );
      }
    });
  });
});
