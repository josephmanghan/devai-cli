# Source Tree Analysis - devai-cli

## Project Overview

**Project:** devai-cli - AI-powered git commit message generator
**Architecture:** Clean Architecture (Ports & Adapters)
**Type:** CLI Tool (TypeScript/Node.js)
**Entry Point:** `src/index.ts` → `src/main.ts`

## Directory Structure

```
project-root/
├── src/                              # Main source code (Clean Architecture)
│   ├── main.ts                       # Application composition root and CLI setup
│   ├── index.ts                      # Executable entry point with shebang
│   ├── core/                         # Core business logic and ports
│   │   ├── index.ts                  # Core exports
│   │   ├── ports/                    # Interface definitions (Hexagon)
│   │   │   ├── index.ts              # Port exports
│   │   │   ├── commit-ui-port.ts     # UI interface for commit operations
│   │   │   ├── editor-port.ts        # External editor interface
│   │   │   ├── git-port.ts           # Git operations interface
│   │   │   ├── llm-port.ts           # LLM/AI interface
│   │   │   └── setup-ui-port.ts      # Setup UI interface
│   │   └── types/                    # Type definitions and domain models
│   │       ├── index.ts              # Type exports
│   │       ├── commit.types.ts       # Commit-related types
│   │       ├── errors.types.ts       # Error handling types
│   │       ├── git-types.ts          # Git operation types
│   │       ├── llm-types.ts          # LLM interaction types
│   │       ├── prompt.types.ts       # Prompt building types
│   │       └── setup.types.ts        # Setup configuration types
│   ├── features/                     # Use cases organized by domain
│   │   ├── commit/                   # Commit generation functionality
│   │   │   ├── controllers/          # Feature controllers (CLI command handlers)
│   │   │   │   ├── commit-controller.ts    # Main commit command logic
│   │   │   │   └── commit-controller.test.ts
│   │   │   ├── use-cases/            # Business logic use cases
│   │   │   │   ├── generate-commit.ts      # Generate commit message
│   │   │   │   ├── validate-preconditions.ts # Validate git state
│   │   │   │   └── [tests]           # Unit tests for use cases
│   │   │   └── utils/                # Commit-specific utilities
│   │   │       ├── format-validator.ts     # Conventional commit validation
│   │   │       ├── message-normalizer.ts   # Message formatting
│   │   │       ├── prompt-builder.ts       # AI prompt construction
│   │   │       └── type-enforcer.ts        # Commit type enforcement
│   │   └── setup/                    # Initial setup functionality
│   │       ├── controllers/          # Setup command handlers
│   │       │   └── setup-controller.ts
│   │       └── use-cases/            # Setup business logic
│   │           ├── ensure-base-model.ts    # Verify base model availability
│   │           ├── provision-custom-model.ts # Create custom model
│   │           └── validate-ollama-connection.ts # Test Ollama connectivity
│   ├── infrastructure/               # External system adapters
│   │   ├── adapters/                 # Implementation of ports
│   │   │   ├── editor/               # External editor integration
│   │   │   │   └── shell-editor-adapter.ts # Shell command editor interface
│   │   │   ├── git/                  # Git operations adapter
│   │   │   │   └── shell-git-adapter.ts   # Shell command git interface
│   │   │   └── ollama/               # Ollama AI adapter
│   │   │       └── ollama-adapter.ts      # Ollama API client
│   │   ├── config/                   # Configuration management
│   │   │   └── conventional-commit-model.config.ts # AI model configuration
│   │   └── logging/                  # Debug logging setup
│   │       └── debug-loggers.ts      # Debug logger configuration
│   └── ui/                           # User interface adapters
│       ├── adapters/                 # UI implementation
│       │   └── commit-adapter.ts     # CLI commit UI implementation
│       ├── commit/                   # Commit UI components
│       │   └── components/           # Reusable UI components
│       │       ├── action-selector/  # Commit action selection UI
│       │       ├── message-preview/  # Message preview UI
│       │       └── type-selector/    # Commit type selection UI
│       └── setup/                    # Setup UI components
│           └── console-setup-renderer.ts # Console-based setup UI
├── tests/                            # Integration and E2E tests
│   ├── e2e/                          # End-to-end test scenarios
│   │   ├── commit-happy-path.test.ts # Full workflow tests
│   │   └── commit-error-paths.test.ts # Error handling tests
│   ├── integration/                  # Integration tests
│   │   └── setup-auto-pull.test.ts   # Setup integration tests
│   └── helpers/                      # Test utilities and mocks
│       ├── git-harness.ts            # Git test environment setup
│       ├── mock-commit-ui.ts         # UI component mocks
│       ├── mock-llm-provider.ts      # LLM service mocks
│       └── performance-tracker.ts    # Test performance monitoring
├── scripts/                          # Build and utility scripts
├── dist/                             # Build output (generated)
├── project-docs/                     # Project documentation (empty)
└── dev/                              # Generated documentation and analysis
```

## Critical Components Analysis

### **Entry Points**

- `src/index.ts` - Shebang-enabled executable entry point
- `src/main.ts` - Composition root with dependency injection setup

### **Core Architecture Layer**

- **Ports (`src/core/ports/`)**: Define interfaces for external dependencies
- **Types (`src/core/types/`)**: Domain models and business logic types
- Follows Hexagonal Architecture pattern for clean separation

### **Feature Organization**

- **Commit Feature**: Complete commit generation workflow
- **Setup Feature**: Ollama configuration and model provisioning
- Each feature follows: Controller → Use Cases → Utils structure

### **Infrastructure Layer**

- **Git Adapter**: Shell-based git operations
- **Ollama Adapter**: AI model communication
- **Editor Adapter**: External editor integration
- **Configuration**: AI model settings and parameters

### **Testing Strategy**

- **Unit Tests**: Alongside source files (`.test.ts`)
- **Integration Tests**: Real system integration
- **E2E Tests**: Complete user workflows
- **Test Helpers**: Mocks and utilities for testing

### **Build & Quality Tools**

- **Build**: tsup for TypeScript bundling
- **Testing**: Vitest with 80% coverage requirements
- **Linting**: ESLint with strict TypeScript rules
- **Formatting**: Prettier with import sorting

## Integration Points

### **CLI Command Flow**

```
CLI Input → Commander.js → Feature Controller → Use Cases → Adapters → External Systems
```

### **Data Flow**

1. **Setup**: CLI → SetupController → OllamaAdapter → Ollama API
2. **Commit**: CLI → CommitController → GitAdapter + OllamaAdapter → Git + AI

### **External Dependencies**

- **Ollama**: Local AI model server
- **Git**: Version control system (shell commands)
- **Editor**: System default editor (shell commands)

## Architecture Quality Indicators

✅ **Clean Architecture**: Proper layer separation and dependency inversion
✅ **Test Coverage**: Comprehensive unit, integration, and E2E tests
✅ **Error Handling**: Custom error types with remediation guidance
✅ **Configuration**: Environment-based with type safety
✅ **Build Pipeline**: Modern TypeScript tooling with strict linting
✅ **Documentation**: Well-structured code with JSDoc comments
