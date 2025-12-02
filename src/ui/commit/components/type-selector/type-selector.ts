import { cancel, isCancel, select } from '@clack/prompts';

import {
  COMMIT_TYPE_DESCRIPTIONS,
  COMMIT_TYPES,
  CommitType,
} from '../../../../core/index.js';

/**
 * Presents numbered list of Conventional Commits types with arrow/number selection support
 * Uses @clack/prompts.select with proper cancel handling
 */
export async function selectCommitType(): Promise<CommitType> {
  const options = COMMIT_TYPES.map(type => ({
    value: type,
    label: type,
    hint: COMMIT_TYPE_DESCRIPTIONS[type],
  }));

  const selectedType = await select({
    message: 'Select commit type:',
    options,
  });

  if (isCancel(selectedType)) {
    cancel('Operation cancelled');
    throw new Error('Operation cancelled by user');
  }

  return selectedType as CommitType;
}
