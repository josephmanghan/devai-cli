# Configuration Fix Plan

## Overview

Fix the configuration conflict bug where the commit generation logic uses hardcoded default parameters instead of the provisioned custom model. This ensures the CLI uses the "baked-in" system prompt and optimized parameters.

## Problem Statement

**Current State:**

- GenerateCommit class uses hardcoded DEFAULT_GENERATION_OPTIONS
- Calls the base model (qwen2.5-coder:1.5b) directly instead of the custom model (devai-cli-commit:latest)
- Ignores the specialized system prompt and configuration defined in conventional-commit-model.config.ts
- keep_alive parameter is missing during generation (potential memory leak) and incorrectly placed in model creation config

**User Impact:**

- **Lower Quality Commits**: The specialized system prompt is ignored, leading to generic or malformed commit messages
- **Resource Inefficiency**: The model stays loaded in VRAM unnecessarily (5-minute default) because keep_alive: 0 is not applied
- **Wasted Setup**: The setup command provisions a custom model that is never actually used

## Solution: Dependency Injection & Config Refactoring

We will refactor the configuration management to explicitly inject the model configuration into the generation use case, rather than relying on internal defaults.

**Key Decision**: We will separate "Model Creation" parameters (Modelfile) from "Runtime Generation" parameters to align with how Ollama works.

## Architecture

### Configuration Flow

```
┌─────────────────────────────────────────────┐
│ Main Composition Root (main.ts)             │
│  - Loads CONVENTIONAL_COMMIT_MODEL_CONFIG   │
│  - Creates GenerateCommit instance          │
│  - Injects config into constructor          │
└─────────────────────────────────────────────┘
                     │
                     │ injects
                     ▼
┌─────────────────────────────────────────────┐
│ GenerateCommit (Business Logic Layer)       │
│  - Uses injected model name (custom)        │
│  - Uses injected keep_alive parameter       │
│  - Delegates to LlmPort                     │
└─────────────────────────────────────────────┘
                     │
                     │ calls
                     ▼
┌─────────────────────────────────────────────┐
│ OllamaAdapter (Infrastructure Layer)        │
│  - Calls Ollama API with correct model      │
│  - Uses baked-in system prompt/params       │
│  - Applies runtime keep_alive               │
└─────────────────────────────────────────────┘
```

## Implementation Steps

### 1. Refactor Core Types

**File:** src/core/types/llm-types.ts

**Goal:** Eliminate duplication between `GenerationOptions` and `OllamaModelConfig` by using type extension.

```typescript
/**
 * Configuration parameters for text generation.
 */
export interface GenerationOptions {
  model: string;
  temperature?: number;
  num_ctx?: number;
  keep_alive?: number;
}

/**
 * Configuration for creating and using custom Ollama models.
 * Extends GenerationOptions with model creation metadata.
 */
export interface OllamaModelConfig extends GenerationOptions {
  readonly baseModel: string;
  readonly systemPrompt: string;
}
```

**Impact:** `OllamaModelConfig` now inherits `model`, `temperature`, `num_ctx`, and `keep_alive` from `GenerationOptions`. This eliminates the nested `parameters` object entirely.

### 2. Update Configuration Values

**File:** src/infrastructure/config/conventional-commit-model.config.ts

Flatten the configuration structure - remove nested `parameters` object. Since `OllamaModelConfig` now extends `GenerationOptions`, all fields are at the top level.

```typescript
import { OllamaModelConfig } from '../../core/index.js';

export const CONVENTIONAL_COMMIT_MODEL_CONFIG: OllamaModelConfig = {
  model: 'devai-cli-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: `...`, // (Existing prompt - ONLY this gets baked via 'system' field in ollama.create())
  temperature: 0.2,
  num_ctx: 131072,
  keep_alive: 0,
};
```

### 3. Update GenerateCommit Use Case

**File:** src/features/commit/use-cases/generate-commit.ts

Remove hardcoded `DEFAULT_GENERATION_OPTIONS` and inject configuration. Pass all runtime parameters explicitly from config.

**Type Safety Note:** Since `OllamaModelConfig` extends `GenerationOptions`, the config object can be spread directly into the `generate()` call. However, we explicitly pass each field for clarity and to avoid passing extra fields like `baseModel` and `systemPrompt` to the LLM provider.

```typescript
export class GenerateCommit {
  private readonly MAX_RETRIES = 5;
  // DELETE: private readonly DEFAULT_GENERATION_OPTIONS

  constructor(
    private readonly llmProvider: LlmPort,
    private readonly config: OllamaModelConfig // Inject config
  ) {}

  // ... inside attemptGeneration ...
  private async attemptGeneration(
    input: GenerateCommitInput,
    retryError?: string
  ): Promise<string> {
    const prompt = this.buildPrompt(input, retryError);

    // Pass all parameters explicitly from injected config
    const rawResponse = await this.llmProvider.generate(prompt, {
      model: this.config.model,
      keep_alive: this.config.keep_alive,
      temperature: this.config.temperature,
      num_ctx: this.config.num_ctx,
    });

    return this.processResponse(rawResponse, input.commitType);
  }
}
```

