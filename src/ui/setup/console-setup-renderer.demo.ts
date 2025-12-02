import { ConsoleSetupRenderer } from './console-setup-renderer.js';
import { OllamaModelConfig } from '../../core/types/llm-types.js';

// --- Helpers for Gherkin Style Output ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1mSCENARIO: ${title}\x1b[0m`);
}

function step(type: 'GIVEN' | 'WHEN' | 'THEN', text: string) {
  const color = type === 'THEN' ? '\x1b[32m' : '\x1b[36m'; // Green for checks, Cyan for setup
  console.log(`  ${color}${type}\x1b[0m ${text}`);
}

// --- Test Data ---
const mockConfig: OllamaModelConfig = {
  model: 'ollatool-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: '...',
  parameters: { temperature: 0.2, num_ctx: 1000, keep_alive: 0 },
};

async function runDemo() {
  console.clear();
  console.log('🧪 \x1b[1mConsoleSetupRenderer - Manual Verification\x1b[0m');

  const renderer = new ConsoleSetupRenderer();

  // --- Scenario 1: Happy Path ---
  scenario('Successful First Run');
  step('GIVEN', 'the user runs the setup command');
  renderer.showIntro();
  await sleep(1000);

  step('WHEN', 'the daemon check passes');
  renderer.onCheckStarted('daemon');
  await sleep(800);
  renderer.onCheckSuccess('daemon');
  await sleep(500);

  step('WHEN', 'the base model is already cached');
  renderer.onCheckStarted('base-model');
  await sleep(800);
  renderer.onCheckSuccess('base-model', 'Base model found locally');
  await sleep(500);

  step('THEN', 'show the success summary');
  renderer.showOutro(mockConfig);
  await sleep(2000);

  // --- Scenario 2: Missing Model (Downloads) ---
  console.log('\n' + '-'.repeat(50));
  scenario('Missing Base Model (Auto-Pull)');

  step('GIVEN', 'the base model is missing');
  renderer.onCheckStarted('base-model');
  await sleep(1000);
  renderer.showBaseModelMissingWarning('qwen2.5-coder:1.5b');

  step('WHEN', 'the auto-pull starts');
  renderer.showPullStartMessage();
  renderer.startPullSpinner('qwen2.5-coder:1.5b');

  step('THEN', 'show progress updates');
  for (let i = 0; i <= 100; i += 20) {
    renderer.onProgress({
      status: 'downloading',
      current: i,
      total: 100,
    });
    await sleep(300);
  }

  step('THEN', 'show success when download completes');
  renderer.onCheckSuccess('base-model', 'Base model pulled successfully');
  await sleep(1000);

  // --- Scenario 3: Error Handling ---
  console.log('\n' + '-'.repeat(50));
  scenario('Daemon Failure');

  step('WHEN', 'the daemon check fails');
  renderer.onCheckStarted('daemon');
  await sleep(1000);

  step('THEN', 'show the specific error and remediation');
  renderer.onCheckFailure('daemon', new Error('Connection refused'));
}

runDemo().catch(console.error);
