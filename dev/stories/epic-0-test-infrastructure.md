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
