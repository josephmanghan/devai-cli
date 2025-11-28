# Epic Technical Specification: Foundation & Project Setup

Date: 2025-11-28
Author: Joe
Epic ID: 1
Status: Draft

---

## Overview

Epic 1 establishes the foundational infrastructure for the ollatool CLI application—a TypeScript-based, ESM-native command-line tool that leverages Ollama for AI-powered commit message generation. This epic creates the project scaffolding, build tooling, testing framework, CLI framework, hexagonal architecture structure, and code quality tooling necessary for all subsequent feature development (Epics 2-7).

The epic delivers a working TypeScript project with Commander.js CLI framework, Vitest testing infrastructure, tsup build system, and complete hexagonal architecture directory structure. Upon completion, developers will have a fully functional development environment with `ollatool --help` and `ollatool --version` working, tests passing, and builds producing executable ESM bundles.

## Objectives and Scope

**In Scope:**

- TypeScript project initialization with modern ESM configuration (NodeNext resolution, ES2022 target, strict mode)
- Build tooling setup using tsup for fast ESM bundling
- Vitest testing framework configuration with co-located test pattern
- Commander.js CLI framework integration with `--help` and `--version` flags (FR47, FR48)
- Hexagonal architecture directory structure: `src/core/`, `src/infrastructure/`, `src/features/`, `src/ui/`
- Linting (ESLint) and formatting (Prettier) tooling per styleguide standards
- Package.json scripts: `build`, `dev`, `typecheck`, `test`, `lint`, `format`
- Executable CLI entry point with proper shebang and bin configuration
- Example port/adapter pattern demonstrating hexagonal architecture

**Out of Scope:**

- Any business logic or feature implementation (belongs in Epics 2-7)
- CI/CD pipeline setup (Epic 0 Story 0-4 was closed—project uses local-first development)
- Integration with Ollama or Git (covered in Epics 2-3)
- Commit message generation logic (Epic 4)
- Interactive prompts or UI components (Epic 5)
- Performance optimization or error handling polish (Epic 6)

## System Architecture Alignment

This epic implements the foundational layer of the "Pragmatic Hexagonal Architecture" pattern defined in dev/architecture.md. The architecture follows clean dependency flow: UI → Features → Core ← Infrastructure, with the core domain having zero external dependencies.

**Architecture Decisions Applied:**

- **ADR-001 (Hexagonal Architecture):** Directory structure enforces layers (core/, infrastructure/, features/, ui/) with manual dependency injection
- **ADR-002 (ESM & TypeScript):** NodeNext module resolution, ES2022 target, strict mode, `"type": "module"` in package.json
- **ADR-003 (Build System):** tsup for fast ESM bundling with source maps and minification
- **ADR-004 (Testing Strategy):** Vitest with co-located `*.test.ts` files, globals enabled, node environment
- **ADR-005 (CLI Framework):** Commander.js v14.0.2 for command parsing and argument handling
- **ADR-006 (Code Quality):** ESLint + Prettier with kebab-case file naming convention

**Epic 0 Learnings Integration:**

- **Naming Conventions:** Epic 0 retrospective identified naming issues causing refactoring overhead. Epic 1 will establish explicit naming standards (documented in architecture README) to prevent similar issues
- **Test Infrastructure Ready:** Epic 0 delivered working Vitest configuration and DEBUG logging system, which Epic 1 will leverage
- **Clean Code Standards:** All code must follow ≤15 lines per function requirement from dev/styleguides/clean-code.md
- **Local-First Development:** No CI/CD automation per Epic 0 retrospective decision to close Story 0-4

**Hexagonal Layer Responsibilities:**

- **Core (`src/core/`):** Domain types, business rules, port interfaces (no external dependencies)
- **Infrastructure (`src/infrastructure/`):** Adapters implementing ports (OllamaAdapter, ShellGitAdapter, debug loggers)
- **Features (`src/features/`):** Use cases and command handlers orchestrating domain logic
- **UI (`src/ui/`):** CLI commands, @clack/prompts, user interaction layer

## Detailed Design

### Services and Modules

