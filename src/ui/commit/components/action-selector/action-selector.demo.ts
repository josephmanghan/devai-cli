import { selectCommitAction } from './action-selector.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1m\x1b[4m▸ ${title}\x1b[0m\n`);
}

async function runDemo() {
  console.clear();
  console.log(
    '🧪 \x1b[1mActionSelector Component - Manual Verification\x1b[0m'
  );

  scenario('Commit Action Selection');
  console.log('This will show the 4 available actions for commit messages.');
  console.log('Try selecting different actions with arrow keys or numbers.\n');

  await sleep(2000);

  try {
    const selectedAction = await selectCommitAction();
    console.log(`\n✅ Selected action: ${selectedAction}`);

    switch (selectedAction) {
      case 'APPROVE':
        console.log('Would commit the message as-is');
        break;
      case 'EDIT':
        console.log('Would open editor for editing');
        break;
      case 'REGENERATE':
        console.log('Would generate a new message');
        break;
      case 'CANCEL':
        console.log('Would cancel the commit process');
        break;
    }

    await sleep(2000);
  } catch (error) {
    if (error instanceof Error && error.message === 'Operation cancelled') {
      console.log('\n❌ User cancelled the operation');
    } else {
      console.error('\n💥 Unexpected error:', error);
    }
  }

  // Demonstrate cancel handling
  scenario('Cancel Handling');
  console.log('Now try pressing Ctrl+C to test cancel handling...\n');
  await sleep(2000);

  try {
    await selectCommitAction();
  } catch (error) {
    if (error instanceof Error && error.message === 'Operation cancelled') {
      console.log('\n✅ Cancel handling works correctly');
    }
  }

  console.log('\n✅ ActionSelector component demo completed');
  console.log('\nFeatures demonstrated:');
  console.log('  • Four action options with clear descriptions');
  console.log('  • Keyboard shortcuts and arrow key navigation');
  console.log('  • Cancel handling (Ctrl+C)');
  console.log('  • Clean @clack/prompts interface');
}

runDemo().catch(console.error);
