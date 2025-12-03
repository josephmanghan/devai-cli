import { CommitAction, CommitUiPort } from '../../src/core/index.js';

export class MockCommitUi implements CommitUiPort {
  private commitTypeResponse: string = 'feat';
  private commitActionResponse: CommitAction = CommitAction.APPROVE;
  private userPromptResponse: string = '';

  public selectCommitTypeCalled = 0;
  public previewMessageCalled = 0;
  public selectCommitActionCalled = 0;
  public captureUserPromptCalled = 0;
  public lastPreviewedMessage: string | null = null;
  public lastCapturedPrompt: string | null = null;

  public startThinkingCalled = 0;
  public stopThinkingCalled = 0;
  public lastThinkingMessage: string | null = null;

  setCommitTypeResponse(type: string): void {
    this.commitTypeResponse = type;
  }

  setCommitActionResponse(action: CommitAction): void {
    this.commitActionResponse = action;
  }

  setUserPromptResponse(prompt: string): void {
    this.userPromptResponse = prompt;
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

  async captureUserPrompt(): Promise<string> {
    this.captureUserPromptCalled++;
    this.lastCapturedPrompt = this.userPromptResponse;
    return this.userPromptResponse;
  }

  startThinking(message: string): void {
    this.startThinkingCalled++;
    this.lastThinkingMessage = message;
  }

  stopThinking(): void {
    this.stopThinkingCalled++;
  }
}
