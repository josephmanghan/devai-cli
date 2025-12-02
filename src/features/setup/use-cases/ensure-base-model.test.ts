import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LlmPort, ProgressUpdate, SystemError } from '../../../core/index.js';
import { EnsureBaseModel } from './ensure-base-model.js';

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
  deleteModel: vi.fn(),
  createModel: vi.fn(),
  pullModel: vi.fn(),
  generate: vi.fn(),
} satisfies LlmPort;

describe('EnsureBaseModel', () => {
  let ensureBaseModel: EnsureBaseModel;
  const modelName = 'qwen2.5-coder:1.5b';

  beforeEach(() => {
    vi.clearAllMocks();
    ensureBaseModel = new EnsureBaseModel(mockLlmPort, modelName);
  });

  describe('constructor', () => {
    it('should create instance with injected LlmPort and model name', () => {
      expect(ensureBaseModel).toBeInstanceOf(EnsureBaseModel);
    });
  });

  describe('execute - model exists', () => {
    it('should return { existed: true } when model exists', async () => {
      mockLlmPort.checkModel.mockResolvedValue(true);

      const generator = ensureBaseModel.execute();
      const result = await generator.next();

      expect(result.done).toBe(true);
      expect(result.value).toEqual({ existed: true });
      expect(mockLlmPort.pullModel).not.toHaveBeenCalled();
    });

    it('should not attempt to pull when model exists', async () => {
      mockLlmPort.checkModel.mockResolvedValue(true);

      const generator = ensureBaseModel.execute();
      await generator.next();

      expect(mockLlmPort.pullModel).not.toHaveBeenCalled();
    });
  });

  describe('execute - model missing', () => {
    it('should return { existed: false, pulled: true } after successful pull', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);
      mockLlmPort.pullModel.mockImplementation(
        createMockProgressStream([{ status: 'pulling manifest' }])
      );

      const generator = ensureBaseModel.execute();
      let result = await generator.next();

      // Consume progress events
      while (!result.done) {
        result = await generator.next();
      }

      expect(result.value).toEqual({ existed: false, pulled: true });
    });

    it('should stream progress events during pull', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const progressEvents = [
        { status: 'pulling manifest' },
        { status: 'pulling config' },
        { status: 'pulling model' },
      ];

      mockLlmPort.pullModel.mockImplementation(
        createMockProgressStream(progressEvents)
      );

      const generator = ensureBaseModel.execute();
      const yieldedValues: ProgressUpdate[] = [];

      let result = await generator.next();
      while (!result.done) {
        yieldedValues.push(result.value);
        result = await generator.next();
      }

      expect(yieldedValues).toEqual(progressEvents);
      expect(yieldedValues).toHaveLength(3);
    });

    it('should throw SystemError on pull failure', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const pullError = new Error('Network error');
      mockLlmPort.pullModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, pullError)
      );

      const generator = ensureBaseModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(SystemError);
    });
  });

  describe('error handling', () => {
    it('should throw SystemError when pull fails with network error', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const pullError = new Error('Network error');
      mockLlmPort.pullModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, pullError)
      );

      const generator = ensureBaseModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(SystemError);
    });

    it('should include manual pull command in error message', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const pullError = new Error('Network error');
      mockLlmPort.pullModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, pullError)
      );

      const generator = ensureBaseModel.execute();

      try {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      } catch (error) {
        expect(error).toBeInstanceOf(SystemError);
        expect((error as SystemError).remediation).toContain(
          `ollama pull ${modelName}`
        );
      }
    });

    it('should propagate SystemError thrown from pull', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const systemError = new SystemError('Pull failed', 'Fix manually');
      mockLlmPort.pullModel.mockImplementation(
        createMockFailingStream({ status: 'starting' }, systemError)
      );

      const generator = ensureBaseModel.execute();

      await expect(async () => {
        let result = await generator.next();
        while (!result.done) {
          result = await generator.next();
        }
      }).rejects.toThrow(systemError);
    });
  });

  describe('progress streaming', () => {
    it('should yield downloading status events', async () => {
      mockLlmPort.checkModel.mockResolvedValue(false);

      const progressEvents = [
        { status: 'pulling manifest' },
        { status: 'pulling config' },
      ];

      mockLlmPort.pullModel.mockImplementation(
        createMockProgressStream(progressEvents)
      );

      const generator = ensureBaseModel.execute();
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
