# Source Tree Analysis: devai-cli

## Project Structure Overview

**Repository Type:** Monolith (single cohesive codebase)
**Architecture:** Clean Architecture with clear layer separation

---

## Annotated Directory Tree

```
devai-cli/
│
├── 📄 package.json                    # Project manifest & dependencies
├── 📄 tsconfig.json                   # TypeScript root configuration (extends build config)
├── 📄 tsconfig.build.json             # TypeScript build settings (ES2022, NodeNext)
├── 📄 tsup.config.ts                  # Build configuration (esbuild-based bundler)
├── 📄 vitest.config.ts                # Test framework configuration (80% coverage thresholds)
├── 📄 eslint.config.js                # Linting rules
├── 📄 prettier.config.mjs             # Code formatting rules
├── 📄 .prettierignore                 # Files excluded from formatting
├── 📄 .gitignore                      # Git exclusions
├── 📄 README.md                       # User-facing documentation
├── 📄 CHANGELOG.md                    # Release history
│
├── 📁 src/                            # **PRIMARY SOURCE CODE**
│   │
│   ├── 📄 index.ts                    # ⭐ ENTRY POINT - Executable with shebang
│   ├── 📄 main.ts                     # ⭐ COMPOSITION ROOT - DI & CLI configuration
│   ├── 📄 main.test.ts                # Unit tests for main module
│   │
│   ├── 📁 core/                       # **DOMAIN LAYER** - Business logic & contracts
│   │   ├── 📄 index.ts                # Core exports
│   │   │
│   │   ├── 📁 ports/                  # Interfaces (abstractions for dependencies)
│   │   │   ├── 📄 llm-port.ts         # ILlmPort - LLM provider contract
│   │   │   ├── 📄 git-port.ts         # IGitPort - Git operations contract
│   │   │   ├── 📄 editor-port.ts      # IEditorPort - Text editor contract
│   │   │   ├── 📄 commit-ui-port.ts   # ICommitUiPort - Commit UI contract
│   │   │   ├── 📄 setup-ui-port.ts    # ISetupUiPort - Setup UI contract
│   │   │   └── 📄 index.ts            # Port exports
│   │   │
│   │   └── 📁 types/                  # Domain entities & value objects
│   │       ├── 📄 commit.types.ts     # CommitType, ConventionalCommitMessage
│   │       ├── 📄 git-types.ts        # GitStatus, FileDiff, ChangesSummary
│   │       ├── 📄 llm-types.ts        # LlmResponse, OllamaModelConfig
│   │       ├── 📄 errors.types.ts     # AppError hierarchy
│   │       ├── 📄 errors.types.test.ts # Error type tests
│   │       ├── 📄 prompt.types.ts     # Prompt construction types
│   │       ├── 📄 setup.types.ts      # Setup workflow types
│   │       └── 📄 index.ts            # Type exports
│   │
│   ├── 📁 features/                   # **APPLICATION LAYER** - Use cases & controllers
│   │   ├── 📁 commit/                 # Commit feature module
│   │   │   ├── 📄 index.ts            # Feature exports
│   │   │   │
│   │   │   ├── 📁 controllers/        # Command handlers
│   │   │   │   ├── 📄 commit-controller.ts        # ⭐ Commit command orchestration
│   │   │   │   ├── 📄 commit-controller.test.ts   # Controller tests
│   │   │   │   └── 📄 index.ts
│   │   │   │
│   │   │   ├── 📁 use-cases/          # Business operations
│   │   │   │   ├── 📄 validate-preconditions.ts       # Pre-commit validation
│   │   │   │   ├── 📄 validate-preconditions.test.ts  # Precondition tests
│   │   │   │   ├── 📄 generate-commit.ts              # ⭐ LLM message generation
│   │   │   │   ├── 📄 generate-commit.test.ts         # Generation tests
│   │   │   │   └── 📄 index.ts
│   │   │   │
│   │   │   └── 📁 utils/              # Helper functions
│   │   │       ├── 📄 format-validator.ts             # Conventional commit format check
│   │   │       ├── 📄 format-validator.test.ts        # Validation tests
│   │   │       ├── 📄 message-normalizer.ts           # Clean LLM output
│   │   │       ├── 📄 message-normalizer.test.ts      # Normalizer tests
│   │   │       ├── 📄 type-enforcer.ts                # Ensure type prefix
│   │   │       ├── 📄 type-enforcer.test.ts           # Enforcer tests
│   │   │       ├── 📄 prompt-builder.ts               # LLM prompt construction
│   │   │       ├── 📄 prompt-builder.test.ts          # Builder tests
│   │   │       └── 📄 index.ts
│   │   │
│   │   └── 📁 setup/                  # Setup feature module
│   │       ├── 📁 controllers/
│   │       │   ├── 📄 setup-controller.ts           # ⭐ Setup wizard orchestration
│   │       │   ├── 📄 setup-controller.test.ts      # Controller tests
│   │       │   └── 📄 index.ts
│   │       │
│   │       └── 📁 use-cases/
│   │           ├── 📄 validate-ollama-connection.ts      # Check Ollama daemon
│   │           ├── 📄 validate-ollama-connection.test.ts # Connection tests
│   │           ├── 📄 ensure-base-model.ts                # Pull base model
│   │           ├── 📄 ensure-base-model.test.ts           # Base model tests
│   │           ├── 📄 provision-custom-model.ts           # Create custom model
│   │           ├── 📄 provision-custom-model.test.ts      # Provisioning tests
│   │           └── 📄 index.ts
│   │
│   ├── 📁 infrastructure/             # **INFRASTRUCTURE LAYER** - External integrations
│   │   ├── 📄 index.ts                # Infrastructure exports
│   │   │
│   │   ├── 📁 adapters/               # Port implementations
│   │   │   ├── 📄 index.ts
│   │   │   │
│   │   │   ├── 📁 ollama/             # Ollama SDK integration
│   │   │   │   ├── 📄 ollama-adapter.ts              # ⭐ ILlmPort implementation
│   │   │   │   ├── 📄 ollama-adapter.test.ts         # Adapter tests
│   │   │   │   └── 📄 index.ts
│   │   │   │
│   │   │   ├── 📁 git/                # Git CLI wrapper
│   │   │   │   ├── 📄 shell-git-adapter.ts           # ⭐ IGitPort implementation (execa)
│   │   │   │   ├── 📄 shell-git-adapter.test.ts      # Adapter tests
│   │   │   │   └── 📄 index.ts
│   │   │   │
│   │   │   └── 📁 editor/             # Editor invocation
│   │   │       ├── 📄 shell-editor-adapter.ts        # IEditorPort implementation
│   │   │       ├── 📄 shell-editor-adapter.test.ts   # Adapter tests
│   │   │       └── 📄 index.ts
│   │   │
│   │   ├── 📁 config/                 # Configuration management
│   │   │   ├── 📄 conventional-commit-model.config.ts # ⭐ Model config & prompts
│   │   │   └── 📄 index.ts
│   │   │
│   │   └── 📁 logging/                # Debug logging
│   │       ├── 📄 debug-loggers.ts                  # Debug logger instances
│   │       ├── 📄 debug-loggers.test.ts             # Logger tests
│   │       └── 📄 index.ts
│   │
│   └── 📁 ui/                         # **PRESENTATION LAYER** - User interface
│       ├── 📄 index.ts                # UI exports
│       │
│       ├── 📁 adapters/               # UI port implementations
│       │   └── 📄 commit-adapter.ts                 # ⭐ ICommitUiPort implementation
│       │
│       ├── 📁 commit/                 # Commit UI components
│       │   ├── 📄 index.ts
│       │   │
│       │   └── 📁 components/         # Reusable terminal UI components
│       │       ├── 📁 type-selector/
│       │       │   ├── 📄 type-selector.ts           # Commit type picker
│       │       │   ├── 📄 type-selector.test.ts     # Selector tests
│       │       │   ├── 📄 type-selector.demo.ts     # Interactive demo
│       │       │   └── 📄 index.ts
│       │       │
│       │       ├── 📁 message-preview/
│       │       │   ├── 📄 message-preview.ts         # Message formatter
│       │       │   ├── 📄 message-preview.test.ts   # Preview tests
│       │       │   ├── 📄 message-preview.demo.ts   # Interactive demo
│       │       │   └── 📄 index.ts
│       │       │
│       │       └── 📁 action-selector/
│       │           ├── 📄 action-selector.ts         # Action prompt (approve/edit/etc.)
│       │           ├── 📄 action-selector.test.ts   # Selector tests
│       │           ├── 📄 action-selector.demo.ts   # Interactive demo
│       │           └── 📄 index.ts
│       │
│       └── 📁 setup/                  # Setup UI components
│           ├── 📄 console-setup-renderer.ts         # ⭐ ISetupUiPort implementation
│           ├── 📄 console-setup-renderer.test.ts    # Renderer tests
│           └── 📄 console-setup-renderer.demo.ts    # Interactive demo
│
├── 📁 tests/                          # **TEST SUITE** - Separate from src/
│   ├── 📁 integration/                # Integration tests (real Ollama)
│   │   ├── 📄 setup-auto-pull.test.ts              # Model provisioning integration
│   │   └── 📄 create-model.test.ts                 # Custom model creation
│   │
│   ├── 📁 e2e/                        # End-to-end tests (full workflows)
│   │   ├── 📄 commit-happy-path.test.ts            # ⭐ Successful commit flow
│   │   └── 📄 commit-error-paths.test.ts           # Error handling scenarios
│   │
│   └── 📁 helpers/                    # Test utilities
│       ├── 📄 git-harness.ts                       # Test git repository manager
│       ├── 📄 git-harness.test.ts                  # Harness tests
│       ├── 📄 mock-llm-provider.ts                 # Mock LLM for deterministic tests
│       ├── 📄 mock-llm-provider.test.ts            # Mock provider tests
│       ├── 📄 mock-commit-ui.ts                    # Mock UI for automated tests
│       ├── 📄 performance-tracker.ts               # Performance measurement utility
│       └── 📄 performance-tracker.test.ts          # Tracker tests
│
├── 📁 scripts/                        # **DEVELOPMENT SCRIPTS**
│   ├── 📄 run-demos.ts                # Run interactive UI component demos
│   └── 📄 validate-setup.ts           # Setup validation script (checks Ollama, models)
│
├── 📁 dev/                            # **GENERATED DOCUMENTATION** (auto-generated)
│   ├── 📄 project-scan-report.json    # Workflow state & metadata
│   ├── 📄 architecture.md             # Architecture documentation
│   └── 📄 source-tree-analysis.md     # This file
│
└── 📁 dist/                           # **BUILD OUTPUT** (git-ignored)
    └── 📄 index.js                    # Bundled executable (ESM, with shebang)
```

