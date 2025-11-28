# Story 0.1: Create Test Infrastructure Core

Status: review

## Story

As a developer,
I want comprehensive test helper templates with smoke tests,
so that all subsequent development can be reliably tested without external dependencies.

## Acceptance Criteria

1. **GitTestHarness Implementation**
   - [x] `tests/helpers/git-harness.ts` created with GitTestHarness class
   - [x] Creates isolated temporary repositories for each test
   - [x] Includes cleanup mechanism that removes all temporary files
   - [x] Implements `init()`, `cleanup()`, `writeFile()`, `add()`, `getDiff()`, `getStatus()` methods
   - [x] Uses proper TypeScript types and documentation

2. **MockLlmProvider Implementation**
   - [x] `tests/helpers/mock-llm-provider.ts` created with MockLlmProvider class
   - [x] Implements LlmProvider port interface from architecture
   - [x] Provides instant, deterministic responses without Ollama dependency
   - [x] Includes methods: `mockResponse()`, `mockError()`, `getCallCount()`, `getLastPrompt()`
   - [x] Follows hexagonal architecture adapter pattern

3. **PerformanceTracker Implementation**
   - [x] `tests/helpers/performance-tracker.ts` created
   - [x] Measures CLI execution time and resource usage
   - [x] Records operation timings with metadata support
   - [x] Implements PerformanceMetric interface: `{ operation, duration, timestamp, metadata? }`

4. **Smoke Tests**
   - [x] GitTestHarness smoke test: creates temp repo and cleans up successfully
   - [x] MockLlmProvider smoke test: returns mocked string when called
   - [x] PerformanceTracker smoke test: records operation timing

5. **Code Quality**
   - [x] All helpers adhere to `dev/styleguides/clean-code.md` standards
   - [x] Functions ≤15 lines per function
   - [x] Proper class member ordering: constructor → private properties → public properties → public methods → private methods
   - [x] Self-documenting code with comments for "why" only

## Tasks / Subtasks

