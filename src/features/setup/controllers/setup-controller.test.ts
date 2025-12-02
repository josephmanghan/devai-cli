import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SetupUiPort } from '../../../core/ports/setup-ui-port.js';
import { SystemError } from '../../../core/types/errors.types.js';
import type { OllamaModelConfig } from '../../../core/types/llm-types.js';
import { ProvisionEnvironment } from '../use-cases/provision-environment.js';
import { SetupController } from './setup-controller.js';

function createMockModelConfig(): OllamaModelConfig {
  return {
    model: 'test-model:latest',
    baseModel: 'test-base:latest',
    systemPrompt: 'Test prompt',
    parameters: { temperature: 0.1, num_ctx: 1000, keep_alive: 0 },
  };
}

describe('SetupController', () => {
  let setupController: SetupController;
  let mockProgram: Command;
  let mockProvisionEnvironment: ProvisionEnvironment;
  let mockUi: SetupUiPort;

  beforeEach(() => {
    mockProgram = {
      command: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    } as unknown as Command;

    mockProvisionEnvironment = {
      execute: vi.fn(),
    } as unknown as ProvisionEnvironment;

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
    setupController = new SetupController(
      mockConfig,
      mockProvisionEnvironment,
      mockUi
    );
  });

  describe('Command Registration', () => {
    it('should register setup command with program', () => {
      setupController.register(mockProgram);

      expect(mockProgram.command).toHaveBeenCalledWith('setup');
      expect(mockProgram.description).toHaveBeenCalledWith(
        'Configure Ollama integration and provision custom model'
      );
      expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Command Execution', () => {
    it('should succeed when ProvisionEnvironment succeeds', async () => {
      vi.mocked(mockProvisionEnvironment.execute).mockResolvedValue(undefined);

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupController.register(mockProgram);
      await actionHandler!();

      expect(mockUi.showIntro).toHaveBeenCalled();
      expect(mockProvisionEnvironment.execute).toHaveBeenCalled();
      expect(mockUi.showOutro).toHaveBeenCalled();
    });

    it('should throw errors from ProvisionEnvironment', async () => {
      const systemError = new SystemError('Test error', 'Test remediation');
      vi.mocked(mockProvisionEnvironment.execute).mockRejectedValue(
        systemError
      );

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupController.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow('Test error');
      expect(mockUi.showIntro).toHaveBeenCalled();
      expect(mockProvisionEnvironment.execute).toHaveBeenCalled();
      expect(mockUi.showOutro).not.toHaveBeenCalled();
    });

    it('should wrap unexpected errors in SystemError', async () => {
      const unexpectedError = new Error('Unexpected error');
      vi.mocked(mockProvisionEnvironment.execute).mockRejectedValue(
        unexpectedError
      );

      let actionHandler: () => Promise<void>;
      const mockAction = mockProgram.action as ReturnType<typeof vi.fn>;
      mockAction.mockImplementation(handler => {
        actionHandler = handler;
        return mockProgram;
      });

      setupController.register(mockProgram);

      await expect(actionHandler!()).rejects.toThrow(SystemError);
      await expect(actionHandler!()).rejects.toThrow(
        'An unexpected error occurred during setup'
      );
    });
  });

  describe('Dependency Injection', () => {
    it('should accept ProvisionEnvironment and UI port via constructor', () => {
      const mockConfig = createMockModelConfig();
      const controller = new SetupController(
        mockConfig,
        mockProvisionEnvironment,
        mockUi
      );
      expect(controller).toBeDefined();
    });
  });
});
