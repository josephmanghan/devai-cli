/**
 * Git Test Harness
 *
 * Provides isolated temporary git repositories for testing.
 * Follows hexagonal architecture adapter pattern.
 */

import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Git test harness interface
 */
export interface GitTestHarness {
  init(): Promise<void>;
  cleanup(): Promise<void>;
  writeFile(filePath: string, content: string): Promise<void>;
  add(files?: string[]): Promise<void>;
  getDiff(): Promise<string>;
  getStatus(): Promise<string>;
}

/**
 * Git test harness implementation
 */
export class TestGitHarness implements GitTestHarness {
  private repoPath: string | null = null;

  constructor() {
    // Repository path will be set during init
  }

  /**
   * Initialize isolated temporary repository
   */
  async init(): Promise<void> {
    this.repoPath = await fs.mkdtemp(path.join(os.tmpdir(), 'git-test-'));

    await this.execGit(['init', '--initial-branch=main']);
    await this.execGit(['config', 'user.name', 'Test User']);
    await this.execGit(['config', 'user.email', 'test@example.com']);
  }

  /**
   * Cleanup temporary repository
   */
  async cleanup(): Promise<void> {
    if (!this.repoPath) {
      return;
    }

    try {
      await fs.rm(this.repoPath, { recursive: true, force: true });
    } catch (error) {
      // Log error but don't throw - cleanup should be resilient
      console.warn('Failed to cleanup git test repository:', error);
    } finally {
      this.repoPath = null;
    }
  }

  /**
   * Write file to repository
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    if (!this.repoPath) {
      throw new Error('Repository not initialized. Call init() first.');
    }

    const fullPath = path.join(this.repoPath, filePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  /**
   * Add files to staging area
   */
  async add(files?: string[]): Promise<void> {
    if (!this.repoPath) {
      throw new Error('Repository not initialized. Call init() first.');
    }

    const args = ['add'];
    if (files) {
      args.push(...files);
    } else {
      args.push('.');
    }

    await this.execGit(args);
  }

  /**
   * Get staged diff
   */
  async getDiff(): Promise<string> {
    if (!this.repoPath) {
      throw new Error('Repository not initialized. Call init() first.');
    }

    const { stdout } = await this.execGit(['diff', '--cached']);
    return stdout;
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<string> {
    if (!this.repoPath) {
      throw new Error('Repository not initialized. Call init() first.');
    }

    const { stdout } = await this.execGit(['status', '--porcelain']);
    return stdout;
  }

  /**
   * Execute git command in repository
   */
  private async execGit(
    args: string[]
  ): Promise<{ stdout: string; stderr: string }> {
    if (!this.repoPath) {
      throw new Error('Repository not initialized. Call init() first.');
    }

    return execa('git', args, {
      cwd: this.repoPath,
      reject: false,
    });
  }
}
