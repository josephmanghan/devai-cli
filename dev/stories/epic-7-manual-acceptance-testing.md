# Epic 7: Model Validation & Manual Acceptance Testing - Story Breakdown

**Goal:** Validate model selection and commit message quality across 50+ realistic scenarios

**User Value:** Ensure selected model and generated commit messages meet MVP success criteria (90%+ acceptance rate)

**Testing Scope:** All functional requirements validated through comprehensive testing

---

## Story 7.1: Create Model Evaluation Framework

**As a** developer
**I want** a comprehensive model evaluation system
**So that** I can validate the qwen2.5-coder:1.5b selection with data-driven evidence

**Acceptance Criteria:**

- [ ] `tests/fixtures/model-evaluation/` directory with 20+ diverse diff scenarios
- [ ] `scripts/evaluate-models.ts` script implementing weighted scoring system
- [ ] Evaluation script tests qwen2.5-coder:1.5b (primary), llama3.2:3b (backup), codellama:7b (backup)
- [ ] Scoring criteria: format compliance (30%), description quality (25%), body quality (20%), performance (15%), retry rate (10%)
- [ ] Results automatically documented in `dev/model-evaluation-results.md`
- [ ] Script can run with `npm run model-evaluation`

**Technical Notes:**

- Test fixtures cover: feat additions, bug fixes, refactoring, docs, tests, config, large diffs
- Weighted scoring system provides objective comparison between models
- Performance measured on reference hardware (document test environment)
- Include edge cases: no staged changes, model hallucination, retry scenarios
- **Prerequisites:** Epic 5 complete (commit generation pipeline exists)

**Testing Deliverables:**

- Unit tests for evaluation logic and scoring algorithm
- Integration tests with mock Ollama responses
- Validation that all fixture scenarios produce meaningful results

---

## Story 7.2: Execute Model Evaluation and Document Decision

**As a** developer
**I want** to complete model evaluation and validate architecture decisions
**So that** I can proceed with confidence in the selected model

**Acceptance Criteria:**

- [ ] Model evaluation script executed against all candidate models
- [ ] `dev/model-evaluation-results.md` completed with comprehensive analysis
- [ ] Architecture decision validated: qwen2.5-coder:1.5b meets criteria OR switch documented
- [ ] Decision criteria include: format compliance rate, acceptance threshold, performance targets
- [ ] If primary model fails, fallback model selected and justified
- [ ] Model configuration (temperature, keep_alive, context window) validated for implementation

**Technical Notes:**

- Must achieve 90%+ format compliance rate to proceed
- Performance targets: <5s cold start (MVP baseline per architecture)
- If no model meets criteria, revisit prompt engineering strategy
- Document any trade-offs and decision rationale
- **Prerequisites:** Story 7.1 complete

**Testing Deliverables:**

- Model selection validated against documented criteria
- Performance baseline established for selected model
- Implementation requirements clearly specified

---

## Story 7.3: Setup E2E Testing with Real Ollama

**As a** developer
**I want** E2E tests running with real Ollama in CI
**So that** model quality and performance are continuously validated

**Acceptance Criteria:**

- [ ] `.github/workflows/e2e-ollama.yml` created for E2E testing
- [ ] E2E tests run on macOS runners (M1/M2 parity)
- [ ] Ollama installation and model provisioning automated in CI
- [ ] Performance metrics collected and uploaded as artifacts
- [ ] E2E test suite covers: four-phase validation, silent retry, performance benchmarks
- [ ] Tests validate 90%+ format compliance with real model outputs
- [ ] Pipeline completes in <10 minutes

**Technical Notes:**

- Use macOS runners for performance parity with target hardware
- Cache Ollama models between runs to reduce CI time
- Implement performance regression detection (block PRs >20% degradation)
- Graceful degradation if Ollama unavailable (skip tests with warning)
- **Prerequisites:** Story 7.2 complete (model validated)

**Testing Deliverables:**

- CI pipeline runs successfully with green checkmarks
- Performance baseline established and tracked
- E2E tests execute reliably in CI environment

---

## Story 7.4: Implement Manual Acceptance Testing Framework

**As a** developer
**I want** a structured framework for manual acceptance testing
**So that** I can systematically validate the 90% acceptance rate requirement

**Acceptance Criteria:**

- [ ] `dev/acceptance-log.md` template created for tracking test results
- [ ] Acceptance testing checklist covering 7 scenario categories (feat, fix, refactor, docs, test, config, mixed)
- [ ] Clear acceptance criteria defined for "accepted" vs "rejected" commits
- [ ] Data collection template for systematic quality assessment
- [ ] Protocol for 50+ commit validation with measurable success criteria
- [ ] Test repository setup with isolated environment for formal testing

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

## Story 7.5: Execute Manual Acceptance Testing (50+ Scenarios)

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
- [ ] Achieve 90%+ acceptance rate (45/50 scenarios score 3/5 or higher)

**Technical Notes:**

- Use agent-driven code generation to create test scenarios efficiently
- Each prompt is 2-3 sentences describing a development task
- Agent quality doesn't matter; we only care about ollatool's output
- Scoring: 5=perfect, 4=good, 3=acceptable, 2=poor, 1=useless
- Success: 90%+ scenarios score 3/5 or higher
- **Prerequisites:** Story 7.4 complete (framework ready)

**Testing Deliverables:**

- Acceptance test log: `dev/acceptance-log.md` with results matrix
- Quality assessment report by category
- Pattern analysis identifying strengths and improvement areas
- Final recommendation: Ship MVP or iterate on prompt/model

**FRs Validated:** All 49 FRs through real-world usage patterns

---

**Epic Success Criteria:**

- [ ] Model evaluation complete with documented validation
- [ ] E2E tests with real Ollama running in CI
- [ ] Manual acceptance testing achieves 90%+ acceptance rate
- [ ] Performance baselines established and tracked
- [ ] All quality gates passing
- [ ] **READY:** MVP validated and ready for release

**Dependencies:** Epic 5 complete (commit generation pipeline must exist)

**Epic Duration Estimate:** 12-16 focused hours across all stories
