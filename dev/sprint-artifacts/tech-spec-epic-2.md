# Epic Technical Specification: Ollama Integration & Model Management

Date: 2025-11-30
Author: Joe
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 establishes the foundation for AI-powered commit message generation by integrating the Ollama local LLM service into the ollatool CLI architecture. This epic implements hexagonal architecture patterns to create a clean separation between core business logic and external service dependencies, enabling testability, maintainability, and future extensibility (e.g., OpenAI fallback).

The primary goal is to create a robust `ollatool setup` command that validates the Ollama environment (daemon running, base model available) and provisions a custom model instance (`ollatool-commit:latest`) that encapsulates the Conventional Commits system prompt via configuration-based direct SDK parameters. This setup workflow must be idempotent, providing clear error guidance when prerequisites are missing, and preparing the system for sub-1-second commit message generation in subsequent epics.

## Objectives and Scope

**In Scope:**

- LLM Port interface defining Ollama operations contract (FR49: extensible architecture)
- OllamaAdapter implementing the port via official ollama SDK v0.6.3 (FR7: daemon detection)
- Model existence validation for base model (qwen2.5-coder:1.5b) and custom model (ollatool-commit:latest) (FR8)
- Custom model creation from configuration containing Conventional Commits system prompt (FR9, FR10)
- `ollatool setup` command providing 3-tier validation: daemon → base → custom (FR45)
- Typed error classes with actionable remediation messages and exit codes (FR38-40)
- Idempotent setup workflow safe to re-run multiple times
- Zero auto-downloads during `commit` command execution (preserves sub-1s target)

**Out of Scope:**

- Actual commit message generation (Epic 4)
- Prompt engineering iteration (system prompt defined per architecture, refined post-MVP)
- Configuration file support (MVP uses hard-coded defaults)
- Performance measurement infrastructure (added during Epic 6)
- Git integration (Epic 3)
- Interactive prompts for commit workflow (Epic 5)

**Epic 2 Success Criteria:**

- `ollatool setup` successfully creates custom model when Ollama running
- Clear error messages guide users when daemon not running or models missing
- OllamaAdapter passes unit tests with mocked SDK
- Manual testing confirms end-to-end model creation works
- Foundation ready for Epic 3 (Git Context Gathering) and Epic 4 (AI Generation)

## System Architecture Alignment

**Hexagonal Architecture Implementation:**

This epic implements the "Ports & Adapters" pattern as defined in dev/architecture.md (lines 326-457):

- **Core Layer (Ports):** `src/core/ports/llm-port.ts` defines the LLM provider interface with zero external dependencies (lines 1461-1477)
- **Infrastructure Layer (Adapters):** `src/infrastructure/adapters/ollama-adapter.ts` implements the port using the ollama SDK (lines 1519-1563)
- **Features Layer (Use Cases):** Setup command orchestrates validation and model provisioning logic
- **Manual Dependency Injection:** `main.ts` composition root wires up concrete implementations (no IoC container per ADR-001)

**Alignment with Architecture Decisions:**

- **ADR-003:** Configuration-based system prompt - baked into `ollatool-commit:latest` during setup via SDK parameters (architecture lines 1615-1629)
- **ADR-005:** Zero-config MVP - hard-coded defaults, no config file required (architecture lines 1624-1634)
- **Decision Table Row 5:** Official ollama SDK v0.6.3 for LLM integration
- **Decision Table Row 7:** Qwen 2.5 Coder 1.5B as base model with custom instance creation

**Cross-Cutting Integration:**

- **Error Handling:** Implements typed error classes (SystemError, ValidationError) with exit codes 3-4 per architecture lines 792-835
- **Logging:** Uses DEBUG namespace `ollatool:ollama` established in Epic 0
- **Testing:** Co-located tests per ADR-004 with Vitest mocking utilities

## Detailed Design

### Services and Modules

| Module                | Responsibility                                             | Inputs                                     | Outputs                                                                      | Owner/Location                                    |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| **LlmPort Interface** | Define contract for LLM provider operations                | N/A (interface definition)                 | TypeScript interface                                                         | `src/core/ports/llm-port.ts`                      |
| **OllamaAdapter**     | Implement LlmPort using official Ollama SDK                | Ollama client instance, configuration      | Implementation of checkConnection(), checkModel(), createModel(), generate() | `src/infrastructure/adapters/ollama-adapter.ts`   |
| **SetupCommand**      | Orchestrate setup workflow: validate → provision → confirm | Commander.js program instance              | Registered setup command                                                     | `src/features/setup/setup-command.ts`             |
| **SetupValidator**    | 3-tier validation: daemon → base model → custom model      | OllamaAdapter instance                     | Validation result with specific error type                                   | `src/features/setup/use-cases/validate-setup.ts`  |
| **ModelProvisioner**  | Create custom model from Modelfile if missing              | Modelfile content, OllamaAdapter           | Success/failure status                                                       | `src/features/setup/use-cases/provision-model.ts` |
| **Error Classes**     | Typed errors with exit codes and remediation               | Error context (message, code, remediation) | SystemError, ValidationError instances                                       | `src/core/types/errors.types.ts`                  |

