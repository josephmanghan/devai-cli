# Refactor Setup Command to Hexagonal Architecture

**As a:** system architect
**I want:** to extract business logic from the SetupCommand into a dedicated ProvisionEnvironment use case
**So that:** the CLI layer is decoupled from business logic, adherence to Hexagonal Architecture is enforced, and testing logic is isolated from CLI implementation details

## Status

review

## Acceptance Criteria

1. **Separation of Concerns** - SetupCommand must NOT contain any conditional business logic (no if statements checking model existence).
2. **Use Case Pattern** - All provisioning logic resides in `src/features/setup/use-cases/provision-environment.ts`.
3. **Test Isolation** - Business logic tests verify the Use Case directly; Command tests only verify wiring/registration.
4. **Thin Adapter** - SetupCommand serves purely as a Primary Adapter (Controller) triggering the Use Case.
5. **Behavior Parity** - The `ollatool setup` command behaves exactly as before from the user's perspective.

## Tasks

### Task 1: Extract ProvisionEnvironment Use Case (AC: #1, #2)

- [x] **Subtask 1.1:** Create src/features/setup/use-cases/provision-environment.ts
- [x] **Subtask 1.2:** Move private validation logic (daemon, base-model, custom-model) from command to use case
- [x] **Subtask 1.3:** Inject LlmPort and SetupUiPort into Use Case constructor

### Task 2: Migrate Logic Tests (AC: #3)

- [x] **Subtask 2.1:** Create src/features/setup/use-cases/provision-environment.test.ts
- [x] **Subtask 2.2:** Move logic-heavy tests (e.g., auto-pull, error handling) from setup-command.test.ts
- [x] **Subtask 2.3:** Refactor tests to target ProvisionEnvironment directly without mocking Commander

### Task 3: Simplify SetupCommand (AC: #4)

- [x] **Subtask 3.1:** Update SetupCommand constructor to accept ProvisionEnvironment instead of Ports
- [x] **Subtask 3.2:** Remove all private business logic methods from SetupCommand
- [x] **Subtask 3.3:** Update execute method to simply delegate to useCase.execute()

### Task 4: Application Wiring (AC: #5)

- [x] **Subtask 4.1:** Update main.ts to compose ProvisionEnvironment with adapters
- [x] **Subtask 4.2:** Update createSetupCommand factory to inject Use Case into Command

## Technical Context

**Epic ID:** ARCH
**Story ID:** 1
**Generated:** 2025-12-01

### Key Constraints

- **Hexagonal Purity:** The Use Case (ProvisionEnvironment) must NOT import 'commander' or know about CLI arguments. It only accepts OllamaModelConfig.
- **Use Case Location:** Use Cases must be located in `src/features/<feature-name>/use-cases/` to align with the existing Commit feature structure.
- **Dependency Injection:** Dependencies (LlmPort, SetupUiPort) must be injected into the Use Case via constructor, not instantiated inside.
- **Error Handling:** The Use Case must throw typed AppErrors (SystemError, UserError) which the Command or Main loop catches.
- **Function Size:** Private methods extracted to the Use Case must adhere to the 15-line limit where possible.

### Required Interfaces

- **LlmPort** (src/core/ports/llm-port.ts) - Dependency for checking connection, models, and pull/create operations
- **SetupUiPort** (src/core/ports/setup-ui-port.ts) - Dependency for spinner states and user feedback
- **OllamaModelConfig** (src/core/types/llm-types.ts) - Input DTO passed to execute method

### Key Files

- `src/features/setup/setup-command.ts` (lines 14-244) - Current "God Class" to be refactored
- `src/features/setup/setup-command.test.ts` (lines 1-365) - Existing tests to be split
- `src/main.ts` (lines 19-33) - Dependency Injection root to be updated

## Senior Developer Review (AI)

**Reviewer:** Joe
**Date:** 2025-12-01
**Outcome:** Approve

### Summary

This refactor successfully achieves all architectural objectives. The implementation demonstrates excellent separation of concerns with the SetupCommand serving as a proper thin adapter, while the ProvisionEnvironment use case contains all business logic. The testing strategy correctly isolates unit tests (logic) from integration tests (wiring).

### Key Findings

**HIGH SEVERITY:** None

**MEDIUM SEVERITY:** None

**LOW SEVERITY:** None

### Acceptance Criteria Coverage

