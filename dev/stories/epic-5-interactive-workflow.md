# Epic 5: Interactive Workflow & CLI (Consolidated)

**Goal:** Wire the infrastructure and logic into a cohesive, interactive terminal application.
**User Value:** Users can flow seamlessly from selecting a type to reviewing, editing, and committing the generated message.
**FRs Covered:** FR13, FR14, FR25, FR26, FR28, FR29, FR30, FR31, FR32, FR46, FR47, FR48

---

## Story 5.1: Implement UI Components (Views)

**As a** developer
**I want** a set of standardized UI components
**So that** the user experience is consistent, visually appealing, and matches the design spec

**Acceptance Criteria:**

- [ ] UI Module created: `src/ui/components/`
- [ ] **TypeSelector** implemented:
  - [ ] Uses `@clack/prompts.select`.
  - [ ] Lists all 11 Conventional Commit types with descriptions.
- [ ] **MessagePreview** implemented:
  - [ ] Uses `@clack/prompts.note` or `console.log` with `chalk`.
  - [ ] visualizes the generated subject and body clearly.
- [ ] **ActionSelector** implemented:
  - [ ] Uses `@clack/prompts.select`.
  - [ ] Options: `Approve`, `Edit`, `Regenerate`, `Cancel`.
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Stateless:** These functions should take data (e.g., `types[]`, `messageString`) and return user input. They do not hold app state.
- **Theme:** Ensure consistent indentation and color usage (e.g., green for 'feat', dim for descriptions).

**Testing Deliverables:**

- **Manual Testing:** Run a script that renders these components to verify visual layout.
- **Unit Tests:** Verify `TypeSelector` returns the correct enum value string.

---

## Story 5.2: Implement Commit Controller (Orchestrator)

**As a** developer
**I want** a central controller to manage the application state and flow
**So that** users can navigate between generation, editing, and committing without losing context

**Acceptance Criteria:**

- [ ] Controller created: `src/features/commit/controllers/commit-controller.ts`
- [ ] Injects: `ValidatePreconditions` (UseCase), `GenerateCommit` (UseCase), `GitPort`, `EditorPort`.
- [ ] Implements the **Main Interaction Loop**:
  1. **Preconditions:** Run `ValidatePreconditions`.
  2. **Input:** Show `TypeSelector` (store `selectedType`).
  3. **Generate:** Run `GenerateCommit` (show spinner via `ora`).
  4. **Preview:** Show `MessagePreview`.
  5. **Action Loop:** Show `ActionSelector`.
     - **Approve:** Call `GitPort.commit(message)` -> Exit(0).
     - **Edit:** Call `EditorPort.open(message)` -> Update `message` -> Re-show Preview -> Loop.
     - **Regenerate:** Loop back to Step 3.
     - **Cancel:** Exit(0).
- [ ] Error Handling: Catches `UserError` and `SystemError` from dependencies and displays clean messages via `@clack/prompts.cancel` or `log.error`.
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **State Machine:** The controller maintains the "Current Message." Editing updates this state. Regenerating replaces this state.
- **UX:** Use `ora` spinners during the "Generating..." phase.

**Testing Deliverables:**

- **Co-located Test:** `src/features/commit/controllers/commit-controller.test.ts`
- **Unit Tests:**
  - Mock all dependencies.
  - Test Flow: Type -> Generate -> Approve -> Verify Commit called.
  - Test Flow: Type -> Generate -> Edit -> Approve -> Verify Commit called with _edited_ message.
  - Test Flow: Precondition fails -> Verify Error displayed and Commit NOT called.

---

## Story 5.3: Wiring & CLI Entry

**As a** developer
**I want** to register the command and wire up dependencies
**So that** the application can be executed via the CLI

**Acceptance Criteria:**

- [ ] Entry point updated: `src/main.ts`
- [ ] **Dependency Injection:**
  - Instantiate Adapters (`ShellGitAdapter`, `ShellEditorAdapter`, `OllamaAdapter`).
  - Instantiate Use Cases (`ValidatePreconditions`, `GenerateCommit`).
  - Instantiate Controller (`CommitController`).
- [ ] **Command Registration:**
  - Register `setup` command (Epic 2).
  - Register `commit` command -> triggers `commitController.execute()`.
- [ ] **Global Error Handler:** Ensure unhandled rejections are caught and logged to debug file (Epic 1 infrastructure).
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Manual DI:** No container library. Just `new Class(dependency)`.
- **Top-Level Try/Catch:** `main.ts` should catch any final bubbling errors to ensure the process exits with the correct code (1, 2, or 3) rather than a stack trace dump (unless DEBUG is on).

**Testing Deliverables:**

- **Manual Integration Test:** Run `npm start commit` (or `ollatool commit`) in a real git repo.
- **Verify:** The full flow works end-to-end.

---

## Implementation & Validation Guidelines

**🚨 CRITICAL: READ BEFORE CODING**

### 1. Context7 MCP Integration (Enterprise Validation)

Before implementing any new library or framework logic, you **MUST** validate patterns using the Context7 MCP server.

- **Resolve Library:** `mcp__context7__resolve-library-id(library_name)`
- **Get Best Practices:** `mcp__context7__get-library-docs(library_id)`
- _Applicable Libraries for this Epic:_ `execa`, `vitest`, `@clack/prompts`, `commander` (as relevant).

### 2. Mandatory Style Guides

All code must strictly adhere to the project's established standards. **Review these before writing a single line of code.**

- **Coding Standards:** `dev/styleguides/clean-code.md` (Focus: Function size <15 lines, meaningful variable names).
- **Testing Standards:** `dev/styleguides/unit-test-patterns.md` (Focus: Co-located tests, Vitest mocking patterns).

### 3. Iterative Development Workflow (The Loop)

Do not write all code at once. Follow this cycle for **every single story**:

1.  **Red:** Write the unit test first (it should fail).
2.  **Green:** Write the minimal code to pass the test.
3.  **Refactor:** Clean up the code while keeping tests green.
4.  **Sanitize:** Run `npm run format` and `npm run lint` immediately. **Fix lint errors now, not later.**
5.  **Commit:** Commit the working state before moving to the next AC.

### 4. Dynamic Test Adjustment

- If implementation details change during development, **update the tests immediately**.
- Never comment out a failing test to "fix it later."
- If a test is brittle (e.g., visual CLI output), refactor the logic to return data instead of side effects, then test the data.

### 5. Final Quality Gate

Before marking any Story or Epic as **Complete**, you must run the full validation suite.

- **Command:** `npm run pr`
- **Requirement:** All checks (Lint, Format, Types, Tests, Build) must pass with **zero warnings**.
- **Output:** Paste the success output in the completion report.

## Epic 5 Summary

**Total Stories:** 3
**Estimated Complexity:** High (Orchestration logic)
**Dependencies:** Epic 3 (Git/Editor), Epic 4 (Generation)
**Output:** The fully functional `ollatool commit` command.

**Completion Criteria:**

- User can run `ollatool commit`, select a type, wait for AI generation, and approve the commit.
- User can edit the generated message in `nano`/`vim` and have the changes preserved.
- Application handles all defined error states gracefully.

## Extra

I also did extra architecture rework and add --all and renamed from ollatool to devai-cli
