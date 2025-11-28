# Epic 0: Test Infrastructure & CI Setup - Story Breakdown

**Goal:** Establish test infrastructure and CI pipeline structure before implementation begins
**User Value:** Ensures all subsequent development can be reliably tested; prevents architecture mistakes
**FRs Covered:** None (this is foundational work that enables all FRs to be testable)

---

## Story 0.1: Create Test Infrastructure Core

**As a** developer
**I want** comprehensive test helper templates with smoke tests
**So that** all subsequent development can be reliably tested without external dependencies

**Acceptance Criteria:**

- [ ] `tests/helpers/git-harness.ts` implemented with GitTestHarness class
- [ ] `tests/helpers/mock-llm-provider.ts` implemented with MockLlmProvider class
- [ ] `tests/helpers/performance-tracker.ts` implemented for metrics collection
- [ ] All helper classes include proper TypeScript types and documentation
- [ ] Each helper has smoke tests validating basic functionality (create temp repo, return mock response, record timing)
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- GitTestHarness creates isolated temp repositories for each test
- MockLlmProvider provides instant, deterministic responses without Ollama
- PerformanceTracker measures CLI execution time and resource usage
- Follow hexagonal architecture patterns for test adapters
- Smoke tests verify helpers work, NOT production features

**Testing Deliverables:**

- Smoke test: GitTestHarness creates temp repo and cleans up successfully ✓
- Smoke test: MockLlmProvider returns mocked string when called ✓
- Smoke test: PerformanceTracker records operation timing ✓

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
- [ ] `package.json` includes test scripts: test, test:unit, test:integration, test:coverage

**Technical Notes:**

- Use V8 provider for fast coverage reporting
- Configure separate test suites for unit and integration tests
- Enable watch mode for development
- Set appropriate hook timeouts for git operations

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
- Log namespaces: ollatool:git, ollatool:llm, ollatool:perf, ollatool:validation

**Testing Deliverables:**

- Unit tests for logger functionality
- Integration tests showing debug output appears only when DEBUG env var set
- AppError serialization tests for complete error context

---

## Story 0.4: Setup CI/CD Pipeline Structure

**As a** developer
**I want** GitHub Actions workflows defined and running basic checks
**So that** code quality is validated on every commit from the start

**Acceptance Criteria:**

- [ ] `.github/workflows/tests.yml` created with unit test job
- [ ] `.github/workflows/lint.yml` created for linting and formatting checks
- [ ] Unit tests run on Ubuntu runners (fast execution)
- [ ] Linting and type-checking integrated into CI
- [ ] Branch protection rules require tests and lint to pass
- [ ] Workflows execute successfully with current codebase (test helpers only)

**Technical Notes:**

- Start with unit tests only; integration/E2E added in later epics
- Use GitHub Actions cache for node_modules
- Run on: push to main, all pull requests
- Keep CI fast (<2 minutes for MVP)

**Testing Deliverables:**

- CI pipeline runs successfully with green checkmarks
- Verify linting catches intentional style violations
- Verify unit tests execute in CI environment

---

**Epic Success Criteria:**

- [ ] All test infrastructure components implemented with smoke tests passing
- [ ] Vitest configuration working (can run npm test successfully)
- [ ] DEBUG logging functional (test with `DEBUG=ollatool:* npm test`)
- [ ] CI/CD pipeline running basic checks (lint + unit tests)
- [ ] **READY:** Can begin Epic 1 implementation with test infrastructure in place

**Dependencies:** None (this is the critical foundation epic that enables all other development)

**Epic Duration Estimate:** 4-6 focused hours across all stories
