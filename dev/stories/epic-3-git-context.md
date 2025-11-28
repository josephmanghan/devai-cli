# Epic 3: Git Context Gathering & Validation - Story Breakdown

**Goal:** Enable tool to read git state and validate preconditions
**User Value:** Users get immediate, clear feedback about their git state (staged changes, repository status) before expensive operations
**FRs Covered:** FR1, FR2, FR3, FR4, FR6, FR33, FR36

---

## Story 3.1: Create Git Port Interface

**As a** developer
**I want** a port interface defining git operations
**So that** the core domain doesn't depend on shell command execution

**Acceptance Criteria:**

- [ ] Interface created in `src/core/ports/git-port.ts`
- [ ] Methods defined: `isGitRepository()`, `getStagedDiff()`, `getBranchName()`, `commitChanges()`
- [ ] Type definitions for diff output and commit parameters
- [ ] Interface documented with JSDoc
- [ ] Zero external dependencies in core/
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Hexagonal architecture: core defines ports (interfaces)
- Infrastructure layer will implement as ShellGitAdapter using execa
- Interface methods derived from FR1-FR4, FR33, FR36
- Diff format: unified diff string (git diff --staged output)

**Testing Deliverables:**

- No runtime tests (interface only)
- Verify TypeScript compiles with strict mode
- Verify core/ maintains zero external dependencies

**FRs Covered:** FR49 (extensible architecture)

---

## Story 3.2: Implement ShellGitAdapter

**As a** developer
**I want** a git adapter that executes git commands via shell
**So that** I can read repository state without git library dependencies

**Acceptance Criteria:**

- [ ] ShellGitAdapter created in `src/infrastructure/adapters/shell-git-adapter.ts`
- [ ] Implements Git port interface from core
- [ ] execa (9.6.0) installed and imported
- [ ] Constructor accepts cwd parameter (manual DI)
- [ ] All port methods implemented with error handling
- [ ] Commands use execa for shell execution
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies execa 9.6.0 for shell commands
- ESM-native, replaces child_process with better API
- Default cwd to process.cwd() if not provided
- Error handling: catch execa errors, throw typed domain errors
- Commands: `git rev-parse --is-inside-work-tree`, `git diff --staged`, etc.

**Testing Deliverables:**

- Unit tests with mocked execa
- Test: isGitRepository() returns true/false correctly
- Test: Error handling for git command failures
- Co-located test: `shell-git-adapter.test.ts`

**FRs Covered:** FR1 (git repository detection)

---

## Story 3.3: Implement Staged Changes Detection

**As a** developer
**I want** to detect whether staged changes exist
**So that** the commit command can fail fast if nothing to commit

**Acceptance Criteria:**

- [ ] ShellGitAdapter.getStagedDiff() implemented
- [ ] Returns empty string if no staged changes
- [ ] Returns unified diff output if changes exist
- [ ] Handles binary file changes gracefully
- [ ] Command: `git diff --staged`
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Empty diff = no staged changes (precondition failure)
- Diff string used later for AI prompt construction
- Binary files: git shows "Binary files differ" placeholder
- Performance: diff should be fast (<100ms typical)

**Testing Deliverables:**

- Unit test: no staged changes returns empty string
- Unit test: staged changes return diff output
- Unit test: binary file handling
- Mock execa to return sample diff outputs

**FRs Covered:** FR2 (detect staged changes), FR3 (fail if no changes)

---

## Story 3.4: Implement Branch Name Extraction

**As a** developer
**I want** to extract current git branch name
**So that** it can be included in commit metadata or error messages

**Acceptance Criteria:**

- [ ] ShellGitAdapter.getBranchName() implemented
- [ ] Returns current branch name as string
- [ ] Handles detached HEAD state (return commit hash)
- [ ] Command: `git branch --show-current`
- [ ] Fallback: `git rev-parse HEAD` if detached
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Primary use: informational (user context)
- Detached HEAD: return first 7 chars of commit hash
- Error handling: throw if git command fails
- Not critical path for MVP (nice-to-have metadata)

