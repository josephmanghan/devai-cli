import { CommitAction, CommitUiPort } from '../../src/core/index.js';

export class MockCommitUi implements CommitUiPort {
  private commitTypeResponse: string = 'feat';
  private commitActionResponse: CommitAction = CommitAction.APPROVE;

  public selectCommitTypeCalled = 0;
  public previewMessageCalled = 0;
  public selectCommitActionCalled = 0;
  public lastPreviewedMessage: string | null = null;

  setCommitTypeResponse(type: string): void {
    this.commitTypeResponse = type;
  }

  setCommitActionResponse(action: CommitAction): void {
    this.commitActionResponse = action;
  }

  async selectCommitType(): Promise<string> {
    this.selectCommitTypeCalled++;
    return this.commitTypeResponse;
  }

  async previewMessage(message: string): Promise<void> {
    this.previewMessageCalled++;
    this.lastPreviewedMessage = message;
  }

  async selectCommitAction(): Promise<CommitAction> {
    this.selectCommitActionCalled++;
    return this.commitActionResponse;
  }
}
