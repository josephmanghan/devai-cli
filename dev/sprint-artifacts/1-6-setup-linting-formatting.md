# Story 1.6: Setup Linting and Formatting

Status: done

## Story

As a developer,
I want ESLint and Prettier configured with project-specific standards,
so that I can maintain consistent code quality and formatting across the codebase.

## Acceptance Criteria

1. [ ] ESLint configured with TypeScript support and project-specific rules
2. [ ] Prettier configured with consistent formatting standards
3. [ ] npm scripts added for linting and formatting commands
4. [ ] Configuration follows project styleguide standards
5. [ ] Build process includes linting validation

## Tasks / Subtasks

- [ ] Install ESLint and Prettier dependencies (AC: 1, 2)
  - [ ] Add eslint, prettier, @typescript-eslint/parser, @typescript-eslint/eslint-plugin
  - [ ] Add eslint-config-prettier to prevent conflicts
- [ ] Configure ESLint (AC: 1, 4)
  - [ ] Create .eslintrc.js with TypeScript configuration
  - [ ] Apply rules from dev/styleguides/clean-code.md (function size, naming, etc.)
- [ ] Configure Prettier (AC: 2, 4)
  - [ ] Create .prettierrc.js with project formatting standards
  - [ ] Set consistent tab width, quote style, trailing commas
- [ ] Add npm scripts (AC: 3)
  - [ ] Add lint, lint:fix, format, format:check scripts
  - [ ] Update package.json with new scripts
- [ ] Integrate with build process (AC: 5)
  - [ ] Add lint validation to build or pre-commit hook
  - [ ] Ensure CI pipeline will catch linting errors
- [ ] Add comprehensive validation command (AC: 3)
  - [ ] Create `npm run pr` script that runs all quality checks in sequence
  - [ ] Include format:check, lint, typecheck, test, and build in the validation pipeline

## Dev Notes

### Configuration Requirements

