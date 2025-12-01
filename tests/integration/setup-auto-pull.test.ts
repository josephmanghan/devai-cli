import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Ollama } from 'ollama';
import type { OllamaModelConfig } from '../../src/core/types/llm-types.js';

import { OllamaAdapter } from '../../src/infrastructure/llm/ollama-adapter.js';
import { SetupCommand } from '../../src/features/setup/setup-command.js';

describe('Setup Command Business Logic Integration Tests', () => {
  let ollamaClient: Ollama;
  let testAdapter: OllamaAdapter;

  const testConfig: OllamaModelConfig = {
    model: 'test-ollatool:latest',
    baseModel: 'smollm:135m',
    systemPrompt: 'Test prompt for integration testing',
    parameters: { temperature: 0.2, num_ctx: 2048, keep_alive: 0 },
  };

  beforeEach(async () => {
    ollamaClient = new Ollama();
    testAdapter = new OllamaAdapter(
      ollamaClient,
      testConfig.baseModel,
      testConfig.systemPrompt,
      testConfig.parameters
    );
  });

  afterEach(async () => {
    try {
      await ollamaClient.delete({ model: testConfig.model });
      await ollamaClient.delete({ model: testConfig.baseModel });
    } catch {
      // Model doesn't exist
    }
  });

  it('should execute complete setup workflow with auto-pull', async () => {
    const setupCommand = new SetupCommand(testConfig, () => testAdapter);
    const program = new Command();

    setupCommand.register(program);

    await program.parseAsync(['node', 'test', 'setup']);

    const baseModelExists = await testAdapter.checkModel(testConfig.baseModel);
    const customModelExists = await testAdapter.checkModel(testConfig.model);
    expect(baseModelExists).toBe(true);
    expect(customModelExists).toBe(true);
  });

  it('should handle missing base model gracefully', async () => {
    try {
      await ollamaClient.delete({ model: testConfig.baseModel });
      await ollamaClient.delete({ model: testConfig.model });
    } catch {
      // Model doesn't exist
    }

    const setupCommand = new SetupCommand(testConfig, () => testAdapter);
    const program = new Command();

    setupCommand.register(program);

    await program.parseAsync(['node', 'test', 'setup']);

    const baseModelExists = await testAdapter.checkModel(testConfig.baseModel);
    const customModelExists = await testAdapter.checkModel(testConfig.model);
    expect(baseModelExists).toBe(true);
    expect(customModelExists).toBe(true);
  });
});
