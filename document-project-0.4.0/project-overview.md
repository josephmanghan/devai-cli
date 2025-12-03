# Project Overview - devai-cli

## Project Name and Purpose

**devai-cli** is an AI-powered git commit message generator that operates completely locally using Ollama. It generates conventional commit messages by analyzing staged git changes and processes them through a local AI model, ensuring complete privacy and fast response times.

## Executive Summary

devai-cli solves the common developer challenge of writing meaningful, standardized commit messages. By leveraging local AI processing, it eliminates the privacy concerns of cloud-based alternatives while providing the convenience of automated commit message generation. The tool enforces conventional commit standards, supports Git workflow best practices, and maintains complete local data sovereignty.

### Key Value Propositions

- **Privacy-First**: 100% local processing - your code never leaves your machine
- **Lightning Fast**: Sub-1s response time with adequate VRAM
- **Frictionless Setup**: Quick one-time setup with automatic model provisioning
- **Standards Compliant**: Generates messages following conventional commit format
- **Smart Validation**: Built-in format validation with automatic retry logic

## Tech Stack Summary

| Category           | Technology        | Version        | Purpose                                    |
| ------------------ | ----------------- | -------------- | ------------------------------------------ |
| **Language**       | TypeScript        | 5.9.3+         | Type-safe development with strict checking |
| **Runtime**        | Node.js           | 20.0.0+        | JavaScript runtime with ES2022 support     |
| **CLI Framework**  | Commander.js      | 14.0.2         | Command-line interface parsing and routing |
| **AI Integration** | Ollama.js         | 0.6.3          | Local AI model communication               |
| **UI Components**  | @clack/prompts    | 0.11.0         | Interactive CLI user interface             |
| **Build Tool**     | tsup              | Latest         | TypeScript bundling and compilation        |
| **Testing**        | Vitest            | 4.0.14         | Unit, integration, and E2E testing         |
| **Code Quality**   | ESLint + Prettier | 9.39.1 + 3.0.0 | Linting, formatting, and code standards    |

## Architecture Type Classification

### **Architecture Pattern**: Clean Architecture (Hexagonal)

- **Layer Separation**: CLI → Application → Core → Infrastructure
- **Dependency Inversion**: Core layer defines interfaces, infrastructure implements
- **Testability**: Mockable adapters for all external dependencies
- **Maintainability**: Clear separation of concerns and single responsibility

### **Repository Structure**: Monolith

- **Type**: Single cohesive codebase
- **Organization**: Feature-based directory structure
- **Modularity**: Internal separation through architectural layers

### **Application Type**: CLI Tool

- **Interface**: Command-line with interactive prompts
- **Deployment**: npm package distribution
- **Runtime**: Node.js executable with shebang

## Repository Structure

```
devai-cli/
├── src/                           # Main source code
│   ├── main.ts                    # CLI composition root
│   ├── index.ts                   # Executable entry point
│   ├── core/                      # Core business logic
│   │   ├── ports/                 # External interfaces
│   │   └── types/                 # Domain types
│   ├── features/                  # Feature modules
│   │   ├── commit/                # Commit generation
│   │   └── setup/                 # Initial setup
│   ├── infrastructure/            # External integrations
│   │   ├── adapters/              # Port implementations
│   │   ├── config/                # Configuration
│   │   └── logging/               # Debug utilities
│   └── ui/                        # User interface
│       ├── adapters/              # UI implementations
│       ├── commit/                # Commit UI components
│       └── setup/                 # Setup UI components
├── tests/                         # Test suites
│   ├── e2e/                       # End-to-end tests
│   ├── integration/               # Integration tests
│   └── helpers/                   # Test utilities
├── dist/                          # Build output
├── project-docs/                  # Project documentation
└── dev/                           # Generated analysis and docs
```

## Current Status

### **Version**: 0.4.0 (Stable)

- **Release Date**: December 3, 2025
- **Development Stage**: Production-ready with comprehensive testing
- **Installation**: `npm install devai-cli`

### **Core Features Implemented**

- ✅ **Setup Command**: Automatic Ollama configuration and model provisioning
- ✅ **Commit Command**: AI-powered conventional commit generation
- ✅ **Validation**: Built-in commit message format validation
- ✅ **Error Handling**: Comprehensive error recovery and user guidance
- ✅ **Performance**: Sub-second response times with efficient processing
- ✅ **Privacy**: Complete local data processing

### **Quality Metrics**

- **Test Coverage**: 80%+ across all modules
- **Type Safety**: 100% TypeScript with strict mode
- **Code Quality**: Comprehensive linting and formatting
- **Documentation**: Complete architectural and user documentation

## Quick Reference

### Installation Commands

```bash
# Install from npm
npm install devai-cli

# Install and configure Ollama
ollama serve
devai-cli setup

# Generate commit message
git add <files>
devai-cli commit
```

### Available Commands

- `devai-cli setup` - Configure Ollama and provision AI model
- `devai-cli commit` - Generate and create conventional commit
- `devai-cli commit --all` - Stage all changes and generate commit
- `devai-cli --version` - Show version information
- `devai-cli --help` - Display usage information

### Configuration Requirements

- **Node.js**: v20+ required
- **Ollama**: Local instance with qwen2.5-coder:1.5b model
- **VRAM**: ~2GB for AI model loading
- **Git Repository**: Valid git repository with staged changes

## Development Status

### **Active Development**: ✅ Yes

- **Maintainer**: Dr Joe (Joseph Manghan)
- **License**: MIT
- **Repository**: https://github.com/josephmanghan/devai-cli
- **Issues**: Accepting bug reports and feature requests

### **Recent Releases**

- **0.4.0** (Dec 3, 2025): Added spinner UI and post-install notifications
- **0.3.0** (Dec 2, 2025): Updated documentation and help system
- **0.2.0** (Dec 2, 2025): Fixed help documentation and Commander.js error handling
- **0.1.0** (Dec 2, 2025): Initial release with core functionality

### **Next Development Priorities**

- Performance optimization for large repositories
- Additional AI model support
- Custom commit type configuration
- Integration with popular Git workflows

## Getting Started

### For Users

1. **Install**: `npm install devai-cli`
2. **Setup**: `ollama serve && devai-cli setup`
3. **Use**: `git add . && devai-cli commit`

### For Developers

1. **Clone**: `git clone https://github.com/josephmanghan/devai-cli`
2. **Setup**: `npm install && npm run validate:setup`
3. **Develop**: `npm run dev` for development mode
4. **Test**: `npm run test` for comprehensive testing
5. **Build**: `npm run build` for production build

### For Contributors

- **Code Style**: Automatic formatting with Prettier
- **Testing**: 80% coverage requirement for new features
- **Documentation**: Update relevant documentation files
- **Pull Requests**: Use `npm run pr` for pre-commit validation

This project represents a modern, well-architected CLI tool that prioritizes user privacy, performance, and developer experience while maintaining high standards for code quality and maintainability.
