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
