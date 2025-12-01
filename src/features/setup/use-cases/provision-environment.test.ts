import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LlmPort } from '../../../core/ports/llm-port.js';
import type { SetupUiPort } from '../../../core/ports/setup-ui-port.js';
import { SystemError } from '../../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../../core/types/llm-types.js';
import { ProvisionEnvironment } from './provision-environment.js';

describe('ProvisionEnvironment', () => {
  let provisionEnvironment: ProvisionEnvironment;
  let mockLlmPort: LlmPort;
  let mockUiPort: SetupUiPort;
  let modelConfig: OllamaModelConfig;

  beforeEach(() => {
    modelConfig = {
      model: 'ollatool-commit:latest',
      baseModel: 'qwen2.5-coder:1.5b',
      systemPrompt: 'Test system prompt',
      parameters: { temperature: 0.2 },
    };

    mockLlmPort = {
      checkConnection: vi.fn(),
      checkModel: vi.fn(),
      pullModel: vi.fn(),
      createModel: vi.fn(),
    };

    mockUiPort = {
      showIntro: vi.fn(),
      showOutro: vi.fn(),
      onCheckStarted: vi.fn(),
      onCheckSuccess: vi.fn(),
      onCheckFailure: vi.fn(),
      showBaseModelMissingWarning: vi.fn(),
      showPullStartMessage: vi.fn(),
      startPullSpinner: vi.fn(),
      onProgress: vi.fn(),
    };

    provisionEnvironment = new ProvisionEnvironment(
      mockLlmPort,
      mockUiPort,
      modelConfig
    );
  });

  describe('execute', () => {
    it('should complete successfully when all validations pass', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel)
        .mockResolvedValueOnce(true) // base model exists
        .mockResolvedValueOnce(true); // custom model exists

      await expect(provisionEnvironment.execute()).resolves.toBeUndefined();

      expect(mockUiPort.onCheckStarted).toHaveBeenCalledWith('daemon');
      expect(mockUiPort.onCheckSuccess).toHaveBeenCalledWith('daemon');
      expect(mockUiPort.onCheckStarted).toHaveBeenCalledWith(
        'base-model',
        'Checking base model (qwen2.5-coder:1.5b)...'
      );
      expect(mockUiPort.onCheckSuccess).toHaveBeenCalledWith(
        'base-model',
        "Base model 'qwen2.5-coder:1.5b' is available"
      );
      expect(mockUiPort.onCheckStarted).toHaveBeenCalledWith(
        'custom-model',
        'Checking custom model (ollatool-commit:latest)...'
      );
      expect(mockUiPort.onCheckSuccess).toHaveBeenCalledWith(
        'custom-model',
        "Custom model 'ollatool-commit:latest' already exists"
      );
    });

    it('should pull base model when missing', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel)
        .mockResolvedValueOnce(false) // base model missing
        .mockResolvedValueOnce(true); // custom model exists

      const mockStream = [
        { status: 'pulling manifest' },
        { status: 'pulling config' },
        { status: 'pulling model' },
      ];
      const mockAsyncIterable = {
        [Symbol.asyncIterator]: async function* () {
          for (const item of mockStream) {
            yield item;
          }
        },
      };
      vi.mocked(mockLlmPort.pullModel).mockReturnValue(mockAsyncIterable);

      await expect(provisionEnvironment.execute()).resolves.toBeUndefined();

      expect(mockUiPort.showBaseModelMissingWarning).toHaveBeenCalledWith(
        'qwen2.5-coder:1.5b'
      );
      expect(mockUiPort.showPullStartMessage).toHaveBeenCalled();
      expect(mockUiPort.startPullSpinner).toHaveBeenCalledWith(
        'qwen2.5-coder:1.5b'
      );
      expect(mockUiPort.onProgress).toHaveBeenCalledTimes(3);
      expect(mockUiPort.onCheckSuccess).toHaveBeenCalledWith(
        'base-model',
        "Base model 'qwen2.5-coder:1.5b' pulled successfully"
      );
    });

    it('should create custom model when missing', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel)
        .mockResolvedValueOnce(true) // base model exists
        .mockResolvedValueOnce(false); // custom model missing

      const mockStream = [
        { status: 'creating model' },
        { status: 'modifying model' },
      ];
      const mockAsyncIterable = {
        [Symbol.asyncIterator]: async function* () {
          for (const item of mockStream) {
            yield item;
          }
        },
      };
      vi.mocked(mockLlmPort.createModel).mockReturnValue(mockAsyncIterable);

      await expect(provisionEnvironment.execute()).resolves.toBeUndefined();

      expect(mockUiPort.onCheckStarted).toHaveBeenCalledWith(
        'custom-model',
        "Creating custom model 'ollatool-commit:latest'..."
      );
      expect(mockUiPort.onProgress).toHaveBeenCalledTimes(2);
      expect(mockUiPort.onCheckSuccess).toHaveBeenCalledWith(
        'custom-model',
        "Custom model 'ollatool-commit:latest' created successfully"
      );
    });

    it('should throw SystemError when daemon is not running', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(false);

      await expect(provisionEnvironment.execute()).rejects.toThrow(SystemError);

      expect(mockUiPort.onCheckStarted).toHaveBeenCalledWith('daemon');
      expect(mockUiPort.onCheckFailure).toHaveBeenCalledWith(
        'daemon',
        expect.objectContaining({
          name: 'SystemError',
          message: 'Ollama daemon is not running or accessible',
        })
      );
    });

    it('should throw SystemError when daemon check fails', async () => {
      const connectionError = new Error('Connection refused');
      vi.mocked(mockLlmPort.checkConnection).mockRejectedValue(connectionError);

      await expect(provisionEnvironment.execute()).rejects.toThrow(SystemError);

      expect(mockUiPort.onCheckFailure).toHaveBeenCalledWith(
        'daemon',
        expect.objectContaining({
          name: 'SystemError',
          message: 'Failed to check daemon status',
        })
      );
    });

    it('should throw SystemError when base model check fails', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel).mockRejectedValueOnce(
        new Error('API error')
      );

      await expect(provisionEnvironment.execute()).rejects.toThrow(SystemError);

      expect(mockUiPort.onCheckFailure).toHaveBeenCalledWith(
        'base-model',
        expect.objectContaining({
          name: 'SystemError',
          message: 'Failed to validate base model',
        })
      );
    });

    it('should throw SystemError when base model pull fails', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel)
        .mockResolvedValueOnce(false) // base model missing
        .mockResolvedValueOnce(true); // custom model exists

      const pullError = new Error('Network error');
      const mockAsyncIterable = {
        [Symbol.asyncIterator]: async function* () {
          yield { status: 'starting' };
          throw pullError;
        },
      };
      vi.mocked(mockLlmPort.pullModel).mockReturnValue(mockAsyncIterable);

      await expect(provisionEnvironment.execute()).rejects.toThrow(SystemError);

      expect(mockUiPort.onCheckFailure).toHaveBeenCalledWith(
        'base-model',
        expect.objectContaining({
          name: 'SystemError',
          message: "Failed to auto-pull 'qwen2.5-coder:1.5b'",
        })
      );
    });

    it('should throw SystemError when custom model creation fails', async () => {
      vi.mocked(mockLlmPort.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlmPort.checkModel)
        .mockResolvedValueOnce(true) // base model exists
        .mockResolvedValueOnce(false); // custom model missing

      const createError = new Error('Model creation failed');
      const mockAsyncIterable = {
        [Symbol.asyncIterator]: async function* () {
          yield { status: 'starting' };
          throw createError;
        },
      };
      vi.mocked(mockLlmPort.createModel).mockReturnValue(mockAsyncIterable);

      await expect(provisionEnvironment.execute()).rejects.toThrow(SystemError);

      expect(mockUiPort.onCheckFailure).toHaveBeenCalledWith(
        'custom-model',
        expect.objectContaining({
          name: 'SystemError',
          message: 'Failed to provision custom model',
        })
      );
    });
  });
});