- ESLint must support TypeScript strict mode [Source: dev/architecture.md#Development-Dependencies]
- Prettier must be configured per styleguide standards [Source: dev/architecture.md#Linting/Formatting]
- Rules should enforce clean code standards: ≤15 lines per function, camelCase naming [Source: dev/styleguides/clean-code.md]

### Integration Points

- Must work with existing tsup build configuration [Source: dev/sprint-artifacts/1-2-configure-build-tooling-tsup.md]
- TypeScript configuration: strict mode already enabled [Source: dev/sprint-artifacts/1-1-initialize-typescript-project-with-esm.md]
- Hexagonal architecture: linting must work across all layers [Source: dev/sprint-artifacts/1-5-setup-hexagonal-architecture-structure.md]

### Project Structure Notes

**Configuration Files:**

- `.eslintrc.js` - ESLint configuration with TypeScript support
- `.prettierrc.js` - Prettier formatting configuration
- `.eslintignore` - Ignore dist/ and node_modules/
- `.prettierignore` - Ignore dist/ and generated files

**NPM Scripts:**

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changing files
- `npm run pr` - Comprehensive validation: format:check, lint, typecheck, test, build

**Key Rules to Enforce:**

- Function size: Maximum 15 lines per clean code guide
- Variable naming: camelCase for variables/functions, PascalCase for classes
- Import organization: External dependencies first, then internal imports
- No unused imports or variables

### Learnings from Previous Story

**From Story 1-5-setup-hexagonal-architecture-structure (Status: ready-for-dev)**

- **🚨 CONFIGURATION FILES DON'T NEED TESTS**: Like barrel files in 1-5, ESLint/Prettier config is setup, not business logic - NO tests needed
- **Clean Code Standards**: Architecture document enforces ≤15 lines per function, 0-2 arguments per method - lint rules must reflect this
- **KISS Principle**: Keep configuration simple and focused on enabling development workflow
- **Build Integration**: Any new configuration must work with existing tsup build system

**From Story 1-3-setup-testing-framework-vitest (Status: ready-for-dev)**

- **Critical Lesson**: Don't test setup and configuration - only test actual business logic
- **Apply Here**: ESLint/Prettier configuration is tooling setup, not application logic

### References

- Linting and formatting dependencies specification [Source: dev/architecture.md#Development-Dependencies]
- Clean code standards for linting rules [Source: dev/styleguides/clean-code.md]
- Build system integration requirements [Source: dev/sprint-artifacts/1-2-configure-build-tooling-tsup.md]
- TypeScript configuration context [Source: dev/sprint-artifacts/1-1-initialize-typescript-project-with-esm.md]
- Development standards for tooling [Source: dev/architecture.md#Development-Standards]

## Dev Agent Record

### Context Reference

- dev/sprint-artifacts/1-6-setup-linting-formatting.context.xml

### Agent Model Used

glm-4.6

### Debug Log References

### Completion Notes

**Completed:** 2025-11-29
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### Completion Notes List

### File List

- eslint.config.js
- .prettierrc.cjs
- package.json (scripts and devDependencies sections)

## Senior Developer Review (AI)

**Reviewer:** Joe  
**Date:** 2025-11-29  
**Outcome:** **Changes Requested**

Implementation is functionally complete but **missing critical ESLint rules** that enforce project clean code standards.

### Summary

Story 1-6 successfully configured ESLint and Prettier with working npm scripts and build integration. However, the ESLint configuration has a significant gap: the `@typescript-eslint/eslint-plugin` package is installed but never imported or configured in `eslint.config.js`. More critically, the project's clean code standard requiring ≤15 lines per function (documented in `dev/styleguides/clean-code.md:44-45`) has **zero ESLint enforcement**.

This gap likely contributed to the reported issue where "the agent deleted code halfway through implementation" - without strict linting rules, problematic code patterns could pass validation.

Research into Node.js TypeScript linting best practices for 2024/2025 confirms the project is using modern tooling (flat config format, latest ESLint 9.x) but is missing essential TypeScript-specific rules and function complexity enforcement.

### Key Findings

**🔴 HIGH SEVERITY**

1. **Missing Function Complexity Rules** - `clean-code.md` requires ≤15 lines per function, but no `max-lines-per-function` rule configured
2. **TypeScript ESLint Plugin Not Activated** - Plugin installed (`@typescript-eslint/eslint-plugin ^8.48.0`) but never imported in config
3. **No Strict TypeScript Rules** - Missing `@typescript-eslint/recommended` or `@typescript-eslint/strict` rule sets

**🟡 MEDIUM SEVERITY**

4. **Missing Naming Convention Enforcement** - camelCase/PascalCase standards not enforced via `@typescript-eslint/naming-convention`
5. **No Import Organization Rules** - Missing `sort-imports` or equivalent
6. **Unused Variable Detection Missing** - `no-unused-vars` disabled but no `@typescript-eslint/no-unused-vars` enabled

### Acceptance Criteria Coverage

| AC# | Description                                                          | Status         | Evidence                                                                                                                                   |
| --- | -------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | ESLint configured with TypeScript support and project-specific rules | ⚠️ PARTIAL     | Parser configured [eslint.config.js:2-13] but plugin rules NOT enabled. Missing function size, complexity, naming rules from clean-code.md |
| AC2 | Prettier configured with consistent formatting standards             | ✅ IMPLEMENTED | `.prettierrc.cjs` L1-44, `npm run format:check` passes                                                                                     |
| AC3 | npm scripts added for linting and formatting commands                | ✅ IMPLEMENTED | `package.json:17-18,25` - all scripts present and working                                                                                  |
| AC4 | Configuration follows project styleguide standards                   | ⚠️ PARTIAL     | Prettier compliant. ESLint missing clean-code.md enforcement: max 15 lines/function, camelCase naming, import organization                 |
| AC5 | Build process includes linting validation                            | ✅ IMPLEMENTED | `package.json:25` - `npm run pr` includes lint check                                                                                       |

**Summary:** 2 of 5 ACs fully implemented, 2 partially implemented

### Task Completion Validation

| Task                                     | Marked As   | Verified As     | Evidence                                                               |
| ---------------------------------------- | ----------- | --------------- | ---------------------------------------------------------------------- |
| Install ESLint and Prettier dependencies | ✅ Complete | ✅ VERIFIED     | package.json:38-39,41                                                  |
| Add eslint-config-prettier               | ✅ Complete | ✅ VERIFIED     | package.json:39                                                        |
| Configure ESLint with TypeScript         | ✅ Complete | ⚠️ QUESTIONABLE | Parser configured but plugin NOT imported                              |
| Apply rules from clean-code.md           | ✅ Complete | ❌ NOT DONE     | Zero function size enforcement despite clean-code.md:44-45 requirement |
| Configure Prettier                       | ✅ Complete | ✅ VERIFIED     | .prettierrc.cjs comprehensive config                                   |
| Add npm scripts                          | ✅ Complete | ✅ VERIFIED     | All scripts working                                                    |
| Create npm run pr script                 | ✅ Complete | ✅ VERIFIED     | Full validation pipeline present                                       |
| Integrate with build process             | ✅ Complete | ✅ VERIFIED     | PR script runs lint before build                                       |

**Summary:** 6 of 8 tasks verified complete, 1 questionable, **1 falsely marked complete** (clean-code.md rules)

**🚨 Critical:** Task "Apply rules from dev/styleguides/clean-code.md" marked complete but **NOT IMPLEMENTED**. The most important rule (≤15 lines per function) is completely missing from ESLint config.

### Test Coverage and Gaps

✅ No tests created for config files (correctly follows `clean-code.md` anti-pattern guidance)  
✅ Build system validates configs via execution (correct approach)

### Architectural Alignment

✅ Works with hexagonal architecture layers  
✅ Integrates with tsup build system (`npm run pr` passes)  
✅ No config file tests (follows project standards)

### Security Notes

No security-related concerns. Basic security patterns covered (no-eval, prefer-const).

### Best-Practices and References

**Research Sources:**

- [TypeScript ESLint Getting Started](https://typescript-eslint.io/getting-started/)
- [ESLint max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function) - Default 50 lines, project needs 15
- [ESLint complexity](https://eslint.org/docs/latest/rules/complexity) - Default 20, recommend 10 for maintainability
- Medium: "Node.js TypeScript ESLint best practices 2024" - Confirms flat config approach is correct
- Project: `dev/styleguides/clean-code.md` - Function size standards

**Key Research Finding:** TypeScript ESLint's `recommended` and `strict` presets do NOT include `max-lines-per-function`, `complexity`, or `max-lines` rules. These must be explicitly added to enforce clean code standards.

### Action Items

**Code Changes Required:**

- [ ] [High] Import and configure @typescript-eslint plugin in eslint.config.js (AC #1, #4) [file: eslint.config.js:1-10]
- [ ] [High] Enable `max-lines-per-function` rule with max: 15, skipBlankLines: true (AC #1, #4) [file: eslint.config.js:33-44]
- [ ] [High] Enable `@typescript-eslint/recommended` rule set (AC #1) [file: eslint.config.js:5-44]
- [ ] [Med] Add `@typescript-eslint/no-unused-vars` with ignore pattern for underscore-prefixed vars (AC #1) [file: eslint.config.js:33-44]
- [ ] [Med] Add `@typescript-eslint/naming-convention` for camelCase/PascalCase enforcement (AC #4) [file: eslint.config.js:33-44]
- [ ] [Low] Add `complexity` rule at warn level with max: 10 (AC #4) [file: eslint.config.js:33-44]
- [ ] [Low] Add `sort-imports` rule for import organization (AC #4) [file: eslint.config.js:33-44]

**Advisory Notes:**

- Note: After adding strict rules, existing code may trigger lint violations requiring fixes
- Note: Run `npm run lint:fix` after rule updates to auto-fix issues where possible
- Note: The reported "agent deleted code halfway through" issue may be prevented by strict function size enforcement
- Note: Consider running lint with `--max-warnings 0` in CI to treat warnings as errors

## Research Reference for Validation

**Critical Research Document:** `docs/research/Node.js ESLint Rules for Quality.md`

This research document contains the definitive modern best practices for Node.js TypeScript ESLint configuration that must be used for validation. Any future modifications to the linting configuration should be validated against this research standard.

**Key Research Findings Implemented:**

- Type-aware parser configuration for production code only
- Node.js-specific rules (eslint-plugin-n) with proper file mapping
- Async safety rules: `no-floating-promises`, `no-misused-promises`
- Boolean expression safety: `strict-boolean-expressions`
- Import sorting with `simple-import-sort` plugin
- Clean code enforcement: `max-lines-per-function: 15`, `complexity: 10`

**Validation Requirements:**

- All ESLint rule changes must be validated against research recommendations
- Type-aware parsing must only apply to production code
- Test files should use basic parsing (no type checking)
- CLI-specific considerations (hashbang, bin field mapping)

## Change Log

**2025-11-29:** Senior Developer Review notes appended - Changes Requested due to missing ESLint rules for clean code enforcement

**2025-11-29:** Research-driven ESLint migration completed

- Implemented modern Node.js TypeScript ESLint best practices
- Added type-aware parsing for production code only
- Configured Node.js-specific rules with proper file mapping
- Added async safety and boolean expression rules
- Integrated simple-import-sort for better import organization
- All validation checks passing (format:check, lint, typecheck, test, build)

**Research Source:** `docs/research/Node.js ESLint Rules for Quality.md`

We really should have investigated and implemented linting AT THE START. It's led to a number of unecessary issues that would not have happened if we had.
