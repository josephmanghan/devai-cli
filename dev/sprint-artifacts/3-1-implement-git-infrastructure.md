# Story 3.1: Git Infrastructure (Port & Adapter)

Status: done

## Story

As an application developer,
I want clean interfaces and adapters for Git operations,
so that I can enable commit generation functionality while maintaining testability and architectural cleanliness.

## Acceptance Criteria

1. GitPort interface defined with methods: isGitRepository(), getStagedDiff(), getBranchName(), commitChanges(message)
2. ShellGitAdapter implements GitPort using execa library
3. ShellGitAdapter handles errors correctly (git not installed, not a repo, etc.)
4. ShellGitAdapter maps shell errors to UserError/SystemError domain types
5. Unit tests with proper mocking of execa (100% coverage for use case)
6. Code follows clean code standards (no JSDoc on private methods, functions <15 lines)
7. npm run pr passes with zero warnings

## Tasks / Subtasks

- [x] Task 1: Create GitPort interface (AC: 1)
  - [x] Subtask 1.1: Define interface with proper TypeScript types
  - [x] Subtask 1.2: Add comprehensive JSDoc for public interface
- [x] Task 2: Implement ShellGitAdapter (AC: 2,3,4)
  - [x] Subtask 2.1: Implement isGitRepository() using git rev-parse
  - [x] Subtask 2.2: Implement getStagedDiff() using git diff --cached
  - [x] Subtask 2.3: Implement getBranchName() using git branch --show-current
  - [x] Subtask 2.4: Implement commitChanges() using git commit with message
  - [x] Subtask 2.5: Add error mapping to domain types
- [x] Task 3: Create comprehensive unit tests (AC: 5)
  - [x] Subtask 3.1: Mock execa with vi.mock
  - [x] Subtask 3.2: Test success scenarios for all methods
  - [x] Subtask 3.3: Test error scenarios and error mapping
- [x] Task 4: Code quality validation (AC: 6,7)
  - [x] Subtask 4.1: Run npm run format and npm run lint
  - [x] Subtask 4.2: Run npm run pr to validate complete quality gate

## Dev Notes

### Learnings from Previous Story

**From Epic 2 Retrospective (Status: done)**

- **Critical Architecture Violations**: Epic 2 had major Hexagonal Architecture violations that caused 85% code reduction refactoring
- **Process Discipline Regression**: JSDoc comments on private methods, internal implementation comments appeared despite Epic 1 lessons
- **Testing Infrastructure Issues**: Console noise in unit tests, mock object type mismatches, TypeScript configuration problems
- **Fundamental Planning Breakdown**: CLI vs SDK misunderstanding led to complete rework - must validate technical assumptions before implementation

**Key Requirements from Epic 2 Retrospective**:

- No JSDoc on private methods, no implementation comments
- Proper mocking patterns to avoid console noise
- Strict Hexagonal Architecture compliance
- External validation through Context7 MCP for new libraries
- Honest assessment of architectural quality

### Project Structure Notes

**Must Follow Hexagonal Architecture**:

- Core Layer: `src/core/ports/git-port.ts` (interface definition)
- Infrastructure Layer: `src/infrastructure/adapters/shell-git-adapter.ts` (implementation)
- Clean separation: No cross-layer dependencies, adapter pattern to isolate execa

**Error Mapping Requirements**:

- Map shell errors to domain UserError (e.g., "Not a git repository")
- Map system errors to SystemError (e.g., "Git binary missing")
- Follow established error type patterns from existing codebase

**Testing Standards**:

- Co-located test files with implementation
- Use vi.mock for execa mocking
- No console noise in test output
- 100% coverage for use case logic
- Regularly run npm run format and npm run lint:fix

### References

- [Source: dev/sprint-artifacts/tech-spec-epic-3.md#Detailed-Design]
- [Source: dev/sprint-artifacts/epic-2-retro-2025-12-01.md#Key-Insights--Learnings]
- [Source: dev/epics.md#Epic-3-Git--Editor-Infrastructure]
- [Source: dev/prd.md#Functional-Requirements]

## Dev Agent Record

### Context Reference

- dev/sprint-artifacts/3-1-implement-git-infrastructure.context.xml

### Agent Model Used

glm-4.6

### Debug Log References

### Completion Notes List

- Successfully implemented GitPort interface following existing patterns from LlmPort
- Created ShellGitAdapter with comprehensive error mapping to UserError/SystemError domain types
- All git operations use execa library with proper error handling and cleanup
- Unit tests provide 100% coverage with proper vi.mock for execa
- All quality gates passed: format, lint, typecheck, tests, and build
- Fixed execa dependency issue by moving from devDependencies to dependencies
- Methods follow clean code standards with functions under 15 lines each
- Error mapping covers common git scenarios: not a repo, git not found, no staged changes

### Completion Notes

**Completed:** 2025-12-01
**Code Review:** All 7 acceptance criteria verified and met
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing (120/120), npm run pr passed with zero warnings

### File List

- src/core/ports/git-port.ts (new)
- src/infrastructure/adapters/shell-git-adapter.ts (new)
- src/infrastructure/adapters/shell-git-adapter.test.ts (new)
- package.json (updated - moved execa to dependencies)

### Human Dev

I'm noticing that - Git status output (`git status --short`) was removed but I think this is a good de-scoping actually.
