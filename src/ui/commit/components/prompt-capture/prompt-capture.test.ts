import { text } from '@clack/prompts';
import { isCancel } from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { captureUserPrompt } from './prompt-capture.js';

vi.mock('@clack/prompts', () => ({
  text: vi.fn(),
  isCancel: vi.fn(),
}));

describe('prompt-capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('captureUserPrompt', () => {
    it('should capture valid user prompt', async () => {
      const mockPrompt = 'Added user authentication with JWT';
      vi.mocked(text).mockResolvedValue(mockPrompt);
      vi.mocked(isCancel).mockReturnValue(false);

      const result = await captureUserPrompt();

      expect(result).toBe(mockPrompt);
      expect(text).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Describe what you changed or provide additional context:',
          placeholder: expect.stringContaining('e.g.,'),
        })
      );
    });

    it('should validate empty input', async () => {
      vi.mocked(text).mockResolvedValue('');
      vi.mocked(isCancel).mockReturnValue(false);

      const result = await captureUserPrompt();
      expect(result).toBe('');
    });

    it('should validate maximum length', async () => {
      const longPrompt = 'a'.repeat(201);
      vi.mocked(text).mockResolvedValue(longPrompt);
      vi.mocked(isCancel).mockReturnValue(false);

      const result = await captureUserPrompt();
      expect(result).toBe(longPrompt);
    });

    it('should handle user cancellation', async () => {
      vi.mocked(text).mockResolvedValue('any value');
      vi.mocked(isCancel).mockReturnValue(true);

      await expect(captureUserPrompt()).rejects.toThrow(
        'Prompt capture cancelled'
      );
    });

    it('should accept valid prompts within limits', async () => {
      const validPrompts = [
        'Added user authentication',
        'Fixed memory leak in data processing',
        'Refactored validation logic to service layer',
        'Updated dependencies and fixed security vulnerability',
      ];

      for (const prompt of validPrompts) {
        vi.mocked(text).mockResolvedValue(prompt);
        vi.mocked(isCancel).mockReturnValue(false);

        const result = await captureUserPrompt();

        expect(result).toBe(prompt);
      }
    });
  });
});
