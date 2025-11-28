/**
 * Git Test Harness Smoke Tests
 *
 * Validates that GitTestHarness creates and cleans up temporary repositories successfully.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestGitHarness } from './git-harness';
import fs from 'fs/promises';

describe('GitTestHarness', () => {
  let harness: TestGitHarness;

  beforeEach(() => {
    harness = new TestGitHarness();
  });

  afterEach(async () => {
    // Ensure cleanup even if test fails
    await harness.cleanup();
  });

  it('creates isolated temporary repository', async () => {
    // Initialize repository
    await harness.init();

    // Write a test file
    await harness.writeFile('test.txt', 'Hello World');
    await harness.add();

    // Verify file is staged
    const status = await harness.getStatus();
    expect(status).toContain('A  test.txt');
  });

  it('cleans up temporary files on cleanup', async () => {
    // Initialize repository
    await harness.init();

    // Write multiple files
    await harness.writeFile('file1.txt', 'Content 1');
    await harness.writeFile('nested/file2.txt', 'Content 2');
    await harness.add();

    // Cleanup should remove all temporary files
    await harness.cleanup();

    // Initialize new harness to verify cleanup worked
    const newHarness = new TestGitHarness();

    // This should not throw and create a new temp directory
    await newHarness.init();
    await newHarness.cleanup();
  });

  it('provides staged diff information', async () => {
    await harness.init();

    // Write and stage a file
    await harness.writeFile('changes.txt', 'Initial content');
    await harness.add();

    // Get diff
    const diff = await harness.getDiff();
    expect(diff).toContain('Initial content');
    expect(diff).toContain('new file mode');
  });

  it('handles cleanup when repository not initialized', async () => {
    // Should not throw when cleanup called without init
    const emptyHarness = new TestGitHarness();
    await expect(emptyHarness.cleanup()).resolves.not.toThrow();
  });

  it('throws error when operations called before init', async () => {
    const uninitializedHarness = new TestGitHarness();

    await expect(uninitializedHarness.writeFile('test.txt', 'content')).rejects.toThrow('Repository not initialized');
    await expect(uninitializedHarness.add()).rejects.toThrow('Repository not initialized');
    await expect(uninitializedHarness.getDiff()).rejects.toThrow('Repository not initialized');
    await expect(uninitializedHarness.getStatus()).rejects.toThrow('Repository not initialized');
  });
});