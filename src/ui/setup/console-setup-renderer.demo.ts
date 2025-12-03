import { OllamaModelConfig } from '../../core/types/llm-types.js';
import { ConsoleSetupRenderer } from './console-setup-renderer.js';

// --- Demo Helpers ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function scenario(title: string) {
  console.log(`\n\x1b[1m\x1b[4m▸ ${title}\x1b[0m\n`);
}

// --- Test Data ---
const mockConfig: OllamaModelConfig = {
  model: 'devai-cli-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: '...',
  temperature: 0.2,
  num_ctx: 1000,
  keep_alive: 0,
};

async function runDemo() {
  console.clear();
  console.log('🧪 \x1b[1mConsoleSetupRenderer - Manual Verification\x1b[0m');

  const renderer = new ConsoleSetupRenderer();

  // --- Successful First Run ---
  scenario('Happy Path: Successful First Run');
  renderer.showIntro();
  await sleep(2000);

  renderer.onCheckStarted('daemon');
  await sleep(200);
  renderer.onCheckSuccess('daemon');
  await sleep(200);

  renderer.onCheckStarted('base-model');
  await sleep(2000);
  renderer.onCheckSuccess('base-model', 'Base model found locally');
  await sleep(1000);

  renderer.showOutro(mockConfig);
  await sleep(2000);

  // --- Missing Base Model (Auto-Pull) ---
  console.log('\n' + '-'.repeat(50));
  scenario('Auto-Pull: Missing Base Model');

  renderer.onCheckStarted('base-model');
  await sleep(2000);
  renderer.showBaseModelMissingWarning('qwen2.5-coder:1.5b');

  renderer.showPullStartMessage();
  renderer.startPullSpinner('qwen2.5-coder:1.5b');

  for (let i = 0; i <= 100; i += 20) {
    renderer.onProgress({
      status: 'downloading',
      current: i,
      total: 100,
    });
    await sleep(1000);
  }

  renderer.onCheckSuccess('base-model', 'Base model pulled successfully');
  await sleep(2000);

  // --- Error Handling ---
  console.log('\n' + '-'.repeat(50));
  scenario('Error: Daemon Failure');

  renderer.onCheckStarted('daemon');
  await sleep(2000);

  renderer.onCheckFailure('daemon', new Error('Connection refused'));
}

runDemo().catch(console.error);
