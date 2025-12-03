# Project Documentation Index - devai-cli

## Project Overview

- **Type:** CLI Tool
- **Primary Language:** TypeScript/Node.js
- **Architecture:** Clean Architecture (Hexagonal)
- **Repository Type:** Monolith with 1 parts

## Quick Reference

- **Tech Stack:** TypeScript, Node.js, Commander.js, Ollama, Vitest
- **Entry Point:** `src/index.ts` → CLI executable
- **Architecture Pattern:** Clean Architecture with dependency inversion
- **AI Model:** qwen2.5-coder:1.5b via local Ollama instance

## Generated Documentation

- [Project Overview](./project-overview.md) - Executive summary and project status
- [Architecture](./architecture.md) - Clean Architecture implementation and design patterns
- [Source Tree Analysis](./source-tree-analysis.md) - Complete annotated directory structure
- [Development Guide](./development-guide.md) - Setup, build, and development workflows
- [Component Inventory](./component-inventory.md) _(To be generated)_
- [API Contracts](./api-contracts.md) _(To be generated)_
- [Data Models](./data-models.md) _(To be generated)_
- [Integration Architecture](./integration-architecture.md) _(To be generated)_

## Existing Documentation

- [README.md](../README.md) - User-facing documentation with features and quick start
- [CHANGELOG.md](../CHANGELOG.md) - Version history and release notes

## Getting Started

### For Users

1. **Install**: `npm install devai-cli`
2. **Setup**: `ollama serve && devai-cli setup`
3. **Use**: `git add <files> && devai-cli commit`

### For Developers

1. **Clone**: Repository from GitHub
2. **Setup**: `npm install && npm run validate:setup`
3. **Develop**: `npm run dev` for development mode
4. **Test**: `npm run test` for comprehensive testing
5. **Build**: `npm run build` for production build

### Development Commands

- **Development**: `npm run dev` (hot reload)
- **Testing**: `npm run test` (all tests), `npm run test:coverage` (with coverage)
- **Code Quality**: `npm run lint`, `npm run format`
- **Build**: `npm run build` (production), `npm run pr` (full validation)

### Key Requirements

- **Node.js**: v20+ required
- **Ollama**: Local instance with qwen2.5-coder:1.5b model
- **VRAM**: ~2GB for AI model loading
- **Privacy**: 100% local processing, no external APIs

## Architecture Highlights

### Clean Architecture Implementation

- **Core Layer**: Business logic and port interfaces
- **Application Layer**: Use cases and controllers
- **Infrastructure Layer**: External system adapters (Git, Ollama, Editor)
- **UI Layer**: CLI components and user interaction

### Key Components

- **Commit Generation**: AI-powered conventional commit creation
- **Setup Management**: Ollama configuration and model provisioning
- **Git Integration**: Shell-based git operations
- **Error Handling**: Comprehensive error recovery with user guidance

### Testing Strategy

- **Unit Tests**: 70+ tests for individual components
- **Integration Tests**: System component interactions
- **E2E Tests**: Complete user workflows
- **Coverage**: 80% minimum across all modules
- **Mock Adapters**: Isolated testing with predictable behavior

## Project Status

**Version**: 0.4.0 (Stable, Production-Ready)
**License**: MIT
**Maintainer**: Dr Joe (Joseph Manghan)
**Repository**: https://github.com/josephmanghan/devai-cli

## Core Commands

### `devai-cli setup`

- Configures Ollama integration
- Provisions custom AI model
- Validates system requirements

### `devai-cli commit`

- Analyzes staged git changes
- Generates conventional commit message
- Provides review and editing options

### `devai-cli commit --all`

- Automatically stages all changes
- Generates commit message
- Creates the commit

## AI Model Configuration

**Model**: `devai-cli-commit:latest` (custom provisioned)
**Base Model**: `qwen2.5-coder:1.5b`
**Temperature**: 0.2 (consistent responses)
**Context Window**: 131,072 tokens
**Processing**: Local only (privacy-first)

## Integration Points

### Ollama Integration

- **Protocol**: HTTP REST API
- **Endpoint**: http://localhost:11434
- **Model**: Automatic provisioning and management

### Git Integration

- **Protocol**: Shell commands via execa
- **Operations**: Status, diff, commit, log
- **Repository**: Current working directory

### Editor Integration

- **Protocol**: System default editor
- **Workflow**: Temporary file creation and cleanup

## Development Workflow

### Feature Development

1. Define ports in `src/core/ports/`
2. Implement adapters in `src/infrastructure/adapters/`
3. Create use cases in `src/features/[feature]/use-cases/`
4. Add controllers in `src/features/[feature]/controllers/`
5. Write comprehensive tests
6. Update documentation

### Quality Gates

- **Type Safety**: TypeScript strict mode
- **Code Quality**: ESLint + Prettier validation
- **Test Coverage**: 80% minimum requirement
- **Build Success**: Production build verification

## Performance Characteristics

### Response Times

- **Commit Generation**: <2s for typical repositories
- **Model Loading**: ~5s initial, cached afterward
- **UI Interactions**: <100ms response times

### Memory Usage

- **AI Model**: ~2GB VRAM for qwen2.5-coder:1.5b
- **Application**: ~50MB Node.js process
- **Git Processing**: Streaming for large diffs

## Security and Privacy

### Privacy Protection

- ✅ 100% local processing
- ✅ No external API calls
- ✅ No data transmission
- ✅ No usage telemetry

### Security Measures

- ✅ Input validation and sanitization
- ✅ Shell injection prevention
- ✅ File system access limitation
- ✅ Error information filtering

This documentation serves as the primary reference for understanding, developing, and extending the devai-cli codebase. For AI-assisted development, start with the [Architecture](./architecture.md) and [Development Guide](./development-guide.md) for comprehensive implementation details.
