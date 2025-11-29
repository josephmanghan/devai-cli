#!/usr/bin/env tsx

/**
 * Ollama Integration Architecture Validation
 *
 * Purpose: Smoke test to prove fundamental architectural assumptions work:
 * - Ollama SDK can connect to daemon
 * - Custom model instance responds to prompts
 * - Basic validation pipeline (regex) works
 * - No blocking integration issues
 *
 */

import { Ollama } from 'ollama';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ValidationResult {
  step: string;
  status: 'PASS' | 'FAIL';
  duration?: number;
  error?: string;
  details?: Record<string, unknown>;
}

const CONVENTIONAL_COMMITS_PATTERN =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):.+(\n\n.+)/s;

function createSuccessResult(
  step: string,
  details?: Record<string, unknown>,
  duration?: number,
): ValidationResult {
  return { step, status: 'PASS', details, duration };
}

function createFailureResult(step: string, error: string): ValidationResult {
  return { step, status: 'FAIL', error };
}

function printResult(result: ValidationResult): void {
  const statusIcon = result.status === 'PASS' ? '✅' : '❌';
  const durationInfo = result.duration ? ` (${result.duration}ms)` : '';

  console.log(`${statusIcon} ${result.step}${durationInfo}`);

  if (result.status === 'FAIL' && result.error) {
    console.log(`   Error: ${result.error}`);
  }

  if (result.details) {
    console.log(`   Details: ${JSON.stringify(result.details)}`);
  }
}

async function validateDaemonConnectivity(): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    const client = new Ollama({ host: 'http://localhost:11434' });
    await client.list();
    const duration = Date.now() - startTime;

    return createSuccessResult(
      'Ollama Daemon Connectivity',
      { host: 'http://localhost:11434' },
      duration,
    );
  } catch (error) {
    return createFailureResult(
      'Ollama Daemon Connectivity',
      'Ollama not running. Start with: ollama serve',
    );
  }
}

async function validateBaseModel(): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    const client = new Ollama();
    const models = await client.list();
    const hasModel = models.models.some((m) => m.name === 'qwen2.5-coder:1.5b');
    const duration = Date.now() - startTime;

    if (!hasModel) {
      return createFailureResult(
        'Base Model Present',
        'Base model not found. Run: ollama pull qwen2.5-coder:1.5b',
      );
    }

    return createSuccessResult('Base Model Present', { model: 'qwen2.5-coder:1.5b' }, duration);
  } catch (error) {
    return createFailureResult(
      'Base Model Present',
      `Failed to list models: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function validateBasicInference(): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    const client = new Ollama();
    const testPrompt = `Commit Type: feat

Git Diff:
diff --git a/test.ts b/test.ts
+ console.log("hello world");

Generate the commit message following the format rules.`;

    const response = await client.generate({
      model: 'qwen2.5-coder:1.5b',
      prompt: testPrompt,
      options: {
        temperature: 0.2,
        num_ctx: 131072,
      },
      keep_alive: 0, // Unload immediately after inference
    });

    const duration = Date.now() - startTime;
    const responseLength = response.response.length;

    return createSuccessResult(
      'Basic Inference',
      {
        responseLength,
        hasResponse: response.response.length > 0,
        modelUsed: 'qwen2.5-coder:1.5b',
        prompt: testPrompt,
        response: response.response,
      },
      duration,
    );
  } catch (error) {
    return createFailureResult(
      'Basic Inference',
      `Model inference failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function validateModelCleanup(): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    // Wait a brief moment for the unload to complete if it's asynchronous on the daemon side
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use CLI to check running models as it's the most reliable way to verify daemon state
    const { stdout } = await execAsync('ollama ps');

    // Check if our model is in the list of running models
    const isRunning = stdout.includes('qwen2.5-coder:1.5b');
    const duration = Date.now() - startTime;

    if (isRunning) {
      return createFailureResult(
        'Model Cleanup',
        'Model failed to unload. "keep_alive: 0" may not be working or model is stuck.',
      );
    }

    return createSuccessResult(
      'Model Cleanup',
      { status: 'Model unloaded successfully' },
      duration,
    );
  } catch (error) {
    return createFailureResult(
      'Model Cleanup',
      `Failed to check model status: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function validateValidationPattern(): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    const validMessage = `feat: add hello world

Added console log for testing`;

    const isValid = CONVENTIONAL_COMMITS_PATTERN.test(validMessage);
    const duration = Date.now() - startTime;

    if (!isValid) {
      return createFailureResult(
        'Validation Pipeline Pattern',
        'Conventional commits regex pattern is broken',
      );
    }

    return createSuccessResult(
      'Validation Pipeline Pattern',
      { pattern: CONVENTIONAL_COMMITS_PATTERN.source },
      duration,
    );
  } catch (error) {
    return createFailureResult(
      'Validation Pipeline Pattern',
      `Regex validation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function validateSetup(): Promise<ValidationResult[]> {
  console.log('🔍 Validating Ollama Integration Setup...\n');

  const results: ValidationResult[] = [];

  results.push(await validateDaemonConnectivity());
  results.push(await validateBaseModel());

  results.push(await validateBasicInference());
  results.push(await validateModelCleanup());
  results.push(await validateValidationPattern());

  return results;
}

function printInteractionMockup(prompt: string, response: string): void {
  console.log('\n✨ Interaction Preview:\n');

  console.log('┌─ 📨 PROMPT ──────────────────────────────────────┐');
  prompt
    .trim()
    .split('\n')
    .forEach((line) => console.log(`│ ${line}`));
  console.log('└──────────────────────────────────────────────────┘');

  console.log('       ⬇️');

  console.log('┌─ 🤖 RESPONSE ────────────────────────────────────┐');
  response
    .trim()
    .split('\n')
    .forEach((line) => console.log(`│ ${line}`));
  console.log('└──────────────────────────────────────────────────┘');
}

function printResults(results: ValidationResult[]): void {
  console.log('Results:\n');

  for (const result of results) {
    printResult(result);
  }

  const inferenceResult = results.find((r) => r.step === 'Basic Inference');
  if (inferenceResult?.status === 'PASS' && inferenceResult.details) {
    const { prompt, response } = inferenceResult.details as { prompt: string; response: string };
    if (prompt && response) {
      printInteractionMockup(prompt, response);
    }
  }

  const allPassed = results.every((r) => r.status === 'PASS');

  console.log('');

  if (allPassed) {
    console.log('✅ All validation checks passed. Architecture is viable.');
  } else {
    console.log('❌ Some checks failed. Review errors above.');
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const results = await validateSetup();
    printResults(results);

    const allPassed = results.every((r) => r.status === 'PASS');
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Validation script failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith('validate-setup.ts')
) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
