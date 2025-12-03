import ora, { Ora } from 'ora';

import { CommitAction, CommitUiPort } from '../../core/index.js';
import {
  previewMessage,
  selectCommitAction,
  selectCommitType,
} from '../commit/index.js';

/**
 * Console-based primary adapter implementing CommitUiPort.
 * Adapts @clack/prompts UI components to the CommitUiPort interface.
 */
export class CommitAdapter implements CommitUiPort {
  private spinner: Ora | null = null;

  async selectCommitType(): Promise<string> {
    return await selectCommitType();
  }

  async previewMessage(message: string): Promise<void> {
    await previewMessage(message);
  }

  async selectCommitAction(): Promise<CommitAction> {
    return await selectCommitAction();
  }

  startThinking(message: string): void {
    if (this.spinner !== null) {
      this.spinner.stop();
    }
    this.spinner = ora(message).start();
  }

  stopThinking(): void {
    if (this.spinner !== null) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}
