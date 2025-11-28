Project Path: stories

Source Tree:

```txt
stories
├── epic-0-test-infrastructure.md
├── epic-1-foundation.md
├── epic-2-ollama-integration.md
├── epic-3-git-context.md
├── epic-4-ai-generation.md
├── epic-5-interactive-workflow.md
├── epic-6-performance-errors.md
└── epic-7-manual-acceptance-testing.md

```

`epic-0-test-infrastructure.md`:

```md
# Epic 0: Test Infrastructure & Model Validation - Story Breakdown

**Goal:** Establish comprehensive test infrastructure and validate model selection before implementation
**User Value:** Ensures implementation choices are validated and testable; prevents architecture mistakes
**FRs Covered:** None (this is foundational work that enables all FRs to be testable)

---

## Story 0.1: Create Test Infrastructure Core

**As a** developer
**I want** comprehensive test infrastructure with GitTestHarness and MockLlmProvider
**So that** all subsequent development can be reliably tested without external dependencies

**Acceptance Criteria:**

- [ ] `tests/helpers/git-harness.ts` implemented with GitTestHarness class
- [ ] `tests/helpers/mock-llm-provider.ts` implemented with MockLlmProvider class
- [ ] `tests/helpers/performance-tracker.ts` implemented for metrics collection
- [ ] All helper classes include proper TypeScript types and documentation
- [ ] Each helper has corresponding unit tests validating core functionality
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- GitTestHarness creates isolated temp repositories for each test
- MockLlmProvider provides instant, deterministic responses without Ollama
- PerformanceTracker measures CLI execution time and resource usage
- Follow hexagonal architecture patterns for test adapters

**Testing Deliverables:**

- Unit tests for all helper classes
- Integration tests showing GitTestHarness prevents repository pollution
- MockLlmProvider validation tests for deterministic behavior

---

## Story 0.2: Configure Vitest Test Framework

**As a** developer
**I want** a properly configured Vitest setup with coverage thresholds
**So that** I have fast, reliable testing with automated quality gates

**Acceptance Criteria:**

- [ ] `vitest.config.ts` configured with Node.js environment and globals
- [ ] Coverage thresholds set: 80% lines, branches, functions, statements
- [ ] Path aliases configured: `@/` → src, `@tests/` → tests
- [ ] Test timeout increased to 10s for git operations
- [ ] Coverage excludes test files and type definitions
- [ ] `package.json` includes test scripts: test, test:unit, test:integration, test:e2e-ollama

**Technical Notes:**

- Use V8 provider for fast coverage reporting
- Configure separate test suites for unit, integration, and E2E tests
- Enable watch mode for development
- Set appropriate hook timeouts for git and Ollama operations

**Testing Deliverables:**

- Verify all test scripts execute successfully
- Coverage report generation works correctly
- Path aliases resolve properly in test imports

---

## Story 0.3: Implement DEBUG Logging System

**As a** developer
**I want** comprehensive DEBUG logging with debug library integration
**So that** I can observe internal state during test failures and development

**Acceptance Criteria:**

- [ ] `src/core/logger.ts` implemented with debug library integration
- [ ] DEBUG namespace configured as `ollatool:*` for all components
- [ ] AppError class extends Error with serialization support
- [ ] Critical paths include debug logging (Ollama requests, git operations, validation)
- [ ] AppError instances capture full context for test assertions
- [ ] `debug` package added to dependencies

**Technical Notes:**

- Use structured logging with objects for complex data
- Include timestamps and correlation IDs where helpful
- Ensure no console output in normal operation (only with DEBUG env var)
- Log levels: info for operations, error for failures, debug for detailed state

**Testing Deliverables:**

- Unit tests for logger functionality
- Integration tests showing debug output appears only when DEBUG env var set
- AppError serialization tests for complete error context

---

## Story 0.4: Create Model Evaluation Framework

**As a** developer
**I want** a comprehensive model evaluation system
**So that** I can make data-driven decisions about which SLM to use for the MVP

**Acceptance Criteria:**

- [ ] `tests/fixtures/model-evaluation/` directory with 20+ diverse diff scenarios
- [ ] `scripts/evaluate-models.ts` script implementing weighted scoring system
- [ ] Evaluation script tests qwen2.5-coder:1.5b, llama3.2:3b, codellama:7b
- [ ] Scoring criteria: format compliance (30%), description quality (25%), body quality (20%), performance (15%), retry rate (10%)
- [ ] Results automatically documented in `dev/model-evaluation-results.md`
- [ ] Script can run with `npm run model-evaluation`

**Technical Notes:**

- Test fixtures cover: feat additions, bug fixes, refactoring, docs, tests, config, large diffs
- Weighted scoring system provides objective comparison between models
- Performance measured on reference hardware (document test environment)
- Include edge cases: no staged changes, model hallucination, retry scenarios

**Testing Deliverables:**

- Unit tests for evaluation logic and scoring algorithm
- Integration tests with mock Ollama responses
- Validation that all fixture scenarios produce meaningful results

---

## Story 0.5: Setup CI/CD Pipeline with Real Ollama Testing

**As a** developer
**I want** a comprehensive CI/CD pipeline that validates real Ollama integration
**So that** model quality and performance are continuously validated on every commit

**Acceptance Criteria:**

- [ ] `.github/workflows/tests.yml` with 3-tier strategy (unit/integration/e2e-ollama)
- [ ] Unit tests run on fast Ubuntu runners (30s target)
- [ ] Integration tests run on Ubuntu runners with mocks (1-2min target)
- [ ] E2E Ollama tests run on macOS runners (5-10min target)
- [ ] Ollama installation and model provisioning automated in CI
- [ ] Performance metrics collected and uploaded as artifacts
- [ ] Branch protection rules require all 3 test tiers to pass
- [ ] Codecov integration configured for coverage reporting

**Technical Notes:**

- Use macOS runners for performance parity with target hardware
- Cache Ollama models between runs to reduce CI time
- Implement performance regression detection (block PRs >20% degradation)
- Upload test results and performance data for post-mortem analysis

**Testing Deliverables:**

- CI pipeline runs successfully with green checkmarks
- Performance baseline established and tracked
- All test tiers execute reliably in CI environment

---

## Story 0.6: Implement Manual Acceptance Testing Framework

**As a** developer
**I want** a structured framework for manual acceptance testing across 50+ commits
**So that** I can validate the 90% acceptance rate requirement from the PRD

**Acceptance Criteria:**

- [ ] `dev/acceptance-log.md` template created for tracking test results
- [ ] Acceptance testing checklist covering 7 scenario categories (feat, fix, refactor, docs, test, config, mixed)
- [ ] Test repository setup with isolated environment for formal testing
- [ ] Clear acceptance criteria defined for "accepted" vs "rejected" commits
- [ ] Data collection template for systematic quality assessment
- [ ] Protocol for 50+ commit validation with measurable success criteria

**Technical Notes:**

- Categories: Feature additions (10), Bug fixes (10), Refactoring (10), Documentation (5), Testing (5), Configuration (5), Mixed/Complex (5)
- Accepted = accurate description, correct format, no editing needed, useful context
- Rejected = mischaracterized change, too vague, requires significant editing, missing critical context
- Track patterns of failure to identify improvement areas

**Testing Deliverables:**

- Acceptance testing process validated through pilot testing
- Template usability confirmed
- Success criteria clearly measurable and documented

---

## Story 0.7: Execute Model Evaluation and Document Decision

**As a** developer
**I want** to complete model evaluation and make an architecture decision
**So that** I can proceed with implementation confidence in the selected model

**Acceptance Criteria:**

- [ ] Model evaluation script executed against all candidate models
- [ ] `dev/model-evaluation-results.md` completed with comprehensive analysis
- [ ] Architecture decision documented: proceed with qwen2.5-coder or switch models
- [ ] Decision criteria include: format compliance rate, acceptance threshold, performance targets
- [ ] If primary model fails, fallback model selected and justified
- [ ] Model configuration (temperature, keep_alive, context window) documented for implementation

**Technical Notes:**

- Must achieve 90%+ format compliance rate to proceed
- Performance targets: <5s cold start, <3s warm inference on M1/M2
- If no model meets criteria, revisit prompt engineering strategy
- Document any trade-offs and decision rationale

**Testing Deliverables:**

- Model selection validated against documented criteria
- Performance baseline established for selected model
- Implementation requirements clearly specified

---

## Story 0.8: Finalize Test Infrastructure Baseline

**As a** developer
**I want** all test infrastructure components integrated and validated
**So that** I have a solid foundation for beginning story implementation

**Acceptance Criteria:**

- [ ] All test infrastructure components working together seamlessly
- [ ] DEBUG logging functional with `DEBUG=ollatool:* npm test`
- [ ] Performance baseline established with measurements from CLI startup to commit preview
- [ ] Manual acceptance testing process documented and ready for execution
- [ ] All CI/CD pipelines running successfully with green checkmarks
- [ ] Test documentation complete and validated
- [ ] Ready to begin Epic 1 implementation with full test infrastructure support

**Technical Notes:**

- Verify end-to-end test execution from unit through E2E
- Confirm performance tracking works across all test tiers
- Validate that test infrastructure supports both development and CI environments
- Ensure all test patterns and helpers are documented and accessible

**Testing Deliverables:**

- Integration test validating complete test infrastructure
- Performance benchmark report establishing baseline metrics
- Documentation review confirming all components are accessible and understood

---

**Epic Success Criteria:**

- [ ] All test infrastructure components implemented and validated
- [ ] Model evaluation complete with documented decision
- [ ] CI/CD pipeline running successfully (all 3 test tiers green)
- [ ] DEBUG logging functional (test with `DEBUG=ollatool:* npm test`)
- [ ] Manual acceptance testing process documented and ready for execution
- [ ] Performance baseline established (measure CLI startup time)
- [ ] **BLOCKER REMOVED:** Ready to proceed with Epic 1 implementation

**Dependencies:** None (this is the critical foundation epic that enables all other development)

**Epic Duration Estimate:** 8-12 focused hours across all stories
```

