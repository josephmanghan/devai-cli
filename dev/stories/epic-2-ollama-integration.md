# Epic 2: Ollama Integration & Model Management - Story Breakdown

**Goal:** Enable reliable connection to Ollama and model lifecycle management
**User Value:** Users can successfully setup the tool and verify Ollama connectivity before attempting commits
**FRs Covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR45

---

## Story 2.1: Create Ollama Port Interface

**As a** developer
**I want** a port interface defining Ollama operations
**So that** the core domain doesn't depend on the Ollama SDK implementation

**Acceptance Criteria:**

- [ ] Interface created in `src/core/ports/llm-port.ts`
- [ ] Methods defined: `checkConnection()`, `checkModel()`, `createModel()`, `generate()`
- [ ] Type definitions for model parameters and responses
- [ ] Interface documented with JSDoc
- [ ] Zero external dependencies in core/
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Hexagonal architecture: core defines ports (interfaces)
- Infrastructure layer will implement this port as OllamaAdapter
- Interface should be LLM-agnostic (supports future OpenAI fallback)
- Method signatures derived from FR7-FR12 requirements

**Testing Deliverables:**

- No runtime tests (interface only)
- Verify TypeScript compiles with strict mode
- Verify core/ has no external dependencies

**FRs Covered:** FR49 (extensible architecture pattern)

---

## Story 2.2: Implement OllamaAdapter

**As a** developer
**I want** an Ollama adapter implementing the LLM port
**So that** I can interact with the Ollama daemon via the official SDK

**Acceptance Criteria:**

- [ ] OllamaAdapter created in `src/infrastructure/adapters/ollama-adapter.ts`
- [ ] Implements LLM port interface from core
- [ ] Ollama SDK (0.6.3) installed and imported
- [ ] Constructor accepts Ollama instance (manual DI)
- [ ] All port methods implemented with proper error handling
- [ ] Connection defaults to http://localhost:11434
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies official ollama SDK v0.6.3
- Manual dependency injection (no IoC container)
- Error handling: catch SDK errors, throw typed domain errors
- HTTP client from ollama SDK handles daemon communication

**Testing Deliverables:**

- Unit tests with mocked Ollama SDK
- Test: checkConnection() detects daemon availability
- Test: Error handling for connection failures
- Co-located test: `ollama-adapter.test.ts`

**FRs Covered:** FR7 (daemon connection detection)

---

## Story 2.3: Implement Model Existence Check

**As a** developer
**I want** to verify base model and custom model existence
**So that** setup can detect missing models before attempting operations

**Acceptance Criteria:**

- [ ] OllamaAdapter.checkModel() implemented
- [ ] Detects base model existence (`qwen2.5-coder:1.5b`)
- [ ] Detects custom model existence (`ollatool-commit:latest`)
- [ ] Returns clear boolean or typed result
- [ ] Handles list API errors gracefully
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Uses ollama SDK `list()` method
- Base model: `qwen2.5-coder:1.5b` per architecture decision
- Custom model: `ollatool-commit:latest` (created from Modelfile)
- 3-tier validation: daemon → base model → custom model (FR8)

**Testing Deliverables:**

- Unit test: base model found returns true
- Unit test: base model missing returns false
- Unit test: custom model detection works independently
- Mock ollama.list() responses

**FRs Covered:** FR8 (model existence validation)

---

## Story 2.4: Implement Custom Model Creation

**As a** developer
**I want** to create the custom `ollatool-commit` model from a Modelfile
**So that** the system prompt is baked into the model instance

**Acceptance Criteria:**

- [ ] Modelfile created defining system prompt and base model
- [ ] OllamaAdapter.createModel() implemented
- [ ] Uses ollama SDK `create()` method
- [ ] Model name: `ollatool-commit:latest`
- [ ] Idempotent (safe to run multiple times)
- [ ] Progress feedback during creation (optional spinner)

**Technical Notes:**

- Architecture specifies Modelfile-based prompt engineering
- Base: `FROM qwen2.5-coder:1.5b`
- System prompt defines Conventional Commits expert role
- Parameters: temperature=0.2, num_ctx=131072, keep_alive=0
- Modelfile content comes from prompt engineering research

**Testing Deliverables:**

- Unit test: createModel() calls SDK with correct params
- Unit test: Idempotency check (doesn't fail if model exists)
- Integration test: Actually create model on dev machine (manual)

**FRs Covered:** FR9 (custom model creation), FR10 (Modelfile system prompt)

---

## Story 2.5: Implement Setup Command

**As a** developer
**I want** an `ollatool setup` command
**So that** users can initialize Ollama integration before first commit

**Acceptance Criteria:**

- [ ] Setup command registered in Commander.js
- [ ] Command handler in `src/features/setup/setup-command.ts`
- [ ] Performs 3-tier validation: daemon → base → custom
- [ ] Creates custom model if missing
- [ ] Shows clear success/failure messages
- [ ] Idempotent (safe to re-run)

**Technical Notes:**

- Entry point: `ollatool setup`
- Uses OllamaAdapter for all Ollama operations
- Manual DI: instantiate Ollama SDK and inject into adapter
- Error handling: clear guidance if daemon not running
- Success message confirms model ready for commit command

**Testing Deliverables:**

- Unit test: setup command handler logic
- Unit test: Error handling for missing daemon
- Unit test: Success path when all checks pass
- Manual test: Run `ollatool setup` end-to-end

**FRs Covered:** FR45 (`ollatool setup` command)

---

## Story 2.6: Implement Setup Validation Error Handling

**As a** developer
**I want** clear error messages when setup validation fails
**So that** users know exactly how to fix their environment

**Acceptance Criteria:**

- [ ] Typed error classes for: DaemonNotRunning, BaseModelMissing, CustomModelFailed
- [ ] Each error includes remediation guidance
- [ ] Exit codes: daemon=3 (system), model=4 (validation)
- [ ] Error messages reference Ollama docs/installation
- [ ] `ollatool commit` fails fast with setup guidance if not ready

**Technical Notes:**

- Architecture specifies typed error classes with exit codes
- User errors (exit 2): N/A for setup (all system/validation)
- System errors (exit 3): daemon not running (check Ollama)
- Validation errors (exit 4): model missing (run `ollatool setup`)
- Actionable messages per PRD requirement (FR38-40)

**Testing Deliverables:**

- Unit test: DaemonNotRunning error includes "brew services start ollama"
- Unit test: BaseModelMissing error includes "ollama pull qwen2.5-coder:1.5b"
- Unit test: Exit codes map correctly
- Co-located tests for error classes

**FRs Covered:** FR11 (fail fast validation), FR12 (no auto-downloads), FR38-40 (error guidance)

---

## Epic 2 Summary

**Total Stories:** 6
**Estimated Complexity:** Medium-High (external system integration)
**Dependencies:** Epic 1 (Foundation) must be complete
**Output:** Working `ollatool setup` command that validates and configures Ollama

**Completion Criteria:**

- All 6 stories pass acceptance criteria
- `ollatool setup` successfully creates custom model
- Clear error messages when Ollama daemon not running
- Unit tests cover OllamaAdapter with mocked SDK
- Manual testing confirms model creation works end-to-end
