# Epic Technical Specification: Test Infrastructure & CI Setup

Date: 2025-11-28
Author: Joe
Epic ID: 0
Status: Draft

---

## Overview

Epic 0 establishes test infrastructure and CI pipeline structure before any feature implementation. This provides the foundation for Test-Driven Development throughout the project lifecycle.

**Key Deliverables:**

- Test helper templates (GitTestHarness, MockLlmProvider, PerformanceTracker)
- Vitest configuration with coverage thresholds and path aliases
- DEBUG logging system for development observability
- CI/CD pipeline structure running lint and unit tests

**What This Epic Is NOT:**

- NOT implementing production features
- NOT running E2E tests with real Ollama (no features exist yet)
- NOT model evaluation (deferred to Epic 7 after commit pipeline exists)
- NOT manual acceptance testing (deferred to Epic 7)

---

## Objectives and Scope

**In Scope:**

- Test infrastructure components with smoke tests
- Vitest configuration
- DEBUG logging system setup
- GitHub Actions CI pipeline structure
- Basic quality gates (lint, typecheck, unit tests)

**Out of Scope:**

- Production implementation code (Epics 1-6)
- Model evaluation and validation (Epic 7)
- E2E testing with real Ollama (Epic 7)
- Manual acceptance testing (Epic 7)

---

## System Architecture Alignment

This epic aligns with the Pragmatic Hexagonal Architecture by:

**Test Infrastructure Design:**

- GitTestHarness provides isolated test repositories
- MockLlmProvider implements the LlmProvider port interface (template)
- PerformanceTracker follows clean code standards
- All helpers use hexagonal adapter patterns

**Testing Strategy:**

- Unit tests use Vitest with co-located `.test.ts` pattern (ADR-004)
- Coverage thresholds (80%) enforce quality gates
- Smoke tests validate infrastructure works (not features)

---

## Detailed Design

### Services and Modules

**Test Infrastructure Components:**

| Component            | Responsibility                      | Smoke Test                        |
| -------------------- | ----------------------------------- | --------------------------------- |
| `GitTestHarness`     | Isolated temporary git repositories | Creates temp repo and cleans up ✓ |
| `MockLlmProvider`    | Deterministic mock responses        | Returns mocked string ✓           |
| `PerformanceTracker` | Performance metrics collection      | Records operation timing ✓        |

**Test Helpers:**

- `tests/helpers/test-fixtures.ts` - Sample data templates
- `tests/helpers/mock-factories.ts` - Factory functions for test doubles
- `tests/helpers/test-configuration.ts` - Shared test setup

### Data Models and Contracts

**GitTestHarness Interface:**

```typescript
interface GitTestHarness {
  init(): Promise<void>;
  cleanup(): Promise<void>;
  writeFile(path: string, content: string): Promise<void>;
  add(files?: string[]): Promise<void>;
  getDiff(): Promise<string>;
  getStatus(): Promise<string>;
}
```

**MockLlmProvider Contract:**

```typescript
interface MockLlmProvider extends LlmProvider {
  mockResponse(response: string): void;
  mockError(error: Error): void;
  getCallCount(): number;
  getLastPrompt(): string | null;
}
```

**PerformanceMetric Structure:**

```typescript
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

### APIs and Interfaces

**Vitest Configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

**Debug Logging:**

```typescript
import debug from 'debug';

const log = debug('ollatool:git');
const logLlm = debug('ollatool:llm');
const logPerf = debug('ollatool:perf');
```

### Workflows and Sequencing

**Epic 0 Story Execution:**

```
Story 0.1: Create Test Infrastructure Core
  → Smoke tests validate helpers work
  ↓
Story 0.2: Configure Vitest Test Framework
  → npm test runs successfully
  ↓
Story 0.3: Implement DEBUG Logging System
  → DEBUG=ollatool:* shows logs
  ↓
Story 0.4: Setup CI/CD Pipeline Structure
  → CI runs lint + unit tests
