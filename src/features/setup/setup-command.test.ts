import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SystemError } from '../../core/types/errors.types.js';
import { CONVENTIONAL_COMMIT_MODEL_CONFIG } from '../../infrastructure/config/conventional-commit-model.config.js';
import { OllamaAdapter } from '../../infrastructure/llm/ollama-adapter.js';
import { SetupCommand } from './setup-command.js';

describe('SetupCommand', () => {
  let setupCommand: SetupCommand;
  let mockProgram: Command;
  let mockAdapter: OllamaAdapter;

  beforeEach(() => {
    mockProgram = {
      command: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    } as unknown as Command;

    mockAdapter = {
      checkConnection: vi.fn(),
      checkModel: vi.fn(),
      createModel: vi.fn(),
      generate: vi.fn(),
    } as unknown as OllamaAdapter;

    setupCommand = new SetupCommand(mockAdapter);
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
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel).mockResolvedValue(true);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      expect(mockAdapter.checkConnection).toHaveBeenCalled();
    });

    it('should throw SystemError when daemon is not running', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(false);

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
    });
  });

  describe('Base Model Validation', () => {
    it('should succeed when base model exists', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
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

      expect(mockAdapter.checkModel).toHaveBeenCalledWith(
        CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel
      );
    });

    it('should throw ValidationError when base model is missing', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel).mockResolvedValue(false);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow(
        `Base model '${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}' is required`
      );
    });
  });

  describe('Custom Model Provisioning', () => {
    it('should skip creation when custom model already exists', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
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

      expect(mockAdapter.createModel).not.toHaveBeenCalled();
    });

    it('should create custom model when missing', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(false); // Custom model missing

      vi.mocked(mockAdapter.createModel).mockResolvedValue();

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      expect(mockAdapter.createModel).toHaveBeenCalledWith(
        CONVENTIONAL_COMMIT_MODEL_CONFIG.model
      );
    });

    it('should handle model creation failure', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(true) // Base model
        .mockResolvedValueOnce(false); // Custom model missing

      const createError = new SystemError(
        'Model creation failed',
        'Test remediation'
      );
      vi.mocked(mockAdapter.createModel).mockRejectedValue(createError);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow('Model creation failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle SystemError from adapter', async () => {
      const systemError = new SystemError(
        'Failed to check daemon status',
        'Ensure Ollama is properly installed'
      );
      vi.mocked(mockAdapter.checkConnection).mockRejectedValue(systemError);

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
    });
  });

  describe('Idempotency', () => {
    it('should complete successfully when all components already exist', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
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
      expect(mockAdapter.createModel).not.toHaveBeenCalled();
    });
  });

  describe('Dependency Injection', () => {
    it('should accept custom adapter', () => {
      const customAdapter = {
        checkConnection: vi.fn(),
        checkModel: vi.fn(),
        createModel: vi.fn(),
      } as unknown as OllamaAdapter;

      const commandWithCustomAdapter = new SetupCommand(customAdapter);

      expect(commandWithCustomAdapter).toBeDefined();
    });

    it('should use default adapter when none provided', () => {
      const defaultCommand = new SetupCommand();

      expect(defaultCommand).toBeDefined();
    });
  });
});
