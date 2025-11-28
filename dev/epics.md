# ollatool - Epics and Stories

**Project:** Ollama-CLI-application (ollatool)
**Author:** John (PM Agent)
**Date:** 2025-11-28
**Version:** 1.0
**Status:** In Progress

---

## Document Purpose

This document breaks down the PRD's 49 functional requirements into implementable epics and bite-sized user stories. Each epic delivers user value, and each story is sized for completion by a single dev agent in one focused session.

**Context Sources:**

- ✅ PRD (49 functional requirements)
- ✅ Architecture (technical decisions and implementation patterns)
- ✅ UX Design (terminal interaction patterns and visual feedback)

---

## Functional Requirements Inventory

The following requirements are extracted from the PRDand must ALL be covered by the epic/story breakdown:

### Git Integration & Context Gathering

- **FR1:** Detect whether files are staged in git staging area
- **FR2:** Read complete diff of staged changes (`git diff --cached`)
- **FR3:** Read status of all files (`git status --short`)
- **FR4:** Identify file paths and extensions to inform commit classification
- **FR5:** Execute git commit commands with user-approved messages
- **FR6:** Operate only within git repositories, fail gracefully outside one

### Ollama & Model Lifecycle Management

- **FR7:** Detect whether Ollama daemon is running at configured endpoint
- **FR8:** Check if required model (hard-coded for MVP) is present
- **FR9:** Automatically download (pull) required model if not present, with progress
- **FR10:** Send inference requests to Ollama with custom prompts, receive streaming responses
- **FR11:** Detect when diff exceeds model context window, exit with error suggesting fewer files
- **FR12:** Detect and report Ollama connection failures with actionable error messages

### Commit Type & Classification

- **FR13:** Present users with list of valid Conventional Commit types
- **FR14:** Users can select commit type via numbered selection or arrow-key navigation
- **FR15:** Inject user-selected commit type into prompt to guide model generation
- **FR16:** Validate generated messages using structural regex (^\\w+: .+)
- **FR17:** If validation fails, silently retry generation (up to max retries) without exposing failures

### Commit Message Generation

- **FR18:** Construct prompts using few-shot examples for Conventional Commits format
- **FR19:** Send diff context, file status, and commit type to model for generation
- **FR20:** Provide visual feedback during generation (spinner or token streaming)
- **FR21:** Generate messages with three components: type, description, body
- **FR22:** Generated descriptions follow imperative mood ("add" not "added")
- **FR23:** Generated descriptions are concise (target: ≤50 characters for subject)
- **FR24:** Ensure final message contains no conversational filler via prompt engineering

### Interactive User Workflow

- **FR25:** Display generated commit messages for user review before committing
- **FR26:** Users can approve generated messages to proceed with git commit
- **FR27:** Users can edit messages by opening configured CLI editor ($EDITOR)
- **FR28:** Users can regenerate messages if unsatisfied with initial output
- **FR29:** Users can cancel commit operation at any point without side effects
- **FR30:** Display clear action prompts with keyboard shortcuts ([A]pprove, [E]dit, [R]egenerate, [C]ancel)
- **FR31:** When users edit messages, capture edited content and use for commit
- **FR32:** Confirm successful commits with summary of committed message

### Error Handling & Edge Cases

- **FR33:** When no staged changes exist, exit with error explaining how to stage files
- **FR34:** When Ollama not running, exit with instructions to start or install
- **FR35:** When required model unavailable, offer to download automatically
- **FR36:** When git commands fail (e.g., not a git repo), display git's error and exit
- **FR37:** When model inference fails or times out, report error and allow retry
- **FR38:** Distinguish between user errors (exit 1-2), system errors (exit 3), bugs (exit 4+)
- **FR39:** All error messages include actionable remediation steps

### Performance & Resource Management

- **FR40:** Complete full workflow in under 1 second on M1/M2 hardware
- **FR41:** Provide immediate visual feedback (spinner/progress) when waiting for Ollama
- **FR42:** Respect system resources using quantized models with <2GB memory footprint
- **FR43:** Operate while other dev tools running without causing memory pressure

### Configuration & Extensibility

- **FR44:** Use sensible defaults that work without configuration (zero-config)
- **FR45:** Respect `OLLAMA_HOST` environment variable for custom endpoints
- **FR46:** Respect `$EDITOR` environment variable (Nano/Vim/Emacs) with Nano fallback
- **FR47:** Provide `--help` flag for usage information
- **FR48:** Provide `--version` flag for version number
- **FR49:** Architecture supports adding new commands (pr, screenshot) without breaking existing functionality

---

## Testing Requirements

**CRITICAL RULES FOR ALL EPICS:**

1. **Unit Tests Are Mandatory:** Every epic that produces implementation code must include co-located unit tests (`.test.ts` files adjacent to implementation files)
2. **Test-First Development:** Tests should be written as implementation proceeds, not as an afterthought
3. **Bug Discovery Protocol:** If unit tests reveal bugs or architectural issues in the implementation:
   - ✅ **ALLOWED:** Agent documents the issue clearly
   - ✅ **ALLOWED:** Agent reports findings to user with recommendations
   - ❌ **FORBIDDEN:** Agent auto-fixes implementation without user approval
   - **Rationale:** Prevents silent architectural violations and ensures user oversight of design changes
4. **Coverage Target:** Aim for ≥80% coverage of core logic (git integration, prompt construction, validation)
5. **Test Patterns:** Follow co-located test pattern per architecture (commit-controller.test.ts next to commit-controller.ts)

---

## Proposed Epic Structure

