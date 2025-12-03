import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CommitAction,
  OllamaModelConfig,
  UserError,
} from '../../src/core/index.js';
import { CommitController } from '../../src/features/commit/controllers/commit-controller.js';
import {
  GenerateCommit,
  ValidatePreconditions,
} from '../../src/features/commit/index.js';
import { ShellEditorAdapter } from '../../src/infrastructure/adapters/editor/shell-editor-adapter.js';
import { ShellGitAdapter } from '../../src/infrastructure/adapters/git/shell-git-adapter.js';
import { TestGitHarness } from '../helpers/git-harness.js';
import { MockCommitUi } from '../helpers/mock-commit-ui.js';
import { MockLlmProvider } from '../helpers/mock-llm-provider.js';

describe('Commit Error Paths E2E', () => {
  let gitHarness: TestGitHarness;
  let mockLlmProvider: MockLlmProvider;
  let mockCommitUi: MockCommitUi;
  let repoPath: string;

  const mockConfig: OllamaModelConfig = {
    model: 'test-model:latest',
    baseModel: 'qwen2.5-coder:1.5b',
    systemPrompt: 'Test prompt',
    temperature: 0.2,
    num_ctx: 131072,
    keep_alive: 0,
  };

  beforeEach(async () => {
    gitHarness = new TestGitHarness();
    await gitHarness.init();
    repoPath = await gitHarness.getTempDir();

    mockLlmProvider = new MockLlmProvider();
    mockCommitUi = new MockCommitUi();
  });

  afterEach(async () => {
    await gitHarness.cleanup();
  });

  it('should handle no staged changes error', async () => {
    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider, mockConfig);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await expect(controller.execute()).rejects.toThrow(UserError);
    await expect(controller.execute()).rejects.toThrow(
      'No staged changes found'
    );

    expect(mockCommitUi.startThinkingCalled).toBe(0);
    expect(mockCommitUi.stopThinkingCalled).toBe(0);
  });

  it('should handle user cancel action', async () => {
    await gitHarness.writeFile('test.ts', 'content');
    await gitHarness.add();

    mockCommitUi.setCommitActionResponse(CommitAction.CANCEL);
    mockLlmProvider.mockResponse('feat: test message');

    let exitCalled = false;
    let exitCode: number | undefined;

    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null) => {
        exitCalled = true;
        exitCode = typeof code === 'number' ? code : undefined;
        throw new Error('Process exit was called');
      });

    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider, mockConfig);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await expect(controller.execute()).rejects.toThrow();
    expect(exitCalled).toBe(true);
    expect(exitCode).toBe(0);

    expect(mockCommitUi.startThinkingCalled).toBe(1);
    expect(mockCommitUi.stopThinkingCalled).toBe(1);

    exitSpy.mockRestore();
  });

  it('should propagate errors through full workflow', async () => {
    await gitHarness.writeFile('test.ts', 'content');
    await gitHarness.add();

    mockLlmProvider.mockError(new Error('Ollama connection failed'));

    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider, mockConfig);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await expect(controller.execute()).rejects.toThrow();

    expect(mockCommitUi.startThinkingCalled).toBe(1);
    expect(mockCommitUi.stopThinkingCalled).toBe(1);
  });
});