Epic 1 establishes the foundational modules and project structure. No business logic modules are implemented yet—those belong to Epics 2-7.

| Module/Service          | Responsibility                          | Inputs            | Outputs                              | Owner     |
| ----------------------- | --------------------------------------- | ----------------- | ------------------------------------ | --------- |
| **package.json**        | Project metadata, dependencies, scripts | N/A               | Build/test/lint commands             | Story 1.1 |
| **tsconfig.json**       | TypeScript compilation configuration    | Source files      | Type checking, module resolution     | Story 1.1 |
| **tsup.config.ts**      | Build bundler configuration             | src/index.ts      | dist/index.js (ESM bundle)           | Story 1.2 |
| **vitest.config.ts**    | Test runner configuration               | \*.test.ts files  | Test execution, coverage reports     | Story 1.3 |
| **src/index.ts**        | CLI entry point with Commander.js       | CLI args          | Command routing                      | Story 1.4 |
| **src/core/**           | Domain types, port interfaces           | N/A               | Example port interface (placeholder) | Story 1.5 |
| **src/infrastructure/** | Adapter implementations                 | Port interfaces   | Example adapter (placeholder)        | Story 1.5 |
| **src/features/**       | Use cases, command handlers             | Domain + adapters | Business logic orchestration         | Story 1.5 |
| **src/ui/**             | CLI commands, prompts                   | User input        | Terminal output                      | Story 1.5 |
| **.eslintrc.json**      | Linting rules                           | Source files      | Code quality validation              | Story 1.6 |
| **.prettierrc.json**    | Formatting rules                        | Source files      | Code formatting                      | Story 1.6 |

**Note:** Stories 1.1-1.4 create tooling infrastructure. Story 1.5 creates directory structure with example port/adapter demonstrating the pattern. Actual business logic ports (GitPort, OllamaPort) are implemented in Epics 2-3.

### Data Models and Contracts

Epic 1 is infrastructure-focused with no domain data models. Configuration files define contracts for tooling:

**package.json Contract:**

```json
{
  "name": "ollatool",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "ollatool": "./dist/index.js"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

**tsconfig.json Contract:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Example Port Interface (Story 1.5):**

```typescript
// src/core/ports/example-port.ts
export interface ExamplePort {
  execute(input: string): Promise<string>;
}
```

**Example Adapter (Story 1.5):**

```typescript
// src/infrastructure/adapters/example-adapter.ts
import type { ExamplePort } from '../../core/ports/example-port.js';

export class ExampleAdapter implements ExamplePort {
  async execute(input: string): Promise<string> {
    return `Processed: ${input}`;
  }
}
```

**Note:** Real domain models (CommitMessage, GitContext, OllamaConfig) are defined in Epics 2-4.

### APIs and Interfaces

**CLI Command Interface (Story 1.4):**

```typescript
// src/index.ts
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('ollatool')
  .description('AI-powered commit message generator using Ollama')
  .version('0.1.0');

program
  .command('commit')
  .description('Generate and commit with AI-powered message')
  .action(() => {
    console.log('Not implemented yet');
  });

program.parse();
```

**CLI Output (FR47, FR48):**

```bash
$ ollatool --help
Usage: ollatool [options] [command]

AI-powered commit message generator using Ollama

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  commit          Generate and commit with AI-powered message
  help [command]  display help for command

$ ollatool --version
0.1.0
```

**Build Tooling Interface (Story 1.2):**

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  outDir: 'dist',
  sourcemap: true,
  minify: true,
  clean: true,
  shims: true,
});
```

**Test Configuration Interface (Story 1.3):**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

**Note:** Business logic interfaces (GitPort, OllamaPort, PromptBuilder) are defined in Epics 2-4.

### Workflows and Sequencing

**Epic 1 Story Execution Sequence:**

```
Story 1.1: Initialize TypeScript Project with ESM
    ↓
Story 1.2: Configure Build Tooling (tsup)
    ↓
Story 1.3: Setup Testing Framework (Vitest)
    ↓
Story 1.4: Setup CLI Framework (Commander.js)
    ↓
Story 1.5: Setup Hexagonal Architecture Structure
    ↓
Story 1.6: Setup Linting & Formatting
```

**Development Workflow (Post-Epic 1):**

```
1. Developer makes code changes
    ↓
2. Run tests: npm test
    ↓
3. Run typecheck: npm run typecheck
    ↓
4. Run linter: npm run lint
    ↓
5. Format code: npm run format
    ↓
6. Build: npm run build
    ↓
7. Manual verification: ollatool --help
```

**Build and Deployment Flow:**

```
Source Files (src/*.ts)
    ↓
TypeScript Compiler (tsc --noEmit) → Type Checking
    ↓
tsup Bundler → ESM Bundle (dist/index.js)
    ↓
Executable Binary (package.json bin field)
    ↓
User executes: ollatool <command>
```

**Note:** Full commit workflow (git → AI generation → user approval) is implemented in Epics 2-5.

## Non-Functional Requirements

### Performance

**Build Performance:**

- `npm run build` must complete in <5 seconds (tsup is optimized for speed)
- `tsc --noEmit` type checking should complete in <3 seconds for foundation code
- No measurable performance requirements for CLI initialization at this stage (sub-1s target applies to full commit workflow in Epic 5)

**Test Execution Performance:**

- Test suite (foundation smoke tests) should execute in <1 second
- Vitest watch mode should provide instant feedback (<100ms on file change)

**Development Workflow Performance:**

- `npm run lint` should complete in <2 seconds for foundation code
- `npm run format` should complete in <1 second
- Hot reload during development (`npm run dev`) should reflect changes instantly

**Rationale:** Fast feedback loops during development improve developer productivity. The sub-1s end-user performance target (FR40) applies to the complete commit workflow, not the build tooling.

### Security

**Dependency Security:**

- All npm dependencies must be from trusted sources (Commander.js, tsup, Vitest are industry-standard packages)
- Run `npm audit` during Story 1.1 to verify no known vulnerabilities in dependencies
- Pin dependency versions in package.json to prevent supply chain attacks

**Configuration Security:**

- No secrets or credentials in Epic 1 (infrastructure only)
- TypeScript strict mode enabled to prevent type-related vulnerabilities
- ESLint configured to catch potential security issues (no-eval, no-implied-eval rules)

**Code Execution:**

- No dynamic code execution (`eval`, `Function()`) permitted
- No user input processing at this stage (placeholder commit command only)

**File System Access:**

- Build outputs to `dist/` directory only
- No file system writes during CLI initialization
- Shebang (`#!/usr/bin/env node`) ensures correct Node.js runtime

**Rationale:** Epic 1 is low-risk infrastructure setup with no user data processing. Security requirements expand in Epic 2 (Ollama integration) and Epic 3 (git command execution).

### Reliability/Availability

**Build Reliability:**

- `npm run build` must produce deterministic output (same input → same output)
- Build process must fail fast with clear error messages if configuration is invalid
- TypeScript compilation errors must be caught before runtime

**Testing Reliability:**

- Test suite must be deterministic (no flaky tests)
- Test failures must provide clear diagnostics (file, line, assertion)
- Coverage reports must be accurate and reproducible

**CLI Reliability:**

- `ollatool --help` and `ollatool --version` must always work (FR47, FR48)
- Invalid commands must display helpful error messages with usage guidance
- CLI must exit with proper exit codes (0 for success, non-zero for errors)

**Node.js Runtime:**

- Enforce Node.js >=20.0.0 via `engines` field in package.json
- Graceful error if user runs with unsupported Node.js version
- ESM modules must load correctly on all supported Node.js versions

**Degradation Behavior:**

- If build fails, preserve previous `dist/` output to allow continued development
- If tests fail, report failures clearly without blocking development workflow
- If linting fails, allow developers to bypass with `--no-verify` (warnings, not blockers)

**Rationale:** Foundation infrastructure must be rock-solid to enable productive development of Epics 2-7.

### Observability

**Build Observability:**

- `npm run build` must display progress and completion status
- TypeScript compiler errors must show file paths and line numbers
- tsup bundler must report bundle size and build time

**Test Observability:**

- Vitest must display test results with pass/fail counts
- Failed tests must show actual vs expected values with diffs
- Coverage reports must identify untested code paths
- Test execution time must be visible for performance monitoring

**Development Feedback:**

- ESLint must report violations with rule names and fix suggestions
- Prettier must indicate which files were formatted
- TypeScript type errors must show clear error messages with context

**CLI Observability:**

- `ollatool --help` must display all available commands and options (FR47)
- `ollatool --version` must display current version number (FR48)
- Invalid commands must show "did you mean?" suggestions

**DEBUG Logging (Epic 0 Integration):**

- Epic 1 code can use DEBUG loggers from Epic 0 (ollatool:debug namespace)
- Build and test infrastructure can emit debug logs when `DEBUG=ollatool:*` is set
- No debug output in normal operation (zero console pollution)

**Rationale:** Clear observability during development accelerates debugging and ensures developers can diagnose issues quickly.

## Dependencies and Integrations

**Core Dependencies (package.json):**

| Dependency                           | Version  | Purpose                                  | Story |
| ------------------------------------ | -------- | ---------------------------------------- | ----- |
| **typescript**                       | ^5.9.3   | TypeScript compiler and language support | 1.1   |
| **@types/node**                      | ^24.10.1 | Node.js type definitions                 | 1.1   |
| **tsup**                             | Latest   | Fast ESM bundler for TypeScript          | 1.2   |
| **vitest**                           | ^4.0.14  | Modern test runner with ESM support      | 1.3   |
| **@vitest/coverage-v8**              | ^4.0.14  | Code coverage reporting                  | 1.3   |
| **commander**                        | 14.0.2   | CLI framework for command parsing        | 1.4   |
| **eslint**                           | Latest   | JavaScript/TypeScript linter             | 1.6   |
| **@typescript-eslint/parser**        | Latest   | TypeScript parser for ESLint             | 1.6   |
| **@typescript-eslint/eslint-plugin** | Latest   | TypeScript-specific ESLint rules         | 1.6   |
| **prettier**                         | ^3.0.0   | Code formatter                           | 1.6   |
| **tsx**                              | Latest   | TypeScript execution for development     | 1.1   |

**Existing Dependencies (from Epic 0):**

| Dependency       | Version | Purpose                                              | Epic |
| ---------------- | ------- | ---------------------------------------------------- | ---- |
| **debug**        | ^4.4.3  | DEBUG logging system                                 | 0    |
| **@types/debug** | ^4.1.12 | Type definitions for debug                           | 0    |
| **execa**        | ^9.6.0  | Shell command execution (for future git integration) | 0    |

**Integration Points:**

- **Epic 0 Integration:** Leverage existing Vitest configuration and DEBUG logging system
- **Future Epic 2 Integration:** Commander.js commands will invoke Ollama adapters
- **Future Epic 3 Integration:** Git operations will use execa (already installed)
- **Future Epic 5 Integration:** CLI framework will orchestrate interactive prompts

**External Services:**

- **Node.js Runtime:** >=20.0.0 (enforced via engines field)
- **npm Registry:** For dependency installation
- No external API calls or services in Epic 1

**File System Dependencies:**

- **Configuration Files:** package.json, tsconfig.json, tsup.config.ts, vitest.config.ts, .eslintrc.json, .prettierrc.json
- **Source Directory:** src/ (created in Story 1.5)
- **Build Directory:** dist/ (created by tsup in Story 1.2)
- **Node Modules:** node_modules/ (managed by npm)

## Acceptance Criteria (Authoritative)

**Epic-Level Acceptance Criteria:**

1. **AC1: Working TypeScript Project**
   - `npm install` completes successfully without errors
   - `tsc --noEmit` passes with zero type errors
   - package.json includes correct metadata and scripts
   - Project uses `"type": "module"` for ESM support

2. **AC2: Build System Operational**
   - `npm run build` produces `dist/index.js` ESM bundle
   - Built bundle includes proper shebang and is executable
   - Source maps are generated for debugging
   - Build completes in <5 seconds

3. **AC3: Testing Framework Ready**
   - `npm test` discovers and runs all `*.test.ts` files
   - Example test file demonstrates co-located pattern
   - Coverage reporting works via `npm run test:coverage`
   - Tests execute in <1 second

4. **AC4: CLI Framework Functional**
   - `ollatool --help` displays usage information (FR47)
   - `ollatool --version` displays version number (FR48)
   - `ollatool commit` shows "Not implemented yet" placeholder
   - CLI exits with proper exit codes (0 for success)

5. **AC5: Hexagonal Architecture Structure**
   - Directory structure includes: `src/core/`, `src/infrastructure/`, `src/features/`, `src/ui/`
   - Example port interface exists in `src/core/ports/`
   - Example adapter exists in `src/infrastructure/adapters/`
   - Architecture README documents layer responsibilities and dependency flow

6. **AC6: Code Quality Tooling**
   - `npm run lint` validates code against ESLint rules
   - `npm run format` formats code using Prettier
   - All linting and formatting rules pass on foundation code
   - Kebab-case file naming convention enforced

**Story-Level Acceptance Criteria:** (See dev/stories/epic-1-foundation.md for detailed AC per story)

## Traceability Mapping

| AC# | Spec Section(s)                           | Component(s)/API(s)                                    | Story | Test Idea                                                       |
| --- | ----------------------------------------- | ------------------------------------------------------ | ----- | --------------------------------------------------------------- |
| AC1 | Data Models → package.json Contract       | package.json, tsconfig.json                            | 1.1   | Verify `"type": "module"` exists, `tsc --noEmit` passes         |
| AC2 | APIs & Interfaces → Build Tooling         | tsup.config.ts, dist/index.js                          | 1.2   | Run `npm run build`, check dist/index.js exists, verify shebang |
| AC3 | APIs & Interfaces → Test Configuration    | vitest.config.ts, \*.test.ts                           | 1.3   | Run `npm test`, verify example test passes, check coverage      |
| AC4 | APIs & Interfaces → CLI Command Interface | src/index.ts, Commander.js                             | 1.4   | Execute `ollatool --help`, `ollatool --version`, verify output  |
| AC5 | Services & Modules → Directory Structure  | src/core/, src/infrastructure/, src/features/, src/ui/ | 1.5   | Verify directories exist, check example port/adapter files      |
| AC6 | Dependencies → Code Quality               | .eslintrc.json, .prettierrc.json                       | 1.6   | Run `npm run lint`, `npm run format`, verify zero violations    |

**Functional Requirements Coverage:**

| FR#  | Description             | Epic 1 Coverage | Component                     |
| ---- | ----------------------- | --------------- | ----------------------------- |
| FR47 | `--help` flag for usage | ✅ AC4          | src/index.ts (Commander.js)   |
| FR48 | `--version` flag        | ✅ AC4          | src/index.ts (Commander.js)   |
| FR49 | Extensible architecture | ✅ AC5          | Hexagonal directory structure |

**Note:** Epic 1 covers only 3 of 49 functional requirements. The remaining FRs (FR1-FR46) are implemented in Epics 2-6.

## Risks, Assumptions, Open Questions

**Risks:**

1. **RISK: ESM Configuration Complexity**
   - TypeScript ESM + Node.js can have subtle module resolution issues
   - **Mitigation:** Follow dev/styleguides/nodejs-cli-setup-patterns.md exactly, use NodeNext resolution
   - **Severity:** Medium | **Likelihood:** Low

2. **RISK: Dependency Version Conflicts**
   - New dependencies may conflict with existing Epic 0 dependencies (execa, debug)
   - **Mitigation:** Test build after each dependency installation, use `npm audit` to check compatibility
   - **Severity:** Low | **Likelihood:** Low

3. **RISK: Build Performance Degradation**
   - tsup build may slow down as codebase grows in future epics
   - **Mitigation:** Monitor build times, optimize tsup config if needed (deferred to Epic 6)
   - **Severity:** Low | **Likelihood:** Medium

**Assumptions:**

1. **ASSUMPTION: Node.js >=20.0.0 Available**
   - Developers have Node.js 20+ installed on their machines
   - **Validation:** Enforce via `engines` field, provide clear error message if version mismatch

2. **ASSUMPTION: Epic 0 Infrastructure Stable**
   - Vitest configuration from Epic 0 works correctly and can be extended
   - DEBUG logging system is production-ready
   - **Validation:** Run existing Epic 0 tests after Epic 1 setup to ensure no regressions

3. **ASSUMPTION: No Business Logic in Epic 1**
   - Epic 1 is purely infrastructure—no Ollama integration, no git operations
   - **Validation:** Code review ensures no premature feature implementation

4. **ASSUMPTION: Naming Standards from Epic 0 Retrospective**
   - Epic 0 identified naming issues; Epic 1 will document standards to prevent recurrence
   - **Validation:** Architecture README includes explicit naming conventions (kebab-case files, PascalCase classes, camelCase variables)

**Open Questions:**

1. **QUESTION: Should we include pre-commit hooks in Story 1.6?**
   - **Context:** Pre-commit hooks can enforce linting/formatting automatically
   - **Decision Needed:** Optional vs mandatory? Husky vs simple git hooks?
   - **Owner:** Project Lead (Joe)
   - **Status:** DEFERRED - Start without hooks, add later if team requests

2. **QUESTION: Should example port/adapter in Story 1.5 be functional or minimal?**
   - **Context:** Could create a simple "echo" service vs just interfaces
   - **Decision:** Minimal interfaces only—no business logic until Epics 2-3
   - **Owner:** Development Team
   - **Status:** RESOLVED - Minimal example demonstrating pattern only

## Test Strategy Summary

**Epic 1 Testing Approach:**

Epic 1 focuses on **infrastructure validation** rather than business logic testing. Testing verifies that tooling works correctly.

**Test Levels:**

1. **Smoke Tests (Infrastructure Validation):**
   - Verify `npm install` completes successfully
   - Verify `npm run build` produces executable bundle
   - Verify `npm test` discovers and runs tests
   - Verify `npm run typecheck` passes
   - Verify `npm run lint` and `npm run format` work

2. **Integration Tests (Tooling):**
   - Example test file in Story 1.3 demonstrates co-located pattern
   - Test that TypeScript compilation catches type errors
   - Test that ESLint catches code quality issues
   - Test that CLI commands (`--help`, `--version`) produce correct output

3. **Manual Verification:**
   - Execute `ollatool --help` and verify output format
   - Execute `ollatool --version` and verify version number
   - Execute `ollatool commit` and verify placeholder message
   - Verify hexagonal directory structure exists

**Test Coverage Targets:**

- **Infrastructure Code:** 100% (configuration files must work or project fails)
- **Example Code:** 80%+ (demonstrates testing pattern for future epics)
- **CLI Entry Point:** 100% (critical path must be validated)

**Testing Strategy from Epic 0:**

- **Co-located Tests:** `*.test.ts` files adjacent to implementation
- **Vitest Framework:** Modern test runner with native ESM support
- **Mock Strategy:** No mocking required in Epic 1 (infrastructure only)

**Edge Cases and Scenarios:**

| Scenario                | Test Approach                     | Expected Outcome                    |
| ----------------------- | --------------------------------- | ----------------------------------- |
| Invalid TypeScript code | Run `npm run typecheck`           | Build fails with clear error        |
| Missing dependency      | Run `npm install` then `npm test` | Tests fail with import error        |
| Wrong Node.js version   | Check `engines` field enforcement | Error message suggests Node upgrade |
| Invalid ESLint config   | Run `npm run lint`                | ESLint reports config error         |
| Malformed package.json  | Run `npm install`                 | npm reports JSON parse error        |

**Test Execution:**

- All tests must pass before marking stories complete
- Test suite should execute in <1 second
- Coverage reports generated via `npm run test:coverage`
- Integration with Epic 0's DEBUG logging for test diagnostics

**Future Epic Preparation:**

- Story 1.3 establishes testing patterns for Epics 2-7
- Story 1.5 demonstrates port/adapter pattern for future mocking
- Vitest configuration ready for expansion with more test suites
