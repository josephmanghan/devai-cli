# Version 0.4.0 Backlog

## High Priority (Quick Wins)

- [x] **Test Verification**: Double check that tests prove that setup delete and then recreate model
- [x] **Spinner**: Add spinner on generating output
- [ ] **Error Message Bug Fix**: Update outdated "[R]egenerate [E]dit manually [C]ancel" messages in generate-commit.ts and generate-commit.test.ts that reference old UI pattern instead of new Commander Select action selector (action-selector.ts)
- [ ] **Configuration Conflict Bug**: GenerateCommit class has hardcoded default parameters that conflict with CONVENTIONAL_COMMIT_MODEL_CONFIG

## Medium Priority (Implementation Tasks)

- [x] **Retries Counter**: Display retries as a counter during operations (DEFERRED - See rationale below)
- [ ] **Post-install Setup**: Add post-install script for initial setup

## Lower Priority (Complex Features)

- [ ] **Body Support / Prompting Enhancement**: Get body functionality working and improve prompting side of things (testing in mock repo needed)
- [ ] **Removal reads**: The agent is terrible at seeing in a git diff when lines have been REMOVED. We should rectify this in the system prompt.

## Development Notes

### Test Verification

- **Status**: ✅ Completed
- **Findings**:
  - Logic verified in `src/features/setup/use-cases/provision-custom-model.ts:29-35` correctly deletes existing custom model before recreation
  - Test coverage confirmed in `src/features/setup/use-cases/provision-custom-model.test.ts:57-76` verifies delete-and-recreate behavior
  - Additional test verifies correct order (delete before create)
  - Migration path properly implemented - setup will handle custom model updates correctly

### Spinner

- **Status**: ✅ Completed (2025-12-03)
- **Implementation Complete**: ✅
- **Architecture**: Clean separation maintained - UI logic stays in controller layer
- **Key Features Implemented**:
  - Visual feedback during LLM commit message generation
  - Proper error handling with spinner cleanup
  - Support for retry scenarios (spinner remains active)
  - Comprehensive test coverage (unit + integration + E2E)
- **Files Modified**:
  - `src/core/ports/commit-ui-port.ts` - Added `startThinking()` and `stopThinking()` methods
  - `src/ui/adapters/commit-adapter.ts` - Implemented spinner functionality using `ora`
  - `src/features/commit/controllers/commit-controller.ts` - Integrated spinner lifecycle with refactored `generateMessageWithSpinner()` method
  - **Tests**: Complete unit, integration, and E2E test coverage
- **Verification**: All 305 tests passing
- **User Experience**: Solves "black hole" UX problem - users now see "Generating commit message..." spinner during generation

### Retries Counter

- **Status**: ✅ Deferred (DECISION MADE 2025-12-03)
- **Decision**: Scope minimization - implement spinner-only approach first
- **Rationale**:

  **Architectural Complexity Trade-off:**
  - Spinner-only approach keeps `GenerateCommit` use case pure (zero UI dependencies)
  - Retry counter requires injecting `CommitUiPort` into business logic layer, violating separation of concerns
  - Alternative event-driven approach adds significant complexity without proportional value

  **Scope Management:**
  - Spinner alone solves the core UX problem: "users don't know if system is working"
  - Retry counter adds transparency but doesn't solve core blocking issue
  - Retries are typically fast (< 1 second each), so hidden retries are acceptable UX
  - If users report confusion about slow generation times, this can be revisited with event-driven refactor

  **Implementation Priority:**
  - Focus resources on delivering spinner quick win first
  - Retry counter enhancement deferred to post-MVP if needed
  - Maintains clean architecture while delivering immediate value

- **Acceptance Criteria for Future Consideration**:
  - User feedback indicates confusion about retry behavior
  - Event-driven progress system is designed and approved
  - Refactor won't impact spinner implementation already in production

### Post-install Setup

- **Status**: 🔄 Pending
- **Notes**: Add post-install script for initial setup

### Error Message Bug Fix

- **Status**: 🔄 Pending
- **Bug Report**: Failed to generate valid commit message after maximum attempts error shows outdated "[R]egenerate [E]dit manually [C]ancel" text
- **Root Cause**: Error messages in generate-commit.ts:33-34, 39-40, 62-63, 107-109, 117-120 still reference old UI pattern
- **Files Affected**:
  - `src/features/commit/use-cases/generate-commit.ts` - contains outdated error messages
  - `src/features/commit/use-cases/generate-commit.test.ts` - tests expect old error message format
  - `src/ui/commit/components/action-selector/action-selector.ts` - reference for new Commander Select implementation
- **Fix Required**: Replace old error messages with proper reference to new action selector approach

### Configuration Conflict Bug

- **Status**: 🔄 Pending
- **Bug Report**: GenerateCommit class ignores CONVENTIONAL_COMMIT_MODEL_CONFIG and uses hardcoded defaults across multiple dimensions
- **Root Cause**: generate-commit.ts:16-20 defines DEFAULT_GENERATION_OPTIONS with hardcoded values that completely override the proper configuration
- **Configuration Space Problems**:
  - **Model Selection**: Uses base model 'qwen2.5-coder:1.5b' instead of custom 'devai-cli-commit:latest' model
  - **System Prompt**: Bypasses specialized conventional commit system prompt created during setup
  - **Generation Parameters**: Uses temperature: 0.3, num_ctx: 10000 instead of temperature: 0.2, num_ctx: 131072
  - **Resource Management**: Missing keep_alive: 0 parameter, causing models to remain loaded in memory
- **Two Configuration Contexts**:
  - **Model Creation** (working): CONVENTIONAL_COMMIT_MODEL_CONFIG used for creating custom model with specialized system prompt
  - **Generation** (broken): GenerateCommit ignores config and uses hardcoded defaults for base model
- **Expected Behavior**: Should use custom 'devai-cli-commit:latest' model with CONVENTIONAL_COMMIT_MODEL_CONFIG parameters (temperature: 0.2, num_ctx: 131072, keep_alive: 0)
- **Files Affected**:
  - `src/features/commit/use-cases/generate-commit.ts` - contains hardcoded DEFAULT_GENERATION_OPTIONS
  - `src/infrastructure/config/conventional-commit-model.config.ts` - proper configuration not being utilized
- **Validation**: Test at src/infrastructure/adapters/ollama/ollama-adapter.test.ts:533-541 proves keep_alive: 0 mechanism works when passed correctly

### Body Support / Prompting Enhancement

- **Status**: 🔄 Pending
- **Notes**: Get body functionality working and improve prompting side of things (testing in mock repo needed)