- [x] Create `tests/helpers/` directory structure (AC: #1-3)
- [x] Implement GitTestHarness class (AC: #1)
  - [x] Define TypeScript interface with required methods
  - [x] Implement `init()` to create isolated temp repository
  - [x] Implement file manipulation methods (`writeFile`, `add`)
  - [x] Implement git query methods (`getDiff`, `getStatus`)
  - [x] Implement `cleanup()` with proper error handling (try/finally pattern)
  - [x] Add JSDoc comments for public methods
- [x] Implement MockLlmProvider class (AC: #2)
  - [x] Define class implementing LlmProvider port interface
  - [x] Implement mock response queue mechanism
  - [x] Implement error simulation capability
  - [x] Add call tracking (count, last prompt)
  - [x] Follow hexagonal adapter patterns from architecture
- [x] Implement PerformanceTracker utility (AC: #3)
  - [x] Define PerformanceMetric TypeScript interface
  - [x] Implement timing measurement with high-resolution timer
  - [x] Implement metrics storage and retrieval
  - [x] Add metadata support for contextual information
- [x] Write smoke tests for all helpers (AC: #4)
  - [x] Create `tests/helpers/git-harness.test.ts` with temp repo lifecycle test
  - [x] Create `tests/helpers/mock-llm-provider.test.ts` with mock response test
  - [x] Create `tests/helpers/performance-tracker.test.ts` with timing test
  - [x] Ensure all smoke tests pass
- [x] Review code against clean code standards (AC: #5)
  - [x] Verify all functions ≤15 lines
  - [x] Check class member ordering
  - [x] Remove any "what" comments, keep only "why"
  - [x] Ensure proper error handling patterns

## Dev Notes

### Architecture Alignment

**Hexagonal Architecture Pattern:**

- GitTestHarness isolates git operations for testing
- MockLlmProvider implements the LlmProvider port interface (see `src/core/ports/llm/llm-provider.ts` once created)
- All helpers follow adapter pattern with clean interfaces

**Testing Strategy:**

- Smoke tests validate infrastructure works, NOT production features
- Co-located test pattern: `*.test.ts` files adjacent to implementation
- Use Vitest with node environment (configured in Story 0.2)

### Project Structure Notes

**Directory Layout:**

```
tests/
├── helpers/
│   ├── git-harness.ts
│   ├── git-harness.test.ts
│   ├── mock-llm-provider.ts
│   ├── mock-llm-provider.test.ts
│   ├── performance-tracker.ts
│   └── performance-tracker.test.ts
```

**Expected File Locations:**

- Test helpers: `tests/helpers/` (not `src/` - these are test-only utilities)
- LlmProvider interface reference: `src/core/ports/llm/llm-provider.ts` (will be created in Epic 2)

### Clean Code Standards

From `dev/styleguides/clean-code.md`:

**Function Size:** Maximum 15 lines per function

- Extract private helper methods when functions grow too large
- Each method should do ONE thing

**Class Member Ordering:**

1. Constructor
2. Private Properties
3. Public Properties
4. Public Methods
5. Private Methods

**Error Handling:**

- Use try/finally for cleanup (GitTestHarness.cleanup())
- Let errors bubble to test framework
- No silent failures

### Technical Implementation Notes

**GitTestHarness:**

- Use `execa` for git command execution
- Create temp directories using Node.js `fs.mkdtemp()`
- Store repo path in private property
- Cleanup MUST use try/finally to prevent test pollution

**MockLlmProvider:**

- Queue-based response system for sequential calls
- Throw errors when error is mocked
- Track all invocations for test assertions
- Reset state between tests (or create new instance per test)

**PerformanceTracker:**

- Use `performance.now()` for high-resolution timing
- Store metrics in array for later analysis
- Export metrics as JSON for CI reporting
- Include operation name and optional metadata

### References

- Architecture: [dev/architecture.md](../../dev/architecture.md#project-structure-pragmatic-hexagonal--ports--adapters)
- Clean Code Standards: [dev/styleguides/clean-code.md](../../dev/styleguides/clean-code.md)
- Tech Spec: [dev/sprint-artifacts/tech-spec-epic-0.md](../../dev/sprint-artifacts/tech-spec-epic-0.md#test-infrastructure-components)
- Epic Breakdown: [dev/stories/epic-0-test-infrastructure.md](../../dev/stories/epic-0-test-infrastructure.md#story-01-create-test-infrastructure-core)

## Dev Agent Record

### Context Reference

- [Story Context: 0-1-create-test-infrastructure-core.context.xml](0-1-create-test-infrastructure-core.context.xml)

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

### Completion Notes List

- Implemented GitTestHarness class with isolated temporary repositories and proper cleanup using try/finally pattern
- Created MockLlmProvider implementing LlmProvider port interface with queue-based response system
- Built PerformanceTracker utility with high-resolution timing and metadata support
- All helpers follow clean code standards with functions ≤15 lines and proper class member ordering
- Smoke tests validate core infrastructure functionality without external dependencies
- TypeScript configuration and Vitest setup established for 80% coverage thresholds

### File List

- `tests/helpers/git-harness.ts` - Git repository test harness implementation
- `tests/helpers/git-harness.test.ts` - GitTestHarness smoke tests
- `tests/helpers/mock-llm-provider.ts` - LLM provider mock implementation
- `tests/helpers/mock-llm-provider.test.ts` - MockLlmProvider smoke tests
- `tests/helpers/performance-tracker.ts` - Performance measurement utility
- `tests/helpers/performance-tracker.test.ts` - PerformanceTracker smoke tests
- `vitest.config.ts` - Vitest configuration with coverage thresholds
- `tsconfig.json` - TypeScript configuration for project
- `package.json` - Updated with test scripts and dependencies

### Change Log

- 2025-11-28: Story drafted (Status: drafted)
- 2025-11-28: Implementation complete - All 3 helper classes implemented with smoke tests (Status: review)