| AC #  | Description                                                                                     | Status          | Evidence                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| AC #1 | **Separation of Concerns** - SetupCommand must NOT contain any conditional business logic       | **IMPLEMENTED** | ✅ `setup-command.ts:35-42` - Only delegates to `provisionEnvironment.execute()`, no business logic present                |
| AC #2 | **Use Case Pattern** - All provisioning logic resides in `provision-environment.ts`             | **IMPLEMENTED** | ✅ `provision-environment.ts:23-257` - Complete provisioning workflow with daemon, base-model, and custom-model validation |
| AC #3 | **Test Isolation** - Business logic tests verify Use Case directly; Command tests verify wiring | **IMPLEMENTED** | ✅ `provision-environment.test.ts:49-238` - Direct Use Case testing; `setup-command.test.ts:45-113` - Command wiring only  |
| AC #4 | **Thin Adapter** - SetupCommand serves purely as Primary Adapter                                | **IMPLEMENTED** | ✅ `setup-command.ts:23-30` - Only registers command and delegates, no business rules                                      |
| AC #5 | **Behavior Parity** - `ollatool setup` command behaves exactly as before                        | **IMPLEMENTED** | ✅ `main.ts:20-42` - Same dependency injection and wiring; same CLI interface                                              |

**Summary:** 5 of 5 acceptance criteria fully implemented

### Task Completion Validation

| Task                                               | Marked As    | Verified As           | Evidence                                                                                        |
| -------------------------------------------------- | ------------ | --------------------- | ----------------------------------------------------------------------------------------------- |
| **1.1** Create provision-environment.ts            | [x] Complete | **VERIFIED COMPLETE** | ✅ `src/features/setup/use-cases/provision-environment.ts:1-258`                                |
| **1.2** Move private validation logic from command | [x] Complete | **VERIFIED COMPLETE** | ✅ Methods like `validateDaemon()`, `validateBaseModel()`, `provisionCustomModel()` in use case |
| **1.3** Inject LlmPort and SetupUiPort             | [x] Complete | **VERIFIED COMPLETE** | ✅ `provision-environment.ts:11-15` - Constructor injection                                     |
| **2.1** Create provision-environment.test.ts       | [x] Complete | **VERIFIED COMPLETE** | ✅ `src/features/setup/use-cases/provision-environment.test.ts:1-239`                           |
| **2.2** Move logic-heavy tests from command test   | [x] Complete | **VERIFIED COMPLETE** | ✅ Auto-pull, error handling tests in `provision-environment.test.ts:78-237`                    |
| **2.3** Refactor tests to target Use Case directly | [x] Complete | **VERIFIED COMPLETE** | ✅ `provision-environment.test.ts:23-47` - Mocks ports directly, no Commander                   |
| **3.1** Update SetupCommand constructor            | [x] Complete | **VERIFIED COMPLETE** | ✅ `setup-command.ts:13-17` - Accepts ProvisionEnvironment                                      |
| **3.2** Remove private business logic methods      | [x] Complete | **VERIFIED COMPLETE** | ✅ `setup-command.ts:59` - Only error handling remains, no provisioning logic                   |
| **3.3** Update execute method to delegate          | [x] Complete | **VERIFIED COMPLETE** | ✅ `setup-command.ts:35-42` - Simple delegation to use case                                     |
| **4.1** Update main.ts composition                 | [x] Complete | **VERIFIED COMPLETE** | ✅ `main.ts:34-41` - Composes ProvisionEnvironment before SetupCommand                          |
| **4.2** Update createSetupCommand factory          | [x] Complete | **VERIFIED COMPLETE** | ✅ `main.ts:20-42` - Updated factory with use case injection                                    |

**Summary:** 11 of 11 completed tasks verified, 0 questionable, 0 falsely marked complete

### Test Coverage and Gaps

- **Command Tests:** 5/5 passing - Verify wiring and error propagation correctly
- **Use Case Tests:** 8/8 passing - Comprehensive coverage of business logic including daemon validation, base model auto-pull, custom model creation, and error scenarios
- **No Test Gaps:** All acceptance criteria have corresponding test coverage

### Architectural Alignment

- **Hexagonal Architecture:** ✅ Perfect compliance - Use case has no external dependencies, clean port interfaces
- **Dependency Injection:** ✅ Manual DI pattern implemented correctly in composition root
- **Error Handling:** ✅ Typed error classes used consistently throughout both command and use case layers
- **Code Organization:** ✅ Follows established project structure with use cases in proper feature directory

### Security Notes

No security concerns identified. Error handling does not expose sensitive information.

### Best-Practices and References

- **Context7 Validation:** Node.js and TypeScript patterns align with current best practices
- **Clean Code:** Function sizes under 15 lines, clear naming, single responsibility principle followed
- **Testing:** Proper isolation between unit and integration tests, good mock usage patterns

### Action Items

**Code Changes Required:**

- None

**Advisory Notes:**

- Note: This refactor serves as an excellent reference for future command-to-use-case migrations
- Note: Consider documenting the thin adapter pattern in the architecture documentation for consistency

---

## Change Log

**2025-12-01:** Senior Developer Review notes appended - Story approved with no action items required
