Here is the updated `epics.md` file. I have consolidated Epics 3, 4, and 5 as discussed and added the **Projected File Structure** section at the bottom to visualize the end state.

````markdown
# ollatool - Epics and Stories

**Project:** Ollama-CLI-application (ollatool)
**Author:** John (PM Agent)
**Date:** 2025-11-28
**Version:** 2.0 (Consolidated)
**Status:** In Progress

---

## Document Purpose

This document breaks down the PRD's 49 functional requirements into implementable epics and bite-sized user stories.

**Context Sources:**

- ✅ PRD (49 functional requirements)
- ✅ Architecture (technical decisions and implementation patterns)
- ✅ UX Design (terminal interaction patterns and visual feedback)

---

## Functional Requirements Inventory

_Refer to PRD for full text of FR1-FR49._

---

## Testing Requirements

**CRITICAL RULES FOR ALL EPICS:**

1. **Unit Tests Are Mandatory:** Every epic that produces implementation code must include co-located unit tests.
2. **Test-First Development:** Tests should be written as implementation proceeds.
3. **Coverage Target:** Aim for ≥80% coverage of core logic.

---

## Epic Structure

### Epic 0: Test Infrastructure & CI Setup (✅ Complete)

**Goal:** Establish test infrastructure and CI pipeline structure.
**Status:** Done.

### Epic 1: Foundation & Project Setup (✅ Complete)

**Goal:** Establish development infrastructure, CLI framework, and error types.
**Status:** Done.

### Epic 2: Ollama Integration & Model Management (✅ Complete)

**Goal:** Enable reliable connection to Ollama and model lifecycle management.
**Status:** Done.

---

### Epic 3: Git & Editor Infrastructure (Consolidated)

**Goal:** Establish the infrastructure for interacting with Git and the System Editor.
**User Value:** Users get immediate validation of their environment and can use their preferred editor.
**Stories:** 3 (Consolidated from 7)

- **Story 3.1: Git Infrastructure (Port & Adapter)**
  - Define `GitService` port and implement `ShellGitAdapter` using `execa`.
  - Capabilities: `isGitRepo`, `stagedDiff`, `branchName`, `commit`.
- **Story 3.2: Validate Preconditions (Use Case)**
  - Implement `ValidatePreconditions` use case.
  - Orchestrates checks: Daemon running -> Git Repo exists -> Staged Changes exist.
  - Fail fast with specific `UserError` or `SystemError`.
- **Story 3.3: Editor Infrastructure (Adapter)**
  - Define `EditorService` port and implement `ShellEditorAdapter`.
  - Handles opening `$EDITOR` with a temporary file and reading back the result.

### Epic 4: AI Generation Logic (Consolidated)

**Goal:** Encapsulate all pure logic and orchestration for generating commits.
**User Value:** High-quality, compliant commit messages generated automatically.
**Stories:** 2 (Consolidated from 7)

- **Story 4.1: Message Processing Utilities**
  - Implement pure logic helpers: `PromptBuilder`, `FormatValidator` (Regex), `TypeEnforcer` (Overwrite logic), and `MessageNormalizer`.
- **Story 4.2: Generate Commit Strategy (Use Case)**
  - Implement `GenerateCommit` use case.
  - Orchestrates the generation loop: LLM Call -> Validate -> Silent Retry (x3) -> Enforce Type -> Normalize.

### Epic 5: Interactive Workflow & CLI (Consolidated)

**Goal:** Wire everything together into a usable CLI command with a rich UI.
**User Value:** A seamless, interactive terminal experience for generating commits.
**Stories:** 3 (Consolidated from 8)

- **Story 5.1: UI Components (Views)**
  - Implement stateless UI components using `@clack/prompts`: `TypeSelector`, `MessagePreview`, `ActionSelector`.
- **Story 5.2: Commit Controller (Orchestrator)**
  - Implement `CommitController` to manage the interaction loop (Validate -> Select -> Generate -> Preview -> Action -> Commit/Edit).
