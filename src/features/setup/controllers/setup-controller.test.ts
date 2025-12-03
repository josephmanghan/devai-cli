import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OllamaModelConfig, SetupUiPort } from '../../../core/index.js';
import {
  EnsureBaseModel,
  ProvisionCustomModel,
  ValidateOllamaConnection,
} from '../use-cases/index.js';
import { SetupController } from './setup-controller.js';

function createMockModelConfig(): OllamaModelConfig {
  return {
    model: 'test-model:latest',
    baseModel: 'test-base:latest',
    systemPrompt: 'Test prompt',
    temperature: 0.1,
    num_ctx: 1000,
    keep_alive: 0,
  };
}

describe('SetupController', () => {
  let setupController: SetupController;
  let mockProgram: Command;
  let mockValidateConnection: ValidateOllamaConnection;
  let mockEnsureBaseModel: EnsureBaseModel;
  let mockProvisionCustomModel: ProvisionCustomModel;
  let mockUi: SetupUiPort;

  beforeEach(() => {
    mockProgram = {
      command: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    } as unknown as Command;

    mockValidateConnection = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as ValidateOllamaConnection;

    mockEnsureBaseModel = {
      execute: vi.fn(),
    } as unknown as EnsureBaseModel;

    mockProvisionCustomModel = {
      execute: vi.fn(),
    } as unknown as ProvisionCustomModel;

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
      mockValidateConnection,
      mockEnsureBaseModel,
      mockProvisionCustomModel,
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

  describe('Dependency Injection', () => {
    it('should accept all three use cases and UI port via constructor', () => {
      const mockConfig = createMockModelConfig();
      const controller = new SetupController(
        mockConfig,
        mockValidateConnection,
        mockEnsureBaseModel,
        mockProvisionCustomModel,
        mockUi
      );
      expect(controller).toBeDefined();
    });
  });
});
