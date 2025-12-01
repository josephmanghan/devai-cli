# Epic 3: Git & Editor Infrastructure (Consolidated)

**Goal:** Enable the tool to interact with the Git repository and system text editor, and validate execution preconditions.
**User Value:** Users get immediate, clear feedback about their git state, and the tool can securely execute commits and open editors.
**FRs Covered:** FR1, FR2, FR3, FR4, FR6, FR27, FR30, FR33, FR36, FR46

---

## Story 3.1: Implement Git Infrastructure (Port & Adapter)

**As a** developer
**I want** a unified service to handle all low-level git operations
**So that** the core logic interacts with an abstract interface rather than raw shell commands

**Acceptance Criteria:**

- [ ] Port defined: `src/core/ports/git-port.ts`
  - [ ] `isGitRepository(): Promise<boolean>`
  - [ ] `getStagedDiff(): Promise<string>` (Returns empty string if no changes)
  - [ ] `getBranchName(): Promise<string>`
  - [ ] `commitChanges(message: string): Promise<void>`
- [ ] Adapter implemented: `src/infrastructure/adapters/shell-git-adapter.ts`
  - [ ] Implements `GitPort`
  - [ ] Uses `execa` (v9.6.0) for shell execution
  - [ ] Wraps `execa` errors in `SystemError` (Exit code 3)
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Dependencies:** `execa` is already installed.
- **Commands:**
  - Repo Check: `git rev-parse --is-inside-work-tree`
  - Diff: `git diff --cached`
  - Branch: `git branch --show-current` (Fallback to `git rev-parse HEAD` if detached)
  - Commit: `git commit -m <msg>`
- **Error Handling:** Use `SystemError` for shell failures (e.g., git binary missing). Do not throw domain errors (like `NoStagedChanges`) here—the Adapter just reports what Git says; the Use Case handles logic.

**Testing Deliverables:**

- **Co-located Test:** `src/infrastructure/adapters/shell-git-adapter.test.ts`
- **Unit Tests:** Mock `execa` to simulate:
  - Successful diff output
  - Empty diff output
  - Binary file diffs
  - Commit success/failure

---

## Story 3.2: Implement Editor Infrastructure (Port & Adapter)

**As a** developer
**I want** a unified service to open the system text editor
**So that** users can edit commit messages in their preferred environment

**Acceptance Criteria:**

- [ ] Port defined: `src/core/ports/editor-port.ts`
  - [ ] `openEditor(initialContent: string): Promise<string>`
- [ ] Adapter implemented: `src/infrastructure/adapters/shell-editor-adapter.ts`
  - [ ] Implements `EditorPort`
  - [ ] Respects `$EDITOR` environment variable (defaults to `nano`)
  - [ ] Uses temporary file pattern (`.git/COMMIT_EDITMSG_OLLATOOL`)
  - [ ] Uses `stdio: 'inherit'` to give editor control of terminal
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Flow:**
  1. Write `initialContent` to temp file.
  2. Spawn editor process (must block until exit).
  3. Read file content back.
  4. **Crucial:** Always delete temp file in `finally` block.
- **Edge Cases:**
  - `$EDITOR` is invalid/missing -> Fallback to `vim` or `nano`.
  - Editor exits with error code -> Throw `UserError` (Exit 2).

**Testing Deliverables:**

- **Co-located Test:** `src/infrastructure/adapters/shell-editor-adapter.test.ts`
- **Unit Tests:**
  - Mock `fs` and `execa`/`spawn`.
  - Verify temp file creation and deletion.
  - Verify environment variable usage.

---

## Story 3.3: Implement Precondition Validation (Use Case)

**As a** developer
**I want** to orchestrate all system checks in a specific order
**So that** the tool fails fast with actionable advice before attempting expensive AI operations

**Acceptance Criteria:**

- [ ] Use Case created: `src/features/commit/use-cases/validate-preconditions.ts`
- [ ] Injects `GitPort` and `LlmPort` (Dependency Injection)
- [ ] Implements "Fail Fast" logic chain:
  1. **Ollama Daemon:** Is it running? -> `SystemError` (Exit 3)
  2. **Git Repo:** Is current dir a repo? -> `UserError` (Exit 2)
  3. **Staged Changes:** Is diff empty? -> `UserError` (Exit 2)
- [ ] Returns a "Context Object" on success: `{ diff: string, branch: string, status: string }`
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Error Alignment (See `src/core/types/errors.types.ts`):**
  - Daemon Fail: `SystemError` ("Ollama not running", "Run ollama serve")
  - Not Repo: `UserError` ("Not a git repository", "Run git init")
  - No Changes: `UserError` ("No staged changes", "Run git add <files>")
- **Logic:** This is the _only_ place where business rules about preconditions live. The Adapters are dumb; this Use Case is smart.

**Testing Deliverables:**

- **Co-located Test:** `src/features/commit/use-cases/validate-preconditions.test.ts`
- **Unit Tests:**
  - Mock Ports to simulate failure states.
  - Verify correct Error type and Exit Code is thrown for each failure.
  - Verify Context Object is returned on success.

---

## Epic 3 Summary

**Total Stories:** 3
**Estimated Complexity:** Low/Medium
**Dependencies:** Epic 1 (Errors/Types), Epic 2 (LlmPort)
**Output:** A fully functioning infrastructure layer for Git and Editor operations, plus the "Gatekeeper" use case for the main command.

**Completion Criteria:**

- `ShellGitAdapter` successfully executes commands in a real repo.
- `ShellEditorAdapter` can launch `nano` (or mock) and capture input.
- `ValidatePreconditions` correctly stops execution if user hasn't staged files.