`epic-1-foundation.md`:

```md
# Epic 1: Foundation & Project Setup - Story Breakdown

**Goal:** Establish development infrastructure and CLI framework
**User Value:** Creates working project foundation that enables all subsequent features
**FRs Covered:** FR49 (extensible architecture)

---

## Story 1.1: Initialize TypeScript Project with ESM

**As a** developer
**I want** a working TypeScript project with modern ESM configuration
**So that** I have a solid foundation for building the CLI tool

**Acceptance Criteria:**

- [ ] Package.json created with `"type": "module"` and correct metadata
- [ ] TypeScript configured with NodeNext resolution, ES2022 target, strict mode
- [ ] tsconfig.json includes proper paths and module resolution settings
- [ ] Project compiles successfully with `tsc --noEmit`
- [ ] Basic package.json scripts: `build`, `dev`, `typecheck`
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Follow `dev/styleguides/nodejs-cli-setup-patterns.md` for configuration
- Package name: `ollatool` (per PRD)
- Node version constraint: `>=20.0.0`
- ESM required by execa 9.x dependency (architecture decision)

**Testing Deliverables:**

- Verify `tsc --noEmit` passes
- Verify `npm run build` completes without errors

---

## Story 1.2: Configure Build Tooling (tsup)

**As a** developer
**I want** fast ESM bundling with tsup
**So that** the CLI builds quickly and outputs optimized ESM bundles

**Acceptance Criteria:**

- [ ] tsup installed and configured in tsup.config.ts
- [ ] Build outputs to `dist/` directory with ESM format
- [ ] Entry point configured for CLI (src/index.ts)
- [ ] Source maps enabled for debugging
- [ ] Build script produces executable bundle

**Technical Notes:**

- Architecture specifies tsup for fast ESM bundling
- Configuration: ESM format, minification enabled, target ES2022
- Output: `dist/index.js` as main entry point

**Testing Deliverables:**

- Verify `npm run build` produces dist/index.js
- Verify bundle is valid ESM (can be imported)
- Basic smoke test: `node dist/index.js --help` (after CLI setup)

---

## Story 1.3: Setup Testing Framework (Vitest)

**As a** developer
**I want** Vitest configured with co-located test pattern
**So that** I can write and run unit tests efficiently

**Acceptance Criteria:**

- [ ] Vitest installed with TypeScript support
- [ ] vitest.config.ts configured for Node environment
- [ ] Test script added to package.json
- [ ] Example test file demonstrates co-located pattern works
- [ ] Tests run successfully with `npm test`

**Technical Notes:**

- Architecture specifies Vitest for modern ESM test runner
- Co-located pattern: `*.test.ts` files adjacent to source files
- Configuration: globals enabled, node environment, ESM support

**Testing Deliverables:**

- Create `src/example.test.ts` to verify setup
- Verify `npm test` discovers and runs tests
- Verify test coverage reporting works

---

## Story 1.4: Setup CLI Framework (Commander.js)

**As a** developer
**I want** Commander.js integrated with basic CLI structure
**So that** I can parse commands and arguments

**Acceptance Criteria:**

- [ ] Commander.js installed (v14.0.2)
- [ ] src/index.ts created as CLI entry point
- [ ] Basic program structure with version and description
- [ ] Placeholder `commit` command registered
- [ ] `--help` and `--version` flags work (FR47, FR48)
- [ ] Shebang and executable permissions configured

**Technical Notes:**

- Architecture specifies Commander.js v14.0.2
- Entry point: src/index.ts (maps to dist/index.js after build)
- Bin field in package.json: `"ollatool": "./dist/index.js"`
- Placeholder commit command can just log "Not implemented"

**Testing Deliverables:**

- Unit test for CLI initialization
- Manual verification: `ollatool --help` shows usage
- Manual verification: `ollatool --version` shows version

**FRs Covered:** FR47 (--help), FR48 (--version)

---

## Story 1.5: Setup Hexagonal Architecture Structure

**As a** developer
**I want** hexagonal directory structure with clear separation of concerns
**So that** the codebase remains maintainable and testable

**Acceptance Criteria:**

- [ ] Directory structure created: `src/core/`, `src/infrastructure/`, `src/features/`, `src/ui/`
- [ ] README.md documents architecture pattern and directory purposes
- [ ] Example interface created in core/ demonstrating port pattern
- [ ] Example adapter created in infrastructure/ implementing port
- [ ] Dependencies flow inward (core has zero external deps)

**Technical Notes:**

- Architecture specifies "Pragmatic Hexagonal" with manual DI
- Core layer: domain logic, ports (interfaces)
- Infrastructure layer: adapters (OllamaAdapter, ShellGitAdapter)
- Features layer: use cases, command handlers
- UI layer: @clack/prompts, CLI commands
- No IoC container (manual dependency injection)

**Testing Deliverables:**

- Document architecture pattern in src/README.md
- Verify core/ has no dependencies in package.json imports
- Create architecture diagram (optional but helpful)

**FRs Covered:** FR49 (extensible architecture)

---

## Story 1.6: Setup Linting & Formatting

**As a** developer
**I want** ESLint and Prettier configured
**So that** code quality and style remain consistent

**Acceptance Criteria:**

- [ ] ESLint installed with TypeScript support
- [ ] Prettier installed and configured
- [ ] .eslintrc.json configured per styleguide standards
- [ ] .prettierrc.json configured per styleguide standards
- [ ] Lint and format scripts added to package.json
- [ ] Pre-commit hook optional but recommended

**Technical Notes:**

- Follow `dev/styleguides/nodejs-cli-setup-patterns.md`
- ESLint extends recommended TypeScript rules
- Prettier integrates with ESLint (no conflicts)
- File naming: kebab-case per architecture

**Testing Deliverables:**

- Verify `npm run lint` passes on all source files
- Verify `npm run format` formats code correctly
- Create .eslintignore and .prettierignore files

---

## Epic 1 Summary

**Total Stories:** 6
**Estimated Complexity:** Medium (foundational setup, no business logic)
**Dependencies:** None (enables all other epics)
**Output:** Working TypeScript + ESM + Vitest + Commander.js project with hexagonal structure

**Completion Criteria:**

- All 6 stories pass acceptance criteria
- `npm run build` produces executable CLI
- `npm test` runs test suite successfully
- `ollatool --help` and `ollatool --version` work
- Project structure follows hexagonal pattern per architecture
```

