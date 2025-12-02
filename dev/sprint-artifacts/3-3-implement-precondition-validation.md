# Story 3.3: Implement Validate Preconditions

Status: done

## Story

As a CLI user,
I want the application to validate all prerequisites before starting expensive AI generation,
so that I get fast, clear feedback about what needs to be fixed.

## Acceptance Criteria

1. When Ollama daemon is not running, throw SystemError with exit code 3
2. When current directory is not a git repository, throw UserError with exit code 2
3. When no staged changes exist, throw UserError with exit code 2
4. When all checks pass, return CommitContext containing staged diff and branch name

## Tasks / Subtasks

- [x] Create CommitContext interface (AC: #4)
- [x] Implement ValidatePreconditions use case class (AC: #1, #2, #3)
  - [x] Constructor accepts GitPort and LlmPort dependencies
  - [x] execute() method with sequential validation chain
- [x] Create unit tests for ValidatePreconditions (AC: #1, #2, #3, #4)
  - [x] Test daemon failure throws SystemError (exit 3)
  - [x] Test non-git repo throws UserError (exit 2)
  - [x] Test no staged changes throws UserError (exit 2)
  - [x] Test success returns CommitContext with diff and branch
- [x] Verify error messages are actionable and clear
- [x] Run npm run pr to ensure quality gates pass

## Dev Notes

### Architecture Constraints

- Must follow Hexagonal Architecture patterns established in Epic 2
- Use existing UserError and SystemError types from core/types/errors.types.ts
- Dependencies injected via constructor (DI pattern)
- Pure orchestration logic - no shell commands directly in use case

### Error Handling Patterns

- SystemError for infrastructure failures (daemon down)
- UserError for user-fixable issues (not in repo, no staged changes)
- Exit codes: SystemError = 3, UserError = 2

### Testing Standards

- Co-located tests using Vitest
- Mock GitPort and LlmPort interfaces
- Test all failure paths and success path
- Follow async generator mocking patterns from Epic 2

### Project Structure Notes

- File location: `src/features/commit/use-cases/validate-preconditions.ts`
- Test location: `src/features/commit/use-cases/validate-preconditions.test.ts`
- Consistent with established hexagonal architecture
- Uses existing error type definitions and port interfaces

### References

- [Source: dev/sprint-artifacts/tech-spec-epic-3.md#Detailed-Design]
- [Source: dev/sprint-artifacts/tech-spec-epic-3.md#Workflows-and-Sequencing]
- [Source: stories/2-7-architectural-refactor.md] - Hexagonal architecture patterns

## Dev Agent Record

### Context Reference

- [dev/sprint-artifacts/3-3-implement-precondition-validation.context.xml](./3-3-implement-precondition-validation.context.xml)

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

- ✅ Implemented ValidatePreconditions use case with sequential validation chain
- ✅ Created CommitContext interface with diff and branch properties
- ✅ Added comprehensive unit tests covering all acceptance criteria
- ✅ All tests passing (147 total, 9 new tests for ValidatePreconditions)
- ✅ Linting passes with proper TypeScript strict checks
- ✅ Error messages are actionable and clear for each failure scenario
- ✅ Implementation follows hexagonal architecture patterns
- ✅ Private helper methods extracted for code readability and maintainability

### File List

- src/features/commit/use-cases/validate-preconditions.ts (created)
- src/features/commit/use-cases/validate-preconditions.test.ts (created)

### Human Dev Notes - DO NOT EDIT

- Needs to import from index barrel files and update local index file to export
- Added a type to features, not core/types. I have resolved.
