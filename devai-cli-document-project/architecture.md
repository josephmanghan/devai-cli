# Architecture Documentation: devai-cli

## Executive Summary

**devai-cli** is a command-line interface tool for AI-powered git commit message generation using local Ollama instances. The application follows **Clean Architecture** (Hexagonal Architecture) principles with clear separation between domain logic, infrastructure adapters, and user interface concerns.

**Key Characteristics:**

- **Architecture Pattern:** Clean Architecture / Ports & Adapters
- **Project Type:** CLI Tool
- **Primary Language:** TypeScript (ES2022, NodeNext modules)
- **Runtime:** Node.js >= 20.0.0
- **Design Philosophy:** Privacy-first, 100% local processing, zero telemetry

---

## Technology Stack

| Category              | Technology          | Version  | Purpose                                     |
| --------------------- | ------------------- | -------- | ------------------------------------------- |
| **Language**          | TypeScript          | 5.9.3    | Type-safe development with strict mode      |
| **Runtime**           | Node.js             | >=20.0.0 | ESM support, modern JavaScript features     |
| **CLI Framework**     | Commander           | 14.0.2   | Command routing and argument parsing        |
| **UI/Prompts**        | @clack/prompts      | 0.11.0   | Interactive terminal user interface         |
| **Spinners**          | ora                 | 9.0.0    | Progress indicators during async operations |
| **AI Integration**    | ollama              | 0.6.3    | Local LLM communication                     |
| **Process Execution** | execa               | 9.6.1    | Git command execution with error handling   |
| **Build Tool**        | tsup                | latest   | Fast TypeScript bundling via esbuild        |
| **Test Framework**    | Vitest              | 4.0.14   | Unit, integration, and e2e testing          |
| **Code Coverage**     | @vitest/coverage-v8 | 4.0.14   | V8-based code coverage (80% thresholds)     |
| **Linting**           | ESLint              | 9.39.1   | Code quality enforcement                    |
| **Formatting**        | Prettier            | 3.0.0    | Consistent code formatting                  |
| **Dev Runtime**       | tsx                 | latest   | Fast TypeScript execution in development    |
| **Debugging**         | debug               | 4.4.3    | Conditional debug logging                   |

---

## Architecture Overview

### Clean Architecture Layers

