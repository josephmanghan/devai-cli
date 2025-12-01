import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GitPort } from '../../core/ports/git-port.js';
import { SystemError, UserError } from '../../core/types/errors.types.js';
import { ShellGitAdapter } from './shell-git-adapter.js';

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

const { execa } = await import('execa');

describe('ShellGitAdapter', () => {
  let adapter: ShellGitAdapter;
  let mockExeca: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new ShellGitAdapter();
    mockExeca = vi.mocked(execa);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create adapter without working directory', () => {
      expect(adapter).toBeInstanceOf(ShellGitAdapter);
    });

    it('should create adapter with working directory', () => {
      const adapterWithDir = new ShellGitAdapter('/some/path');
      expect(adapterWithDir).toBeInstanceOf(ShellGitAdapter);
    });
  });

  describe('isGitRepository', () => {
    it('should return true when git rev-parse succeeds', async () => {
      mockExeca.mockResolvedValue({ exitCode: 0, stdout: 'true', stderr: '' });

      const result = await adapter.isGitRepository();

      expect(result).toBe(true);
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--is-inside-work-tree'],
        {
          cwd: undefined,
          reject: false,
        }
      );
    });

    it('should return false when git rev-parse fails with non-zero exit code', async () => {
      mockExeca.mockResolvedValue({
        exitCode: 128,
        stdout: '',
        stderr: 'fatal: not a git repository',
      });

      const result = await adapter.isGitRepository();

      expect(result).toBe(false);
    });

    it('should return false when execa throws error', async () => {
      mockExeca.mockRejectedValue(new Error('Command failed'));

      const result = await adapter.isGitRepository();

      expect(result).toBe(false);
    });

    it('should use working directory when provided', async () => {
      const adapterWithDir = new ShellGitAdapter('/test/dir');
      mockExeca.mockResolvedValue({ exitCode: 0, stdout: 'true', stderr: '' });

      await adapterWithDir.isGitRepository();

      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--is-inside-work-tree'],
        {
          cwd: '/test/dir',
          reject: false,
        }
      );
    });
  });

  describe('getStagedDiff', () => {
    it('should return staged diff content when successful', async () => {
      const diffContent = 'diff --git a/test.txt b/test.txt\n+new content';
      mockExeca.mockResolvedValue({ stdout: diffContent, stderr: '' });

      const result = await adapter.getStagedDiff();

      expect(result).toBe(diffContent);
      expect(mockExeca).toHaveBeenCalledWith('git', ['diff', '--cached'], {
        cwd: undefined,
      });
    });

    it('should return empty string when no staged changes', async () => {
      mockExeca.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await adapter.getStagedDiff();

      expect(result).toBe('');
    });

    it('should throw UserError when not a git repository', async () => {
      mockExeca.mockRejectedValue(new Error('fatal: not a git repository'));

      await expect(adapter.getStagedDiff()).rejects.toThrow(UserError);
      await expect(adapter.getStagedDiff()).rejects.toThrow(
        'Not a git repository'
      );
    });

    it('should throw SystemError when git binary not found', async () => {
      const execError = new Error('ENOENT: no such file or directory');
      execError.message = 'git: command not found';
      mockExeca.mockRejectedValue(execError);

      await expect(adapter.getStagedDiff()).rejects.toThrow(SystemError);
      await expect(adapter.getStagedDiff()).rejects.toThrow('Git not found');
    });

    it('should use working directory when provided', async () => {
      const adapterWithDir = new ShellGitAdapter('/test/dir');
      mockExeca.mockResolvedValue({ stdout: 'diff content', stderr: '' });

      await adapterWithDir.getStagedDiff();

      expect(mockExeca).toHaveBeenCalledWith('git', ['diff', '--cached'], {
        cwd: '/test/dir',
      });
    });
  });

  describe('getBranchName', () => {
    it('should return branch name when git branch --show-current succeeds', async () => {
      mockExeca.mockResolvedValue({ stdout: 'main\n', stderr: '' });

      const result = await adapter.getBranchName();

      expect(result).toBe('main');
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['branch', '--show-current'],
        {
          cwd: undefined,
        }
      );
    });

    it('should fallback to rev-parse when branch --show-current fails', async () => {
      mockExeca
        .mockRejectedValueOnce(new Error('fatal: not a git repository'))
        .mockResolvedValueOnce({ stdout: 'abc123\n', stderr: '' });

      const result = await adapter.getBranchName();

      expect(result).toBe('HEAD-abc123');
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['branch', '--show-current'],
        {
          cwd: undefined,
        }
      );
      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--short', 'HEAD'],
        {
          cwd: undefined,
        }
      );
    });

    it('should throw UserError when not a git repository', async () => {
      mockExeca
        .mockRejectedValueOnce(new Error('fatal: not a git repository'))
        .mockRejectedValueOnce(new Error('fatal: not a git repository'));

      await expect(adapter.getBranchName()).rejects.toThrow(UserError);
    });

    it('should throw SystemError when git binary not found', async () => {
      const execError = new Error('ENOENT: no such file or directory');
      execError.message = 'git: command not found';
      mockExeca.mockRejectedValue(execError);

      await expect(adapter.getBranchName()).rejects.toThrow(SystemError);
    });

    it('should use working directory when provided', async () => {
      const adapterWithDir = new ShellGitAdapter('/test/dir');
      mockExeca.mockResolvedValue({ stdout: 'feature-branch\n', stderr: '' });

      await adapterWithDir.getBranchName();

      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['branch', '--show-current'],
        {
          cwd: '/test/dir',
        }
      );
    });
  });

  describe('commitChanges', () => {
    it('should commit successfully with valid message', async () => {
      const commitMessage = 'feat: add new feature';
      mockExeca.mockResolvedValue({ stdout: '1 file changed', stderr: '' });

      await expect(adapter.commitChanges(commitMessage)).resolves.not.toThrow();

      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', commitMessage],
        {
          cwd: undefined,
        }
      );
    });

    it('should throw UserError with empty message', async () => {
      await expect(adapter.commitChanges('')).rejects.toThrow(UserError);
      await expect(adapter.commitChanges('')).rejects.toThrow(
        'Commit message cannot be empty'
      );
      await expect(adapter.commitChanges('   ')).rejects.toThrow(UserError);
      await expect(adapter.commitChanges('\n')).rejects.toThrow(UserError);
    });

    it('should throw UserError when no staged changes', async () => {
      mockExeca.mockRejectedValue(new Error('fatal: nothing to commit'));

      await expect(adapter.commitChanges('test commit')).rejects.toThrow(
        UserError
      );
      await expect(adapter.commitChanges('test commit')).rejects.toThrow(
        'No staged changes'
      );
    });

    it('should throw SystemError when git binary not found', async () => {
      const execError = new Error('ENOENT: no such file or directory');
      execError.message = 'git: command not found';
      mockExeca.mockRejectedValue(execError);

      await expect(adapter.commitChanges('test commit')).rejects.toThrow(
        SystemError
      );
    });

    it('should use working directory when provided', async () => {
      const adapterWithDir = new ShellGitAdapter('/test/dir');
      const commitMessage = 'feat: test feature';
      mockExeca.mockResolvedValue({ stdout: 'committed', stderr: '' });

      await adapterWithDir.commitChanges(commitMessage);

      expect(mockExeca).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', commitMessage],
        {
          cwd: '/test/dir',
        }
      );
    });
  });

  describe('error mapping', () => {
    it('should map various "not a repository" messages correctly', async () => {
      const errorMessages = [
        'fatal: not a git repository',
        'not a git repository',
        'fatal: not in a git repository',
        'error: not a git repository',
      ];

      for (const errorMessage of errorMessages) {
        mockExeca.mockRejectedValue(new Error(errorMessage));
        await expect(adapter.getStagedDiff()).rejects.toThrow(UserError);
        await expect(adapter.getStagedDiff()).rejects.toThrow(
          'Not a git repository'
        );
      }
    });

    it('should map various "git not found" messages correctly', async () => {
      const errorMessages = [
        'git: command not found',
        'command not found: git',
        'ENOENT: git command not found',
      ];

      for (const errorMessage of errorMessages) {
        const error = new Error(errorMessage);
        error.message = errorMessage;
        mockExeca.mockRejectedValue(error);
        await expect(adapter.getStagedDiff()).rejects.toThrow(SystemError);
        await expect(adapter.getStagedDiff()).rejects.toThrow('Git not found');
      }
    });

    it('should map various "no staged changes" messages correctly', async () => {
      const errorMessages = [
        'fatal: nothing to commit',
        'no changes added to commit',
        'no staged changes',
      ];

      for (const errorMessage of errorMessages) {
        mockExeca.mockRejectedValue(new Error(errorMessage));
        await expect(adapter.commitChanges('test')).rejects.toThrow(UserError);
        await expect(adapter.commitChanges('test')).rejects.toThrow(
          'No staged changes'
        );
      }
    });

    it('should map unknown errors to SystemError with default message', async () => {
      mockExeca.mockRejectedValue(new Error('Unknown git error'));

      await expect(adapter.getStagedDiff()).rejects.toThrow(SystemError);
      await expect(adapter.getStagedDiff()).rejects.toThrow(
        'Failed to get staged diff'
      );
    });
  });

  describe('interface compliance', () => {
    it('should implement GitPort interface correctly', () => {
      const gitPort: GitPort = adapter;
      expect(gitPort).toBeInstanceOf(ShellGitAdapter);
    });

    it('should have all required methods', () => {
      expect(typeof adapter.isGitRepository).toBe('function');
      expect(typeof adapter.getStagedDiff).toBe('function');
      expect(typeof adapter.getBranchName).toBe('function');
      expect(typeof adapter.commitChanges).toBe('function');
    });
  });
});
