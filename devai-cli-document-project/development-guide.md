# Development Guide: devai-cli

## Prerequisites

### Required Software

| Software    | Minimum Version | Purpose               |
| ----------- | --------------- | --------------------- |
| Node.js     | 20.0.0          | Runtime environment   |
| npm         | 10.x            | Package manager       |
| Git         | 2.x             | Version control       |
| Ollama      | Latest          | Local LLM for testing |
| Code Editor | Any             | VS Code recommended   |

### Recommended Extensions (VS Code)

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Language support
- **Vitest** - Test runner integration

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/josephmanghan/devai-cli.git
cd devai-cli
```

### 2. Install Dependencies

```bash
npm install
```

This installs:

- Production dependencies (`dependencies`)
- Development dependencies (`devDependencies`)

### 3. Install Ollama

```bash
# macOS
brew install ollama

# Or download from https://ollama.com/download
```

### 4. Start Ollama Daemon

```bash
ollama serve
```

Keep this running in a separate terminal.

### 5. Run Setup

```bash
npm run dev setup
```

This pulls the base model (~900MB download) and creates the custom model.

---

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly without building.

**Examples:**

```bash
npm run dev setup           # Run setup command
npm run dev commit          # Run commit command
npm run dev commit -a       # Commit with auto-stage
npm run dev -- --help       # Show help
npm run dev -- --version    # Show version
```

### Building

```bash
npm run build
```

**Output:** `dist/index.js` (ESM bundle with shebang)

**Build Tool:** tsup (esbuild-based)

- Fast compilation
- Single file output
- ESM format
- Source maps (in dev)

### Testing Locally

After building, you can test the production bundle:

```bash
npm run build:link    # Build and create global symlink
devai-cli commit      # Test as if installed globally
npm run unlink        # Remove global symlink
```

---

## Development Commands

### Core Workflows

```bash
# Development
npm run dev              # Run in dev mode with tsx

# Building
npm run build            # Build production bundle
npm run build:link       # Build and link globally
npm run unlink           # Unlink global install

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests (requires Ollama)
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report
npm run test:demo        # Run interactive UI demos

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without modifying
npm run typecheck        # TypeScript type checking

# Pre-commit Checks
npm run pr               # Full PR validation (format, lint, typecheck, test, build)
npm run pr:lite          # Faster PR check (unit tests only)