```
┌────────────────────────────────────────────────────────┐
│                    Entry Point                         │
│                  (src/index.ts)                        │
│                  (src/main.ts)                         │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│             UI Layer (src/ui/)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • CommitAdapter - Commit workflow UI             │  │
│  │ • ConsoleSetupRenderer - Setup wizard UI         │  │
│  │ • Interactive prompts (@clack/prompts)           │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│         Features Layer (src/features/)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Commit Feature                                   │  │
│  │ • CommitController                               │  │
│  │ • ValidatePreconditions (use case)               │  │
│  │ • GenerateCommit (use case)                      │  │
│  │ • Utilities: validator, normalizer, builder      │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Setup Feature                                    │  │
│  │ • SetupController                                │  │
│  │ • ValidateOllamaConnection (use case)            │  │
│  │ • EnsureBaseModel (use case)                     │  │
│  │ • ProvisionCustomModel (use case)                │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│           Core Domain (src/core/)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Ports (Interfaces)                               │  │
│  │ • ILlmPort - LLM provider abstraction            │  │
│  │ • IGitPort - Git operations abstraction          │  │
│  │ • IEditorPort - Text editor abstraction          │  │
│  │ • ICommitUiPort - Commit UI abstraction          │  │
│  │ • ISetupUiPort - Setup UI abstraction            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Types                                            │  │
│  │ • Domain entities (Commit, Git, LLM types)       │  │
│  │ • Error types (AppError hierarchy)               │  │
│  │ • Configuration types                            │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────┬────────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────────┐
│      Infrastructure Layer (src/infrastructure/)        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Adapters                                         │  │
│  │ • OllamaAdapter - Ollama client implementation   │  │
│  │ • ShellGitAdapter - Git CLI wrapper              │  │
│  │ • ShellEditorAdapter - $EDITOR invocation        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Configuration                                    │  │
│  │ • CONVENTIONAL_COMMIT_MODEL_CONFIG               │  │
│  │ • Model parameters & system prompts              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Logging                                          │  │
│  │ • Debug logger configuration                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Dependency Flow

**Direction:** Inward (infrastructure → core)

- Infrastructure adapters **depend on** core ports (interfaces)
- Core domain has **no dependencies** on outer layers
- Features orchestrate use cases and depend on core ports
- UI layer depends on features and core types

This ensures:

- ✅ Testability: Core logic can be tested independently
- ✅ Flexibility: Swap implementations (e.g., different LLM providers)
- ✅ Maintainability: Clear boundaries between concerns

---

## Core Components

### 1. Entry Point & Composition Root

**File:** `src/main.ts`

**Responsibilities:**

- CLI program configuration (Commander.js)
- Dependency injection and wiring (composition root)
- Global error handling
- Application bootstrap

**Key Functions:**

- `main()` - Application entry point
- `createProgram()` - Configures Commander CLI
- `createCommitCommand()` - Wires commit feature dependencies
- `createSetupCommand()` - Wires setup feature dependencies

### 2. Features

#### **Commit Feature** (`src/features/commit/`)

**Purpose:** Generate conventional commit messages using AI

**Components:**

- **CommitController** - Command registration and workflow orchestration
  - Handles `-a/--all` flag for auto-staging
  - Coordinates precondition validation, type selection, message generation, and commit execution

- **Use Cases:**
  - `ValidatePreconditions` - Ensures git repo, staged changes, and Ollama availability
  - `GenerateCommit` - LLM-based commit message generation with retry logic

- **Utilities:**
  - `format-validator` - Validates conventional commit format
  - `message-normalizer` - Cleans up LLM output
  - `type-enforcer` - Ensures type prefix matches user selection
  - `prompt-builder` - Constructs LLM system prompts

#### **Setup Feature** (`src/features/setup/`)

**Purpose:** One-time configuration of Ollama and custom model

**Components:**

- **SetupController** - Setup wizard orchestration

- **Use Cases:**
  - `ValidateOllamaConnection` - Checks Ollama daemon availability
  - `EnsureBaseModel` - Pulls base model if missing (qwen2.5-coder:1.5b)
  - `ProvisionCustomModel` - Creates custom model with conventional commit system prompt

### 3. Core Domain

#### **Ports (Interfaces)** (`src/core/ports/`)

**Abstractions for external dependencies:**

| Port            | Purpose                | Implementations        |
| --------------- | ---------------------- | ---------------------- |
| `ILlmPort`      | LLM provider interface | `OllamaAdapter`        |
| `IGitPort`      | Git operations         | `ShellGitAdapter`      |
| `IEditorPort`   | Text editor invocation | `ShellEditorAdapter`   |
| `ICommitUiPort` | Commit workflow UI     | `CommitAdapter`        |
| `ISetupUiPort`  | Setup wizard UI        | `ConsoleSetupRenderer` |

#### **Types** (`src/core/types/`)

**Domain entities and value objects:**

- `commit.types.ts` - CommitType, ConventionalCommitMessage
- `git-types.ts` - GitStatus, FileDiff, ChangesSummary
- `llm-types.ts` - LlmResponse, OllamaModelConfig
- `errors.types.ts` - AppError hierarchy (GitError, OllamaError, ValidationError)
- `prompt.types.ts` - Prompt construction types
- `setup.types.ts` - Setup workflow types

### 4. Infrastructure

#### **Adapters** (`src/infrastructure/adapters/`)

**Concrete implementations of core ports:**

- **OllamaAdapter** - Ollama SDK integration
  - Model management (list, create, pull)
  - Chat completion streaming
  - Connection validation

- **ShellGitAdapter** - Git CLI wrapper using `execa`
  - Status, diff, add, commit operations
  - Working directory and staged changes detection

- **ShellEditorAdapter** - Shell editor invocation
  - Respects `$EDITOR` environment variable
  - Temporary file-based editing

#### **Configuration** (`src/infrastructure/config/`)

- **CONVENTIONAL_COMMIT_MODEL_CONFIG**
  - Base model: `qwen2.5-coder:1.5b`
  - Custom model: `qwen2.5-coder:1.5b-conventional-commit`
  - System prompt: Conventional commit format instructions
  - Model parameters: temperature, top_p, etc.

### 5. UI Layer

**Terminal Interface Components:**

- **CommitAdapter** (`src/ui/adapters/commit-adapter.ts`)
  - Type selector (feat, fix, docs, etc.)
  - Message preview with diff context
  - Action selector (approve, edit, regenerate, cancel)

- **ConsoleSetupRenderer** (`src/ui/setup/console-setup-renderer.ts`)
  - Step-by-step setup wizard
  - Progress indicators (ora spinners)
  - Success/error messaging

- **UI Components** (`src/ui/commit/components/`)
  - `type-selector` - Interactive commit type picker
  - `message-preview` - Format commit message with diff
  - `action-selector` - User action prompt

---

## Data Flow

### Commit Workflow

```
1. User runs: devai-cli commit [-a]
   ↓
