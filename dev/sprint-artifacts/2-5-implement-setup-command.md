# Story 2.5: Implement Setup Command

Status: done

## Story

As a developer,
I want an `ollatool setup` command,
so that users can initialize Ollama integration before first commit with validation and model provisioning.

## Acceptance Criteria

1. [ ] Setup command registered in Commander.js with proper `ollatool setup` entry point
2. [ ] Command handler created in `src/features/setup/setup-command.ts` following hexagonal architecture
3. [ ] Performs 3-tier validation: daemon → base model → custom model existence checks
4. [ ] Creates custom `ollatool-commit:latest` model if missing using configured adapter
5. [ ] Shows clear success/failure messages with remediation guidance for each failure type
6. [ ] Command is idempotent (safe to re-run multiple times without side effects)
7. [ ] Error handling with proper exit codes: daemon=3, validation=4, system=3

## Tasks / Subtasks

- [ ] Create setup command structure and registration (AC: 1)
  - [ ] Add setup command to Commander.js configuration in main.ts
  - [ ] Create SetupCommand class in src/features/setup/setup-command.ts
  - [ ] Implement proper dependency injection pattern following hexagonal architecture
- [ ] Implement command handler orchestration logic (AC: 2, 3)
  - [ ] Create setup workflow that validates Ollama daemon connectivity
  - [ ] Add base model existence check (`qwen2.5-coder:1.5b`)
  - [ ] Add custom model existence check (`ollatool-commit:latest`)
  - [ ] Orchestrate model creation if missing using OllamaAdapter
- [ ] Add comprehensive validation and feedback (AC: 4, 5, 7)
  - [ ] Implement daemon connectivity check with actionable error messages
  - [ ] Add base model validation with pull instructions if missing
  - [ ] Integrate custom model creation using existing OllamaAdapter.createModel()
  - [ ] Display clear progress feedback during model creation
  - [ ] Show success confirmation when setup completes
- [ ] Implement idempotency and error handling (AC: 6, 7)
  - [ ] Skip operations that are already complete with informational messages
  - [ ] Handle different error types with appropriate exit codes
  - [ ] Provide remediation guidance for each error scenario
- [ ] Create comprehensive unit tests
  - [ ] Test command registration and entry point
  - [ ] Test daemon validation success and failure scenarios
  - [ ] Test base model validation with missing model handling
  - [ ] Test custom model creation orchestration
  - [ ] Test idempotency when all components already exist
  - [ ] Test error handling and exit code mapping
- [ ] Add integration testing for end-to-end validation
  - [ ] Create integration test for real Ollama environment
  - [ ] Validate setup command works with running Ollama daemon
  - [ ] Test error scenarios when Ollama not installed/running
- [ ] Run `npm run pr` to validate implementation is ready for PR

## Dev Notes

### Architecture Requirements

