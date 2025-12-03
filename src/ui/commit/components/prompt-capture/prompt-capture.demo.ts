import { captureUserPrompt } from './prompt-capture.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1m\x1b[4m▸ ${title}\x1b[0m\n`);
}

async function runDemo() {
  console.clear();
  console.log('🧪 \x1b[1mPromptCapture Component - Manual Verification\x1b[0m');

  scenario('User Prompt Capture - Happy Path');
  console.log(
    'This will show an interactive text input for capturing user context.'
  );
  console.log('Try entering different types of commit descriptions.\n');

  console.log('Examples to try:');
  console.log('  • "Added user authentication with JWT tokens"');
  console.log('  • "Fixed memory leak in data processing module"');
  console.log('  • "Updated documentation for API endpoints"');
  console.log(
    '  • "Refactored component architecture for better maintainability"\n'
  );

  await sleep(3000);

  try {
    const userPrompt = await captureUserPrompt();
    console.log(`\n✅ Captured prompt: "${userPrompt}"`);
    console.log(`📏 Length: ${userPrompt.length} characters`);

    if (userPrompt.length > 100) {
      console.log('💡 Good detailed description provided');
    } else if (userPrompt.length > 50) {
      console.log('💡 Good concise description');
    } else {
      console.log('💡 Brief but adequate description');
    }

    await sleep(2000);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Prompt capture cancelled'
    ) {
      console.log('\n❌ User cancelled the prompt capture');
    } else {
      console.error('\n💥 Unexpected error:', error);
    }
  }

  scenario('Validation Testing - Empty Input');
  console.log(
    'Now try pressing Enter without typing anything to test validation...\n'
  );
  await sleep(2000);

  try {
    await captureUserPrompt();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Prompt capture cancelled'
    ) {
      console.log('✅ Validation works - empty input rejected');
    }
  }

  scenario('Validation Testing - Long Input');
  console.log(
    'Now try typing a very long message (200+ chars) to test length validation...\n'
  );
  await sleep(2000);

  try {
    await captureUserPrompt();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Prompt capture cancelled'
    ) {
      console.log('✅ Validation works - long input rejected');
    }
  }

  scenario('Cancel Handling');
  console.log('Now try pressing Ctrl+C to test cancel handling...\n');
  await sleep(2000);

  try {
    await captureUserPrompt();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Prompt capture cancelled'
    ) {
      console.log('\n✅ Cancel handling works correctly');
    }
  }

  console.log('\n✅ PromptCapture component demo completed');
  console.log('\nFeatures demonstrated:');
  console.log('  • Interactive text input with placeholder guidance');
  console.log('  • Input validation (required field, max length)');
  console.log('  • Helpful placeholder text with examples');
  console.log('  • Cancel handling (Ctrl+C)');
  console.log('  • Clean @clack/prompts interface');
  console.log('  • Character length feedback');
}

runDemo().catch(console.error);