2. CommitController.execute()
   ↓
3. ValidatePreconditions.execute()
   - Check git repository
   - Check staged changes (or stage with -a)
   - Check Ollama availability
   ↓
4. CommitAdapter.selectCommitType()
   - User selects: feat/fix/docs/etc.
   ↓
5. GitAdapter.getGitDiff()
   - Retrieve staged changes
   ↓
6. GenerateCommit.execute(type, diff)
   - Build prompt with type + diff context
   - Call OllamaAdapter.generateCommitMessage()
   - Validate format, enforce type prefix
   - Retry if invalid (max 3 attempts)
   ↓
7. CommitAdapter.previewAndConfirm(message)
   - Show message with diff
   - User: Approve / Edit / Regenerate / Cancel
   ↓
8. [If Approved] GitAdapter.commit(message)
   - Execute: git commit -m "message"
   ↓
9. Display success message
```

### Setup Workflow

```
1. User runs: devai-cli setup
   ↓
2. SetupController.execute()
   ↓
3. ValidateOllamaConnection.execute()
   - Ping Ollama API
   - Error if not running
   ↓
4. EnsureBaseModel.execute()
   - Check if qwen2.5-coder:1.5b exists
   - Pull if missing (with progress indicator)
   ↓
5. ProvisionCustomModel.execute()
   - Create custom model via Modelfile
   - Embed conventional commit system prompt
   ↓
6. Display setup complete message
```

---

## Testing Strategy

### Test Structure

**Location:**

- Unit tests: Co-located with source (`src/**/*.test.ts`)
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`
- Test helpers: `tests/helpers/`

**Coverage Requirements:** 80% for lines, functions, branches, statements

### Test Categories

| Category          | Count | Purpose                                              |
| ----------------- | ----- | ---------------------------------------------------- |
| Unit Tests        | 21    | Test individual functions/classes in isolation       |
| Integration Tests | 2     | Test Ollama integration (model creation, setup)      |
| E2E Tests         | 2     | Test full commit workflow (happy path + error paths) |
| Test Helpers      | 5     | Mock LLM provider, Git harness, performance tracker  |

### Testing Approach

**Unit Tests:**

- Mock all external dependencies (ports)
- Test business logic in features/core
- Example: `format-validator.test.ts` validates commit format rules

**Integration Tests:**

- Test real Ollama integration
- Require Ollama daemon running
- Example: `setup-auto-pull.test.ts` verifies model provisioning

**E2E Tests:**

- Simulate full user workflows
- Use test git repository harness
- Mock LLM responses for determinism
- Example: `commit-happy-path.test.ts` validates end-to-end commit flow

---

## Configuration Management

### Model Configuration

**File:** `src/infrastructure/config/ollama-model-config.ts`

```typescript
CONVENTIONAL_COMMIT_MODEL_CONFIG = {
  baseModel: 'qwen2.5-coder:1.5b',
  customModel: 'qwen2.5-coder:1.5b-conventional-commit',
  systemPrompt: '...' // Conventional commit format instructions
  parameters: {
    temperature: 0.7,
    top_p: 0.9,
    // ... other Ollama parameters
  }
}
```

### Environment Variables

- `$EDITOR` - Text editor for message editing (default: vi)
- `DEBUG` - Enable debug logging (e.g., `DEBUG=devai-cli:*`)

### No Config Files

**Design Decision:** Zero configuration files

- No `.devai-cli.json` or similar
- All behavior determined by model configuration in code
- Simplifies first-time setup experience

---

## Error Handling

