<!-- 92254681-9bb5-44b2-b0df-c580a4888784 531dc22f-493b-40ce-9cd2-4b04b531a9c9 -->

# Refactor Setup Controller Architecture

## Objective

Refactor [`src/features/setup/controllers/setup-controller.ts`](src/features/setup/controllers/setup-controller.ts) to match the clean architecture pattern demonstrated in [`src/features/commit/controllers/commit-controller.ts`](src/features/commit/controllers/commit-controller.ts) by splitting the 258-line monolithic [`ProvisionEnvironment`](src/features/setup/use-cases/provision-environment.ts) use case into three focused, testable use cases with proper separation of concerns.

## Current Architecture Issues

1. **Monolithic use case**: `ProvisionEnvironment` (258 lines) handles 4 distinct concerns
2. **UI coupling**: Use case contains UI logic (`onCheckStarted`, `onProgress`, etc.)
3. **Testing complexity**: Large use case requires complex mocking and is hard to test comprehensively
4. **Inconsistent pattern**: Doesn't match the clean `CommitController` pattern with multiple focused use cases

## Target Architecture

Following the `CommitController` pattern where:

- Controller orchestrates workflow and handles UI
- Use cases contain pure business logic
- Each use case is small (35-80 lines), focused, and independently testable

## Code Quality Workflow

**CRITICAL: After creating/modifying ANY file, immediately run:**

```bash
npm run lint:fix && npm run format
```

**Before writing tests for a file:**

- File MUST pass linting and formatting
- Run `npm run typecheck` to verify no TypeScript errors
- Only then write corresponding test file

**Test command:** `npm run pr:lite` (runs format, lint, typecheck, test:unit, build)

## Implementation Phases

### Phase 0: Create Type Definitions

Create [`src/features/setup/types/setup-result.types.ts`](src/features/setup/types/setup-result.types.ts):

```typescript
export interface BaseModelResult {
  existed: boolean;
  pulled?: boolean;
}

export interface CustomModelResult {
  existed: boolean;
  created?: boolean;
}
```

**After creation:** Run `npm run lint:fix && npm run format`

### Phase 1: Create Use Cases with Tests (TDD)

**Development Pattern:**

1. Create implementation file
2. Run `npm run lint:fix && npm run format`
3. Run `npm run typecheck` to verify
4. Create test file
5. Run `npm run lint:fix && npm run format`
6. Run `npm run pr:lite` to verify tests pass

**1.1 ValidateOllamaConnection**

Create [`src/features/setup/use-cases/validate-ollama-connection.ts`](src/features/setup/use-cases/validate-ollama-connection.ts):

- Single responsibility: Validate daemon connectivity
- Dependencies: `LlmPort` only
- Returns: `void` on success, throws `SystemError` on failure
- Size: ~35 lines

**Then:** Run `npm run lint:fix && npm run format && npm run typecheck`

Create [`src/features/setup/use-cases/validate-ollama-connection.test.ts`](src/features/setup/use-cases/validate-ollama-connection.test.ts):

- Follow pattern from `validate-preconditions.test.ts`
- Test cases: daemon connected (success), daemon not connected (SystemError), error handling
- Size: ~80 lines

**Then:** Run `npm run lint:fix && npm run format && npm run pr:lite`

**1.2 EnsureBaseModel**

Create [`src/features/setup/use-cases/ensure-base-model.ts`](src/features/setup/use-cases/ensure-base-model.ts):

- Single responsibility: Ensure base model exists (check + auto-pull if missing)
- Dependencies: `LlmPort`, `modelName: string`
- Returns: `AsyncGenerator<ProgressUpdate, BaseModelResult>`
- Yields progress updates for controller to handle UI
- Import `BaseModelResult` from `setup-result.types.ts`
- Size: ~80 lines

**Then:** Run `npm run lint:fix && npm run format && npm run typecheck`

Create [`src/features/setup/use-cases/ensure-base-model.test.ts`](src/features/setup/use-cases/ensure-base-model.test.ts):

- Use `createMockProgressStream` helper pattern from existing test
- Test cases: model exists, model missing + successful pull, progress streaming, pull failure
- Size: ~150 lines

**Then:** Run `npm run lint:fix && npm run format && npm run pr:lite`

**1.3 ProvisionCustomModel**

Create [`src/features/setup/use-cases/provision-custom-model.ts`](src/features/setup/use-cases/provision-custom-model.ts):

- Single responsibility: Provision custom model (check + create if missing)
- Dependencies: `LlmPort`, `modelConfig: OllamaModelConfig`
- Returns: `AsyncGenerator<ProgressUpdate, CustomModelResult>`
- Yields progress updates for controller to handle UI
- Import `CustomModelResult` from `setup-result.types.ts`
- Size: ~60 lines

**Then:** Run `npm run lint:fix && npm run format && npm run typecheck`

Create [`src/features/setup/use-cases/provision-custom-model.test.ts`](src/features/setup/use-cases/provision-custom-model.test.ts):