---

## Critical Directories Explained

### 📁 `src/core/` - Domain Layer

**Purpose:** Pure business logic, zero external dependencies

**Key Characteristics:**
- No imports from infrastructure or UI layers
- Defines contracts via ports (interfaces)
- Contains domain entities and value objects
- 100% testable in isolation

**Critical Files:**
- `ports/*.ts` - Dependency inversion contracts
- `types/errors.types.ts` - Domain error hierarchy

---

### 📁 `src/features/` - Application Layer

**Purpose:** Orchestrate business workflows using core domain

**Structure Pattern:**
```
feature-name/
├── controllers/    # Command handlers (register with Commander)
├── use-cases/      # Single-purpose business operations
└── utils/          # Feature-specific helpers
```

**Key Responsibilities:**
- Wire together core ports
- Implement application workflows
- Handle feature-specific validation

**Critical Files:**
- `commit/controllers/commit-controller.ts` - Main commit workflow
- `commit/use-cases/generate-commit.ts` - LLM message generation with retry logic
- `setup/controllers/setup-controller.ts` - Setup wizard orchestration

---

### 📁 `src/infrastructure/` - Infrastructure Layer

**Purpose:** Concrete implementations of external dependencies

**Adapter Pattern:**
- Each adapter implements a core port (interface)
- Wraps external libraries/tools
- Handles error translation to domain errors