`epic-2-ollama-integration.md`:

```md
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
```

`epic-3-git-context.md`:

```md
# Epic 3: Git Context Gathering & Validation - Story Breakdown

**Goal:** Enable tool to read git state and validate preconditions
**User Value:** Users get immediate, clear feedback about their git state (staged changes, repository status) before expensive operations
**FRs Covered:** FR1, FR2, FR3, FR4, FR6, FR33, FR36

---

## Story 3.1: Create Git Port Interface

**As a** developer
**I want** a port interface defining git operations
**So that** the core domain doesn't depend on shell command execution

**Acceptance Criteria:**

- [ ] Interface created in `src/core/ports/git-port.ts`
- [ ] Methods defined: `isGitRepository()`, `getStagedDiff()`, `getBranchName()`, `commitChanges()`
- [ ] Type definitions for diff output and commit parameters
- [ ] Interface documented with JSDoc
- [ ] Zero external dependencies in core/
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Hexagonal architecture: core defines ports (interfaces)
- Infrastructure layer will implement as ShellGitAdapter using execa
- Interface methods derived from FR1-FR4, FR33, FR36
- Diff format: unified diff string (git diff --staged output)

**Testing Deliverables:**

- No runtime tests (interface only)
- Verify TypeScript compiles with strict mode
- Verify core/ maintains zero external dependencies

**FRs Covered:** FR49 (extensible architecture)

---

## Story 3.2: Implement ShellGitAdapter

**As a** developer
**I want** a git adapter that executes git commands via shell
**So that** I can read repository state without git library dependencies

**Acceptance Criteria:**

- [ ] ShellGitAdapter created in `src/infrastructure/adapters/shell-git-adapter.ts`
- [ ] Implements Git port interface from core
- [ ] execa (9.6.0) installed and imported
- [ ] Constructor accepts cwd parameter (manual DI)
- [ ] All port methods implemented with error handling
- [ ] Commands use execa for shell execution
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies execa 9.6.0 for shell commands
- ESM-native, replaces child_process with better API
- Default cwd to process.cwd() if not provided
- Error handling: catch execa errors, throw typed domain errors
- Commands: `git rev-parse --is-inside-work-tree`, `git diff --staged`, etc.

**Testing Deliverables:**

- Unit tests with mocked execa
- Test: isGitRepository() returns true/false correctly
- Test: Error handling for git command failures
- Co-located test: `shell-git-adapter.test.ts`

**FRs Covered:** FR1 (git repository detection)

---

## Story 3.3: Implement Staged Changes Detection

**As a** developer
**I want** to detect whether staged changes exist
**So that** the commit command can fail fast if nothing to commit

**Acceptance Criteria:**

- [ ] ShellGitAdapter.getStagedDiff() implemented
- [ ] Returns empty string if no staged changes
- [ ] Returns unified diff output if changes exist
- [ ] Handles binary file changes gracefully
- [ ] Command: `git diff --staged`
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Empty diff = no staged changes (precondition failure)
- Diff string used later for AI prompt construction
- Binary files: git shows "Binary files differ" placeholder
- Performance: diff should be fast (<100ms typical)

**Testing Deliverables:**

- Unit test: no staged changes returns empty string
- Unit test: staged changes return diff output
- Unit test: binary file handling
- Mock execa to return sample diff outputs

**FRs Covered:** FR2 (detect staged changes), FR3 (fail if no changes)

---

## Story 3.4: Implement Branch Name Extraction

**As a** developer
**I want** to extract current git branch name
**So that** it can be included in commit metadata or error messages

**Acceptance Criteria:**

- [ ] ShellGitAdapter.getBranchName() implemented
- [ ] Returns current branch name as string
- [ ] Handles detached HEAD state (return commit hash)
- [ ] Command: `git branch --show-current`
- [ ] Fallback: `git rev-parse HEAD` if detached
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Primary use: informational (user context)
- Detached HEAD: return first 7 chars of commit hash
- Error handling: throw if git command fails
- Not critical path for MVP (nice-to-have metadata)

**Testing Deliverables:**

- Unit test: normal branch returns name
- Unit test: detached HEAD returns commit hash
- Unit test: Error handling for failures
- Mock execa with branch name output

**FRs Covered:** FR33 (read current branch)

---

## Story 3.5: Implement Commit Execution

**As a** developer
**I want** to execute git commit with a message
**So that** the tool can finalize commits after approval

**Acceptance Criteria:**

- [ ] ShellGitAdapter.commitChanges(message) implemented
- [ ] Executes `git commit -m <message>`
- [ ] Returns success/failure status
- [ ] Preserves multi-line commit messages
- [ ] Handles commit hook failures gracefully
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Message must be properly escaped for shell
- execa handles argument escaping automatically
- Multi-line messages: use array args, not string concatenation
- Command: `git commit -m <message>` (execa with args array)
- Commit hooks may fail (pre-commit, commit-msg)

**Testing Deliverables:**

- Unit test: commit succeeds with valid message
- Unit test: multi-line message preserved
- Unit test: commit hook failure detected
- Mock execa with success/failure responses

**FRs Covered:** FR36 (execute git commit)

---

## Story 3.6: Implement Git Validation Use Case

**As a** developer
**I want** a use case that validates all git preconditions
**So that** the commit command can fail fast with clear errors

**Acceptance Criteria:**

- [ ] Use case created in `src/features/commit/validate-git-preconditions.ts`
- [ ] Checks: is git repo, has staged changes, Ollama setup complete
- [ ] Returns typed result (success + data OR failure + error)
- [ ] Integrates with ShellGitAdapter via port
- [ ] Clear error messages for each failure mode

**Technical Notes:**

- Validation order: git repo → staged changes → Ollama setup
- Fail fast: stop on first failure, return error
- Success result includes diff + branch name (for prompt construction)
- Error types: NotGitRepository, NoStagedChanges, OllamaNotSetup
- Use case coordinates adapters (git + Ollama)

**Testing Deliverables:**

- Unit test: all validations pass returns success
- Unit test: not a git repo returns typed error
- Unit test: no staged changes returns typed error
- Unit test: Ollama not setup returns typed error
- Mock both adapters for isolated testing

**FRs Covered:** FR1 (git repo check), FR3 (staged changes check), FR4 (clear validation errors)

---

## Story 3.7: Implement Git Error Handling

**As a** developer
**I want** clear error messages for git-related failures
**So that** users know exactly how to fix their git state

**Acceptance Criteria:**

- [ ] Typed error classes: NotGitRepository, NoStagedChanges, GitCommandFailed
- [ ] Each error includes remediation guidance
- [ ] Exit codes: user=2 (no staged changes), system=3 (git command fail)
- [ ] Error messages reference git commands to fix issues
- [ ] Integration with command handler

**Technical Notes:**

- Architecture specifies typed error classes with exit codes
- User errors (exit 2): no staged changes (run `git add`)
- System errors (exit 3): git command failed (check git installation)
- Validation errors (exit 4): not a git repo (run `git init`)
- Actionable messages per PRD requirement (FR38-40)

**Testing Deliverables:**

- Unit test: NoStagedChanges includes "git add" guidance
- Unit test: NotGitRepository includes "git init" guidance
- Unit test: Exit codes map correctly
- Co-located tests for error classes

**FRs Covered:** FR4 (validation errors), FR38-40 (actionable guidance), FR6 (failed preconditions)

---

## Epic 3 Summary

**Total Stories:** 7
**Estimated Complexity:** Medium (shell command integration)
**Dependencies:** Epic 1 (Foundation) must be complete
**Output:** Working git integration that validates preconditions and reads staged changes

**Completion Criteria:**

- All 7 stories pass acceptance criteria
- ShellGitAdapter works with real git commands (integration test)
- Validation use case returns clear errors for each failure mode
- Unit tests cover ShellGitAdapter with mocked execa
- Manual testing confirms validation works in real repositories
```

