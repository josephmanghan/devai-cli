# Epic 1: Foundation & Project Setup - Story Breakdown

**Goal:** Establish development infrastructure and CLI framework
**User Value:** Creates working project foundation that enables all subsequent features
**FRs Covered:** FR49 (extensible architecture)

---

## Story 1.1: Initialize TypeScript Project with ESM

**As a** developer
**I want** a working TypeScript project with modern ESM configuration
**So that** I have a solid foundation for building the CLI tool

**Acceptance Criteria:**

- [ ] Package.json created with `"type": "module"` and correct metadata
- [ ] TypeScript configured with NodeNext resolution, ES2022 target, strict mode
- [ ] tsconfig.json includes proper paths and module resolution settings
- [ ] Project compiles successfully with `tsc --noEmit`
- [ ] Basic package.json scripts: `build`, `dev`, `typecheck`
- [ ] Code adheres to dev/styleguides/clean-code.md standards

**Technical Notes:**

- Follow `dev/styleguides/nodejs-cli-setup-patterns.md` for configuration
- Package name: `ollatool` (per PRD)
- Node version constraint: `>=20.0.0`
- ESM required by execa 9.x dependency (architecture decision)

**Testing Deliverables:**

- Verify `tsc --noEmit` passes
- Verify `npm run build` completes without errors

---

## Story 1.2: Configure Build Tooling (tsup)

**As a** developer
**I want** fast ESM bundling with tsup
**So that** the CLI builds quickly and outputs optimized ESM bundles

**Acceptance Criteria:**

- [ ] tsup installed and configured in tsup.config.ts
- [ ] Build outputs to `dist/` directory with ESM format
- [ ] Entry point configured for CLI (src/index.ts)
- [ ] Source maps enabled for debugging
- [ ] Build script produces executable bundle

**Technical Notes:**

- Architecture specifies tsup for fast ESM bundling
- Configuration: ESM format, minification enabled, target ES2022
- Output: `dist/index.js` as main entry point

**Testing Deliverables:**

- Verify `npm run build` produces dist/index.js
- Verify bundle is valid ESM (can be imported)
- Basic smoke test: `node dist/index.js --help` (after CLI setup)

---

## Story 1.3: Setup Testing Framework (Vitest)

**As a** developer
**I want** Vitest configured with co-located test pattern
**So that** I can write and run unit tests efficiently

**Acceptance Criteria:**

- [ ] Vitest installed with TypeScript support
- [ ] vitest.config.ts configured for Node environment
- [ ] Test script added to package.json
- [ ] Example test file demonstrates co-located pattern works
- [ ] Tests run successfully with `npm test`

**Technical Notes:**

- Architecture specifies Vitest for modern ESM test runner
- Co-located pattern: `*.test.ts` files adjacent to source files
- Configuration: globals enabled, node environment, ESM support

**Testing Deliverables:**

- Create `src/example.test.ts` to verify setup
- Verify `npm test` discovers and runs tests
- Verify test coverage reporting works

---

## Story 1.4: Setup CLI Framework (Commander.js)

**As a** developer
**I want** Commander.js integrated with basic CLI structure
**So that** I can parse commands and arguments

**Acceptance Criteria:**

- [ ] Commander.js installed (v14.0.2)
- [ ] src/index.ts created as CLI entry point
- [ ] Basic program structure with version and description
- [ ] Placeholder `commit` command registered
- [ ] `--help` and `--version` flags work (FR47, FR48)
- [ ] Shebang and executable permissions configured

**Technical Notes:**

- Architecture specifies Commander.js v14.0.2
- Entry point: src/index.ts (maps to dist/index.js after build)
- Bin field in package.json: `"ollatool": "./dist/index.js"`
- Placeholder commit command can just log "Not implemented"

**Testing Deliverables:**

- Unit test for CLI initialization
- Manual verification: `ollatool --help` shows usage
- Manual verification: `ollatool --version` shows version

**FRs Covered:** FR47 (--help), FR48 (--version)

---

## Story 1.5: Setup Hexagonal Architecture Structure

**As a** developer
**I want** hexagonal directory structure with clear separation of concerns
**So that** the codebase remains maintainable and testable

**Acceptance Criteria:**

- [ ] Directory structure created: `src/core/`, `src/infrastructure/`, `src/features/`, `src/ui/`
- [ ] README.md documents architecture pattern and directory purposes
- [ ] Example interface created in core/ demonstrating port pattern
- [ ] Example adapter created in infrastructure/ implementing port
- [ ] Dependencies flow inward (core has zero external deps)

**Technical Notes:**

- Architecture specifies "Pragmatic Hexagonal" with manual DI
- Core layer: domain logic, ports (interfaces)
- Infrastructure layer: adapters (OllamaAdapter, ShellGitAdapter)
- Features layer: use cases, command handlers
- UI layer: @clack/prompts, CLI commands
- No IoC container (manual dependency injection)

**Testing Deliverables:**

- Document architecture pattern in src/README.md
- Verify core/ has no dependencies in package.json imports
- Create architecture diagram (optional but helpful)

**FRs Covered:** FR49 (extensible architecture)

---

## Story 1.6: Setup Linting & Formatting

**As a** developer
**I want** ESLint and Prettier configured
**So that** code quality and style remain consistent

**Acceptance Criteria:**

- [ ] ESLint installed with TypeScript support
- [ ] Prettier installed and configured
- [ ] .eslintrc.json configured per styleguide standards
- [ ] .prettierrc.json configured per styleguide standards
- [ ] Lint and format scripts added to package.json
- [ ] Pre-commit hook optional but recommended

**Technical Notes:**

- Follow `dev/styleguides/nodejs-cli-setup-patterns.md`
- ESLint extends recommended TypeScript rules
- Prettier integrates with ESLint (no conflicts)
- File naming: kebab-case per architecture

**Testing Deliverables:**

- Verify `npm run lint` passes on all source files
- Verify `npm run format` formats code correctly
- Create .eslintignore and .prettierignore files

---

## Epic 1 Summary

**Total Stories:** 6
**Estimated Complexity:** Medium (foundational setup, no business logic)
**Dependencies:** None (enables all other epics)
**Output:** Working TypeScript + ESM + Vitest + Commander.js project with hexagonal structure

**Completion Criteria:**

- All 6 stories pass acceptance criteria
- `npm run build` produces executable CLI
- `npm test` runs test suite successfully
- `ollatool --help` and `ollatool --version` work
- Project structure follows hexagonal pattern per architecture