**Critical Files:**
- `adapters/ollama/ollama-adapter.ts` - Ollama SDK integration
- `adapters/git/shell-git-adapter.ts` - Git CLI wrapper (execa)
- `config/conventional-commit-model.config.ts` - Model configuration

---

### 📁 `src/ui/` - Presentation Layer

**Purpose:** Terminal user interface components

**Technologies:**
- `@clack/prompts` - Interactive prompts
- `ora` - Spinners for async operations

**Component Structure:**
- Modular, reusable components
- Each component has `.demo.ts` for isolated testing
- Implements UI port interfaces from core

**Critical Files:**
- `adapters/commit-adapter.ts` - Complete commit UI workflow
- `setup/console-setup-renderer.ts` - Setup wizard UI
- `commit/components/*` - Reusable prompt components

---

### 📁 `tests/` - Test Suite

**Separation Rationale:** Tests outside `src/` for cleaner production builds

**Test Categories:**

| Directory | Purpose | Dependencies |
|-----------|---------|--------------|
| `integration/` | Test real Ollama integration | Requires Ollama daemon |
| `e2e/` | Test full user workflows | Mocked LLM, test git repo |
| `helpers/` | Shared test utilities | None |

**Test Strategy:**
- **Unit tests:** Co-located with source (`*.test.ts`)
- **Integration tests:** Separate directory, real dependencies
- **E2E tests:** Full user scenarios with mocks for determinism

---

### 📁 `scripts/` - Development Tools

**Purpose:** Developer productivity scripts

**Files:**
- `run-demos.ts` - Launch interactive UI component demos
- `validate-setup.ts` - Verify development environment (Ollama running, models available)

**Usage:**
```bash
npm run test:demo      # Run UI demos
npm run validate:setup # Check setup
```

---

## Entry Points

### Primary Entry Point

**File:** `src/index.ts`

```typescript
#!/usr/bin/env node
import { main } from './main.js';
main();
```

- **Shebang:** Makes file executable
- **Minimal:** Just bootstraps main application

---

### Composition Root