`epic-4-ai-generation.md`:

```md
# Epic 4: AI-Powered Message Generation - Story Breakdown

**Goal:** Generate high-quality Conventional Commits messages using Ollama
**User Value:** Users receive AI-generated commit messages that follow Conventional Commits format and accurately describe their changes
**FRs Covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR37

---

## Story 4.1: Create Prompt Builder

**As a** developer
**I want** a prompt builder that constructs LLM prompts from git diff
**So that** I can generate consistent, high-quality prompts for commit message generation

**Acceptance Criteria:**

- [ ] Prompt builder created in `src/features/commit/prompt-builder.ts`
- [ ] Accepts: diff string, commit type, optional scope
- [ ] Constructs user message combining type + diff + instructions
- [ ] Output: plain text prompt ready for LLM
- [ ] No external dependencies (pure function)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Prompt structure: "Generate a [type] commit message for: [diff]"
- Type comes from user selection (feat, fix, etc.)
- Scope optional (e.g., "feat(auth):")
- Diff included verbatim (context window assumes it fits)
- System prompt baked into Modelfile (not included here)

**Testing Deliverables:**

- Unit test: prompt includes commit type
- Unit test: prompt includes diff content
- Unit test: optional scope handled correctly
- Co-located test: `prompt-builder.test.ts`

**FRs Covered:** FR15 (type-aware generation), FR16 (diff analysis)

---

## Story 4.2: Implement Conventional Commits Type Support

**As a** developer
**I want** support for all standard Conventional Commits types
**So that** users can generate messages for any commit category

**Acceptance Criteria:**

- [ ] Types enum created: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- [ ] Type descriptions for UI selection (e.g., "feat: New feature")
- [ ] Type validation function (reject invalid types)
- [ ] Default type: infer from diff or prompt user
- [ ] Type enforced in final message regardless of AI output
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies deterministic type overwrite
- AI suggestion ignored, user selection is truth
- Type list per Conventional Commits spec
- Scope support (optional): `feat(auth): message`
- Breaking change support (optional): `feat!: message`

**Testing Deliverables:**

- Unit test: all 11 types validated correctly
- Unit test: invalid type rejected
- Unit test: type descriptions match spec
- Enum exported for use in UI layer

**FRs Covered:** FR17 (Conventional Commits format), FR18 (standard types), FR19 (type enforcement)

---

## Story 4.3: Implement Format Validator

**As a** developer
**I want** a format validator that checks commit message structure
**So that** I can detect malformed AI output and retry silently

**Acceptance Criteria:**

- [ ] Validator created in `src/features/commit/format-validator.ts`
- [ ] Regex validation: `/^\w+: .+$/` (type + colon + message)
- [ ] Detects conversational pollution ("Here's a commit message...")
- [ ] Returns boolean: valid or invalid
- [ ] No schema validation (Zod deferred to post-MVP)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies regex-only validation for MVP
- Conversational patterns: "Here's...", "I suggest...", "Based on..."
- Single line subject required (multi-line body optional)
- Empty message rejected
- Whitespace trimming before validation

**Testing Deliverables:**

- Unit test: valid format passes
- Unit test: missing colon fails
- Unit test: conversational output fails
- Unit test: empty message fails
- Co-located test: `format-validator.test.ts`

**FRs Covered:** FR20 (format validation), FR21 (conversational detection)

---

## Story 4.4: Implement Type Enforcement Logic

**As a** developer
**I want** logic that overwrites AI-generated type with user selection
**So that** the commit type matches user intent regardless of AI output

**Acceptance Criteria:**

- [ ] Type enforcer created in `src/features/commit/type-enforcer.ts`
- [ ] Strips existing type from AI message
- [ ] Prepends user-selected type
- [ ] Preserves scope if present in AI output
- [ ] Handles breaking change indicator (!)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies "force overwrite" approach
- Pattern: extract message after first colon, prepend user type
- Example: AI says "docs: ...", user selected "feat" → "feat: ..."
- Scope preservation: AI says "fix(auth): ...", user selected "feat" → "feat(auth): ..."
- Eliminates type hallucination retry loop

**Testing Deliverables:**

- Unit test: type replaced correctly
- Unit test: scope preserved during replacement
- Unit test: breaking change indicator preserved
- Co-located test: `type-enforcer.test.ts`

**FRs Covered:** FR19 (type enforcement), FR22 (deterministic type)

---

## Story 4.5: Implement Message Normalization

**As a** developer
**I want** message normalization that cleans AI output
**So that** commit messages follow style conventions

**Acceptance Criteria:**

- [ ] Normalizer created in `src/features/commit/message-normalizer.ts`
- [ ] Trims whitespace
- [ ] Capitalizes first letter after type
- [ ] Removes trailing periods
- [ ] Ensures single-line subject (optional multi-line body)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Conventional Commits style: lowercase type, capitalized subject
- Example: "feat: Add authentication" (not "feat: add authentication")
- Subject line: no trailing period (body can have periods)
- Multi-line: subject + blank line + body (optional)
- Applied after type enforcement

**Testing Deliverables:**

- Unit test: first letter capitalized
- Unit test: trailing period removed
- Unit test: whitespace trimmed
- Unit test: multi-line format preserved
- Co-located test: `message-normalizer.test.ts`

**FRs Covered:** FR23 (message normalization), FR24 (style conventions)

---

## Story 4.6: Implement Retry Logic with Silent Regeneration

**As a** developer
**I want** silent retry logic when AI output fails validation
**So that** users get valid messages without seeing retry attempts

**Acceptance Criteria:**

- [ ] Retry coordinator created in `src/features/commit/generate-commit-message.ts`
- [ ] Max retries: 3 attempts
- [ ] Retry triggers: format validation failure only
- [ ] No user-facing retry indicators (completely silent)
- [ ] Fallback: show error after max retries exhausted
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies completely silent retries
- Only retry on format failures (not type mismatches - handled by enforcer)
- Same prompt reused (model has low temperature, may vary)
- Exit after 3 failures with clear error message
- Performance: each generation ~200-500ms on M1/M2

**Testing Deliverables:**

- Unit test: successful generation on first try
- Unit test: retry on format failure, succeed on second try
- Unit test: max retries exhausted shows error
- Unit test: no retry for valid output
- Mock LLM port for deterministic testing

**FRs Covered:** FR37 (silent retry), FR21 (retry on conversational output)

---

## Story 4.7: Integrate Generation Pipeline

**As a** developer
**I want** a unified generation pipeline that orchestrates all steps
**So that** commit message generation is a single cohesive operation

**Acceptance Criteria:**

- [ ] Pipeline use case created in `src/features/commit/generate-commit-message.ts`
- [ ] Steps: build prompt → generate → validate → enforce type → normalize → retry if needed
- [ ] Accepts: diff, user type, optional scope
- [ ] Returns: final commit message or error
- [ ] Integrates with OllamaAdapter via LLM port

**Technical Notes:**

- Use case coordinates all Epic 4 components
- Dependency injection: LLM port injected from infrastructure
- Error handling: propagate typed errors (LLM failure, validation failure)
- Performance target: sub-1s end-to-end (including retries)
- Model parameters from architecture: temp=0.2, num_ctx=131072

**Testing Deliverables:**

- Unit test: happy path generates valid message
- Unit test: format validation triggers retry
- Unit test: type enforcement works correctly
- Unit test: normalization applied to final output
- Integration test: real Ollama generation (manual)
- Co-located test: `generate-commit-message.test.ts`

**FRs Covered:** FR15-24, FR37 (full generation pipeline)

---

## Epic 4 Summary

**Total Stories:** 7
**Estimated Complexity:** High (AI integration, prompt engineering, retry logic)
**Dependencies:** Epic 1 (Foundation), Epic 2 (Ollama Integration), Epic 3 (Git Context)
**Output:** Working AI-powered commit message generation with format validation and retry logic

**Completion Criteria:**

- All 7 stories pass acceptance criteria
- Generation pipeline produces valid Conventional Commits messages
- Silent retry works transparently (no user-facing indicators)
- Type enforcement overrides AI suggestions correctly
- Unit tests cover all components with mocked LLM
- Integration test confirms real Ollama generation works
- Performance: sub-1s generation on M1/M2 hardware
```

