# Configuration Issue Analysis: Custom Model Not Being Used

## Problem Statement

The `generate-commit` functionality is **not using the custom model** `devai-cli-commit:latest` that was created during setup. Instead, it's calling the base model `qwen2.5-coder:1.5b` directly with hardcoded parameters that differ from the intended configuration.

### Impact

- Custom system prompt: **Not being used**
- Optimized parameters (temperature: 0.2, num_ctx: 131072): **Not being used**
- Memory management (keep_alive: 0): **Missing**
- Setup workflow that creates the custom model: **Wasted effort**

## Problem Spaces

### 1. Model Selection

- **Expected**: Use custom model `devai-cli-commit:latest`
- **Actual**: Uses base model `qwen2.5-coder:1.5b`

### 2. Parameter Configuration

- **Expected**: Use parameters from `CONVENTIONAL_COMMIT_MODEL_CONFIG`
  - temperature: 0.2
  - num_ctx: 131072
  - keep_alive: 0
- **Actual**: Uses hardcoded `DEFAULT_GENERATION_OPTIONS`
  - temperature: 0.3
  - num_ctx: 10000
  - keep_alive: **missing**

### 3. System Prompt

- **Expected**: Use specialized conventional commit system prompt baked into custom model
- **Actual**: Base model has no system prompt

### 4. Memory Management

- **Expected**: Unload model immediately after generation (keep_alive: 0)
- **Actual**: Model stays loaded in memory (5 minute default)

## Root Cause Analysis

### Configuration Flow: Expected vs Actual

#### Model Creation (Working Correctly)

```
CONVENTIONAL_COMMIT_MODEL_CONFIG
    ↓
createSetupCommand()
    ↓
createOllamaAdapter(modelConfig)
    ↓
ProvisionCustomModel
    ↓
Creates: 'devai-cli-commit:latest' with:
  - baseModel: 'qwen2.5-coder:1.5b'
  - systemPrompt: (specialized prompt)
  - parameters: { temperature: 0.2, num_ctx: 131072, keep_alive: 0 }
```

#### Model Usage (Broken)

```
CONVENTIONAL_COMMIT_MODEL_CONFIG
    ↓
createCommitCommand()
    ↓
createOllamaAdapter(modelConfig)
    ↓
GenerateCommit(ollamaAdapter)
    ↓
Uses: DEFAULT_GENERATION_OPTIONS ❌
  - model: 'qwen2.5-coder:1.5b'    (base model, NOT custom!)
  - temperature: 0.3                (wrong value)
  - num_ctx: 10000                  (wrong value)
  - keep_alive: missing             (memory leak)
```

### Why This Happened

1. **OllamaAdapter is configured but not fully utilized**
   - Constructor accepts `baseModel`, `systemPrompt`, `parameters`
   - These are ONLY used for `createModel()`, NOT for `generate()`
   - The `generate()` method accepts `GenerationOptions` which can override everything

2. **GenerateCommit has hardcoded defaults**
   - `DEFAULT_GENERATION_OPTIONS` defined at class level (generate-commit.ts:16-20)
   - Passed directly to `llmProvider.generate()` (generate-commit.ts:72-75)
   - No connection to `CONVENTIONAL_COMMIT_MODEL_CONFIG`

3. **Architectural disconnect**
   - Model creation and model usage are decoupled
   - No mechanism to pass custom model name to `GenerateCommit`
   - Configuration is used for creation but not for generation

## Knowledge Acquired

### Ollama Custom Model Behavior (from Documentation)

#### What Gets Baked Into Custom Models

When you create a custom model using Modelfile:

```typescript
await ollama.create({
  model: 'devai-cli-commit:latest',
  from: 'qwen2.5-coder:1.5b',
  system: '<system prompt>',
  parameters: {
    temperature: 0.2,
    num_ctx: 131072,
    // keep_alive does NOT belong here
  },
});
```

**Baked into model definition:**

- ✅ System prompt (always used when calling this model)
- ✅ Temperature (used as default, can be overridden at runtime)
- ✅ num_ctx (used as default, can be overridden at runtime)

**NOT baked into model:**

- ❌ keep_alive (generation-time parameter for memory management)

#### Runtime Behavior

When calling `generate()` with a custom model:

