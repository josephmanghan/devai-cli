# Architecture Documentation - devai-cli

## Executive Summary

**devai-cli** is a TypeScript-based command-line interface that generates conventional git commit messages using local AI models. The application follows Clean Architecture principles with a hexagonal port/adapter pattern, ensuring complete separation of concerns and testability.

**Key Characteristics:**

- **Local-First**: All AI processing happens locally via Ollama
- **Privacy-Preserving**: No external API calls or data transmission
- **Clean Architecture**: Hexagonal design with dependency inversion
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Testable**: Comprehensive test coverage (80%+) with mock adapters

## Technology Stack

### Core Technologies

- **Language**: TypeScript 5.9.3+ (ES2022 modules)
- **Runtime**: Node.js 20.0.0+
- **Build System**: tsup (TypeScript bundler)
- **Package Manager**: npm

### Frameworks and Libraries

- **CLI Framework**: Commander.js 14.0.2
- **AI Integration**: Ollama.js 0.6.3
- **UI Components**: @clack/prompts 0.11.0
- **Process Execution**: execa 9.6.1
- **Spinner/UI**: ora 9.0.0
- **Debug Logging**: debug 4.4.3

### Development Toolchain

- **Testing**: Vitest 4.0.14 with v8 coverage
- **Linting**: ESLint 9.39.1 with TypeScript support
- **Formatting**: Prettier 3.0.0 with import sorting
- **Type Checking**: TypeScript strict mode

## Architecture Pattern

### Hexagonal (Ports & Adapters) Architecture

The application implements Clean Architecture with a hexagonal pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Commander   │  │ @clack/prompts│ │ Ora Spinner │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Controllers │  │ Use Cases   │  │ UI Adapters │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Core Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Ports     │  │    Types    │  │   Domain    │       │
│  │ (Interfaces)│  │             │  │   Logic     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Git Adapter │  │ Ollama      │  │ Editor      │       │
│  │             │  │ Adapter     │  │ Adapter     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**CLI Interface Layer:**

- Command parsing and routing
- User interaction and prompts
- Progress indication and feedback

**Application Layer:**

- Command controllers and orchestration
- UI adapters for CLI components
- Use case coordination

**Core Layer:**

- Business logic and domain models
- Port interfaces (external contracts)
- Type definitions and error handling

**Infrastructure Layer:**

- External system integrations
- Shell command adapters
- Configuration and logging

## Component Architecture

### Core Domain Model

#### Types and Interfaces

```typescript
// Core domain types
interface CommitMessage {
  type: string;
  description: string;
  body?: string;
}

interface GitDiff {
  files: FileChange[];
  summary: string;
}

interface OllamaResponse {
  message: string;
  model: string;
  done: boolean;
}
```

#### Ports (External Interfaces)

```typescript
// Git operations port
interface GitPort {
  getStagedChanges(): Promise<GitDiff>;
  commit(message: string): Promise<void>;
  validateRepository(): Promise<boolean>;
}

// LLM integration port
interface LLMPort {
  generateCommit(diff: GitDiff, type: string): Promise<string>;
  validateConnection(): Promise<boolean>;
}

// User interface port
interface CommitUIPort {
  selectCommitType(): Promise<string>;
  previewMessage(message: string): Promise<boolean>;
  editMessage(message: string): Promise<string>;
}
```

### Feature Architecture

#### Commit Generation Feature

```
CommitController
├── ValidatePreconditions (GitRepo + Ollama Connection)
├── GenerateCommit (AI + Conventional Commits)
├── FormatValidator (Commit Format Rules)
├── MessageNormalizer (Standardization)
└── TypeEnforcer (Conventional Types)
```

#### Setup Feature

```
SetupController
├── ValidateOllamaConnection (Connectivity Test)
├── EnsureBaseModel (Model Availability)
├── ProvisionCustomModel (Custom Model Creation)
└── ConsoleSetupRenderer (Setup UI)
```

### Adapter Implementations

#### Git Adapter

- **Technology**: Shell commands via execa
- **Operations**: git diff, git status, git commit, git log
- **Error Handling**: Git error parsing and user-friendly messages

#### Ollama Adapter

- **Technology**: Ollama.js library
- **Models**: qwen2.5-coder:1.5b with custom system prompt
- **Configuration**: Temperature 0.2, 131K context window
- **Error Recovery**: Retry logic and fallback strategies

#### Editor Adapter

- **Technology**: Shell editor commands
- **Editors**: Support for system default editor
- **Integration**: Temporary file creation and cleanup

## Data Architecture

### Data Flow Patterns

#### Commit Generation Flow

