# Epic 5: Interactive Commit Workflow - Story Breakdown

**Goal:** Enable users to review, edit, and approve AI-generated commit messages
**User Value:** Users can complete full commit workflow from type selection through approval/edit/regenerate
**FRs Covered:** FR13, FR14, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR46, FR47, FR48

**DEPENDENCY:** Requires Epic 4 (AI Generation) to be complete

---

## Story 5.1: Implement Commit Type Selector

**As a** user
**I want** to select a commit type from a list
**So that** I can specify what kind of change I'm committing

**Acceptance Criteria:**

- [ ] Type selector UI created in `src/ui/prompts/type-selector.ts`
- [ ] Uses @clack/prompts select component
- [ ] Lists all 11 Conventional Commits types with descriptions
- [ ] Keyboard navigation (arrow keys, enter)
- [ ] Returns selected type to workflow
- [ ] Cancellable (Ctrl+C)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies @clack/prompts for interactive UI
- Type list from Epic 4 types enum
- Format: "feat - New feature", "fix - Bug fix", etc.
- Default selection: "feat" (most common)
- No optional scope input in MVP (type only)

**Testing Deliverables:**

- Unit test: selector displays all types
- Unit test: selection returns correct type
- Unit test: cancellation handled gracefully
- Manual test: keyboard navigation works
- Co-located test: `type-selector.test.ts`

**FRs Covered:** FR13 (select commit type), FR14 (interactive prompt)

---

## Story 5.2: Implement Message Preview Display

**As a** user
**I want** to see the AI-generated message before committing
**So that** I can review and verify the message quality

**Acceptance Criteria:**

- [ ] Preview display created in `src/ui/prompts/message-preview.ts`
- [ ] Shows generated message in clear format
- [ ] Highlights commit type (color-coded)
- [ ] Displays message subject and body (if multi-line)
- [ ] No "success" indicator (silent generation per UX spec)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies silent success per UX spec (lines 219-248)
- Display format: just show the message, no "✓ Generated!"
- Color coding: type prefix in color (e.g., feat: in green)
- Use @clack/prompts note or intro for display
- Appears immediately after generation (no loading spinner between generation and preview)

**Testing Deliverables:**

- Unit test: message formatted correctly
- Unit test: multi-line messages display properly
- Manual test: preview appears immediately after generation
- Co-located test: `message-preview.test.ts`

**FRs Covered:** FR25 (preview message), FR26 (review before commit)

---

## Story 5.3: Implement Action Selector (Approve/Edit/Regenerate/Cancel)

**As a** user
**I want** to choose what to do with the generated message
**So that** I can approve, edit, regenerate, or cancel

**Acceptance Criteria:**

- [ ] Action selector created in `src/ui/prompts/action-selector.ts`
- [ ] Options: "Approve and commit", "Edit message", "Regenerate", "Cancel"
- [ ] Keyboard shortcuts: a (approve), e (edit), r (regenerate), c (cancel)
- [ ] Uses @clack/prompts select component
- [ ] Returns action enum to workflow
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture maps to UX spec workflow (FR27-32)
- Default option: "Approve and commit" (optimistic path)
- Keyboard shortcuts must be discoverable in UI
- Cancel = exit without committing
- Regenerate = re-run generation with same type

**Testing Deliverables:**

- Unit test: all 4 options available
- Unit test: keyboard shortcuts mapped correctly
- Unit test: selection returns action enum
- Manual test: keyboard shortcuts work
- Co-located test: `action-selector.test.ts`

**FRs Covered:** FR27 (approve/edit options), FR28 (regenerate option)

---

## Story 5.4: Implement Editor Integration

**As a** user
**I want** to edit the message in my preferred text editor
**So that** I can make manual adjustments before committing

**Acceptance Criteria:**

- [ ] Editor integration created in `src/ui/editor/editor-launcher.ts`
- [ ] Respects $EDITOR environment variable
- [ ] Fallback editors: vim → nano → vi
- [ ] Writes message to temp file: `.git/COMMIT_EDITMSG_OLLATOOL`
- [ ] Spawns editor with `stdio: 'inherit'`
- [ ] Reads edited message after editor closes
- [ ] Cleans up temp file (try/finally)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies temp file + spawn pattern
- execa with `stdio: 'inherit'` for terminal control
- Temp file location: `.git/COMMIT_EDITMSG_OLLATOOL` (git convention)
- Fallback chain: $EDITOR → vim → nano → vi → error
- Windows support: notepad as fallback (cross-platform)
- Error handling: editor exits non-zero, temp file not found

**Testing Deliverables:**

- Unit test: $EDITOR variable respected
- Unit test: fallback chain works
- Unit test: temp file cleaned up (try/finally)
- Unit test: edited message read correctly
- Integration test: actual editor launch (manual)
- Co-located test: `editor-launcher.test.ts`

**FRs Covered:** FR29 (edit in text editor), FR30 ($EDITOR support)

---

## Story 5.5: Implement Regenerate Logic

**As a** user
**I want** to regenerate the message if I don't like the first attempt
**So that** I can get alternative suggestions

**Acceptance Criteria:**

