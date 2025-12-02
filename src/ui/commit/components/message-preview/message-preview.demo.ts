import { previewMessage } from './message-preview.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1m\x1b[4m▸ ${title}\x1b[0m\n`);
}

async function runDemo() {
  console.clear();
  console.log(
    '🧪 \x1b[1mMessagePreview Component - Manual Verification\x1b[0m'
  );

  // --- Test Case 1: Valid commit message ---
  scenario('Valid Commit Message');
  console.log('Displaying a properly formatted commit message...\n');

  const validMessage = `feat: add user authentication system

Implement JWT-based authentication with login and registration endpoints.
Add password hashing using bcrypt and session management middleware.
This provides secure user authentication for the API endpoints.`;

  await previewMessage(validMessage);
  await sleep(3000);

  // --- Test Case 2: Empty message ---
  console.log('\n' + '-'.repeat(50));
  scenario('Empty Message Handling');
  console.log('Testing edge case with empty message...\n');

  await previewMessage('');
  await sleep(2000);

  // --- Test Case 3: Whitespace-only message ---
  console.log('\n' + '-'.repeat(50));
  scenario('Whitespace-only Message');
  console.log('Testing edge case with whitespace-only message...\n');

  await previewMessage('   \n  \t  \n   ');
  await sleep(2000);

  // --- Test Case 4: Single line message ---
  console.log('\n' + '-'.repeat(50));
  scenario('Single Line Message');
  console.log('Testing commit message without body...\n');

  await previewMessage('fix: resolve memory leak in user service');
  await sleep(2000);

  // --- Test Case 5: Multi-line with special formatting ---
  console.log('\n' + '-'.repeat(50));
  scenario('Complex Multi-line Message');
  console.log('Testing commit message with multiple paragraphs...\n');

  const complexMessage = `refactor: restructure data access layer

Move database operations to dedicated repository pattern. This separates
concerns and improves testability. The new structure allows for easier
mocking and better separation between business logic and data access.

BREAKING CHANGE: Database client initialization now requires explicit
configuration passed to the repository constructor.`;

  await previewMessage(complexMessage);
  await sleep(3000);

  console.log('\n✅ MessagePreview component demo completed');
  console.log('\nFeatures demonstrated:');
  console.log('  • Proper commit message formatting');
  console.log('  • Edge case handling (empty, whitespace-only)');
  console.log('  • Single and multi-line messages');
  console.log('  • Clean presentation with @clack/prompts.note');
}

runDemo().catch(console.error);
