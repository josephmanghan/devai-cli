/**
 * Mock LLM Provider
 *
 * Implements LlmProvider port interface for testing.
 * Provides deterministic responses without Ollama dependency.
 */

/**
 * LlmProvider port interface (from src/core/ports/llm-provider.ts)
 */
export interface LlmProvider {
  generateCommitMessage(prompt: string): Promise<string>;
  isServiceAvailable(): Promise<boolean>;
}

/**
 * Mock LLM Provider implementation
 */
export class MockLlmProvider implements LlmProvider {
  private responses: string[] = [];
  private errors: Error[] = [];
  private callCount = 0;
  private lastPrompt: string | null = null;

  /**
   * Queue a mock response for the next call
   */
  mockResponse(response: string): void {
    this.responses.push(response);
  }

  /**
   * Queue a mock error for the next call
   */
  mockError(error: Error): void {
    this.errors.push(error);
  }

  /**
   * Get total number of calls made
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Get the last prompt that was provided
   */
  getLastPrompt(): string | null {
    return this.lastPrompt;
  }

  /**
   * Generate a commit message (mock implementation)
   */
  async generateCommitMessage(prompt: string): Promise<string> {
    this.callCount++;
    this.lastPrompt = prompt;

    // Check for queued errors first
    if (this.errors.length > 0) {
      const error = this.errors.shift();
      throw error;
    }

    // Check for queued responses
    if (this.responses.length > 0) {
      return this.responses.shift()!;
    }

    // Default mock response if nothing queued
    return `Mock commit message for: ${prompt.substring(0, 50)}...`;
  }

  /**
   * Check if service is available (always true for mock)
   */
  async isServiceAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Get remaining queued responses count
   */
  getQueuedResponseCount(): number {
    return this.responses.length;
  }

  /**
   * Get remaining queued errors count
   */
  getQueuedErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Reset all mock state
   */
  reset(): void {
    this.responses = [];
    this.errors = [];
    this.callCount = 0;
    this.lastPrompt = null;
  }
}
