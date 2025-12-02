import ora, { type Ora } from 'ora';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OllamaModelConfig, ProgressUpdate } from '../../core/index.js';
import { ConsoleSetupRenderer } from '../index.js';

vi.mock('ora');

describe('ConsoleSetupRenderer', () => {
  let renderer: ConsoleSetupRenderer;
  let mockOra: ReturnType<typeof vi.mocked<typeof ora>>;
  let mockSpinner: Ora;
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;

  const createMockConfig = (): OllamaModelConfig => ({
    model: 'ollatool-commit:latest',
    baseModel: 'qwen2.5-coder:1.5b',
    systemPrompt: 'You are a commit message expert',
    parameters: { temperature: 0.2, num_ctx: 1000, keep_alive: 0 },
  });

  const createMockProgressUpdate = (): ProgressUpdate => ({
    status: 'downloading',
    current: 50,
    total: 100,
  });

  beforeEach(() => {
    vi.restoreAllMocks();

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockOra = vi.mocked(ora);
    mockSpinner = {
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
      warn: vi.fn().mockReturnThis(),
      text: '',
    } as unknown as Ora;

    mockOra.mockReturnValue(mockSpinner);
    renderer = new ConsoleSetupRenderer();
  });

  describe('showIntro', () => {
    it('should display introductory message', () => {
      renderer.showIntro();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔧 Configuring Ollama integration...\n'
      );
    });
  });

  describe('showOutro', () => {
    it('should display completion message with configuration details', () => {
      const mockConfig = createMockConfig();
      renderer.showOutro(mockConfig);
      expect(mockConsoleLog).toHaveBeenCalledWith('\n✅ Setup complete!');
      expect(mockConsoleLog).toHaveBeenCalledWith('\nModels configured:');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `  • Base model: ${mockConfig.baseModel}`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `  • Custom model: ${mockConfig.model}`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n🚀 Ready to generate commits:'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('  ollatool commit');
    });
  });

  describe('showPullStartMessage', () => {
    it('should display pull start messages', () => {
      renderer.showPullStartMessage();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n📥 Pulling base model. This may take a few minutes...'
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '   Press Ctrl+C to exit if needed\n'
      );
    });
  });

  describe('startPullSpinner', () => {
    it('should start pull spinner with model name', () => {
      renderer.startPullSpinner('qwen2.5-coder:1.5b');
      expect(mockOra).toHaveBeenCalledWith('Pulling qwen2.5-coder:1.5b...');
      expect(mockSpinner.start).toHaveBeenCalled();
    });
  });

  describe('onCheckStarted', () => {
    it('should start spinner for daemon check', () => {
      renderer.onCheckStarted('daemon');
      expect(mockOra).toHaveBeenCalledWith('Checking Ollama daemon...');
      expect(mockSpinner.start).toHaveBeenCalled();
    });

    it('should start spinner for base model check with default message', () => {
      renderer.onCheckStarted('base-model');
      expect(mockOra).toHaveBeenCalledWith('Checking base model...');
      expect(mockSpinner.start).toHaveBeenCalled();
    });

    it('should start spinner for custom model check with default message', () => {
      renderer.onCheckStarted('custom-model');
      expect(mockOra).toHaveBeenCalledWith('Checking custom model...');
      expect(mockSpinner.start).toHaveBeenCalled();
    });

    it('should start spinner with custom details', () => {
      const customDetails = 'Checking qwen2.5-coder:1.5b...';
      renderer.onCheckStarted('base-model', customDetails);
      expect(mockOra).toHaveBeenCalledWith(customDetails);
      expect(mockSpinner.start).toHaveBeenCalled();
    });
  });

  describe('onCheckSuccess', () => {
    it('should complete spinner with default success message for daemon', () => {
      renderer.onCheckStarted('daemon');
      renderer.onCheckSuccess('daemon');
      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        'Ollama daemon is running'
      );
    });

    it('should complete spinner with custom success message', () => {
      const customMessage = 'Base model found locally';
      renderer.onCheckStarted('base-model');
      renderer.onCheckSuccess('base-model', customMessage);
      expect(mockSpinner.succeed).toHaveBeenCalledWith(customMessage);
    });

    it('should complete spinner with default success message for unknown step', () => {
      renderer.onCheckStarted('daemon');
      renderer.onCheckSuccess('unknown-step' as 'daemon');
      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        'unknown-step check completed'
      );
    });

    it('should not call succeed when no active spinner', () => {
      renderer.onCheckSuccess('daemon');
      expect(mockSpinner.succeed).not.toHaveBeenCalled();
    });
  });

  describe('onCheckFailure', () => {
    it('should complete spinner with error message when error has message', () => {
      const error = new Error('Connection refused');
      renderer.onCheckStarted('daemon');
      renderer.onCheckFailure('daemon', error);
      expect(mockSpinner.fail).toHaveBeenCalledWith('Connection refused');
    });

    it('should complete spinner with default failure message for empty error', () => {
      const error = new Error('');
      renderer.onCheckStarted('daemon');
      renderer.onCheckFailure('daemon', error);
      expect(mockSpinner.fail).toHaveBeenCalledWith(
        'Ollama daemon not running'
      );
    });

    it('should complete spinner with default failure message for base model', () => {
      const error = new Error('');
      renderer.onCheckStarted('base-model');
      renderer.onCheckFailure('base-model', error);
      expect(mockSpinner.fail).toHaveBeenCalledWith(
        'Failed to check base model'
      );
    });

    it('should complete spinner with default failure message for custom model', () => {
      const error = new Error('');
      renderer.onCheckStarted('custom-model');
      renderer.onCheckFailure('custom-model', error);
      expect(mockSpinner.fail).toHaveBeenCalledWith(
        'Failed to create custom model'
      );
    });

    it('should not call fail when no active spinner', () => {
      renderer.onCheckFailure('daemon', new Error('test error'));
      expect(mockSpinner.fail).not.toHaveBeenCalled();
    });
  });

  describe('onProgress', () => {
    it('should update spinner text with progress including current and total', () => {
      const mockProgressUpdate = createMockProgressUpdate();
      renderer.onCheckStarted('base-model');
      renderer.onProgress(mockProgressUpdate);
      expect(mockSpinner.text).toBe('downloading (50/100)');
    });

    it('should update spinner text with progress status only when no current/total', () => {
      renderer.onCheckStarted('base-model');
      renderer.onProgress({ status: 'processing' });
      expect(mockSpinner.text).toBe('processing');
    });

    it('should not update spinner text when no active spinner', () => {
      const mockProgressUpdate = createMockProgressUpdate();
      renderer.onProgress(mockProgressUpdate);
      expect(mockSpinner.text).toBe('');
    });
  });

  describe('showBaseModelMissingWarning', () => {
    it('should show warning when active spinner exists', () => {
      renderer.onCheckStarted('base-model');
      renderer.showBaseModelMissingWarning('qwen2.5-coder:1.5b');
      expect(mockSpinner.warn).toHaveBeenCalledWith(
        "Base model 'qwen2.5-coder:1.5b' not found - will auto-pull"
      );
    });

    it('should not call warn when no active spinner', () => {
      renderer.showBaseModelMissingWarning('test-model');
      expect(mockSpinner.warn).not.toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete successful setup flow', () => {
      const mockConfig = createMockConfig();
      renderer.showIntro();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🔧 Configuring Ollama integration...\n'
      );
      renderer.onCheckStarted('daemon');
      expect(mockOra).toHaveBeenCalledWith('Checking Ollama daemon...');
      renderer.onCheckSuccess('daemon');
      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        'Ollama daemon is running'
      );
      renderer.showOutro(mockConfig);
      expect(mockConsoleLog).toHaveBeenCalledWith('\n✅ Setup complete!');
    });

    it('should handle base model missing and pull flow', () => {
      const mockProgressUpdate = createMockProgressUpdate();
      renderer.onCheckStarted('base-model');
      renderer.showBaseModelMissingWarning('qwen2.5-coder:1.5b');
      expect(mockSpinner.warn).toHaveBeenCalledWith(
        "Base model 'qwen2.5-coder:1.5b' not found - will auto-pull"
      );
      renderer.showPullStartMessage();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '\n📥 Pulling base model. This may take a few minutes...'
      );
      renderer.startPullSpinner('qwen2.5-coder:1.5b');
      expect(mockOra).toHaveBeenCalledWith('Pulling qwen2.5-coder:1.5b...');
      renderer.onProgress(mockProgressUpdate);
      expect(mockSpinner.text).toBe('downloading (50/100)');
      renderer.onCheckSuccess('base-model', 'Base model pulled successfully');
      expect(mockSpinner.succeed).toHaveBeenCalledWith(
        'Base model pulled successfully'
      );
    });

    it('should handle error flow', () => {
      renderer.onCheckStarted('daemon');
      renderer.onCheckFailure('daemon', new Error('Connection refused'));
      expect(mockSpinner.fail).toHaveBeenCalledWith('Connection refused');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple progress updates', () => {
      renderer.onCheckStarted('base-model');
      renderer.onProgress({ status: 'downloading', current: 25, total: 100 });
      expect(mockSpinner.text).toBe('downloading (25/100)');
      renderer.onProgress({ status: 'downloading', current: 75, total: 100 });
      expect(mockSpinner.text).toBe('downloading (75/100)');
      renderer.onProgress({ status: 'verifying', current: 100, total: 100 });
      expect(mockSpinner.text).toBe('verifying (100/100)');
    });

    it('should handle progress updates with undefined values', () => {
      renderer.onCheckStarted('base-model');
      renderer.onProgress({ status: 'processing' });
      expect(mockSpinner.text).toBe('processing');
      renderer.onProgress({
        status: 'processing',
        current: undefined,
        total: undefined,
      });
      expect(mockSpinner.text).toBe('processing');
    });

    it('should handle zero values in progress', () => {
      renderer.onCheckStarted('base-model');
      renderer.onProgress({ status: 'starting', current: 0, total: 100 });
      expect(mockSpinner.text).toBe('starting (0/100)');
    });
  });
});
