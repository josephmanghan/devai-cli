import * as clackPrompts from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommitType } from '../../../../core/index.js';
import { selectCommitType } from './type-selector.js';

vi.mock('@clack/prompts');

// Mock process.exit to prevent actual exit during tests
const mockProcessExit = vi.fn();
vi.stubGlobal('process', { ...process, exit: mockProcessExit });

describe('TypeSelector', () => {
  const mockSelect = vi.mocked(clackPrompts.select);
  const mockIsCancel = vi.mocked(clackPrompts.isCancel);
  const mockCancel = vi.mocked(clackPrompts.cancel);

  beforeEach(() => {
    mockSelect.mockClear();
    mockIsCancel.mockClear();
    mockCancel.mockClear();
    mockProcessExit.mockClear();
  });

  describe('selectCommitType', () => {
    it('should return selected commit type when user makes selection', async () => {
      const expectedType: CommitType = 'feat';
      mockSelect.mockResolvedValue(expectedType);
      mockIsCancel.mockReturnValue(false);

      const result = await selectCommitType();

      expect(mockSelect).toHaveBeenCalledWith({
        message: 'Select commit type:',
        options: [
          { value: 'feat', label: 'feat', hint: 'A new feature' },
          { value: 'fix', label: 'fix', hint: 'A bug fix' },
          { value: 'docs', label: 'docs', hint: 'Documentation only changes' },
          {
            value: 'style',
            label: 'style',
            hint: 'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
          },
          {
            value: 'refactor',
            label: 'refactor',
            hint: 'A code change that neither fixes a bug nor adds a feature',
          },
          {
            value: 'perf',
            label: 'perf',
            hint: 'A code change that improves performance',
          },
          {
            value: 'test',
            label: 'test',
            hint: 'Adding missing tests or correcting existing tests',
          },
          {
            value: 'build',
            label: 'build',
            hint: 'Changes that affect the build system or external dependencies',
          },
          {
            value: 'ci',
            label: 'ci',
            hint: 'Changes to our CI configuration files and scripts',
          },
          {
            value: 'chore',
            label: 'chore',
            hint: "Other changes that don't modify src or test files",
          },
          {
            value: 'revert',
            label: 'revert',
            hint: 'Reverts a previous commit',
          },
        ],
      });
      expect(result).toBe(expectedType);
    });

    it('should handle cancel operation when user cancels', async () => {
      mockSelect.mockResolvedValue(undefined);
      mockIsCancel.mockReturnValue(true);

      await selectCommitType();

      expect(mockCancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it('should map all 11 commit types with descriptions', async () => {
      const expectedType: CommitType = 'docs';
      mockSelect.mockResolvedValue(expectedType);
      mockIsCancel.mockReturnValue(false);

      await selectCommitType();

      const options = mockSelect.mock.calls[0][0].options;
      expect(options).toHaveLength(11);

      const docsOption = options.find(opt => opt.value === 'docs');
      expect(docsOption).toEqual({
        value: 'docs',
        label: 'docs',
        hint: 'Documentation only changes',
      });
    });

    it('should handle all commit types correctly', async () => {
      const commitTypes: CommitType[] = [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ];

      for (const type of commitTypes) {
        mockSelect.mockResolvedValue(type);
        mockIsCancel.mockReturnValue(false);

        const result = await selectCommitType();
        expect(result).toBe(type);
      }
    });
  });
});
