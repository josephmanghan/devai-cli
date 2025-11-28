/**
 * Mock LLM Provider Smoke Tests
 *
 * Validates that MockLlmProvider returns mocked strings when called.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockLlmProvider } from './mock-llm-provider';

describe('MockLlmProvider', () => {
  let provider: MockLlmProvider;

  beforeEach(() => {
    provider = new MockLlmProvider();
  });

  it('returns queued mock response', async () => {
    // Queue a specific response
    provider.mockResponse('feat: add new feature');

    const result = await provider.generateCommitMessage('Add new feature');
    expect(result).toBe('feat: add new feature');
    expect(provider.getCallCount()).toBe(1);
  });

  it('returns default response when nothing queued', async () => {
    const result = await provider.generateCommitMessage('Some commit message');
    expect(result).toContain('Mock commit message for');
    expect(result).toContain('Some commit message');
    expect(provider.getCallCount()).toBe(1);
  });

  it('throws queued mock error', async () => {
    const testError = new Error('Mock service unavailable');
    provider.mockError(testError);

    await expect(provider.generateCommitMessage('Test prompt')).rejects.toThrow('Mock service unavailable');
    expect(provider.getCallCount()).toBe(1);
  });

  it('tracks call count and last prompt', async () => {
    await provider.generateCommitMessage('First prompt');
    await provider.generateCommitMessage('Second prompt');

    expect(provider.getCallCount()).toBe(2);
    expect(provider.getLastPrompt()).toBe('Second prompt');
  });

  it('processes multiple queued responses in order', async () => {
    provider.mockResponse('First response');
    provider.mockResponse('Second response');
    provider.mockResponse('Third response');

    const result1 = await provider.generateCommitMessage('Prompt 1');
    const result2 = await provider.generateCommitMessage('Prompt 2');
    const result3 = await provider.generateCommitMessage('Prompt 3');

    expect(result1).toBe('First response');
    expect(result2).toBe('Second response');
    expect(result3).toBe('Third response');
    expect(provider.getCallCount()).toBe(3);
  });

  it('processes queued items in FIFO order', async () => {
    provider.mockResponse('First');
    provider.mockResponse('Second');
    provider.mockResponse('Third');

    const result1 = await provider.generateCommitMessage('Prompt 1');
    const result2 = await provider.generateCommitMessage('Prompt 2');
    const result3 = await provider.generateCommitMessage('Prompt 3');

    expect(result1).toBe('First');
    expect(result2).toBe('Second');
    expect(result3).toBe('Third');
    expect(provider.getCallCount()).toBe(3);
  });

  it('reports service availability', async () => {
    const isAvailable = await provider.isServiceAvailable();
    expect(isAvailable).toBe(true);
  });

  it('resets state correctly', async () => {
    // Setup some state
    provider.mockResponse('Test response');
    provider.mockError(new Error('Test error'));
    await expect(provider.generateCommitMessage('Test prompt')).rejects.toThrow();

    // Verify state exists BEFORE reset
    expect(provider.getCallCount()).toBe(1);
    expect(provider.getQueuedResponseCount()).toBe(1);
    expect(provider.getQueuedErrorCount()).toBe(0); // Error was consumed

    // Reset state
    provider.reset();

    // Verify reset - call count should be 0 after reset
    expect(provider.getCallCount()).toBe(0);
    expect(provider.getQueuedResponseCount()).toBe(0);
    expect(provider.getQueuedErrorCount()).toBe(0);
    expect(provider.getLastPrompt()).toBe(null);
  });

  it('tracks queued response counts correctly', async () => {
    provider.mockResponse('Response 1');
    provider.mockResponse('Response 2');
    provider.mockResponse('Response 3');

    expect(provider.getQueuedResponseCount()).toBe(3);

    // Consume one response
    await provider.generateCommitMessage('Test');
    expect(provider.getQueuedResponseCount()).toBe(2);

    // Consume another
    await provider.generateCommitMessage('Test');
    expect(provider.getQueuedResponseCount()).toBe(1);
  });
});