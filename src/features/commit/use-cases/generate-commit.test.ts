import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LlmPort, SystemError, ValidationError } from '../../../core/index.js';
import * as utils from '../utils/index.js';
import { GenerateCommit } from './generate-commit.js';

vi.mock('../utils/index.js');

describe('GenerateCommit', () => {
  const mockLlmProvider = {
    checkConnection: vi.fn(),
    checkModel: vi.fn(),
    deleteModel: vi.fn(),
    createModel: vi.fn(),
    pullModel: vi.fn(),
    generate: vi.fn(),
  } satisfies LlmPort;

  let generateCommit: GenerateCommit;

  beforeEach(() => {
    vi.clearAllMocks();
    generateCommit = new GenerateCommit(mockLlmProvider);
    vi.mocked(utils.buildUserPrompt).mockReturnValue('mock prompt');
    vi.mocked(utils.validateStructure).mockReturnValue({ isValid: true });
    vi.mocked(utils.enforceType).mockImplementation(msg => msg);
    vi.mocked(utils.normalizeFormat).mockImplementation(msg => msg);
  });

  describe('execute', () => {
    const validInput = {
      commitType: 'feat',
      diff: '+ new feature',
      status: 'staged',
    };

    it('should return normalized commit message on successful generation', async () => {
      const mockResponse = 'feat: add new feature';
      mockLlmProvider.generate.mockResolvedValue(mockResponse);
      vi.mocked(utils.normalizeFormat).mockReturnValue('feat: Add new feature');

      const result = await generateCommit.execute(validInput);

      expect(result).toBe('feat: Add new feature');
      expect(mockLlmProvider.generate).toHaveBeenCalledWith('mock prompt', {
        model: 'qwen2.5-coder:1.5b',
        temperature: 0.3,
        num_ctx: 10000,
      });
    });

    it('should retry on validation failure and succeed on second attempt', async () => {
      mockLlmProvider.generate
        .mockResolvedValueOnce('invalid response')
        .mockResolvedValueOnce('feat: add new feature');

      vi.mocked(utils.validateStructure)
        .mockReturnValueOnce({ isValid: false, error: 'Invalid format' })
        .mockReturnValueOnce({ isValid: true });

      vi.mocked(utils.normalizeFormat).mockReturnValue('feat: Add new feature');

      const result = await generateCommit.execute(validInput);

      expect(result).toBe('feat: Add new feature');
      expect(mockLlmProvider.generate).toHaveBeenCalledTimes(2);
      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenNthCalledWith(2, {
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
        retryError: 'Invalid format',
      });
    });

    it('should throw ValidationError after max retries exhausted', async () => {
      mockLlmProvider.generate.mockResolvedValue('invalid response');
      vi.mocked(utils.validateStructure).mockReturnValue({
        isValid: false,
        error: 'Invalid format',
      });

      await expect(generateCommit.execute(validInput)).rejects.toThrow(
        ValidationError
      );
      expect(mockLlmProvider.generate).toHaveBeenCalledTimes(5);
      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenCalledTimes(5);
    });

    it('should propagate SystemError from LlmProvider', async () => {
      const systemError = new SystemError(
        'Connection failed',
        'Check Ollama service'
      );
      mockLlmProvider.generate.mockRejectedValue(systemError);

      await expect(generateCommit.execute(validInput)).rejects.toThrow(
        systemError
      );
    });

    it('should throw ValidationError for empty commit type', async () => {
      const invalidInput = { ...validInput, commitType: '' };

      await expect(generateCommit.execute(invalidInput)).rejects.toThrow(
        new ValidationError(
          'Commit type cannot be empty',
          '[R]egenerate [E]dit manually [C]ancel'
        )
      );
    });

    it('should throw ValidationError for empty diff', async () => {
      const invalidInput = { ...validInput, diff: '' };

      await expect(generateCommit.execute(invalidInput)).rejects.toThrow(
        new ValidationError(
          'Git diff cannot be empty',
          '[R]egenerate [E]dit manually [C]ancel'
        )
      );
    });

    it('should handle different commit types', async () => {
      mockLlmProvider.generate.mockResolvedValue('fix: update api');
      vi.mocked(utils.normalizeFormat).mockReturnValue('fix: Update api');

      const fixInput = { ...validInput, commitType: 'fix' };
      const result = await generateCommit.execute(fixInput);

      expect(result).toBe('fix: Update api');
      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenCalledWith({
        commitType: 'fix',
        diff: '+ new feature',
        status: 'staged',
        retryError: undefined,
      });
    });

    it('should include retry error feedback in subsequent attempts', async () => {
      mockLlmProvider.generate
        .mockResolvedValueOnce('invalid response')
        .mockResolvedValueOnce('feat: add new feature');

      vi.mocked(utils.validateStructure)
        .mockReturnValueOnce({ isValid: false, error: 'Missing colon' })
        .mockReturnValueOnce({ isValid: true });

      await generateCommit.execute(validInput);

      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenNthCalledWith(2, {
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
        retryError: 'Missing colon',
      });
    });
  });

  describe('parseResponse', () => {
    it('should extract commit message from conversational response', async () => {
      mockLlmProvider.generate.mockResolvedValue(
        'Here is the commit message: feat: add new feature'
      );
      vi.mocked(utils.normalizeFormat).mockReturnValue('feat: Add new feature');

      const result = await generateCommit.execute({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
      });

      expect(result).toBe('feat: Add new feature');
    });

    it('should remove markdown formatting from response', async () => {
      mockLlmProvider.generate.mockResolvedValue('```feat: add new feature```');
      vi.mocked(utils.normalizeFormat).mockReturnValue('feat: Add new feature');

      const result = await generateCommit.execute({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
      });

      expect(result).toBe('feat: Add new feature');
    });

    it('should throw ValidationError for empty response', async () => {
      mockLlmProvider.generate.mockResolvedValue('');

      await expect(
        generateCommit.execute({
          commitType: 'feat',
          diff: '+ new feature',
          status: 'staged',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should handle multiline responses by using first line', async () => {
      mockLlmProvider.generate.mockResolvedValue(
        'feat: add new feature\n\nAdditional description'
      );
      vi.mocked(utils.normalizeFormat).mockReturnValue('feat: Add new feature');

      const result = await generateCommit.execute({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
      });

      expect(result).toBe('feat: Add new feature');
    });
  });

  describe('integration with utilities', () => {
    it('should call all processing utilities in correct order', async () => {
      mockLlmProvider.generate.mockResolvedValue('feat: add new feature');

      await generateCommit.execute({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
      });

      expect(vi.mocked(utils.buildUserPrompt)).toHaveBeenCalledWith({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
        retryError: undefined,
      });
      expect(vi.mocked(utils.validateStructure)).toHaveBeenCalledWith(
        'feat: add new feature'
      );
      expect(vi.mocked(utils.enforceType)).toHaveBeenCalledWith(
        'feat: add new feature',
        'feat'
      );
      expect(vi.mocked(utils.normalizeFormat)).toHaveBeenCalledWith(
        'feat: add new feature'
      );
    });

    it('should pass through type enforcement result to normalizer', async () => {
      mockLlmProvider.generate.mockResolvedValue('fix: add new feature');
      vi.mocked(utils.enforceType).mockReturnValue(
        'feat: add new feature (enforced)'
      );
      vi.mocked(utils.normalizeFormat).mockReturnValue(
        'feat: Add new feature (enforced)'
      );

      const result = await generateCommit.execute({
        commitType: 'feat',
        diff: '+ new feature',
        status: 'staged',
      });

      expect(result).toBe('feat: Add new feature (enforced)');
      expect(vi.mocked(utils.enforceType)).toHaveBeenCalledWith(
        'fix: add new feature',
        'feat'
      );
      expect(vi.mocked(utils.normalizeFormat)).toHaveBeenCalledWith(
        'feat: add new feature (enforced)'
      );
    });
  });
});