### Data Models and Contracts

**LlmPort Interface (Core Layer):**

```typescript
// src/core/ports/llm-port.ts
export interface LlmPort {
  /**
   * Check if Ollama daemon is running and accessible
   * @returns true if daemon responds to health check
   * @throws never - returns false on connection failure
   */
  checkConnection(): Promise<boolean>;

  /**
   * Verify if a specific model exists in local Ollama registry
   * @param modelName - Full model identifier (e.g., 'qwen2.5-coder:1.5b')
   * @returns true if model is available locally
   */
  checkModel(modelName: string): Promise<boolean>;

  /**
   * Create custom model instance using configuration parameters
   * @param modelName - Name for custom model (e.g., 'ollatool-commit:latest')
   * @param modelDefinition - Optional model definition (legacy compatibility)
   * @returns void on success
   * @throws SystemError if SDK creation fails
   */
  createModel(modelName: string, modelDefinition?: string): Promise<void>;

  /**
   * Generate text from prompt (used in Epic 4)
   * @param prompt - User prompt with diff context
   * @param options - Generation parameters (temperature, etc.)
   * @returns Generated commit message
   */
  generate(prompt: string, options: GenerationOptions): Promise<string>;
}

export interface GenerationOptions {
  model: string;
  temperature?: number;
  num_ctx?: number;
  keep_alive?: number;
}
```

**Error Type Definitions:**

```typescript
// src/core/types/errors.types.ts
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly remediation?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SystemError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 3, remediation);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, remediation?: string) {
    super(message, 4, remediation);
  }
}
```

**Configuration Structure:**

```typescript
// src/infrastructure/config/conventional-commit-model.config.ts
export const CONVENTIONAL_COMMIT_MODEL_CONFIG: OllamaModelConfig = {
  model: 'ollatool-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: `You are a git commit message generator specialized in Conventional Commits format.

CRITICAL RULES:
1. Output ONLY the commit message - no conversational text, no markdown, no code blocks
2. Format: <type>: <description>\n\n<body>
3. Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
4. Description: imperative mood, lowercase, no period, <50 characters
5. Body: explain WHAT and WHY, not HOW. 2-3 sentences max.

FEW-SHOT EXAMPLES:
[Examples from architecture doc lines 471-513]`,
  parameters: {
    temperature: 0.2,
    num_ctx: 131072,
    keep_alive: 0,
  },
};
```

### APIs and Interfaces

**OllamaAdapter Implementation (Infrastructure Layer):**

```typescript
// src/infrastructure/adapters/ollama-adapter.ts
import { Ollama } from 'ollama';
import type { LlmPort, GenerationOptions } from '@/core/ports/llm-port';
import { SystemError, ValidationError } from '@/core/types/errors.types';
import createDebug from 'debug';

const debug = createDebug('ollatool:ollama');

export class OllamaAdapter implements LlmPort {
  constructor(
    private readonly client: Ollama,
    private readonly baseUrl = 'http://localhost:11434'
  ) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.client.list();
      debug('Daemon connection successful');
      return true;
    } catch (error) {
      debug('Daemon connection failed: %O', error);
      return false;
    }
  }

  async checkModel(modelName: string): Promise<boolean> {
    try {
      const { models } = await this.client.list();
      const exists = models.some(m => m.name === modelName);
      debug('Model %s exists: %s', modelName, exists);
      return exists;
    } catch (error) {
      debug('Model check failed: %O', error);
      throw new SystemError(
        'Failed to check model availability',
        'Ensure Ollama daemon is running: ollama serve'
      );
    }
  }

  async createModel(
    modelName: string,
    modelDefinition?: string
  ): Promise<void> {
    try {
      debug('Creating model %s with configuration parameters', modelName);
      await this.client.create({
        model: modelName,
        from: this.baseModel,
        system: this.systemPrompt,
        parameters: this.parameters,
        stream: true as const,
      });
      debug('Model %s created successfully', modelName);
    } catch (error) {
      debug('Model creation failed: %O', error);
      throw new SystemError(
        `Failed to create custom model: ${modelName}`,
        'Check base model availability and SDK configuration'
      );
    }
  }

  async generate(prompt: string, options: GenerationOptions): Promise<string> {
    // Implementation deferred to Epic 4
    throw new Error('Not implemented in Epic 2');
  }
}
```

**Setup Command Handler:**

```typescript
// src/features/setup/setup-command.ts
import { Command } from 'commander';
import type { LlmPort } from '@/core/ports/llm-port';
import { ValidateSetup } from './use-cases/validate-setup';
import { ProvisionModel } from './use-cases/provision-model';

export class SetupCommand {
  constructor(
    private readonly llmPort: LlmPort,
    private readonly modelfileContent: string
  ) {}

  register(program: Command): void {
    program
      .command('setup')
      .description('Configure Ollama integration and provision custom model')
      .action(async () => {
        try {
          const validator = new ValidateSetup(this.llmPort);
          const provisioner = new ProvisionModel(this.llmPort);

          // Validation phase
          await validator.execute();

          // Provisioning phase
          await provisioner.execute(
            'ollatool-commit:latest',
            this.modelfileContent
          );

          console.log('✓ Setup complete. Run "ollatool commit" to start.');
        } catch (error) {
          if (error instanceof AppError) {
            console.error(`[ERROR] ✗ ${error.message}\n`);
            if (error.remediation) {
              console.error(error.remediation);
            }
            console.error(`\nExit code: ${error.code}`);
            process.exit(error.code);
          }
          throw error;
        }
      });
  }
}
```

