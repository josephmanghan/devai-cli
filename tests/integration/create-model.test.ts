import { Ollama } from 'ollama';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OllamaAdapter } from '../../src/infrastructure/adapters/ollama/ollama-adapter.js';

describe('createModel Integration Tests', () => {
  const TEST_MODEL_NAME = 'devai-cli-commit-test:latest';
  const TEST_MODEL_BASE = 'devai-cli-commit-test';

  const getInstance = () => {
    const ollama = new Ollama();
    const adapter = new OllamaAdapter(
      ollama,
      'qwen2.5-coder:1.5b',
      `You are a Conventional Commits expert who generates clear, structured commit messages. Your output must follow the exact format:

<type>: <description>

<body>

Rules:
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Description: imperative mood, lowercase, no period, under 50 characters
- Body: explain WHAT and WHY, not HOW, 2-3 sentences maximum
- NO conversational text, explanations, or markdown formatting
- Output ONLY the commit message, nothing else

Examples:
feat: add user authentication API
Implement login endpoint with JWT tokens and user validation.
This enables secure user sessions and protects sensitive routes.

fix: resolve memory leak in data processing
Close database connections properly after query completion.
Prevents memory growth during long-running batch operations.`,
      {
        temperature: 0.2,
        num_ctx: 131072,
        keep_alive: 0,
      }
    );

    return { ollama, adapter };
  };

  const { ollama, adapter } = getInstance();

  beforeAll(async () => {
    const isConnected = await adapter.checkConnection();
    if (!isConnected) {
      throw new Error('Ollama daemon is not running. Start with: ollama serve');
    }

    try {
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      if (modelExists) {
        await ollama.delete({ model: TEST_MODEL_NAME });
        console.log(` Cleaned up existing test model: ${TEST_MODEL_NAME}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up test model: ${error}`);
    }
  });

  afterAll(async () => {
    try {
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      if (modelExists) {
        await ollama.delete({ model: TEST_MODEL_NAME });
        console.log(` Cleaned up test model after tests: ${TEST_MODEL_NAME}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up test model: ${error}`);
    }
  });

  describe('Model Creation Integration', () => {
    it('should create custom model with direct SDK parameters', async () => {
      const baseModelExists = await adapter.checkModel('qwen2.5-coder:1.5b');
      if (!baseModelExists) {
        console.log(
          '⚠️ Base model qwen2.5-coder:1.5b not found, skipping integration test'
        );
        console.log(
          '   To run this test, pull the base model: ollama pull qwen2.5-coder:1.5b'
        );
        return;
      }

      // Consume the generator AND verify it's working
      for await (const update of adapter.createModel(TEST_MODEL_BASE)) {
        // Solves the lint error by USING the variable
        // Also ensures the generator is yielding the expected shape
        expect(update).toHaveProperty('status');
      }

      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      expect(modelExists).toBe(true);

      const generateResponse = await ollama.generate({
        model: TEST_MODEL_NAME,
        prompt: 'Generate a commit message for: fix typo in README',
        stream: false,
      });

      expect(generateResponse.response).toMatch(/^fix:/);
    }, 120000);

    it('should be idempotent (safe to run multiple times)', async () => {
      const baseModelExists = await adapter.checkModel('qwen2.5-coder:1.5b');
      if (!baseModelExists) {
        console.log(
          '⚠️ Base model qwen2.5-coder:1.5b not found, skipping idempotency test'
        );
        return;
      }

      // Should not throw on second call (idempotent)
      for await (const update of adapter.createModel(TEST_MODEL_BASE)) {
        // Solves the lint error by USING the variable
        // Also ensures the generator is yielding the expected shape
        expect(update).toHaveProperty('status');
      }
      for await (const update of adapter.createModel(TEST_MODEL_BASE)) {
        // Solves the lint error by USING the variable
        // Also ensures the generator is yielding the expected shape
        expect(update).toHaveProperty('status');
      }

      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      expect(modelExists).toBe(true);
    }, 60000);
  });

  describe('Error Handling Integration', () => {
    it('should handle missing constructor parameters gracefully', async () => {
      const minimalAdapter = new OllamaAdapter(ollama);

      try {
        for await (const update of minimalAdapter.createModel('test-minimal')) {
          // Solves the lint error by USING the variable
          // Also ensures the generator is yielding the expected shape
          expect(update).toHaveProperty('status');
        }
        // Should not reach here
        expect.fail('Expected createModel to throw an error');
      } catch (error) {
        expect((error as Error).message).toContain('Failed to create model');
      }
    }, 10000);
  });
});
