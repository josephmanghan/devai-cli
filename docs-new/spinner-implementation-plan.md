# Spinner Implementation Plan

## Overview

Add visual feedback during commit message generation to solve the "black hole" UX problem where users have no indication that the system is working.

## Problem Statement

**Current State:**

- When `GenerateCommit.execute()` is called, there is no visual feedback
- LLM generation can take several seconds, and retries extend this further
- Users cannot distinguish between "system working" vs "system frozen"

**User Impact:**

- Confusing experience during the 2-10 second generation time
- No indication if system is processing or hung
- Especially problematic during retry attempts (up to 5 retries)

## Solution: Spinner-Only Approach

Implement a simple loading spinner that displays "Generating commit message..." during the entire generation process (including retries).

**Decision:** We are NOT implementing the retry counter in this iteration. This keeps the architecture clean and delivers a quick win. The retry counter can be added later if users report confusion about slow generation times.

## Architecture

### Clean Separation of Concerns

```
┌─────────────────────────────────────────────┐
│ CommitController (Presentation Layer)       │
│  - Wraps generateCommit.execute()           │
│  - Calls ui.startThinking() before          │
│  - Calls ui.stopThinking() after            │
└─────────────────────────────────────────────┘
                    │
                    │ delegates to
                    ▼
┌─────────────────────────────────────────────┐
│ GenerateCommit (Business Logic Layer)       │
│  - NO UI dependencies                       │
│  - Pure business logic                      │
│  - Handles retries transparently            │
└─────────────────────────────────────────────┘
```

**Key Principle:** The `GenerateCommit` use case remains pure business logic with zero UI dependencies. All UI concerns stay in the controller layer.

## Implementation Steps

### 1. Extend CommitUiPort Interface

**File:** `src/core/ports/commit-ui-port.ts`

Add two new methods to the interface:

```typescript
/**
 * UI port for commit operations.
 * Decouples controller logic from console/visual implementation details.
 */
export interface CommitUiPort {
  /**
   * Prompt user to select a commit type.
   * @returns Selected commit type (e.g., 'feat', 'fix', 'chore')
   */
  selectCommitType(): Promise<string>;

  /**
   * Display generated commit message for user review.
   * @param message - The generated commit message to preview
   */
  previewMessage(message: string): Promise<void>;

  /**
   * Prompt user to select an action for the commit message.
   * @returns Selected action (APPROVE, EDIT, REGENERATE, CANCEL)
   */
  selectCommitAction(): Promise<CommitAction>;

  /**
   * Start thinking/loading spinner with a message.
   * @param message - The message to display (e.g., "Generating commit message...")
   */
  startThinking(message: string): void;

  /**
   * Stop the currently active thinking/loading spinner.
   */
  stopThinking(): void;
}
```

### 2. Implement Spinner in CommitAdapter

**File:** `src/ui/adapters/commit-adapter.ts`

**Dependencies:** `ora` (already installed at v9.0.0)

```typescript
import { CommitAction, CommitUiPort } from '../../core/index.js';
import {
  previewMessage,
  selectCommitAction,
  selectCommitType,
} from '../commit/index.js';
import ora, { Ora } from 'ora';

/**
 * Console-based primary adapter implementing CommitUiPort.
 * Adapts @clack/prompts UI components to the CommitUiPort interface.
 */
export class CommitAdapter implements CommitUiPort {
  private spinner: Ora | null = null;

  async selectCommitType(): Promise<string> {
    return await selectCommitType();
  }

  async previewMessage(message: string): Promise<void> {
    await previewMessage(message);
  }

  async selectCommitAction(): Promise<CommitAction> {
    return await selectCommitAction();
  }

  startThinking(message: string): void {
    // Stop any existing spinner before starting a new one
    if (this.spinner !== null) {
      this.spinner.stop();
    }
    this.spinner = ora(message).start();
  }

  stopThinking(): void {
    if (this.spinner !== null) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}
```

**Implementation Notes:**

- Store spinner instance as private field to manage lifecycle
- Guard against multiple active spinners
- Clean up spinner reference after stopping
- Use `ora().start()` for immediate display

### 3. Integrate Spinner in CommitController

**File:** `src/features/commit/controllers/commit-controller.ts`

**Location:** Modify the `execute()` method around line 57-61

**Before:**

```typescript
const generatedMessage = await this.generateCommit.execute({
  diff: context.diff,
  status: context.branch,
  commitType,
});
```

**After:**

```typescript
this.ui.startThinking('Generating commit message...');
try {
  const generatedMessage = await this.generateCommit.execute({
    diff: context.diff,
    status: context.branch,
    commitType,
  });
  this.ui.stopThinking();
} catch (error) {
  this.ui.stopThinking();
  throw error;
}
```

