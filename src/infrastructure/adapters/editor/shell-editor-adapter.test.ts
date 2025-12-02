import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EditorPort } from '../../../core/ports/editor-port.js';
import { SystemError, UserError } from '../../../core/types/errors.types.js';
import { ShellEditorAdapter } from './shell-editor-adapter.js';

vi.mock('node:child_process');
vi.mock('node:fs/promises');

const { spawn } = await import('node:child_process');
const { writeFile, readFile, unlink } = await import('node:fs/promises');

describe('ShellEditorAdapter', () => {
  let adapter: ShellEditorAdapter;
  let mockSpawn: ReturnType<typeof vi.fn>;
  let mockWriteFile: ReturnType<typeof vi.fn>;
  let mockReadFile: ReturnType<typeof vi.fn>;
  let mockUnlink: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = new ShellEditorAdapter();
    mockSpawn = vi.mocked(spawn);
    mockWriteFile = vi.mocked(writeFile);
    mockReadFile = vi.mocked(readFile);
    mockUnlink = vi.mocked(unlink);

    vi.stubEnv('EDITOR', undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create adapter with default git directory', () => {
      expect(adapter).toBeInstanceOf(ShellEditorAdapter);
    });

    it('should create adapter with custom git directory', () => {
      const customAdapter = new ShellEditorAdapter('.custom-git');
      expect(customAdapter).toBeInstanceOf(ShellEditorAdapter);
    });
  });

  describe('edit', () => {
    const initialContent = 'feat: initial commit\n\nThis is the commit body';

    it('should spawn editor with stdio inherit and read edited content', async () => {
      const editedContent = 'fix: updated commit\n\nThis is the updated body';

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success exit code
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(editedContent);
      mockUnlink.mockResolvedValue(undefined);

      const result = await adapter.edit(initialContent);

      expect(result).toBe(editedContent);
      expect(mockWriteFile).toHaveBeenCalledWith(
        '.git/COMMIT_EDITMSG_DEVAI-CLI',
        initialContent,
        'utf8'
      );
      expect(mockSpawn).toHaveBeenCalledWith(
        'nano',
        ['.git/COMMIT_EDITMSG_DEVAI-CLI'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
      expect(mockReadFile).toHaveBeenCalledWith(
        '.git/COMMIT_EDITMSG_DEVAI-CLI',
        'utf8'
      );
      expect(mockUnlink).toHaveBeenCalledWith('.git/COMMIT_EDITMSG_DEVAI-CLI');
    });

    it('should use custom git directory when provided', async () => {
      const customAdapter = new ShellEditorAdapter('.custom-git');

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('edited content');
      mockUnlink.mockResolvedValue(undefined);

      await customAdapter.edit(initialContent);

      expect(mockWriteFile).toHaveBeenCalledWith(
        '.custom-git/COMMIT_EDITMSG_DEVAI-CLI',
        initialContent,
        'utf8'
      );
      expect(mockSpawn).toHaveBeenCalledWith(
        'nano',
        ['.custom-git/COMMIT_EDITMSG_DEVAI-CLI'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
    });

    it('should use EDITOR environment variable when set', async () => {
      vi.stubEnv('EDITOR', 'vim');

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('edited content');
      mockUnlink.mockResolvedValue(undefined);

      await adapter.edit(initialContent);

      expect(mockSpawn).toHaveBeenCalledWith(
        'vim',
        ['.git/COMMIT_EDITMSG_DEVAI-CLI'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
    });

    it('should cleanup temp file even when editor fails', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Error exit code
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);

      await expect(adapter.edit(initialContent)).rejects.toThrow();
      expect(mockUnlink).toHaveBeenCalledWith('.git/COMMIT_EDITMSG_DEVAI-CLI');
    });

    it('should cleanup temp file even when readFile fails', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockRejectedValue(new Error('Read failed'));

      await expect(adapter.edit(initialContent)).rejects.toThrow();
      expect(mockUnlink).toHaveBeenCalledWith('.git/COMMIT_EDITMSG_DEVAI-CLI');
    });

    it('should handle spawn error', async () => {
      mockWriteFile.mockResolvedValue(undefined);

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Command not found: nano'));
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);

      await expect(adapter.edit(initialContent)).rejects.toThrow(SystemError);
      await expect(adapter.edit(initialContent)).rejects.toThrow(
        'Failed to spawn editor: command not found'
      );
      // Error remediation is tested through the error type (SystemError) above

      expect(mockUnlink).toHaveBeenCalledWith('.git/COMMIT_EDITMSG_DEVAI-CLI');
    });

    it('should handle editor cancellation (exit code 130)', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(130); // Ctrl+C exit code
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);

      const result = adapter.edit(initialContent);
      await expect(result).rejects.toThrow(UserError);
      await expect(result).rejects.toThrow('Editor cancelled by user');
    });

    it('should handle editor signal termination', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(null); // Signal termination
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);

      const result = adapter.edit(initialContent);
      await expect(result).rejects.toThrow(UserError);
      await expect(result).rejects.toThrow('Editor was terminated by signal');
    });

    it('should handle non-zero editor exit codes', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Generic error exit code
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);

      const result = adapter.edit(initialContent);
      await expect(result).rejects.toThrow(SystemError);
      await expect(result).rejects.toThrow(
        'Editor exited with non-zero code: 1'
      );
    });

    it('should handle writeFile failure', async () => {
      mockWriteFile.mockRejectedValue(new Error('Permission denied'));

      const result = adapter.edit(initialContent);
      await expect(result).rejects.toThrow(SystemError);
      await expect(result).rejects.toThrow(
        'Failed to create temporary file for editor'
      );
    });

    it('should handle readFile failure', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const result = adapter.edit(initialContent);
      await expect(result).rejects.toThrow(SystemError);
      await expect(result).rejects.toThrow(
        'Failed to read edited content from temporary file'
      );
    });

    it('should ignore cleanup errors', async () => {
      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('edited content');
      mockUnlink.mockRejectedValue(new Error('File not found'));

      const result = await adapter.edit(initialContent);

      expect(result).toBe('edited content');
      // Should not throw despite cleanup error
    });
  });

  describe('editor detection', () => {
    it('should default to nano when EDITOR not set', async () => {
      vi.stubEnv('EDITOR', undefined);

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('edited content');
      mockUnlink.mockResolvedValue(undefined);

      await adapter.edit('test');

      expect(mockSpawn).toHaveBeenCalledWith(
        'nano',
        ['.git/COMMIT_EDITMSG_DEVAI-CLI'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
    });

    it('should use EDITOR environment variable when set', async () => {
      vi.stubEnv('EDITOR', 'code --wait');

      const mockChildProcess = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
      } as unknown as ReturnType<typeof spawn>;

      mockSpawn.mockReturnValue(mockChildProcess);
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('edited content');
      mockUnlink.mockResolvedValue(undefined);

      await adapter.edit('test');

      expect(mockSpawn).toHaveBeenCalledWith(
        'code --wait',
        ['.git/COMMIT_EDITMSG_DEVAI-CLI'],
        {
          stdio: 'inherit',
          shell: true,
        }
      );
    });
  });

  describe('interface compliance', () => {
    it('should implement EditorPort interface correctly', () => {
      const editorPort: EditorPort = adapter;
      expect(editorPort).toBeInstanceOf(ShellEditorAdapter);
    });

    it('should have all required methods', () => {
      expect(typeof adapter.edit).toBe('function');
    });
  });
});
