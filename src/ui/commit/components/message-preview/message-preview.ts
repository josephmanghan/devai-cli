import { log } from '@clack/prompts';

/**
 * Displays generated commit messages in terminal for review with proper formatting
 * Uses @clack/prompts.note for clean presentation
 */
export async function previewMessage(message: string): Promise<void> {
  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    await log.warn('No commit message to preview');
    return;
  }

  await log.message(trimmedMessage);
}