### Epic 1: Foundation & Project Setup

**Goal:** Establish development infrastructure and CLI framework
**User Value:** Creates working project foundation that enables all subsequent features

**FRs Covered:** FR49 (extensible architecture)

**Testing Deliverables:** Project scaffolding tests (build, lint, basic imports)

**Rationale:** Greenfield project needs foundation epic. This is the acceptable exception to "user value" rule - it creates the scaffolding for everything else. Without this, no other epics can be implemented.

**Repo Structure Expectation:** Development workflow uses release prep branch approach - all dev artifacts preserved in main development branches, clean published versions via release branch pruning (see dev/release-process.md)

---

### Epic 2: Ollama Integration & Model Management

**Goal:** Enable reliable connection to Ollama and model lifecycle management
**User Value:** Users can successfully setup the tool and verify Ollama connectivity before attempting commits

**FRs Covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR45

**Testing Deliverables:** Unit tests for OllamaAdapter (mocked HTTP calls), model provisioning logic, connection validation

**Rationale:** Users need Ollama working before they can generate commits. This epic delivers the `ollatool setup` command and all Ollama health checks - enabling users to verify their environment is ready.

---

### Epic 3: Git Context Gathering & Validation

**Goal:** Enable tool to read git state and validate preconditions
**User Value:** Users get immediate, clear feedback about their git state (staged changes, repository status) before expensive operations

**FRs Covered:** FR1, FR2, FR3, FR4, FR6, FR33, FR36

**Testing Deliverables:** Unit tests for ShellGitAdapter (mocked execa calls), precondition validation logic, error handling

**Rationale:** Users need to know WHY the tool can't proceed (no staged changes, not in git repo). This epic delivers all git integration and early validation - preventing wasted time.

---

### Epic 4: AI-Powered Message Generation

**Goal:** Generate high-quality Conventional Commits messages using Ollama
**User Value:** Users receive AI-generated commit messages that follow Conventional Commits format and accurately describe their changes

**FRs Covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR37

**Testing Deliverables:** Unit tests for prompt builder, format validator, retry logic, type enforcement, normalization

**Rationale:** This epic makes the tool "smart" - users get well-formed, contextual commit messages instead of writing them manually. The AI becomes their commit message assistant. **DEPENDENCY:** Must come before Epic 5 (Interactive Workflow) since workflow orchestrates this capability.

---

### Epic 5: Interactive Commit Workflow

**Goal:** Enable users to review, edit, and approve AI-generated commit messages
**User Value:** Users can complete full commit workflow from type selection through approval/edit/regenerate

**FRs Covered:** FR13, FR14, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR46, FR47, FR48

**Testing Deliverables:** Unit tests for type selector, editor integration, confirmation prompts, commit orchestration

**Rationale:** This is the CORE user journey - the "happy path" workflow. Users can now actually SELECT a commit type, SEE a generated message (from Epic 4), EDIT it if needed, and APPROVE to complete the commit. This is where the tool creates tangible value. **DEPENDENCY:** Requires Epic 4 (AI Generation) to be complete.

---

### Epic 6: Performance & Error Handling

**Goal:** Ensure sub-1s performance and graceful error recovery
**User Value:** Users experience lightning-fast responses and receive actionable guidance when things go wrong

**FRs Covered:** FR34, FR35, FR38, FR39, FR40, FR41, FR42, FR43, FR44

**Testing Deliverables:** Performance benchmarks, error class tests, spinner/progress feedback tests, resource usage validation

**Rationale:** This epic polishes the experience - users never wait longer than 1 second, never see cryptic errors, and always know how to fix problems. The tool "just works" and feels professional.

---

## FR Coverage Map

This matrix ensures EVERY functional requirement is covered by at least one epic:

**Epic 1 (Foundation):** FR49
**Epic 2 (Ollama Integration):** FR7, FR8, FR9, FR10, FR11, FR12, FR45
**Epic 3 (Git Context):** FR1, FR2, FR3, FR4, FR6, FR33, FR36
**Epic 4 (AI Generation):** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR37
**Epic 5 (Interactive Workflow):** FR13, FR14, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR46, FR47, FR48
**Epic 6 (Performance & Errors):** FR34, FR35, FR38, FR39, FR40, FR41, FR42, FR43, FR44

**Verification:** All 49 FRs accounted for ✓

**Epic Dependency Chain:**

1. Foundation (enables everything)
2. Ollama Integration (required for AI generation)
3. Git Context (required for AI generation input)
4. AI Generation (required for interactive workflow)
5. Interactive Workflow (orchestrates 2, 3, 4)
6. Performance & Errors (polishes all epics)

---

## Story Files

Detailed story breakdowns for each epic are available in the following files:

- **Epic 1:** [dev/stories/epic-1-foundation.md](./stories/epic-1-foundation.md) - 6 stories
- **Epic 2:** [dev/stories/epic-2-ollama-integration.md](./stories/epic-2-ollama-integration.md) - 6 stories
- **Epic 3:** [dev/stories/epic-3-git-context.md](./stories/epic-3-git-context.md) - 7 stories
- **Epic 4:** [dev/stories/epic-4-ai-generation.md](./stories/epic-4-ai-generation.md) - 7 stories
- **Epic 5:** [dev/stories/epic-5-interactive-workflow.md](./stories/epic-5-interactive-workflow.md) - 8 stories
- **Epic 6:** [dev/stories/epic-6-performance-errors.md](./stories/epic-6-performance-errors.md) - 8 stories

**Total Stories:** 42 user stories covering all 49 functional requirements

---