```typescript
// Minimal call - uses model's defaults
await ollama.generate({
  model: 'devai-cli-commit:latest', // Custom model with baked-in defaults
  prompt: 'test',
  keep_alive: 0, // Only generation-time param needed
});
```

- System prompt: Automatically used (baked in)
- temperature: Uses model default (0.2) unless overridden
- num_ctx: Uses model default (131072) unless overridden
- keep_alive: Must be specified (not a model parameter)

#### Parameter Priority

1. **Runtime options** (if provided) override
2. **Model defaults** (from Modelfile) used if runtime options undefined
3. **Ollama system defaults** used if no model defaults

**Evidence from tests:** `ollama-adapter.test.ts:544-566` shows that passing `undefined` for parameters causes Ollama to use model/system defaults.

### OllamaModelConfig Issue

Current definition includes `keep_alive` as a model parameter:

```typescript
export interface OllamaModelConfig {
  readonly model: string;
  readonly baseModel: string;
  readonly systemPrompt: string;
  readonly parameters: {
    readonly temperature: number;
    readonly num_ctx: number;
    readonly keep_alive: number; // ❌ Wrong: not a model parameter
  };
}
```

**Problem**: `keep_alive` is a generation-time parameter, not a model creation parameter. It should be separated.

## Source Tree Analysis

### Configuration Files

#### `src/infrastructure/config/conventional-commit-model.config.ts`

- **Purpose**: Defines the custom model configuration
- **Current State**: Contains all parameters including keep_alive
- **Issue**: keep_alive shouldn't be in model parameters

```typescript
export const CONVENTIONAL_COMMIT_MODEL_CONFIG: OllamaModelConfig = {
  model: 'devai-cli-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: `<specialized prompt>`,
  parameters: {
    temperature: 0.2,
    num_ctx: 131072,
    keep_alive: 0, // Should be separate
  },
};
```

### Core Types

#### `src/core/types/llm-types.ts`

- **OllamaModelConfig**: Used for model creation
  - Includes: model, baseModel, systemPrompt, parameters
  - Issue: parameters includes keep_alive (should be model-only params)

- **GenerationOptions**: Used for generation calls
  - Includes: model, temperature?, num_ctx?, keep_alive?
  - This is correct for runtime overrides

### Setup Flow (Working)

#### `src/features/setup/use-cases/provision-custom-model.ts`

- **Purpose**: Creates the custom model
- **Current State**: ✅ Working correctly
- **Behavior**:
  - Accepts `OllamaModelConfig` in constructor
  - Passes config to `llmPort.createModel()`
  - Custom model created with baked-in system prompt and parameters

### Generation Flow (Broken)

#### `src/features/commit/use-cases/generate-commit.ts`

- **Purpose**: Generate commit messages using LLM
- **Current State**: ❌ Broken - uses hardcoded defaults
- **Problem Areas**:

```typescript
// Lines 16-20: Hardcoded defaults override config
private readonly DEFAULT_GENERATION_OPTIONS: GenerationOptions = {
  model: 'qwen2.5-coder:1.5b',  // Base model, not custom
  temperature: 0.3,              // Wrong value
  num_ctx: 10000,                // Wrong value
};

// Lines 72-75: Uses hardcoded options
const rawResponse = await this.llmProvider.generate(
  prompt,
  this.DEFAULT_GENERATION_OPTIONS  // ❌ Ignores custom model
);
```

**What's Missing**: No way to inject custom model name or config-based options

### Composition Root

#### `src/main.ts`

- **Purpose**: Wire up dependencies
- **Current State**: Partially working

```typescript
// Line 38-45: Creates adapter with config
function createOllamaAdapter(modelConfig: OllamaModelConfig): OllamaAdapter {
  const ollamaClient = new Ollama();
  return new OllamaAdapter(
    ollamaClient,
    modelConfig.baseModel,
    modelConfig.systemPrompt,
    modelConfig.parameters // Only used for createModel, not generate
  );
}

// Line 63: Creates GenerateCommit without config
const generateCommit = new GenerateCommit(ollamaAdapter);
// ❌ No custom model name or generation options passed
```

**What's Missing**: Pass model name and generation options to GenerateCommit

### Adapter Implementation

