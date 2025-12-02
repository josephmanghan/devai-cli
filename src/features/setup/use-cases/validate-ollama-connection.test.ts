import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LlmPort, SystemError } from '../../../core/index.js';
import { ValidateOllamaConnection } from './validate-ollama-connection.js';

const mockLlmPort = {
  checkConnection: vi.fn(),
  checkModel: vi.fn(),
  createModel: vi.fn(),
  pullModel: vi.fn(),
  generate: vi.fn(),
} satisfies LlmPort;

describe('ValidateOllamaConnection', () => {
  let validateConnection: ValidateOllamaConnection;

  beforeEach(() => {
    vi.clearAllMocks();
    validateConnection = new ValidateOllamaConnection(mockLlmPort);
  });

  describe('constructor', () => {
    it('should create instance with injected LlmPort', () => {
      expect(validateConnection).toBeInstanceOf(ValidateOllamaConnection);
    });
  });

  describe('execute', () => {
    it('should complete successfully when daemon is connected', async () => {
      mockLlmPort.checkConnection.mockResolvedValue(true);

      await expect(validateConnection.execute()).resolves.toBeUndefined();
      expect(mockLlmPort.checkConnection).toHaveBeenCalledTimes(1);
    });

    it('should throw SystemError when daemon is not connected', async () => {
      mockLlmPort.checkConnection.mockResolvedValue(false);

      await expect(validateConnection.execute()).rejects.toThrow(SystemError);
      await expect(validateConnection.execute()).rejects.toThrow(
        'Ollama daemon is not running or accessible'
      );
    });

    it('should include correct exit code in SystemError', async () => {
      mockLlmPort.checkConnection.mockResolvedValue(false);

      await expect(validateConnection.execute()).rejects.toMatchObject({
        code: 3,
      });
    });

    it('should provide clear remediation steps', async () => {
      mockLlmPort.checkConnection.mockResolvedValue(false);

      await expect(validateConnection.execute()).rejects.toMatchObject({
        remediation: expect.stringContaining('ollama serve'),
      });
    });
  });
});