**Testing Deliverables:**

- Unit test: normal branch returns name
- Unit test: detached HEAD returns commit hash
- Unit test: Error handling for failures
- Mock execa with branch name output

**FRs Covered:** FR33 (read current branch)

---

## Story 3.5: Implement Commit Execution

**As a** developer
**I want** to execute git commit with a message
**So that** the tool can finalize commits after approval

**Acceptance Criteria:**

- [ ] ShellGitAdapter.commitChanges(message) implemented
- [ ] Executes `git commit -m <message>`
- [ ] Returns success/failure status
- [ ] Preserves multi-line commit messages
- [ ] Handles commit hook failures gracefully
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Message must be properly escaped for shell
- execa handles argument escaping automatically
- Multi-line messages: use array args, not string concatenation
- Command: `git commit -m <message>` (execa with args array)
- Commit hooks may fail (pre-commit, commit-msg)

**Testing Deliverables:**

- Unit test: commit succeeds with valid message
- Unit test: multi-line message preserved
- Unit test: commit hook failure detected
- Mock execa with success/failure responses

**FRs Covered:** FR36 (execute git commit)

---

## Story 3.6: Implement Git Validation Use Case

**As a** developer
**I want** a use case that validates all git preconditions
**So that** the commit command can fail fast with clear errors

**Acceptance Criteria:**

- [ ] Use case created in `src/features/commit/validate-git-preconditions.ts`
- [ ] Checks: is git repo, has staged changes, Ollama setup complete
- [ ] Returns typed result (success + data OR failure + error)
- [ ] Integrates with ShellGitAdapter via port
- [ ] Clear error messages for each failure mode

**Technical Notes:**

- Validation order: git repo → staged changes → Ollama setup
- Fail fast: stop on first failure, return error
- Success result includes diff + branch name (for prompt construction)
- Error types: NotGitRepository, NoStagedChanges, OllamaNotSetup
- Use case coordinates adapters (git + Ollama)

**Testing Deliverables:**

- Unit test: all validations pass returns success
- Unit test: not a git repo returns typed error
- Unit test: no staged changes returns typed error
- Unit test: Ollama not setup returns typed error
- Mock both adapters for isolated testing

**FRs Covered:** FR1 (git repo check), FR3 (staged changes check), FR4 (clear validation errors)

---

## Story 3.7: Implement Git Error Handling

**As a** developer
**I want** clear error messages for git-related failures
**So that** users know exactly how to fix their git state

**Acceptance Criteria:**

- [ ] Typed error classes: NotGitRepository, NoStagedChanges, GitCommandFailed
- [ ] Each error includes remediation guidance
- [ ] Exit codes: user=2 (no staged changes), system=3 (git command fail)
- [ ] Error messages reference git commands to fix issues
- [ ] Integration with command handler

**Technical Notes:**

- Architecture specifies typed error classes with exit codes
- User errors (exit 2): no staged changes (run `git add`)
- System errors (exit 3): git command failed (check git installation)
- Validation errors (exit 4): not a git repo (run `git init`)
- Actionable messages per PRD requirement (FR38-40)

**Testing Deliverables:**

- Unit test: NoStagedChanges includes "git add" guidance
- Unit test: NotGitRepository includes "git init" guidance
- Unit test: Exit codes map correctly
- Co-located tests for error classes

**FRs Covered:** FR4 (validation errors), FR38-40 (actionable guidance), FR6 (failed preconditions)

---

## Epic 3 Summary

**Total Stories:** 7
**Estimated Complexity:** Medium (shell command integration)
**Dependencies:** Epic 1 (Foundation) must be complete
**Output:** Working git integration that validates preconditions and reads staged changes

**Completion Criteria:**

- All 7 stories pass acceptance criteria
- ShellGitAdapter works with real git commands (integration test)
- Validation use case returns clear errors for each failure mode
- Unit tests cover ShellGitAdapter with mocked execa
- Manual testing confirms validation works in real repositories