- Similar pattern to `ensure-base-model.test.ts`
- Test cases: model exists, model creation, progress streaming, creation failure
- Size: ~120 lines

**Then:** Run `npm run lint:fix && npm run format && npm run pr:lite`

**1.4 Create Barrel Export**

Create [`src/features/setup/use-cases/index.ts`](src/features/setup/use-cases/index.ts):

```typescript
export { ValidateOllamaConnection } from './validate-ollama-connection.js';
export { EnsureBaseModel } from './ensure-base-model.js';
export { ProvisionCustomModel } from './provision-custom-model.js';
```

**Then:** Run `npm run lint:fix && npm run format`

### Phase 2: Refactor SetupController

**2.1 Update Controller Constructor**

Modify [`src/features/setup/controllers/setup-controller.ts`](src/features/setup/controllers/setup-controller.ts):

- Replace single `ProvisionEnvironment` dependency with three use cases
- Follow `CommitController` constructor pattern
- Match error handling pattern from `CommitController` (lines 98-130)

**Then:** Run `npm run lint:fix && npm run format && npm run typecheck`

**2.2 Refactor Execute Method**

Update `execute()` method to:

- Orchestrate three use cases sequentially
- Handle UI calls (`onCheckStarted`, `onCheckSuccess`)
- Process progress streaming from `EnsureBaseModel` and `ProvisionCustomModel`
- Call `showIntro()` before workflow, `showOutro()` after success
- Keep error handling consistent with current pattern

**Then:** Run `npm run lint:fix && npm run format && npm run typecheck`

**2.3 Update Controller Tests**

Modify [`src/features/setup/controllers/setup-controller.test.ts`](src/features/setup/controllers/setup-controller.test.ts):

- Add test suites for each workflow step
- Test successful orchestration of all three use cases
- Test progress streaming integration
- Test error propagation from each use case
- Expand from ~142 lines to ~200 lines

**Then:** Run `npm run lint:fix && npm run format && npm run pr:lite`

### Phase 3: Update Dependency Injection & Cleanup

**3.1 Update Main Entry Point**

Modify [`src/main.ts`](src/main.ts) `createSetupCommand()` function:

- Import new use cases: `ValidateOllamaConnection`, `EnsureBaseModel`, `ProvisionCustomModel`
- Import result types from `setup-result.types.ts`
- Instantiate each use case with appropriate dependencies
- Pass three use cases to `SetupController` constructor
- Remove `ProvisionEnvironment` import and instantiation

**Then:** Run `npm run lint:fix && npm run format`

**3.2 Delete Old Files**

Delete obsolete files:

- Delete `src/features/setup/use-cases/provision-environment.ts`
- Delete `src/features/setup/use-cases/provision-environment.test.ts`

### Phase 4: Final Verification

**4.1 Run Full Test Suite**

```bash
npm run pr:lite
```

- Verify all tests pass
- Verify build succeeds
- Check for any linting or formatting issues

**4.2 Verify No Broken Imports**

- Search codebase for any remaining imports of `ProvisionEnvironment`
- Ensure all references have been updated to use new use cases

## Key Implementation Details

### Progress Streaming Pattern

Use async generators to stream progress from use cases to controller:

```typescript
// In use case
async *execute(): AsyncGenerator<ProgressUpdate, BaseModelResult> {
  const exists = await this.llmPort.checkModel(this.modelName);
  if (exists) return { existed: true };

  const stream = this.llmPort.pullModel(this.modelName);
  for await (const progress of stream) {
    yield progress; // Controller handles UI
  }
  return { existed: false, pulled: true };
}

// In controller
const result = await this.ensureBaseModel.execute();
for await (const progress of result) {
  this.ui.onProgress(progress);
}
```

### Error Handling Consistency

Match `CommitController` error handling pattern:

- Use cases throw `AppError` subclasses (`SystemError`, `UserError`)
- Controller propagates `AppError` instances unchanged
- Controller wraps non-`AppError` as `SystemError`
- Provide clear remediation steps in all errors

### Test Helpers

Reuse existing test helper pattern from `provision-environment.test.ts`:

- `createMockProgressStream(items: ProgressUpdate[])`
- `createMockFailingStream(item: ProgressUpdate, error: Error)`

## Success Criteria

- All new use cases are < 80 lines
- Controller orchestrates workflow, doesn't contain business logic
- UI logic removed from use cases
- All files pass `npm run lint:fix && npm run format` before tests are written
- Test coverage ≥ 95% for all new files
- `npm run pr:lite` passes successfully
- Follows CommitController architecture pattern
- No breaking changes to public API
- Old `ProvisionEnvironment` files deleted (not archived)

### To-dos

- [x] Create ValidateOllamaConnection use case + tests
- [x] Create EnsureBaseModel use case + tests
- [x] Create ProvisionCustomModel use case + tests
- [x] Create use-cases/index.ts barrel export
- [ ] Refactor SetupController to use 3 use cases
- [ ] Update SetupController tests for new architecture
- [ ] Update main.ts dependency injection wiring
- [ ] Run tests, verify coverage, archive old files
