# Project Documentation Index: devai-cli

**AI-powered git commit message generator - 100% local, privacy-first CLI tool**

---

## Project Overview

- **Type:** CLI Tool (Monolith)
- **Primary Language:** TypeScript
- **Architecture:** Clean Architecture (Hexagonal / Ports & Adapters)
- **Version:** 0.3.0
- **License:** MIT

---

## Quick Reference

### Tech Stack Summary

| Category           | Technology                        |
| ------------------ | --------------------------------- |
| **Language**       | TypeScript 5.9.3                  |
| **Runtime**        | Node.js >= 20.0.0                 |
| **CLI Framework**  | Commander 14.0.2                  |
| **AI Integration** | Ollama 0.6.3 (qwen2.5-coder:1.5b) |
| **Build Tool**     | tsup (esbuild)                    |
| **Test Framework** | Vitest 4.0.14                     |
| **UI**             | @clack/prompts, ora               |

### Entry Points

- **CLI Executable:** `dist/index.js`
- **Source Entry:** `src/index.ts`
- **Composition Root:** `src/main.ts`

### Architecture Pattern

**Clean Architecture** with clear separation:

- **Core** (`src/core/`) - Domain logic, ports (interfaces), types
- **Features** (`src/features/`) - Use cases and controllers
- **Infrastructure** (`src/infrastructure/`) - Adapters (Ollama, Git, Editor)
- **UI** (`src/ui/`) - Terminal interface components

**Dependency Flow:** UI → Features → Core ← Infrastructure

---

## Generated Documentation

### Primary Documents

1. **[Project Overview](./project-overview.md)** - High-level project summary
   - Purpose and features
   - Quick reference
   - Getting started
   - System requirements

2. **[Architecture](./architecture.md)** - Comprehensive architecture documentation
   - Clean Architecture layers
   - Technology stack details
   - Core components breakdown
   - Data flow diagrams
   - Testing strategy
   - Error handling
   - Security considerations

3. **[Source Tree Analysis](./source-tree-analysis.md)** - Annotated directory structure
   - Complete file tree with descriptions
   - Critical directories explained
   - Module boundaries
   - Integration points
   - File naming conventions

4. **[Development Guide](./development-guide.md)** - Developer handbook
   - Environment setup
   - Development workflow
   - Testing procedures
   - Code quality standards
   - Git workflow
   - Debugging tips
   - Release process

---

## Existing Documentation

### User-Facing Documentation

- **[README.md](../README.md)** - User documentation and quick start guide
  - Features overview
  - Installation instructions
  - Usage examples
  - System requirements

- **[CHANGELOG.md](../CHANGELOG.md)** - Release history and version changes
  - Version 0.3.0 features
  - Breaking changes
  - Bug fixes

---

## Project Structure

```
devai-cli/
├── src/
│   ├── core/              # Domain layer (business logic)
│   │   ├── ports/         # Interfaces for dependencies
│   │   └── types/         # Domain entities and value objects
│   ├── features/          # Application layer (use cases)
│   │   ├── commit/        # Commit message generation feature
│   │   └── setup/         # One-time setup feature
│   ├── infrastructure/    # Infrastructure layer (adapters)
│   │   ├── adapters/      # Ollama, Git, Editor implementations
│   │   ├── config/        # Model configuration
│   │   └── logging/       # Debug loggers
│   ├── ui/                # Presentation layer (terminal UI)
│   │   ├── adapters/      # UI port implementations
│   │   ├── commit/        # Commit workflow UI components
│   │   └── setup/         # Setup wizard UI
│   ├── index.ts           # CLI entry point (executable)
│   └── main.ts            # Composition root (DI)
├── tests/
│   ├── integration/       # Ollama integration tests
│   ├── e2e/               # End-to-end workflow tests
│   └── helpers/           # Test utilities (mocks, harnesses)
├── scripts/               # Development scripts
├── dev/                   # Generated documentation (this folder)
└── dist/                  # Build output (bundled executable)
```

---

## Getting Started

### For Users

1. **Install:**

   ```bash
   npm install devai-cli
   ```

2. **Setup (one-time):**

   ```bash
   devai-cli setup
   ```

3. **Use:**
   ```bash
   git add <files>
   devai-cli commit
   ```

See [README.md](../README.md) for complete user guide.

### For Developers

1. **Clone and setup:**

   ```bash
   git clone https://github.com/josephmanghan/devai-cli.git
   cd devai-cli
   npm install
   ```