# Utilities
npm run validate:setup   # Check development environment
npm run release:prep     # Clean up before release
```

---

## Testing

### Test Structure

```
devai-cli/
├── src/                    # Source code with co-located unit tests
│   └── **/*.test.ts        # Unit tests (21 files)
└── tests/                  # Separate test suites
    ├── integration/        # Integration tests (2 files)
    ├── e2e/                # End-to-end tests (2 files)
    └── helpers/            # Test utilities (3 files)
```

### Running Tests

**All Tests:**

```bash
npm run test
```

**Watch Mode (for TDD):**

```bash
npm run test:watch
```

**Unit Tests Only (fastest):**

```bash
npm run test:unit
```

**Integration Tests (requires Ollama):**

```bash
# Ensure Ollama is running
ollama serve

# Run integration tests
npm run test:integration
```

**End-to-End Tests:**

```bash
npm run test:e2e
```

**Coverage Report:**

```bash
npm run test:coverage
```

Opens HTML report in browser with detailed coverage breakdown.

---

## Code Quality

### Linting (ESLint)

**Configuration:** `eslint.config.js`

**Run Linter:**

```bash
npm run lint
```

**Auto-fix Issues:**

```bash
npm run lint:fix
```

**Rules:**

- TypeScript ESLint recommended rules
- Prettier compatibility
- Simple import sort
- Node.js best practices

### Formatting (Prettier)

**Configuration:** `prettier.config.mjs`

**Format All Files:**

```bash
npm run format
```

**Check Formatting:**

```bash
npm run format:check
```

**Ignored Files:** See `.prettierignore`

### Type Checking

**Run Type Checker:**

```bash
npm run typecheck
```

**Configuration:**

- `tsconfig.json` - Root config (extends build config)
- `tsconfig.build.json` - Build settings (ES2022, NodeNext)

**Strict Mode:** Enabled (`strict: true`)

---

## Git Workflow

### Commit Message Format

This project follows **Conventional Commits** (naturally!).

**Format:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Test changes
- `chore` - Build/tooling changes

**Example:**

```
feat(commit): add retry logic for failed LLM responses

Implements exponential backoff with max 3 retries when
the LLM returns invalid commit message format.

Closes #42
```

### Pre-commit Checklist

Before committing:

1. **Run lint & format:**

   ```bash
   npm run lint:fix
   npm run format
   ```

2. **Run type check:**

   ```bash
   npm run typecheck
   ```

3. **Run tests:**

   ```bash
   npm run test
   ```

4. **Or run all at once:**
   ```bash
   npm run pr:lite    # Fast (unit tests only)
   npm run pr         # Full validation
   ```

### Branch Strategy

- `main` - Stable releases
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

---

## Architecture Guidelines

### Clean Architecture Principles

**Dependency Rule:** Dependencies flow inward

```
UI → Features → Core ← Infrastructure
```

**Rules:**

1. **Core** has NO external dependencies
2. **Features** depend only on core
3. **Infrastructure** implements core ports
4. **UI** implements core UI ports

### Adding New Features

**Structure:**

```
src/features/new-feature/
├── controllers/           # Command handlers
│   └── new-controller.ts
├── use-cases/             # Business operations
│   ├── first-use-case.ts
│   └── second-use-case.ts
├── utils/                 # Feature-specific helpers
│   └── helper.ts
└── index.ts               # Feature exports
```

**Steps:**

1. Define domain types in `src/core/types/`
2. Define ports (if needed) in `src/core/ports/`
3. Implement use cases in `src/features/new-feature/use-cases/`
4. Create controller in `src/features/new-feature/controllers/`
5. Wire dependencies in `main.ts`
6. Write tests at each layer

### Adding Infrastructure Adapters

**Structure:**

```
src/infrastructure/adapters/new-adapter/
├── new-adapter.ts         # Port implementation
├── new-adapter.test.ts    # Adapter tests
└── index.ts               # Adapter exports
```

**Steps:**

1. Implement port interface from `src/core/ports/`
2. Handle errors → translate to domain errors
3. Write unit tests with mocked external dependencies
4. Export from `src/infrastructure/index.ts`

### Adding UI Components

**Structure:**

```
src/ui/new-component/
├── new-component.ts       # Component implementation
├── new-component.test.ts  # Component tests
├── new-component.demo.ts  # Interactive demo
└── index.ts               # Component exports
```

**Steps:**

1. Use `@clack/prompts` for interactions
2. Keep components pure (testable)
3. Create `.demo.ts` for manual testing
4. Write automated tests

---

## Debugging

### Enable Debug Logging

```bash
# Enable all debug logs
DEBUG=devai-cli:* npm run dev commit

# Enable specific module
DEBUG=devai-cli:ollama npm run dev commit

# Multiple modules
DEBUG=devai-cli:ollama,devai-cli:git npm run dev commit
```

**Available Loggers:**

- `devai-cli:ollama` - Ollama adapter
- `devai-cli:git` - Git adapter
- `devai-cli:editor` - Editor adapter

### VS Code Debugging

**Configuration:** `.vscode/launch.json` (create if needed)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--", "commit"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "DEBUG": "devai-cli:*"
      }
    }
  ]
}
```

---

## Interactive Demos

### Running Component Demos

```bash
npm run test:demo
```

This runs `scripts/run-demos.ts` which executes all `.demo.ts` files.

**Manual Demo:**

```bash
npm run dev -- tsx src/ui/commit/components/type-selector/type-selector.demo.ts
```

### Creating Demos

**Template:**

```typescript
// component.demo.ts
import { myComponent } from './component.js';

async function demo() {
  console.log('Demo: My Component\n');
  const result = await myComponent();
  console.log('Result:', result);
}

demo();
```

---

## Troubleshooting

### Ollama Connection Issues

**Problem:** "Failed to connect to Ollama"

**Solution:**

1. Check Ollama is running: `ollama list`
2. Start daemon: `ollama serve`
3. Check port: Default is `http://localhost:11434`

### Model Not Found

**Problem:** "Model qwen2.5-coder:1.5b-conventional-commit not found"

**Solution:**

```bash
npm run dev setup
```

This re-provisions the custom model.

### Type Errors

**Problem:** TypeScript errors in editor

**Solution:**

1. Restart TS server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check `tsconfig.json` extends correct files

### Test Failures

**Problem:** Integration tests failing

**Solution:**

1. Ensure Ollama is running: `ollama serve`
2. Check model exists: `ollama list | grep qwen2.5-coder`
3. Re-run setup: `npm run dev setup`

---

## Release Process

### Pre-release Checklist

1. **Update version in `package.json`**

   ```json
   {
     "version": "0.4.0"
   }
   ```

2. **Update `CHANGELOG.md`**
   - Document new features
   - Document bug fixes
   - Document breaking changes

3. **Clean temporary files**

   ```bash
   npm run release:prep
   ```

4. **Run full validation**

   ```bash
   npm run pr
   ```

5. **Commit changes**

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 0.4.0"
   ```

6. **Tag release**

   ```bash
   git tag v0.4.0
   git push origin main --tags
   ```

7. **Publish to npm**
   ```bash
   npm publish
   ```

---

## Project-Specific Conventions

### File Naming

- **Source files:** `kebab-case.ts`
- **Test files:** `kebab-case.test.ts`
- **Demo files:** `kebab-case.demo.ts`
- **Types files:** `kebab-case.types.ts`
- **Ports:** `*-port.ts`
- **Adapters:** `*-adapter.ts`
- **Controllers:** `*-controller.ts`

### Import/Export Patterns

**Barrel Exports:** Use `index.ts` files to re-export public API

```typescript
// src/features/commit/index.ts
export * from './controllers/index.js';
export * from './use-cases/index.js';
```

**ESM Extensions:** Always include `.js` extension in imports

```typescript
import { something } from './module.js'; // ✅ Correct
import { something } from './module'; // ❌ Wrong
```

### Error Handling

**Use Domain Errors:**

```typescript
import { GitError, OllamaError } from '@/core/types/errors.types.js';

throw new GitError(
  'No staged changes found',
  1,
  'Stage changes with: git add <files>'
);
```

**Error Properties:**

- `message` - Human-readable error
- `code` - Exit code
- `remediation` - Suggested action (optional)

---

## Performance Considerations

### Build Performance

- **tsup** uses esbuild (very fast)
- Single bundle output
- Tree-shaking enabled

**Build Time:** < 5 seconds

### Test Performance

- **Vitest** parallel execution
- Fast test runs via Vite

**Typical Test Run:** < 10 seconds (unit tests)

### Runtime Performance

- **ESM modules** - Fast startup
- **Minimal dependencies** - Small bundle size
- **Streaming responses** - Low latency LLM interaction

**Target:** Sub-1 second commit message generation

---

## Resources

### Documentation

- [Architecture](./architecture.md) - Detailed architecture documentation
- [Source Tree](./source-tree-analysis.md) - Annotated directory structure
- [Project Overview](./project-overview.md) - High-level summary

### External Resources

- [Vitest Docs](https://vitest.dev/) - Testing framework
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [@clack/prompts](https://github.com/natemoo-re/clack/tree/main/packages/prompts) - Terminal prompts
- [Ollama Docs](https://github.com/ollama/ollama) - Local LLM platform
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit format spec

---

**Document Version:** 1.0
**Generated:** 2025-12-02
**For Project Version:** 0.3.0
