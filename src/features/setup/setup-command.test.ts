import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SystemError } from '../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../core/types/llm-types.js';
import { OllamaAdapter } from '../../infrastructure/llm/ollama-adapter.js';
import { SetupCommand } from './setup-command.js';

vi.mock('../../ui/setup.js', () => ({
  SetupUI: {
    setupStart: vi.fn(),
    setupSuccess: vi.fn(),
  },
}));

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
      pullModel: vi.fn(),
      generate: vi.fn(),
    } as unknown as OllamaAdapter;

    const mockConfig = createMockModelConfig();
    setupCommand = new SetupCommand(mockConfig, () => mockAdapter);
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

      const mockConfig = createMockModelConfig();
      expect(mockAdapter.checkModel).toHaveBeenCalledWith(mockConfig.baseModel);
    });

    it('should auto-pull when base model is missing', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(false) // Base model missing (should trigger auto-pull)
        .mockResolvedValueOnce(true); // Custom model exists

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      // Mock console.log to capture UI messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await expect(actionHandler!()).resolves.not.toThrow();

      const mockConfig = createMockModelConfig();
      expect(mockAdapter.checkModel).toHaveBeenCalledWith(mockConfig.baseModel);

      // Verify that we get the auto-pull UI message
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 Pulling base model')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Base Model Auto-Pull', () => {
    it('should show success message when base model already exists', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(true) // Base model exists
        .mockResolvedValueOnce(true); // Custom model exists

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);
      await actionHandler!();

      const mockConfig = createMockModelConfig();
      expect(mockAdapter.checkModel).toHaveBeenCalledWith(mockConfig.baseModel);
      expect(mockAdapter.pullModel).not.toHaveBeenCalled();
    });

    it('should handle missing base model gracefully', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(false) // Base model missing (should not throw error)
        .mockResolvedValueOnce(true); // Custom model exists

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      // Mock console.log to capture UI messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Should not throw error - should attempt auto-pull
      await expect(actionHandler!()).resolves.not.toThrow();

      // Verify that auto-pull UI messages are shown
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 Pulling base model')
      );

      consoleSpy.mockRestore();
    });

    it('should include manual pull command in error fallback', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(false) // Base model missing
        .mockResolvedValueOnce(true); // Custom model exists

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      // Mock console.log to capture UI messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Should attempt auto-pull and show appropriate UI messages
      await expect(actionHandler!()).resolves.not.toThrow();

      // Verify that auto-pull UI messages are shown
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 Pulling base model')
      );

      consoleSpy.mockRestore();
    });

    it('should show progress UI during auto-pull', async () => {
      vi.mocked(mockAdapter.checkConnection).mockResolvedValue(true);
      vi.mocked(mockAdapter.checkModel)
        .mockResolvedValueOnce(false) // Base model missing
        .mockResolvedValueOnce(true); // Custom model exists

      vi.mocked(mockAdapter.pullModel).mockResolvedValue();

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupCommand.register(mockProgram);

      // Mock console.log to capture UI messages
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await actionHandler!();

      // Verify that UI messages are shown during auto-pull
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📥 Pulling base model')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Press Ctrl+C to exit')
      );

      consoleSpy.mockRestore();
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

      const mockConfig = createMockModelConfig();
      expect(mockAdapter.createModel).toHaveBeenCalledWith(mockConfig.model);
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
    it('should accept custom config and adapter factory', () => {
      const customAdapter = {
        checkConnection: vi.fn(),
        checkModel: vi.fn(),
        createModel: vi.fn(),
      } as unknown as OllamaAdapter;

      const mockConfig = createMockModelConfig();
      const commandWithCustomAdapter = new SetupCommand(
        mockConfig,
        () => customAdapter
      );

      expect(commandWithCustomAdapter).toBeDefined();
    });

    it('should accept custom config only', () => {
      const mockConfig = createMockModelConfig();
      const commandWithCustomConfig = new SetupCommand(mockConfig);

      expect(commandWithCustomConfig).toBeDefined();
    });
  });
});
