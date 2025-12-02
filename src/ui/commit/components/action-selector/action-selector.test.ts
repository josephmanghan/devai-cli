import * as clackPrompts from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommitAction } from '../../../../core/index.js';
import { selectCommitAction } from './action-selector.js';

vi.mock('@clack/prompts');

describe('ActionSelector', () => {
  const mockSelect = vi.mocked(clackPrompts.select);
  const mockIsCancel = vi.mocked(clackPrompts.isCancel);
  const mockCancel = vi.mocked(clackPrompts.cancel);

  beforeEach(() => {
    mockSelect.mockClear();
    mockIsCancel.mockClear();
    mockCancel.mockClear();
  });

  describe('selectCommitAction', () => {
    it('should return APPROVE when user selects approve action', async () => {
      const expectedAction: CommitAction = CommitAction.APPROVE;
      mockSelect.mockResolvedValue(expectedAction);
      mockIsCancel.mockReturnValue(false);

      const result = await selectCommitAction();

      expect(mockSelect).toHaveBeenCalledWith({
        message: 'What would you like to do with this commit message?',
        options: [
          {
            value: 'APPROVE',
            label: 'Approve',
            hint: 'Accept and commit this message',
          },
          {
            value: 'EDIT',
            label: 'Edit',
            hint: 'Edit the message before committing',
          },
          {
            value: 'REGENERATE',
            label: 'Regenerate',
            hint: 'Generate a new commit message',
          },
          {
            value: 'CANCEL',
            label: 'Cancel',
            hint: 'Cancel the commit process',
          },
        ],
      });
      expect(result).toBe(expectedAction);
    });

    it('should return EDIT when user selects edit action', async () => {
      const expectedAction: CommitAction = CommitAction.EDIT;
      mockSelect.mockResolvedValue(expectedAction);
      mockIsCancel.mockReturnValue(false);

      const result = await selectCommitAction();

      expect(result).toBe(expectedAction);
    });

    it('should return REGENERATE when user selects regenerate action', async () => {
      const expectedAction: CommitAction = CommitAction.REGENERATE;
      mockSelect.mockResolvedValue(expectedAction);
      mockIsCancel.mockReturnValue(false);

      const result = await selectCommitAction();

      expect(result).toBe(expectedAction);
    });

    it('should return CANCEL when user selects cancel action', async () => {
      const expectedAction: CommitAction = CommitAction.CANCEL;
      mockSelect.mockResolvedValue(expectedAction);
      mockIsCancel.mockReturnValue(false);

      const result = await selectCommitAction();

      expect(result).toBe(expectedAction);
    });

    it('should handle cancel operation when user cancels', async () => {
      mockSelect.mockResolvedValue(undefined);
      mockIsCancel.mockReturnValue(true);

      await expect(selectCommitAction()).rejects.toThrow('Operation cancelled');

      expect(mockCancel).toHaveBeenCalledWith('Operation cancelled');
    });

    it('should provide all four commit action options', async () => {
      mockSelect.mockResolvedValue('APPROVE' as CommitAction);
      mockIsCancel.mockReturnValue(false);

      await selectCommitAction();

      const options = mockSelect.mock.calls[0][0].options;
      expect(options).toHaveLength(4);

      const approveOption = options.find(opt => opt.value === 'APPROVE');
      expect(approveOption).toEqual({
        value: 'APPROVE',
        label: 'Approve',
        hint: 'Accept and commit this message',
      });

      const editOption = options.find(opt => opt.value === 'EDIT');
      expect(editOption).toEqual({
        value: 'EDIT',
        label: 'Edit',
        hint: 'Edit the message before committing',
      });

      const regenerateOption = options.find(opt => opt.value === 'REGENERATE');
      expect(regenerateOption).toEqual({
        value: 'REGENERATE',
        label: 'Regenerate',
        hint: 'Generate a new commit message',
      });

      const cancelOption = options.find(opt => opt.value === 'CANCEL');
      expect(cancelOption).toEqual({
        value: 'CANCEL',
        label: 'Cancel',
        hint: 'Cancel the commit process',
      });
    });

    it('should use appropriate message for the prompt', async () => {
      mockSelect.mockResolvedValue('APPROVE' as CommitAction);
      mockIsCancel.mockReturnValue(false);

      await selectCommitAction();

      expect(mockSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'What would you like to do with this commit message?',
        })
      );
    });

    it('should handle all commit actions correctly', async () => {
      const commitActions: CommitAction[] = [
        CommitAction.APPROVE,
        CommitAction.EDIT,
        CommitAction.REGENERATE,
        CommitAction.CANCEL,
      ];

      for (const action of commitActions) {
        mockSelect.mockResolvedValue(action);
        mockIsCancel.mockReturnValue(false);

        const result = await selectCommitAction();
        expect(result).toBe(action);
      }
    });
  });
});
