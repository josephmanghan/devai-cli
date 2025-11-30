import { Ollama } from 'ollama';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { OllamaAdapter } from '../../src/infrastructure/llm/ollama-adapter.js';

describe('createModel Integration Tests', () => {
  const TEST_MODEL_NAME = 'ollatool-test-integration:latest';
  const TEST_MODEL_BASE = 'ollatool-test-integration';
  const ollama = new Ollama();

  // Adapter with commit-specific configuration
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

  beforeAll(async () => {
    // Ensure Ollama daemon is running
    const isConnected = await adapter.checkConnection();
    if (!isConnected) {
      throw new Error('Ollama daemon is not running. Start with: ollama serve');
    }

    // Clean up any existing test model
    try {
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      if (modelExists) {
        await ollama.delete({ model: TEST_MODEL_NAME });
        console.log(`✓ Cleaned up existing test model: ${TEST_MODEL_NAME}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up test model: ${error}`);
    }
  });

  afterAll(async () => {
    // Clean up test model after tests
    try {
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      if (modelExists) {
        await ollama.delete({ model: TEST_MODEL_NAME });
        console.log(`✓ Cleaned up test model after tests: ${TEST_MODEL_NAME}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not clean up test model: ${error}`);
    }
  });

  describe('Model Creation Integration', () => {
    it('should create custom model with direct SDK parameters', async () => {
      // Check if base model exists, skip test if not available
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

      // Create the test model
      await expect(adapter.createModel(TEST_MODEL_BASE)).resolves.not.toThrow();

      // Verify model was created
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      expect(modelExists).toBe(true);

      // Test model generation
      const generateResponse = await ollama.generate({
        model: TEST_MODEL_NAME,
        prompt: 'Generate a commit message for: fix typo in README',
        stream: false,
      });

      expect(generateResponse.response).toMatch(/^fix:/);
    }, 120000); // 2 minutes timeout for model creation

    it('should be idempotent (safe to run multiple times)', async () => {
      // Check if base model exists, skip test if not available
      const baseModelExists = await adapter.checkModel('qwen2.5-coder:1.5b');
      if (!baseModelExists) {
        console.log(
          '⚠️ Base model qwen2.5-coder:1.5b not found, skipping idempotency test'
        );
        return;
      }

      // First creation should work (model already exists from previous test)
      await expect(adapter.createModel(TEST_MODEL_BASE)).resolves.not.toThrow();

      // Second creation should also work (idempotency)
      await expect(adapter.createModel(TEST_MODEL_BASE)).resolves.not.toThrow();

      // Model should still exist
      const modelExists = await adapter.checkModel(TEST_MODEL_NAME);
      expect(modelExists).toBe(true);
    }, 60000); // 1 minute timeout
  });

  describe('Error Handling Integration', () => {
    it('should handle missing constructor parameters gracefully', async () => {
      // Create adapter with no parameters (should handle undefined values gracefully)
      const minimalAdapter = new OllamaAdapter(ollama);

      // This should not throw, but may fail at the Ollama SDK level
      await expect(minimalAdapter.createModel('test-minimal')).rejects.toThrow(
        'Failed to create model'
      );
    }, 10000); // 10 second timeout
  });
});
