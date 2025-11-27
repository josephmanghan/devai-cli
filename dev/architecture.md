# ollatool - Architecture Document

**Project:** Ollama-CLI-application (ollatool)
**Author:** Winston (Architect Agent)
**Date:** 2025-11-27
**Version:** 1.0
**Status:** In Progress

---

## Project Context Understanding

### Core Capabilities

- **49 Functional Requirements** covering git integration, Ollama lifecycle, commit generation, interactive workflows, error handling
- **Privacy-First**: 100% local processing via Ollama with zero data egress
- **Sub-1s Performance**: M1/M2 optimized with Qwen 2.5 Coder 1.5B
- **Zero-Config**: Auto-detect Ollama, auto-provision models, works immediately after npm install
- **Conventional Commits**: Format validation with silent retry mechanism
- **Interactive TUI**: Type selection → preview/edit → approve with keyboard shortcuts

### Unique Challenges Identified

- Custom Ollama model instance creation (base model + system prompt → `ollatool-commit:latest`)
- First-run setup requiring base model download AND custom model instance creation
- Editor integration respecting $EDITOR environment variable
- Context window management: De-scoped complexity, assume diffs fit, exit gracefully if overflow

---

## Starter Template Decision

**Decision:** No traditional starter template—use custom manual setup based on project styleguides

**Rationale:**
You've already researched and documented comprehensive setup patterns in `dev/styleguides/nodejs-cli-setup-patterns.md`. This provides better architectural decisions than any generic starter because it's tailored specifically for:

- Modern ESM with TypeScript (NodeNext module resolution)
- CLI-specific tooling: Commander.js + @clack/prompts for interactive UX
- Performance-optimized build: tsup for fast bundling with ESM output
- Testing: Vitest for modern, fast test execution
- Essential dependencies pre-selected: execa (git), ollama SDK, zod (validation), chalk (colors)

**Project Initialization:**
The first implementation story will execute manual npm project setup following the documented patterns rather than a CLI generator command.

**Architectural Decisions Provided by Styleguide Setup:**

- **Language/TypeScript:** TypeScript with ES2022 target, strict mode enabled
- **Module System:** ESM (type: "module") with NodeNext resolution
- **Build Tooling:** tsup for fast ESM bundling with minification
- **Testing Framework:** Vitest with node environment and globals
- **CLI Framework:** Commander.js for argument parsing
- **Interactive Prompts:** @clack/prompts (modern Inquirer alternative)
- **Linting/Formatting:** ESLint + Prettier (configured per styleguide standards)
- **Project Structure:** Hexagonal architecture (cli/core/infrastructure layers)
- **File Naming:** kebab-case for all files

---

## Technology Stack & Verified Versions

### Core Dependencies (Runtime)

| Package          | Version | Purpose                                      | Verification Date |
| ---------------- | ------- | -------------------------------------------- | ----------------- |
| `commander`      | 14.0.2  | CLI argument parsing, command structure      | 2025-11-27        |
| `@clack/prompts` | 0.11.0  | Interactive TUI (select, confirm prompts)    | 2025-11-27        |
| `ora`            | 8.2.0   | Terminal spinner for loading states          | 2025-11-27        |
| `ollama`         | 0.6.3   | Official Ollama SDK for model inference      | 2025-11-27        |
| `execa`          | 9.6.0   | Git command execution (diff, commit, status) | 2025-11-27        |
| `zod`            | Latest  | Schema validation (Conventional Commits)     | TBD               |

**Node.js Requirement:** >=20.0.0 (tested and verified on Node 22.20)

### Development Dependencies

| Package       | Version | Purpose                                    |
| ------------- | ------- | ------------------------------------------ |
| `typescript`  | Latest  | Type safety, ES2022 target                 |
| `tsup`        | Latest  | Fast ESM bundling with minification        |
| `vitest`      | Latest  | Modern test runner with native ESM support |
| `eslint`      | Latest  | Code linting per styleguide                |
| `prettier`    | Latest  | Code formatting per styleguide             |
| `@types/node` | Latest  | Node.js type definitions                   |

**Sources:**

