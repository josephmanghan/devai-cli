import { text } from '@clack/prompts';
import { isCancel } from '@clack/prompts';

/**
 * Captures user-provided context/intent for commit generation
 */
export async function captureUserPrompt(): Promise<string> {
  const userPrompt = await text({
    message: 'Describe what you changed or provide additional context:',
    placeholder:
      'e.g., "Added user authentication with JWT tokens" or "Fixed memory leak in data processing"',
    validate: value => {
      if (value.length === 0) {
        return 'Please provide some context for the commit';
      }
      if (value.length > 200) {
        return 'Keep it concise (under 200 characters)';
      }
      return undefined;
    },
  });

  if (isCancel(userPrompt)) {
    throw new Error('Prompt capture cancelled');
  }

  return userPrompt as string;
}
