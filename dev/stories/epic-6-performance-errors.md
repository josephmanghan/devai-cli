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