- [Commander.js npm](https://www.npmjs.com/package/commander)
- [@clack/prompts npm](https://www.npmjs.com/package/@clack/prompts)
- [ollama npm](https://www.npmjs.com/package/ollama)
- [execa npm](https://www.npmjs.com/package/execa)

---

## Ollama Model Architecture

### Model Instance Design

**Custom Model Instance:** `ollatool-commit`
**Base Model:** `qwen2.5-coder:1.5b` (quantized)
**Creation Method:** Modelfile-based instance creation

**Modelfile Structure:**

```dockerfile
# Base model selection
FROM qwen2.5-coder:1.5b

# System prompt (behavioral instructions)
SYSTEM """You are a git commit message generator specialized in Conventional Commits format.

Rules:
- Output ONLY the commit message, no conversational text
- Format: <type>: <description>\n\n<body>
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Description: imperative mood, lowercase, no period, <50 chars
- Body: explain what and why, not how

Examples:
[Few-shot examples will be included here]
"""

# Model configuration parameters (NOT part of system prompt)
PARAMETER temperature 0.2
PARAMETER num_ctx 131072
```

**Setup Command:**

```bash
ollama create ollatool-commit -f Modelfile
```

### Prompt Architecture

**System Prompt (Modelfile - Static):**

- Role definition and behavioral constraints
- Conventional Commits format rules
- Few-shot examples demonstrating ideal outputs
- Output format constraints (no conversational filler)

**User Prompt (Per-Request - Dynamic):**

- User-selected commit type (injected from CLI selection)
- Git diff output (`git diff --cached`)
- Git status output (`git status --short`)
- File paths and change indicators (M/A/D)

**Rationale:** The system prompt is static (lives in Modelfile), while the diff/status are dynamic (sent per-request). This separation means we iterate on the system prompt by recreating the model instance (`ollama create`), not by changing code.

### Ollama Integration Parameters

| Parameter     | Value  | Rationale                                                                                                                                       |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `temperature` | 0.2    | Low randomness for deterministic, consistent outputs                                                                                            |
| `num_ctx`     | 131072 | Full context window capacity (128K tokens). Handles any realistic git diff. Adjust if testing reveals memory issues.                            |
| `keep_alive`  | 0      | MVP: Unload model after each execution. Clean lifecycle: load → infer → commit → unload. Performance validation during testing may adjust this. |

**Context Window Strategy:** Use full model capacity (131,072 tokens = 128K). This accommodates large multi-file diffs without artificial limits. If Ollama returns context overflow error during testing, we can reduce this value.

---

## Project Structure (Hexagonal Architecture)

### Directory Layout

```
src/
├── index.ts                        # CLI entry point with shebang
├── main.ts                         # Application bootstrap & DI composition root
│
├── core/                           # Domain layer (pure business logic, no external deps)
│   ├── domain/
│   │   ├── commit-message.ts       # Entity: Conventional Commit structure
│   │   └── git-context.ts          # Entity: diff, status, file list
│   ├── ports/                      # Port interfaces (contracts for adapters)
│   │   ├── llm-provider.ts         # LlmProvider interface
│   │   ├── git-service.ts          # GitService interface
│   │   └── editor-service.ts       # EditorService interface
│   └── types/
│       ├── commit-config.ts        # Zod schemas for commit feature configuration
│       └── errors.types.ts         # Custom error classes
│
├── infrastructure/                 # Adapters (external service implementations)
│   ├── git/
│   │   ├── git-service.ts          # GitService interface
│   │   └── shell-git-adapter.ts    # Git operations via shell commands (execa)
│   ├── llm/
│   │   ├── llm-provider.ts         # LlmProvider interface
│   │   ├── ollama-adapter.ts       # Ollama API adapter implementation
│   │   └── mock-llm-adapter.ts     # Mock implementation for testing
│   └── editor/
│       └── shell-editor-adapter.ts # Terminal editor integration ($EDITOR)
│
├── features/                       # Use cases & controllers
│   └── commit/
│       ├── controllers/
│       │   ├── commit-controller.ts     # Commander.js command handler
│       │   └── commit-controller.test.ts # Adjacent test
│       ├── use-cases/
│       │   ├── generate-commit.ts       # Core commit generation orchestration
│       │   ├── generate-commit.test.ts  # Adjacent test
│       │   ├── validate-preconditions.ts # Check staged changes, Ollama health
│       │   ├── validate-preconditions.test.ts # Adjacent test
│       │   ├── format-validator.ts      # Conventional Commits regex validation
│       │   └── format-validator.test.ts # Adjacent test
│       └── prompts/
│           ├── user-prompt-builder.ts   # Simple template literals
│           └── user-prompt-builder.test.ts # Adjacent test
│
└── ui/                             # Terminal UI components
    ├── prompts/
    │   ├── commit-type-selector.ts # @clack/prompts type selection
    │   └── commit-type-selector.test.ts # Adjacent test
    ├── spinners/
    │   ├── loading-spinner.ts      # ora spinner wrapper
    │   └── loading-spinner.test.ts # Adjacent test
    └── formatters/
        ├── message-formatter.ts    # Terminal color/formatting
        └── message-formatter.test.ts # Adjacent test
```

### Dependency Flow (Hexagonal Pattern)

```
┌─────────────────────────────────────────────┐
│  CLI Layer (Commander.js)                   │
│  └─ CommitController                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Use Case Layer                             │
│  └─ GenerateCommitMessage                   │
│     (orchestrates domain logic)             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Core Ports (Interfaces)                    │
│  ├─ LlmProvider                             │
│  ├─ GitService                              │
│  └─ EditorService                           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Infrastructure Adapters                    │
│  ├─ OllamaAdapter (implements LlmProvider)  │
│  ├─ ShellGitAdapter (implements GitService) │
│  └─ ShellEditorAdapter (implements EditorS.)│
└─────────────────────────────────────────────┘
```

**Key Rules:**

- Core layer has ZERO external dependencies (no `ollama`, `execa`, `fs` imports)
- Infrastructure adapters implement core interfaces
- Dependency injection happens at `main.ts` composition root
- Controllers orchestrate use cases, use cases orchestrate domain entities

---

## Prompt Engineering Architecture

### System Prompt (Modelfile - Static)

**Location:** `Modelfile` (project root)
**Content:** Role definition, format rules, few-shot examples
**Creation:** `ollama create ollatool-commit -f Modelfile` during setup

```dockerfile
FROM qwen2.5-coder:1.5b

SYSTEM """You are a git commit message generator specialized in Conventional Commits format.

CRITICAL RULES:
1. Output ONLY the commit message - no conversational text, no markdown, no code blocks
2. Format: <type>: <description>\n\n<body>
3. Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
4. Description: imperative mood, lowercase, no period, <50 characters
5. Body: explain WHAT and WHY, not HOW. 2-3 sentences max.

FEW-SHOT EXAMPLES:

Input: Added JWT authentication middleware
Output:
feat: add JWT authentication middleware

Implemented token validation and refresh logic for API security.
Supports both access and refresh tokens with configurable expiration.

Input: Fixed null pointer exception in login handler
Output:
fix: handle null token in login service

Added null check before token validation to prevent crashes.
Returns 401 Unauthorized when token is missing.

Input: Updated README with installation steps
Output:
docs: add installation instructions to README

Documented npm install command and prerequisite requirements.
Included troubleshooting section for common setup issues.
"""

PARAMETER temperature 0.2
PARAMETER num_ctx 4096
```

### User Prompt (Dynamic - Per Request)

**Location:** `src/features/commit/prompts/user-prompt-builder.ts`
**Method:** Simple TypeScript template literals (NO Handlebars for MVP)

```typescript
// MVP: Simple string concatenation
export function buildUserPrompt(commitType: string, diff: string, status: string): string {
  return `Commit Type: ${commitType}

Git Diff:
${diff}

Git Status:
${status}

Generate the commit message following the format rules.`;
}
```

**Rationale:** MVP uses single hard-coded format (Conventional Commits). Template literals are simpler, faster, and require zero dependencies. Handlebars reserved for post-MVP custom templates feature.

### Post-MVP: Template System (Stretch Goal)

**Feature:** User-configurable commit message templates
**Implementation:** Handlebars-based template engine
**Use Case:** Custom formats (emoji commits, team-specific templates, issue tracker integration)

**Example Template (conventional.hbs):**

```handlebars
Commit Type:
{{type}}

Changed files:
{{fileList diff}}

Diff:
{{truncate diff 4000}}

Generate commit message in Conventional Commits format.
```

**Configuration:**

```json
// ~/.config/ollatool/config.json
{
  "template": "conventional", // or "emoji", "custom"
  "customTemplatePath": "~/.config/ollatool/templates/my-template.hbs"
}
```

**Status:** Documented for future implementation. Adds value for teams with specific commit conventions beyond standard Conventional Commits.

---

## Cross-Cutting Concerns

### Error Handling Strategy

**Error Categories:**

| Category         | Exit Code | User Experience               | Example                       |
| ---------------- | --------- | ----------------------------- | ----------------------------- |
| User Error       | 2         | Clear remediation steps       | No staged changes             |
| System Error     | 3         | Installation/startup guidance | Ollama not running            |
| Validation Error | 4         | Format issue explanation      | Invalid commit message format |
| Unexpected Error | 5         | Debug log location, issue URL | Unhandled exception           |

**Error Class Hierarchy:**

```typescript
// src/core/types/errors.types.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly remediation?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UserError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 2, remediation);
    this.name = 'UserError';
  }
}

export class SystemError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 3, remediation);
    this.name = 'SystemError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, remediation?: string) {
    super(message, 4, remediation);
    this.name = 'ValidationError';
  }
}
```

**Error Display Pattern:**

```typescript
// Always show: [ERROR] ✗ message + remediation + exit code
try {
  await execute();
} catch (error) {
  if (error instanceof AppError) {
    console.error(`[ERROR] ✗ ${error.message}\n`);
    if (error.remediation) {
      console.error(error.remediation);
    }
    console.error(`\nExit code: ${error.code}`);
    process.exit(error.code);
  } else {
    // Unexpected error: log to file, show user-friendly message
    logToDebugFile(error);
    console.error('[ERROR] ✗ Unexpected error occurred.');
    console.error('Debug log: ~/.ollatool/debug.log');
    console.error('Report issue: https://github.com/USER/ollatool/issues');
    process.exit(5);
  }
}
```

### Logging Strategy

**MVP: Minimal Logging**

- No runtime logging to console (clean UX)
- Error logging to `~/.ollatool/debug.log` for unexpected errors only
- No telemetry, no analytics

**Debug Mode (Post-MVP):**

```bash
DEBUG=ollatool:* ollatool commit
# Logs: git commands, Ollama requests/responses, timing metrics
```

### Configuration Management

**MVP: Zero Configuration Required**

- Hard-coded defaults for all settings
- No config file needed for typical usage
- Respect environment variables: `OLLAMA_HOST`, `EDITOR`

**Post-MVP: Optional Configuration**

```typescript
// src/core/types/commit-config.ts
export const CommitConfigSchema = z.object({
  ollamaHost: z.string().url().default('http://localhost:11434'),
  modelName: z.string().default('ollatool-commit'),
  temperature: z.number().min(0).max(1).default(0.2),
  maxRetries: z.number().min(0).max(5).default(3),
  editor: z.string().optional(), // Override $EDITOR
});

export type CommitConfig = z.infer<typeof CommitConfigSchema>;
```

**Config File Locations (cosmiconfig search order):**

1. `package.json` `"ollatool"` property
2. `.ollatoolrc` (JSON or YAML)
3. `.ollatool.json`
4. `ollatool.config.js`
5. `~/.config/ollatool/config.json`

### Validation & Format Compliance

**Conventional Commits Regex:**

```typescript
// src/features/commit/use-cases/format-validator.ts
const CONVENTIONAL_COMMIT_REGEX =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert):.+/;

export function validateConventionalCommit(message: string): boolean {
  const lines = message.trim().split('\n');
  const firstLine = lines[0];

  // Must match type: description format
  if (!CONVENTIONAL_COMMIT_REGEX.test(firstLine)) {
    return false;
  }

  // Description should be concise (<72 chars recommended)
  const [type, ...descParts] = firstLine.split(':');
  const description = descParts.join(':').trim();

  if (description.length === 0 || description.length > 72) {
    return false;
  }

  return true;
}
```

**Silent Retry Mechanism:**

```typescript
// src/features/commit/use-cases/generate-commit.ts
const maxFormatRetries = 3;

async function generateWithRetry(): Promise<string> {
  for (let attempt = 1; attempt <= maxFormatRetries; attempt++) {
    const message = await llmProvider.generate(/* ... */);

    if (validateConventionalCommit(message)) {
      return message; // Success
    }

    // Silent retry (don't expose to user unless all retries fail)
    if (attempt === maxFormatRetries) {
      throw new ValidationError(
        `Failed to generate valid commit message format after ${maxFormatRetries} attempts.`,
        'Try regenerating or edit the message manually.',
      );
    }
  }
}
```

### Date/Time Handling

**MVP: No explicit date handling needed**

- Git handles commit timestamps automatically
- No user-facing date formatting required

**Post-MVP:** If adding features like commit history analysis:

- Use native `Date` objects (no libraries like moment/dayjs)
- Store as ISO 8601 strings
- Display in user's local timezone

### Performance Monitoring

**MVP: No metrics collection**

**Post-MVP (Optional):**

```typescript
// Simple timing metrics for optimization
interface PerformanceMetrics {
  ollamaConnectionTime: number;
  modelLoadTime: number;
  inferenceTime: number;
  totalTime: number;
}

// Debug mode shows timing breakdown
if (process.env.DEBUG) {
  console.log('Performance:', metrics);
}
```

---

## Implementation Patterns for Agent Consistency

### Naming Conventions

**Files:** kebab-case for all files

```
commit-controller.ts
shell-git-adapter.ts
user-prompt-builder.ts
```

**Classes/Interfaces:** PascalCase

```typescript
class CommitController {}
interface LlmProvider {}
class ShellGitAdapter implements GitService {}
```

**Variables/Functions:** camelCase

```typescript
const maxFormatRetries = 3;
function validateConventionalCommit(message: string): boolean {}
async function generateCommitMessage(): Promise<string> {}
```

**Constants (true constants only):** Use camelCase unless it's a true immutable constant like an enum

```typescript
// Configuration values - use camelCase
const maxFormatRetries = 3;
const defaultTemperature = 0.2;

// True constants/enums - use CAPS_SNAKE_CASE
enum CommitType {
  FEAT = 'feat',
  FIX = 'fix',
  DOCS = 'docs',
}
```

### Interface vs Implementation Naming

**Pattern:** Interfaces describe capability, implementations describe mechanism

```typescript
// Interface (what it does)
interface LlmProvider {
  generate(prompt: string): Promise<string>;
}

// Implementation (how it does it)
class OllamaAdapter implements LlmProvider {
  // Uses Ollama SDK
}

// Another implementation
class MockLlmAdapter implements LlmProvider {
  // Returns fake data for testing
}
```

**NO "I" prefix on interfaces** - Modern TypeScript style

### Error Handling Patterns

**Always use custom error classes:**

```typescript
// Don't throw raw strings
throw new Error('Ollama not running'); // ❌

// Use typed errors with remediation
throw new SystemError('Ollama is not running.', 'Start Ollama with: ollama serve'); // ✅
```

**Catch at boundaries, not everywhere:**

```typescript
// Don't wrap every call in try/catch
async function buildPrompt() {
  try {
    const diff = await gitService.getDiff(); // ❌ Unnecessary
    return formatPrompt(diff);
  } catch (e) {
    throw e; // Re-throwing adds no value
  }
}

// Let errors bubble up to the controller
async function buildPrompt() {
  const diff = await gitService.getDiff(); // ✅ Let it throw
  return formatPrompt(diff);
}

// Catch at the controller (boundary)
async execute() {
  try {
    await generateAndCommit(); // ✅ Catch at boundary
  } catch (error) {
    handleError(error); // Display to user, exit with code
  }
}
```

### Dependency Injection Pattern

**Constructor injection only:**

```typescript
// ❌ Bad: Direct instantiation, hard to test
class GenerateCommit {
  private llm = new OllamaAdapter();

  async execute() {
    return await this.llm.generate(/*...*/);
  }
}

// ✅ Good: Constructor injection, testable
class GenerateCommit {
  constructor(
    private llm: LlmProvider,
    private git: GitService,
  ) {}

  async execute() {
    return await this.llm.generate(/*...*/);
  }
}

// Composition root (main.ts)
const llm = new OllamaAdapter(/*...*/);
const git = new ShellGitAdapter();
const useCase = new GenerateCommit(llm, git);
```

### Async/Await Patterns

**Always use async/await, never raw Promises:**

```typescript
// ❌ Bad: Promise chains
function generate() {
  return llm
    .generate(prompt)
    .then((result) => validate(result))
    .then((validated) => format(validated))
    .catch((err) => handleError(err));
}

// ✅ Good: async/await
async function generate() {
  const result = await llm.generate(prompt);
  const validated = await validate(result);
  return format(validated);
}
```

### Testing Patterns

**Co-located tests, mock via interfaces:**

```typescript
// commit-controller.test.ts
describe('CommitController', () => {
  let controller: CommitController;
  let mockLlm: MockLlmAdapter;
  let mockGit: MockGitAdapter;

  beforeEach(() => {
    mockLlm = new MockLlmAdapter();
    mockGit = new MockGitAdapter();
    controller = new CommitController(new GenerateCommit(mockLlm, mockGit));
  });

  it('should generate commit message', async () => {
    mockGit.setDiff('diff content');
    mockLlm.setResponse('feat: add feature');

    const result = await controller.execute();

    expect(result).toBe('feat: add feature');
  });
});
```

### File Organization Rules

1. **One class per file** (exception: small related types)
2. **Exports at bottom of file** (after all code)
3. **Imports grouped by type:**

   ```typescript
   // External dependencies
   import { z } from 'zod';
   import { Ollama } from 'ollama';

   // Internal core
   import type { LlmProvider } from '@/core/ports/llm-provider';
   import { ValidationError } from '@/core/types/errors.types';

   // Feature-specific
   import { validateConventionalCommit } from './format-validator';
   ```

### Code Documentation

**Self-documenting code preferred, comments for "why" not "what":**

```typescript
// ❌ Bad: Comment describes what code does
// Get the staged diff from git
const diff = await git.getStagedDiff();

// ✅ Good: Code is self-documenting
const stagedDiff = await git.getStagedDiff();

// ✅ Good: Comment explains WHY
// Retry generation because qwen2.5-coder occasionally outputs markdown
// code blocks despite system prompt instructions
const maxFormatRetries = 3;
```

---

## Data Architecture

### Core Domain Entities

**CommitMessage Entity:**

```typescript
// src/core/domain/commit-message.ts
export class CommitMessage {
  constructor(
    public readonly type: string,
    public readonly description: string,
    public readonly body?: string,
    public readonly scope?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.type || !this.description) {
      throw new ValidationError('Type and description are required');
    }
  }

  toString(): string {
    const scopePart = this.scope ? `(${this.scope})` : '';
    const bodyPart = this.body ? `\n\n${this.body}` : '';
    return `${this.type}${scopePart}: ${this.description}${bodyPart}`;
  }

  static fromString(raw: string): CommitMessage {
    const match = raw.match(/^(\w+)(?:\(([^)]+)\))?: (.+?)(?:\n\n(.+))?$/s);
    if (!match) {
      throw new ValidationError('Invalid commit message format');
    }
    const [, type, scope, description, body] = match;
    return new CommitMessage(type, description, body, scope);
  }
}
```

### Port Interfaces

**LlmProvider Interface:**

```typescript
// src/core/ports/llm-provider.ts
export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  keepAlive?: number;
}

export interface LlmProvider {
  /**
   * Generate commit message from prompt
   * @throws SystemError if Ollama unavailable
   * @throws ValidationError if generation fails after retries
   */
  generate(prompt: string, options?: GenerateOptions): Promise<string>;

  /**
   * Check if LLM service is available
   */
  checkHealth(): Promise<boolean>;
}
```

**GitService Interface:**

```typescript
// src/core/ports/git-service.ts
export interface GitService {
  /**
   * Get staged changes diff
   * @throws UserError if no staged changes
   */
  getStagedDiff(): Promise<string>;

  /**
   * Get short status of changed files
   */
  getStatus(): Promise<string>;

  /**
   * Execute git commit with message
   * @throws SystemError if commit fails
   */
  commit(message: string): Promise<void>;
}
```

**EditorService Interface:**

```typescript
// src/core/ports/editor-service.ts
export interface EditorService {
  /**
   * Open editor with initial content
   * @returns edited content or null if user cancelled
   */
  edit(initialContent: string): Promise<string | null>;
}
```

### Adapter Implementations

**OllamaAdapter:**

```typescript
// src/infrastructure/llm/ollama-adapter.ts
import { Ollama } from 'ollama';
import type { LlmProvider, GenerateOptions } from '@/core/ports/llm-provider';
import { SystemError, ValidationError } from '@/core/types/errors.types';

export class OllamaAdapter implements LlmProvider {
  constructor(
    private client: Ollama,
    private modelName: string = 'ollatool-commit',
  ) {}

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const response = await this.client.generate({
        model: this.modelName,
        prompt,
        options: {
          temperature: options?.temperature ?? 0.2,
          num_ctx: options?.maxTokens ?? 131072,
        },
        keep_alive: options?.keepAlive ?? 0,
      });

      return response.response.trim();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new SystemError('Ollama is not running.', 'Start Ollama with: ollama serve');
      }
      throw new ValidationError('Failed to generate commit message');
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Architecture Decision Records

### ADR-001: Hexagonal Architecture

**Context:** Need clean separation between business logic and external dependencies for testability and maintainability.

**Decision:** Implement hexagonal architecture (ports & adapters pattern) with core domain isolated from infrastructure.

**Consequences:**

- ✅ Easy to test with mocks
- ✅ Can swap Ollama for OpenAI without touching core logic
- ✅ Clear boundaries between layers
- ❌ More files/folders than simple flat structure
- ❌ Requires understanding of DI pattern

### ADR-002: TypeScript over JavaScript

**Context:** Need type safety for complex domain logic and external API interactions.

**Decision:** Use TypeScript with strict mode enabled.

**Consequences:**

- ✅ Catch errors at compile time
- ✅ Better IDE autocomplete
- ✅ Self-documenting code via types
- ❌ Build step required (tsup)
- ❌ Slight learning curve

### ADR-003: Modelfile-based System Prompt

**Context:** System prompt needs to be iterable without code changes.

**Decision:** Bake system prompt into Modelfile, separate from dynamic user prompts.

**Consequences:**

- ✅ Iterate on prompts via `ollama create` (no code deployment)
- ✅ Cleaner API requests (smaller payload)
- ✅ Model + prompt versioned together
- ❌ Requires `ollama create` setup step
- ❌ Less flexible than dynamic prompts

### ADR-004: Co-located Tests

**Context:** Angular-style developer expects tests adjacent to implementation.

**Decision:** Place `.test.ts` files next to `.ts` files instead of separate `tests/` directory.

**Consequences:**

- ✅ Easy to find tests for any file
- ✅ Clear 1:1 relationship
- ✅ Familiar to Angular developers
- ❌ More files in source directories

### ADR-005: Zero-Config MVP

**Context:** Developer productivity requires minimal setup friction.

**Decision:** Hard-code sensible defaults, no config file required for MVP.

**Consequences:**

- ✅ Works immediately after `npm install`
- ✅ Fewer moving parts to debug
- ✅ Clear upgrade path (add config later)
- ❌ Less flexible for power users initially

---

## Summary & Next Steps

### Architecture Completeness

This architecture document defines:

✅ **Technology Stack** - Verified versions, Node 22.20 compatibility
✅ **Ollama Integration** - Modelfile structure, parameters, prompt architecture
✅ **Project Structure** - Hexagonal architecture, co-located tests
✅ **Cross-Cutting Concerns** - Errors, logging, validation, config
✅ **Implementation Patterns** - Naming, DI, async/await, testing
✅ **Data Architecture** - Domain entities, ports, adapters
✅ **Architecture Decisions** - ADRs with context and consequences

### Ready for Implementation

**Phase 4 can begin** with confidence that:

- All major technical decisions are documented
- Naming conventions prevent agent conflicts
- Hexagonal architecture enables parallel development
- Test strategy supports TDD workflow
- Error handling provides clear user guidance

### Validation Checklist

Before starting implementation stories:

- [ ] Review architecture with team
- [ ] Confirm Node 22.20 compatibility
- [ ] Validate Modelfile approach with Ollama test
- [ ] Verify co-located test pattern in tsconfig/vitest config
- [ ] Approve naming conventions

### Post-MVP Features Documented

The following are captured for future implementation:

- Custom template system (Handlebars)
- Configuration file support (cosmiconfig)
- Debug logging mode
- Performance metrics collection

---

**Status:** ✅ Architecture Complete
**Next Workflow:** create-epics-and-stories (pm)
**Alternative:** implementation-readiness validation (architect)

---
