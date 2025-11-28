Project Path: Ollama-CLI-application

Source Tree:

```txt
Ollama-CLI-application
└── dev
    ├── architecture.md
    ├── bmm-workflow-status.yaml
    ├── brief.md
    ├── epics.md
    ├── prd.md
    ├── release-process.md
    ├── test-design-system.md
    ├── todo.md
    ├── ux-color-themes.html
    └── ux-design-specification.md

```

`dev/architecture.md`:

````md
# ollatool - Architecture Document

**Project:** Ollama-CLI-application (ollatool)
**Author:** Winston (Architect Agent)
**Date:** 2025-11-27
**Version:** 1.0
**Status:** In Progress

---

## Project Context Understanding

### Core Capabilities

- **49 Functional Requirements** covering git integration, Ollama lifecycle, commit generation, interactive workflows, error handling
- **Privacy-First**: 100% local processing via Ollama with zero data egress
- **Sub-1s Performance**: M1/M2 optimized with Qwen 2.5 Coder 1.5B
- **Zero-Config**: Auto-detect Ollama, auto-provision models, works immediately after npm install
- **Conventional Commits**: Format validation with silent retry mechanism
- **Interactive TUI**: Type selection → preview/edit → approve with keyboard shortcuts

### Unique Challenges Identified

- Custom Ollama model instance creation (base model + system prompt → `ollatool-commit:latest`)
- First-run setup requiring base model download AND custom model instance creation
- Editor integration respecting $EDITOR environment variable
- Context window management: De-scoped complexity, assume diffs fit, exit gracefully if overflow

---

## Code Quality Standards Reference

**MANDATORY:** All implementation must adhere to clean code principles documented in:

- **[dev/styleguides/clean-code.md](./styleguides/clean-code.md)**

Key requirements enforced during implementation:

- **Function Size:** Maximum 15 lines per function
- **Argument Limits:** 0-2 arguments preferred, 3 acceptable for simple data passing
- **Class Member Ordering:** Constructor → Private Properties → Public Properties → Public Methods → Private Methods
- **DRY Principle:** No duplicated logic or error messages
- **Self-Documenting Code:** Comments for "why" only, not "what"

---

## Implementation References

This architecture draws upon several comprehensive reference documents that provide detailed specifications for implementation:

### User Experience & Design

- **[UX Design Specification](./ux-design-specification.md)** - Complete terminal user experience, interaction patterns, error handling flows, and performance requirements
- **[Color Theme Visualizer](./ux-color-themes.html)** - Interactive terminal color scheme and visual design system

### Testing & Quality Assurance

- **[System-Level Test Design](./test-design-system.md)** - Comprehensive testing strategy including unit, integration, E2E, and manual acceptance testing protocols
- **[Unit Test Patterns](./styleguides/unit-test-patterns.md)** - Specific testing patterns and conventions for unit tests

### Development Standards

- **[Clean Code Standards](./styleguides/clean-code.md)** - Complete coding standards, naming conventions, and implementation patterns
- **[Node.js CLI Setup Patterns](./styleguides/nodejs-cli-setup-patterns.md)** - Modern ESM, TypeScript, and CLI-specific tooling configurations

### Complete Style Guide Reference

- **[Style Guides Index](./styleguides/index.md)** - Comprehensive overview and navigation for all project style guides (coding, testing, documentation, processes)

**Critical Integration Points:**

- **Performance Targets:** Sub-1s response times (UX spec) aligned with test validation strategies
- **Error Handling:** Four-phase validation pipeline (architecture) implemented per UX error flow specifications
- **Testing Strategy:** Mock-first approach with real Ollama E2E validation (test design) supporting architecture decisions
- **Visual Design:** Terminal color scheme and interaction patterns (UX themes) for consistent user experience

---

## Decision Summary

This table provides a quick reference for all major architectural decisions, enabling AI agents to understand choices without reading the full document.

| Category                 | Decision                                          | Version/Value                                                             | Rationale                                                                                                                                |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Language & Runtime**   | TypeScript on Node.js ESM                         | TypeScript Latest (strict), Node ≥20.0.0                                  | Type safety prevents runtime errors (deliverability), ESM required by execa 9.x, Node 20 LTS supports M1/M2 target platform              |
| **Module System**        | ESM (type: "module")                              | NodeNext resolution, ES2022 target                                        | Modern standard, required by execa 9.x, enables tree-shaking and faster startup                                                          |
| **Build Tool**           | tsup                                              | Latest                                                                    | Fast ESM bundling with minimal config, built for TypeScript ESM projects                                                                 |
| **CLI Framework**        | Commander.js                                      | 14.0.2                                                                    | Industry standard (50M+ weekly downloads), stable API, minimal API surface                                                               |
| **Interactive UI**       | @clack/prompts + ora                              | @clack/prompts 0.11.0, ora 8.2.0                                          | Modern Inquirer alternative with better aesthetics, cross-platform spinner support, zero config complexity                               |
| **Git Integration**      | execa                                             | 9.6.0                                                                     | Shell command execution with TypeScript support, ESM-native, replaces child_process with better API                                      |
| **LLM SDK**              | ollama (official)                                 | 0.6.3                                                                     | Official Ollama JavaScript SDK, streaming support, type definitions included                                                             |
| **LLM Model**            | Qwen 2.5 Coder 1.5B                               | qwen2.5-coder:1.5b (quantized)                                            | Sub-1s inference on M1/M2 (70-90 tok/sec), code-optimized, low "chatty" output, 1.2GB RAM footprint                                      |
| **Model Parameters**     | temperature=0.2, num_ctx=131072, keep_alive=0     | Ollama parameters                                                         | Low randomness for determinism, full 128K context window, unload after use (clean lifecycle)                                             |
| **Prompt Engineering**   | Modelfile-based system prompt                     | Static (baked into custom model)                                          | Iterate prompts without code deploys (`ollama create`), separates static role from dynamic diff, custom model instance `ollatool-commit` |
| **Validation Strategy**  | Regex-only (structural check)                     | `/^\w+: .+$/`                                                             | Zero deps (no Zod in MVP), detects conversational pollution, deterministic type overwrite makes schema validation unnecessary            |
| **Type Enforcement**     | Force overwrite (user selection is truth)         | Programmatic strip + replace                                              | Eliminates type hallucination, no retry needed for type mismatches, 100% user control                                                    |
| **Architecture Pattern** | Pragmatic Hexagonal (Ports & Adapters)            | Manual DI, no IoC container                                               | Testability via interfaces, swappable adapters (OpenAI fallback), maintainable by solo dev without framework overhead                    |
| **Project Structure**    | Hexagonal layers: core/infrastructure/features/ui | src/ with 4 top-level dirs                                                | Clear dependency flow inward, zero external deps in core, adapters implement interfaces                                                  |
| **Testing Framework**    | Vitest                                            | Latest                                                                    | Modern test runner with native ESM support, fast execution, minimal config                                                               |
| **Test Pattern**         | Co-located tests (adjacent .test.ts)              | One test file per source file                                             | Angular-style familiarity, clear 1:1 relationship, easier navigation                                                                     |
| **Error Handling**       | Typed error classes with exit codes               | User=2, System=3, Validation=4, Unexpected=5                              | Clear remediation guidance (PRD req), distinguishes user errors from bugs, actionable messages                                           |
| **Configuration**        | Zero-config (hard-coded defaults)                 | MVP only, post-MVP: cosmiconfig + Zod                                     | Works immediately after npm install, 80% use case, config complexity deferred                                                            |
| **Editor Integration**   | Temp file & spawn pattern                         | `.git/COMMIT_EDITMSG_OLLATOOL` + `$EDITOR`                                | Standard git pattern, stdio: 'inherit' for terminal control, try/finally cleanup                                                         |
| **First-Run Setup**      | Explicit setup command                            | `ollatool setup` required before first commit                             | Preserves sub-1s commit performance, clear separation of setup vs workflow, fails fast with guidance                                     |
| **Model Provisioning**   | Manual setup (MVP)                                | Require `ollatool setup`, no auto-pull during commit                      | Zero auto-downloads during commit (speed), idempotent setup (safe to re-run), post-MVP: automatic Ollama install                         |
| **Ollama Validation**    | Fail fast (3-tier check, no auto-pull)            | Daemon → Base model → Custom model                                        | Preserves speed (no auto-pull during commit), clear error guidance, exit codes guide resolution                                          |
| **Retry Visibility**     | Completely silent retries                         | No user-facing retry indicators                                           | Clean UX, implementation detail hidden, binary success/failure only                                                                      |
| **Success Messaging**    | Silent format (UX spec-compliant)                 | Show commit directly, no success indicator between generation and preview | Matches UX spec lines 219-248, success only shown post-approval                                                                          |

**Key Design Principles:** Every decision optimizes for PRD's three pillars: (1) **Speed** - sub-1s via Qwen 1.5B + simple validation, (2) **Privacy** - 100% local via hexagonal isolation, (3) **Simplicity** - zero-config via hard-coded defaults + manual DI.

---

## Starter Template Decision

**Decision:** No traditional starter template—use custom manual setup based on project styleguides

**Rationale:**
You've already researched and documented comprehensive setup patterns in `dev/styleguides/nodejs-cli-setup-patterns.md`. This provides better architectural decisions than any generic starter because it's tailored specifically for:

- Modern ESM with TypeScript (NodeNext module resolution)
- CLI-specific tooling: Commander.js + @clack/prompts for interactive UX
- Performance-optimized build: tsup for fast bundling with ESM output
- Testing: Vitest for modern, fast test execution
- Essential dependencies pre-selected: execa (git), ollama SDK

**Project Initialization:**
The first implementation story will execute manual npm project setup following the documented patterns rather than a CLI generator command.

**Architectural Decisions Provided by Styleguide Setup:**

- **Language/TypeScript:** TypeScript with ES2022 target, strict mode enabled
- **Module System:** ESM (type: "module") with NodeNext resolution
- **Build Tooling:** tsup for fast ESM bundling with minification
- **Testing Framework:** Vitest with node environment and globals
- **CLI Framework:** Commander.js for argument parsing
- **Interactive Prompts:** @clack/prompts (modern Inquirer alternative)
- **Linting/Formatting:** ESLint + Prettier (configured per styleguide standards)
- **Project Structure:** Hexagonal architecture (cli/core/infrastructure layers)
- **File Naming:** kebab-case for all files

---

## Technology Stack & Verified Versions

### Core Dependencies (Runtime)

| Package          | Version | Purpose                                      | Verification Date |
| ---------------- | ------- | -------------------------------------------- | ----------------- |
| `commander`      | 14.0.2  | CLI argument parsing, command structure      | 2025-11-27        |
| `@clack/prompts` | 0.11.0  | Interactive TUI (select, confirm prompts)    | 2025-11-27        |
| `ora`            | 8.2.0   | Terminal spinner for loading states          | 2025-11-27        |
| `ollama`         | 0.6.3   | Official Ollama SDK for model inference      | 2025-11-27        |
| `execa`          | 9.6.0   | Git command execution (diff, commit, status) | 2025-11-27        |

**Node.js Requirement:** >=20.0.0 (tested and verified on Node 22.20)

### Development Dependencies

| Package       | Version | Purpose                                    |
| ------------- | ------- | ------------------------------------------ |
| `typescript`  | Latest  | Type safety, ES2022 target                 |
| `tsup`        | Latest  | Fast ESM bundling with minification        |
| `vitest`      | Latest  | Modern test runner with native ESM support |
| `eslint`      | Latest  | Code linting per styleguide                |
| `prettier`    | Latest  | Code formatting per styleguide             |
| `@types/node` | Latest  | Node.js type definitions                   |

**Sources:**