2. **Run in dev mode:**

   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm run test
   ```

See [Development Guide](./development-guide.md) for complete developer workflow.

---

## Key Features

### 1. Privacy-First Design

- ✅ **100% Local Processing** - No cloud APIs, no data exfiltration
- ✅ **No Telemetry** - Zero analytics or tracking
- ✅ **No API Keys Required** - Works entirely with local Ollama

### 2. Conventional Commits

- Generates standardized commit messages
- Enforces type prefix (feat, fix, docs, etc.)
- Format validation with automatic retries
- Smart context from git diff

### 3. Developer Experience

- Lightning fast (<1s with adequate VRAM)
- Interactive terminal UI (@clack/prompts)
- One-time setup
- Edit, regenerate, or approve workflows
- Auto-staging option (`-a` flag)

### 4. Clean Architecture

- Testable: 80% code coverage
- Maintainable: Clear separation of concerns
- Extensible: Easy to add new LLM providers
- Type-safe: Full TypeScript with strict mode

---

## Testing

### Test Distribution

- **21 unit tests** - Co-located with source (`src/**/*.test.ts`)
- **2 integration tests** - Real Ollama integration (`tests/integration/`)
- **2 e2e tests** - Full workflow simulation (`tests/e2e/`)
- **Test helpers** - Mock LLM provider, Git harness, performance tracker

### Coverage Requirements

**Target:** 80% for lines, functions, branches, statements

### Running Tests

```bash
npm run test              # All tests
npm run test:unit         # Unit tests only (fast)
npm run test:integration  # Integration tests (requires Ollama)
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Generate coverage report
```

---

## Development Workflow

### Common Commands

```bash
# Development
npm run dev               # Run in dev mode with tsx
npm run build             # Build production bundle

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier
npm run typecheck         # TypeScript type checking

# Pre-Commit
npm run pr                # Full validation (format, lint, typecheck, test, build)
npm run pr:lite           # Fast validation (unit tests only)
```

---

## Architecture Highlights

### Clean Architecture Layers

1. **Core** - Pure business logic, zero dependencies
   - Ports (interfaces)
   - Types (domain entities)
   - Error hierarchy

2. **Features** - Application use cases
   - `commit/` - Commit message generation
   - `setup/` - One-time Ollama setup

3. **Infrastructure** - External integrations
   - `OllamaAdapter` - LLM integration
   - `ShellGitAdapter` - Git CLI wrapper
   - `ShellEditorAdapter` - $EDITOR invocation

4. **UI** - Terminal interface
   - Interactive prompts
   - Progress indicators
   - Message formatting

### Key Design Patterns

- **Dependency Inversion** - Core defines interfaces, infrastructure implements
- **Composition Root** - `main.ts` wires all dependencies
- **Ports & Adapters** - Swappable external integrations
- **Use Case Pattern** - Single-purpose business operations

---

## System Requirements

| Requirement | Specification               |
| ----------- | --------------------------- |
| **Node.js** | >= 20.0.0                   |
| **Ollama**  | Latest version              |
| **Model**   | qwen2.5-coder:1.5b (~900MB) |
| **VRAM**    | ~2GB                        |
| **Git**     | Any recent version          |

---

## Links

### Repository & Package

- **GitHub:** https://github.com/josephmanghan/devai-cli
- **npm:** https://www.npmjs.com/package/devai-cli

### External Documentation

- **Ollama:** https://ollama.com
- **Conventional Commits:** https://conventionalcommits.org
- **Commander.js:** https://github.com/tj/commander.js
- **@clack/prompts:** https://github.com/natemoo-re/clack

---

## Next Steps

### For New Users

1. Read [README.md](../README.md) for installation and usage
2. Run `devai-cli setup` for one-time configuration
3. Try generating a commit: `devai-cli commit`

### For New Contributors

1. Read [Development Guide](./development-guide.md) for setup
2. Review [Architecture](./architecture.md) for design patterns
3. Check [Source Tree Analysis](./source-tree-analysis.md) for codebase structure
4. Run tests: `npm run test`
5. Make changes and submit PR

### For Brownfield PRD Creation

When planning new features for this project:

1. **Reference this index** as the main entry point for AI-assisted development
2. **Architecture documentation** contains detailed technical context
3. **Source tree analysis** shows exact file locations and responsibilities
4. **Development guide** provides workflow and testing procedures

**Command to use in PRD workflow:**

```
Point PRD workflow to: /path/to/dev/index.md
```

---

## Documentation Metadata

- **Generated:** 2025-12-02
- **Scan Type:** Exhaustive
- **Workflow Version:** 1.2.0
- **Project Version:** 0.3.0
- **Total Files Documented:** ~70 TypeScript files
- **Documentation Files:** 5 (overview, architecture, source tree, development guide, index)

---

## Document Version History

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.0     | 2025-12-02 | Initial documentation generation (exhaustive scan) |

---

**🎯 This index is the primary entry point for AI-assisted development**

For feature planning, bug fixes, or refactoring, start here and navigate to specific documents as needed.

---

**License:** MIT
**Author:** Dr Joe (Joseph Manghan)
