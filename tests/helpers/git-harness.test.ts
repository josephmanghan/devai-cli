import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TestGitHarness } from './git-harness.js';

describe('GitTestHarness', () => {
  let harness: TestGitHarness;

  beforeEach(() => {
    harness = new TestGitHarness();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  it('creates isolated temporary repository', async () => {
    await harness.init();

    await harness.writeFile('test.txt', 'Hello World');
    await harness.add();

    const status = await harness.getStatus();
    expect(status).toContain('A  test.txt');
  });

  it('cleans up temporary files on cleanup', async () => {
    await harness.init();

    await harness.writeFile('file1.txt', 'Content 1');
    await harness.writeFile('nested/file2.txt', 'Content 2');
    await harness.add();

    await harness.cleanup();

    const newHarness = new TestGitHarness();

    await newHarness.init();
    await newHarness.cleanup();
  });

  it('provides staged diff information', async () => {
    await harness.init();

    await harness.writeFile('changes.txt', 'Initial content');
    await harness.add();

    const diff = await harness.getDiff();
    expect(diff).toContain('Initial content');
    expect(diff).toContain('new file mode');
  });

  it('handles cleanup when repository not initialized', async () => {
    const emptyHarness = new TestGitHarness();
    await expect(emptyHarness.cleanup()).resolves.not.toThrow();
  });

  it('throws error when operations called before init', async () => {
    const uninitializedHarness = new TestGitHarness();

    await expect(
      uninitializedHarness.writeFile('test.txt', 'content')
    ).rejects.toThrow('Repository not initialized');
    await expect(uninitializedHarness.add()).rejects.toThrow(
      'Repository not initialized'
    );
    await expect(uninitializedHarness.getDiff()).rejects.toThrow(
      'Repository not initialized'
    );
    await expect(uninitializedHarness.getStatus()).rejects.toThrow(
      'Repository not initialized'
    );
  });
});