### 4. Update OllamaAdapter

**File:** src/infrastructure/adapters/ollama/ollama-adapter.ts

Remove the `parameters` constructor parameter and field entirely. Update `createModelStream` to not pass parameters to Ollama.

```typescript
export class OllamaAdapter implements LlmPort {
  constructor(
    private readonly ollamaClient: Ollama,
    private readonly baseModel?: string,
    private readonly systemPrompt?: string
    // DELETE: private readonly parameters?: Record<string, unknown>
  ) {}

  // ... other methods unchanged ...

  private async createModelStream(modelName: string) {
    try {
      return await this.ollamaClient.create({
        model: modelName,
        from: this.baseModel,
        system: this.systemPrompt,
        // DELETE: parameters: this.parameters,
        stream: true as const,
      });
    } catch (error) {
      throw this.wrapOllamaError(error, 'Failed to create model', 'system');
    }
  }
}
```

### 5. Update Composition Root

**File:** src/main.ts

Remove the 4th argument from OllamaAdapter constructor call and inject config into GenerateCommit.

```typescript
function createOllamaAdapter(config: OllamaModelConfig): OllamaAdapter {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    config.baseModel,
    config.systemPrompt
    // DELETE: config.parameters (removed from constructor)
  );
}

export function createCommitCommand(config: OllamaModelConfig): CommitController {
  const ollamaAdapter = createOllamaAdapter(config);
  // ... (other adapters)

  // Inject config into GenerateCommit for runtime parameter access
  const generateCommit = new GenerateCommit(ollamaAdapter, config);

  return new CommitController(..., generateCommit);
}
```

## Testing Strategy

### Unit Tests

#### 1. GenerateCommit Configuration Tests

**File:** src/features/commit/use-cases/generate-commit.test.ts

Update the test suite to verify dependency injection:

```typescript
describe('GenerateCommit', () => {
  // ... setup ...
  const mockConfig = {
    model: 'custom-model:latest',
    keep_alive: 0,
  };

  beforeEach(() => {
    generateCommit = new GenerateCommit(mockLlmProvider, mockConfig);
  });

  it('should use injected model configuration', async () => {
    await generateCommit.execute(validInput);

    expect(mockLlmProvider.generate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        model: 'custom-model:latest', // Verify custom model used
        keep_alive: 0,
      })
    );
  });

  it('should pass temperature and num_ctx from config', async () => {
    await generateCommit.execute(validInput);

    const callArgs = mockLlmProvider.generate.mock.calls[0][1];
    expect(callArgs.temperature).toBe(0.2); // From config
    expect(callArgs.num_ctx).toBe(131072); // From config
  });
});
```

### Manual Verification

Run npm run dev commit and verify logs (if debug enabled) or observe behavior:

1. **Memory**: Check ollama ps immediately after generation; model should disappear quickly (keep_alive: 0).
2. **Quality**: Commit messages should strictly follow the system prompt rules (e.g., lowercase descriptions).

## Files Modified

### Production Code

1. **src/core/types/llm-types.ts** - Make `OllamaModelConfig` extend `GenerationOptions` to eliminate duplication
2. **src/infrastructure/config/conventional-commit-model.config.ts** - Flatten config (remove nested `parameters` object)
3. **src/features/commit/use-cases/generate-commit.ts** - Remove hardcoded defaults, inject config, pass all runtime params explicitly
4. **src/infrastructure/adapters/ollama/ollama-adapter.ts** - Remove `parameters` constructor parameter and field, remove from `createModelStream`
5. **src/main.ts** - Remove 4th argument from OllamaAdapter constructor, inject config into GenerateCommit

### Test Code

6. **src/features/commit/use-cases/generate-commit.test.ts** - Update tests for DI, verify config injection
7. **src/features/setup/controllers/setup-controller.test.ts** - Update mock config structure (flatten `parameters`)
8. **src/features/setup/use-cases/provision-custom-model.test.ts** - Update mock config structure (flatten `parameters`)

### Areas Requiring Type Updates

**Anywhere accessing `config.parameters.*` must be updated to access fields directly:**

- Change `config.parameters.temperature` → `config.temperature`
- Change `config.parameters.num_ctx` → `config.num_ctx`
- Change `config.parameters.keep_alive` → `config.keep_alive`

**Files to search for `config.parameters` or `.parameters.` patterns:**

- All test files creating mock `OllamaModelConfig` objects
- Any code that reads from the config object (use grep to find all usages)

## Dependencies

- None (Internal refactoring only)

## Success Criteria

- [ ] **Model name is dynamically loaded from injected config** (not hardcoded to `devai-cli-commit:latest` or any specific value - should work with whatever config specifies)
- [ ] `keep_alive: 0` is passed to the LLM provider during generation
- [ ] No hardcoded model parameters exist in GenerateCommit class
- [ ] Setup command still successfully provisions the custom model
- [ ] All tests pass
- [ ] **Verify `ollama ps` shows model unloads immediately after generation** (new manual verification step)
