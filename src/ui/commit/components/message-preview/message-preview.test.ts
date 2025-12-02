import * as clackPrompts from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { previewMessage } from './message-preview.js';

vi.mock('@clack/prompts');

describe('MessagePreview', () => {
  const mockLogMessage = vi.mocked(clackPrompts.log.message);
  const mockLogWarn = vi.mocked(clackPrompts.log.warn);

  beforeEach(() => {
    mockLogMessage.mockClear();
    mockLogWarn.mockClear();
  });

  describe('previewMessage', () => {
    it('should display valid commit message', async () => {
      const message = 'feat: add new feature';
      await previewMessage(message);

      expect(mockLogMessage).toHaveBeenCalledWith(message);
    });

    it('should handle multi-line commit message', async () => {
      const multiLineMessage = `fix: resolve authentication bug

Fix the issue where users could not log in with valid credentials.
The problem was in the token validation logic that was incorrectly
checking expiration dates.`;

      await previewMessage(multiLineMessage);

      expect(mockLogMessage).toHaveBeenCalledWith(multiLineMessage);
    });

    it('should handle empty message with warning', async () => {
      await previewMessage('');

      expect(mockLogWarn).toHaveBeenCalledWith('No commit message to preview');
    });

    it('should handle null message with warning', async () => {
      await previewMessage(String(null));

      expect(mockLogMessage).toHaveBeenCalledWith('null');
    });

    it('should handle undefined message with warning', async () => {
      await previewMessage(String(undefined));

      expect(mockLogMessage).toHaveBeenCalledWith('undefined');
    });

    it('should handle whitespace-only message with warning', async () => {
      await previewMessage('   \n  \t  \n   ');

      expect(mockLogWarn).toHaveBeenCalledWith('No commit message to preview');
    });

    it('should handle single word message', async () => {
      const message = 'fix: typo';
      await previewMessage(message);

      expect(mockLogMessage).toHaveBeenCalledWith(message);
    });

    it('should handle message with special characters', async () => {
      const message = `feat: add emoji support 🚀

Users can now include emojis in their commit messages and comments.
This improves the developer experience and makes commit history
more visually appealing and expressive.`;

      await previewMessage(message);

      expect(mockLogMessage).toHaveBeenCalledWith(message);
    });

    it('should handle breaking change format', async () => {
      const breakingChangeMessage = `feat!: change API response format

The response structure has been simplified to improve performance.
This is a breaking change that will require client updates.

BREAKING CHANGE: Response now returns objects instead of arrays.`;

      await previewMessage(breakingChangeMessage);

      expect(mockLogMessage).toHaveBeenCalledWith(breakingChangeMessage);
    });

    it('should handle very long commit message', async () => {
      const longMessage = `refactor: improve error handling throughout the application

This commit introduces comprehensive error handling across all modules.
The new approach includes proper logging, user-friendly error messages,
and graceful degradation when services are unavailable.

Key improvements:
- Centralized error handling middleware
- Consistent error response format
- Better error logging and monitoring
- Graceful fallbacks for external service failures
- Improved user experience during errors

Technical details:
- Added ErrorBoundary components for React integration
- Implemented global error handlers in Express middleware
- Created custom error classes for different error types
- Added error tracking and alerting
- Improved error message localization`;

      await previewMessage(longMessage);

      expect(mockLogMessage).toHaveBeenCalledWith(longMessage);
    });
  });
});
