import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CommitAction,
  CommitUiPort,
  EditorPort,
  GitPort,
  SystemError,
  UserError,
} from '../../../core/index.js';
import { GenerateCommit, ValidatePreconditions } from '../use-cases/index.js';
import { CommitController } from './commit-controller.js';

function getData() {
  return {
    diff: 'diff --git a/file.ts b/file.ts\nindex 1234..5678 100644\n--- a/file.ts\n+++ b/file.ts\n@@ -1,5 +1,6 @@',
    branch: 'main',
    commitType: 'feat',
    message: 'feat: add new feature',
  };
}

describe('CommitController', () => {
  let controller: CommitController;
  let mockProgram: Command;
  let mockGitPort: GitPort;
  let mockEditorPort: EditorPort;
  let mockUi: CommitUiPort;
  let mockValidatePreconditions: Partial<ValidatePreconditions>;
  let mockGenerateCommit: Partial<GenerateCommit>;

  beforeEach(() => {
    const { diff, branch, commitType, message } = getData();

    mockProgram = {
      command: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
    } as unknown as Command;

    mockGitPort = {
      commitChanges: vi.fn().mockResolvedValue(undefined),
      getBranchName: vi.fn().mockResolvedValue(branch),
      getStagedDiff: vi.fn().mockResolvedValue(diff),
      isGitRepository: vi.fn().mockResolvedValue(true),
    } satisfies GitPort;

    mockEditorPort = {
      edit: vi.fn().mockResolvedValue(message),
    } satisfies EditorPort;

    mockUi = {
      selectCommitType: vi.fn().mockResolvedValue(commitType),
      previewMessage: vi.fn().mockResolvedValue(undefined),
      selectCommitAction: vi.fn().mockResolvedValue(CommitAction.APPROVE),
    } satisfies CommitUiPort;

    mockValidatePreconditions = {
      execute: vi.fn().mockResolvedValue({ diff, branch }),
    };

    mockGenerateCommit = {
      execute: vi.fn().mockResolvedValue(message),
    };

    controller = new CommitController(
      mockGitPort,
      mockEditorPort,
      mockUi,
      mockValidatePreconditions as ValidatePreconditions,
      mockGenerateCommit as GenerateCommit
    );
  });

  describe('Command Registration', () => {
    it('should register commit command with program', () => {
      controller.register(mockProgram);

      expect(mockProgram.command).toHaveBeenCalledWith('commit');
      expect(mockProgram.description).toHaveBeenCalledWith(
        'Generate a conventional commit message and commit staged changes'
      );
      expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Command Execution', () => {
    it('should commit changes when user approves', async () => {
      const { message } = getData();

      await controller.execute();

      expect(mockGitPort.commitChanges).toHaveBeenCalledWith(message);
    });

    it('should open editor when user chooses EDIT', async () => {
      const { message } = getData();
      mockUi.selectCommitAction = vi.fn().mockResolvedValue(CommitAction.EDIT);

      await controller.execute();

      expect(mockEditorPort.edit).toHaveBeenCalledWith(message);
      expect(mockGitPort.commitChanges).toHaveBeenCalledWith(message);
    });

    it('should propagate UserError from ValidatePreconditions', async () => {
      const error = new UserError('No staged changes', 'Stage files first');
      mockValidatePreconditions.execute = vi.fn().mockRejectedValue(error);

      await expect(controller.execute()).rejects.toThrow(UserError);
    });

    it('should propagate SystemError from GenerateCommit', async () => {
      const error = new SystemError('Ollama not running', 'Start Ollama');
      mockGenerateCommit.execute = vi.fn().mockRejectedValue(error);

      await expect(controller.execute()).rejects.toThrow(SystemError);
    });

    it('should wrap generic Error as SystemError', async () => {
      mockValidatePreconditions.execute = vi
        .fn()
        .mockRejectedValue(new Error('Network timeout'));

      await expect(controller.execute()).rejects.toThrow(SystemError);
    });

    it('should wrap unknown errors as SystemError', async () => {
      mockValidatePreconditions.execute = vi
        .fn()
        .mockRejectedValue('string error');

      await expect(controller.execute()).rejects.toThrow(SystemError);
    });

    it('should preview message to user', async () => {
      const { message } = getData();

      await controller.execute();

      expect(mockUi.previewMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('Dependency Injection', () => {
    it('should accept all dependencies via constructor', () => {
      expect(controller).toBeDefined();
    });
  });
});
