import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommitAction } from '../../src/core/types/commit.types.js';
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

describe('Commit Happy Path E2E', () => {
  let gitHarness: TestGitHarness;
  let mockLlmProvider: MockLlmProvider;
  let mockCommitUi: MockCommitUi;
  let repoPath: string;

  beforeEach(async () => {
    gitHarness = new TestGitHarness();
    await gitHarness.init();
    repoPath = await gitHarness.getTempDir();

    await gitHarness.writeFile('src/auth.ts', 'export const auth = () => {};');
    await gitHarness.add();

    mockLlmProvider = new MockLlmProvider();
    mockLlmProvider.reset();
    mockLlmProvider.mockResponse(
      'feat: add authentication module\n\nImplement OAuth2 login endpoint'
    );

    mockCommitUi = new MockCommitUi();
    mockCommitUi.setCommitTypeResponse('feat');
    mockCommitUi.setCommitActionResponse(CommitAction.APPROVE);
  });

  afterEach(async () => {
    await gitHarness.cleanup();
  });

  it('should execute full commit workflow end-to-end', async () => {
    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await controller.execute();

    expect(mockCommitUi.selectCommitTypeCalled).toBe(1);
    expect(mockCommitUi.previewMessageCalled).toBe(1);
    expect(mockCommitUi.selectCommitActionCalled).toBe(1);
    expect(mockCommitUi.lastPreviewedMessage).toContain(
      'feat: add authentication'
    );

    expect(mockCommitUi.startThinkingCalled).toBe(1);
    expect(mockCommitUi.stopThinkingCalled).toBe(1);
    expect(mockCommitUi.lastThinkingMessage).toBe(
      'Generating commit message...'
    );

    const log = await gitHarness.getLog();
    expect(log).toContain('feat: add authentication module');

    const status = await gitHarness.getStatus();
    expect(status).toBe('');
  });

  it('should handle different commit types', async () => {
    mockCommitUi.setCommitTypeResponse('fix');
    mockLlmProvider.reset();
    mockLlmProvider.mockResponse('fix: resolve auth token validation bug');

    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await controller.execute();

    const log = await gitHarness.getLog();
    expect(log).toContain('fix: resolve auth token');
  });

  it('should verify working tree is clean after commit', async () => {
    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider);

    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await controller.execute();

    const statusBefore = await gitHarness.getStatus();
    expect(statusBefore).toBe('');

    await gitHarness.writeFile(
      'src/new-file.ts',
      'export const newFile = true;'
    );
    const statusAfter = await gitHarness.getStatus();
    expect(statusAfter).toContain('?? src/new-file.ts');
  });

  it('should maintain spinner lifecycle across regeneration', async () => {
    mockLlmProvider.reset();
    mockLlmProvider.mockResponse('feat: add authentication module');
    mockLlmProvider.mockResponse('feat: add enhanced authentication module');

    let callCount = 0;
    mockCommitUi.selectCommitAction = vi.fn().mockImplementation(async () => {
      callCount++;
      return callCount === 1 ? CommitAction.REGENERATE : CommitAction.APPROVE;
    });

    const gitAdapter = new ShellGitAdapter(repoPath);
    const editorAdapter = new ShellEditorAdapter();

    const validatePreconditions = new ValidatePreconditions(
      gitAdapter,
      mockLlmProvider
    );
    const generateCommit = new GenerateCommit(mockLlmProvider);
    const controller = new CommitController(
      gitAdapter,
      editorAdapter,
      mockCommitUi,
      validatePreconditions,
      generateCommit
    );

    await controller.execute();

    expect(mockCommitUi.startThinkingCalled).toBe(2);
    expect(mockCommitUi.stopThinkingCalled).toBe(2);
  });
});