### Workflows and Sequencing

**Setup Command Flow (Idempotent):**

```
┌─────────────────────────────────────────────────────────────────┐
│ USER: ollatool setup                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Daemon Check                                          │
│ ─────────────────────────────────────────────────────────────  │
│ Action: OllamaAdapter.checkConnection()                        │
│ Method: HTTP GET http://localhost:11434/                       │
│                                                                 │
│ [SUCCESS] → Continue to Phase 2                                │
│ [FAILURE] → SystemError (exit 3)                               │
│             "Ollama is not running."                            │
│             Remediation: "ollama serve"                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Base Model Check                                      │
│ ─────────────────────────────────────────────────────────────  │
│ Action: OllamaAdapter.checkModel('qwen2.5-coder:1.5b')        │
│ Method: ollama.list() + array search                           │
│                                                                 │
│ [EXISTS] → Continue to Phase 3                                 │
│ [MISSING] → ValidationError (exit 4)                           │
│             "Base model 'qwen2.5-coder:1.5b' not found."       │
│             Remediation: "ollatool setup"                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Custom Model Check & Create                           │
│ ─────────────────────────────────────────────────────────────  │
│ Action: OllamaAdapter.checkModel('ollatool-commit:latest')    │
│                                                                 │
│ [EXISTS] → Skip creation, display "[INFO] Already present ✓"  │
│ [MISSING] → OllamaAdapter.createModel(...)                     │
│             Load CONVENTIONAL_COMMIT_MODEL_CONFIG              │
│             Call ollama.create() with SDK parameters           │
│             Display progress (optional spinner)                 │
│                                                                 │
│ [SUCCESS] → Continue to Phase 4                                │
│ [FAILURE] → SystemError (exit 3)                               │
│             "Failed to create custom model"                     │
│             Remediation: "Check base model availability"         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: Final Validation                                      │
│ ─────────────────────────────────────────────────────────────  │
│ Action: Verify both models exist via ollama.list()             │
│                                                                 │
│ Display:                                                        │
│   ✓ Base model: qwen2.5-coder:1.5b                            │
│   ✓ Custom model: ollatool-commit:latest                      │
│   ✓ Setup complete. Run 'ollatool commit' to start.           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Sequencing Rules:**

1. **Fail Fast:** Each phase validates before proceeding to expensive operations
2. **Clear Feedback:** Every phase displays status (checking... → ✓ success / ✗ error)
3. **Idempotency:** Phases 2-3 skip actions if resources already exist
4. **Zero Auto-Pull:** No automatic model downloads during `commit` command (preserves speed)
5. **Typed Errors:** All failures throw AppError subclasses with exit codes and remediation

## Non-Functional Requirements

### Performance

**Setup Command Latency (NFR-P3):**

- CLI tool initialization: <100ms (binary load + argument parsing)
- Ollama connection check: <200ms timeout for daemon availability detection
- Model list operation: <500ms for checking model existence
- Custom model creation: Variable (depends on Modelfile complexity, typically 2-5 seconds)

**Epic 2 Performance Targets:**

- `ollatool setup` complete workflow: <10 seconds when base model already exists
- `ollatool setup` with base model pull: Variable (network-dependent, display progress bar)
- Daemon health check failure: Immediate (<200ms) with clear error message
- Zero performance impact on `commit` command (no auto-pull during commit workflow)

**Rationale:** Setup is a one-time operation; prioritize clarity and reliability over speed. The sub-1s performance target (NFR-P1) applies to the `commit` command (Epic 4), not setup.

### Security

**Data Privacy (NFR-S1):**

- 100% local processing - all Ollama communication via localhost:11434
- No network calls to external services during setup
- No telemetry or analytics collection
- Modelfile content stored locally in project repository

**Credentials & Secrets (NFR-S2):**

- No API keys required for Ollama integration (local-only)
- No storage of user credentials
- Ollama SDK handles all authentication internally (if configured by user)

**Code Integrity (NFR-S3):**

- Setup command never modifies source code files
- Only creates custom Ollama model instance (stored in Ollama's model registry)
- User approval not required for setup (informational command, no destructive operations)

**Dependency Security (NFR-S4):**

- Official ollama SDK v0.6.3 (verified via npm audit)
- Minimal dependency tree for OllamaAdapter (only ollama SDK + debug)
- Regular security scanning via npm audit in CI/CD (Epic 0 infrastructure)

### Reliability/Availability

**Graceful Degradation (NFR-R1):**

- Setup command never crashes with unhandled exceptions
- All errors caught, logged to DEBUG, and presented with actionable messages
- No data loss: Failed setup operations can be retried without side effects
- Idempotent design: Safe to run `ollatool setup` multiple times

**Deterministic Behavior (NFR-R2):**

- Same environment + same Modelfile → consistent model creation
- Error conditions always produce same exit code and message structure
- No race conditions in Ollama API calls (SDK handles concurrency)

**Resilience to External Failures (NFR-R3):**

- Ollama daemon down: Clear error message with startup instructions (exit code 3)
- Base model missing: Informational error with pull instructions (exit code 4)
- Network issues during model pull: Allow retry without restarting entire setup
- Ollama API changes: Adapter pattern isolates SDK version changes to infrastructure layer

**Testing Coverage (NFR-R4):**

- Unit test coverage: ≥80% for OllamaAdapter with mocked Ollama SDK
- Integration tests: Mock SDK responses for deterministic testing
- Manual acceptance testing: Validate setup workflow on real Ollama instance
- Error path testing: Verify all error codes and remediation messages

### Observability

**Debug Logging (Epic 0 Infrastructure):**

- DEBUG namespace: `ollatool:ollama`
- Log events: daemon connection, model checks, model creation, errors
- Log level control: `DEBUG=ollatool:ollama ollatool setup`
- No production logging to console (clean UX, errors only)

**Error Reporting:**

- Structured error messages with context (error type, remediation steps, exit code)
- DEBUG logs include full error stack traces for troubleshooting
- Clear user-facing messages without exposing internal implementation details

**Setup Status Feedback:**

```
ollatool setup