**File:** `src/main.ts`

**Responsibilities:**
1. **CLI Configuration** - Commander.js program setup
2. **Dependency Injection** - Wire all dependencies (composition root pattern)
3. **Command Registration** - Register commit & setup commands
4. **Error Handling** - Global error handlers

**Key Functions:**
- `createCommitCommand()` - DI for commit feature
- `createSetupCommand()` - DI for setup feature
- `createProgram()` - Configure CLI
- `main()` - Application entry point

**Why Separate from index.ts?**
- Easier to test (no shebang execution)
- Cleaner composition root pattern
- Importable for testing

---

## Dependency Flow

```
index.ts
  ↓
main.ts (Composition Root)
  ↓
┌───────────────┬──────────────┐
│               │              │
Features     Infrastructure   UI
  ↓               ↓              ↓
Core (Ports + Types)
```

**Direction:** Inward (outer layers depend on inner)

**Benefits:**
- Core domain is independent
- Infrastructure is swappable
- Testability via dependency injection

---

## File Naming Conventions

| Pattern | Purpose | Example |
|---------|---------|---------|
| `*.ts` | Source code | `commit-controller.ts` |
| `*.test.ts` | Unit tests | `commit-controller.test.ts` |
| `*.demo.ts` | Interactive demos | `type-selector.demo.ts` |
| `*.types.ts` | Type definitions | `commit.types.ts` |
| `*-port.ts` | Core interfaces | `llm-port.ts` |
| `*-adapter.ts` | Port implementations | `ollama-adapter.ts` |
| `*-controller.ts` | Command handlers | `commit-controller.ts` |
| `index.ts` | Module exports | `src/core/index.ts` |

---

## Integration Points

### External Dependencies

| Integration | Location | Purpose |
|-------------|----------|---------|
| **Ollama** | `infrastructure/adapters/ollama/` | LLM inference |
| **Git** | `infrastructure/adapters/git/` | Version control operations |
| **$EDITOR** | `infrastructure/adapters/editor/` | Text editing |
| **Commander** | `main.ts` | CLI argument parsing |
| **@clack/prompts** | `ui/` | Interactive terminal UI |

### Internal Integration

- **main.ts → features** - Command registration
- **features → core** - Use core ports & types
- **infrastructure → core** - Implement core ports
- **ui → core** - Implement UI ports

---

## Build Artifacts

### Development

- **`node_modules/`** - Dependencies (git-ignored)
- **`.DS_Store`** - macOS metadata (git-ignored)

### Production

- **`dist/index.js`** - Bundled executable
  - Single file build
  - ESM format
  - Shebang preserved
  - Source maps included (in dev)

### Documentation

- **`dev/`** - Generated documentation
  - Auto-generated during brownfield analysis
  - Git-ignored for clean repo

---

## Test File Distribution

**Total Test Files:** 27

| Location | Count | Type |
|----------|-------|------|
| `src/**/*.test.ts` | 21 | Unit tests (co-located) |
| `tests/integration/` | 2 | Integration tests |
| `tests/e2e/` | 2 | End-to-end tests |
| `tests/helpers/` | 2 | Test utility tests |

**Coverage Target:** 80% (lines, functions, branches, statements)

---

## Module Boundaries

### Core Module

**Exports:** (via `src/core/index.ts`)
- All port interfaces
- All type definitions
- AppError and subclasses

**Dependencies:** None (pure domain)

---

### Features Module

**Exports:** (via `src/features/*/index.ts`)
- Controllers
- Use cases
- Public utilities

**Dependencies:**
- `core/*` - Ports & types
- Infrastructure adapters (via DI)

---

### Infrastructure Module

**Exports:** (via `src/infrastructure/index.ts`)
- All adapters
- Configuration objects

**Dependencies:**
- `core/ports` - Implements these interfaces
- External packages (ollama, execa)

---

### UI Module

**Exports:** (via `src/ui/index.ts`)
- UI adapters
- Console renderers

**Dependencies:**
- `core/ports` - Implements UI ports
- `@clack/prompts`, `ora`

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Source Files** | ~70 TypeScript files |
| **Core Ports** | 5 (LLM, Git, Editor, CommitUI, SetupUI) |
| **Features** | 2 (Commit, Setup) |
| **Infrastructure Adapters** | 3 (Ollama, Git, Editor) |
| **UI Components** | 4 (TypeSelector, MessagePreview, ActionSelector, SetupRenderer) |
| **Test Files** | 27 (21 unit + 4 integration + 2 e2e) |
| **Test Helpers** | 3 (GitHarness, MockLLM, PerformanceTracker) |
| **Scripts** | 2 (run-demos, validate-setup) |

---

**Document Version:** 1.0
**Generated:** 2025-12-02
**Analysis Type:** Exhaustive Scan