### Error Hierarchy

**Base:** `AppError` (custom error class in `src/core/types/errors.types.ts`)

**Specialized Errors:**

- `GitError` - Git operation failures (not a repo, no changes, etc.)
- `OllamaError` - Ollama connectivity/model issues
- `ValidationError` - Invalid commit format or input
- `EditorError` - Editor invocation failures

**Error Properties:**

- `message` - Human-readable error description
- `code` - Exit code for CLI
- `remediation` - Suggested user action (optional)

### Error Display

```
❌ <Error Message>

💡 <Remediation Suggestion>
```

**Example:**

```
❌ No staged changes found

💡 Stage changes with: git add <files>
   Or use: devai-cli commit -a
```

---

## Development Workflow

### Commands

| Command                    | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `npm run dev`              | Run CLI in development mode (tsx)                     |
| `npm run build`            | Build production bundle (tsup)                        |
| `npm run test`             | Run all tests                                         |
| `npm run test:unit`        | Run unit tests only                                   |
| `npm run test:integration` | Run integration tests                                 |
| `npm run test:e2e`         | Run end-to-end tests                                  |
| `npm run test:coverage`    | Generate coverage report                              |
| `npm run lint`             | Run ESLint                                            |
| `npm run format`           | Format code with Prettier                             |
| `npm run typecheck`        | TypeScript type checking                              |
| `npm run pr`               | Full PR checks (format, lint, typecheck, test, build) |

### Build Process

**Tool:** tsup (esbuild-based)

**Configuration:** `tsup.config.ts`

- **Entry:** `src/index.ts`
- **Output:** `dist/index.js`
- **Format:** ESM (NodeNext modules)
- **Target:** ES2022
- **Bundle:** Single executable file with shebang

---

## Deployment

### Package Distribution

**Registry:** npm (package name: `devai-cli`)

**Installation:**

```bash
npm install devai-cli
```

**Binary:** `dist/index.js` (executable with `#!/usr/bin/env node`)

### System Requirements

- **Node.js:** >= 20.0.0
- **Ollama:** Latest version (must be running)
- **Git:** Any recent version
- **VRAM:** ~2GB for qwen2.5-coder:1.5b model

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run release:prep` (cleans dev/docs directories)
4. Run `npm run pr` (validates quality checks)
5. Git commit and tag
6. `npm publish`

---

## Future Considerations

### Extensibility Points

1. **Multi-LLM Support:**
   - Create new adapters implementing `ILlmPort`
   - Example: OpenAIAdapter, AnthropicAdapter
   - Allow model selection via config

2. **Custom Commit Types:**
   - Extend `CommitType` enum
   - Load from configuration file

3. **Plugins:**
   - Hook into pre/post commit events
   - Custom message transformations

4. **Performance Optimization:**
   - Stream git diff for large changes
   - Model quantization for lower VRAM usage

### Known Limitations

- **Large Diffs:** Performance degrades with very large git diffs (working on streaming)
- **Model Size:** Requires ~2GB VRAM (exploring smaller models)
- **Ollama Dependency:** Tightly coupled to Ollama (future: abstract LLM providers)

---

## Security Considerations

### Privacy

✅ **100% Local Processing** - No data leaves user's machine
✅ **No Telemetry** - Zero analytics or tracking
✅ **No API Keys** - Works entirely with local Ollama

### Data Handling

- Git diffs processed locally
- LLM inference via local Ollama daemon
- No network requests except Ollama API (localhost:11434)

### Code Security

- Strict TypeScript mode enabled
- ESLint security rules
- No eval() or dynamic code execution
- Subprocess execution via execa (shell injection protection)

---

## Glossary

- **LLM:** Large Language Model
- **Ollama:** Local LLM runtime (https://ollama.com)
- **Conventional Commits:** Standardized commit message format (https://conventionalcommits.org)
- **Clean Architecture:** Software design pattern emphasizing separation of concerns
- **Port:** Interface defining contract for external dependency
- **Adapter:** Concrete implementation of a port
- **Use Case:** Single business operation/workflow
- **Composition Root:** Application entry point where dependencies are wired together

---

**Document Version:** 1.0
**Generated:** 2025-12-02
**Architecture Pattern:** Clean Architecture (Hexagonal/Ports & Adapters)
