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

**ENTERPRISE-GRADE CODE VALIDATION: Context7 MCP Integration**

**CRITICAL:** Context7 MCP server is available and MUST be used for enterprise-grade code quality validation, particularly starting with Epic 2 implementation. Context7 provides up-to-date documentation and best practices for all Node.js libraries and frameworks used in this project.

**Context7 Usage Requirements:**

1. **Library Integration Validation** - Before implementing any new library or framework, agents MUST:
   - Use `mcp__context7__resolve-library-id` to locate the authoritative documentation
   - Retrieve latest best practices via `mcp__context7__get-library-docs`
   - Validate implementation patterns against current industry standards

2. **Code Quality Assurance** - Context7 MCP serves as the authoritative source for:
   - Node.js best practices and coding standards
   - Library-specific implementation patterns
   - Framework usage guidelines (Commander.js, Vitest, TypeScript, etc.)
   - Security and performance optimization patterns

3. **Epic 2+ Implementation** - Starting Epic 2, all agents MUST:
   - Cross-reference implementation decisions with Context7 documentation
   - Validate code patterns against library-specific best practices
   - Use Context7 for architectural decision validation

**Available Context7 Libraries for This Project:**

- `/goldbergyoni/nodebestpractices` - Node.js coding standards (80.2 benchmark score)
- `/nodejs/node` - Official Node.js API documentation
- `/websites/nodejs_api` - Complete Node.js API reference
- Library-specific docs for Commander.js, Vitest, TypeScript, Ollama SDK

**Integration Pattern:**

_Principles: KISS & YAGNI_

```typescript
// Before implementing with any library, agents MUST:
// 1. Resolve library: mcp__context7__resolve-library-id("library-name")
// 2. Get docs: mcp__context7__get-library-docs("/org/project", "mode", "topic")
// 3. Validate patterns against authoritative source
```

Key requirements enforced during implementation:

- **Function Size:** Maximum 15 lines per function
- **Argument Limits:** 0-2 arguments preferred, 3 acceptable for simple data passing
- **Class Member Ordering:** Constructor → Private Properties → Public Properties → Public Methods → Private Methods
- **DRY Principle:** No duplicated logic or error messages
- **Self-Documenting Code:** Comments for "why" only, not "what"
- **Context7 Validation:** All library usage validated against current best practices

---

## Implementation References

This architecture draws upon several comprehensive reference documents that provide detailed specifications for implementation:

### User Experience & Design

- **[UX Design Specification](./ux-design-specification.md)** - Complete terminal user experience, interaction patterns, error handling flows, and performance requirements
- **[Color Theme Visualizer](./ux-color-themes.html)** - Interactive terminal color scheme and visual design system

### Testing & Quality Assurance

- **[System-Level Test Design](./test-design-system.md)** - Comprehensive testing strategy including unit, integration, E2E, and manual acceptance testing protocols
- **[Unit Test Patterns](./styleguides/unit-test-patterns.md)** - Specific testing patterns and conventions for unit tests. For complete testing patterns including CLI-specific testing, async testing, and mock strategies, see **[dev/styleguides/unit-test-patterns.md](./styleguides/unit-test-patterns.md)** - MUST REVIEW when generating story contexts.

### Development Standards

- **[Clean Code Standards](./styleguides/clean-code.md)** - Complete coding standards, naming conventions, and implementation patterns. For complete coding standards, naming conventions, and architectural patterns, see **[dev/styleguides/clean-code.md](./styleguides/clean-code.md)** and **[dev/styleguides/index.md](./styleguides/index.md)** - MUST REVIEW when generating story contexts.
- **[Node.js CLI Setup Patterns](./styleguides/nodejs-cli-setup-patterns.md)** - Modern ESM, TypeScript, and CLI-specific tooling configurations. For CLI framework setup patterns, Commander.js configuration, and ESM integration, see **[dev/styleguides/nodejs-cli-setup-patterns.md](./styleguides/nodejs-cli-setup-patterns.md)** - MUST REVIEW when generating story contexts.

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
├── index.ts                        # Barrel file with shebang (NO logic - imports main.ts)
├── main.ts                         # Application bootstrap & DI composition root (contains CLI logic)
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
**Upgrade Path Requirement:** The setup command must implement version/hash checking of the Modelfile to ensure users can upgrade the `ollatool-commit` model when newer versions are released with improved system prompts

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
- Context7 MCP integration defined for code quality validation

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
