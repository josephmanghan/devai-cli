import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CommitContext,
  GitPort,
  LlmPort,
  SystemError,
  UserError,
} from '../../../core/index.js';
import { ValidatePreconditions } from './validate-preconditions.js';

// Mock the port interfaces
const mockGitPort = {
  isGitRepository: vi.fn(),
  getStagedDiff: vi.fn(),
  getBranchName: vi.fn(),
  commitChanges: vi.fn(),
} satisfies GitPort;

const mockLlmPort = {
  checkConnection: vi.fn(),
  checkModel: vi.fn(),
  createModel: vi.fn(),
  pullModel: vi.fn(),
  generate: vi.fn(),
} satisfies LlmPort;

describe('ValidatePreconditions', () => {
  let validatePreconditions: ValidatePreconditions;

  beforeEach(() => {
    vi.clearAllMocks();
    validatePreconditions = new ValidatePreconditions(mockGitPort, mockLlmPort);
  });

  describe('constructor', () => {
    it('should create instance with injected dependencies', () => {
      expect(validatePreconditions).toBeInstanceOf(ValidatePreconditions);
    });
  });

  describe('execute', () => {
    const expectedSuccessResult: CommitContext = {
      diff: 'sample staged diff content',
      branch: 'feature/test-branch',
    };

    it('should return CommitContext when all validations pass', async () => {
      // Arrange: Mock all checks to pass
      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(true);
      mockGitPort.getStagedDiff.mockResolvedValue('sample staged diff content');
      mockGitPort.getBranchName.mockResolvedValue('feature/test-branch');

      // Act
      const result = await validatePreconditions.execute();

      // Assert
      expect(result).toEqual(expectedSuccessResult);
      expect(mockLlmPort.checkConnection).toHaveBeenCalledTimes(1);
      expect(mockGitPort.isGitRepository).toHaveBeenCalledTimes(1);
      expect(mockGitPort.getStagedDiff).toHaveBeenCalledTimes(1);
      expect(mockGitPort.getBranchName).toHaveBeenCalledTimes(1);
    });

    it('should throw SystemError when Ollama daemon is not running', async () => {
      // Arrange: Mock daemon check to fail
      mockLlmPort.checkConnection.mockResolvedValue(false);

      // Act & Assert
      await expect(validatePreconditions.execute()).rejects.toThrow(
        SystemError
      );
      await expect(validatePreconditions.execute()).rejects.toThrow(
        'Ollama daemon is not running or accessible'
      );
      await expect(validatePreconditions.execute()).rejects.toMatchObject({
        code: 3,
        remediation:
          'Start the Ollama daemon and ensure it is accepting connections',
      });

      // Verify early exit - other checks should not be called
      expect(mockGitPort.isGitRepository).not.toHaveBeenCalled();
      expect(mockGitPort.getStagedDiff).not.toHaveBeenCalled();
      expect(mockGitPort.getBranchName).not.toHaveBeenCalled();
    });

    it('should throw UserError when current directory is not a git repository', async () => {
      // Arrange: Mock daemon pass, git repo fail
      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(false);

      // Act & Assert
      await expect(validatePreconditions.execute()).rejects.toThrow(UserError);
      await expect(validatePreconditions.execute()).rejects.toThrow(
        'Current directory is not a git repository'
      );
      await expect(validatePreconditions.execute()).rejects.toMatchObject({
        code: 2,
        remediation:
          'Navigate to a git repository or initialize one with `git init`',
      });

      // Verify early exit - staged diff and branch should not be checked
      expect(mockGitPort.getStagedDiff).not.toHaveBeenCalled();
      expect(mockGitPort.getBranchName).not.toHaveBeenCalled();
    });

    it('should throw UserError when no staged changes exist', async () => {
      // Arrange: Mock daemon and repo pass, staged diff fail
      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(true);
      mockGitPort.getStagedDiff.mockResolvedValue(''); // Empty diff
      mockGitPort.getBranchName.mockResolvedValue('main');

      // Act & Assert
      await expect(validatePreconditions.execute()).rejects.toThrow(UserError);
      await expect(validatePreconditions.execute()).rejects.toThrow(
        'No staged changes found'
      );
      await expect(validatePreconditions.execute()).rejects.toMatchObject({
        code: 2,
        remediation:
          'Stage changes using `git add <files>` or `git add .` before running this command',
      });

      // Verify branch name is not requested when no staged changes
      expect(mockGitPort.getBranchName).not.toHaveBeenCalled();
    });

    it('should throw UserError when staged diff contains only whitespace', async () => {
      // Arrange: Mock staged diff with only whitespace
      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(true);
      mockGitPort.getStagedDiff.mockResolvedValue('   \n\t  \n  '); // Only whitespace

      // Act & Assert
      await expect(validatePreconditions.execute()).rejects.toThrow(UserError);
      await expect(validatePreconditions.execute()).rejects.toThrow(
        'No staged changes found'
      );
    });

    it('should continue to branch name check when staged changes exist', async () => {
      // Arrange: All checks pass
      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(true);
      mockGitPort.getStagedDiff.mockResolvedValue('valid diff content');
      mockGitPort.getBranchName.mockResolvedValue('develop');

      // Act
      const result = await validatePreconditions.execute();

      // Assert
      expect(result).toEqual({
        diff: 'valid diff content',
        branch: 'develop',
      });
      expect(mockGitPort.getBranchName).toHaveBeenCalledTimes(1);
    });

    it('should execute validations in correct sequence', async () => {
      // Arrange: Set up call order tracking
      const callOrder: string[] = [];

      mockLlmPort.checkConnection.mockImplementation(async () => {
        callOrder.push('checkConnection');
        return true;
      });

      mockGitPort.isGitRepository.mockImplementation(async () => {
        callOrder.push('isGitRepository');
        return true;
      });

      mockGitPort.getStagedDiff.mockImplementation(async () => {
        callOrder.push('getStagedDiff');
        return 'test diff';
      });

      mockGitPort.getBranchName.mockImplementation(async () => {
        callOrder.push('getBranchName');
        return 'test-branch';
      });

      // Act
      await validatePreconditions.execute();

      // Assert
      expect(callOrder).toEqual([
        'checkConnection',
        'isGitRepository',
        'getStagedDiff',
        'getBranchName',
      ]);
    });

    it('should preserve original diff content including whitespace', async () => {
      // Arrange: Mock diff with specific formatting
      const originalDiff =
        'diff --git a/file.txt b/file.txt\n+++ b/file.txt\n@@ -1,1 +1,2 @@\n line1\n+line2\n';

      mockLlmPort.checkConnection.mockResolvedValue(true);
      mockGitPort.isGitRepository.mockResolvedValue(true);
      mockGitPort.getStagedDiff.mockResolvedValue(originalDiff);
      mockGitPort.getBranchName.mockResolvedValue('feature-branch');

      // Act
      const result = await validatePreconditions.execute();

      // Assert
      expect(result.diff).toBe(originalDiff); // Exact preservation
    });
  });
});