- **Story 5.3: Wiring & CLI Entry**
  - Register `ollatool commit` in `main.ts`.
  - Perform manual Dependency Injection to wire Adapters -> Use Cases -> Controller.

---

### Epic 6: Performance & Error Handling

**Goal:** Ensure sub-1s performance and graceful error recovery (Polish).
**User Value:** Users experience lightning-fast responses and receive actionable guidance.
**Status:** Planned.

### Epic 7: Model Validation & Manual Acceptance Testing

**Goal:** Validate model selection and commit message quality across 50+ realistic scenarios.
**User Value:** Ensure selected model meets MVP success criteria.
**Status:** Planned.

---

## Projected File Structure (Post-Epic 5)

This tree represents the expected state of `src/` after Epic 5 is complete, adhering to the Pragmatic Hexagonal Architecture.

```txt
src
├── main.ts                         # CLI Entry & Dependency Injection
├── index.ts
├── core
│   ├── ports
│   │   ├── git-port.ts             # Interface for Git operations
│   │   ├── editor-port.ts          # Interface for System Editor
│   │   ├── llm-port.ts             # (Existing)
│   │   └── setup-ui-port.ts        # (Existing)
│   └── types
│       ├── errors.types.ts         # (Existing) UserError, SystemError, etc.
│       └── ...
├── infrastructure
│   ├── adapters
│   │   ├── shell-git-adapter.ts    # Implements GitPort via execa
│   │   ├── shell-editor-adapter.ts # Implements EditorPort via spawn
│   │   └── ollama-adapter.ts       # (Existing)
│   └── ...
├── features
│   └── commit
│       ├── controllers
│       │   └── commit-controller.ts    # Main workflow loop
│       ├── use-cases
│       │   ├── validate-preconditions.ts # Git/Daemon checks
│       │   └── generate-commit.ts      # LLM generation & retry loop
│       └── utils
│           ├── prompt-builder.ts       # Pure function
│           ├── format-validator.ts     # Pure function (Regex)
│           ├── type-enforcer.ts        # Pure function
│           └── message-normalizer.ts   # Pure function
└── ui
    └── components
        ├── type-selector.ts        # @clack/prompts component
        ├── message-preview.ts      # UI component
        └── action-selector.ts      # UI component
```
````

```

```

**Epic Dependency Chain:**

0. Test Infrastructure & CI Setup (enables TDD for all epics)
1. Foundation (enables everything)
2. Ollama Integration (required for AI generation)
3. Git Context (required for AI generation input)
4. AI Generation (required for interactive workflow)
5. Interactive Workflow (orchestrates 2, 3, 4)
6. Performance & Errors (polishes all epics)
7. Model Validation & Testing (validates everything, requires Epic 5 complete)

---

## Story Files

Detailed story breakdowns for each epic are available in the following files:

- **Epic 0:** [dev/stories/epic-0-test-infrastructure.md](./stories/epic-0-test-infrastructure.md) - 4 stories
- **Epic 1:** [dev/stories/epic-1-foundation.md](./stories/epic-1-foundation.md) - 6 stories
- **Epic 2:** [dev/stories/epic-2-ollama-integration.md](./stories/epic-2-ollama-integration.md) - 6 stories
- **Epic 3:** [dev/stories/epic-3-git-context.md](./stories/epic-3-git-context.md) - 7 stories
- **Epic 4:** [dev/stories/epic-4-ai-generation.md](./stories/epic-4-ai-generation.md) - 7 stories
- **Epic 5:** [dev/stories/epic-5-interactive-workflow.md](./stories/epic-5-interactive-workflow.md) - 8 stories
- **Epic 6:** [dev/stories/epic-6-performance-errors.md](./stories/epic-6-performance-errors.md) - 8 stories
- **Epic 7:** [dev/stories/epic-7-manual-acceptance-testing.md](./stories/epic-7-manual-acceptance-testing.md) - 5 stories

**Total Stories:** 47 user stories covering all 49 functional requirements + comprehensive testing and validation

---