```
1. CLI Command → Controller
2. Controller → ValidatePreconditions (Git + Ollama)
3. UI → SelectCommitType (User Input)
4. Controller → GenerateCommit (AI Processing)
5. UI → PreviewMessage (User Review)
6. Controller → GitAdapter.commit (Git Operation)
7. UI → Success Feedback
```

#### Setup Flow

```
1. CLI Command → SetupController
2. ValidateOllamaConnection (Connection Test)
3. EnsureBaseModel (Model Check)
4. ProvisionCustomModel (Model Creation)
5. ConsoleSetupRenderer (Progress Feedback)
6. Configuration Validation
```

### Configuration Management

#### Model Configuration

```typescript
const CONVENTIONAL_COMMIT_MODEL_CONFIG = {
  model: 'devai-cli-commit:latest',
  baseModel: 'qwen2.5-coder:1.5b',
  systemPrompt: 'You are a Conventional Commits expert...',
  temperature: 0.2,
  num_ctx: 131072,
  keep_alive: 0,
};
```

#### Error Handling Strategy

```typescript
// Custom error hierarchy
AppError
├── GitError (Repository issues)
├── OllamaError (AI service issues)
├── ValidationError (Input validation)
└── ConfigurationError (Setup issues)
```

## Integration Architecture

### External System Integrations

#### Ollama Integration

- **Protocol**: HTTP REST API
- **Endpoint**: http://localhost:11434
- **Authentication**: None (local instance)
- **Model Management**: Automatic provisioning and validation

#### Git Integration

- **Protocol**: Shell commands
- **Operations**: Status, diff, commit, log
- **Repository Access**: Current working directory
- **Error Handling**: Git exit code parsing

#### Editor Integration

- **Protocol**: Shell environment variables
- **Editors**: $EDITOR environment variable
- **Workflow**: Temporary file creation → Editor launch → File read → Cleanup

### Security Architecture

#### Privacy Protection

- **Local Processing**: All AI processing happens locally
- **No External APIs**: No network calls to external services
- **Data Persistence**: No user data stored or transmitted

#### Command Security

- **Input Validation**: Strict parameter validation
- **Shell Injection Prevention**: Parameterized shell commands
- **File System Access**: Limited to current repository

## Development Architecture

### Testing Architecture

```
Testing Pyramid
┌─────────────────────────────────────────┐
│              E2E Tests                   │
│     (3 tests - complete workflows)       │
├─────────────────────────────────────────┤
│          Integration Tests               │
│     (1 test - setup validation)          │
├─────────────────────────────────────────┤
│              Unit Tests                  │
│    (70+ tests - individual components)   │
└─────────────────────────────────────────┘
```

### Test Infrastructure

- **Mock Adapters**: Isolated testing with predictable behavior
- **Git Harness**: Temporary Git repositories for testing
- **Performance Tracking**: Test execution time monitoring
- **Coverage Requirements**: 80% minimum coverage

### Build Architecture

```
Build Pipeline
Source (TypeScript) → tsup → Bundle (ESM) → Executable
     │                      │                │
Type Checking         Minification      Node.js Shebang
   ↓                        ↓                ↓
Error Prevention      Size Reduction     CLI Ready
```

## Deployment Architecture

### Distribution Model

- **Package**: npm package (`devai-cli`)
- **Installation**: `npm install devai-cli`
- **Binary**: Generated JavaScript executable
- **Dependencies**: Runtime dependencies included

### Runtime Requirements

- **Node.js**: v20+ (ES2022 module support)
- **Ollama**: Local instance with compatible model
- **VRAM**: ~2GB for AI model loading
- **Operating System**: Cross-platform (macOS, Linux, Windows)

## Performance Architecture

### AI Model Optimization

- **Model Selection**: qwen2.5-coder:1.5b optimized for code analysis
- **Context Management**: Efficient git diff processing
- **Memory Management**: Proper model lifecycle management
- **Response Time**: Target <2s for typical commits

### Git Operation Optimization

- **Diff Processing**: Streaming for large repositories
- **Caching**: Smart caching of git operations
- **Error Recovery**: Graceful handling of git repository issues

### CLI Performance

- **Startup Time**: Fast module loading with ES modules
- **Memory Usage**: Efficient memory management
- **User Feedback**: Progress indicators for long operations

## Quality Assurance Architecture

### Code Quality Metrics

- **Test Coverage**: 80%+ across all layers
- **TypeScript Strictness**: Full strict mode enabled
- **Lint Rules**: Comprehensive ESLint configuration
- **Code Complexity**: Maximum 10 per function

### Continuous Integration

- **Automated Testing**: Unit, integration, and E2E tests
- **Code Quality**: Linting and formatting checks
- **Type Safety**: TypeScript compilation validation
- **Build Verification**: Production build testing

This architecture ensures maintainability, testability, and reliability while providing a fast, private, and user-friendly CLI experience for AI-powered commit message generation.