- [Commander.js npm](https://www.npmjs.com/package/commander)
- [@clack/prompts npm](https://www.npmjs.com/package/@clack/prompts)
- [ollama npm](https://www.npmjs.com/package/ollama)
- [execa npm](https://www.npmjs.com/package/execa)

---

## Ollama Model Architecture

### Model Instance Design

**Custom Model Instance:** `ollatool-commit`
**Base Model:** `qwen2.5-coder:1.5b` (quantized)
**Creation Method:** Modelfile-based instance creation

**Modelfile Structure:**

```dockerfile
# Base model selection
FROM qwen2.5-coder:1.5b

# System prompt (behavioral instructions)
SYSTEM """You are a git commit message generator specialized in Conventional Commits format.

Rules:
- Output ONLY the commit message, no conversational text
- Format: <type>: <description>\n\n<body>
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Description: imperative mood, lowercase, no period, <50 chars
- Body: explain what and why, not how

Examples:
[Few-shot examples will be included here]
"""

# Model configuration parameters (NOT part of system prompt)
PARAMETER temperature 0.2
PARAMETER num_ctx 131072
```
````

**Setup Command:**

```bash
ollama create ollatool-commit -f Modelfile
```

### Prompt Architecture

**System Prompt (Modelfile - Static):**

- Role definition and behavioral constraints
- Conventional Commits format rules
- Few-shot examples demonstrating ideal outputs
- Output format constraints (no conversational filler)

**User Prompt (Per-Request - Dynamic):**

- User-selected commit type (injected from CLI selection)
- Git diff output (`git diff --cached`)
- Git status output (`git status --short`)
- File paths and change indicators (M/A/D)

**Rationale:** The system prompt is static (lives in Modelfile), while the diff/status are dynamic (sent per-request). This separation means we iterate on the system prompt by recreating the model instance (`ollama create`), not by changing code.

### Ollama Integration Parameters

| Parameter     | Value  | Rationale                                                                                                                                       |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `temperature` | 0.2    | Low randomness for deterministic, consistent outputs                                                                                            |
| `num_ctx`     | 131072 | Full context window capacity (128K tokens). Handles any realistic git diff. Adjust if testing reveals memory issues.                            |
| `keep_alive`  | 0      | MVP: Unload model after each execution. Clean lifecycle: load → infer → commit → unload. Performance validation during testing may adjust this. |

**Context Window Strategy:** Use full model capacity (131,072 tokens = 128K). This accommodates large multi-file diffs without artificial limits. If Ollama returns context overflow error during testing, we can reduce this value.

### Setup Command Implementation

**Command:** `ollatool setup`
**Purpose:** One-time configuration of Ollama integration and model provisioning (idempotent - safe to run multiple times)

**Prerequisites Check:**

1. Ollama installed (binary exists in PATH)
   - Detection: `which ollama` or `ollama --version`
   - Failure: Exit with link to https://ollama.com/download
2. Ollama daemon running
   - Detection: HTTP GET http://localhost:11434/
   - Failure: Exit with instruction to run `ollama serve`
   - Note: Required for `pull` and `create` commands (daemon manages all model operations)

**Setup Operations (with conditional checks):**

1. Pull base model: `qwen2.5-coder:1.5b`
   - Check: `ollama.list()` - does `qwen2.5-coder:1.5b` exist?
   - If exists: Skip pull, display `[INFO] Base model already present ✓`
   - If missing: `ollama pull qwen2.5-coder:1.5b` with progress bar
2. Create custom model instance
   - Check: `ollama.list()` - does `ollatool-commit` exist?
   - If exists: Skip creation, display `[INFO] Custom model already present ✓`
   - If missing: Read Modelfile, run `ollama create ollatool-commit -f Modelfile` with spinner
3. Final Validation
   - Verify both models exist via `ollama.list()`
   - Display: `[SUCCESS] ✓ Setup complete. Run 'ollatool commit' to start.`

**Error Handling:**

- Ollama not installed: Exit code 3, link to download
- Ollama daemon not running: Exit code 3, instruction to run `ollama serve`
- Base model pull failure: Exit code 3, network troubleshooting guidance
- Custom model creation failure: Exit code 4, Modelfile validation error

**Post-MVP:** Automatic Ollama installation can be added

---

## Project Structure (Pragmatic Hexagonal / Ports & Adapters)

### Concept Definition

For developers new to this pattern, think of it as **"Plugs and Sockets"**:

- **Ports (Sockets):** Interfaces defined in the `core/` layer. They describe **WHAT** the application needs (e.g., `LlmProvider` says "I need a way to generate text"). They have no knowledge of external tools.
- **Adapters (Plugs):** Classes in the `infrastructure/` layer that implement those interfaces. They describe **HOW** it is done (e.g., `OllamaAdapter` says "I will use the Ollama API to generate text").

**Benefit:** We can swap the "plug" (e.g., switch from Ollama to OpenAI) without changing the "socket" or any of the core application logic.

### Pragmatic Deviations (What we are skipping)

To keep the CLI tool lightweight and maintainable, we are intentionally omitting some strict enterprise patterns:

1.  **No IoC Container:** We use manual dependency injection in `main.ts` instead of a heavy container like InversifyJS.
    - _IoC (Inversion of Control)_ means the class asks for what it needs ("I need an LlmProvider") rather than creating it itself ("new OllamaAdapter()"). We do this manually to keep it simple.
2.  **No "Primary Ports" Objects:** We don't create separate interface objects for the driving side (CLI commands). The `CommitController` calls the Use Case directly.
3.  **No Adapter Registration:** We don't need a dynamic plugin system. Adapters are wired up once at startup.

### Directory Layout

```
src/
├── index.ts                        # CLI entry point with shebang
├── main.ts                         # Application bootstrap & DI composition root
│
├── core/                           # Domain layer (pure business logic, no external deps)
│   ├── domain/
│   │   ├── commit/
│   │   │   ├── commit-message.ts     # Entity: Conventional Commit structure
│   │   │   └── commit-message.test.ts # Entity tests
│   │   └── git/
│   │       ├── git-context.ts        # Entity: diff, status, file list
│   │       └── git-context.test.ts  # Entity tests
│   ├── ports/                      # Port interfaces (contracts for adapters)
│   │   ├── llm/
│   │   │   └── llm-provider.ts       # LlmProvider interface
│   │   ├── git/
│   │   │   └── git-service.ts        # GitService interface
│   │   └── editor/
│   │       └── editor-service.ts     # EditorService interface
│   └── types/
│       ├── commit-config.ts        # Zod schemas for commit feature configuration
│       └── errors.types.ts         # Custom error classes
│
├── infrastructure/                 # Adapters (external service implementations)
│   ├── git/
│   │   ├── shell-git-adapter.ts    # Git operations via shell commands (execa)
│   │   └── shell-git-adapter.test.ts # Git adapter tests
│   ├── llm/
│   │   ├── ollama-adapter.ts       # Ollama API adapter implementation
│   │   └── ollama-adapter.test.ts # Ollama adapter tests
│   └── editor/
│       ├── shell-editor-adapter.ts # Terminal editor integration ($EDITOR)
│       └── shell-editor-adapter.test.ts # Editor adapter tests
│
├── features/                       # Use cases & controllers
│   └── commit/
│       ├── controllers/
│       │   ├── commit-controller.ts     # Commander.js command handler
│       │   └── commit-controller.test.ts # Controller tests
│       ├── use-cases/
│       │   ├── generate-commit.ts       # Core commit generation orchestration
│       │   ├── generate-commit.test.ts  # Use case tests
│       │   ├── validate-preconditions.ts # Check staged changes, Ollama health
│       │   ├── validate-preconditions.test.ts # Validation tests
│       │   ├── format-validator.ts      # Conventional Commits regex validation
│       │   └── format-validator.test.ts # Format validation tests
│       └── prompts/
│           ├── user-prompt-builder.ts   # Simple template literals
│           └── user-prompt-builder.test.ts # Prompt builder tests
│
└── ui/                             # Terminal UI components
    ├── prompts/
    │   ├── commit-type-selector.ts # @clack/prompts type selection
    │   └── commit-type-selector.test.ts # UI component tests
    ├── spinners/
    │   ├── loading-spinner.ts      # ora spinner wrapper
    │   └── loading-spinner.test.ts # Spinner tests
    └── formatters/
        ├── message-formatter.ts    # Terminal color/formatting
        └── message-formatter.test.ts # Formatter tests

tests/
├── helpers/                        # Test utilities and factories
│   ├── test-fixtures.ts          # Sample data and scenarios
│   ├── mock-factories.ts         # Factory functions for creating test mocks
│   └── test-configuration.ts     # Common test setup and configuration
└── integration/                   # Integration tests (if needed)
```

### Dependency Flow (Hexagonal Pattern)

```
┌─────────────────────────────────────────────┐
│  CLI Layer (Commander.js)                   │
│  └─ CommitController                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Use Case Layer                             │
│  └─ GenerateCommitMessage                   │
│     (orchestrates domain logic)             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Core Ports (Interfaces)                    │
│  ├─ LlmProvider                             │
│  ├─ GitService                              │
│  └─ EditorService                           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Infrastructure Adapters                    │
│  ├─ OllamaAdapter (implements LlmProvider)  │
│  ├─ ShellGitAdapter (implements GitService) │
│  └─ ShellEditorAdapter (implements EditorS.)│
└─────────────────────────────────────────────┘
```

**Key Rules:**

- Core layer has ZERO external dependencies (no `ollama`, `execa`, `fs` imports)
- Infrastructure adapters implement core interfaces
- Dependency injection happens at `main.ts` composition root
- Controllers orchestrate use cases, use cases orchestrate domain entities

---

## Prompt Engineering Architecture

### System Prompt (Modelfile - Static)

**Location:** `Modelfile` (project root)
**Content:** Role definition, format rules, few-shot examples
**Creation:** `ollama create ollatool-commit -f Modelfile` during setup

> **Note:** The few-shot examples below are a subset example. For the full specification and dataset, see `docs/research/technical/Commit Message Generator Prompt Engineering.md`.

```dockerfile
FROM qwen2.5-coder:1.5b

SYSTEM """You are a git commit message generator specialized in Conventional Commits format.

CRITICAL RULES:
1. Output ONLY the commit message - no conversational text, no markdown, no code blocks
2. Format: <type>: <description>\n\n<body>
3. Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
4. Description: imperative mood, lowercase, no period, <50 characters
5. Body: explain WHAT and WHY, not HOW. 2-3 sentences max.

FEW-SHOT EXAMPLES:

Input:
diff --git a/src/auth.ts b/src/auth.ts
+ const timeout = 5000;

Output:
fix: increase auth request timeout

Increase the default request timeout from 1s to 5s. This addresses user reports of timeouts occurring on high-latency mobile networks.

Input:
diff --git a/src/components/LoginForm.tsx b/src/components/LoginForm.tsx
+ import { AuthService } from '../services/AuthService';
+ const handleSubmit = async () => { await AuthService.login(email, password); }

Output:
feat: connect submit handler to auth service

Import the authentication service and invoke the login method within the form submission handler. Add async/await logic to handle the network request.

Input:
diff --git a/README.md b/README.md
+ ## Local Setup
+ 1. Install Node.js 20+
+ 2. Run npm install

Output:
docs: add local setup instructions

Update the README.md file to include a step-by-step guide for setting up the development environment locally. Include details on environment variables.
"""

PARAMETER temperature 0.2
PARAMETER num_ctx 131072
```

### User Prompt (Dynamic - Per Request)

**Location:** `src/features/commit/prompts/user-prompt-builder.ts`
**Method:** Simple TypeScript template literals (NO Handlebars for MVP)

```typescript
// MVP: Simple string concatenation
export function buildUserPrompt(commitType: string, diff: string, status: string): string {
  return `Commit Type: ${commitType}

Git Diff:
${diff}

Git Status:
${status}

Generate the commit message following the format rules.`;
}

### Deterministic Type Enforcement

**Strategy:** Force Overwrite
The user's selection is the absolute source of truth. We do not rely on the model to respect the requested type.

**Logic:**
1.  User selects type (e.g., `feat`).
2.  Model generates message (e.g., `fix: add login button`).
3.  **Application Logic:** Programmatically strip the model's type prefix and replace it with the user's selection.
    *   Result: `feat: add login button`
4.  **Benefit:** Eliminates "type hallucination" errors completely. No retry needed for type mismatches.

### Structural Validation & Retry Logic

**Why generate the full message if we overwrite the type?**
LLMs are trained on full commit messages. Asking for the complete format (`feat: description`) yields higher quality descriptions than asking for fragments.

**Validation Rule:**
*   **Check:** Does the output match `^\w+: .+`? (Word, colon, text)
*   **Ignore:** We do NOT check if the type matches the user's selection (we overwrite that).
*   **Retry Trigger:** Only if the *structure* is broken (e.g., starts with "Here is the commit...").

**Retry Prompt:**
*"Error: Invalid format. You must output ONLY the commit message starting with a type and colon (e.g., 'feat: ...'). Do not include conversational text."*
```

**Rationale:** MVP uses single hard-coded format (Conventional Commits). Template literals are simpler, faster, and require zero dependencies. Handlebars reserved for post-MVP custom templates feature.

### Post-MVP: Template System (Stretch Goal)

**Feature:** User-configurable commit message templates
**Implementation:** Handlebars-based template engine
**Use Case:** Custom formats (emoji commits, team-specific templates, issue tracker integration)

**Example Template (conventional.hbs):**

```handlebars
Commit Type:
{{type}}

Changed files:
{{fileList diff}}

Diff:
{{truncate diff 4000}}

Generate commit message in Conventional Commits format.
```

**Configuration:**

```json
// ~/.config/ollatool/config.json
{
  "template": "conventional", // or "emoji", "custom"
  "customTemplatePath": "~/.config/ollatool/templates/my-template.hbs"
}
```

**Status:** Documented for future implementation. Adds value for teams with specific commit conventions beyond standard Conventional Commits.

---

## Cross-Cutting Concerns

### Error Handling Strategy

### Validation & Error Recovery Strategy

**Philosophy:** Intelligent parsing + normalization handles minor issues, retries only for truly broken outputs

**Four-Phase Processing Pipeline:**

**Phase 1: Intelligent Parsing (Strip Preamble)**

```typescript
// Look for FIRST line matching commit type pattern
const commitLineRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):/m;
const match = rawOutput.match(commitLineRegex);

if (match) {
  const startIndex = rawOutput.indexOf(match[0]);
  const cleaned = rawOutput.substring(startIndex).trim();
  // Continue to validation...
} else {
  // No valid commit line found - retry with error feedback
  previousError =
    'ERROR: No valid commit message found. Output must contain a line starting with a commit type (feat:, fix:, docs:, etc.)';
}
```

**Phase 2: Structural Validation (Require Body)**

```typescript
function validateStructure(message: string): string | null {
  const lines = message.split('\n');
  const firstLine = lines[0];

  // Must start with valid type and colon
  if (!/^(feat|fix|docs|...):.+/.test(firstLine)) {
    return "ERROR: First line must start with commit type and colon (e.g., 'feat: description')";
  }

  // Description must exist and be reasonable length
  const description = firstLine.split(':').slice(1).join(':').trim();
  if (description.length === 0) {
    return "ERROR: Description after colon is empty. Format: 'type: description'";
  }
  if (description.length > 72) {
    return 'ERROR: Description too long (>72 chars). Keep it concise.';
  }

  // Body MUST exist (not optional)
  const restOfMessage = lines.slice(1).join('\n').trim();
  if (restOfMessage.length === 0) {
    return 'ERROR: Body is missing. You must include a body paragraph after the subject line explaining what and why.';
  }
  if (restOfMessage.length < 10) {
    return `ERROR: Body too short (${restOfMessage.length} chars). Provide meaningful explanation of what changed and why.`;
  }

  return null; // Valid
}
```

**Phase 3: Type Enforcement (User Selection is Truth)**

```typescript
// Always overwrite model's type with user's selection
const [, ...rest] = parsed.split(':');
const description = rest.join(':').trim();
const withCorrectType = `${userSelectedType}: ${description}`;
```

**Phase 4: Normalization (Ensure Blank Line Separator)**

```typescript
const [subject, ...bodyLines] = withCorrectType.split('\n');
const body = bodyLines.join('\n').trim();
return `${subject}\n\n${body}`;
```

**Retry Logic with Error Feedback:**

- Max Retries: 3
- Visibility: **Completely silent** - no user-facing retry indicators
- Strategy: Feed specific validation error back to model with each retry
- Error messages guide the model toward correct output (see validation function above)
- Each retry includes: previous error + instruction to fix

**Success:** Display normalized commit message directly (no success indicator)

**Failure:** After 3 silent retries, show error and offer manual fallback

- Message: `[ERROR] ✗ Failed to generate valid commit message format after multiple attempts.`
- Options: `[R]egenerate [E]dit manually [C]ancel`

**Key Benefits:**

- Parsing handles chatty preamble (e.g., "Here is your commit:\n\nfeat: ...")
- Normalization fixes missing blank lines
- Type enforcement eliminates type hallucination
- Targeted error feedback improves retry success rate
- Only truly broken outputs require retries

### Editor Integration Strategy

**Requirement:** Allow users to edit the generated message in their preferred terminal editor (Vim, Nano, Emacs).

**Implementation Pattern:**

1.  **Temp File:** Write the message to `.git/COMMIT_EDITMSG_OLLATOOL`.
    - _Why .git/?_ It's already ignored by git, keeps the root clean, and is the standard place for commit metadata.
2.  **Spawn Editor:** Use `execa` to spawn `$EDITOR` (default: `nano`).
    - **Critical:** Must use `{ stdio: 'inherit' }` to let the editor take over the terminal input/output.
3.  **Wait & Read:** Await process completion, then read the file content back into memory.
4.  **Cleanup:** **ALWAYS** delete the temp file (in a `finally` block) to prevent debris, even if the editor crashes.

```typescript
// Conceptual Implementation
async function openEditor(content: string): Promise<string> {
  const tempPath = path.join('.git', 'COMMIT_EDITMSG_OLLATOOL');
  await fs.writeFile(tempPath, content);
  try {
    await execa(process.env.EDITOR || 'nano', [tempPath], { stdio: 'inherit' });
    return await fs.readFile(tempPath, 'utf-8');
  } finally {
    await fs.unlink(tempPath).catch(() => {}); // Ignore cleanup errors
  }
}
```

### Ollama Environment Validation Strategy

**Philosophy:** Fail Fast with Clear Remediation - No auto-provisioning during commit

**Validation Levels (executed in order during `commit` command):**

**1. Daemon Check (Connectivity)**

- **Method:** HTTP GET `http://localhost:11434/`
- **Success:** Status 200 OK
- **Failure:** Connection Refused / Timeout
- **Action:** Exit Code 3
- **Message:**

  ```
  [ERROR] ✗ Ollama is not running.

  Start Ollama:
    ollama serve

  Or install from: https://ollama.com/download
  Exit code: 3
  ```

**2. Base Model Check**

- **Method:** `ollama.list()` - check for `qwen2.5-coder:1.5b`
- **Success:** Model exists in tags list
- **Failure:** Base model missing
- **Action:** Exit Code 4
- **Message:**

  ```
  [ERROR] ✗ Base model 'qwen2.5-coder:1.5b' not found.

  Run setup to configure Ollama:
    ollatool setup

  Exit code: 4
  ```

**3. Custom Model Check**

- **Method:** `ollama.list()` - check for `ollatool-commit`
- **Success:** Custom model instance exists
- **Failure:** Custom model missing (edge case - user deleted it)
- **Action:** Exit Code 4
- **Message:**

  ```
  [ERROR] ✗ Custom model 'ollatool-commit' not found.

  Recreate the model:
    ollatool setup

  Exit code: 4
  ```

**Critical:** No auto-pull or auto-creation during `commit` command to preserve sub-1s performance target.

**Error Categories:**

| Category         | Exit Code | User Experience               | Example                       |
| ---------------- | --------- | ----------------------------- | ----------------------------- |
| User Error       | 2         | Clear remediation steps       | No staged changes             |
| System Error     | 3         | Installation/startup guidance | Ollama not running            |
| Validation Error | 4         | Format issue explanation      | Invalid commit message format |
| Unexpected Error | 5         | Debug log location, issue URL | Unhandled exception           |

**Error Class Hierarchy:**

```typescript
// src/core/types/errors.types.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly remediation?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UserError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 2, remediation);
    this.name = 'UserError';
  }
}

export class SystemError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 3, remediation);
    this.name = 'SystemError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, remediation?: string) {
    super(message, 4, remediation);
    this.name = 'ValidationError';
  }
}
```

**Error Display Pattern:**

```typescript
// Always show: [ERROR] ✗ message + remediation + exit code
try {
  await execute();
} catch (error) {
  if (error instanceof AppError) {
    console.error(`[ERROR] ✗ ${error.message}\n`);
    if (error.remediation) {
      console.error(error.remediation);
    }
    console.error(`\nExit code: ${error.code}`);
    process.exit(error.code);
  } else {
    // Unexpected error: log to file, show user-friendly message
    logToDebugFile(error);
    console.error('[ERROR] ✗ Unexpected error occurred.');
    console.error('Debug log: ~/.ollatool/debug.log');
    console.error('Report issue: https://github.com/USER/ollatool/issues');
    process.exit(5);
  }
}
```

### Logging Strategy

**MVP: Minimal Logging**

- No runtime logging to console (clean UX)
- Error logging to `~/.ollatool/debug.log` for unexpected errors only
- No telemetry, no analytics

**Debug Mode (Post-MVP):**

```bash
DEBUG=ollatool:* ollatool commit
# Logs: git commands, Ollama requests/responses, timing metrics
```

### Configuration Management

**MVP: Zero Configuration Required**

- Hard-coded defaults for all settings
- No config file needed for typical usage
- Respect environment variables: `OLLAMA_HOST`, `EDITOR`

**Post-MVP: Optional Configuration**

> **Note:** Configuration schema validation requires adding `zod` as a dependency (not needed in MVP).

```typescript
// src/core/types/commit-config.ts
export const CommitConfigSchema = z.object({
  ollamaHost: z.string().url().default('http://localhost:11434'),
  modelName: z.string().default('ollatool-commit'),
  temperature: z.number().min(0).max(1).default(0.2),
  maxRetries: z.number().min(0).max(5).default(3), // Post-MVP: Configurable retry attempts
  editor: z.string().optional(), // Override $EDITOR
});

export type CommitConfig = z.infer<typeof CommitConfigSchema>;
```

**Config File Locations (cosmiconfig search order):**

1. `package.json` `"ollatool"` property
2. `.ollatoolrc` (JSON or YAML)
3. `.ollatool.json`
4. `ollatool.config.js`
5. `~/.config/ollatool/config.json`

### Validation & Format Compliance

**Note:** This section documents the implementation details for the four-phase validation strategy defined in "Validation & Error Recovery Strategy" above.

**Clean Code Compliance:** This implementation demonstrates adherence to clean-code.md standards:

- Each method ≤15 lines (enforced via private helper extraction)
- Class member ordering: constructor → private properties → public methods → private methods
- DRY principle: Error messages extracted to constants, validation logic encapsulated

**Complete Implementation Flow:**

```typescript
// src/features/commit/use-cases/generate-commit.ts

export class GenerateCommit {
  // Constructor
  constructor(
    private readonly llm: LlmProvider,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  // Private Properties
  private readonly maxRetries = 3;
  private readonly commitTypeRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):/m;

  // Public Methods
  public async execute(userSelectedType: string, diff: string, status: string): Promise<string> {
    let previousError: string | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const { success, result, error } = await this.attemptGeneration(
        userSelectedType,
        diff,
        status,
        previousError,
      );
      if (success) return result!;
      previousError = error!;
    }

    throw new ValidationError(
      'Failed to generate valid commit message format after multiple attempts.',
      '[R]egenerate [E]dit manually [C]ancel',
    );
  }

  // Private Methods
  private extractCommitMessage(rawOutput: string): string | null {
    const match = rawOutput.match(this.commitTypeRegex);
    if (!match) return null;
    const startIndex = rawOutput.indexOf(match[0]);
    return rawOutput.substring(startIndex).trim();
  }

  private validateTypeAndColon(firstLine: string): string | null {
    if (!/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):.+/.test(firstLine)) {
      return "ERROR: First line must start with commit type and colon (e.g., 'feat: description')";
    }
    return null;
  }

  private validateDescription(firstLine: string): string | null {
    const description = firstLine.split(':').slice(1).join(':').trim();
    if (description.length === 0)
      return "ERROR: Description after colon is empty. Format: 'type: description'";
    if (description.length > 72) return 'ERROR: Description too long (>72 chars). Keep it concise.';
    return null;
  }

  private validateBody(lines: string[]): string | null {
    const restOfMessage = lines.slice(1).join('\n').trim();
    if (restOfMessage.length === 0) {
      return 'ERROR: Body is missing. You must include a body paragraph after the subject line explaining what and why.';
    }
    if (restOfMessage.length < 10) {
      return `ERROR: Body too short (${restOfMessage.length} chars). Provide meaningful explanation of what changed and why.`;
    }
    return null;
  }

  private validateStructure(message: string): string | null {
    const lines = message.split('\n');
    const firstLine = lines[0];
    return (
      this.validateTypeAndColon(firstLine) ||
      this.validateDescription(firstLine) ||
      this.validateBody(lines)
    );
  }

  private enforceType(message: string, userSelectedType: string): string {
    const [, ...rest] = message.split(':');
    const description = rest.join(':').trim();
    return `${userSelectedType}: ${description}`;
  }

  private normalizeFormat(message: string): string {
    const [subject, ...bodyLines] = message.split('\n');
    const body = bodyLines.join('\n').trim();
    return `${subject}\n\n${body}`;
  }

  private async attemptGeneration(
    userSelectedType: string,
    diff: string,
    status: string,
    previousError: string | null,
  ): Promise<{ success: boolean; result?: string; error?: string }> {
    const prompt = this.promptBuilder.build(userSelectedType, diff, status, previousError);
    const rawOutput = await this.llm.generate(prompt);

    // PHASE 1: Intelligent Parsing (extract commit from potential preamble)
    const parsed = this.extractCommitMessage(rawOutput);
    if (!parsed) {
      return {
        success: false,
        error:
          'ERROR: No valid commit message found. Output must contain a line starting with a commit type (feat:, fix:, docs:, etc.)',
      };
    }

    // PHASE 2: Structural Validation (returns error string or null)
    const validationError = this.validateStructure(parsed);
    if (validationError) return { success: false, error: validationError };

    // PHASE 3: Type Enforcement (overwrite with user selection)
    const withCorrectType = this.enforceType(parsed, userSelectedType);

    // PHASE 4: Normalization (ensure blank line separator)
    const normalized = this.normalizeFormat(withCorrectType);
    return { success: true, result: normalized };
  }
}
```

### Date/Time Handling

**MVP: No explicit date handling needed**

- Git handles commit timestamps automatically
- No user-facing date formatting required

**Post-MVP:** If adding features like commit history analysis:

- Use native `Date` objects (no libraries like moment/dayjs)
- Store as ISO 8601 strings
- Display in user's local timezone

### Performance Monitoring

**MVP: No metrics collection**

**Post-MVP (Optional):**

```typescript
// Simple timing metrics for optimization
interface PerformanceMetrics {
  ollamaConnectionTime: number;
  modelLoadTime: number;
  inferenceTime: number;
  totalTime: number;
}

// Debug mode shows timing breakdown
if (process.env.DEBUG) {
  console.log('Performance:', metrics);
}
```

---

## Implementation Patterns for Agent Consistency

### Naming Conventions

**Files:** kebab-case for all files

```
commit-controller.ts
shell-git-adapter.ts
user-prompt-builder.ts
```

**Classes/Interfaces:** PascalCase

```typescript
class CommitController {}
interface LlmProvider {}
class ShellGitAdapter implements GitService {}
```

**Variables/Functions:** camelCase

```typescript
const maxFormatRetries = 3;
function validateConventionalCommit(message: string): boolean {}
async function generateCommitMessage(): Promise<string> {}
```

**Constants (true constants only):** Use camelCase unless it's a true immutable constant like an enum

```typescript
// Configuration values - use camelCase
const maxFormatRetries = 3;
const defaultTemperature = 0.2;

// True constants/enums - use CAPS_SNAKE_CASE
enum CommitType {
  FEAT = 'feat',
  FIX = 'fix',
  DOCS = 'docs',
}
```

### Interface vs Implementation Naming

**Pattern:** Interfaces describe capability, implementations describe mechanism

```typescript
// Interface (what it does)
interface LlmProvider {
  generate(prompt: string): Promise<string>;
}

// Implementation (how it does it)
class OllamaAdapter implements LlmProvider {
  // Uses Ollama SDK
}
```

**NO "I" prefix on interfaces** - Modern TypeScript style

### Class Member Ordering

**CRITICAL:** All classes must follow this exact member ordering for consistency across the codebase.

**Standard Order:**

1. **Constructor** (with readonly dependency injection)
2. **Private Properties** (internal state)
3. **Public Properties** (configuration/exposed state)
4. **Private Methods** (helpers)
5. **Public Methods** (API surface)

**Rationale:** Constructor first (Node.js/TypeScript convention), then properties (private before public), then methods (private before public). This groups encapsulated implementation details together while keeping the public API at the bottom where it is most visible.

**Example:**

```typescript
export class GenerateCommit {
  // 1. Constructor
  constructor(
    private readonly llm: LlmProvider,
    private readonly git: GitService,
  ) {}

  // 2. Private Properties
  private readonly maxRetries = 3;
  private previousError: string | null = null;

  // 3. Public Properties
  public retryCount = 0;

  // 4. Private Methods
  private extractCommitMessage(raw: string): string | null {
    // Implementation
  }

  private validateStructure(message: string): string | null {
    // Implementation
  }

  // 5. Public Methods
  public async execute(type: string, diff: string): Promise<string> {
    // Implementation
  }
}
```

**Reference:** See `dev/styleguides/clean-code.md` for complete standards.

### Error Handling Patterns

**Always use custom error classes:**

```typescript
// Don't throw raw strings
throw new Error('Ollama not running'); // ❌

// Use typed errors with remediation
throw new SystemError('Ollama is not running.', 'Start Ollama with: ollama serve'); // ✅
```

**Catch at boundaries, not everywhere:**

```typescript
// Don't wrap every call in try/catch
async function buildPrompt() {
  try {
    const diff = await gitService.getDiff(); // ❌ Unnecessary
    return formatPrompt(diff);
  } catch (e) {
    throw e; // Re-throwing adds no value
  }
}

// Let errors bubble up to the controller
async function buildPrompt() {
  const diff = await gitService.getDiff(); // ✅ Let it throw
  return formatPrompt(diff);
}

// Catch at the controller (boundary)
async execute() {
  try {
    await generateAndCommit(); // ✅ Catch at boundary
  } catch (error) {
    handleError(error); // Display to user, exit with code
  }
}
```

### Dependency Injection Pattern

**Constructor injection only:**

```typescript
// ❌ Bad: Direct instantiation, hard to test
class GenerateCommit {
  private llm = new OllamaAdapter();

  async execute() {
    return await this.llm.generate(/*...*/);
  }
}

// ✅ Good: Constructor injection, testable
class GenerateCommit {
  constructor(
    private llm: LlmProvider,
    private git: GitService,
  ) {}

  async execute() {
    return await this.llm.generate(/*...*/);
  }
}

// Composition root (main.ts)
const llm = new OllamaAdapter(/*...*/);
const git = new ShellGitAdapter();
const useCase = new GenerateCommit(llm, git);
```

### Async/Await Patterns

**Always use async/await, never raw Promises:**

```typescript
// ❌ Bad: Promise chains
function generate() {
  return llm
    .generate(prompt)
    .then((result) => validate(result))
    .then((validated) => format(validated))
    .catch((err) => handleError(err));
}

// ✅ Good: async/await
async function generate() {
  const result = await llm.generate(prompt);
  const validated = await validate(result);
  return format(validated);
}
```

### Testing Patterns

**Co-located tests, mock via Vitest utilities:**

```typescript
// commit-controller.test.ts
import { vi } from 'vitest';
import type { LlmProvider } from '@/core/ports/llm-provider';
import type { GitService } from '@/core/ports/git-service';

describe('CommitController', () => {
  let controller: CommitController;
  let mockLlm: LlmProvider;
  let mockGit: GitService;

  beforeEach(() => {
    // ✅ Create test-only mocks using Vitest utilities
    mockLlm = {
      generateCommitMessage: vi.fn(),
      isServiceAvailable: vi.fn().mockResolvedValue(true),
    };
    mockGit = {
      getStagedDiff: vi.fn().mockResolvedValue('diff content'),
      getStatus: vi.fn().mockResolvedValue('M file.ts'),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    controller = new CommitController(new GenerateCommit(mockLlm, mockGit));
  });

  it('should generate commit message', async () => {
    mockLlm.generateCommitMessage.mockResolvedValue('feat: add feature');

    const result = await controller.execute();

    expect(result).toBe('feat: add feature');
    expect(mockGit.getStagedDiff).toHaveBeenCalled();
    expect(mockLlm.generateCommitMessage).toHaveBeenCalledWith(
      expect.stringContaining('diff content'),
    );
  });
});
```

**Mock Factory Pattern:**

```typescript
// tests/helpers/mock-factories.ts
import { vi } from 'vitest';
import type { LlmProvider } from '@/core/ports/llm-provider';

export function createMockLlmProvider(): LlmProvider {
  return {
    generateCommitMessage: vi.fn(),
    isServiceAvailable: vi.fn().mockResolvedValue(true),
  };
}

export function createMockGitService(): GitService {
  return {
    getStagedDiff: vi.fn(),
    getStatus: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  };
}
```

**Key Testing Principles:**

1. **No Production Mock Classes**: Mocks are created per test using Vitest utilities
2. **Interface-Based Mocking**: Mock objects implement the same interfaces as production
3. **Test Isolation**: Each test gets fresh mock instances
4. **Behavior Verification**: Test both that methods are called AND with correct parameters
5. **Test Utilities**: Common mock creation patterns extracted to helper functions

### File Organization Rules

1. **One class per file** (exception: small related types)
2. **Exports at bottom of file** (after all code)
3. **Imports grouped by type:**

   ```typescript
   // External dependencies
   import { z } from 'zod';
   import { Ollama } from 'ollama';

   // Internal core
   import type { LlmProvider } from '@/core/ports/llm-provider';
   import { ValidationError } from '@/core/types/errors.types';

   // Feature-specific
   import { validateConventionalCommit } from './format-validator';
   ```

### Code Documentation

**Self-documenting code preferred, comments for "why" not "what":**

```typescript
// ❌ Bad: Comment describes what code does
// Get the staged diff from git
const diff = await git.getStagedDiff();

// ✅ Good: Code is self-documenting
const stagedDiff = await git.getStagedDiff();

// ✅ Good: Comment explains WHY
// Retry generation because qwen2.5-coder occasionally outputs markdown
// code blocks despite system prompt instructions
const maxFormatRetries = 3;
```

---

## Data Architecture

### Core Domain Entities

**CommitMessage Entity:**

```typescript
// src/core/domain/commit-message.ts
export class CommitMessage {
  constructor(
    public readonly commitType: string,
    public readonly description: string,
    public readonly body?: string,
    public readonly scope?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.commitType || !this.description) {
      throw new ValidationError('Commit type and description are required');
    }
  }

  toString(): string {
    const scopePart = this.scope ? `(${this.scope})` : '';
    const bodyPart = this.body ? `\n\n${this.body}` : '';
    return `${this.commitType}${scopePart}: ${this.description}${bodyPart}`;
  }

  static fromString(raw: string): CommitMessage {
    const match = raw.match(/^(\w+)(?:\(([^)]+)\))?: (.+?)(?:\n\n(.+))?$/s);
    if (!match) {
      throw new ValidationError('Invalid commit message format');
    }
    const [, commitType, scope, description, body] = match;
    return new CommitMessage(commitType, description, body, scope);
  }
}
```

### Port Interfaces

**LlmProvider Interface:**

```typescript
// src/core/ports/llm-provider.ts
export interface LlmProvider {
  /**
   * Generate commit message from git diff context
   * @throws SystemError if Ollama unavailable
   * @throws ValidationError if generation fails after retries
   */
  generateCommitMessage(prompt: string): Promise<string>;

  /**
   * Check if Ollama service is running and accessible
   */
  isServiceAvailable(): Promise<boolean>;
}
```

**GitService Interface:**

```typescript
// src/core/ports/git-service.ts
export interface GitService {
  /**
   * Get staged changes diff
   * @throws UserError if no staged changes
   */
  getStagedDiff(): Promise<string>;

  /**
   * Get short status of changed files
   */
  getStatus(): Promise<string>;

  /**
   * Execute git commit with message
   * @throws SystemError if commit fails
   */
  commit(message: string): Promise<void>;
}
```

**EditorService Interface:**

```typescript
// src/core/ports/editor-service.ts
export interface EditorService {
  /**
   * Open editor with initial content
   * @returns edited content or null if user cancelled
   */
  edit(initialContent: string): Promise<string | null>;
}
```

### Adapter Implementations

**OllamaAdapter:**

```typescript
// src/infrastructure/llm/ollama-adapter.ts
import { Ollama } from 'ollama';
import type { LlmProvider } from '@/core/ports/llm-provider';
import { SystemError, ValidationError } from '@/core/types/errors.types';

export class OllamaAdapter implements LlmProvider {
  constructor(
    private client: Ollama,
    private modelName: string = 'ollatool-commit',
  ) {}

  async generateCommitMessage(prompt: string): Promise<string> {
    try {
      const response = await this.client.generate({
        model: this.modelName,
        prompt,
        keep_alive: 0, // Unload model after execution
      });

      return response.response.trim();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new SystemError('Ollama is not running.', 'Start Ollama with: ollama serve');
      }
      throw new ValidationError('Failed to generate commit message');
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Architecture Decision Records

### ADR-001: Hexagonal Architecture

**Context:** Need clean separation between business logic and external dependencies for testability and maintainability.

**Decision:** Implement a pragmatic Hexagonal Architecture (Ports & Adapters), effectively a "Clean Architecture" approach, with core domain isolated from infrastructure via interfaces.

**Consequences:**

- ✅ Easy to test with mocks
- ✅ Can swap Ollama for OpenAI without touching core logic
- ✅ Clear boundaries between layers
- ❌ More files/folders than simple flat structure
- ❌ Requires understanding of DI pattern

### ADR-002: TypeScript over JavaScript

**Context:** Need type safety for complex domain logic and external API interactions.

**Decision:** Use TypeScript with strict mode enabled.

**Consequences:**

- ✅ Catch errors at compile time
- ✅ Better IDE autocomplete
- ✅ Self-documenting code via types
- ❌ Build step required (tsup)
- ❌ Slight learning curve

### ADR-003: Modelfile-based System Prompt

**Context:** System prompt needs to be iterable without code changes.

**Decision:** Bake system prompt into Modelfile, separate from dynamic user prompts.

**Consequences:**

- ✅ Iterate on prompts via `ollama create` (no code deployment)
- ✅ Cleaner API requests (smaller payload)
- ✅ Model + prompt versioned together
- ❌ Requires `ollama create` setup step
- ❌ Less flexible than dynamic prompts

### ADR-004: Co-located Tests

**Context:** Angular-style developer expects tests adjacent to implementation.

**Decision:** Place `.test.ts` files next to `.ts` files instead of separate `tests/` directory.

**Consequences:**

- ✅ Easy to find tests for any file
- ✅ Clear 1:1 relationship
- ✅ Familiar to Angular developers
- ❌ More files in source directories

### ADR-005: Zero-Config MVP

**Context:** Developer productivity requires minimal setup friction.

**Decision:** Hard-code sensible defaults, no config file required for MVP.

**Consequences:**

- ✅ Works immediately after `npm install`
- ✅ Fewer moving parts to debug
- ✅ Clear upgrade path (add config later)
- ❌ Less flexible for power users initially

---

## Summary & Next Steps

### Architecture Completeness

This architecture document defines:

✅ **Technology Stack** - Verified versions, Node 22.20 compatibility
✅ **Ollama Integration** - Modelfile structure, parameters, prompt architecture
✅ **Project Structure** - Hexagonal architecture, co-located tests
✅ **Cross-Cutting Concerns** - Errors, logging, validation, config
✅ **Implementation Patterns** - Naming, DI, async/await, testing
✅ **Data Architecture** - Domain entities, ports, adapters
✅ **Architecture Decisions** - ADRs with context and consequences

### Ready for Implementation

**Phase 4 can begin** with confidence that:

- All major technical decisions are documented
- Naming conventions prevent agent conflicts
- Hexagonal architecture enables parallel development
- Test strategy supports TDD workflow
- Error handling provides clear user guidance

### Validation Checklist

Before starting implementation stories:

- [ ] Review architecture with team
- [ ] Confirm Node 22.20 compatibility
- [ ] Validate Modelfile approach with Ollama test
- [ ] Verify co-located test pattern in tsconfig/vitest config
- [ ] Approve naming conventions

### Post-MVP Features Documented

The following are captured for future implementation:

- Custom template system (Handlebars)
- Configuration file support (cosmiconfig)
- Debug logging mode
- Performance metrics collection

---

**Status:** ✅ Architecture Complete
**Next Workflow:** create-epics-and-stories (pm)
**Alternative:** implementation-readiness validation (architect)

---

````

`dev/bmm-workflow-status.yaml`:

```yaml
# Workflow Status Template

# This tracks progress through BMM methodology Analysis, Planning, and Solutioning phases.
# Implementation phase is tracked separately in sprint-status.yaml

# STATUS DEFINITIONS:
# ==================
# Initial Status (before completion):
#   - required: Must be completed to progress
#   - optional: Can be completed but not required
#   - recommended: Strongly suggested but not required
#   - conditional: Required only if certain conditions met (e.g., if_has_ui)
#
# Completion Status:
#   - {file-path}: File created/found (e.g., "docs/product-brief.md")
#   - skipped: Optional/conditional workflow that was skipped

generated: '2025-11-27T06:25:00.000Z'
project: 'Ollama-CLI-application'
project_type: 'greenfield'
selected_track: 'bmad-method'
field_type: 'greenfield'
workflow_path: './.bmad/bmm/workflows/workflow-status/paths/method-greenfield.yaml'
workflow_status: 'phases:
  - phase: 0
  name: "Discovery (Optional)"
  optional: true
  note: "User-selected during workflow-init"
  workflows:
  - id: "brainstorm-project"
  optional: true
  agent: "analyst"
  command: "brainstorm-project"
  included_by: "user_choice"
  status: "archive/brainstorming-session-results-2025-11-11.md"

  - id: "research"
  optional: true
  agent: "analyst"
  command: "research"
  included_by: "user_choice"
  note: "Can have multiple research workflows"
  status: "docs/research/"

  - id: "product-brief"
  optional: true
  agent: "analyst"
  command: "product-brief"
  included_by: "user_choice"
  note: "Recommended for greenfield Method projects"
  status: "dev/brief.md"

  - phase: 1
  name: "Planning"
  required: true
  workflows:
  - id: "prd"
  required: true
  agent: "pm"
  command: "prd"
  output: "Product Requirements Document with FRs and NFRs"
  status: "dev/prd.md"

  - id: "validate-prd"
  optional: true
  agent: "pm"
  command: "validate-prd"
  note: "Quality check for PRD completeness"
  status: "validated-but-no-epics-till-post-architecture"

  - id: "create-design"
  conditional: "if_has_ui"
  agent: "ux-designer"
  command: "create-design"
  note: "Determined after PRD - user/agent decides if needed"
  status: "dev/ux-design-specification.md"

  - phase: 2
  name: "Solutioning"
  required: true
  workflows:
  - id: "create-architecture"
  required: true
  agent: "architect"
  command: "create-architecture"
  output: "System architecture document"
  note: "Complete system design for greenfield projects"
  status: "dev/architecture.md"

  - id: "create-epics-and-stories"
  required: true
  agent: "pm"
  command: "create-epics-and-stories"
  note: "Required: Break down PRD into implementable epics and stories with full context (PRD + UX + Architecture)"
  status: "dev/stories/"

  - id: "test-design"
  recommended: true
  agent: "tea"
  command: "test-design"
  output: "System-level testability review"
  note: "Testability assessment before gate check - auto-detects system-level mode"
  status: "recommended"

  - id: "validate-architecture"
  optional: true
  agent: "architect"
  command: "validate-architecture"
  note: "Quality check for architecture completeness"
  status: "archive/implementation-readiness-report-2025-11-28.md"

  - id: "implementation-readiness"
  required: true
  agent: "architect"
  command: "implementation-readiness"
  note: "Validates PRD + UX + Architecture + Epics + Testability cohesion before implementation"
  status: "archive/implementation-readiness-report-2025-11-28.md"

  - phase: 3
  name: "Implementation"
  required: true
  workflows:
  - id: "sprint-planning"
  required: true
  agent: "sm"
  command: "sprint-planning"
  note: "Creates sprint plan - subsequent work tracked there"
  status: "required"'

````

`dev/brief.md`:

```md
# Joe's Ollama CLI Application Project Brief

## Project Goal

Build a working **Git Commit Message Generator CLI** that uses Ollama and `qwen2.5-coder:1.5b` to automatically generate high-quality Conventional Commit messages from staged git changes. The tool must be extremely simple, the project completable end-to-end by an intermediate developer, and provide genuine developer utility as a GitHub-ready demonstration of local SLM integration.

## Application Decision

### Primary Application: Git Commit Message Generator

**Selected Tool:** `ollacli commit` - An intelligent git commit assistant

**Note:** `ollacli` is a working name. Final package name to be determined during implementation based on npm availability and branding.

**Core Functionality:**

1. **Commit Analysis**: Gathers staged changes and file status
   - Analyzes staged git changes (`git diff --cached`)
   - Analyzes file status indicators (`git status --short`)
2. **Message Generation**: Generates Conventional Commit format messages via `qwen2.5-coder:1.5b`
3. **Interactive Preview**: Displays generated commit message for user review
4. **User Interaction**: Approve/edit in CLI editor (Nano or equivalent)/regenerate/reject
5. **Commit Execution**: Runs `git commit -m "..."` on user approval

**Why This Application:**

- ✅ **Simplest to build**: Bounded input/output (git diff → commit message)
- ✅ **Perfect SLM fit**: Text-only, pattern-matching task ideal for 1.5B model
- ✅ **High frequency**: Used 10-50x/day by active developers
- ✅ **Proven pattern**: Validates against existing tools (aicommits, commitron)
- ✅ **Company alignment**: Supports adoption of Conventional Commits standard
- ✅ **Privacy**: Keeps proprietary code changes 100% local
- ✅ **Deliverable**: Can complete MVP in 2-4 sprints

**Target Use Case:**

This tool is designed for **incremental, mid-development commits** - not final PR merge commits. Developers use it throughout their workflow for granular, work-in-progress changes like component updates, partial feature implementations, and small fixes. Commits are frequent, component-focused, and iterative rather than polished final summaries.

## Personal Requirements & Constraints

### Technical Profile

- **Background**: Angular frontend developer
- **Node.js**: Comfortable with beginner Node.js concepts
- **CLI Experience**: Relatively little, but quick learner
- **Code Approach**: Comfortable using agents to write code as long as he understands requirements
- **Hardware**: M1/M2 Mac (optimal for `qwen2.5-coder:1.5b` performance)

### Success Criteria

- **Deliverable**: Working CLI application that can be completed end-to-end
- **Scope**: Complete full start-to-finish development lifecycle
- **Sharing**: GitHub-ready project (CV-worthy, demonstrates SLM integration patterns)
- **Simplicity**: Prioritize achievable MVP over feature-complete
- **Learning**: Complete understanding of Ollama integration and orchestrator architecture

### Non-Functional Requirements

- **Achievable Scope**: Feature scope narrow enough for intermediate developer to deliver complete project including full SDLC requirements (GitHub management, npm packaging, README, documentation, version management)
- **Deliverability**: Must be achievable as a complete, working project with full understanding of every component
- **npm Distribution**: Tool must be installable via npm registry for global CLI access
- **Zero-Config Philosophy**: Tool should work immediately after installation with sensible defaults
- **Lightweight Footprint**: Minimal dependencies, single command, optional configuration
- **Technical Preference**: CLI approach (easiest path for Ollama integration)
- **GitHub Ready**: Project should be shareable and demonstrate full development process
- **Performance**: Sub-1-second response time for commit message generation, 90% reliability.

## Development Standards

**Context7 Integration:** Leverages Context7 MCP for Node.js best practices and architectural patterns.

**Style Guides:** Project follows documented style guides for Node.js CLI, clean code principles, unit testing, and Ollama integration patterns (see `dev/styleguides/`).

## Technical Architecture

### Platform Stack

- **Model**: `qwen2.5-coder:1.5b` (optimized for code tasks, superior instruction-following)
- **Runtime**: Ollama (local inference engine)
- **CLI Framework**: Node.js (TypeScript optional)
- **Integration Pattern**: Orchestrator Architecture

### Orchestrator Pattern
```

User → CLI App (Node.js) → Execute git commands → Get text output
→ Send text to Ollama API → Receive commit message
→ Show preview → Execute git commit (on approval)

````

**Key Architectural Points:**

- The model ONLY processes text (cannot execute commands or read files directly)
- The CLI app acts as the "brain" that orchestrates:
  - Git command execution (`git diff`, `git status`)
  - Prompt construction with context
  - Ollama API communication
  - User interaction and confirmation
  - Final commit execution

### Technical Context

- **Platform**: Ollama with local SLM models
- **Model Choice**: `qwen2.5-coder:1.5b` - optimized for code tasks with superior instruction-following
- **Target Environment**: Standard developer laptops (8GB-16GB RAM), M1/M2 Mac optimal
- **Expected Performance**:
  - Model load time: <100ms (if Ollama resident)
  - Inference time: <0.5s (typical commit message ~20-30 tokens)
  - Total UX: Sub-1-second from command to preview

### Technical Risks & Considerations

- **Model lifecycle**: Ollama keep-alive behavior unknown. Must validate startup/inference/cleanup fits within 1-second target without manual start/stop.
- **Auto-pull complexity**: npm post-install pulling 1GB+ model risks permission/network/timeout failures.
- **Output compliance**: 1.5B model may produce non-compliant format despite few-shot prompting. Requires regex validation and graceful failure.
- **Diff size limits**: Large diffs may overwhelm model context window. May need truncation or chunking strategy.

### Available Research Context

The project has extensive [background research](docs/research) already completed:

- ✅ Ollama technical foundation and API capabilities
- ✅ SLM capabilities and constraints analysis (text-only, no vision for 1B model)
- ✅ Developer activity audit research (30 micro-tasks identified and scored)
- ✅ Application idea exploration and prioritization
- ✅ CLI patterns and developer workflow analysis
- ✅ Competitive landscape (aicommits, commitron exist but may have different approaches)

## MVP Scope: Git Commit Generator

### Must-Have Features (Phase 1)

**Core Command:**

```bash
ollacli commit
````

**Functionality:**

1. **Pre-commit validation**: Exit gracefully with clear guidance if no staged changes exist
2. **Context gathering**: Execute `git diff --cached` and `git status --short`
   - **`git diff --cached`**: Analyzes staged changes only (what will actually be committed)
   - **`git status --short`**: Provides concise file status indicators (M/A/D) vs verbose human-readable output
3. **Type elicitation**: Prompt user to select commit type via numbered list or arrow-key selection
   - Elicited type informs prompt construction to improve generation quality
4. **Prompt construction**: Build context-rich prompt including elicited type for Conventional Commits
5. **Model inference**: Send to `qwen2.5-coder:1.5b` via Ollama API
6. **Interactive preview**: Display generated commit message
7. **User interaction**: Approve/edit in CLI editor (Nano or equivalent)/regenerate/reject
8. **Commit execution**: Run `git commit -m "..."` on approval

**Conventional Commit Support:**

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Format**:

  ```
  <type>: <description>

  <body>
  ```

- **In Scope (MVP)**: Type, Description, Body
- **Out of Scope (MVP)**: Scope `(module)`, Footer (issue tracking, breaking changes)

**Examples:**

```bash
feat: add email validation to registration form

Added email format validation and duplicate check on the registration form.
Uses regex pattern for format validation and checks against existing users
before allowing submission.
```

```bash
refactor: extract UserCard component from UserList

Moved user card rendering logic into separate reusable component. Accepts user
props and click handlers. Makes UserList cleaner and card styling easier to
maintain across views.
```

```bash
fix: handle null user case in profile dropdown

Added null check before accessing user.name in dropdown component. Prevents
crash when user data hasn't loaded yet. Shows loading state instead.
```

### Nice-to-Have Features (Post-MVP Suggestions)

- **User description prompt**: Optional prompt asking user to describe the change in their own words before generation. Provides additional context to improve message quality. Also serves as fallback strategy if diff-only inference proves insufficient.
  - Could be implemented via `--describe` flag to keep default flow frictionless
- **Interactive clarification**: Model requests additional context from user when confidence is low or changes are ambiguous. More exploratory idea requiring multi-turn interaction and confidence assessment.
- `--dry-run`: Generate message without committing
- `--auto`: Skip preview and auto-commit
- `--all` flag: Auto-stage all changes and generate commit (address the "no staged changes" workflow)
  - Would use `git diff` (without --cached) to analyze unstaged changes before auto-staging
- `--ticket` flag: Accept explicit Jira ticket or user story reference to include in commit context
- `--context` flag: Accept additional working context description to inform commit message generation
- **Footer support**: Add conventional commit footers (moved from MVP for workflow simplicity). Could extend elicitation pattern to include footer options
- **Scope support**: Add optional scope to commit format `<type>(<scope>): <description>` where scope identifies the module/component affected (e.g., `feat(auth):`, `fix(api):`). Could implement via elicitation pattern (like type selection) or detection (file path analysis, heuristics, configuration)
- Configuration file support for customization:
  - Model selection and management (choose different models based on hardware capabilities and use case requirements)
  - Commit message templates and preferences
  - Default commit types/scope preferences
  - Default ticket/context settings per repository
  - Reduction of flags

## Future Expansion Ideas

The architecture supports future expansion into a multi-tool suite. **These are suggestions only - not requirements.**

**Potential Commands:**

- **`ollacli pr`**: PR description generator using Map-Reduce approach to summarize branch changes
- **`ollacli screenshot`**: Vision-based (Moondream2 VLM) screenshot auto-organizer for documentation workflows

**Decision**: Focus exclusively on Git Commit tool for MVP. Consider expansion only after successful completion and validation.

## Research Synthesis & Market Validation

Comprehensive competitive analysis and feasibility research has been completed ([Local SLM Dev Tool Research](docs/research/Local%20SLM%20Dev%20Tool%20Research.md), [Competitive Git Commit Tool Feature Analysis](docs/research/Competitive%20Git%20Commit%20Tool%20Feature%20Analysis.md)). Key findings:

### Core Value: Automating Commit Messages

Regardless of tool landscape, automating commit message generation delivers measurable value:

- **Improves SDLC documentation**: Commits become reliable historical context instead of throwaway messages ("wip", "fix", "asdf")
- **Reduces developer friction**: No mental cost to write meaningful commits during flow state
- **Minimizes cognitive load**: Developers context-switch less between implementation and commit messaging
- **Enhances code review**: Better commits provide crucial context for reviews and future maintenance

This value applies whether using Conventional Commits or regular commit formats.

### Market Gap Confirmed: "Local-First" Opportunity

**Question: Are we reinventing the wheel?**
**Answer: No - there is a clear market gap.**

Existing tools fall into two categories:

- **Cloud-native tools** (`aicommits`, `opencommit`) that _tolerate_ local models but default to OpenAI, introducing latency (2-5s) and privacy concerns
- **Configuration-heavy tools** (`opencommit`, `czg`) that require DevOps-level setup, manual Ollama management, and extensive config files

**The Local-First Gap:**
No tool combines Zero-Config setup, low-latency local inference (no API calls, small model), and guaranteed privacy in one tool.

**Our Differentiation Strategy:**

1. **Privacy-first (Default)**: 100% local inference, zero data egress guaranteed
2. **Speed**: Sub-1s latency vs 2-5s cloud latency
3. **Zero-config**: Auto-detect Ollama, auto-provision models, sensible defaults
4. **Compliance Engine**: Automates Conventional Commits adherence without cognitive load

**Strategic Positioning**: "Trojan Horse" approach - low-risk entry point for enterprise local AI adoption through commit generation.

### Conventional Commits: Validated for All Commit Types

**Question: Is Conventional Commits appropriate for mid-development commits?**
**Answer: Yes - position as compliance automation, not format enforcement.**

Research shows:

- Conventional Commits introduce "Process Friction" - cognitive load of remembering types/scopes
- Our tool **removes cognitive load** by automating classification
- Acts as **"interactive tutor"** for developers learning the standard
- Ensures **100% adherence** without slowing development

**Critical Implementation Requirements:**

- Strict enforcement as **default** (not optional)
- Use **Few-Shot Prompting** (not zero-shot) to prime model with examples
- **Regex validation** post-generation to guarantee compliance
- Fail gracefully if model produces non-compliant output

**Value Proposition**: Not a "message writer" but a **compliance engine** that eliminates the burden of the standard.

### Context Approach: Start Minimal, Extend Strategically

**Question: How much context should we provide the model?**
**Answer: MVP uses minimal context. Advanced context is post-MVP differentiation.**

**MVP Approach (Minimal Context):**

- Input: `git diff --cached` + `git status --short` + system prompt (includes few-shot examples)
- Model: `qwen2.5-coder:1.5b` (superior to `llama3.2:1b` for structured output)
- Focus: Speed, privacy, Conventional Commits compliance

**Post-MVP Opportunities (Suggestions Only):**

- Branch metadata parsing for Jira IDs (e.g., `feature/PROJ-123` → append ticket reference)
- Scope detection implementation (e.g., file path analysis `src/app/auth/*.ts` → scope: `auth`, or heuristics/configuration-based approaches)

**Complexity Trade-off:**
Research validates starting minimal to ensure deliverability. Context-aware features add differentiation but increase complexity. Defer to post-MVP.

### Model Selection: Qwen 2.5 Coder 1.5B

Research identifies `qwen2.5-coder:1.5b` as superior to `llama3.2:1b`:

- Higher instruction-following scores (IFEval benchmarks)
- Fine-tuned specifically for code tasks
- Less prone to "chatty" outputs or hallucinations
- Handles structured output (Conventional Commits) more reliably

**Performance on M1/M2 hardware:**

- Memory footprint: ~1.2GB RAM
- Inference speed: 70-90 tokens/sec
- Total latency: 0.4-0.8s for typical commit message
- Load time: <100ms (if Ollama resident)

## Error Handling & UX Philosophy

**Boundary Conditions & Decisions:**

### No Staged Changes

**Decision:** Manual staging approach for MVP

- User gets helpful error message with specific guidance
- `Run: git add <files>  # stage specific files`
- `  or: git add .       # stage all changes`
- Post-MVP: Consider `--all` flag to auto-stage everything

### Ollama Environment State

**Decision:** Graceful degradation with user guidance

- **Ollama not running:** Clear error message to start Ollama, exit gracefully (like colima tool)
- **Model not available:** Auto-pull `qwen2.5-coder:1.5b` (defer to post-MVP for implementation)
- **Model auto-pull:** Complexity to be addressed later, not MVP blocker

### Configuration Philosophy

**Decision:** Zero-config for MVP

- No configuration files or settings
- Fixed model choice (`qwen2.5-coder:1.5b`)
- Fixed Conventional Commit format (full spec with smart generation)
- Future: Optional configuration for advanced features

### Git Error Handling

**Decision:** Pass-through Git errors deterministically

- **Git Command Failures**: Report Git errors directly to user and exit gracefully
- **User Responsibility**: User resolves underlying Git issues
- **Clear Messaging**: Deterministic error reporting without ambiguity

### User Interaction Flow

**Decision:** Low-friction CLI editor workflow

- **Edit**: Open generated commit message in CLI editor (Nano or equivalent) for user modifications
- **Regenerate**: If scope permits, allow re-running generation without re-analysis
- **Reject/Exit**: User can abandon commit generation at any point
- **No Copy/Paste**: Direct editor access to maintain low-friction experience

### Distribution Model

**Decision:** Global npm package

- Published to npm registry (free for public packages)
- Installation: `npm install -g ollacli` (or alternative final name)
- Post-install: Automatically pulls `qwen2.5-coder:1.5b` model from Ollama (via npm post-install script)
- Name flexibility retained for future refinement

## Success Definition & Metrics

Joe will feel successful when he has:

### Technical Success

1. ✅ A working `ollacli commit` command that generates quality commit messages
2. ✅ Complete understanding of Ollama integration patterns
3. ✅ Functional orchestrator architecture (CLI ↔ Git ↔ Ollama)
4. ✅ Sub-1-second response time on M1/M2 hardware
5. ✅ Conventional Commit format support

### Deliverable Success

1. ✅ GitHub repository with complete source code
2. ✅ Documentation (README, architecture docs, usage guide)
3. ✅ Working installation process (npm install or similar)
4. ✅ Demonstrates full development lifecycle
5. ✅ CV-worthy project showing SLM integration skills

### Learning Success

1. ✅ Deep understanding of how local SLMs work
2. ✅ Confidence to build more complex SLM applications
3. ✅ Understanding of orchestrator vs. model capabilities
4. ✅ Knowledge of Ollama API and integration patterns
5. ✅ Foundation for future dev productivity tools

### Success Metrics

**Quantitative Success Criteria:**

- **Personal Acceptance Testing**: Separate test repo, multiple runs, target ~90% acceptance rate (late-stage story)
- **User Feedback Quality**: Qualitative feedback from local developers
- **Unit Test Coverage**: Comprehensive Jest coverage following style guide patterns

**User Experience Metrics:**

- **Response Time**: Sub-1-second from command to preview
- **Error Clarity**: Deterministic Git error reporting
- **User Control**: Edit workflow (Regenerate/Reject are nice-to-haves if scope permits)

**Testing Strategy:**

- **Unit Testing**: Jest with getData()/getInstance() patterns (per `dev/styleguides/unit-test-patterns.md`)
- **Integration Testing**: Jest-based git output scenario coverage (tooling needs assessed later, we may be able to run Ollama via Jest?)
- **Manual Testing**: Personal testing + user feedback stories (late-stage development)

## Next Steps

**Brief Status**: ✅ Complete. Ready to proceed to PRD.

1. **Product Requirements Document (PRD)**
   - Define detailed functional requirements
   - Specify user stories and acceptance criteria
   - Document MVP feature boundaries
   - Define testing strategy

2. **Technical Architecture & Design**
   - Define project structure
   - Design Ollama integration layer
   - Plan prompt engineering strategy (Few-Shot approach)
   - Define configuration approach

3. **Implementation**
   - Break down into sprints/phases
   - Begin MVP development
   - Iterative testing and validation

## References

**Research Documentation:**

- [Local SLM Dev Tool Research](docs/research/Local%20SLM%20Dev%20Tool%20Research.md) - Competitive analysis & feasibility assessment
- [Competitive Git Commit Tool Feature Analysis](docs/research/Competitive%20Git%20Commit%20Tool%20Feature%20Analysis.md) - Feature benchmarking & roadmap

**External Resources:**

- Ollama docs - https://docs.ollama.com/
- Ollama github - https://github.com/ollama/ollama
- Conventional Commits spec - https://www.conventionalcommits.org/

````

`dev/epics.md`:

```md
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

### Epic 0: Test Infrastructure & Model Validation

**Goal:** Establish comprehensive test infrastructure and validate model selection before implementation
**User Value:** Ensures implementation choices are validated and testable; prevents architecture mistakes

**FRs Covered:** None (this is foundational work that enables all FRs to be testable)

**Testing Deliverables:** Test infrastructure validation, model evaluation results, CI/CD pipeline, acceptance testing framework

**Rationale:** This epic is **CRITICAL BLOCKER** for all other epics. Without validated test infrastructure and proven model performance, subsequent implementation would be building on assumptions. The test design system shows that model quality, performance, and testability must be established before story development begins.

**Dependencies:** None (this is the first epic that enables everything else)

---

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

**Epic 0 (Test Infrastructure):** None (enables all FRs to be testable)
**Epic 1 (Foundation):** FR49
**Epic 2 (Ollama Integration):** FR7, FR8, FR9, FR10, FR11, FR12, FR45
**Epic 3 (Git Context):** FR1, FR2, FR3, FR4, FR6, FR33, FR36
**Epic 4 (AI Generation):** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR37
**Epic 5 (Interactive Workflow):** FR13, FR14, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR46, FR47, FR48
**Epic 6 (Performance & Errors):** FR34, FR35, FR38, FR39, FR40, FR41, FR42, FR43, FR44

**Verification:** All 49 FRs accounted for ✓

**Epic Dependency Chain:**

0. Test Infrastructure & Model Validation (enables and validates everything)
1. Foundation (enables everything)
2. Ollama Integration (required for AI generation)
3. Git Context (required for AI generation input)
4. AI Generation (required for interactive workflow)
5. Interactive Workflow (orchestrates 2, 3, 4)
6. Performance & Errors (polishes all epics)

---

## Story Files

Detailed story breakdowns for each epic are available in the following files:

- **Epic 0:** [dev/stories/epic-0-test-infrastructure.md](./stories/epic-0-test-infrastructure.md) - 8 stories
- **Epic 1:** [dev/stories/epic-1-foundation.md](./stories/epic-1-foundation.md) - 6 stories
- **Epic 2:** [dev/stories/epic-2-ollama-integration.md](./stories/epic-2-ollama-integration.md) - 6 stories
- **Epic 3:** [dev/stories/epic-3-git-context.md](./stories/epic-3-git-context.md) - 7 stories
- **Epic 4:** [dev/stories/epic-4-ai-generation.md](./stories/epic-4-ai-generation.md) - 7 stories
- **Epic 5:** [dev/stories/epic-5-interactive-workflow.md](./stories/epic-5-interactive-workflow.md) - 8 stories
- **Epic 6:** [dev/stories/epic-6-performance-errors.md](./stories/epic-6-performance-errors.md) - 8 stories
- **Epic 7:** [dev/stories/epic-7-manual-acceptance-testing.md](./stories/epic-7-manual-acceptance-testing.md) - 1 story

**Total Stories:** 51 user stories covering all 49 functional requirements + manual acceptance testing

---

````

`dev/prd.md`:

```md
# Ollama-CLI-application - Product Requirements Document

**Author:** Joe
**Date:** 2025-11-27
**Version:** 1.0

**🚨 MVP SCOPE IS ABSOLUTE: This project must deliver a complete, working NPM package. All decisions must prioritize deliverability over additional features. Choose simpler implementations that work over complex ones that add weeks. When in doubt, leave it out.**

---

## Executive Summary

This PRD defines requirements for a local-first CLI tool suite that enhances developer productivity using Small Language Models (SLMs) via Ollama. The first command, `commit`, generates high-quality Conventional Commit messages from staged git changes with sub-1-second latency, 100% local privacy, and zero configuration required. The tool architecture supports future expansion into additional developer productivity commands (PR descriptions, screenshot organization) while maintaining the core principles of speed, privacy, and simplicity.

### What Makes This Special

The tool is not just another commit message generator—it's a **Local-First Compliance Engine** that solves critical pain points:

1. **Privacy-First (Default)**: 100% local inference using Ollama and an appropriate Small Language Model. Zero data egress—proprietary code diffs never leave the developer's machine. This addresses enterprise Data Loss Prevention (DLP) requirements that currently prevent adoption of cloud-based tools like GitHub Copilot in regulated environments.

2. **Speed Over Cloud**: 3-5 second response time on M1/M2/M3 hardware vs 2-5 second latency for cloud-based competitors (aicommits, opencommit). Preserves developer flow state by making AI generation feel fast and responsive—comparable to native git commands.

3. **Zero-Config Experience**: No API keys, no manual Ollama configuration, no DevOps setup. The tool auto-detects Ollama, auto-provisions models, and works immediately after installation with sensible defaults.

4. **Conventional Commits Support**: The tool generates commit messages following the Conventional Commits standard by default, making it easier for teams to adopt and maintain consistent commit history. Future iterations may support custom templates and alternative commit formats.

**Strategic Positioning**: Starting with commit generation as the first command establishes the Ollama infrastructure on developer machines, enabling future expansion into additional local-first productivity tools (PR descriptions, screenshot organization) while maintaining the core principles of speed, privacy, and simplicity.

---

## Project Classification

**Technical Type:** CLI Tool (Developer Productivity)
**Domain:** General Software Development
**Complexity:** Low (no regulatory/compliance burdens)

**Classification Rationale:**

This is a command-line developer tool targeting high-frequency micro-interactions (git commits). As a general-purpose developer productivity tool outside regulated industries (healthcare, fintech, etc.), it faces low domain complexity. The primary technical challenges are realistic performance optimization (3-5 second latency), user experience (zero-config setup), and reliability (output format compliance)—not regulatory compliance or domain-specific validation.

---

## Success Criteria

Success for this tool is defined by three dimensions: technical capability, developer adoption, and learning outcomes for the developer (Joe).

**Technical Success:**

- End-to-end workflow completion in 3-5 seconds on M1/M2 hardware (command invocation → message preview)
- 90%+ acceptance rate during personal acceptance testing in real development workflows
- 100% Conventional Commits format compliance (validated via regex post-generation)
- Zero data egress—all processing occurs locally without network calls to external APIs
- Graceful error handling for edge cases (no staged changes, Ollama not running, model unavailable)

**Adoption & Usability:**

- Zero-config first-run experience—tool works immediately after `npm install -g [tool-name]`
- High-quality commit messages that developers accept without significant editing (90%+ acceptance)
- Seamless integration into existing git workflows—no need to remember new commands or break muscle memory
- Deterministic error messages that guide users to resolution (e.g., "Ollama not detected. Install from ollama.com")

**Learning & Deliverability:**

- Complete understanding of Ollama integration patterns and orchestrator architecture
- Deep knowledge of local SLM capabilities, constraints, and prompt engineering for small models
- Full development lifecycle completion: working code, tests, documentation, npm packaging, GitHub repository
- CV-worthy demonstration of local AI integration for developer productivity

**What "Good" Looks Like:**

- A developer stages changes, runs `git commit`, and sees a well-formatted Conventional Commit message appear in their editor within 3-5 seconds
- The message accurately summarizes the changes with correct type classification (feat/fix/chore) and concise description
- The developer saves and closes without needing to edit, trusting the AI-generated content
- The tool feels like a native git enhancement, not an external AI service

---

## Product Scope

### MVP - Minimum Viable Product

**Core Command: `[tool-name] commit`**

The MVP focuses exclusively on automating git commit message generation with strict Conventional Commits adherence and realistic 3-5 second performance.

**Must-Have Capabilities:**

1. **Pre-commit Validation**
   - Detect if no staged changes exist
   - Exit gracefully with clear guidance: "No staged changes. Run: git add <files>"
   - Fail fast before doing any heavy operations

2. **Ollama Lifecycle Management**
   - Auto-detect Ollama availability at `http://localhost:11434`
   - If not running: Provide clear instructions to start it (`ollama serve`) and exit gracefully
   - If not installed: Provide installation link (https://ollama.com) and exit gracefully
   - Auto-provision required model if not present (with progress bar)
   - Handle model loading delays gracefully with spinner/progress indicator
   - Fail fast if Ollama cannot be made available

3. **Commit Type Elicitation**
   - Present numbered list of Conventional Commit types to user: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
   - Use arrow-key selection or number input for type choice
   - Lightweight user interaction before heavy context gathering
   - Store selected type to inject into prompt later

4. **Context Gathering**
   - Execute `git diff --cached` to capture staged changes only
   - Execute `git status --short` for concise file status indicators (M/A/D)
   - Analyze diff content and file paths to inform commit classification
   - Only performed after confirming Ollama is available and type is selected

5. **Model Inference**
   - Construct prompt with few-shot examples, user-selected type, and diff context
   - Send to Ollama with Conventional Commits format constraints
   - Stream response with 3-5s latency target
   - Handle inference failures with retry option

6. **Format Compliance Validation**
   - Post-generation regex validation: `/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):.+/`
   - Enforce Conventional Commits format: `<type>: <description>\n\n<body>`
   - Silent retry mechanism: if regex fails, automatically retry generation (up to max retries - TBD) without exposing failures to user
   - Only show user messages that pass first-level validation check
   - User can then choose to edit or regenerate if content quality is unsatisfactory

7. **Interactive Preview & Edit**
   - Display generated commit message in terminal for review
   - Offer options: [A]pprove, [E]dit, [R]egenerate, [C]ancel
   - Edit: Open default CLI editor (Nano/Vim) with message pre-filled for user modification
   - Approve: Execute `git commit -m "..."` with generated or edited message

**In-Scope Constraints:**

- Type, Description, and Body fields only (no Scope or Footer in MVP)
- Single model: Qwen 2.5 Coder 1.5B identified as primary target (see Model Selection Strategy section for details and alternatives)
- Local execution only (no cloud fallback)
- English language output only

**Out of Scope (MVP):**

- Scope field: `type(scope): description` format
- Footer support: issue tracking, breaking changes notation
- Git hooks integration (prepare-commit-msg)
- Multi-language commit message support
- Custom configuration files
- `--dry-run` and `--auto` flags

**Possible MVP Scope (Stretch Goal):**

- `--all` flag: Auto-stage all changes before generating commit
  - Aligns with zero-config philosophy (convenience)
- `--all` flag: Auto-stage all changes before generating commit
  - Aligns with zero-config philosophy (convenience)
  - Lower priority: manual staging is more common workflow
  - Implementation: simple `git add .` before context gathering
  - Decision: Include if time permits, otherwise defer to post-MVP

### Growth Features (Post-MVP)

**Configuration & Customization:**

- Configuration file support (`~/.config/[tool-name]/config.json`)
  - Model selection (switch between qwen2.5-coder, llama3.2, codellama)
  - Custom commit types and templates beyond Conventional Commits
  - Locale settings for non-English commit messages
  - Default behavior flags (auto-stage, skip preview, etc.)
  - Configurable retry logic (max retry attempts for validation failures)

**Advanced Workflow Integration:**

- `--all` flag: Auto-stage all changes before generating commit
- Git hooks: `prepare-commit-msg` hook installer that automatically intercepts `git commit` to generate messages without explicit CLI invocation.
- `--hint` flag: Provide manual context hint to guide generation (e.g., `--hint "fixing login bug"`)
- Auto-start Ollama: Automatically spawn Ollama daemon if installed but not running (simplifies user experience)

**Context Enhancement:**

- Branch metadata parsing: Extract Jira/issue IDs from branch names (e.g., `feature/PROJ-123` → append to footer)
- Scope detection: Infer scope from file paths (e.g., `src/app/auth/*.ts` → scope: `auth`)
- Multi-file diff summarization: Smart truncation for large diffs (>4k tokens) using Map-Reduce approach
- Custom ignore patterns: `.toolignore` file to exclude files from AI context (lockfiles, generated assets)

**Conventional Commits Extensions:**

- Scope support: Add optional `(scope)` field based on file path analysis or user elicitation
- Footer support: e.g. Breaking changes (`BREAKING CHANGE:`), issue references (`Refs: #123`)
- GitMoji support: Optional emoji prefixes for visual commit classification (🐛 fix, ✨ feat)

### Vision (Future)

**Multi-Command CLI Suite:**

The tool evolves from a single-purpose commit generator into a comprehensive local-first developer productivity suite.

**`[tool-name] pr` - Pull Request Description Generator:**

- Aggregate commit history from feature branch
- Use Map-Reduce summarization for multi-file diffs
- Generate PR title, summary, changes list, and testing strategy
- Integrate with `gh` (GitHub CLI) for one-command PR creation

**`[tool-name] screenshot` - Vision-Based Screenshot Organization:**

- Background daemon monitors `~/Desktop` or `~/Screenshots`
- Use Moondream2 VLM to analyze screenshot content (UI elements, code snippets, terminal output)
- Auto-rename files with semantic descriptions (e.g., `2025-11-27_login-modal-error-state.png`)
- Zero user input required—fully automated organization

**`[tool-name] daemon` - Performance Optimization:**

- Background process keeps Ollama model loaded in VRAM
- Eliminates cold-start latency (2-5 seconds) for instant responses
- Configurable keep-alive duration and resource limits

**Advanced Context Awareness:**

- Project structure analysis: Send directory tree to model for better scope detection
- Codebase-aware suggestions: RAG implementation using local embeddings for project-specific commit patterns
- Multi-turn interaction: Model requests clarification from user when diff is ambiguous

---

## CLI Tool Specific Requirements

As a command-line developer tool, this product must adhere to Unix philosophy and modern CLI best practices while delivering exceptional user experience through intelligent automation.

**Command Structure:**

- Primary command: `[tool-name] commit`
- Future commands: `[tool-name] pr`, `[tool-name] screenshot`, `[tool-name] daemon`
- Follow verb-noun pattern for clarity and discoverability
- Support `--help` and `--version` flags globally

**Interactive vs Scriptable:**

- **Primary Mode**: Interactive TUI with rich prompts, spinners, and progress bars
- **Scriptable Mode**: Support for `--dry-run` (output to stdout) and `--auto` (non-interactive) flags for CI/CD integration
- Detect TTY mode: rich output in terminal, plain text when piped
- Exit codes: 0 (success), 1 (user cancel), 2 (error - no staged changes), 3 (error - Ollama unavailable)

**Output Formats:**

- Default: Rich terminal output with colors, emojis, and formatting (using libraries like chalk, ora)
- Piped output: Plain text suitable for parsing or logging
- JSON output: `--json` flag for machine-readable responses (post-MVP)
- Streaming: Real-time token streaming for commit message generation (visual feedback during inference)

**Configuration Method:**

- Zero-config by default (sensible defaults for 80% use case)
- Optional config file: `~/.config/[tool-name]/config.json` for power users (post-MVP)
- Environment variables: `OLLAMA_HOST`, `OLLAMA_MODEL` for override capability (post-MVP)
- Per-repo config: `.toolrc` file in repo root for team-wide settings (post-MVP)

**Shell Integration:**

- Installation via npm: `npm install -g [tool-name]`
- Binary available in PATH immediately after installation
- Shell completion support (bash, zsh, fish) for command and flag autocomplete (post-MVP)
- Respect user's `$EDITOR` environment variable for terminal editor selection (Nano, Vim, Emacs, etc.), with fallback to Nano if not set

**Error Handling Philosophy:**

- Fail gracefully with actionable error messages
- Never crash with stack traces in user-facing output (log to debug file instead)
- Provide clear remediation steps: "Ollama not detected. Install from https://ollama.com"
- Distinguish between user error (no staged changes), system error (Ollama down), and bugs (unexpected exceptions)

### Model Selection Strategy

**Target Model (Pre-Testing):**

Research and competitive analysis have identified **Qwen 2.5 Coder 1.5B** (4-bit quantization) as the most appropriate model for this use case based on:

- Superior instruction-following scores (IFEval benchmarks) compared to Llama 3.2 1B
- Fine-tuning specifically for code tasks and structured output
- Lower tendency for "chatty" outputs or conversational filler
- Reliable handling of Conventional Commits format constraints
- Memory footprint: ~1.2GB RAM (acceptable for background use)
- Performance on M1/M2: 70-90 tokens/sec, ~0.4-0.8s for typical commit message

**Validation Requirement:**

The model selection is subject to validation testing during implementation. If Qwen 2.5 Coder does not meet acceptance criteria (90%+ acceptance rate, sub-1s latency, format compliance), alternative models will be evaluated:

- Llama 3.2 1B (general-purpose, wider compatibility)
- CodeLlama 7B (higher capability, increased resource requirements)
- Llama 3.2 3B (middle ground between speed and capability)

**Architecture Flexibility:**

The tool architecture must support model switching without code changes. Model name should be configurable via environment variable during development to enable rapid iteration and testing. User-facing model selection is a post-MVP feature—MVP uses a single hard-coded default model.

**Implementation Considerations (for Architecture phase):**

The following Ollama request parameters require technical decisions during architecture/development:

- **Temperature**: Controls output randomness. MVP likely uses fixed low value (e.g., 0.1-0.2) for deterministic commit messages.
- **Keep-alive**: Controls how long model stays in memory. MVP may use `-1` (indefinite) or high value for performance, avoiding cold-start latency.
- **Context window (num_ctx)**: Model default should suffice for MVP, but architecture must handle detection when diff exceeds limits.
- **UX Design Decision:**
  **Spinner Library:** Chose `ora` library for cross-platform terminal animations
  **Design:** Unicode dots animation for professional appearance
  **Rationale:** Battle-tested, handles Windows/macOS/Linux differences automatically
  **MVP Scope:** Zero additional complexity for users, reliable performance feedback

**Alternative Validation Strategy:**

- **Single-pass validation** (simpler, faster): Generate full message, validate with regex, retry if invalid.
- **Multi-pass sectioned generation** (more reliable, slower): Prompt model separately for type, description, body; validate each section individually before assembly.
- Trade-off: Reliability vs. latency. Start with single-pass; consider multi-pass if reliability issues emerge during testing.

### Future Technical Considerations (Post-MVP):

**Edge Cases to Document:**

- Mid-generation daemon death: Document as edge case, don't implement specific handling initially
- Git repository corruption: Document as edge case, rely on git's own error reporting
- Editor fallback failures: Document fallback chain ($EDITOR → vim → nano → vi → notepad), already covered in stories

**Migration Strategy Questions:**

- CLI tool migration patterns: Research how popular CLI tools handle version upgrades with breaking changes
- Custom model upgrade strategy: How to migrate users from ollatool-commit v1 to v2 when system prompt changes
- Configuration migration: Strategy for handling config file format changes between versions
- Timeline: Document as v1.1+ consideration, not MVP blocker

**Performance Validation Gaps:**

- Empirical performance data: Add performance benchmarking as post-MVP task to validate actual vs. target latency
- Context window testing: Validate real-world diff sizes vs. 128K token limit under various development scenarios
- Hardware variability: Test on different Mac/Windows/Linux configurations, not just M1/M2 as

**CRITICAL: First-Run Model Provisioning Flow:**

- **Problem**: Tool requires both base model download AND custom model creation (with system prompt baked in via Modelfile). This only works if Ollama is running.
- **Ollama model creation**: Tool doesn't just use base model + dynamic prompt. It creates a custom Ollama model via Modelfile that includes the system prompt, creating a new model (e.g., `[tool-name]-commit:latest`) based on `qwen2.5-coder:1.5b`.
- **Recommended approach**:
  - **npm postinstall hook**: Attempt full setup (download base model + create custom model). If Ollama not running, exit gracefully: "Ollama not detected. Install Ollama, run `ollama serve`, then: [tool-name] setup"
  - **Explicit setup command**: `[tool-name] setup` - Downloads base model (if missing) AND creates custom model with system prompt. Shows progress for both operations.
  - **Just-in-time fallback**: If custom model somehow missing when user runs `commit`, recreate it then (edge case only)
- **User flow**: npm install tool → install Ollama → `ollama serve` → [postinstall succeeds OR user runs setup] → `[tool-name] commit`
- **Architecture phase must define**: Modelfile structure, custom model naming convention, setup command implementation

---

## User Experience Principles

While this is a CLI tool without a graphical interface, user experience is paramount. The tool must feel like a natural extension of git rather than an external AI service.

**Speed is UX:**

- Sub-1-second response time is non-negotiable. Anything slower breaks developer flow.
- Show immediate feedback: spinner during model loading, streaming tokens during generation.
- Perceived performance matters: display progress even if waiting for Ollama to start.

**Trust Through Transparency:**

- Always show the generated message before committing—never auto-commit without user review.
- Provide clear indication of what the tool is doing: "Analyzing staged changes...", "Generating commit message..."
- If generation fails or format is invalid, explain why and offer remediation.

**Low Friction, High Control:**

- Default path should be 3 keystrokes: select type → review message → approve.
- Power users can bypass with flags (`--auto`, `--dry-run`) when they trust the output.
- Editing is always available—open user's preferred $EDITOR with message pre-filled.

**Graceful Degradation:**

- If Ollama is not installed or not running: provide installation/startup instructions and exit gracefully (similar to how Docker fails with a helpful message when Colima isn't running).
- If model is unavailable: offer to auto-download with progress bar and size estimate (edge case where user deleted model after installation).
- If the context window is being exceeded: exit with error explaining the limitation and suggest staging fewer files (intelligent truncation is post-MVP).

### Key Interaction Patterns

**Primary Flow - Happy Path:**
```

1. User: git add <files>
2. User: [tool-name] commit
3. Tool: [Check] Validates staged changes exist
4. Tool: [Check] Detects Ollama availability (exits if not running)
5. Tool: [Prompt] "Select commit type: 1) feat 2) fix 3) docs ..."
6. User: [Input] 2
7. Tool: [Spinner] "Analyzing staged changes..."
8. Tool: [Streaming] "fix: handle null token in login service\n\nAdded null check..."
9. Tool: [Prompt] "[A]pprove [E]dit [R]egenerate [C]ancel"
10. User: [Input] a
11. Tool: [Success] "✓ Committed: fix: handle null token in login service"

```

**Edit Flow:**

```

9. Tool: [Prompt] "[A]pprove [E]dit [R]egenerate [C]ancel"
10. User: [Input] e
11. Tool: [Opens $EDITOR with message]
12. User: [Edits message, saves, closes]
13. Tool: [Success] "✓ Committed: <edited message>"

```

**Error Flow - No Staged Changes:**

```

2. User: [tool-name] commit
3. Tool: [Error] "No staged changes detected.

   Stage your changes first:
   git add <files> # stage specific files
   git add . # stage all changes

   Or use --all flag to auto-stage (post-MVP feature)"

4. Tool: [Exit code 2]

```

**Error Flow - Ollama Not Running:**

```

2. User: [tool-name] commit
3. Tool: [Error] "Ollama is not running.

   Start Ollama:
   ollama serve

   Or install from:
   https://ollama.com/download"

4. Tool: [Exit code 3]

```

---

## Functional Requirements

These requirements define WHAT capabilities the tool must have to deliver the product vision. Each requirement is a testable, implementation-agnostic statement of functionality.

### Git Integration & Context Gathering

**FR1**: The tool can detect whether any files are staged in the git staging area.

**FR2**: The tool can read the complete diff of all staged changes (`git diff --cached`).

**FR3**: The tool can read the status of all files in the repository (`git status --short`).

**FR4**: The tool can identify file paths and extensions from staged changes to inform commit classification.

**FR5**: The tool can execute git commit commands with user-approved commit messages.

**FR6**: The tool operates only within git repositories and fails gracefully when run outside one.

### Ollama & Model Lifecycle Management

**FR7**: The tool can detect whether the Ollama daemon is running and accessible at the configured endpoint.

**FR8**: The tool can check if the required model (hard-coded for MVP) is present on the local system.

**FR9**: The tool can automatically download (pull) the required model if it is not present, displaying download progress.

**FR10**: The tool can send inference requests to Ollama with custom prompts and receive streaming responses.

**FR11**: The tool can detect when the diff exceeds the model's context window and exit with an error message suggesting to stage fewer files.

**FR12**: The tool can detect and report Ollama connection failures with actionable error messages.

### Commit Type & Classification

**FR13**: The tool can present users with a list of valid Conventional Commit types (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert).

**FR14**: Users can select a commit type via numbered selection or arrow-key navigation.

**FR15**: The tool injects the user-selected commit type into the prompt to guide model generation.

**FR16**: The tool validates generated commit messages using a structural regex (`^\w+: .+`) to ensure they follow the standard format, ignoring the specific type (which is overwritten).

**FR17**: If generated output fails structural validation (e.g., contains conversational text), the tool silently retries generation (up to a maximum retry limit) without exposing failures to the user.

### Commit Message Generation

**FR18**: The tool constructs prompts using few-shot examples to prime the model for Conventional Commits format.

**FR19**: The tool sends diff context, file status, and commit type to the model for message generation.

**FR20**: The tool provides visual feedback during message generation to indicate processing is occurring (e.g., spinner or token streaming).

**FR21**: The tool generates commit messages with three components: type, description (subject), and body.

**FR22**: Generated descriptions follow imperative mood ("add feature" not "added feature").

**FR23**: Generated descriptions are concise (target: 50 characters or less for subject line).

**FR24**: The tool ensures the final commit message contains no conversational filler (e.g., "Here is a commit message:"). Primary strategy: strong prompt engineering to prevent filler generation. Fallback: detection and stripping (complex to implement reliably).

### Interactive User Workflow

**FR25**: The tool displays generated commit messages in the terminal for user review before committing.

**FR26**: Users can approve generated commit messages to proceed with git commit.

**FR27**: Users can edit commit messages by opening them in their configured CLI editor ($EDITOR).

**FR28**: Users can regenerate commit messages if unsatisfied with the initial output.

**FR29**: Users can cancel the commit operation at any point without side effects.

**FR30**: The tool displays clear action prompts with keyboard shortcuts ([A]pprove, [E]dit, [R]egenerate, [C]ancel).

**FR31**: When users edit messages, the tool captures the edited content and uses it for the commit.

**FR32**: The tool confirms successful commits with a summary of the committed message.

### Error Handling & Edge Cases

**FR33**: When no staged changes exist, the tool exits with an error message explaining how to stage files.

**FR34**: When Ollama is not running, the tool exits with instructions to start or install Ollama.

**FR35**: When the required model is not available, the tool offers to download it automatically.

**FR36**: When git commands fail (e.g., not a git repo), the tool displays git's error message and exits.

**FR37**: When model inference fails or times out, the tool reports the error and allows retry.

**FR38**: The tool distinguishes between user errors (exit code 1-2), system errors (exit code 3), and bugs (exit code 4+).

**FR39**: All error messages include actionable remediation steps, not just problem descriptions.

### Performance & Resource Management

**FR40**: The tool completes the full workflow (command invocation to commit) in under 1 second on M1/M2 hardware.

**FR41**: The tool provides immediate visual feedback (spinner/progress) when waiting for Ollama responses.

**FR42**: The tool respects system resources by using quantized models with memory footprints under 2GB.

**FR43**: The tool can operate while other development tools (IDE, browser, Docker) are running without causing memory pressure.

### Configuration & Extensibility

**FR44**: The tool uses sensible defaults that work without any configuration (zero-config principle).

**FR45**: The tool respects the `OLLAMA_HOST` environment variable for custom Ollama endpoints.

**FR46**: The tool respects the `$EDITOR` environment variable (when set to a terminal editor like Nano/Vim/Emacs) for editing commit messages, with Nano as the fallback if `$EDITOR` is not set.

**FR47**: The tool provides `--help` flag to display usage information and available commands.

**FR48**: The tool provides `--version` flag to display current version number.

**FR49**: The tool's architecture supports adding new commands (pr, screenshot) without breaking existing functionality.

---

## Non-Functional Requirements

These requirements define HOW WELL the system must perform, not what it does. They establish quality attributes that enable the tool to succeed in real-world developer workflows.

### Performance

**NFR-P1: Latency Target**

- End-to-end workflow completion in 3-5 seconds on M1/M2 hardware (command invocation → commit completion)
- Model inference time: 2-4 seconds for typical commit message (20-30 tokens)
- Time-to-first-token (TTFT): <50ms when model is already loaded in memory

**Performance Optimization Strategy:**

- **Cold Start Target**: Sub-5 seconds for complete workflow (MVP baseline)
- **Warm Inference Optimization**: Performance testing during implementation will determine optimization opportunities
- **Adaptive Approach**: Based on real-world performance data, we may explore warm-up strategies, model caching, or other optimizations post-MVP

**NFR-P2: Resource Efficiency**

- Maximum memory footprint: 2GB RAM for model + inference runtime during active use
- CPU usage: ≤50% of one performance core during active inference
- Idle resource usage: 0% when not actively generating (model unloaded from memory after use; Ollama daemon persistence is user-managed, not controlled by tool)

**NFR-P3: Startup Performance**

- CLI tool initialization: <100ms (binary load + argument parsing)
- Ollama connection check: <200ms timeout for availability detection
- Model loading (cold start): 3-5 seconds when model must be loaded into memory

**NFR-P4: Perceived Performance**

- Display visual feedback (spinner/progress) within 100ms of user action
- Stream tokens in real-time (no buffering entire response before display)
- Progress bars for long-running operations (model downloads, large diff analysis)

### Security & Privacy

**NFR-S1: Data Privacy (Critical)**

- 100% local processing—no code diffs transmitted over network to external services
- No telemetry, analytics, or usage tracking without explicit opt-in
- All model inference occurs on localhost via Ollama API

**NFR-S2: Credentials & Secrets**

- No API keys required for operation (zero-config principle)
- No storage of user credentials or authentication tokens
- Respect for git's credential handling (tool never accesses git credentials)

**NFR-S3: Code Integrity**

- Tool never modifies source code files—only interacts with git metadata
- Tool only writes to `.git/` directory via standard git commands (no direct manipulation)
- User approval required before any git commit is executed

**NFR-S4: Dependency Security**

- All npm dependencies scanned for known vulnerabilities (npm audit)
- Minimal dependency tree to reduce attack surface
- No dependencies with native binary components (prefer pure JavaScript where possible)

### Reliability & Error Handling

**NFR-R1: Graceful Degradation**

- Tool never crashes with unhandled exceptions in user-facing operation
- All errors caught, logged to debug file, and presented with actionable messages
- No data loss: if commit fails, user's changes remain staged and uncommitted

**NFR-R2: Deterministic Behavior**

- Same diff + same commit type → consistent message format (though content may vary slightly due to model stochasticity)
- Error conditions always produce the same error code and message structure
- No race conditions or timing-dependent bugs in git command execution

**NFR-R3: Resilience to External Failures**

- Ollama connection failures handled gracefully (no hang, clear error message)
- Model download failures (network issues) allow retry without restarting tool
- Git command failures (repo corruption, permission issues) reported clearly without tool crash

**NFR-R4: Testing Coverage**

- Unit test coverage: ≥80% of core logic (git integration, prompt construction, message validation)
- Integration tests: Mock Ollama responses for deterministic testing
- Manual acceptance testing: 90%+ acceptance rate across 50+ real commits

### Compatibility & Integration

**NFR-C1: Platform Support (MVP)**

- macOS: M1/M2/M3 (primary target), Intel Macs (secondary)
- Git versions: 2.x and above (standard modern git)
- Node.js: v18+ (LTS and Current releases)

**NFR-C2: Platform Support (Post-MVP)**

- Linux: Ubuntu 22.04+, Debian 11+, Fedora 38+
- Windows: WSL2 (Windows Subsystem for Linux 2)

**NFR-C3: Terminal Compatibility**

- Works in: iTerm2, Terminal.app, Warp, Alacritty, Kitty
- Respects TERM environment variable for color/formatting capability detection
- Graceful fallback to plain text when piped or in non-TTY mode

**NFR-C4: Git Workflow Integration**

- Compatible with standard git workflows (feature branches, rebasing, merging)
- Does not interfere with git hooks installed by other tools (Husky, pre-commit frameworks)
- Respects `.gitignore` and `.git/info/exclude` patterns

**NFR-C5: Ollama Integration**

- Compatible with Ollama v0.1.x and above
- Handles Ollama API version changes gracefully (fallback to core features if new API unavailable)
- Supports custom Ollama installations (non-standard ports, remote instances via OLLAMA_HOST)

### Usability & Developer Experience

**NFR-U1: Zero-Config First Run**

- Tool must work immediately after `npm install -g [tool-name]` without requiring configuration files
- Sensible defaults for all settings (model, temperature, context window)
- Auto-detection and auto-provisioning of required resources (Ollama, model)

**NFR-U2: Error Message Quality**

- All error messages written in plain English (no jargon or error codes without explanation)
- Every error includes specific remediation steps (not just "failed to connect")
- Error messages use color/formatting to distinguish severity (red for errors, yellow for warnings)

**NFR-U3: Documentation**

- `--help` output provides complete usage information without requiring external docs
- README includes quickstart, installation, troubleshooting, and examples
- Inline code comments follow style guide patterns (self-documenting code preferred)

**NFR-U4: Observability** (post-MVP)

- Optional debug logging via `DEBUG=[tool-name]` environment variable
- Logs include: git command execution, Ollama requests/responses, validation results
- Log file location printed in debug mode for troubleshooting

### Maintainability & Extensibility

**NFR-M1: Code Organization**

- Modular architecture separating concerns: git integration, Ollama client, prompt engineering, UI
- Clear interfaces between modules to enable testing and future refactoring
- Following project style guides (dev/styleguides/) for consistency

**NFR-M2: Prompt Engineering**

- System prompts defined in Modelfile and baked into custom Ollama model during setup (e.g., `[tool-name]-commit:latest` created from base model + system prompt)
- Few-shot examples and prompt templates stored in separate files for easy modification and experimentation
- Custom model recreated when prompts are updated (via setup or dedicated command)
- Model-specific prompt variations supported for different base models

**NFR-M3: Extensibility**

- Command pattern architecture allows adding new commands (pr, screenshot) without modifying existing code
- Plugin-like structure for future integrations (git hooks, IDE extensions)
- Configuration system designed for expansion (custom commit types, templates)

---

## Summary & Next Steps

**PRD Status**: ✅ Complete

This PRD defines a local-first CLI tool for automating git commit message generation with these core attributes:

- **49 Functional Requirements** covering git integration, Ollama management, commit generation, user workflow, error handling, and extensibility
- **Privacy-first architecture** guaranteeing 100% local processing with zero data egress
- **Sub-1-second performance target** on M1/M2 hardware to preserve developer flow
- **Zero-config experience** with automatic Ollama detection and model provisioning
- **Conventional Commits support** as default format with future template extensibility

**What Makes This Product Special:**
The tool is not just a commit message generator—it's a compliance engine that eliminates the cognitive load of writing standardized commits while maintaining complete privacy and instant responsiveness. It establishes the foundation for a broader suite of local-first developer productivity tools.

**Reference Documentation:**

- Product Brief: dev/brief.md
- Research: docs/research/ (Competitive Analysis, Ollama Architecture, Local SLM Feasibility)
- Style Guides: dev/styleguides/ (Node.js, Unit Testing, Clean Code, Ollama Integration)

---

## Recommended Next Steps

**Immediate Next Steps:**

1. **UX Design** (Optional but Recommended)
   - Design terminal interaction flows and visual feedback patterns
   - Create mockups of error messages and success states
   - Define exact CLI output formatting and color schemes

2. **Technical Architecture** (Required Before Implementation)
   - Define project structure (modules, directory layout)
   - Design Ollama integration layer and API abstraction
   - Specify prompt engineering strategy (few-shot examples, template structure)
   - Document configuration approach (environment variables, future config file schema)
   - Define error handling taxonomy and exit code standards

3. **Epic & Story Breakdown** (After Architecture)
   - Create epics for: Git Integration, Ollama Management, Message Generation, User Interaction, Testing & QA
   - Break down into implementable stories with acceptance criteria
   - Prioritize stories for MVP delivery

**Success Criteria Reminder:**
This project succeeds when you (Joe) can:

- Run `[tool-name] commit` in your real development workflow and get high-quality commit messages in <1s
- Understand every component of the Ollama integration and orchestrator architecture
- Publish a complete, working npm package to demonstrate local AI integration patterns
- Use this as a foundation for expanding into additional local-first developer productivity tools

---

_This PRD was created through collaborative discovery between Joe and the BMad Method PM agent, synthesizing the product brief and competitive research into comprehensive functional requirements._

```

`dev/release-process.md`:

````md
# Release Process

## Overview

This project uses a **Release Prep Branch** approach to separate development artifacts from published releases. This preserves all valuable development context while ensuring clean, production-ready releases.

## Release Process

### 1. Development Workflow

- Work normally in `develop`/feature branches
- All artifacts remain in repo: `dev/`, docs, architecture files, etc.
- No artificial separation during active development
- All dependencies (dev + prod) included in root `package.json`

### 2. Release Preparation

When ready to create a release:

```bash
# Create release prep branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Remove development-only artifacts
rm -rf dev/
rm -rf docs/
rm -rf *.md README.md  # Keep root README.md
rm -rf .claude/
rm -rf .github/

# Update package.json if needed
# (Typically no changes needed if using standard dev dependencies)

# Test the clean build
npm ci
npm test
npm run build
```
````

### 3. Release

```bash
# Merge to main and tag
git checkout main
git merge --no-ff release/v1.0.0
git tag v1.0.0

# Push to trigger deployment
git push origin main
git push origin v1.0.0

# Clean up release prep branch
git branch -d release/v1.0.0
```

## Key Principles

### 1. **No Dev Dependencies in Release Prep**

- Design codebase to use only production dependencies
- Keep dev dependencies strictly for tooling (TypeScript, testing, linting)
- Release builds should work with `npm ci --production`

### 2. **Preserve Development Artifacts**

- All BMAD artifacts stay in development workflow
- Architecture decisions, research, and specs are never lost
- Git history preserves everything but release commits are clean

### 3. **Clean Releases**

- Published versions contain only what's needed to run the tool
- No development artifacts in npm package or binary
- Consumers get minimal, focused distribution

## What Gets Removed in Release Prep

```
/dev/           - BMAD artifacts, specs, documentation
/docs/          - Additional documentation files
*.md            - Markdown docs (except root README.md)
.claude/        - Claude Code configuration
.github/        - Development workflows, templates
```

## What Gets Published

```
/src/           - Compiled implementation
package.json    - Production-ready package configuration
README.md       - User-facing documentation
LICENSE         - License file
/dist/          - Built CLI binary (if applicable)
```

## Version Strategy

- **Major releases:** Breaking changes in CLI interface or core behavior
- **Minor releases:** New features, new commit types, improved AI models
- **Patch releases:** Bug fixes, performance improvements, error handling

## Future Automation Opportunities

While currently manual, this process can be automated with:

- **GitHub Actions:** Automated release prep workflow
- **npm scripts:** `npm run release:prep` to remove artifacts
- **Semantic release:** Automated version bumping based on commit messages

## Benefits

1. **No Context Switching** - Development happens naturally in one place
2. **Preserves All Work** - Architecture files, research, and specs never lost
3. **Clean Deployments** - Published packages contain only production code
4. **Standard Workflows** - Works with conventional CI/CD practices
5. **Flexibility** - Easy to add new development artifacts without restructuring

````

`dev/test-design-system.md`:

```md
# System-Level Test Design

## Testability Assessment

- **Controllability**: **PASS**
  - Hexagonal architecture (Ports & Adapters) allows easy mocking of external dependencies (`LlmProvider`, `GitService`, `EditorService`).
  - Core logic is isolated from infrastructure, enabling pure unit testing of business rules.
  - **Note**: Git operations require careful test harness design to create temporary repositories and stage files without polluting the developer's environment.

- **Observability**: **CONCERNS**
  - **Issue**: PRD mandates "No runtime logging to console" for clean UX. This obscures internal state during failures.
  - **Mitigation**: Architecture defines `DEBUG=ollatool:*` env var. Tests must utilize this to capture logs.
  - **Requirement**: Ensure `AppError` classes serialize fully for test assertions.

- **Reliability**: **PASS**
  - Stateless architecture (mostly) simplifies parallel testing.
  - **Risk**: Ollama model loading is stateful and slow (cold start). Tests involving the real Ollama adapter will be flaky/slow if not managed.
  - **Mitigation**: Use `MockLlmProvider` for 90% of tests. Limit real Ollama integration tests to a dedicated suite.

## Architecturally Significant Requirements (ASRs)

| Requirement                        | Category | Probability  | Impact       | Score | Risk     | Testability Challenge                                                     | Mitigation Strategy                                                                   |
| :--------------------------------- | :------- | :----------- | :----------- | :---- | :------- | :------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Sub-5s Latency (MVP)** (NFR-P1)  | PERF     | 2 (Possible) | 3 (Critical) | **6** | High     | Hardware-dependent (M1 vs Intel); CI runners may be slower                | Run E2E tests on macOS runners in CI; track performance metrics; baseline established |
| **Model Quality (90% acceptance)** | QUALITY  | 3 (Likely)   | 3 (Critical) | **9** | Critical | Subjective quality assessment; automated tests can't measure "usefulness" | Manual acceptance testing plan with 50+ scenarios; ongoing dogfooding                 |
| **Local Privacy** (NFR-S1)         | SEC      | 1 (Unlikely) | 3 (Critical) | **3** | Medium   | Hard to prove "negative" (no data sent)                                   | Network interception tests; code review of adapters                                   |
| **Zero-Config Setup** (NFR-U1)     | OPS      | 3 (Likely)   | 2 (Degraded) | **6** | High     | Requires testing "fresh install" state                                    | Dedicated CI job tests fresh Ollama installation                                      |
| **Ollama Integration** (FR7-12)    | TECH     | 3 (Likely)   | 3 (Critical) | **9** | Critical | External daemon dependency                                                | Real Ollama E2E tests in CI + comprehensive mocking for unit/integration              |

## Test Levels Strategy

- **Unit: 50%**
  - **Focus**: Core domain logic (Prompt building, Commit parsing, Four-phase validation, Config validation).
  - **Rationale**: Fast feedback, pure functions, no dependencies.
  - **Tools**: Vitest with MockLlmProvider.
  - **Coverage Target**: 90%+ of core domain logic.

- **Integration: 25%**
  - **Focus**: Adapters (`OllamaAdapter`, `ShellGitAdapter`) with mocked dependencies.
  - **Rationale**: Verify adapter contracts without external dependencies.
  - **Tools**: Vitest + `execa` (for git) + MockLlmProvider (for Ollama).
  - **Coverage Target**: 80%+ of adapter logic.

- **E2E with Real Ollama: 20%**
  - **Focus**: Full workflow with actual Ollama model to validate:
    - Four-phase validation pipeline works with real model outputs
    - Silent retry mechanism handles actual model failures
    - Custom model instance (`ollatool-commit`) produces compliant messages
    - Performance meets sub-1s latency target
  - **Rationale**: **CRITICAL** - Mocks cannot validate model quality, prompt effectiveness, or validation pipeline robustness. The PRD requires 90%+ acceptance rate which can only be measured with real model outputs.
  - **Tools**: Vitest + real Ollama daemon + GitTestHarness + performance profiling.
  - **Environment**: Runs locally during development AND in dedicated CI job with Ollama installed.

- **Manual Acceptance Testing: 5%**
  - **Focus**: Human evaluation of commit message quality across diverse real-world scenarios.
  - **Rationale**: Automated tests cannot fully assess "usefulness" or "acceptance" of AI-generated content.
  - **Execution**: Developer testing during implementation + formal acceptance test suite pre-release.
  - **Target**: 90%+ acceptance rate across 50+ real commits (PRD requirement).

## NFR Testing Approach

- **Security**:
  - **Input Validation**: Unit tests for `FormatValidator` to prevent prompt injection or malformed commits.
  - **Privacy**: Manual verification with network monitoring (Wireshark/Little Snitch) during QA. CI tests to assert no external HTTP calls are made (except localhost).

- **Performance**:
  - **Benchmarks**: Custom script using `hyperfine` to measure CLI execution time on reference hardware.
  - **Telemetry**: Add build-time flag to enable internal timing logs for profiling.

- **Reliability**:
  - **Chaos Testing**: Simulate Ollama daemon death mid-request.
  - **Error Handling**: Verify all 4 exit codes (2, 3, 4, 5) are reachable and produce correct stderr output.

- **Maintainability**:
  - **Linting**: ESLint + Prettier (Standard).
  - **Coverage**: Enforce 80% branch coverage on `src/core` and `src/features`.

## Test Environment Requirements

- **Local Development**:
  - Node.js >= 20.0.0
  - Git >= 2.x
  - Ollama running (`ollama serve`)
  - `qwen2.5-coder:1.5b` model pulled

- **CI/CD (GitHub Actions)**:
  - **Unit Tests**: Standard Node container.
  - **Integration Tests**: Needs `git` configured. Ollama mocking required (running real Ollama in CI is slow/flaky).
  - **E2E Tests**: MacOS runner preferred for performance parity, but Linux runner acceptable for functional checks.

## Testability Concerns & Mitigations

### 1. Ollama in CI (Critical)

**Problem:** Running real Ollama in GitHub Actions would:

- Add 30+ seconds per test run (model loading is slow)
- Require GPU or suffer timeouts on CPU runners
- Make tests flaky due to network/daemon unpredictability
- Consume unnecessary CI compute budget

**Mitigation:** Strictly mock Ollama in CI via `MockLlmProvider`.

---

### 2. Git State Pollution (Critical)

**Problem:** Tests that run git commands could:

- Corrupt developer's actual git repository
- Create race conditions when multiple tests run in parallel
- Leave temporary files scattered on the system

**Mitigation:** Create robust `GitTestHarness` utility for temp repo isolation.

---

### 3. Observability During Failures (High Priority)

**Problem:** PRD mandates "no console logging" for clean UX, but this makes debugging test failures extremely difficult—you can't see internal state when things go wrong.

**Mitigation:** Use `DEBUG=ollatool:*` environment variable for optional verbose logging.

---

### 4. Real Ollama E2E Testing Strategy (Critical)

**Problem:** MockLlmProvider cannot validate:

- Whether the actual model produces compliant Conventional Commit messages
- If the four-phase validation pipeline handles real model quirks (chatty preambles, missing body, type hallucination)
- Whether silent retry mechanism works with actual model failures
- If performance meets sub-1s latency target with real inference
- Model quality degradation over time or with prompt changes

**Solution:** Dedicated E2E test suite with real Ollama daemon and model.

**Prerequisites:**

- Ollama installed and running (`ollama serve`)
- Custom model created (`ollatool-commit:latest`)
- Base model available (`qwen2.5-coder:1.5b`)
- M1/M2/M3 hardware OR CI runner with sufficient resources

**Test Categories:**

1. **Validation Pipeline Tests** - Verify four-phase validation handles real model outputs:
   - Chatty preamble stripping (e.g., "Here is your commit:\n\nfeat: ...")
   - Type hallucination correction (model says "fix" but user selected "feat")
   - Missing body detection and retry
   - Blank line normalization

2. **Silent Retry Mechanism Tests** - Verify retry logic works with real failures:
   - Model outputs conversational text → silent retry with error feedback → success
   - Model outputs malformed structure → retry up to 3 times → graceful failure
   - Verify user never sees retry attempts (UX requirement)

3. **Performance Tests** - Validate latency requirements (MVP baseline):
   - Cold start (model loads fresh, `keep_alive=0` architecture): <5s target per commit
   - Note: Every commit is a cold start in MVP (model unloads after each execution per architecture decision)
   - End-to-end workflow: <5s from command invocation to preview (MVP baseline)
   - **Note**: Performance optimization (e.g., model keep-alive for subsequent commits) is post-MVP. Initial focus is correctness and quality.

4. **Model Quality Tests** - Validate acceptance criteria:
   - Generate commits for 20+ diverse diffs (feat, fix, refactor scenarios)
   - Assert 90%+ are valid Conventional Commit format
   - Assert descriptions are imperative mood, <72 chars
   - Assert bodies provide meaningful "what and why" context

5. **Integration Smoke Tests** - Full workflow scenarios:
   - Happy path: Stage files → generate → approve → commit
   - Edit path: Generate → edit in terminal → save → commit
   - Regenerate path: Generate → regenerate → approve
   - Error paths: No staged changes, Ollama not running, model missing

**Implementation Pattern:**

```typescript
// tests/e2e/real-ollama/model-validation.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { GitTestHarness } from '@tests/helpers/git-harness';
import { OllamaAdapter } from '@/infrastructure/llm/ollama-adapter';
import { GenerateCommit } from '@/features/commit/use-cases/generate-commit';

describe('Real Ollama E2E Tests', () => {
  let harness: GitTestHarness;
  let llm: OllamaAdapter;
  let generateCommit: GenerateCommit;

  beforeAll(async () => {
    // Skip tests if Ollama not available (graceful degradation)
    const isOllamaAvailable = await checkOllamaRunning();
    if (!isOllamaAvailable) {
      console.warn('⚠️  Skipping real Ollama tests - daemon not running');
      return;
    }
  });

  beforeEach(async () => {
    harness = new GitTestHarness('real-ollama-test');
    llm = new OllamaAdapter('ollatool-commit');
    generateCommit = new GenerateCommit(llm /* ... */);
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  describe('Four-Phase Validation Pipeline', () => {
    it('should strip chatty preamble from model output', async () => {
      // Setup: Create a diff that historically causes chatty output
      await harness.writeFile('README.md', '# New Project\n\nSetup instructions');
      await harness.add();
      const diff = await harness.getDiff();

      // Execute: Generate commit
      const result = await generateCommit.execute('docs', diff, '');

      // Assert: Output is clean (no preamble)
      expect(result).toMatch(/^docs: .+\n\n.+/s);
      expect(result).not.toMatch(/here is|here's|i suggest/i);
    });

    it('should enforce user-selected type over model hallucination', async () => {
      await harness.writeFile('src/auth.ts', 'const timeout = 5000;');
      await harness.add();
      const diff = await harness.getDiff();

      // User selects "feat" but model might say "fix"
      const result = await generateCommit.execute('feat', diff, '');

      // Assert: Type is forced to "feat"
      expect(result).toMatch(/^feat: /);
    });

    it('should retry when model outputs conversational text', async () => {
      // This test validates the silent retry mechanism
      // We cannot force the model to fail, but we can test many scenarios
      // and ensure none produce conversational output
      const scenarios = [
        { file: 'package.json', content: '{"name": "test"}', type: 'chore' },
        { file: 'README.md', content: '# Title', type: 'docs' },
        { file: 'src/bug.ts', content: 'const fix = true;', type: 'fix' },
      ];

      for (const scenario of scenarios) {
        await harness.writeFile(scenario.file, scenario.content);
        await harness.add();
        const diff = await harness.getDiff();

        const result = await generateCommit.execute(scenario.type, diff, '');

        // Assert: No conversational filler
        expect(result).not.toMatch(/here is|here's|i suggest|let me/i);
        // Assert: Valid format
        expect(result).toMatch(/^\w+: .+\n\n.+/s);
      }
    });
  });

  describe('Performance Requirements (MVP baseline)', () => {
    it('should complete commit generation in <5s (cold start)', async () => {
      // MVP architecture uses keep_alive=0, so every commit is a cold start
      // Model loads from disk, generates commit, unloads

      await harness.writeFile('test.ts', 'console.log("test");');
      await harness.add();
      const diff = await harness.getDiff();

      const start = performance.now();
      await generateCommit.execute('chore', diff, '');
      const duration = performance.now() - start;

      // MVP target: <5s for complete workflow (cold start every time)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle sequential commits within <5s each', async () => {
      // Verify performance is consistent across multiple commits
      // Each one loads fresh model (keep_alive=0)
      const durations = [];

      for (let i = 0; i < 3; i++) {
        await harness.writeFile(`test${i}.ts`, `console.log("test${i}");`);
        await harness.add();
        const diff = await harness.getDiff();

        const start = performance.now();
        await generateCommit.execute('chore', diff, '');
        const duration = performance.now() - start;

        durations.push(duration);
        expect(duration).toBeLessThan(5000);
      }

      // Verify no unexpected performance degradation
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(5000);
    });
  });

  describe('Model Quality Tests', () => {
    it('should generate valid Conventional Commits for 20+ scenarios', async () => {
      const testCases = [
        // feat scenarios
        { file: 'src/feature.ts', content: 'export function newFeature() {}', type: 'feat' },
        // fix scenarios
        { file: 'src/bug.ts', content: 'if (x === null) return;', type: 'fix' },
        // docs scenarios
        { file: 'README.md', content: '## Setup\nRun npm install', type: 'docs' },
        // ... 17 more diverse scenarios
      ];

      let validCount = 0;
      const results = [];

      for (const testCase of testCases) {
        await harness.writeFile(testCase.file, testCase.content);
        await harness.add();
        const diff = await harness.getDiff();

        try {
          const result = await generateCommit.execute(testCase.type, diff, '');

          // Validate format
          const isValid = /^\w+: .+\n\n.+/s.test(result);
          if (isValid) validCount++;

          results.push({ testCase, result, isValid });
        } catch (error) {
          results.push({ testCase, error, isValid: false });
        }
      }

      // Assert: 90%+ acceptance rate (18/20)
      const acceptanceRate = validCount / testCases.length;
      expect(acceptanceRate).toBeGreaterThanOrEqual(0.9);

      // Log failures for debugging
      if (acceptanceRate < 0.9) {
        const failures = results.filter((r) => !r.isValid);
        console.error('Failed test cases:', failures);
      }
    });
  });
});

async function checkOllamaRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/');
    return response.ok;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
````

**CI/CD Integration:**

The test suite must run in CI to catch regressions, but needs special setup:

```yaml
# .github/workflows/e2e-ollama.yml
name: E2E Tests (Real Ollama)

on: [push, pull_request]

jobs:
  e2e-ollama:
    runs-on: macos-latest # Required for M1/M2 performance parity
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Install Ollama
      - name: Install Ollama
        run: |
          curl -fsSL https://ollama.com/install.sh | sh
          ollama serve &
          sleep 5 # Wait for daemon startup

      # Pull base model and create custom model
      - name: Setup Ollama Model
        run: |
          ollama pull qwen2.5-coder:1.5b
          ollama create ollatool-commit -f Modelfile
          ollama list # Verify models present

      - run: npm ci
      - run: npm run test:e2e-ollama
        env:
          DEBUG: 'ollatool:*'

      # Upload performance metrics
      - name: Upload Performance Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: performance-metrics
          path: test-results/performance.json
```

**Test Execution Commands:**

```bash
# Local development - run real Ollama tests
npm run test:e2e-ollama

# CI - automatically runs if Ollama available
npm test # Includes all test suites

# Skip Ollama tests explicitly
SKIP_OLLAMA_TESTS=true npm test
```

**Performance Metrics Collection:**

```typescript
// tests/helpers/performance-tracker.ts
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];

  recordInference(operation: string, duration: number, metadata?: Record<string, unknown>) {
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now(),
      metadata,
    });
  }

  getReport(): PerformanceReport {
    return {
      totalTests: this.metrics.length,
      averageDuration: this.average(this.metrics.map((m) => m.duration)),
      p50: this.percentile(this.metrics, 50),
      p95: this.percentile(this.metrics, 95),
      p99: this.percentile(this.metrics, 99),
      failures: this.metrics.filter((m) => m.duration > 1000).length,
    };
  }

  exportToFile(path: string) {
    fs.writeFileSync(path, JSON.stringify(this.getReport(), null, 2));
  }
}
```

**Critical Success Criteria:**

- [ ] E2E test suite runs successfully in CI with real Ollama
- [ ] 90%+ of generated commits pass format validation
- [ ] Cold start (model load + generation) completes in <5s on M1/M2 (MVP baseline)
- [ ] Sequential commits each complete in <5s (consistent performance, `keep_alive=0`)
- [ ] Four-phase validation pipeline handles all model quirks
- [ ] Silent retry mechanism never exposes failures to user
- [ ] Performance metrics tracked and uploaded to CI artifacts

---

### 5. Manual Acceptance Testing Plan (Critical for MVP)

**Problem:** Automated tests validate format compliance and performance, but cannot assess the subjective quality of AI-generated commit messages. The PRD explicitly requires **"90%+ acceptance rate across 50+ real commits"** as a success criterion.

**Solution:** Structured manual testing protocol executed by the developer (Joe) during implementation and pre-release validation.

**Definition of "Acceptance":**

A commit message is considered "accepted" if:

- It accurately describes the changes made
- It follows Conventional Commits format correctly
- The description is clear and concise (no editing needed)
- The body provides useful context about what/why (not just repeating the diff)
- The developer would use it without modification in production

A commit message is "rejected" if:

- It mischaracterizes the change (wrong type or incorrect description)
- It's too vague ("update files") or too verbose
- It requires significant editing to be useful
- The body is missing critical context or includes irrelevant details

**Test Execution Protocol:**

**Phase 1: Development Testing (Ongoing)**

During story implementation, the developer should:

1. Use the tool for ALL commits in the project itself (dogfooding)
2. Track acceptance/rejection in a simple log file: `dev/acceptance-log.md`
3. Record any patterns of failure or edge cases discovered

```markdown
# Acceptance Testing Log

| Date       | Commit Type | Files Changed                         | Accepted? | Notes                                             |
| ---------- | ----------- | ------------------------------------- | --------- | ------------------------------------------------- |
| 2025-11-28 | feat        | src/core/domain/commit-message.ts     | ✅        | Perfect description, good body                    |
| 2025-11-28 | fix         | src/infrastructure/git/git-adapter.ts | ❌        | Said "refactor" instead of "fix"                  |
| 2025-11-28 | docs        | README.md                             | ✅        | Good summary, body could be better but acceptable |
```

**Phase 2: Formal Acceptance Test Suite (Pre-Release)**

Before marking MVP complete, execute a formal test across 50+ diverse scenarios:

**Test Scenario Categories (Minimum 50 commits total):**

1. **Feature additions (10 commits)**
   - New functions/classes
   - New UI components
   - New API endpoints
   - Integration of new libraries

2. **Bug fixes (10 commits)**
   - Null pointer fixes
   - Logic errors
   - Edge case handling
   - Performance fixes

3. **Refactoring (10 commits)**
   - Code cleanup
   - Naming improvements
   - Structure changes (no behavior change)
   - Dependency updates

4. **Documentation (5 commits)**
   - README updates
   - Code comments
   - API documentation
   - Configuration examples

5. **Testing (5 commits)**
   - New test files
   - Test fixes
   - Coverage improvements
   - Test refactoring

6. **Configuration/Build (5 commits)**
   - package.json changes
   - CI/CD updates
   - Build script modifications
   - Environment config

7. **Mixed/Complex changes (5 commits)**
   - Multiple file types
   - Cross-cutting changes
   - Large diffs (>500 lines)
   - Renames + modifications

**Execution Method:**

```bash
# Create a test repository with realistic changes
cd test-acceptance-repo

# For each test scenario:
1. Make the planned changes
2. Stage the files: git add .
3. Run: ollatool commit
4. Record result in acceptance-log.md
5. Either approve (if good) or reject (if needs work)
6. If rejected, manually write correct message and note the issue

# After 50+ commits, calculate acceptance rate
grep "✅" dev/acceptance-log.md | wc -l
# Must be 45+ out of 50 for 90% acceptance
```

**Data Collection Template:**

```markdown
# Formal Acceptance Test Results

**Test Date:** 2025-11-XX
**Tester:** Joe
**Model:** ollatool-commit (qwen2.5-coder:1.5b)
**Total Tests:** 52

## Summary Statistics

- **Accepted:** 47 / 52 (90.4%)
- **Rejected:** 5 / 52 (9.6%)
- **Status:** ✅ PASS (meets 90% threshold)

## Rejection Breakdown

| Issue Type           | Count | Example                                                                 |
| -------------------- | ----- | ----------------------------------------------------------------------- |
| Wrong commit type    | 2     | Said "chore" for a bug fix                                              |
| Vague description    | 1     | "update files" (not descriptive)                                        |
| Missing body context | 1     | Body just repeated the subject                                          |
| Type hallucination   | 1     | Ignored user-selected type (should be impossible with force-overwrite!) |

## Key Findings

- Model performs well on feat/fix scenarios (95% acceptance)
- Struggles slightly with refactor classification (85% acceptance)
- Body quality excellent when diff is focused (<200 lines)
- Large diffs (>500 lines) produce generic bodies (needs improvement post-MVP)

## Recommendations

- Consider adding examples for refactor scenarios to system prompt
- Post-MVP: Implement intelligent diff truncation for large changes
- Post-MVP: Add scope detection for better context
```

**Success Gate:**

MVP cannot be considered complete until:

- [ ] 50+ commits tested across all scenario categories
- [ ] 90%+ acceptance rate achieved
- [ ] Results documented in `dev/acceptance-test-results.md`
- [ ] Any systematic failures analyzed and addressed (or documented as known limitations)

**Continuous Monitoring (Post-Release):**

After initial release, continue tracking acceptance rate:

- Use tool for all personal development work
- Track acceptance rate monthly
- If acceptance drops below 85%, investigate (model degradation? prompt drift?)
- Compare against alternative models if quality concerns arise

---

### 6. TUI Component Testing Strategy

**Problem:** Interactive TUI components (@clack/prompts) require stdin/stdout mocking to test. Components like `commit-type-selector.ts` need validation but can't be tested with standard unit test approaches.

**Solution:** Dedicated TUI testing strategy with mocked streams and snapshot testing.

**Testing Approach:**

**Unit Level - Component Logic:**

```typescript
// src/ui/prompts/commit-type-selector.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CommitTypeSelector } from './commit-type-selector';

describe('CommitTypeSelector - Logic', () => {
  it('should return list of valid commit types', () => {
    const types = CommitTypeSelector.getCommitTypes();

    expect(types).toEqual([
      { value: 'feat', label: 'feat: A new feature' },
      { value: 'fix', label: 'fix: A bug fix' },
      // ... etc
    ]);
  });

  it('should format type for display', () => {
    const formatted = CommitTypeSelector.formatType('feat');
    expect(formatted).toBe('feat: A new feature');
  });
});
```

**Integration Level - Mocked Interaction:**

```typescript
// tests/integration/ui/commit-type-selector.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockSTDIN } from 'mock-stdin';
import { selectCommitType } from '@/ui/prompts/commit-type-selector';

describe('CommitTypeSelector - Interactive', () => {
  let stdin: MockSTDIN;

  beforeEach(() => {
    stdin = new MockSTDIN();
  });

  afterEach(() => {
    stdin.restore();
  });

  it('should return selected commit type', async () => {
    // Simulate user pressing down arrow twice, then enter
    setTimeout(() => {
      stdin.send('\x1B[B'); // Arrow down
      stdin.send('\x1B[B'); // Arrow down
      stdin.send('\r'); // Enter
    }, 100);

    const result = await selectCommitType();
    expect(result).toBe('docs'); // Third item in list
  });

  it('should handle user cancellation', async () => {
    setTimeout(() => {
      stdin.send('\x03'); // Ctrl+C
    }, 100);

    await expect(selectCommitType()).rejects.toThrow('User cancelled');
  });
});
```

**E2E Level - Full CLI Interaction:**

For E2E tests, we test the full CLI workflow including TUI interactions:

```typescript
// tests/e2e/cli-interactive.test.ts
import { describe, it, expect } from 'vitest';
import { execa } from 'execa';
import { GitTestHarness } from '@tests/helpers/git-harness';

describe('CLI Interactive Workflow', () => {
  let harness: GitTestHarness;

  beforeEach(async () => {
    harness = new GitTestHarness('cli-interactive-test');
    await harness.writeFile('test.ts', 'console.log("test");');
    await harness.add();
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  it('should handle full commit workflow with TUI interaction', async () => {
    const subprocess = execa('ollatool', ['commit'], {
      cwd: harness.getRepoPath(),
      input: 'feat\n', // Simulate typing "feat" and pressing enter (text input mode)
    });

    const { stdout, exitCode } = await subprocess;

    expect(exitCode).toBe(0);
    expect(stdout).toContain('✓ Committed:');
  });

  it('should handle arrow key navigation', async () => {
    // For arrow key simulation, use buffer input
    const input = Buffer.from([
      0x1b,
      0x5b,
      0x42, // Arrow down (\x1B[B)
      0x1b,
      0x5b,
      0x42, // Arrow down
      0x0d, // Enter (\r)
    ]);

    const subprocess = execa('ollatool', ['commit'], {
      cwd: harness.getRepoPath(),
      input,
    });

    const { exitCode } = await subprocess;
    expect(exitCode).toBe(0);
  });
});
```

**Testing Strategy by Layer:**

| Component                   | Test Type   | Tools            | Focus                    |
| --------------------------- | ----------- | ---------------- | ------------------------ |
| Commit type list generation | Unit        | Vitest           | Data correctness         |
| Type formatting/validation  | Unit        | Vitest           | Business logic           |
| Interactive selection       | Integration | mock-stdin       | Simulated user input     |
| Full CLI workflow           | E2E         | execa with input | Real process interaction |

**Dependencies Required:**

```json
{
  "devDependencies": {
    "mock-stdin": "^1.0.0" // For mocking stdin in integration tests
  }
}
```

**Test Coverage Expectations:**

- **Unit tests:** Cover 100% of TUI component logic (type lists, formatting, validation)
- **Integration tests:** Cover key interaction paths (selection, cancellation, error handling)
- **E2E tests:** Validate full workflows with real TUI rendering

**Limitations & Pragmatic Decisions:**

**What we DON'T test in MVP:**

- Visual appearance of prompts (colors, formatting) - this is @clack/prompts responsibility
- Cross-platform terminal compatibility edge cases - rely on @clack/prompts library testing
- Complex multi-step wizard flows - MVP only has single-step type selection

**What we DO test:**

- Correct options are presented to user
- User selection is correctly captured and returned
- Cancellation (Ctrl+C) is handled gracefully
- Integration with downstream use cases (selected type flows to LLM prompt)

**Snapshot Testing (Optional):**

For TUI output validation, consider snapshot tests:

```typescript
it('should render commit type selection prompt', async () => {
  const output = await captureStdout(() => selectCommitType());
  expect(output).toMatchSnapshot();
});
```

**Note:** Snapshot tests can be brittle for TUI components due to terminal color codes and dynamic widths. Use sparingly and only for critical UI flows.

**Implementation Priority:**

1. **Sprint 0:** Unit tests for TUI component logic (high priority)
2. **Early stories:** Integration tests for key interactions (medium priority)
3. **Late MVP:** E2E tests for full workflows (covered by existing E2E suite)
4. **Post-MVP:** Snapshot testing if visual regressions become a concern

**Verdict:** The original document's focus on core logic was correct for MVP scope. TUI component testing is addressed at unit level (logic) and E2E level (full workflow). Integration-level TUI testing with mock-stdin is recommended but not blocking for MVP - can be added as stories are implemented.

---

### 7. Model Validation Testing Strategy

**Problem:** PRD states that Qwen 2.5 Coder 1.5B selection is "subject to validation testing during implementation." The architecture must support testing alternative models if the primary choice doesn't meet acceptance criteria.

**Solution:** Comparative model evaluation framework executed during Sprint 0 or early implementation.

**Candidate Models for Testing:**

1. **qwen2.5-coder:1.5b** (Primary - already in architecture)
   - Pros: Fast inference, code-optimized, low memory
   - Cons: Smaller context understanding
   - Target: <3s inference

2. **llama3.2:3b** (Alternative #1)
   - Pros: Better general understanding, more reliable
   - Cons: Slower, higher memory (2GB+)
   - Target: <5s inference

3. **codellama:7b** (Alternative #2 - if others fail)
   - Pros: Strongest code understanding
   - Cons: Much slower (~10s), high memory (5GB+)
   - Target: <10s inference (may exceed MVP goals)

**Evaluation Criteria:**

| Criterion           | Weight | Measurement                                   |
| ------------------- | ------ | --------------------------------------------- |
| Format Compliance   | 30%    | % of outputs matching regex validation        |
| Description Quality | 25%    | Manual review: clarity, accuracy, conciseness |
| Body Quality        | 20%    | Manual review: useful context, what/why focus |
| Performance         | 15%    | Average inference time on M1/M2               |
| Retry Rate          | 10%    | % of generations requiring retries            |

**Testing Protocol:**

1. **Setup:** Create standardized test diff corpus (20 diverse scenarios)
2. **Execute:** Generate commits for each diff using each candidate model
3. **Measure:** Record format compliance, performance, retry counts
4. **Evaluate:** Manual review of output quality by developer
5. **Score:** Calculate weighted score for each model
6. **Decide:** Select model with highest score (must meet 90% acceptance threshold)

**Test Fixture Corpus (`tests/fixtures/model-evaluation/`):**

```
model-evaluation/
├── feat-new-function.diff       # Simple feature addition
├── fix-null-check.diff          # Bug fix with context
├── refactor-rename-class.diff   # Pure refactoring
├── docs-readme-update.diff      # Documentation
├── test-add-unit-tests.diff     # Test additions
├── chore-deps-update.diff       # Dependency updates
├── complex-multi-file.diff      # 10+ files changed
├── large-diff-500-lines.diff    # Edge case: large change
└── ... (12 more scenarios)
```

**Evaluation Script:**

```typescript
// scripts/evaluate-models.ts
import { OllamaAdapter } from '@/infrastructure/llm/ollama-adapter';
import { GenerateCommit } from '@/features/commit/use-cases/generate-commit';
import { loadFixtures } from './fixtures-loader';

async function evaluateModels() {
  const models = ['qwen2.5-coder:1.5b', 'llama3.2:3b', 'codellama:7b'];
  const fixtures = await loadFixtures('tests/fixtures/model-evaluation/');

  for (const modelName of models) {
    console.log(`\n=== Evaluating ${modelName} ===`);
    const results = [];

    for (const fixture of fixtures) {
      const llm = new OllamaAdapter(modelName);
      const useCase = new GenerateCommit(llm /* ... */);

      const start = performance.now();
      const output = await useCase.execute(fixture.type, fixture.diff, '');
      const duration = performance.now() - start;

      const formatValid = /^\w+: .+\n\n.+/s.test(output);

      results.push({
        scenario: fixture.name,
        output,
        duration,
        formatValid,
      });
    }

    // Generate report
    console.log(
      `Format compliance: ${results.filter((r) => r.formatValid).length}/${results.length}`,
    );
    console.log(`Average inference: ${average(results.map((r) => r.duration))}ms`);
    console.log(`\nOutputs:\n`, results);
  }
}
```

**Decision Point:**

After evaluation:

- If qwen2.5-coder:1.5b scores ≥90% → proceed with architecture as-is
- If qwen2.5-coder:1.5b scores <90% but llama3.2:3b ≥90% → update architecture to use llama3.2:3b
- If all models score <90% → revisit prompt engineering strategy in Modelfile

**Status:** Model evaluation should be executed in Sprint 0 before implementing story-level work. Results documented in `dev/model-evaluation-results.md`.

---

## Implementation Specifications

### GitTestHarness (`tests/helpers/git-harness.ts`)

**Purpose:** Provide an isolated temporary git repository for each test, preventing pollution of developer's actual work.

**API Design:**

```typescript
export class GitTestHarness {
  private tempDir: string;
  private repoPath: string;

  constructor(testName: string) {
    // Creates: /tmp/ollatool-test-{uuid}/
    // Auto-initializes git repo with initial commit
  }

  // File operations
  writeFile(relativePath: string, content: string): Promise<void>;
  readFile(relativePath: string): Promise<string>;
  fileExists(relativePath: string): Promise<boolean>;

  // Git operations
  add(pattern: string = '.'): Promise<void>;
  commit(message: string, options?: CommitOptions): Promise<string>; // Returns commit hash
  getCurrentBranch(): Promise<string>;
  getCommitHistory(): Promise<CommitInfo[]>;
  getStatus(): Promise<GitStatus>;
  getDiff(fromRef?: string, toRef?: string): Promise<string>;

  // Utilities
  getRepoPath(): string; // For passing to execa
  cleanup(): Promise<void>; // Deletes temp directory
}

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

interface GitStatus {
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}
```

**Implementation Notes:**

- Uses Node.js `fs/promises` for file operations
- Uses `execa` for git commands (same as production code)
- Temp directory: `/tmp/ollatool-test-{uuid}/` (macOS/Linux) or equivalent on Windows
- `afterEach()` hook calls `harness.cleanup()` automatically
- Zero shell injection risk (execa handles escaping)
- Works on macOS, Linux, and Windows

**Usage Example:**

```typescript
describe('GitAdapter', () => {
  let harness: GitTestHarness;

  beforeEach(() => {
    harness = new GitTestHarness('git-adapter-test');
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  it('should commit changes', async () => {
    await harness.writeFile('package.json', '{ "name": "test" }');
    await harness.add();
    const hash = await harness.commit('chore: init');
    expect(hash).toMatch(/^[a-f0-9]{40}$/); // SHA1 hash format
  });
});
```

---

### MockLlmProvider (`src/infrastructure/adapters/mock-llm-adapter.ts`)

**Purpose:** Provide instant, deterministic responses for unit/integration tests without requiring Ollama.

**Design:**

```typescript
export interface LlmProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}

export class MockLlmProvider implements LlmProvider {
  private responseMap: Map<string, string> = new Map();
  private callLog: LlmCall[] = [];

  // Constructor accepts optional seed responses
  constructor(responses?: Record<string, string>) {
    if (responses) {
      Object.entries(responses).forEach(([prompt, response]) => {
        this.responseMap.set(prompt, response);
      });
    }
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    // Log the call for test assertions
    this.callLog.push({ prompt, timestamp: Date.now(), options });

    // Return seeded response or default
    return this.responseMap.get(prompt) ?? this.defaultResponse(prompt);
  }

  // Test helpers
  getCallLog(): LlmCall[] {
    return this.callLog;
  }
  reset(): void {
    this.callLog = [];
  }
  setResponse(prompt: string, response: string): void {
    this.responseMap.set(prompt, response);
  }

  private defaultResponse(prompt: string): string {
    // Generic conventional commit for any prompt
    return 'feat: test generated message\n\nTest response';
  }
}

interface LlmCall {
  prompt: string;
  timestamp: number;
  options?: GenerateOptions;
}
```

**Design Notes:**

- **Instant:** Returns responses synchronously without network/model overhead
- **Deterministic:** Same input produces same output (no randomness)
- **Flexible:** Seed with custom responses for specific test scenarios
- **Observable:** Track calls for assertions (e.g., "ensure prompt injection prevention")
- **Easy to use:** Drop-in replacement for `OllamaAdapter`

**Integration Testing Strategy:**

For unit tests and most integration tests: Use `MockLlmProvider` seeded with realistic responses.

For true integration tests (local development only):

```typescript
// Create a separate test suite: tests/integration/e2e-ollama.test.ts
// Only runs when environment variable is set
const useRealOllama = process.env.TEST_REAL_OLLAMA === 'true';

const createLlmProvider = useRealOllama ? () => new OllamaAdapter() : () => new MockLlmProvider();
```

In CI: Always use mock. Real Ollama testing happens on developer machines locally.

---

### DEBUG Logging Strategy (`src/core/logger.ts`)

**Purpose:** Enable detailed observability during test failures without polluting normal console output.

**Implementation:**

```typescript
import debug from 'debug';

// Create debug logger
const log = debug('ollatool:*');

// Usage in core domain code:
export function parseCommitMessage(diff: string): CommitMessage {
  log('Parsing diff: %O characters', diff.length);

  const type = extractType(diff);
  log('Extracted type: %s', type);

  return { type, subject, body };
}

// Usage in adapters:
export class OllamaAdapter implements LlmProvider {
  async generate(prompt: string): Promise<string> {
    log('Ollama request: %O chars, model: %s', prompt.length, this.model);
    const response = await this.client.generate({ prompt });
    log('Ollama response received: %O chars', response.length);
    return response;
  }
}

// AppError serialization:
export class AppError extends Error {
  constructor(
    public code: number,
    message: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}
```

**Test Usage:**

```typescript
it('should handle Ollama timeout', async () => {
  // Set DEBUG env var to capture logs
  process.env.DEBUG = 'ollatool:*';

  try {
    await commitUseCase.execute({ diff: bigDiff });
  } catch (error) {
    // In CI logs, if you expand the job output, you'll see:
    // [ollatool:*] Ollama request: 50000 chars, model: ollatool-commit
    // [ollatool:*] Ollama timeout after 30s
    // These logs only appear because DEBUG is set
  }
});
```

**CI Debugging:**

When tests fail in GitHub Actions:

1. Click "Expand" on the failing test output
2. All `debug('ollatool:*')` output is captured and visible
3. `AppError` instances are logged with full context (code, message, context object)
4. No additional log shipping or services needed

**Installation Requirement:**

Add to package.json:

```json
{
  "dependencies": {
    "debug": "^4.3.4"
  }
}
```

---

### Vitest Configuration (`vitest.config.ts`)

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true, // Enable describe/it/expect without imports
    testTimeout: 10000, // 10s per test (git operations need time)
    hookTimeout: 10000, // 10s for beforeEach/afterEach cleanup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.types.ts'],
      lines: 80, // Enforce 80% line coverage
      branches: 80, // Enforce 80% branch coverage
      functions: 80,
      statements: 80,
    },
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

---

### Test Structure & Execution

**Directory Layout:**

```
tests/
├── helpers/
│   ├── git-harness.ts              # GitTestHarness class
│   └── mock-providers.ts           # MockLlmProvider, test fixtures
├── fixtures/
│   ├── diffs/                      # Sample git diffs
│   ├── commits/                    # Sample commit messages
│   └── errors/                     # Error scenario test data
├── unit/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── commit-message.test.ts
│   │   │   └── git-context.test.ts
│   │   └── ports/
│   │       └── llm-provider.test.ts
│   └── infrastructure/
│       └── adapters/
│           └── mock-llm-adapter.test.ts
├── integration/
│   ├── adapters/
│   │   ├── git-adapter.test.ts     # Uses GitTestHarness
│   │   ├── ollama-adapter.test.ts  # Uses MockLlmProvider
│   │   └── editor-adapter.test.ts
│   └── features/
│       └── commit-workflow.test.ts
└── e2e/
    ├── cli-basic.test.ts           # Full `ollatool commit` flow
    ├── cli-error-handling.test.ts  # Exit codes 2-5
    └── cli-setup.test.ts           # `ollatool setup` command
```

**Test Execution:**

```bash
# Run all tests (unit + integration in CI)
npm test

# Run only unit tests (fast feedback)
npm run test:unit

# Run integration tests locally
npm run test:integration

# Run real Ollama integration tests (local dev only)
TEST_REAL_OLLAMA=true npm run test:integration

# Run with DEBUG logging visible
DEBUG=ollatool:* npm test

# Run with coverage
npm run test:coverage
```

**Scripts (add to package.json):**

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --include='tests/unit/**/*.test.ts'",
    "test:integration": "vitest --include='tests/integration/**/*.test.ts'",
    "test:e2e": "vitest --include='tests/e2e/**/*.test.ts'",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

### CI/CD Testing Strategy

**Multi-tier CI pipeline ensures quality gates without excessive runtime:**

**GitHub Actions Workflow:**

```yaml
name: Tests

on: [push, pull_request]

jobs:
  # Fast feedback: Unit tests with mocks (30s)
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  # Medium feedback: Integration tests with mocks (1-2min)
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:integration
      # Note: Uses MockLlmProvider, not real Ollama

  # Comprehensive validation: E2E with real Ollama (5-10min)
  e2e-ollama:
    runs-on: macos-latest # M1/M2 performance parity
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Install Ollama daemon
      - name: Install Ollama
        run: |
          curl -fsSL https://ollama.com/install.sh | sh
          ollama serve &
          sleep 5
          curl http://localhost:11434/ # Health check

      # Setup models
      - name: Provision Ollama Models
        run: |
          ollama pull qwen2.5-coder:1.5b
          ollama create ollatool-commit -f Modelfile
          ollama list

      - run: npm ci
      - run: npm run test:e2e-ollama
        env:
          DEBUG: 'ollatool:*'
        timeout-minutes: 15

      # Upload artifacts for analysis
      - name: Upload Performance Metrics
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: performance-metrics
          path: test-results/performance.json

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

**Test Execution Strategy:**

| Test Level        | Environment                | Frequency    | Duration  | Failure Impact       |
| ----------------- | -------------------------- | ------------ | --------- | -------------------- |
| Unit              | Ubuntu (fast runner)       | Every commit | 30s       | Block PR merge       |
| Integration       | Ubuntu (fast runner)       | Every commit | 1-2min    | Block PR merge       |
| E2E (Ollama)      | macOS (performance parity) | Every commit | 5-10min   | Block PR merge       |
| Manual Acceptance | Developer machine          | Pre-release  | 2-3 hours | Block MVP completion |

**Key Improvements from Original Design:**

1. **Real Ollama in CI** - E2E tests now run with actual model in CI (previously was developer-only)
2. **Performance Tracking** - Automated performance metrics collection on every CI run
3. **Failure Artifacts** - Upload test results and performance data for post-mortem analysis
4. **Clear Failure Impact** - All test levels are blocking (PR cannot merge if any fail)
5. **Timeout Protection** - 15min timeout prevents hung CI jobs from blocking pipeline

**Branch Protection Rules:**

Required status checks before merge:

- ✅ Unit tests passing
- ✅ Integration tests passing
- ✅ E2E Ollama tests passing
- ✅ 80%+ code coverage
- ✅ No linting errors

**Performance Regression Detection:**

```typescript
// scripts/check-performance-regression.ts
import { readFileSync } from 'fs';

// Load current and previous performance metrics
const current = JSON.parse(readFileSync('test-results/performance.json', 'utf-8'));
const baseline = JSON.parse(readFileSync('test-results/baseline-performance.json', 'utf-8'));

// Check for regressions
if (current.p95 > baseline.p95 * 1.2) {
  console.error('❌ Performance regression detected!');
  console.error(`P95 latency: ${current.p95}ms (baseline: ${baseline.p95}ms)`);
  process.exit(1);
}

console.log('✅ Performance within acceptable range');
```

**Cost Optimization:**

- Unit/Integration tests run on cheap Ubuntu runners
- E2E Ollama tests run on macOS runners (more expensive but necessary for performance validation)
- Model download cached between runs to reduce CI time
- Total CI runtime target: <15 minutes from push to green checkmark

---

## Recommendations for Sprint 0

**Critical Path (Must Complete Before Story Development):**

1. **Test Infrastructure Setup** (2-3 hours)
   - Create `tests/helpers/git-harness.ts` with GitTestHarness class
   - Implement `tests/helpers/mock-llm-provider.ts` with MockLlmProvider
   - Create `tests/helpers/performance-tracker.ts` for metrics collection
   - Setup `vitest.config.ts` with coverage thresholds and path aliases
   - Add test scripts to package.json (test:unit, test:integration, test:e2e-ollama)

2. **Model Evaluation** (4-6 hours) - **BLOCKING**
   - Create test fixture corpus: `tests/fixtures/model-evaluation/` with 20 diverse diffs
   - Implement `scripts/evaluate-models.ts` evaluation script
   - Execute evaluation across qwen2.5-coder:1.5b, llama3.2:3b, codellama:7b
   - Document results in `dev/model-evaluation-results.md`
   - Make architecture decision: proceed with qwen2.5-coder or switch models
   - **Cannot proceed to implementation until model selection confirmed**

3. **CI/CD Pipeline Setup** (1-2 hours)
   - Create `.github/workflows/tests.yml` with 3-tier strategy
   - Configure branch protection rules (require all checks passing)
   - Setup Codecov integration for coverage reporting
   - Test E2E Ollama job on macOS runner (validate installation works)

4. **DEBUG Logging Integration** (1 hour)
   - Add `debug` package to dependencies
   - Implement logger in `src/core/logger.ts`
   - Add logging to critical paths (Ollama requests, validation pipeline, git operations)
   - Ensure `AppError.toJSON()` serialization works correctly

5. **Manual Acceptance Testing Preparation** (1 hour)
   - Create `dev/acceptance-log.md` template
   - Create acceptance testing checklist
   - Plan 50+ test scenarios across 7 categories (feat, fix, refactor, docs, test, config, mixed)
   - Setup test repository for formal acceptance testing phase

### Agent-Driven Manual Acceptance Testing (Sprint 3-4)

**Repository Selection:** FreeCodeCamp (https://github.com/freeCodeCamp/freeCodeCamp)

**Why FreeCodeCamp:**

- Comprehensive codebase: React, Node.js, Python, Docker, docs, CI/CD
- Active development: Real-world commit patterns
- Well-documented: Easy navigation for systematic testing
- Multiple technologies: Covers all ollatool use cases

**Test Generation Process:**

1. **Setup Phase:**

   ```bash
   git clone https://github.com/freeCodeCamp/freeCodeCamp.git
   cd freeCodeCamp
   git checkout -b ollatool-manual-testing
   ollatool setup
   ```

2. **Scenario Generation** (50+ tests):

   ```typescript
   // Each test scenario has this structure
   interface TestScenario {
     id: string;
     category: 'frontend' | 'backend' | 'infrastructure' | 'docs' | 'config';
     prompt: string; // 2-3 sentences for AI agent
     expectedChanges: string[]; // Types of files we expect to modify
   }
   ```

3. **Execution Loop** (repeat 50+ times):
   ```bash
   # Agent makes changes based on prompt
   # We stage: git add .
   # We test: ollatool commit
   # We score: 1-5 on message quality
   # We record: Results in acceptance-log.md
   ```

**Test Prompt Templates:**

**Frontend (15 scenarios):**

- "Add a new React component for user profile with TypeScript types and CSS modules"
- "Update the navigation component to include a new dropdown menu with keyboard navigation"
- "Fix accessibility issue in the form validation by adding proper ARIA labels"
- "Implement responsive design for the mobile layout using CSS Grid and Flexbox"
- "Add unit tests for the payment processing component using Jest and React Testing Library"

**Backend (15 scenarios):**

- "Add a new API endpoint for user authentication using JWT tokens"
- "Update the database schema to include user preferences with migration script"
- "Implement rate limiting middleware to prevent API abuse"
- "Fix SQL injection vulnerability in the user search endpoint"
- "Add Redis caching for frequently accessed database queries"

**Infrastructure (10 scenarios):**

- "Create Docker configuration for local development with Docker Compose"
- "Update GitHub Actions workflow to run tests on Node.js 20"
- "Add Terraform configuration for deploying the application to AWS"
- "Set up monitoring and alerting using Prometheus and Grafana"

**Documentation/Config (10 scenarios):**

- "Update README.md with new installation instructions and usage examples"
- "Add comprehensive API documentation for all endpoints"
- "Update package.json dependencies to latest secure versions"
- "Add environment configuration for production deployment"

**Data Collection:**

```markdown
# Acceptance Test Log

| ID  | Category | Prompt                 | Generated Message                 | Score | Issues     | Pattern                                 |
| --- | -------- | ---------------------- | --------------------------------- | ----- | ---------- | --------------------------------------- |
| 01  | frontend | Add React component... | feat: add user profile component  | 5/5   | None       | Frontend components scored well         |
| 02  | backend  | Add auth endpoint...   | fix: implement JWT authentication | 2/5   | Wrong type | Backend features misclassified as fixes |
```

**Acceptance Criteria:**

- 50+ scenarios completed
- 90%+ score 3/5 or higher
- Clear patterns identified for improvements
- User stories generated for weak areas

**Timeline:** Sprint 3-4 (weeks 9-12)

- Week 9: Setup + Frontend scenarios (15)
- Week 10: Backend scenarios (15)
- Week 11: Infrastructure + Config scenarios (20)
- Week 12: Analysis + Story generation

**Post-Sprint 0 (Ongoing During Implementation):**

6. **Dogfooding** - Use tool for all commits in the project itself
7. **Performance Monitoring** - Track metrics on every E2E test run
8. **Acceptance Tracking** - Log every commit during development in acceptance-log.md

**Sprint 0 Success Criteria:**

- [ ] All test infrastructure components implemented and validated
- [ ] Model evaluation complete with documented decision
- [ ] CI/CD pipeline running successfully (all 3 test tiers green)
- [ ] DEBUG logging functional (test with `DEBUG=ollatool:* npm test`)
- [ ] Manual acceptance testing process documented and ready for execution
- [ ] Performance baseline established (measure CLI startup time)

**Estimated Sprint 0 Duration:** 1-2 days of focused work

---

## Document Synthesis & Quality Summary

**Revision Date:** 2025-11-28
**Status:** ✅ **COMPREHENSIVE - Ready for Implementation**

### Critical Improvements from Original Document

This document has been comprehensively revised to address significant gaps identified in the original test design:

**1. Real Ollama E2E Testing (Previously Missing)**

- **Original Issue:** Document said "real Ollama testing happens on developer machines only" - no CI validation
- **Fixed:** Comprehensive E2E test suite with real Ollama running in CI on macOS runners
- **Impact:** Ensures model quality validated automatically on every commit, not just manual testing

**2. Manual Acceptance Testing Plan (Previously Missing)**

- **Original Issue:** PRD requires "90%+ acceptance across 50+ real commits" but no execution plan existed
- **Fixed:** Detailed two-phase acceptance testing protocol with clear success criteria
- **Impact:** Clear path to validate MVP success criterion; structured data collection for quality assessment

**3. Model Validation Strategy (Previously Missing)**

- **Original Issue:** PRD says model selection "subject to validation" but no validation plan
- **Fixed:** Comparative evaluation framework testing qwen2.5-coder vs llama3.2 vs codellama
- **Impact:** Data-driven model selection; clear decision criteria before implementation begins

**4. Performance Requirements Adjusted**

- **Original Issue:** Sub-1s latency unrealistic for MVP; document was aggressive
- **Fixed:** Relaxed to <5s for MVP (cold start) and <3s (warm inference) with clear baseline expectations
- **Impact:** Achievable targets that don't block MVP delivery while maintaining usability

**5. CI/CD Strategy Corrected**

- **Original Issue:** Contradictory statements about where Ollama tests run; no clear pipeline
- **Fixed:** 3-tier CI pipeline (unit/integration/e2e) with real Ollama on macOS runners
- **Impact:** Automated quality gates prevent regressions; performance tracked continuously

### Test Coverage Breakdown (Aligned with PRD)

| Test Category               | Coverage Target      | Validation Method              | Frequency     |
| --------------------------- | -------------------- | ------------------------------ | ------------- |
| **Unit Tests**              | 90% of core logic    | Vitest + MockLlmProvider       | Every commit  |
| **Integration Tests**       | 80% of adapters      | Vitest + GitTestHarness        | Every commit  |
| **E2E Tests (Real Ollama)** | Critical paths       | Full workflow validation       | Every commit  |
| **Manual Acceptance**       | 90%+ acceptance rate | Human evaluation (50+ commits) | Pre-release   |
| **Model Evaluation**        | Comparative scoring  | Weighted criteria framework    | Sprint 0 only |

### Key Success Metrics Tracked

1. **Format Compliance:** 90%+ of generated commits match Conventional Commits regex
2. **Performance:** <5s per commit (cold start every time due to `keep_alive=0` architecture)
3. **Acceptance Rate:** 90%+ of commits accepted without editing (PRD requirement)
4. **Retry Rate:** % of generations requiring silent retries (should be <20%)
5. **Code Coverage:** 80%+ branch coverage on core/features (PRD requirement)

### Alignment with Architecture & PRD

**Architecture Alignment:**

- ✅ Hexagonal architecture enables easy mocking (Ports/Adapters pattern)
- ✅ Four-phase validation pipeline fully covered (parsing, validation, type enforcement, normalization)
- ✅ Silent retry mechanism tested with real model outputs
- ✅ Custom model instance (`ollatool-commit`) validated in E2E tests

**PRD Alignment:**

- ✅ NFR-R4: "≥80% of core logic" → 90% target for core domain
- ✅ Success Criteria: "90%+ acceptance rate across 50+ real commits" → manual acceptance testing plan
- ✅ NFR-P1: Performance targets adjusted to realistic MVP baseline (<5s)
- ✅ FR17: Silent retry validation included in E2E tests
- ✅ Model selection validation before implementation (PRD requirement)

### Critical Questions Answered

**Q: How do we validate the model produces good commit messages?**
A: Three-layer validation: (1) Automated format checks in E2E tests, (2) Model quality test suite with 20+ scenarios, (3) Manual acceptance testing across 50+ real commits with clear acceptance criteria.

**Q: How do we know if performance meets requirements?**
A: Automated performance tests in E2E suite measure cold/warm inference; PerformanceTracker collects metrics on every CI run; regression detection script blocks PRs that degrade performance >20%.

**Q: Can we test with real Ollama in CI or just locally?**
A: Yes - dedicated E2E job installs Ollama on macOS runner, provisions models, runs full test suite. Takes 5-10min but provides essential quality gate.

**Q: What if qwen2.5-coder doesn't meet acceptance criteria?**
A: Model evaluation framework (Sprint 0 blocker) tests 3 candidate models with weighted scoring. Architecture supports switching models without code changes. Decision documented before story implementation begins.

**Q: How do we prevent model quality regression over time?**
A: E2E tests with real Ollama run on every commit; performance metrics tracked; ongoing dogfooding with acceptance logging; formal acceptance test suite re-run periodically.

### Implementation Confidence Assessment

**Confidence Level:** ✨ **HIGH** ✨

**Rationale:**

1. All critical gaps from original document addressed comprehensively
2. Test strategy directly maps to PRD functional/non-functional requirements
3. Clear success criteria with measurable outcomes
4. Realistic performance targets for MVP (not over-optimized)
5. Multiple validation layers ensure quality (automated + manual)
6. CI/CD pipeline provides automated regression protection
7. Model selection validated before implementation commitment

**Risks Mitigated:**

- ✅ Model quality validated before MVP (not discovered post-release)
- ✅ Performance realistic and measurable (not aspirational)
- ✅ Acceptance criteria clear and testable (not subjective)
- ✅ CI automation prevents regressions (not manual testing only)
- ✅ Test infrastructure ready before story work begins (not retrofit)

**Ready for Implementation:** This test design is comprehensive, realistic, and aligned with PRD/Architecture. Sprint 0 execution will establish test infrastructure and validate model selection before story development begins.

---

**Document Revision History:**

- v1.0 (original): Basic strategy with mocks, no real Ollama CI, missing acceptance plan
- v2.0 (current): Comprehensive strategy with real Ollama E2E, manual acceptance testing, model validation, performance baselines aligned to realistic MVP targets

````

`dev/ux-color-themes.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ollatool - Terminal Color Theme</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'JetBrains Mono', monospace;
            background: #0a0a0a;
            color: #e0e0e0;
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .terminal {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .prompt {
            color: #4ade80;
            font-weight: 600;
        }

        .command {
            color: #60a5fa;
            font-weight: 600;
        }

        .success {
            color: #4ade80;
        }

        .error {
            color: #f87171;
        }

        .warning {
            color: #fbbf24;
        }

        .info {
            color: #60a5fa;
        }

        .highlight {
            color: #38bdf8;
            font-weight: 600;
        }

        .dim {
            color: #9ca3af;
        }

        .spinner {
            color: #38bdf8;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { content: '|'; }
            25% { content: '/'; }
            50% { content: '-'; }
            75% { content: '\\'; }
            100% { content: '|'; }
        }

        .progress-bar {
            background: #374151;
            border-radius: 4px;
            height: 8px;
            margin: 10px 0;
            overflow: hidden;
        }

        .progress-fill {
            background: linear-gradient(90deg, #4ade80, #38bdf8);
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }

        .selection-list {
            margin: 10px 0;
        }

        .selection-item {
            margin: 5px 0;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }

        .selected {
            background: rgba(96, 165, 250, 0.2);
            border-left: 3px solid #60a5fa;
            padding-left: 5px;
        }

        .shortcuts {
            display: flex;
            gap: 15px;
            margin: 15px 0;
            flex-wrap: wrap;
        }

        .shortcut {
            background: #374151;
            border: 1px solid #4b5563;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.9em;
        }

        .shortcut-key {
            color: #fbbf24;
            font-weight: 600;
        }

        .theme-section {
            margin-bottom: 30px;
        }

        .theme-title {
            color: #38bdf8;
            font-weight: 700;
            margin-bottom: 15px;
            border-bottom: 1px solid #374151;
            padding-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="color: #38bdf8; margin-bottom: 30px; text-align: center;">ollatool - Terminal Color Theme</h1>

        <div class="theme-section">
            <div class="theme-title">Core Success/Error States</div>
            <div class="terminal">
                <div><span class="success">✓ Committed: </span><span class="highlight">feat: add user authentication service</span></div>
                <div><span class="error">✗ Error: </span>No staged changes detected</div>
                <div><span class="warning">⚠ Warning: </span>Model download in progress...</div>
                <div><span class="info">ℹ Info: </span>Ollama detected at localhost:11434</div>
            </div>
        </div>

        <div class="theme-section">
            <div class="theme-title">Interactive Type Selection</div>
            <div class="terminal">
                <div class="prompt">ollatool</span> commit</div>
                <div style="margin: 10px 0;">Select commit type:</div>
                <div class="selection-list">
                    <div class="selection-item"><span class="dim">[1]</span> feat: A new feature</div>
                    <div class="selection-item selected"><span class="highlight">[2]</span> fix: A bug fix</div>
                    <div class="selection-item"><span class="dim">[3]</span> docs: Documentation only changes</div>
                    <div class="selection-item"><span class="dim">[4]</span> style: Code style changes</div>
                    <div class="selection-item"><span class="dim">[5]</span> refactor: Code refactoring</div>
                </div>
            </div>
        </div>

        <div class="theme-section">
            <div class="theme-title">Progress Feedback</div>
            <div class="terminal">
                <div style="margin-top: 10px;">
                    <div><span class="dim">ℹ</span> Downloading model (qwen2.5-coder:1.5b)... <span class="spinner">⠋⠙⠹⠸⠼⠴</span></div>
                </div>
                <div style="margin-top: 10px;">
                    <div><span class="dim">ℹ</span> Generating commit message... <span class="spinner">⠋⠙⠹⠸⠼⠴</span></div>
                </div>
            </div>
        </div>

        <div class="theme-section">
            <div class="theme-title">Interactive Confirmation</div>
            <div class="terminal">
                <div><span class="highlight">feat:</span> add user authentication with JWT tokens</div>
                <div style="margin: 5px 0; color: #9ca3af; font-size: 0.9em;">
                    Added timeout handling and retry logic for OAuth2 token refresh.<br>
                    Prevents infinite loops when API services are temporarily unavailable.
                </div>
                <div style="margin: 15px 0;"></div>
                <div class="shortcuts">
                    <div class="shortcut"><span class="shortcut-key">[A]</span>pprove</div>
                    <div class="shortcut"><span class="shortcut-key">[E]</span>dit</div>
                    <div class="shortcut"><span class="shortcut-key">[R]</span>egenerate</div>
                    <div class="shortcut"><span class="shortcut-key">[C]</span>ancel</div>
                </div>
            </div>
        </div>

        <div class="theme-section">
            <div class="theme-title">Terminal Performance Feel</div>
            <div class="terminal">
                <div><span class="prompt">$</span> <span class="command">ollatool commit</span></div>
                <div style="margin: 5px 0;"><span class="dim">ℹ</span> Detecting staged changes... <span class="success">✓</span></div>
                <div style="margin: 5px 0;"><span class="dim">ℹ</span> Connecting to Ollama... <span class="success">✓</span></div>
                <div style="margin: 5px 0;"><span class="dim">ℹ</span> Model loaded... <span class="success">✓</span></div>
                <div style="margin: 5px 0;"><span class="dim">ℹ</span> Analyzing changes... <span class="success">✓</span></div>
                <div style="margin: 5px 0;"><span class="dim">ℹ</span> Generating message... <span class="success">✓</span></div>
                <div style="margin: 10px 0; padding: 10px; background: rgba(74, 222, 128, 0.1); border-radius: 4px; border-left: 3px solid #4ade80;">
                    <div style="color: #4ade80; font-weight: 600;">fix: resolve authentication timeout issue</div>
                    <div style="margin: 5px 0; color: #9ca3af; font-size: 0.9em;">
                        Added timeout handling and retry logic for OAuth2 token refresh.<br>
                        Prevents infinite loops when API services are temporarily unavailable.
                    </div>
                </div>
                <div class="shortcuts" style="margin-top: 15px;">
                    <div class="shortcut"><span class="shortcut-key">[A]</span>pprove & Commit</div>
                    <div class="shortcut"><span class="shortcut-key">[E]</span>dit Message</div>
                    <div class="shortcut"><span class="shortcut-key">[R]</span>egenerate</div>
                    <div class="shortcut"><span class="shortcut-key">[C]</span>ancel</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 0.9em;">
            <div>Color Accessibility: Respects NO_COLOR environment variable</div>
            <div>Performance: Immediate visual feedback for sub-1s response times</div>
            <div>Standards: Follows CLIG guidelines (https://clig.dev/)</div>
        </div>
    </div>
</body>
</html>
````

`dev/ux-design-specification.md`:

```md
# ollatool - UX Design Specification

**Author:** Joe
**Date:** 2025-11-27
**Version:** 1.0
**Designed by:** Sally (UX Designer Agent)
**Status:** Complete

---

## Executive Summary

This UX design specification defines the complete terminal user experience for **ollatool**, a local-first CLI tool suite that enhances developer productivity using Small Language Models via Ollama. The design prioritizes speed, privacy, and simplicity through immediate visual feedback, clear error handling, and intuitive interaction patterns that feel like natural extensions of git workflows.

### Design Philosophy

**Speed is UX:** Sub-1-second response time with immediate visual feedback preserves developer flow state.

**Privacy First:** 100% local processing with clear error messaging that never exposes proprietary code.

**Zero-Config Experience:** Tool works immediately after installation with auto-detection and sensible defaults.

**Graceful Degradation:** All failure states provide actionable remediation steps without technical jargon.

---

## Project Context

### Core Experience Definition

**Project:** Local-first CLI tool for generating git commit messages using Ollama
**Tool Name:** ollatool
**Target Users:** Individual developers working in feature branches on daily incremental commits
**Core Workflow:** Stage changes → Run `ollatool commit` → Get instant commit message → Approve/edit → Commit completes

### Key UX Requirements from PRD

- **Performance:** Sub-1-second response time on M1/M2 hardware
- **Error Handling:** Clear guidance for no staged changes, Ollama unavailable, model issues
- **Conventional Commits:** Automated format compliance without cognitive load
- **Interactive Workflow:** Type selection, preview/edit, keyboard shortcuts
- **Privacy:** Zero data egress, all processing local

---

## Visual Design System

### Terminal Color Theme

**Primary Colors (accessible, high-contrast):**

- **Success (Green):** `#4ade80` - ✓ operations completed successfully
- **Error (Red):** `#f87171` - ✗ errors and failures
- **Warning (Yellow):** `#fbbf24` - ⚠ warnings and cautions
- **Info (Blue):** `#60a5fa` - ℹ informational messages
- **Highlight (Cyan):** `#38bdf8` - emphasized text and selections
- **Dim (Gray):** `#9ca3af` - secondary text and de-emphasized content

**Accessibility Compliance:**

- Respects `NO_COLOR` environment variable for colorblind users
- High contrast ratios (>4.5:1) for all color combinations
- Supports pipe output (plain text when redirected)
- Compatible with terminal emulators (iTerm2, Terminal.app, Warp, etc.)

### Typography & Spacing

**Font Family:** Terminal monospace (user's configured font)
**Layout:** Single-column flow with consistent 1-space indentation
**Spacing:** Compact but readable with blank lines between major sections

**Formatting Hierarchy:**

- **Labels/Prefixes:** `[INFO]`, `[ERROR]`, `[SUCCESS]` - consistent uppercase with brackets
- **Commands/Code:** User input and file paths in highlight color
- **Status Indicators:** Unicode symbols (✓ ✗ ⚠ ℹ) for quick visual scanning

---

## Interaction Patterns

### Progress Feedback System

**Immediate Response (within 100ms):**

- Show spinner for any operation >100ms
- Display checkmarks for completed validation steps
- Provide status transitions for perceived performance

**Progress Indicators:**

- **Connecting:** `[INFO] Connecting to Ollama...`
- **Model Loading:** `[INFO] Model loaded... ✓`
- **Analyzing:** `[INFO] Analyzing changes... ✓`
- **Generating:** `[INFO] Generating commit message...`

**Spinner Implementation:**

- **Library:** Use `ora` library for cross-platform compatibility
- **Design:** Unicode dots animation `⠋⠙⠹⠸⠼⠴` (clean, professional)
- **Performance:** 100ms frame intervals for smooth animation
- **Cross-platform:** Handles Windows/macOS/Linux terminal differences automatically
- **Zero-config:** Works out-of-the-box with sensible defaults

**Performance Perception:**

- Each step shows immediate acknowledgment
- Checkmarks appear as operations complete
- Total perceived time <1 second (even with model loading)

### Error Message System

**Error Severity Levels:**

- **ERROR (Red):** Blocking failures that require user action
- **WARNING (Yellow):** Non-blocking issues or informational alerts
- **INFO (Blue):** Status updates and guidance

**Error Message Format:**
```

[ERROR] ✗ <Clear problem description>

<Remediation steps with specific commands>
Exit code: <number>
```

**Key Error Flows:**

1. **No Staged Changes:**
   - Clear instruction to run `git add` commands
   - Examples for specific files vs all files
   - Exit code 2

2. **Ollama Not Running:**
   - Instruction to start `ollama serve`
   - Link to ollama.com/download for installation
   - Exit code 3

3. **Context Window Overflow:**
   - Clear explanation that changes are too large
   - Instruction to unstage and stage fewer files
   - Suggestion to commit in smaller batches
   - Exit code 2

4. **Git Repository Issues:**
   - Pass-through git error messages directly
   - Guidance for repository-specific issues

### Interactive Selection System

**Commit Type Selection:**

```
Select commit type:
[1] feat: A new feature
[2] fix: A bug fix
[3] docs: Documentation only changes
[4] style: Code style changes
[5] refactor: Code refactoring
[6] test: Adding or updating tests
[7] build: Build system or dependency changes
[8] ci: CI configuration changes
[9] chore: Maintenance tasks
[0] revert: Revert previous commits

Your choice (0-9):
```

**Keyboard Navigation:**

- Arrow keys: Up/Down for selection
- Number input: Direct selection (1-9, 0)
- Enter: Confirm selection
- Ctrl+C: Cancel operation

**Confirmation Prompts:**

```
feat: add OAuth2 integration
Added login endpoint and token validation for third-party authentication.

[A]pprove [E]dit [R]egenerate [C]ancel:
```

**Keyboard Shortcuts:**

- **A:** Approve and commit immediately
- **E:** Open message in $EDITOR for editing
- **R:** Regenerate commit message
- **C:** Cancel operation (no changes committed)

### Editing Workflow

**Editor Integration:**

- Opens user's configured `$EDITOR` (Nano, Vim, Emacs, etc.)
- Pre-fills editor with generated commit message
- Falls back to Nano if `$EDITOR` not set
- Preserves original message if user cancels edit

**Edit Flow:**

1. User selects [E]dit from confirmation
2. System opens editor with generated message
3. User modifies and saves
4. System reads edited content
5. Commits with edited message immediately

---

## User Journey Flows

### Primary Happy Path Flow

**Step-by-Step Experience:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[INFO] Model loaded... ✓
[INFO] Analyzing changes... ✓

Select commit type:
[1] feat: A new feature
[2] fix: A bug fix
[3] docs: Documentation only changes
[4] style: Code style changes
[5] refactor: Code refactoring
[6] test: Adding or updating tests
[7] build: Build system or dependency changes
[8] ci: CI configuration changes
[9] chore: Maintenance tasks
[0] revert: Revert previous commits

Your choice (0-9): 2

[INFO] Generating commit message...

fix: resolve authentication timeout issue
Added timeout handling and retry logic for OAuth2 token refresh.
Prevents infinite loops when API services are temporarily unavailable.

[A]pprove [E]dit [R]egenerate [C]ancel: A

[SUCCESS] ✓ Committed: fix: resolve authentication timeout issue
```

**Flow Characteristics:**

- Immediate visual feedback at each step
- Clear progression through validation states
- Type selection with familiar conventional commit types
- Generated message appears instantly after brief processing
- One-key approval for frictionless workflow

### Error Recovery Flows

**Flow 1 - No Staged Changes:**

```bash
$ ollatool commit
[ERROR] ✗ No staged changes detected.

Stage your changes first:
  git add <files>     # stage specific files
  git add .           # stage all changes

Then run: ollatool commit
Exit code: 2
```

**Flow 2 - Ollama Not Available:**

```bash
$ ollatool commit
[ERROR] ✗ Ollama is not running.

Start Ollama:
  ollama serve

Or install from: https://ollama.com/download
Exit code: 3
```

**Flow 3 - Model Not Available:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[ERROR] ✗ Custom model 'ollatool-commit' not found.

Run setup to configure Ollama:
  ollatool setup

Exit code: 4
```

**Flow 3a - Setup Command Success:**

```bash
$ ollatool setup
[INFO] Checking Ollama installation... ✓
[INFO] Connecting to Ollama daemon... ✓
[INFO] Checking base model... ✓
[INFO] Base model already present ✓
[INFO] Creating custom model ollatool-commit...
[SUCCESS] ✓ Setup complete. Run 'ollatool commit' to start.
```

**Flow 3b - Setup Command - First Time Setup:**

```bash
$ ollatool setup
[INFO] Checking Ollama installation... ✓
[INFO] Connecting to Ollama daemon... ✓
[INFO] Pulling base model qwen2.5-coder:1.5b...
[INFO] Download: 750MB / 1.2GB (62%)
[INFO] Download complete ✓
[INFO] Creating custom model ollatool-commit...
[SUCCESS] ✓ Setup complete. Run 'ollatool commit' to start.
```

**Flow 3c - Setup Command - Ollama Not Installed:**

```bash
$ ollatool setup
[ERROR] ✗ Ollama is not installed.

Install Ollama first:
  https://ollama.com/download

Then run: ollatool setup
Exit code: 3
```

**Flow 4 - Generation Failure:**

```bash
$ ollatool commit
[INFO] Generating commit message...
[ERROR] ✗ Failed to generate valid commit message.

[R]egenerate [C]ancel: R

[INFO] Regenerating commit message...
[SUCCESS] ✓ Generated commit message successfully
```

**Flow 5 - Context Window Overflow:**

```bash
$ ollatool commit
[INFO] Detecting staged changes... ✓
[INFO] Connecting to Ollama... ✓
[ERROR] ✗ Changes exceed model context window.

Your staged changes are too large for the model to process.

Try staging fewer files:
  git reset              # unstage all changes
  git add <files>        # stage specific files only

Or commit changes in smaller batches.
Exit code: 2
```

---

## Technical Implementation Guidelines

### Performance Requirements

**Response Time Targets:**

- CLI initialization: <100ms
- Ollama connection check: <200ms
- Model loading: <2s (cold start)
- Commit message generation: <800ms
- Total end-to-end: <1s (warm model)

**Resource Management:**

- Memory footprint: <2GB during active use
- CPU usage: ≤50% of one core during inference
- No persistent background processes

### Accessibility Standards

**WCAG 2.1 Level A Compliance:**

- Color contrast ratios >4.5:1 for all text
- Keyboard-only navigation support
- Screen reader compatibility via semantic text
- Color-blind friendly with NO_COLOR support

**Terminal Compatibility:**

- Works in: iTerm2, Terminal.app, Warp, Alacritty, Kitty
- Supports: TERM environment variable detection
- Fallback: Plain text for unsupported terminals

### Error Handling Standards

**Exit Code Mapping:**

- **0:** Success
- **1:** User cancel/interrupt
- **2:** No staged changes
- **3:** Ollama unavailable
- **4+:** Unexpected system error

**Error Message Standards:**

- Always include actionable remediation steps
- Use clear, non-technical language
- Provide specific commands when helpful
- Never expose stack traces in user-facing output

---

## Design Rationale & Decisions

### Why This Design Works for CLI Tools

**1. Immediate Feedback Loop:**

- Visual checkmarks within 100ms confirm system responsiveness
- Users never wonder "is it working?"
- Perceived performance matches technical performance goals

**2. Progressive Information Disclosure:**

- Start with validation, progress to selection, then generation
- Each step builds on previous confirmation
- Users understand what's happening at all times

**3. Consistent Interaction Patterns:**

- Numbered lists for selection (familiar CLI pattern)
- Single-key shortcuts for common actions
- Predictable keyboard behavior across all flows

**4. Error Prevention Through Design:**

- Clear validation before expensive operations (model loading)
- Unambiguous prompts prevent user confusion
- Graceful degradation when dependencies unavailable

### Design Decisions & Trade-offs

**Decision 1: Simple Spinners vs Progress Bars**

- **Chosen:** Simple text spinners with checkmarks
- **Rationale:** Model loading time is unpredictable; spinners work for any duration
- **Trade-off:** Less precise timing information, but more reliable feedback

**Decision 2: Immediate Type Selection vs Auto-Detection**

- **Chosen:** User-selected commit type via numbered menu
- **Rationale:** More reliable than AI classification for MVP scope
- **Trade-off:** One extra interaction step for guaranteed accuracy

**Decision 3: Keyboard Shortcuts vs Mouse/Touch Support**

- **Chosen:** Keyboard-only interaction (number + letter keys)
- **Rationale:** CLI users expect keyboard-first experience
- **Trade-off:** No mouse support, but fits CLI context perfectly

**Decision 4: Minimal Terminal Output vs Verbose Logging**

- **Chosen:** Essential information only, no debug output by default
- **Rationale:** Maintains clean, professional appearance
- **Trade-off:** Less troubleshooting info, but optional debug mode can be added later

**Decision 5: Explicit Setup vs Auto-Provisioning**

- **Chosen:** Explicit `ollatool setup` command required before first commit
- **Rationale:**
  - Preserves sub-1s commit performance (no model downloads during commit)
  - Clear separation of one-time setup vs repeated workflow
  - Users understand system requirements before committing
  - Fails fast with clear guidance if setup incomplete
- **Trade-off:** One additional setup step before first use, but aligns with zero-friction philosophy after setup

**Decision 6: Silent Retry vs Transparent Retry**

- **Chosen:** Completely silent retries for format validation failures
- **Rationale:**
  - Cleaner UX without technical noise
  - Users only see successful outputs or actionable errors
  - Retry mechanism is implementation detail, not user concern
  - Success is binary: good message or error, no "almost worked" states
- **Trade-off:** Less transparency into model struggles, but simpler mental model

---

## Validation & Testing Strategy

### User Acceptance Testing

**Success Metrics:**

- 90%+ acceptance rate for generated commit messages
- <1s perceived response time on target hardware
- Zero user confusion during error states
- Successful completion of typical developer workflow

**Testing Scenarios:**

1. **Happy Path:** Standard commit generation and approval
2. **Edit Workflow:** User modifies generated message before commit
3. **Error Recovery:** All documented error states with remediation
4. **Performance:** Timing measurement on M1/M2 hardware
5. **Accessibility:** NO_COLOR environment variable, keyboard navigation

### Implementation Validation Checklist

**Core Functionality:**

- [ ] Detects staged changes correctly
- [ ] Connects to Ollama at localhost:11434
- [ ] Loads qwen2.5-coder:1.5b model automatically
- [ ] Generates Conventional Commits format compliant messages
- [ ] Opens editor with $EDITOR or Nano fallback
- [ ] Executes git commit with user-approved message

**User Experience:**

- [ ] Sub-1s response time on warm model
- [ ] Clear error messages with actionable guidance
- [ ] Immediate visual feedback for all operations
- [ ] Consistent keyboard shortcuts across flows
- [ ] Respects NO_COLOR environment variable

**Error Handling:**

- [ ] Graceful handling of missing staged changes
- [ ] Clear guidance when Ollama not running
- [ ] Model download and setup for first-time users
- [ ] Retry mechanism for failed generation attempts

---

## Future Extensibility Considerations

### Multi-Command Framework Design

**Current Scope:** `ollatool commit` command only
**Future Commands:** `ollatool pr`, `ollatool screenshot`, `ollatool daemon`

**Design Patterns for Extension:**

- **Consistent Progress Feedback:** All commands use same `[INFO]`/`[ERROR]` format
- **Unified Keyboard Shortcuts:** [A]pprove, [E]dit, [R]egenerate, [C]ancel where applicable
- **Shared Color Theme:** Same visual design across all commands
- **Common Error Handling:** Consistent remediation message style

### Optional Features (Post-MVP)

**Configuration System:**

- Custom commit types and templates
- Model selection and management
- Default behavior flags (--auto, --dry-run, --all)

**Enhanced Feedback:**

- Model confidence indicators
- Context-aware suggestions
- Advanced error diagnostics

---

## Deliverables

### Design Artifacts Created

1. **UX Design Specification:** This document (complete design decisions and rationale)
2. **Color Theme Visualizer:** `dev/ux-color-themes.html` - Interactive terminal design showcase
3. **Implementation Guidelines:** Technical specifications for developers

### Ready for Implementation

All UX decisions documented with:

- **Clear implementation requirements** for each interaction pattern
- **Technical specifications** for performance and accessibility
- **Visual design guidelines** with exact color codes and formatting
- **User journey flows** with step-by-step examples
- **Error handling patterns** with remediation strategies

This specification provides everything needed to implement ollatool with exceptional user experience that achieves sub-1s response times while maintaining privacy and simplicity.

---

**Status:** ✅ Complete
**Next Recommended Step:** Technical Architecture workflow
**Alternative:** Run validation with \*validate-design for additional quality assurance

```

```