Checking Ollama daemon... ✓
Checking base model (qwen2.5-coder:1.5b)... ✓
Checking custom model (ollatool-commit:latest)... [INFO] Already present ✓
✓ Setup complete. Run "ollatool commit" to start.
```

**Error Example:**

```
ollatool setup

Checking Ollama daemon... ✗

[ERROR] ✗ Ollama is not running.

Start Ollama:
  ollama serve

Or install from: https://ollama.com/download

Exit code: 3
```

## Dependencies and Integrations

### Runtime Dependencies

| Package     | Version | Purpose                            | Epic 2 Usage                                                              | Verification Source                            |
| ----------- | ------- | ---------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- |
| `ollama`    | 0.6.3   | Official Ollama JavaScript SDK     | Core integration - daemon communication, model management, generation API | [npm](https://www.npmjs.com/package/ollama)    |
| `commander` | 14.0.2  | CLI framework for command parsing  | Register `setup` command, handle arguments                                | [npm](https://www.npmjs.com/package/commander) |
| `debug`     | ^4.4.3  | Namespaced logging for development | `ollatool:ollama` namespace for diagnostic logs                           | [npm](https://www.npmjs.com/package/debug)     |

### Development Dependencies (Epic 2 Relevant)

| Package        | Version  | Purpose                            | Epic 2 Usage                                |
| -------------- | -------- | ---------------------------------- | ------------------------------------------- |
| `@types/node`  | ^24.10.1 | TypeScript definitions for Node.js | Type safety for Node APIs                   |
| `@types/debug` | ^4.1.12  | TypeScript definitions for debug   | Type safety for debug module                |
| `typescript`   | ^5.9.3   | TypeScript compiler                | Compile Epic 2 code with strict mode        |
| `vitest`       | ^4.0.14  | Modern test runner                 | Unit tests for OllamaAdapter, setup command |
| `execa`        | ^9.6.0   | Process execution (git commands)   | Not used in Epic 2, deferred to Epic 3      |
| `tsup`         | latest   | Build tool for TypeScript ESM      | Compile Epic 2 code to dist/                |

### External Service Integrations

**Ollama Daemon (Required):**

- **Service:** Ollama local LLM runtime
- **Endpoint:** http://localhost:11434 (default)
- **Protocol:** HTTP REST API
- **Authentication:** None (local-only)
- **Version Compatibility:** Ollama v0.1.x and above
- **Integration Point:** OllamaAdapter via official SDK
- **Failure Mode:** Graceful degradation with clear error (exit code 3)

**Base Model (Required):**

- **Model:** qwen2.5-coder:1.5b
- **Source:** Ollama model registry
- **Size:** ~1.2GB (4-bit quantization)
- **Provisioning:** Manual via `ollama pull qwen2.5-coder:1.5b` or setup guidance
- **Custom Instance:** ollatool-commit:latest (created from Modelfile)

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ollatool CLI (Epic 2)                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SetupCommand (features/setup)                           │ │
│ │   ├─ ValidateSetup (use case)                          │ │
│ │   └─ ProvisionModel (use case)                         │ │
│ └──────────────────┬──────────────────────────────────────┘ │
│                    │                                         │
│                    ▼                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ LlmPort (core/ports)                                    │ │
│ │   ├─ checkConnection()                                  │ │
│ │   ├─ checkModel()                                       │ │
│ │   ├─ createModel()                                      │ │
│ │   └─ generate() [Epic 4]                                │ │
│ └──────────────────┬──────────────────────────────────────┘ │
│                    │                                         │
│                    ▼                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ OllamaAdapter (infrastructure/adapters)                 │ │
│ │   ├─ Implements LlmPort interface                       │ │
│ │   ├─ Uses ollama SDK v0.6.3                            │ │
│ │   └─ DEBUG logging: ollatool:ollama                    │ │
│ └──────────────────┬──────────────────────────────────────┘ │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
                     ▼ HTTP (localhost:11434)
┌─────────────────────────────────────────────────────────────┐
│ Ollama Daemon (External Service)                           │
│   ├─ Model Registry (qwen2.5-coder:1.5b)                  │
│   ├─ Custom Models (ollatool-commit:latest)               │
│   └─ Inference Engine                                      │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Management Strategy

**Version Locking:**

- `ollama` SDK: Exact version 0.6.3 (verified compatibility)
- `commander`: Exact version 14.0.2 (stable CLI framework)
- `debug`: Caret range ^4.4.3 (minor updates safe)

**Epic 1 Foundation (Established):**

- TypeScript project with ESM (package.json:5)
- tsup build tooling (package.json:16)
- Vitest testing framework (package.json:22-27)
- Commander.js CLI framework (package.json:54)

**No New Dependencies Required for Epic 2:**

All dependencies already installed during Epic 1 foundation setup. Epic 2 only adds usage of existing `ollama` SDK.

## Acceptance Criteria (Authoritative)

### Story 2.1: Create Ollama Port Interface

1. **AC-2.1.1:** Interface created in `src/core/ports/llm-port.ts`
2. **AC-2.1.2:** Methods defined: `checkConnection()`, `checkModel()`, `createModel()`, `generate()`
3. **AC-2.1.3:** Type definitions for `GenerationOptions` interface with model, temperature, num_ctx, keep_alive
4. **AC-2.1.4:** Interface documented with JSDoc explaining parameters and return types
5. **AC-2.1.5:** Zero external dependencies in core/ layer (verified via import analysis)
6. **AC-2.1.6:** Code adheres to clean-code.md: functions ≤15 lines, self-documenting names

### Story 2.2: Implement OllamaAdapter

1. **AC-2.2.1:** OllamaAdapter created in `src/infrastructure/adapters/ollama-adapter.ts`
2. **AC-2.2.2:** Implements LlmPort interface from core (all methods present)
3. **AC-2.2.3:** Ollama SDK (0.6.3) installed and imported correctly
4. **AC-2.2.4:** Constructor accepts Ollama instance via manual dependency injection
5. **AC-2.2.5:** All port methods implemented with proper error handling (typed errors)
6. **AC-2.2.6:** Connection defaults to http://localhost:11434
7. **AC-2.2.7:** DEBUG logging using `ollatool:ollama` namespace

### Story 2.3: Implement Model Existence Check

1. **AC-2.3.1:** `OllamaAdapter.checkModel()` implemented
2. **AC-2.3.2:** Detects base model existence (`qwen2.5-coder:1.5b`) returns boolean
3. **AC-2.3.3:** Detects custom model existence (`ollatool-commit:latest`) returns boolean
4. **AC-2.3.4:** Uses `ollama.list()` SDK method correctly
5. **AC-2.3.5:** Handles list API errors gracefully (returns false or throws SystemError)
6. **AC-2.3.6:** Unit tests verify base model found returns true, missing returns false

### Story 2.4: Implement Custom Model Creation

1. **AC-2.4.1:** Modelfile created in project root defining system prompt and base model
2. **AC-2.4.2:** `OllamaAdapter.createModel()` implemented
3. **AC-2.4.3:** Uses ollama SDK `create()` method with model name and modelfile content
4. **AC-2.4.4:** Model name: `ollatool-commit:latest`
5. **AC-2.4.5:** Idempotent - doesn't fail if model already exists (check before create)
6. **AC-2.4.6:** System prompt includes Conventional Commits rules per architecture
7. **AC-2.4.7:** Parameters set: temperature=0.2, num_ctx=131072

### Story 2.5: Implement Setup Command

1. **AC-2.5.1:** Setup command registered in Commander.js program
2. **AC-2.5.2:** Command handler in `src/features/setup/setup-command.ts`
3. **AC-2.5.3:** Performs 3-tier validation: daemon → base → custom
4. **AC-2.5.4:** Creates custom model if missing (calls createModel())
5. **AC-2.5.5:** Shows clear success/failure messages with status indicators (✓/✗)
6. **AC-2.5.6:** Idempotent - safe to re-run multiple times
7. **AC-2.5.7:** Success message confirms model ready: "✓ Setup complete. Run 'ollatool commit' to start."

### Story 2.6: Implement Setup Validation Error Handling

1. **AC-2.6.1:** Typed error classes created: `SystemError`, `ValidationError`
2. **AC-2.6.2:** Each error includes remediation guidance (actionable instructions)
3. **AC-2.6.3:** Exit codes: daemon not running = 3 (system), model missing = 4 (validation)
4. **AC-2.6.4:** Error messages reference Ollama docs/installation links
5. **AC-2.6.5:** `ollatool commit` fails fast with setup guidance if Ollama not ready
6. **AC-2.6.6:** DaemonNotRunning error includes "ollama serve" remediation
7. **AC-2.6.7:** Unit tests verify exit codes map correctly for each error type

## Traceability Mapping

| AC#      | Epic 2 Story | Spec Section                                | Component/API                                                              | Test Idea                                                  |
| -------- | ------------ | ------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| AC-2.1.1 | Story 2.1    | Data Models (lines 85-128)                  | `src/core/ports/llm-port.ts`                                               | Verify file exists with interface definition               |
| AC-2.1.2 | Story 2.1    | APIs & Interfaces (lines 89-120)            | `LlmPort.checkConnection()`, `checkModel()`, `createModel()`, `generate()` | TypeScript compilation verifies all methods present        |
| AC-2.1.3 | Story 2.1    | Data Models (lines 122-127)                 | `GenerationOptions` interface                                              | Verify interface has all required fields                   |
| AC-2.1.4 | Story 2.1    | APIs & Interfaces (lines 90-119)            | JSDoc comments on interface methods                                        | Code review: JSDoc explains @param, @returns, @throws      |
| AC-2.1.5 | Story 2.1    | System Architecture Alignment (lines 48-55) | Core layer zero external deps                                              | Import analysis: no ollama, execa, fs in core/             |
| AC-2.1.6 | Story 2.1    | Clean Code Standards                        | Function size, naming                                                      | ESLint validation, code review                             |
| AC-2.2.1 | Story 2.2    | APIs & Interfaces (lines 183-247)           | `src/infrastructure/adapters/ollama-adapter.ts`                            | Verify file exists with class definition                   |
| AC-2.2.2 | Story 2.2    | APIs & Interfaces (line 194)                | `OllamaAdapter implements LlmPort`                                         | TypeScript compilation enforces interface                  |
| AC-2.2.3 | Story 2.2    | Dependencies (line 496)                     | `import { Ollama } from 'ollama'`                                          | Verify import statement, package.json dependency           |
| AC-2.2.4 | Story 2.2    | APIs & Interfaces (lines 195-198)           | Constructor with `private readonly client: Ollama`                         | Unit test: inject mocked Ollama instance                   |
| AC-2.2.5 | Story 2.2    | APIs & Interfaces (lines 200-241)           | Error handling with SystemError, ValidationError                           | Unit test: verify typed errors thrown                      |
| AC-2.2.6 | Story 2.2    | External Service Integrations (line 516)    | `baseUrl = 'http://localhost:11434'`                                       | Unit test: verify default URL                              |
| AC-2.2.7 | Story 2.2    | Observability (lines 449-454)               | `debug('ollatool:ollama')`                                                 | Manual test: DEBUG=ollatool:ollama shows logs              |
| AC-2.3.1 | Story 2.3    | APIs & Interfaces (lines 211-224)           | `async checkModel(modelName: string)`                                      | Unit test: method exists and returns boolean               |
| AC-2.3.2 | Story 2.3    | Workflows (line 323)                        | Base model check logic                                                     | Unit test: mock ollama.list() with base model present      |
| AC-2.3.3 | Story 2.3    | Workflows (line 336)                        | Custom model check logic                                                   | Unit test: mock ollama.list() with custom model present    |
| AC-2.3.4 | Story 2.3    | APIs & Interfaces (line 213)                | `await this.client.list()`                                                 | Unit test: verify SDK method called                        |
| AC-2.3.5 | Story 2.3    | APIs & Interfaces (lines 217-223)           | Error handling on list failure                                             | Unit test: mock SDK error, verify SystemError thrown       |
| AC-2.3.6 | Story 2.3    | Testing Coverage (NFR-R4)                   | Unit test suite                                                            | Co-located test file with mock scenarios                   |
| AC-2.4.1 | Story 2.4    | Data Models (lines 158-179)                 | Modelfile in project root                                                  | Verify file exists with FROM, SYSTEM, PARAMETER            |
| AC-2.4.2 | Story 2.4    | APIs & Interfaces (lines 226-241)           | `async createModel(modelName, modelfileContent)`                           | Unit test: method exists and calls SDK                     |
| AC-2.4.3 | Story 2.4    | APIs & Interfaces (lines 228-232)           | `await this.client.create({...})`                                          | Unit test: verify SDK create() called with params          |
| AC-2.4.4 | Story 2.4    | Workflows (line 336)                        | Custom model name constant                                                 | Verify model name matches 'ollatool-commit:latest'         |
| AC-2.4.5 | Story 2.4    | Workflows (line 338)                        | Idempotent check before create                                             | Unit test: verify checkModel() called before createModel() |
| AC-2.4.6 | Story 2.4    | Data Models (lines 164-174)                 | Modelfile SYSTEM prompt content                                            | Code review: Conventional Commits rules present            |
| AC-2.4.7 | Story 2.4    | Data Models (lines 177-178)                 | Modelfile PARAMETER directives                                             | Verify temperature 0.2, num_ctx 131072 in Modelfile        |
| AC-2.5.1 | Story 2.5    | APIs & Interfaces (lines 265-266)           | `program.command('setup')`                                                 | Manual test: ollatool setup --help shows command           |
| AC-2.5.2 | Story 2.5    | Services & Modules (line 78)                | `src/features/setup/setup-command.ts`                                      | Verify file exists with SetupCommand class                 |
| AC-2.5.3 | Story 2.5    | Workflows (lines 302-360)                   | 3-tier validation flow                                                     | Integration test: verify all phases execute                |
| AC-2.5.4 | Story 2.5    | Workflows (line 339)                        | Conditional model creation                                                 | Unit test: createModel() called only if missing            |
| AC-2.5.5 | Story 2.5    | Observability (lines 462-488)               | Status feedback messages                                                   | Manual test: verify ✓/✗ indicators display                 |
| AC-2.5.6 | Story 2.5    | Reliability (lines 420-425)                 | Idempotent design                                                          | Manual test: run setup twice, second run skips creation    |
| AC-2.5.7 | Story 2.5    | Workflows (line 359)                        | Success message                                                            | Manual test: verify exact message displayed                |
| AC-2.6.1 | Story 2.6    | Data Models (lines 130-156)                 | SystemError, ValidationError classes                                       | Verify classes exist with correct inheritance              |
| AC-2.6.2 | Story 2.6    | Data Models (line 138)                      | `public readonly remediation` field                                        | Unit test: verify error instances have remediation         |
| AC-2.6.3 | Story 2.6    | Data Models (lines 145, 151)                | Exit code 3 for SystemError, 4 for ValidationError                         | Unit test: verify error.code values                        |
| AC-2.6.4 | Story 2.6    | Observability (lines 475-487)               | Error messages with URLs                                                   | Manual test: verify https://ollama.com/download link       |
| AC-2.6.5 | Story 2.6    | Out of Scope                                | Commit command (Epic 4)                                                    | Deferred: commit validation in Epic 4                      |
| AC-2.6.6 | Story 2.6    | Observability (lines 482-484)               | DaemonNotRunning remediation                                               | Unit test: verify "ollama serve" in remediation            |
| AC-2.6.7 | Story 2.6    | Testing Coverage (NFR-R4)                   | Error code mapping tests                                                   | Unit test: verify all error types have correct codes       |

## Risks, Assumptions, Open Questions

### Risks

**RISK-2.1: Ollama SDK API Changes (Medium Probability, High Impact)**

- **Description:** Ollama SDK v0.6.3 is relatively new; API may change in future versions
- **Impact:** Breaking changes could require adapter refactoring
- **Mitigation:**
  - Lock exact version (0.6.3, not ^0.6.3) in package.json ✓ (already done)
  - Hexagonal architecture isolates SDK changes to OllamaAdapter only
  - Comprehensive unit tests detect breaking changes during npm updates
- **Contingency:** If SDK breaks, adapter layer provides isolation - only 1 file to update

**RISK-2.2: Over-Testing Infrastructure (Low Probability, Medium Impact - Epic 1 Learning)**

- **Description:** Epic 1 retro identified tendency to over-test infrastructure vs business logic
- **Impact:** Wasted time testing ports/adapters with minimal value
- **Mitigation:**
  - Focus testing on OllamaAdapter business logic (connection handling, error mapping)
  - Minimal testing of interface definitions (TypeScript provides compile-time safety)
  - Test behavior, not implementation details
- **Epic 1 Lesson Applied:** "Test business logic, not infrastructure" (epic-1-retro:75)

**RISK-2.3: Linting Timing Regression (Low Probability, Low Impact - Epic 1 Learning)**

- **Description:** Epic 1 did linting last, requiring rework; risk of repeating same mistake
- **Impact:** Rework if code written doesn't pass linting standards
- **Mitigation:**
  - Run `npm run lint:fix` BEFORE committing any Story 2.x code
  - Use ESLint + Prettier auto-fix during development (IDE integration)
  - Reference dev/styleguides/clean-code.md BEFORE writing code, not after
- **Epic 1 Lesson Applied:** "Quality standards at START, not end" (epic-1-retro:173)

**RISK-2.4: Ollama Daemon Not Running (High Probability, User Error)**

- **Description:** Users may forget to start Ollama daemon before running setup
- **Impact:** Setup command fails with connection error
- **Mitigation:**
  - Clear error message with "ollama serve" remediation (AC-2.6.6)
  - Exit code 3 (system error) signals environmental issue
  - Documentation in README includes daemon startup instructions
- **Acceptance:** This is expected user error, not a defect; clear messaging is sufficient

### Assumptions

**ASSUME-2.1: Ollama Daemon Availability**

- User has Ollama installed and can run `ollama serve`
- Daemon accessible at http://localhost:11434 (default)
- No firewall blocking localhost connections

**ASSUME-2.2: Base Model Acquisition**

- User responsible for pulling `qwen2.5-coder:1.5b` before running setup
- User has sufficient disk space (~1.2GB) for base model
- Network connectivity available for initial model pull

**ASSUME-2.3: Model Performance Verified (Epic 0 Retro Learning)**

- Qwen 2.5 Coder 1.5B validated by project lead's real-world experience
- 90%+ acceptance rate target achievable (validated post-Epic 1)
- No separate "model validation" prep work required
- **Epic 0 Lesson Applied:** "Trust real experience over theory" (epic-0-retro:333)

**ASSUME-2.4: No Configuration Required (ADR-005)**

- Zero-config MVP approach: hardcoded model name, temperature, URL
- Users accept defaults without customization
- Configuration support deferred to post-MVP

**ASSUME-2.5: TypeScript Strict Mode (Epic 1 Foundation)**

- All code compiles with TypeScript strict mode enabled
- ESLint + Prettier configured (Epic 1)
- No compilation errors introduced

### Implementation Decisions (Resolved)

**DECISION-2.1: Configuration Pattern**

- **Decision:** Configuration-based approach using direct SDK parameters (CONVENTIONAL_COMMIT_MODEL_CONFIG)
- **Rationale:** Eliminates file parsing complexity, uses Ollama JS SDK as intended, type-safe configuration

**DECISION-2.2: Model Creation Progress Feedback**

- **Decision:** Simple spinner during model creation
- **Rationale:** Faster to implement, sufficient for MVP user experience

**DECISION-2.3: Retry Logic for API Calls**

- **Decision:** No retry - fail immediately on API failures
- **Rationale:** Local localhost calls have minimal failure opportunities; fail-fast principle applies

**DECISION-2.4: Validation Use Case Separation**

- **Decision:** Separate ValidateSetup and ProvisionModel classes
- **Rationale:** Follows hexagonal architecture patterns with clean single-responsibility use cases

## Test Strategy Summary

### Unit Testing Approach

**Test Boundary: OllamaAdapter (Infrastructure Layer)**

- **Mock:** Ollama SDK responses using Vitest vi.mock()
- **Test Cases:**
  - checkConnection() returns true when daemon responds
  - checkConnection() returns false when ECONNREFUSED
  - checkModel() returns true when model in list
  - checkModel() returns false when model not in list
  - checkModel() throws SystemError when list() fails
  - createModel() calls SDK create() with correct params
  - createModel() throws ValidationError on failure
- **Co-located:** `ollama-adapter.test.ts` next to implementation

**Test Boundary: Error Classes**

- **Test Cases:**
  - SystemError has exit code 3
  - ValidationError has exit code 4
  - Errors include remediation when provided
  - Error messages formatted correctly
- **Co-located:** `errors.types.test.ts`

**Test Boundary: Setup Command**

- **Mock:** LlmPort interface (not concrete OllamaAdapter)
- **Test Cases:**
  - Setup succeeds when all validations pass
  - Setup throws SystemError when daemon down
  - Setup throws ValidationError when base model missing
  - Setup skips model creation if custom model exists (idempotency)
  - Error messages displayed with exit codes
- **Co-located:** `setup-command.test.ts`

### Integration Testing Approach

**Scope:** Deferred to manual acceptance testing

- Epic 2 focuses on unit tests with mocked dependencies
- Manual testing validates real Ollama daemon integration
- Automated integration tests added in Epic 6 (Performance & Error Handling)

### Manual Acceptance Testing

**Test Scenario 1: Happy Path**

```bash
# Preconditions: Ollama running, base model pulled
ollatool setup