`epic-5-interactive-workflow.md`:

```md
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
```

`epic-6-performance-errors.md`:

```md
# Epic 6: Performance & Error Handling - Story Breakdown

**Goal:** Ensure sub-1s performance and graceful error recovery
**User Value:** Users experience lightning-fast responses and receive actionable guidance when things go wrong
**FRs Covered:** FR34, FR35, FR38, FR39, FR40, FR41, FR42, FR43, FR44

---

## Story 6.1: Implement Performance Benchmarking

**As a** developer
**I want** performance benchmarks for critical operations
**So that** I can verify sub-1s latency target is met

**Acceptance Criteria:**

- [ ] Benchmark suite created in `tests/benchmarks/`
- [ ] Measures: git diff read, AI generation, total commit flow
- [ ] Target: total flow <1000ms on M1/M2
- [ ] Reports: p50, p95, p99 latencies
- [ ] Runs on real hardware (not mocked)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies sub-1s end-to-end latency
- Breakdown targets: git diff <50ms, generation <500ms, UI <100ms
- Benchmark tool: simple console.time or dedicated library
- Run manually (not in CI for MVP)
- Test data: various diff sizes (small, medium, large)

**Testing Deliverables:**

- Benchmark script: `npm run benchmark`
- Results logged to console (p50, p95, p99)
- Document baseline performance in dev/performance-baseline.md
- Manual execution on M1/M2 hardware

**FRs Covered:** FR34 (sub-1s latency target)

---

## Story 6.2: Implement Spinner for AI Generation

**As a** user
**I want** visual feedback during AI generation
**So that** I know the tool is working and hasn't frozen

**Acceptance Criteria:**

- [ ] Spinner integrated using ora (8.2.0)
- [ ] Shows during AI generation only
- [ ] Message: "Generating commit message..."
- [ ] Stops on success or failure
- [ ] Cross-platform support (macOS, Linux, Windows)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies ora 8.2.0 for spinners
- Start spinner before generation, stop after
- Silent retry: spinner continues during retries (no user indication of retries)
- No spinner for git operations (<50ms, too fast)
- Spinner disabled if stdout not a TTY (CI environments)

**Testing Deliverables:**

- Unit test: spinner starts and stops correctly
- Unit test: TTY detection works
- Manual test: spinner visible during generation
- Co-located test: integration test for workflow

**FRs Covered:** FR35 (loading indicators), FR43 (visual feedback)

---

## Story 6.3: Implement Typed Error Classes

**As a** developer
**I want** typed error classes for all failure modes
**So that** errors can be handled consistently with proper exit codes

**Acceptance Criteria:**

- [ ] Error classes created in `src/core/errors/`
- [ ] Categories: UserError (exit 2), SystemError (exit 3), ValidationError (exit 4), UnexpectedError (exit 5)
- [ ] Each error includes: message, remediation guidance, exit code
- [ ] All errors extend base OllatoolError class
- [ ] Specific errors: NotGitRepository, NoStagedChanges, OllamaNotRunning, etc.
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture specifies exit code mapping:
  - User errors (2): no staged changes, cancelled operation
  - System errors (3): Ollama daemon down, git command failed
  - Validation errors (4): model not found, invalid config
  - Unexpected errors (5): unhandled exceptions, bugs
- Each error class includes remediation property (string guidance)
- Export all error classes from core/errors/index.ts

**Testing Deliverables:**

- Unit test: each error class has correct exit code
- Unit test: remediation messages are actionable
- Unit test: error inheritance chain correct
- Co-located tests: `errors/*.test.ts`

**FRs Covered:** FR38 (typed errors), FR39 (exit codes), FR40 (remediation guidance)

---

## Story 6.4: Implement Error Message Formatting

**As a** user
**I want** clear, actionable error messages
**So that** I know exactly how to fix problems

**Acceptance Criteria:**

- [ ] Error formatter created in `src/ui/error-formatter.ts`
- [ ] Formats errors with: emoji/icon, title, message, remediation
- [ ] Color-coded (red for errors, yellow for warnings)
- [ ] References relevant commands or docs
- [ ] Consistent format across all error types
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Format template:
```

✖ [Error Title]

[Error Message]

How to fix:
→ [Remediation step 1]
→ [Remediation step 2]

```

- Use @clack/prompts for formatting (intro, outro, note)
- Color coding: red (✖) for errors, yellow (⚠) for warnings
- Include command examples in remediation (e.g., "Run: ollama pull ...")

**Testing Deliverables:**

- Unit test: format includes all sections
- Unit test: color codes applied correctly
- Unit test: remediation steps included
- Manual test: error messages readable and helpful
- Co-located test: `error-formatter.test.ts`

**FRs Covered:** FR40 (actionable messages), FR41 (clear guidance), FR42 (fix instructions)

---

## Story 6.5: Implement Global Error Handler

**As a** developer
**I want** a global error handler for the CLI
**So that** all errors are caught and formatted consistently

**Acceptance Criteria:**

- [ ] Global handler in CLI entry point (src/index.ts)
- [ ] Catches all unhandled errors and rejections
- [ ] Maps domain errors to exit codes
- [ ] Formats errors using error formatter
- [ ] Logs stack traces in debug mode (env var)
- [ ] Clean exit (no stack traces in production)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Wrap main command execution in try/catch
- Process handlers: process.on('unhandledRejection'), process.on('uncaughtException')
- Debug mode: OLLATOOL_DEBUG=1 shows stack traces
- Production: user-friendly messages only
- Exit process with correct code: process.exit(error.exitCode)

**Testing Deliverables:**

- Unit test: known errors formatted correctly
- Unit test: unknown errors caught and logged
- Unit test: exit codes mapped correctly
- Unit test: debug mode shows stack traces
- Manual test: trigger errors and verify output

**FRs Covered:** FR38-42 (error handling system), FR44 (graceful failures)

---

## Story 6.6: Implement Resource Cleanup on Exit

**As a** developer
**I want** proper resource cleanup on exit
**So that** temp files and model instances are cleaned up

**Acceptance Criteria:**

- [ ] Cleanup handler in workflow controller
- [ ] Removes temp editor files (.git/COMMIT_EDITMSG_OLLATOOL)
- [ ] Unloads Ollama model (keep_alive=0 ensures this)
- [ ] Handles process signals: SIGINT, SIGTERM
- [ ] Cleanup runs on success, failure, and cancellation
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Use try/finally blocks for cleanup
- Temp file cleanup: fs.unlink with error suppression
- Ollama model: keep_alive=0 means auto-unload (handled by Ollama)
- Signal handlers: graceful shutdown on Ctrl+C
- Cleanup must be fast (<100ms)

**Testing Deliverables:**

- Unit test: temp files removed after workflow
- Unit test: cleanup runs on error
- Unit test: signal handlers registered
- Manual test: Ctrl+C cleans up properly
- Co-located test in workflow controller

**FRs Covered:** FR44 (resource cleanup), FR35 (graceful shutdown)

---

## Story 6.7: Add Context Window Overflow Detection

**As a** developer
**I want** to detect when git diff exceeds context window
**So that** I can show a clear error instead of cryptic failure

**Acceptance Criteria:**

- [ ] Diff size checker in prompt builder
- [ ] Approximate token count (chars / 4 heuristic)
- [ ] Context limit: 128K tokens (512K chars)
- [ ] Error if diff + prompt > limit
- [ ] Remediation: suggest splitting commits or reducing diff
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Architecture de-scoped sophisticated chunking (MVP assumes diffs fit)
- Simple heuristic: 1 token ≈ 4 chars
- Context window: 131072 tokens (524288 chars)
- Safety margin: use 90% of limit (470K chars)
- Error: ContextWindowExceeded with remediation

**Testing Deliverables:**

- Unit test: small diff passes
- Unit test: huge diff (>500K chars) fails
- Unit test: error includes remediation
- Mock large diff for testing
- Co-located test: `prompt-builder.test.ts`

**FRs Covered:** FR35 (graceful handling), FR40 (clear error messages)

---

## Story 6.8: Implement Performance Monitoring (Optional)

**As a** developer
**I want** optional performance telemetry
**So that** I can identify bottlenecks in real usage

**Acceptance Criteria:**

- [ ] Telemetry opt-in via env var: OLLATOOL_PERF=1
- [ ] Logs timing for: git ops, generation, total workflow
- [ ] Output to stderr (not stdout, to avoid polluting output)
- [ ] No external services (local logging only)
- [ ] Zero performance impact when disabled
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Completely optional (default: disabled)
- Use performance.now() for high-res timing
- Format: `[PERF] git-diff: 42ms, generation: 387ms, total: 521ms`
- Logged to stderr (doesn't interfere with CLI output)
- No persistent storage (ephemeral logging only)

**Testing Deliverables:**

- Unit test: telemetry logs when enabled
- Unit test: no logs when disabled
- Manual test: verify timings are accurate
- Co-located test in workflow controller

**FRs Covered:** FR34 (performance monitoring), FR35 (diagnostic info)

---

## Epic 6 Summary

**Total Stories:** 8
**Estimated Complexity:** Medium (polish and robustness work)
**Dependencies:** All other epics (this polishes the complete system)
**Output:** Sub-1s performance, clear error messages, graceful failure handling, resource cleanup

**Completion Criteria:**

- All 8 stories pass acceptance criteria
- Performance benchmarks confirm <1s latency on M1/M2
- All error types have clear messages and remediation
- Spinner shows during AI generation
- Resource cleanup works on success, failure, and cancellation
- Context window overflow detected and handled
- Global error handler catches all failures
- Manual testing confirms professional UX

```

`epic-7-manual-acceptance-testing.md`:

```md
# Epic 7: Manual Acceptance Testing - Story Breakdown

**Goal:** Validate ollatool commit message quality across 50+ realistic code change scenarios

**User Value:** Ensure generated commit messages are useful and accurate in real-world usage patterns

**Testing Scope:** All functional requirements validated through agent-driven scenario generation

---

## Story 7.1: Execute Manual Acceptance Testing (50+ Scenarios)

**As a** QA engineer
**I want** to validate ollatool across 50+ diverse code change scenarios
**So that** we can confirm commit message quality meets MVP success criteria (90%+ acceptance rate)

**Acceptance Criteria:**

- [ ] Clone FreeCodeCamp repository to dedicated test environment
- [ ] Create `ollatool-manual-testing` branch
- [ ] Execute 50+ test scenarios across all categories:
  - Frontend changes (15 scenarios)
  - Backend changes (15 scenarios)
  - Infrastructure changes (10 scenarios)
  - Documentation/Config changes (10 scenarios)
- [ ] For each scenario:
  - Agent generates realistic code change based on prompt
  - Stage changes and run `ollatool commit`
  - Human evaluates generated message (1-5 scale)
  - Record results in acceptance-log.md
- [ ] Document quality metrics by category
- [ ] Identify patterns and weak areas
- [ ] Code adheres to dev/styleguides standards

**Technical Notes:**

- Use agent-driven code generation to create test scenarios efficiently
- Each prompt is 2-3 sentences describing a development task
- Agent quality doesn't matter; we only care about ollatool's output
- Scoring: 5=perfect, 4=good, 3=acceptable, 2=poor, 1=useless
- Success: 90%+ scenarios score 3/5 or higher

**Testing Deliverables:**

- Acceptance test log: `dev/acceptance-log.md` with results matrix
- Quality assessment report by category
- Pattern analysis identifying strengths and improvement areas
- Timeline: 4 weeks (weeks 9-12 / Sprint 3-4)

**FRs Validated:** All 49 FRs through real-world usage patterns

---
```
