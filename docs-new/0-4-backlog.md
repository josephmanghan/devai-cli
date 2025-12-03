# Version 0.4.0 Backlog

## High Priority (Quick Wins)

- [x] **Test Verification**: Double check that tests prove that setup delete and then recreate model
- [ ] **Spinner**: Add spinner on generating output
- [ ] **Error Message Bug Fix**: Update outdated "[R]egenerate [E]dit manually [C]ancel" messages in generate-commit.ts and generate-commit.test.ts that reference old UI pattern instead of new Commander Select action selector (action-selector.ts)
- [ ] **Configuration Conflict Bug**: GenerateCommit class has hardcoded default parameters that conflict with CONVENTIONAL_COMMIT_MODEL_CONFIG

## Medium Priority (Implementation Tasks)

- [ ] **Retries Counter**: Display retries as a counter during operations
- [ ] **Post-install Setup**: Add post-install script for initial setup

## Lower Priority (Complex Features)

- [ ] **Body Support / Prompting Enhancement**: Get body functionality working and improve prompting side of things (testing in mock repo needed)

## Development Notes

### Test Verification

- **Status**: ✅ Completed
- **Findings**:
  - Logic verified in `src/features/setup/use-cases/provision-custom-model.ts:29-35` correctly deletes existing custom model before recreation
  - Test coverage confirmed in `src/features/setup/use-cases/provision-custom-model.test.ts:57-76` verifies delete-and-recreate behavior
  - Additional test verifies correct order (delete before create)
  - Migration path properly implemented - setup will handle custom model updates correctly

### Spinner

- **Status**: 🔄 Pending
- **Notes**: Add spinner on generating output

### Retries Counter

- **Status**: 🔄 Pending
- **Notes**: Display retries as a counter during operations

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
- **Bug Report**: GenerateCommit class ignores CONVENTIONAL_COMMIT_MODEL_CONFIG and uses hardcoded defaults
- **Root Cause**: generate-commit.ts:16-20 defines DEFAULT_GENERATION_OPTIONS with hardcoded model: 'qwen2.5-coder:1.5b', temperature: 0.3, num_ctx: 10000
- **Expected Behavior**: Should use CONVENTIONAL_COMMIT_MODEL_CONFIG parameters (model: 'devai-cli-commit:latest', temperature: 0.2, num_ctx: 131072)
- **Files Affected**:
  - `src/features/commit/use-cases/generate-commit.ts` - contains conflicting DEFAULT_GENERATION_OPTIONS
  - `src/infrastructure/config/conventional-commit-model.config.ts` - proper configuration that should be used
- **Fix Required**: Inject configuration or import CONVENTIONAL_COMMIT_MODEL_CONFIG instead of hardcoded defaults

### Body Support / Prompting Enhancement

- **Status**: 🔄 Pending
- **Notes**: Get body functionality working and improve prompting side of things (testing in mock repo needed)
