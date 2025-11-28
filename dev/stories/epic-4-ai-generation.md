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
