# Plan: Eliminate Modelfile Parsing and Use Direct SDK Parameters

## Problem Summary

The current implementation has unnecessary complexity with ~200+ lines of Modelfile parsing logic. The Ollama JS SDK doesn't properly support Modelfile content, and we need to eliminate parsing while maintaining proper component separation for reusable vs commit-specific functionality.

## Current Issues

1. **Over-engineering**: Complex parsing logic when we can pass parameters directly to SDK
2. **Component coupling**: OllamaAdapter mixed generic LLM operations with commit-specific logic
3. **SDK limitations**: JS SDK doesn't handle Modelfile content like the CLI
4. **Maintenance overhead**: Complex code that's hard to understand and modify
5. **Violates YAGNI**: Parsing functionality that isn't actually needed

## Solution: Direct SDK Parameters with Proper Componentization

### Key Insights

1. **Use Ollama JS SDK directly**: Pass `model`, `from`, `system`, `parameters` to `create()` method
2. **Eliminate Modelfile dependency**: Hardcode known parameters instead of parsing file
3. **Maintain component reusability**: Keep OllamaAdapter generic, isolate commit-specific logic
4. **Proper separation**: Generic LLM operations vs commit-specific model creation

### Implementation Plan

#### Phase 1: Extract Commit-Specific Data and Logic

**Files:**

- `src/infrastructure/llm/ollama-adapter.ts` - Remove parsing, keep generic methods
- `src/infrastructure/llm/commit-model-config.ts` - New file for commit-specific configuration
- `src/assets/ollatool-commit-modelfile.txt` - Remove this file

1. **Create commit model configuration** (`src/infrastructure/llm/commit-model-config.ts`):

   ```typescript
   export interface CommitModelConfig {
     model: string;
     baseModel: string;
     systemPrompt: string;
     parameters: {
       temperature: number;
       num_ctx: number;
       keep_alive: number;
     };
   }

   export const COMMIT_MODEL_CONFIG: CommitModelConfig = {
     model: 'ollatool-commit:latest',
     baseModel: 'qwen2.5-coder:1.5b',
     systemPrompt: `You are a Conventional Commits expert who generates clear, structured commit messages...`,
     parameters: {
       temperature: 0.2,
       num_ctx: 131072,
       keep_alive: 0,
     },
   };
   ```

#### Phase 2: Simplify OllamaAdapter.createModel()

**File: `src/infrastructure/llm/ollama-adapter.ts`**

1. **Remove all parsing methods** (~12 private methods):
   - All parsing-related methods and their dependencies

2. **Simplify createModelWithProgress() with direct SDK call**:

   ```typescript
   private async createModelWithProgress(modelName: string): Promise<void> {
     const spinner = ora(`Creating model '${modelName}'...`).start();

     try {
       const stream = await this.ollamaClient.create({
         model: modelName,
         from: this.baseModel,
         system: this.systemPrompt,
         parameters: this.parameters,
         stream: true as const
       });

       await this.processCreationStream(stream, spinner);
       spinner.succeed(`✓ Model '${modelName}' created successfully`);
     } catch (error) {
       spinner.fail(`✗ Failed to create model '${modelName}'`);
       throw this.wrapOllamaError(error, 'Failed to create model');
     }
   }
   ```

3. **Add constructor injection for commit-specific data**:
   ```typescript
   constructor(
     private readonly ollamaClient: Ollama,
     private readonly baseModel?: string,
     private readonly systemPrompt?: string,
     private readonly parameters?: Record<string, unknown>
   ) {}
   ```

#### Phase 3: Update Tests and Fix API

**File: `src/infrastructure/llm/ollama-adapter.test.ts`**

1. **Update test expectations** to expect SDK parameters:

   ```typescript
   expect(mockOllamaClient.create).toHaveBeenCalledWith({
     model: 'test-model',
     from: 'qwen2.5-coder:1.5b',
     system: 'You are a Conventional Commits expert...',
     parameters: {
       temperature: 0.2,
       num_ctx: 131072,
       keep_alive: 0,
     },
     stream: true,
   });
   ```

2. **Update constructor instantiation** in tests to inject commit-specific data

3. **Remove parsing-related tests** since parsing logic is eliminated

#### Phase 4: Update Integration Tests

**File: `tests/integration/create-model.test.ts`**

1. **Update to use direct SDK parameters** instead of file paths
2. **Remove file system dependencies** from integration tests

#### Phase 5: Update Documentation

**File: `dev/sprint-artifacts/2-4-implement-custom-model-creation.md`**

1. **Remove Modelfile references** throughout the document
2. **Update task descriptions** to reflect direct parameter approach
3. **Maintain all acceptance criteria** (still fully met)

### Componentization Strategy

**OllamaAdapter (Generic, Reusable)**:

- `checkConnection()` - Generic connectivity
- `checkModel()` - Generic model validation
- `generate()` - Generic text generation
- `createModel()` - Generic model creation with injected parameters
- Shared error handling and utilities

**CommitModelConfig (Commit-Specific)**:

- Commit-specific system prompt and parameters
- Conventional Commits expertise definition
- Model naming conventions

**Usage Pattern**:

```typescript
// Generic usage (other teams)
const adapter = new OllamaAdapter(ollamaClient);

// Commit-specific usage
const commitAdapter = new OllamaAdapter(
  ollamaClient,
  COMMIT_MODEL_CONFIG.baseModel,
  COMMIT_MODEL_CONFIG.systemPrompt,
  COMMIT_MODEL_CONFIG.parameters
);
```

### Benefits of This Approach

1. **Massive code reduction**: ~200 lines → ~30 lines (85% reduction)
2. **Proper componentization**: Generic vs specific concerns separated
3. **Uses SDK correctly**: Direct parameter passing as intended
4. **Better maintainability**: Simple, testable code
5. **Reusable adapter**: Can be used for other model types
6. **Type safety**: Configuration interfaces ensure correctness
7. **No file dependencies**: Eliminates file system complexity

### Files to Modify

1. **Primary Changes**:
   - `src/infrastructure/llm/ollama-adapter.ts` - Remove parsing, add constructor injection
   - `src/infrastructure/llm/commit-model-config.ts` - New configuration file
   - `src/assets/ollatool-commit-modelfile.txt` - Delete this file

2. **Test Updates**:
   - `src/infrastructure/llm/ollama-adapter.test.ts` - Update expectations and instantiation
   - `tests/integration/create-model.test.ts` - Remove file dependencies

3. **Documentation**:
   - `dev/sprint-artifacts/2-4-implement-custom-model-creation.md` - Remove parsing references

### Risk Mitigation

1. **Backward compatibility**: Public API remains unchanged
2. **Test coverage**: All existing test patterns preserved with updated expectations
3. **Type safety**: Configuration interfaces prevent runtime errors
4. **Rollback safety**: Changes are isolated to internal implementation

### Success Criteria

- [ ] All unit tests pass (92 tests)
- [ ] All integration tests pass (3 tests)
- [ ] ESLint passes with no warnings
- [ ] TypeScript compilation successful
- [ ] Code reduction >80% in parsing logic
- [ ] Component separation: OllamaAdapter remains generic
- [ ] No file dependencies: All logic in code
- [ ] Same functionality preserved (model creation works end-to-end)

This plan eliminates unnecessary complexity while maintaining proper component separation and using the Ollama SDK as intended.