**Command Structure**: Follow established hexagonal architecture with controller orchestrating use cases and infrastructure adapters [Source: dev/architecture.md#Project-Structure]

**Dependency Injection**: Use manual DI pattern established in main.ts composition root - inject OllamaAdapter and other dependencies into SetupCommand constructor [Source: dev/architecture.md#Dependency-Injection-Pattern]

**Error Handling**: Use existing typed error classes (SystemError, ValidationError) with proper exit codes and remediation guidance [Source: dev/architecture.md#Error-Handling-Strategy]

### Setup Workflow Requirements

**3-Tier Validation Pattern**: Architecture specifies sequential validation:

1. Daemon connectivity (HTTP GET to localhost:11434)
2. Base model existence (qwen2.5-coder:1.5b)
3. Custom model existence (ollatool-commit:latest) [Source: dev/architecture.md#Setup-Command-Implementation]

**Model Creation Integration**: Use existing OllamaAdapter.createModel() method with configuration from conventional-commit-model.config.ts [Source: src/infrastructure/config/conventional-commit-model.config.ts]

**Idempotency Strategy**: Check existence before attempting operations to make setup safe to re-run [Source: dev/architecture.md#Setup-Command-Implementation]

### User Experience Requirements

**Progress Feedback**: Use ora spinner for long-running operations (model creation) with clear status messages [Source: dev/architecture.md#First-Run-Setup]

**Error Messaging**: Provide actionable remediation for each failure type:

- Daemon not running: "ollama serve" instructions
- Base model missing: "ollama pull qwen2.5-coder:1.5b"
- Custom model missing: Run setup to create it

**Exit Code Mapping**: Follow PRD requirement for error categories:

- System errors (exit 3): daemon issues, network failures
- Validation errors (exit 4): model missing, setup incomplete
- User errors (exit 2): not applicable for setup [Source: dev/architecture.md#Error-Handling-Strategy]

### Project Structure Notes

**File Organization**: Place setup command in src/features/setup/ following established feature-based structure:

- setup-command.ts (controller)
- setup-command.test.ts (co-located tests)

**Import Patterns**: Continue using established import grouping: external dependencies, internal core, feature-specific [Source: dev/architecture.md#File-Organization-Rules]

**CLI Integration**: Register command in main.ts following same pattern as future commit command [Source: dev/architecture.md#Directory-Layout]

### Learnings from Previous Story

**From Story 2-4-implement-custom-model-creation (Status: done)**:

**Critical Architectural Learning**: CLI vs SDK fundamental difference - Ollama JS SDK uses direct parameter passing, not Modelfile parsing like the CLI tool. [Source: dev/sprint-artifacts/2-4-implement-custom-model-creation.md#Major-Refactoring:-Modelfile-Elimination]

**Reusable Components Available**:

- **OllamaAdapter**: Now fully generic with constructor injection, can be reused for setup command
- **CONVENTIONAL_COMMIT_MODEL_CONFIG**: Contains all configuration needed for custom model creation
- **Error Handling Patterns**: SystemError and ValidationError classes with actionable remediation
- **Testing Infrastructure**: Vitest patterns for mocking external dependencies

**Implementation Patterns to Follow**:

- Constructor dependency injection for testability
- Configuration-based model creation using direct SDK parameters (CONVENTIONAL_COMMIT_MODEL_CONFIG)
- Progress feedback with ora spinner for long operations
- Comprehensive error wrapping with typed error classes

**Key Integration Points**:

- Use `OllamaAdapter.createModel()` method with CONVENTIONAL_COMMIT_MODEL_CONFIG
- Leverage existing `checkModel()` method for validation checks
- Follow established error message patterns with remediation guidance

### Idempotency Strategy

Check model existence first to skip unnecessary creation operations on repeated runs.

### Testing Strategy

**Unit Testing**: Mock OllamaAdapter to test command orchestration without requiring actual Ollama installation

**Integration Testing**: Real environment tests with Ollama running to validate end-to-end setup workflow

- **CRITICAL**: Use test-specific model name `ollatool-commit-test:latest` (NOT `ollatool-commit:latest`) to avoid trampling production models
- **MUST CLEANUP**: Delete test model in afterEach/afterAll using `ollamaClient.delete({ model: 'ollatool-commit-test:latest' })`
- **NEVER DELETE**: Base model (`qwen2.5-coder:1.5b`) or production model (`ollatool-commit:latest`)
- Create test config similar to CONVENTIONAL_COMMIT_MODEL_CONFIG but with test model name

**Error Path Testing**: Verify all error scenarios return appropriate error types and exit codes with actionable messages

### Context7 MCP Integration

**Critical for Quality**: Use Context7 MCP server for Commander.js best practices validation:

- Resolve library: `mcp__context7__resolve-library-id("commander")`
- Get command registration docs: `mcp__context7__get-library-docs("/commanderjs/commander", "code", "command")`
- Validate setup command patterns against current standards
- styleguides/unit-tests

### References

- Setup command implementation requirements and 3-tier validation [Source: dev/architecture.md#Setup-Command-Implementation]
- Commander.js CLI framework patterns and command registration [Source: dev/architecture.md#Technology-Stack-&-Verified-Versions]
- Error handling strategy with typed error classes and exit codes [Source: dev/architecture.md#Error-Handling-Strategy]
- OllamaAdapter integration patterns and constructor injection [Source: dev/sprint-artifacts/2-4-implement-custom-model-creation.md]
- Custom model configuration and creation parameters [Source: src/infrastructure/config/conventional-commit-model.config.ts]

## Dev Agent Record

HUMAN FOUND ISSUES:

1. They left JS docs in private methods.
2. They left internal comments internally within methods.
3. They created `protected` methods which is a smell. `protected` ONLY used for base classes/abstract. Otherwise private/public/readonly.
4. Added bullshit comments to spec file describing how things work. Very wrong.

### Additional Development Issues Resolved

**DI Pattern Issues:**

- Original agent made `createAdapter()` protected to enable test spying - this violated encapsulation principles
- Attempted nullable adapter DI with null-check getters was a code smell
- **Resolution**: Implemented clean factory function DI pattern with `createDefaultAdapter()` exported function and constructor injection `constructor(adapter = createDefaultAdapter())`
- Tests now inject mocks directly instead of spying on private methods

**TypeScript Configuration Issues:**

- Added `**/*.test.ts` to main tsconfig.json include which caused NodeNext module resolution errors requiring explicit `.js` extensions for relative imports
- **Resolution**: Excluded test files from main tsconfig.json, source code remains strict while tests use Vitest's more lenient type checking
- This keeps source code strict while avoiding noisy import refactoring for test files

**Test Mocking Issues:**

- Mock stream objects in ollama-adapter.test.ts had type mismatches with ProgressResponse interface
- **Resolution**: Used `as any` cast for mock streams instead of complex intersection types
- **CRITICAL - Test Console Noise Issue**: Setup command tests were outputting excessive console noise from real UI method execution
- **Resolution**: Added proper mocking of `SetupUI` methods using `vi.mock('../../ui/setup.js', () => ({ SetupUI: { setupStart: vi.fn(), setupSuccess: vi.fn() } }))`
- **Lesson Learned**: Unit tests MUST mock UI/utility classes to prevent console noise and maintain test isolation

**Build Validation:**

- All PR checks now pass: format, lint, typecheck (source only), tests (94/94), build
- Clean DI pattern satisfies hexagonal architecture requirements

**File Naming Issues:**

- Created file named `console-output.ts` with class `ConsoleOutput` - this was misleading as the file only handles setup command UI, not general console output
- **Resolution**: Renamed to `setup.ts` with class `SetupUI` for better clarity and specificity

### Context Reference

- [dev/sprint-artifacts/2-5-implement-setup-command.context.xml](./2-5-implement-setup-command.context.xml)

### Agent Model Used

glm-4.6

### Debug Log References

### Completion Notes List

### File List
