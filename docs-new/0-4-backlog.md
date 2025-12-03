# Version 0.4.0 Backlog

## High Priority (Quick Wins)

- [x] **Test Verification**: Double check that tests prove that setup delete and then recreate model
- [x] **Spinner**: Add spinner on generating output
- [x] **Error Message Bug Fix**: Update outdated "[R]egenerate [E]dit manually [C]ancel" messages in generate-commit.ts and generate-commit.test.ts that reference old UI pattern instead of new Commander Select action selector (action-selector.ts)
- [x] **Configuration Conflict Bug**: GenerateCommit class has hardcoded default parameters that conflict with CONVENTIONAL_COMMIT_MODEL_CONFIG

## Medium Priority (Implementation Tasks)

- [x] **Retries Counter**: Display retries as a counter during operations (DEFERRED - See rationale below)
- [x] **Post-install Setup**: Add post-install script for initial setup

## Lower Priority (Complex Features)

- [ ] **Body Support / Prompting Enhancement**: Get body functionality working and improve prompting side of things (testing in mock repo needed)
- [ ] **Flaky Test Fix**: Integration test is flaky due to scope introduction - either introduce scope properly or regex remove scopes from commit messages
- [ ] **Removal reads**: The agent is terrible at seeing in a git diff when lines have been REMOVED. We should rectify this in the system prompt. `gitdiff-reading-instructions.md` should help.
- [ ] **Add Intent**: Provide greater intent to the agent:
  - [ ] 1. The original plan was to provide <type> to the agent so it has context for prompt. I don't think that made it in. This would hopefully be a slight improvement. Test this before moving on.
  - [x] 2. On the Commander.select() options for edit/refenerate etc, we should offer another solution for Provide Prompt (name to be decided). This lets you describe to the agent the general idea so that you can interact with the agent to an extent to inform it of what happened. This would eradicate - hopefully - some issues around e.g. when it reads jsdocs as actual code changes.
  - [ ] 3. Regenerate should request that the agent thinks about the problem differently, potentially upping the temperature.
- [ ] **Params experimentation**: I would link this into the body support as well as the intent stuff. I think that's basically a whole epics around testing outputs when we have a test environment setup that we can test in. This is removal reads as well. We can test it's a whole epics around the actual prompt generation where we want to have a little play with the system prompt with the way the actual prompt works. The other thing that I'm specifically mentioning here is that I think we should have a little bit of a play with the temperature such that we can see if up or down is kind of better. And that applies both to the initial prompt and adjusting it as part of regeneration.

_TODO: create specific epic to capture prompt generation initatives_

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

- **Status**: ✅ Completed (2025-12-03)
- **Implementation Complete**: ✅
- **Architecture**: Simple npm postinstall script using echo for user notification
- **Key Changes Implemented**:
  - **Post-install Script**: Added `"postinstall": "echo '✅ devai-cli installed! Run \"devai-cli setup\" to complete configuration.'"` to package.json
  - **User Notification**: Provides clear guidance to users after installation or upgrade
  - **Minimal Complexity**: Uses echo command for maximum reliability across all npm environments
- **Files Modified**:
  - `package.json` - Added postinstall script in scripts section
- **Message Content**:
  - Confirms successful installation: "✅ devai-cli installed!"
  - Provides clear next step: "Run \"devai-cli setup\" to complete configuration."
  - Avoids technical details about Ollama or model management
- **Verification**: Tested via `npm run postinstall` - message displays correctly
- **User Experience**: Automatically runs after every `npm install devai-cli`, serving as helpful reminder for both new installations and upgrades

### Error Message Bug Fix

- **Status**: ✅ Completed (2025-12-03)
- **Implementation Complete**: ✅
- **Architecture**: Clean error messages updated to reflect modern action selector UI
- **Key Changes Implemented**:
  - **Removed Outdated UI References**: Eliminated "[R]egenerate [E]dit manually [C]ancel" text from all ValidationError instances
  - **Simplified Error Messages**: Cleaned up error messages to focus on core validation issues without UI pattern references
  - **Updated Test Cases**: Modified corresponding test expectations to match new error format
  - **Maintained Functionality**: All validation logic preserved while removing outdated UI hints
- **Files Modified**:
  - `src/features/commit/use-cases/generate-commit.ts` - Updated 3 ValidationError instances to remove old UI pattern references
  - `src/features/commit/use-cases/generate-commit.test.ts` - Updated 2 test cases to expect new error message format
  - `src/ui/commit/components/action-selector/action-selector.ts` - Reference for new Commander Select implementation (unchanged)
- **Error Message Changes**:
  - Empty commit type validation: Now uses clean message without UI hint
  - Empty git diff validation: Now uses clean message without UI hint
  - Maximum retries exceeded: Now uses clean message without UI hint
- **Verification**: All 305 tests passing, build successful, proper error handling maintained
- **User Experience**: Error messages are now consistent with modern action selector interface that provides "Approve", "Edit", "Regenerate", "Cancel" options via Commander Select

### Configuration Conflict Bug

- **Status**: ✅ Completed (2025-12-03)
- **Implementation Complete**: ✅
- **Architecture**: Dependency injection pattern implemented - configuration is now explicitly injected into GenerateCommit use case
- **Key Changes Implemented**:
  - **Type System Refactoring**: `OllamaModelConfig` now extends `GenerationOptions` to eliminate duplication between model creation and runtime parameters
  - **Configuration Flattening**: Removed nested `parameters` object - all generation parameters are now top-level fields
  - **Dependency Injection**: GenerateCommit constructor now accepts `OllamaModelConfig` and uses injected values instead of hardcoded defaults
  - **Adapter Cleanup**: Removed `parameters` constructor parameter from OllamaAdapter since runtime parameters are passed explicitly
  - **Composition Root Update**: Updated main.ts to inject config into GenerateCommit instance
- **Files Modified**:
  - `src/core/types/llm-types.ts` - Made OllamaModelConfig extend GenerationOptions
  - `src/infrastructure/config/conventional-commit-model.config.ts` - Flattened config structure
  - `src/features/commit/use-cases/generate-commit.ts` - Removed hardcoded defaults, added config injection
  - `src/infrastructure/adapters/ollama/ollama-adapter.ts` - Removed parameters constructor argument
  - `src/main.ts` - Updated composition root to inject config
  - **Tests**: Updated all test files to use new flattened config structure and verify DI behavior
- **Configuration Flow**:
  - Model Creation: Uses custom 'devai-cli-commit:latest' with baked-in system prompt
  - Runtime Generation: Uses injected config parameters (model: 'devai-cli-commit:latest', temperature: 0.2, num_ctx: 131072, keep_alive: 0)
- **Verification**: All tests passing, proper resource management with keep_alive: 0 ensures models unload immediately after generation

### Body Support / Prompting Enhancement

- **Status**: 🔄 Pending
- **Notes**: Get body functionality working and improve prompting side of things (testing in mock repo needed)
- **System Prompt Architecture**: Consider implementing prompt structure validation tool and strengthening system prompt following Anthropic best practices (persona, context, reasoning, task) - particularly relevant when adding git diff understanding improvements
