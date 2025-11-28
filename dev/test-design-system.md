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
```

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
- **CRITICAL: Windows Path Handling** - All file paths MUST use `path.join()` or `path.resolve()` to ensure cross-platform compatibility. Never use string concatenation with `/` or `\` separators.
- Temp directory: `path.join(os.tmpdir(), 'ollatool-test-{uuid}')` for cross-platform support
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