#### `src/infrastructure/adapters/ollama/ollama-adapter.ts`

- **Purpose**: Implement LlmPort interface for Ollama
- **Current State**: Working as designed, but design has limitations

```typescript
// Lines 24-29: Constructor stores config
constructor(
  private readonly ollamaClient: Ollama,
  private readonly baseModel?: string,
  private readonly systemPrompt?: string,
  private readonly parameters?: Record<string, unknown>
) {}

// Lines 216-228: Config used for createModel ✅
private async createModelStream(modelName: string) {
  return await this.ollamaClient.create({
    model: modelName,
    from: this.baseModel,      // ✅ Used
    system: this.systemPrompt,  // ✅ Used
    parameters: this.parameters, // ✅ Used
    stream: true,
  });
}

// Lines 145-164: Config NOT used for generate ❌
async generate(prompt: string, options: GenerationOptions): Promise<string> {
  const response = await this.callOllamaGenerate(prompt, options);
  return response.response.trim();
  // ❌ Doesn't use this.systemPrompt or this.parameters
  // ✅ Correct: relies on custom model having them baked in
}

private async callOllamaGenerate(prompt: string, options: GenerationOptions) {
  return await this.ollamaClient.generate({
    model: options.model,              // Uses whatever model is in options
    prompt,
    keep_alive: options.keep_alive,
    options: {
      temperature: options.temperature,
      num_ctx: options.num_ctx,
    },
  });
}
```

**Observation**: The adapter is correctly designed - it expects callers to pass the right model name in GenerationOptions. The problem is that GenerateCommit doesn't do this.

### Test Evidence

#### `src/infrastructure/adapters/ollama/ollama-adapter.test.ts`

```typescript
// Lines 544-566: Minimal options test
it('should handle undefined optional parameters', async () => {
  const minimalOptions = { model: 'llama2' };
  const result = await adapter.generate('Test prompt', minimalOptions);

  expect(mockOllamaClient.generate).toHaveBeenCalledWith({
    model: 'llama2',
    prompt: 'Test prompt',
    keep_alive: undefined, // Model/system default used
    options: {
      temperature: undefined, // Model default used
      num_ctx: undefined, // Model default used
    },
  });
});
```

**Key Finding**: Passing `undefined` for parameters means "use model defaults" - proves that custom model parameters would be used automatically.

## File Dependency Graph

```
Configuration:
  conventional-commit-model.config.ts
    ↓ provides OllamaModelConfig

Setup Path (✅ Working):
  main.ts → createSetupCommand()
    ↓ passes modelConfig
  setup-controller.ts
    ↓ passes modelConfig
  provision-custom-model.ts
    ↓ calls llmPort.createModel()
  ollama-adapter.ts → createModelStream()
    ↓ uses baseModel, systemPrompt, parameters
  Result: Custom model created with baked-in config

Generation Path (❌ Broken):
  main.ts → createCommitCommand()
    ↓ passes modelConfig to createOllamaAdapter() ✅
    ↓ but NOT to GenerateCommit() ❌
  commit-controller.ts
    ↓ calls generateCommit.execute()
  generate-commit.ts
    ↓ uses hardcoded DEFAULT_GENERATION_OPTIONS ❌
  ollama-adapter.ts → generate()
    ↓ calls base model with wrong params
  Result: Custom model ignored, wrong config used
```

## Key Findings Summary

1. **Custom model is created correctly** with baked-in system prompt and parameters
2. **GenerateCommit bypasses the custom model** by using hardcoded base model name
3. **OllamaAdapter is working as designed** - the problem is in GenerateCommit
4. **keep_alive is misclassified** as a model parameter (should be generation-only)
5. **GenerateCommit needs dependency injection** of model name and/or generation options
6. **The simplest fix**: Pass custom model name to GenerateCommit, only specify keep_alive

## Architecture Insight

The current architecture creates a custom model with baked-in configuration but then **doesn't use it**. The fix requires ensuring that:

1. `GenerateCommit` knows which model to use (custom, not base)
2. `GenerateCommit` only needs to specify `keep_alive` (other params are in model)
3. `OllamaModelConfig` separates model-time params from generation-time params

This is a **dependency injection issue**, not an adapter design issue.
