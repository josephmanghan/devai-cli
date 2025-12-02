import { selectCommitType } from './type-selector.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1m\x1b[4m▸ ${title}\x1b[0m\n`);
}

async function runDemo() {
  console.clear();
  console.log('🧪 \x1b[1mTypeSelector Component - Manual Verification\x1b[0m');

  scenario('Type Selection - Happy Path');
  console.log('This will show an interactive selection of commit types.');
  console.log('Try selecting different types with arrow keys or numbers.\n');

  await sleep(2000);

  try {
    const selectedType = await selectCommitType();
    console.log(`\n✅ Selected commit type: ${selectedType}`);
    await sleep(2000);
  } catch (error) {
    if (error instanceof Error && error.message === 'Operation cancelled') {
      console.log('\n❌ User cancelled the operation');
    } else {
      console.error('\n💥 Unexpected error:', error);
    }
  }

  scenario('Cancel Handling');
  console.log('Now try pressing Ctrl+C to test cancel handling...\n');
  await sleep(2000);

  try {
    await selectCommitType();
  } catch (error) {
    if (error instanceof Error && error.message === 'Operation cancelled') {
      console.log('\n✅ Cancel handling works correctly');
    }
  }
}

runDemo().catch(console.error);
