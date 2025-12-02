import { LlmPort, ProgressUpdate } from '../../src/core/index.js';

export class MockLlmProvider implements LlmPort {
  private responses: string[] = [];
  private errors: Error[] = [];
  private callCount = 0;
  private lastPrompt: string | null = null;

  mockResponse(response: string): void {
    this.responses.push(response);
  }

  mockError(error: Error): void {
    this.errors.push(error);
  }

  getCallCount(): number {
    return this.callCount;
  }

  getLastPrompt(): string | null {
    return this.lastPrompt;
  }

  async generateCommitMessage(prompt: string): Promise<string> {
    this.callCount++;
    this.lastPrompt = prompt;

    if (this.errors.length > 0) {
      const error = this.errors.shift();
      throw error;
    }

    if (this.responses.length > 0) {
      return this.responses.shift()!;
    }

    return `Mock commit message for: ${prompt.substring(0, 50)}...`;
  }

  async isServiceAvailable(): Promise<boolean> {
    return true;
  }

  getQueuedResponseCount(): number {
    return this.responses.length;
  }

  getQueuedErrorCount(): number {
    return this.errors.length;
  }

  reset(): void {
    this.responses = [];
    this.errors = [];
    this.callCount = 0;
    this.lastPrompt = null;
  }

  async checkConnection(): Promise<boolean> {
    return true;
  }

  async checkModel(): Promise<boolean> {
    return true;
  }

  createModel(): AsyncGenerator<ProgressUpdate> {
    return this.emptyAsyncGenerator();
  }

  pullModel(): AsyncGenerator<ProgressUpdate> {
    return this.emptyAsyncGenerator();
  }

  async generate(prompt: string): Promise<string> {
    return this.generateCommitMessage(prompt);
  }

  private async *emptyAsyncGenerator(): AsyncGenerator<ProgressUpdate> {
    // Empty generator for mock
  }
}