- [ ] Regenerate handler in workflow controller
- [ ] Re-invokes generation pipeline with same type
- [ ] Shows new message preview
- [ ] Returns to action selector (approve/edit/regenerate loop)
- [ ] No limit on regenerate attempts (user controls loop)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Reuses generation pipeline from Epic 4
- Same prompt inputs (type, diff unchanged)
- Model temperature=0.2 may produce similar output (expected)
- No user-facing retry count (unlimited regenerations)
- Each generation ~200-500ms on M1/M2

**Testing Deliverables:**

- Unit test: regenerate calls generation pipeline again
- Unit test: new message replaces old message
- Unit test: workflow returns to action selector
- Integration test: multiple regenerations work
- Co-located test in workflow controller

**FRs Covered:** FR28 (regenerate message), FR31 (alternative suggestions)

---

## Story 5.6: Implement Commit Execution on Approval

**As a** user
**I want** the tool to commit changes when I approve
**So that** my changes are committed with the AI-generated message

**Acceptance Criteria:**

- [ ] Approval handler executes git commit
- [ ] Uses ShellGitAdapter.commitChanges() from Epic 3
- [ ] Shows success message with commit hash
- [ ] Handles commit hook failures gracefully
- [ ] Exits cleanly after successful commit
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Uses git adapter from Epic 3 (already tested)
- Success message: "✓ Committed: [first 7 chars of hash]"
- Commit hooks may fail (pre-commit, commit-msg)
- Hook failure: show error, don't retry (user must fix)
- Exit code 0 on success

**Testing Deliverables:**

- Unit test: approval triggers git commit
- Unit test: success message shown
- Unit test: commit hook failure handled
- Integration test: real commit executed (manual)
- Co-located test in workflow controller

**FRs Covered:** FR32 (commit on approval), FR36 (execute git commit)

---

## Story 5.7: Implement Commit Workflow Orchestrator

**As a** developer
**I want** a workflow controller that orchestrates the full commit flow
**So that** all interactive steps work together cohesively

**Acceptance Criteria:**

- [ ] Workflow controller created in `src/features/commit/commit-workflow-controller.ts`
- [ ] Orchestrates: validate → select type → generate → preview → action loop
- [ ] Handles all action paths: approve, edit, regenerate, cancel
- [ ] Integrates all Epic 5 components
- [ ] Error handling for each step
- [ ] Clean exit on cancel (exit code 0)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Entry point for `ollatool commit` command
- Dependency injection: git adapter, LLM adapter, UI components
- Flow: preconditions → type selector → generation → preview → action → commit/edit/regenerate/cancel
- Cancel at any point = clean exit (not an error)
- Edit loop: editor → preview edited message → action selector
- Regenerate loop: generate → preview → action selector

**Testing Deliverables:**

- Unit test: happy path (select → generate → approve → commit)
- Unit test: edit path (select → generate → edit → approve)
- Unit test: regenerate path (select → generate → regenerate → approve)
- Unit test: cancel path (select → cancel = clean exit)
- Unit test: precondition failures propagate correctly
- Integration test: full workflow end-to-end (manual)
- Co-located test: `commit-workflow-controller.test.ts`

**FRs Covered:** FR13-14, FR25-32, FR46 (full commit workflow)

---

## Story 5.8: Wire Commit Command to CLI

**As a** developer
**I want** the `ollatool commit` command wired to the workflow controller
**So that** users can invoke the full workflow from the CLI

**Acceptance Criteria:**

- [ ] Commit command handler registered in Commander.js
- [ ] Instantiates adapters and workflow controller (manual DI)
- [ ] Handles top-level errors (show user-friendly messages)
- [ ] Exit codes: 0 (success/cancel), 2 (user error), 3 (system error)
- [ ] `--help` shows commit command usage
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Entry point: `ollatool commit` (no arguments in MVP)
- Manual DI: create Ollama instance, adapters, inject into controller
- Top-level try/catch: map domain errors to exit codes
- User errors: show guidance, exit 2
- System errors: show diagnostic info, exit 3

**Testing Deliverables:**

- Unit test: command invokes workflow controller
- Unit test: error handling maps to exit codes
- Unit test: manual DI wiring correct
- Integration test: `ollatool commit` works end-to-end (manual)
- Manual test: `ollatool commit --help` shows usage

**FRs Covered:** FR46 (ollatool commit command), FR47 (--help flag)

---

## Epic 5 Summary

**Total Stories:** 8
**Estimated Complexity:** High (interactive UI, workflow orchestration, editor integration)
**Dependencies:** Epic 1 (Foundation), Epic 2 (Ollama), Epic 3 (Git), Epic 4 (AI Generation)
**Output:** Working end-to-end commit workflow with type selection, generation, preview, edit, approve

**Completion Criteria:**

- All 8 stories pass acceptance criteria
- `ollatool commit` works end-to-end in real repository
- Type selection, generation, preview, and approval flow seamlessly
- Edit in $EDITOR works correctly
- Regenerate produces new messages
- Commit executes successfully on approval
- Cancel exits cleanly at any point
- Unit tests cover all workflow paths
- Integration test confirms full workflow