```

---

## Non-Functional Requirements

### Performance

- Unit tests: Complete in <5s
- CI pipeline: <2 minutes total
- Test helpers: Instant execution (smoke tests)

### Security

- No sensitive data in test fixtures
- Temporary repositories auto-cleanup
- CI logs sanitized

### Reliability

- Zero flaky tests
- Deterministic execution
- Cleanup guarantees via try/finally

### Observability

- DEBUG logging with namespaces
- Test output includes metrics
- CI artifacts for troubleshooting

---

## Dependencies and Integrations

**Development Dependencies:**

| Package               | Version | Purpose                        |
| --------------------- | ------- | ------------------------------ |
| `vitest`              | Latest  | Test runner                    |
| `@vitest/coverage-v8` | Latest  | Coverage reporting             |
| `debug`               | Latest  | Logging                        |
| `execa`               | 9.6.0   | Git operations in test harness |

**External Integrations:**

- GitHub Actions: CI/CD pipeline
- Git CLI: Test harness operations

---

## Acceptance Criteria (Authoritative)

**AC1: Test Infrastructure Components**

- [ ] GitTestHarness creates isolated temporary repositories
- [ ] GitTestHarness cleanup removes all temporary files
- [ ] MockLlmProvider implements LlmProvider interface
- [ ] PerformanceTracker records operation timings
- [ ] All helpers have smoke tests passing
- [ ] Clean code standards followed (≤15 lines per function)

**AC2: Vitest Configuration**

- [ ] Path aliases configured (@, @tests)
- [ ] Coverage thresholds set to 80%
- [ ] Co-located test pattern enabled (\*.test.ts)
- [ ] npm test runs successfully

**AC3: DEBUG Logging System**

- [ ] DEBUG environment variable support
- [ ] Namespaced logging (git, llm, perf, validation)
- [ ] No console output without DEBUG=ollatool:\*
- [ ] AppError class with serialization

**AC4: CI/CD Pipeline Structure**

- [ ] `.github/workflows/tests.yml` runs unit tests
- [ ] `.github/workflows/lint.yml` runs linting
- [ ] CI completes in <2 minutes
- [ ] All checks passing

---

## Traceability Mapping

**PRD Requirements → Epic 0:**

| PRD Requirement           | Epic 0 Contribution                   |
| ------------------------- | ------------------------------------- |
| NFR-M1: 80% code coverage | Vitest coverage thresholds configured |
| All FR: Correctness       | Test infrastructure enables TDD       |

**Architecture Decisions → Implementation:**

| Architecture Decision     | Epic 0 Implementation                  |
| ------------------------- | -------------------------------------- |
| ADR-004: Co-located tests | Vitest configured for \*_/_.test.ts    |
| Hexagonal ports           | MockLlmProvider implements LlmProvider |
| Clean code ≤15 lines      | Enforced in all helpers                |

---

## Risks, Assumptions, Open Questions

**Risks:**

| Risk                                   | Mitigation                              |
| -------------------------------------- | --------------------------------------- |
| Test infrastructure delays development | Keep it simple, focused helpers only    |
| CI pipeline complexity                 | Start basic (lint + unit), expand later |

**Assumptions:**

- GitHub Actions will be available
- Basic project structure can be created in Epic 0
- Smoke tests are sufficient validation for infrastructure

**Open Questions:**

- None at this time

---

## Test Strategy Summary

**Test Infrastructure Validation:**

1. **Smoke Tests** - Verify helpers work
   - GitTestHarness: Create repo → cleanup succeeds
   - MockLlmProvider: Mock response → returns expected string
   - PerformanceTracker: Record timing → exports metrics

2. **CI Validation** - Pipeline runs successfully
   - Lint checks pass
   - Type checks pass
   - Unit tests execute

**Quality Gates:**

- All smoke tests must pass
- CI pipeline must run successfully
- Zero setup failures
- Clean code standards enforced

---

**Status:** ✅ Epic Tech Spec Corrected
**Next Action:** Begin Story 0.1 drafting
