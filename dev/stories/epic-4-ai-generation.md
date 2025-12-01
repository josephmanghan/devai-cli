# Epic 4: AI Generation Logic (Consolidated)

**Goal:** Encapsulate the logic for generating, validating, and normalizing commit messages using the LLM.
**User Value:** Users receive high-quality, compliant commit messages without needing to manually format or correct AI hallucinations.
**FRs Covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR37

---

## Story 4.1: Implement Message Processing Utilities

**As a** developer
**I want** a set of pure functions to handle message formatting and validation
**So that** I can ensure inputs to the LLM are correct and outputs are compliant

**Acceptance Criteria:**

- [ ] **PromptBuilder** implemented: `src/features/commit/utils/prompt-builder.ts`
  - [ ] Function: `buildPrompt(commitType: string, diff: string): string`
  - [ ] Injects few-shot examples (hardcoded for now or from config).
- [ ] **FormatValidator** implemented: `src/features/commit/utils/format-validator.ts`
  - [ ] Function: `validateFormat(message: string): boolean`
  - [ ] Uses Regex: `/^\w+: .+$/` (Subject line structure).
  - [ ] Rejects conversational filler (e.g., "Here is the commit...").
- [ ] **TypeEnforcer** implemented: `src/features/commit/utils/type-enforcer.ts`
  - [ ] Function: `enforceType(message: string, selectedType: string): string`
  - [ ] Replaces the AI-generated type with the user-selected type.
  - [ ] Preserves scope if present (e.g., `fix(auth):` -> `feat(auth):`).
- [ ] **MessageNormalizer** implemented: `src/features/commit/utils/message-normalizer.ts`
  - [ ] Function: `normalizeMessage(message: string): string`
  - [ ] Trims whitespace, removes trailing periods from subject, ensures strict `type: subject` format.
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Pure Functions:** These files should have NO dependencies on external services (Ollama, Git).
- **Type Enforcer Logic:**
  1. Parse AI output.
  2. Split by first colon.
  3. Construct new string: `${selectedType}: ${originalSubject}`.

**Testing Deliverables:**

- **Co-located Tests:** Create `.test.ts` files for each utility.
- **Unit Tests:**
  - Verify PromptBuilder handles large diffs (truncation strategy if necessary).
  - Verify FormatValidator catches "Chatty" output.
  - Verify TypeEnforcer correctly swaps types while keeping descriptions.

---

## Story 4.2: Implement Generate Commit Strategy (Use Case)

**As a** developer
**I want** a robust strategy for getting a commit message from the LLM
**So that** the application handles AI unreliability (hallucinations/bad formats) automatically

**Acceptance Criteria:**

- [ ] Use Case created: `src/features/commit/use-cases/generate-commit.ts`
- [ ] Injects `LlmPort` (Dependency Injection).
- [ ] Implements the **Generation Loop**:
  1. **Attempt 1:** Send Prompt.
  2. **Validate:** Check output against `FormatValidator`.
  3. **Retry (Max 3):** If invalid, loop back. (Optional: Append "Error: Invalid format" to next prompt).
  4. **Enforce & Normalize:** Apply `TypeEnforcer` and `MessageNormalizer` to valid output.
- [ ] Error Handling:
  - If `LlmPort` fails -> Throw `SystemError` (Ollama died).
  - If Max Retries exceeded -> Throw `ValidationError` (AI couldn't generate valid format).
- [ ] Code adheres to `dev/styleguides/clean-code.md`

**Technical Notes:**

- **Parameters:** Use `temperature: 0.2` (Low randomness) and `num_ctx: 131072` (Max context).
- **Silent Retry:** The user is NOT notified of retries. This happens internally within the `execute` method.
- **Fail Fast:** If the diff is empty (checked in Epic 3), this Use Case shouldn't even be called, but handle empty inputs gracefully just in case.

**Testing Deliverables:**

- **Co-located Test:** `src/features/commit/use-cases/generate-commit.test.ts`
- **Unit Tests:**
  - Mock `LlmPort` to return:
    1. Valid response immediately (Happy Path).
    2. Invalid response 2x, then Valid (Retry Path).
    3. Invalid response 4x (Failure Path).
  - Verify final output is strictly normalized.

---

## Epic 4 Summary

**Total Stories:** 2
**Estimated Complexity:** Medium
**Dependencies:** Epic 2 (LlmPort)
**Output:** The "Brain" of the application—pure logic to prepare prompts and sanitize AI outputs.

**Completion Criteria:**

- `GenerateCommit.execute()` accepts a diff and type, and returns a clean, Conventional Commit string.
- It automatically recovers from at least 2 consecutive "bad" AI responses.
