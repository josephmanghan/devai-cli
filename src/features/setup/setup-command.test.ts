import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LlmPort } from '../../core/ports/llm-port.js';
import { SetupUiPort } from '../../core/ports/setup-ui-port.js';
import { SystemError } from '../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../core/types/llm-types.js';
import { SetupCommand } from './setup-command.js';

function createMockModelConfig(): OllamaModelConfig {
  return {
    model: 'test-model:latest',
    baseModel: 'test-base:latest',
    systemPrompt: 'Test prompt',
    parameters: { temperature: 0.1, num_ctx: 1000, keep_alive: 0 },
  };
}

describe('SetupCommand', () => {
  let setupCommand: SetupCommand;
  let mockProgram: Command;
  let mockLlm: LlmPort;
  let mockUi: SetupUiPort;

  beforeEach(() => {
    mockProgram = {
      command: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    } as unknown as Command;

    mockLlm = {
      checkConnection: vi.fn(),
      checkModel: vi.fn(),
      generate: vi.fn(),
      pullModel: vi.fn(),
      createModel: vi.fn(),
    } as unknown as LlmPort;

    mockUi = {
      showIntro: vi.fn(),
      showOutro: vi.fn(),
      onCheckStarted: vi.fn(),
      onCheckSuccess: vi.fn(),
      onCheckFailure: vi.fn(),
      onProgress: vi.fn(),
      showBaseModelMissingWarning: vi.fn(),
      showPullStartMessage: vi.fn(),
      startPullSpinner: vi.fn(),
    };

    const mockConfig = createMockModelConfig();
    setupCommand = new SetupCommand(mockConfig, mockLlm, mockUi);
  });

  describe('Command Registration', () => {
    it('should register setup command with program', () => {
      setupCommand.register(mockProgram);

      expect(mockProgram.command).toHaveBeenCalledWith('setup');
      expect(mockProgram.description).toHaveBeenCalledWith(
        'Configure Ollama integration and provision custom model'
      );
      expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Daemon Validation', () => {
    it('should succeed when daemon is running', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel).mockResolvedValue(true);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      expect(mockLlm.checkConnection).toHaveBeenCalled();
      expect(mockUi.showIntro).toHaveBeenCalled();
      expect(mockUi.onCheckStarted).toHaveBeenCalledWith('daemon');
      expect(mockUi.onCheckSuccess).toHaveBeenCalledWith('daemon');
    });

    it('should throw SystemError when daemon is not running', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(false);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow(
        'Ollama daemon is not running or accessible'
      );

      expect(mockUi.onCheckFailure).toHaveBeenCalledWith(
        'daemon',
        expect.any(SystemError)
      );
    });
  });

  describe('Base Model Validation', () => {
    it('should succeed when base model exists', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(true) // Base model check
        .mockResolvedValueOnce(true); // Custom model check

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      const mockConfig = createMockModelConfig();
      expect(mockLlm.checkModel).toHaveBeenCalledWith(mockConfig.baseModel);
      expect(mockUi.onCheckSuccess).toHaveBeenCalledWith(
        'base-model',
        expect.stringContaining('Base model')
      );
    });

    it('should auto-pull when base model is missing', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(false) // Base model missing
        .mockResolvedValueOnce(true); // Custom model exists

      // ✅ CORRECT MOCK PATTERN for async generator
      const mockPullModel = vi.fn().mockImplementation(async function* () {
        yield { status: 'downloading', current: 10, total: 100 };
        yield { status: 'downloading', current: 100, total: 100 };
      });
      vi.mocked(mockLlm.pullModel).mockImplementation(mockPullModel);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      const mockConfig = createMockModelConfig();
      expect(mockLlm.checkModel).toHaveBeenCalledWith(mockConfig.baseModel);
      expect(mockUi.onProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe('Base Model Auto-Pull', () => {
    it('should consume progress stream from pullModel', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(false) // Base model missing
        .mockResolvedValueOnce(true); // Custom model exists

      // Mock async generator with multiple progress updates
      const mockPullModel = vi.fn().mockImplementation(async function* () {
        yield { status: 'pulling manifest' };
        yield { status: 'downloading', current: 50, total: 100 };
        yield { status: 'downloading', current: 100, total: 100 };
        yield { status: 'verifying' };
      });
      vi.mocked(mockLlm.pullModel).mockImplementation(mockPullModel);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      // Verify all progress updates were consumed
      expect(mockUi.onProgress).toHaveBeenCalledTimes(4);
      expect(mockUi.onProgress).toHaveBeenCalledWith({
        status: 'pulling manifest',
      });
      expect(mockUi.onProgress).toHaveBeenCalledWith({
        status: 'downloading',
        current: 50,
        total: 100,
      });
    });

    it('should handle pullModel errors correctly', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(false) // Base model missing
        .mockResolvedValueOnce(true); // Custom model exists

      const pullError = new SystemError('Network error', 'Check connection');
      const mockPullModel = vi.fn().mockImplementation(async function* () {
        yield { status: 'starting' };
        throw pullError;
      });
      vi.mocked(mockLlm.pullModel).mockImplementation(mockPullModel);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow('Network error');
      expect(mockUi.onCheckFailure).toHaveBeenCalledWith(
        'base-model',
        pullError
      );
    });
  });

  describe('Custom Model Provisioning', () => {
    it('should skip creation when custom model already exists', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(true); // Custom model

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      expect(mockLlm.createModel).not.toHaveBeenCalled();
      expect(mockUi.onCheckSuccess).toHaveBeenCalledWith(
        'custom-model',
        expect.stringContaining('already exists')
      );
    });

    it('should create custom model when missing', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(false); // Custom model missing

      // Mock async generator for createModel
      const mockCreateModel = vi.fn().mockImplementation(async function* () {
        yield { status: 'creating model' };
        yield { status: 'model created successfully' };
      });
      vi.mocked(mockLlm.createModel).mockImplementation(mockCreateModel);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      const mockConfig = createMockModelConfig();
      expect(mockLlm.createModel).toHaveBeenCalledWith(mockConfig.model);
      expect(mockUi.onProgress).toHaveBeenCalledTimes(2);
      expect(mockUi.onCheckSuccess).toHaveBeenCalledWith(
        'custom-model',
        expect.stringContaining('created successfully')
      );
    });

    it('should handle model creation failure', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(false); // Custom model missing

      const createError = new SystemError(
        'Model creation failed',
        'Test remediation'
      );
      const mockCreateModel = vi.fn().mockImplementation(async function* () {
        yield { status: 'starting' };
        throw createError;
      });
      vi.mocked(mockLlm.createModel).mockImplementation(mockCreateModel);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow('Model creation failed');
      expect(mockUi.onCheckFailure).toHaveBeenCalledWith(
        'custom-model',
        createError
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle SystemError from LLM port', async () => {
      const systemError = new SystemError(
        'Failed to check daemon status',
        'Ensure Ollama is properly installed'
      );
      vi.mocked(mockLlm.checkConnection).mockRejectedValue(systemError);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow(
        'Failed to check daemon status'
      );
      expect(mockUi.onCheckFailure).toHaveBeenCalledWith('daemon', systemError);
    });
  });

  describe('Idempotency', () => {
    it('should complete successfully when all components already exist', async () => {
      vi.mocked(mockLlm.checkConnection).mockResolvedValue(true);
      vi.mocked(mockLlm.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(true); // Custom model

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).resolves.not.toThrow();
      expect(mockLlm.createModel).not.toHaveBeenCalled();
      expect(mockLlm.pullModel).not.toHaveBeenCalled();
      expect(mockUi.showOutro).toHaveBeenCalled();
    });
  });

  describe('Dependency Injection', () => {
    it('should accept LLM and UI ports via constructor', () => {
      const mockConfig = createMockModelConfig();
      const command = new SetupCommand(mockConfig, mockLlm, mockUi);
      expect(command).toBeDefined();
    });
  });
});