**Critical:** Ensure `stopThinking()` is called in both success and error paths to prevent orphaned spinners.

## Testing Strategy

### Unit Tests

#### 1. CommitAdapter Spinner Tests

**File:** `src/ui/adapters/commit-adapter.test.ts` (create new file)

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CommitAdapter } from './commit-adapter.js';
import ora from 'ora';

// Mock ora module
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  })),
}));

describe('CommitAdapter - Spinner Methods', () => {
  let adapter: CommitAdapter;
  let mockSpinner: ReturnType<typeof ora>;

  beforeEach(() => {
    adapter = new CommitAdapter();
    vi.clearAllMocks();
  });

  describe('startThinking', () => {
    it('should create and start a spinner with provided message', () => {
      adapter.startThinking('Generating commit message...');

      expect(ora).toHaveBeenCalledWith('Generating commit message...');
      expect(mockSpinner.start).toHaveBeenCalledTimes(1);
    });

    it('should stop previous spinner before starting new one', () => {
      const firstSpinner = ora('First message');
      const secondSpinner = ora('Second message');

      (ora as any)
        .mockReturnValueOnce(firstSpinner)
        .mockReturnValueOnce(secondSpinner);

      adapter.startThinking('First message');
      adapter.startThinking('Second message');

      expect(firstSpinner.stop).toHaveBeenCalledTimes(1);
      expect(secondSpinner.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopThinking', () => {
    it('should stop active spinner', () => {
      adapter.startThinking('Processing...');
      const spinner = (ora as any).mock.results[0].value;

      adapter.stopThinking();

      expect(spinner.stop).toHaveBeenCalledTimes(1);
    });

    it('should handle stopThinking when no spinner is active', () => {
      expect(() => adapter.stopThinking()).not.toThrow();
    });

    it('should allow starting new spinner after stopping', () => {
      adapter.startThinking('First');
      adapter.stopThinking();
      adapter.startThinking('Second');

      expect(ora).toHaveBeenCalledTimes(2);
    });
  });
});
```

**Test Coverage:**

- ✅ Spinner creation with custom message
- ✅ Multiple spinner handling (stops previous before starting new)
- ✅ Stopping active spinner
- ✅ Graceful handling of stop when no spinner active
- ✅ Spinner lifecycle (start → stop → start)

#### 2. CommitController Spinner Integration Tests

**File:** `src/features/commit/controllers/commit-controller.test.ts` (modify existing)

**Add new test suite:**

```typescript
describe('Spinner Lifecycle', () => {
  it('should start spinner before generateCommit and stop after success', async () => {
    await controller.execute();

    expect(mockUi.startThinking).toHaveBeenCalledWith(
      'Generating commit message...'
    );
    expect(mockUi.startThinking).toHaveBeenCalledBefore(
      mockGenerateCommit.execute as any
    );
    expect(mockUi.stopThinking).toHaveBeenCalledAfter(
      mockGenerateCommit.execute as any
    );
    expect(mockUi.stopThinking).toHaveBeenCalledTimes(1);
  });

  it('should stop spinner after generateCommit error', async () => {
    const error = new SystemError('LLM generation failed', 'Check Ollama');
    mockGenerateCommit.execute = vi.fn().mockRejectedValue(error);

    await expect(controller.execute()).rejects.toThrow(SystemError);

    expect(mockUi.startThinking).toHaveBeenCalledWith(
      'Generating commit message...'
    );
    expect(mockUi.stopThinking).toHaveBeenCalledTimes(1);
  });

  it('should stop spinner on validation error', async () => {
    const error = new ValidationError('Invalid diff');
    mockValidatePreconditions.execute = vi.fn().mockRejectedValue(error);

    await expect(controller.execute()).rejects.toThrow(ValidationError);

    // Should not start spinner if validation fails before generation
    expect(mockUi.startThinking).not.toHaveBeenCalled();
    expect(mockUi.stopThinking).not.toHaveBeenCalled();
  });

  it('should handle spinner lifecycle during REGENERATE action', async () => {
    mockUi.selectCommitAction = vi
      .fn()
      .mockResolvedValueOnce(CommitAction.REGENERATE)
      .mockResolvedValueOnce(CommitAction.APPROVE);

    await controller.execute();

    // Should start/stop twice (initial generation + regeneration)
    expect(mockUi.startThinking).toHaveBeenCalledTimes(2);
    expect(mockUi.stopThinking).toHaveBeenCalledTimes(2);
  });

  it('should not start spinner for CANCEL action', async () => {
    mockUi.selectCommitAction = vi.fn().mockResolvedValue(CommitAction.CANCEL);

    await controller.execute();

    // Spinner started once for initial generation
    expect(mockUi.startThinking).toHaveBeenCalledTimes(1);
    expect(mockUi.stopThinking).toHaveBeenCalledTimes(1);
  });
});
```

**Update beforeEach mock setup:**

```typescript
mockUi = {
  selectCommitType: vi.fn().mockResolvedValue(commitType),
  previewMessage: vi.fn().mockResolvedValue(undefined),
  selectCommitAction: vi.fn().mockResolvedValue(CommitAction.APPROVE),
  startThinking: vi.fn(), // ADD THIS
  stopThinking: vi.fn(), // ADD THIS
} satisfies CommitUiPort;
```

**Test Coverage:**

- ✅ Spinner starts before generation
- ✅ Spinner stops after successful generation
- ✅ Spinner stops after generation error
- ✅ Spinner lifecycle during REGENERATE flow
- ✅ Spinner not affected by CANCEL action
- ✅ Proper cleanup in error scenarios

### E2E Tests

#### Update MockCommitUi Helper

**File:** `tests/helpers/mock-commit-ui.ts` (modify existing)

**Add spinner tracking:**

```typescript
import { CommitAction, CommitUiPort } from '../../src/core/index.js';

export class MockCommitUi implements CommitUiPort {
  private commitTypeResponse: string = 'feat';
  private commitActionResponse: CommitAction = CommitAction.APPROVE;

  public selectCommitTypeCalled = 0;
  public previewMessageCalled = 0;
  public selectCommitActionCalled = 0;
  public lastPreviewedMessage: string | null = null;

  // ADD THESE FIELDS
  public startThinkingCalled = 0;
  public stopThinkingCalled = 0;
  public lastThinkingMessage: string | null = null;

  setCommitTypeResponse(type: string): void {
    this.commitTypeResponse = type;
  }

  setCommitActionResponse(action: CommitAction): void {
    this.commitActionResponse = action;
  }

  async selectCommitType(): Promise<string> {
    this.selectCommitTypeCalled++;
    return this.commitTypeResponse;
  }

  async previewMessage(message: string): Promise<void> {
    this.previewMessageCalled++;
    this.lastPreviewedMessage = message;
  }

  async selectCommitAction(): Promise<CommitAction> {
    this.selectCommitActionCalled++;
    return this.commitActionResponse;
  }

  // ADD THESE METHODS
  startThinking(message: string): void {
    this.startThinkingCalled++;
    this.lastThinkingMessage = message;
  }

  stopThinking(): void {
    this.stopThinkingCalled++;
  }
}
```

#### Update E2E Happy Path Tests

**File:** `tests/e2e/commit-happy-path.test.ts` (modify existing)

**Add spinner assertions to existing tests:**

```typescript
it('should execute full commit workflow end-to-end', async () => {
  const gitAdapter = new ShellGitAdapter(repoPath);
  const editorAdapter = new ShellEditorAdapter();

  const validatePreconditions = new ValidatePreconditions(
    gitAdapter,
    mockLlmProvider
  );
  const generateCommit = new GenerateCommit(mockLlmProvider);

  const controller = new CommitController(
    gitAdapter,
    editorAdapter,
    mockCommitUi,
    validatePreconditions,
    generateCommit
  );

  await controller.execute();

  // Existing assertions
  expect(mockCommitUi.selectCommitTypeCalled).toBe(1);
  expect(mockCommitUi.previewMessageCalled).toBe(1);
  expect(mockCommitUi.selectCommitActionCalled).toBe(1);
  expect(mockCommitUi.lastPreviewedMessage).toContain(
    'feat: add authentication'
  );

  // ADD THESE SPINNER ASSERTIONS
  expect(mockCommitUi.startThinkingCalled).toBe(1);
  expect(mockCommitUi.stopThinkingCalled).toBe(1);
  expect(mockCommitUi.lastThinkingMessage).toBe('Generating commit message...');

  const log = await gitHarness.getLog();
  expect(log).toContain('feat: add authentication module');

  const status = await gitHarness.getStatus();
  expect(status).toBe('');
});
```

**Add new spinner-specific E2E test:**

```typescript
it('should maintain spinner lifecycle across regeneration', async () => {
  mockCommitUi.setCommitActionResponse(CommitAction.REGENERATE);

  // First call regenerates, second approves
  let callCount = 0;
  mockCommitUi.setCommitActionResponse = vi.fn(() => {
    callCount++;
    return callCount === 1 ? CommitAction.REGENERATE : CommitAction.APPROVE;
  });

  const gitAdapter = new ShellGitAdapter(repoPath);
  const editorAdapter = new ShellEditorAdapter();
  const validatePreconditions = new ValidatePreconditions(
    gitAdapter,
    mockLlmProvider
  );
  const generateCommit = new GenerateCommit(mockLlmProvider);
  const controller = new CommitController(
    gitAdapter,
    editorAdapter,
    mockCommitUi,
    validatePreconditions,
    generateCommit
  );

  await controller.execute();

  // Spinner should be called twice (initial + regenerate)
  expect(mockCommitUi.startThinkingCalled).toBe(2);
  expect(mockCommitUi.stopThinkingCalled).toBe(2);
});
```

#### Update E2E Error Path Tests

**File:** `tests/e2e/commit-error-paths.test.ts` (modify existing - if applicable)

Add assertions to verify spinner cleanup in error scenarios.

### Manual Testing Checklist

Run the CLI in development mode (`npm run dev commit`) and verify:

- [ ] **Initial Generation**
  - [ ] Spinner appears immediately after selecting commit type
  - [ ] Spinner displays "Generating commit message..." text
  - [ ] Spinner animation runs continuously (spinning icon)
  - [ ] Spinner disappears when message preview appears

- [ ] **Retry Scenarios**
  - [ ] Simulate retries by creating invalid diff or LLM response
  - [ ] Spinner remains active throughout retry attempts
  - [ ] No visual indication of retries (expected behavior)
  - [ ] Spinner eventually stops on success or max retries failure

- [ ] **Error Handling**
  - [ ] Spinner stops when LLM generation fails
  - [ ] Spinner stops when validation fails
  - [ ] No orphaned spinners left in terminal
  - [ ] Error messages display correctly after spinner stops

- [ ] **Regeneration Flow**
  - [ ] Spinner appears again when selecting REGENERATE action
  - [ ] Each regeneration shows spinner independently
  - [ ] Previous spinner properly cleaned up before new one starts

- [ ] **Edge Cases**
  - [ ] Rapid cancellation doesn't leave orphaned spinners
  - [ ] Terminal interruption (Ctrl+C) cleans up spinner
  - [ ] Works correctly with `--all` flag

### Test Execution Commands

```bash
# Run all tests
npm run test

# Run only unit tests (faster feedback)
npm run test:unit

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test src/ui/adapters/commit-adapter.test.ts

# Watch mode during development
npm run test:watch
```

## Files Modified

### Production Code

1. `src/core/ports/commit-ui-port.ts` - Add `startThinking()` and `stopThinking()` methods
2. `src/ui/adapters/commit-adapter.ts` - Implement spinner using `ora`
3. `src/features/commit/controllers/commit-controller.ts` - Wrap `generateCommit.execute()` with spinner lifecycle

### Test Code

4. `src/features/commit/controllers/commit-controller.test.ts` - Add spinner lifecycle test suite and update mock setup
5. `tests/helpers/mock-commit-ui.ts` - Add spinner tracking fields and methods
6. `tests/e2e/commit-happy-path.test.ts` - Add spinner assertions to existing tests and new regeneration test
7. `tests/e2e/commit-error-paths.test.ts` - Add spinner cleanup assertions (if applicable)

## Files Created

### Test Code

1. `src/ui/adapters/commit-adapter.test.ts` - Complete unit tests for CommitAdapter spinner methods

## Dependencies

- `ora` v9.0.0 (already installed, no new dependencies required)

## Success Criteria

- [ ] Spinner displays "Generating commit message..." during LLM generation
- [ ] Spinner appears immediately when generation starts
- [ ] Spinner disappears when generation completes (success or error)
- [ ] Spinner remains active during all retry attempts (transparent to user)
- [ ] No orphaned spinners in error scenarios
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing confirms good UX

## Future Enhancements

If users report confusion about slow generation times or want more transparency into the retry process, consider:

1. **Retry Counter Display**: Update spinner text to show "Retrying... (attempt: X/5)"
   - Requires injecting `CommitUiPort` into `GenerateCommit` use case
   - OR refactoring to event-driven architecture
   - Adds architectural complexity but provides granular feedback

2. **Progress Stages**: Show different messages for different stages
   - "Analyzing changes..."
   - "Generating commit message..."
   - "Validating format..."

These enhancements are deferred to keep this implementation simple and focused on solving the core UX problem.

## Notes

- The retry loop in `GenerateCommit.executeWithRetry()` (lines 44-65) will continue to work transparently
- From the user's perspective, retries are invisible - spinner just stays active longer
- This is acceptable UX because retries are fast (< 1 second each typically)
- If retries become a performance concern, revisit the retry counter enhancement