# Expected:
# ✓ Daemon check passes
# ✓ Base model check passes
# ✓ Custom model created (or already exists)
# ✓ "Setup complete" message
# Exit code: 0
```

**Test Scenario 2: Daemon Not Running**

```bash
# Preconditions: Ollama stopped
ollatool setup

# Expected:
# ✗ Daemon check fails
# Error message with "ollama serve" remediation
# Exit code: 3
```

**Test Scenario 3: Base Model Missing**

```bash
# Preconditions: Ollama running, base model NOT pulled
ollatool setup

# Expected:
# ✓ Daemon check passes
# ✗ Base model check fails
# Error message with "ollama pull qwen2.5-coder:1.5b" remediation
# Exit code: 4
```

**Test Scenario 4: Idempotency**

```bash
# Run setup twice
ollatool setup  # Creates custom model
ollatool setup  # Skips creation, shows "Already present"

# Expected: Both runs succeed, second run faster
```

### Code Quality Gates (Epic 1 Infrastructure)

- **Linting:** `npm run lint` passes (ESLint strict rules)
- **Formatting:** `npm run format:check` passes (Prettier)
- **Type Safety:** `npm run typecheck` passes (TypeScript strict mode)
- **Tests:** `npm run test` passes (all unit tests green)
- **Build:** `npm run build` succeeds (tsup compilation)
- **PR Script:** `npm run pr` runs all gates sequentially (MANDATORY validation before story completion)

### Testing Anti-Patterns to Avoid (Epic 1 Retro Learning)

❌ **Don't Test:**

- Interface definitions (TypeScript enforces)
- Constructor parameter assignment
- Simple getters/setters
- DEBUG log statements

✅ **Do Test:**

- Error handling paths
- Business logic (validation sequences)
- Error code mapping
- SDK integration points (with mocks)
