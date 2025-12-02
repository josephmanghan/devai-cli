import { cancel, isCancel, select } from '@clack/prompts';

import { CommitAction } from '../../../../core/index.js';

const ACTION_OPTIONS = [
  {
    value: CommitAction.APPROVE,
    label: 'Approve',
    hint: 'Accept and commit this message',
  },
  {
    value: CommitAction.EDIT,
    label: 'Edit',
    hint: 'Edit the message before committing',
  },
  {
    value: CommitAction.REGENERATE,
    label: 'Regenerate',
    hint: 'Generate a new commit message',
  },
  {
    value: CommitAction.CANCEL,
    label: 'Cancel',
    hint: 'Cancel the commit process',
  },
];

/**
 * Provides [A]pprove, [E]dit, [R]egenerate, [C]ancel options with keyboard shortcuts
 * Uses @clack/prompts.select with proper cancel handling
 */
export async function selectCommitAction(): Promise<CommitAction> {
  const selectedAction = await select({
    message: 'What would you like to do with this commit message?',
    options: ACTION_OPTIONS,
  });

  if (isCancel(selectedAction)) {
    cancel('Operation cancelled');
    // eslint-disable-next-line n/no-process-exit
    process.exit(0);
  }

  return selectedAction;
}
