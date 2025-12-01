import { spawn } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { EditorPort, SystemError, UserError } from '../../../core/index.js';

export class ShellEditorAdapter implements EditorPort {
  /**
   * Create ShellEditorAdapter with optional custom git directory
   * @param gitDir - Directory containing .git metadata. Defaults to '.git'
   */
  constructor(private readonly gitDir: string = '.git') {}

  async edit(initialContent: string): Promise<string> {
    const tempPath = this.getTempFilePath();

    try {
      await this.writeTempFile(tempPath, initialContent);
      return await this.spawnEditor(tempPath);
    } finally {
      await this.cleanupTempFile(tempPath);
    }
  }

  private getTempFilePath(): string {
    return join(this.gitDir, 'COMMIT_EDITMSG_OLLATOOL');
  }

  private async writeTempFile(path: string, content: string): Promise<void> {
    try {
      await writeFile(path, content, 'utf8');
    } catch {
      throw new SystemError(
        'Failed to create temporary file for editor',
        'Check .git directory exists and is writable'
      );
    }
  }

  /**
   * Spawn the editor process and wait for completion
   * @param tempPath - Path to temporary file for editor content
   * @returns Promise resolving to edited content
   */
  private async spawnEditor(tempPath: string): Promise<string> {
    const editorCommand = this.getEditorCommand();

    return await new Promise((resolve, reject) => {
      const child = spawn(editorCommand, [tempPath], {
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', code =>
        this.handleEditorClose(code, tempPath, resolve, reject)
      );
      child.on('error', _error => this.handleSpawnError(reject));
    });
  }

  private getEditorCommand(): string {
    const editor = process.env.EDITOR;
    return editor ?? 'nano';
  }

  private async readEditedContent(path: string): Promise<string> {
    try {
      return await readFile(path, 'utf8');
    } catch {
      throw new SystemError(
        'Failed to read edited content from temporary file',
        'Check file permissions and disk space'
      );
    }
  }

  /**
   * Handle editor process close event
   * @param code - Exit code from editor process
   * @param tempPath - Path to temporary file
   * @param resolve - Promise resolve function
   * @param reject - Promise reject function
   */
  private handleEditorClose(
    code: number | null,
    tempPath: string,
    resolve: (value: string) => void,
    reject: (reason: unknown) => void
  ): void {
    if (code === 0) {
      this.readEditedContent(tempPath).then(resolve).catch(reject);
      return;
    }

    reject(this.handleEditorExit(code));
  }

  private handleSpawnError(reject: (reason: unknown) => void): void {
    reject(
      new SystemError(
        'Failed to spawn editor: command not found',
        'Check that $EDITOR is valid or nano is installed'
      )
    );
  }

  /**
   * Create appropriate error based on editor exit code
   * @param code - Exit code from editor process (null if terminated by signal)
   * @returns UserError or SystemError with appropriate message
   */
  private handleEditorExit(code: number | null): UserError | SystemError {
    if (code === null) {
      return new UserError(
        'Editor was terminated by signal',
        'Try running the command again'
      );
    }

    if (code === 130) {
      return new UserError('Editor cancelled by user', 'No changes were made');
    }

    return new SystemError(
      `Editor exited with non-zero code: ${code}`,
      'Check editor configuration and try again'
    );
  }

  private async cleanupTempFile(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch {
      // Ignore cleanup errors - file may not exist
    }
  }
}
