import { CommitAction } from '../types/index.js';

/**
 * UI port for commit operations.
 * Decouples controller logic from console/visual implementation details.
 */
export interface CommitUiPort {
  /**
   * Prompt user to select a commit type.
   * @returns Selected commit type (e.g., 'feat', 'fix', 'chore')
   */
  selectCommitType(): Promise<string>;

  /**
   * Display generated commit message for user review.
   * @param message - The generated commit message to preview
   */
  previewMessage(message: string): Promise<void>;

  /**
   * Prompt user to select an action for the commit message.
   * @returns Selected action (APPROVE, EDIT, REGENERATE, CANCEL)
   */
  selectCommitAction(): Promise<CommitAction>;
}
