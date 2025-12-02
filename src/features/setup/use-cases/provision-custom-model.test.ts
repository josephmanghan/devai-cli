import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LlmPort,
  OllamaModelConfig,
  ProgressUpdate,
  SystemError,
} from '../../../core/index.js';
import { ProvisionCustomModel } from './provision-custom-model.js';

function createMockProgressStream(items: ProgressUpdate[]) {
  return vi.fn(async function* () {
    for (const item of items) {
      yield item;
    }
  });
}

function createMockFailingStream(item: ProgressUpdate, error: Error) {
  return vi.fn(async function* () {
    yield item;
    throw error;
  });
}

const mockLlmPort = {
  checkConnection: vi.fn(),
  checkModel: vi.fn(),
  createModel: vi.fn(),
  pullModel: vi.fn(),
  generate: vi.fn(),
} satisfies LlmPort;

describe('ProvisionCustomModel', () => {
  let provisionCustomModel: ProvisionCustomModel;

  const modelConfig: OllamaModelConfig = {
    model: 'devai-cli-commit:latest',
    baseModel: 'qwen2.5-coder:1.5b',
    systemPrompt: 'Test system prompt',
    parameters: { temperature: 0.2, num_ctx: 2048, keep_alive: 5 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    provisionCustomModel = new ProvisionCustomModel(mockLlmPort, modelConfig);
  });

  describe('constructor', () => {
    it('should create instance with injected LlmPort and model config', () => {
      expect(provisionCustomModel).toBeInstanceOf(ProvisionCustomModel);
    });
  });

  describe('execute - model exists', () => {
    it('should return { existed: true } when custom model exists', async () => {
      mockLlmPort.checkModel.mockResolvedValue(true);

      const generator = provisionCustomModel.execute();
      const result = await generator.next();

      expect(result.done).toBe(true);
      expect(result.value).toEqual({ existed: true });
      expect(mockLlmPort.createModel).not.toHaveBeenCalled();
    });

    it('should not attempt to create when model exists', async () => {
      mockLlmPort.checkModel.mockResolvedValue(true);

      const generator = provisionCustomModel.execute();
      await generator.next();

      expect(mockLlmPort.createModel).not.toHaveBeenCalled();
    });
  });

  describe('execute - model creation', () => {
    it('should return { existed: false, created: true } after successful creation', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);
      mockLlmPort.createModel.mockImplementation(
        createMockProgressStream([{ status: 'creating model' }])
      );

      const generator = provisionCustomModel.execute();
      let result = await generator.next();

      // Consume progress events
      while (!result.done) {
        result = await generator.next();
      }

      expect(result.value).toEqual({ existed: false, created: true });
    });

    it('should stream progress events during creation', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const progressEvents = [
        { status: 'creating model' },
        { status: 'modifying model' },
      ];

      mockLlmPort.createModel.mockImplementation(
        createMockProgressStream(progressEvents)
      );

      const generator = provisionCustomModel.execute();
      const yieldedValues: ProgressUpdate[] = [];

      let result = await generator.next();
      while (!result.done) {
        yieldedValues.push(result.value);
        result = await generator.next();
      }

      expect(yieldedValues).toEqual(progressEvents);
      expect(yieldedValues).toHaveLength(2);
    });

    it('should handle creation timeouts', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const timeoutError = new SystemError(
        'Creation timeout',
        'Try again later'
      );
      mockLlmPort.createModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, timeoutError)
      );

      const generator = provisionCustomModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(timeoutError);
    });
  });

  describe('error handling', () => {
    it('should throw SystemError when creation fails with network error', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const creationError = new Error('Model creation failed');
      mockLlmPort.createModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, creationError)
      );

      const generator = provisionCustomModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(SystemError);
    });

    it('should provide remediation steps in error', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const creationError = new Error('Model creation failed');
      mockLlmPort.createModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, creationError)
      );

      const generator = provisionCustomModel.execute();

      try {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      } catch (error) {
        expect(error).toBeInstanceOf(SystemError);
        expect((error as SystemError).remediation).toContain('base model');
      }
    });

    it('should propagate SystemError thrown from creation', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const systemError = new SystemError('Creation failed', 'Fix manually');
      mockLlmPort.createModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, systemError)
      );

      const generator = provisionCustomModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(systemError);
    });
  });

  describe('progress streaming', () => {
    it('should yield model creation status events', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const progressEvents = [
        { status: 'creating model' },
        { status: 'modifying model' },
      ];

      mockLlmPort.createModel.mockImplementation(
        createMockProgressStream(progressEvents)
      );

      const generator = provisionCustomModel.execute();
      const yieldedValues: ProgressUpdate[] = [];

      let result = await generator.next();
      while (!result.done) {
        yieldedValues.push(result.value);
        result = await generator.next();
      }

      expect(yieldedValues.every(ev => ev.status)).toBe(true);
    });
  });
});
