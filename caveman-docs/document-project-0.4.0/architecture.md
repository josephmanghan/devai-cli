# architecture documentation - devai-cli

## executive summary

devai-cli typescript-based command-line interface generates conventional git commit messages using local ai models. application follows clean architecture principles hexagonal port/adapter pattern ensuring complete separation concerns testability.

key characteristics

- local-first ai processing happens locally via ollama
- privacy-preserving external api calls data transmission
- clean architecture hexagonal design dependency inversion
- type-safe full typescript implementation strict type checking
- testable comprehensive test coverage 80 mock adapters

## technology stack

### core technologies

- language typescript 5.9.3 es2022 modules
- runtime node.js 20.0.0
- build system tsup typescript bundler
- package manager npm

### frameworks libraries

- cli framework commander.js 14.0.2
- ai integration ollama.js 0.6.3
- ui components clack/prompts 0.11.0
- process execution execa 9.6.1
- spinner/ui ora 9.0.0
- debug logging debug 4.4.3

### development toolchain

- testing vitest 4.0.14 v8 coverage
- linting eslint 9.39.1 typescript support
- formatting prettier 3.0.0 import sorting
- type checking typescript strict mode

## architecture pattern

### hexagonal ports adapters architecture

application implements clean architecture hexagonal pattern```
│ CLI Interface Layer │ │ │ │ │ Commander │ │ @clack/prompts│ │ Ora Spinner │ │ │ │ │ │ Application Layer │ │ │ │ │ Controllers │ │ Use Cases │ │ UI Adapters │ │ │ │ │ │ Core Layer │ │ │ │ │ Ports │ │ Types │ │ Domain │ │ │ │ (Interfaces)│ │ │ │ Logic │ │ │ │ │ │ Infrastructure Layer │ │ │ │ │ Git Adapter │ │ Ollama │ │ Editor │ │ │ │ │ │ Adapter │ │ Adapter │ │ │ │

````### layer responsibilities

 cli interface layer

 - command parsing routing
 - user interaction prompts
 - progress indication feedback

 application layer

 - command controllers orchestration
 - ui adapters cli components
 - use case coordination

 core layer

 - business logic domain models
 - port interfaces external contracts
 - type definitions error handling

 infrastructure layer

 - external system integrations
 - shell command adapters
 - configuration logging

 ## component architecture

 ### core domain model

 #### types interfaces```typescript
 interface CommitMessage { type: string; description: string; body?: string; } interface GitDiff { files: FileChange[]; summary: string; } interface OllamaResponse { message: string; model: string; done: boolean; }
```#### ports external interfaces```typescript
 interface GitPort { getStagedChanges(): Promise<GitDiff>; commit(message: string): Promise<void>; validateRepository(): Promise<boolean>; } interface LLMPort { generateCommit(diff: GitDiff, type: string): Promise<string>; validateConnection(): Promise<boolean>; } interface CommitUIPort { selectCommitType(): Promise<string>; previewMessage(message: string): Promise<boolean>; editMessage(message: string): Promise<string>; }
```### feature architecture

 #### commit generation feature```
CommitController ValidatePreconditions (GitRepo + Ollama Connection) GenerateCommit (AI + Conventional Commits) FormatValidator (Commit Format Rules) MessageNormalizer (Standardization) TypeEnforcer (Conventional Types)
```#### setup feature```
SetupController ValidateOllamaConnection (Connectivity Test) EnsureBaseModel (Model Availability) ProvisionCustomModel (Custom Model Creation) ConsoleSetupRenderer (Setup UI)
```### adapter implementations

 #### git adapter

 - technology shell commands via execa
 - operations git diff git status git commit git log
 - error handling git error parsing user-friendly messages

 #### ollama adapter

 - technology ollama.js library
 - models qwen2.5-coder1.5b custom system prompt
 - configuration temperature 0.2 131k context window
 - error recovery retry logic fallback strategies

 #### editor adapter

 - technology shell editor commands
 - editors support system default editor
 - integration temporary file creation cleanup

 ## data architecture

 ### data flow patterns

 #### commit generation flow```
1. CLI Command → Controller 2. Controller → ValidatePreconditions (Git + Ollama) 3. UI → SelectCommitType (User Input) 4. Controller → GenerateCommit (AI Processing) 5. UI → PreviewMessage (User Review) 6. Controller → GitAdapter.commit (Git Operation) 7. UI → Success Feedback
```#### setup flow```
1. CLI Command → SetupController 2. ValidateOllamaConnection (Connection Test) 3. EnsureBaseModel (Model Check) 4. ProvisionCustomModel (Model Creation) 5. ConsoleSetupRenderer (Progress Feedback) 6. Configuration Validation
```### configuration management

 #### model configuration```typescript
const CONVENTIONAL_COMMIT_MODEL_CONFIG = { model: 'devai-cli-commit:latest', baseModel: 'qwen2.5-coder:1.5b', systemPrompt: 'You are a Conventional Commits expert...', temperature: 0.2, num_ctx: 131072, keep_alive: 0, };
```#### error handling strategy```typescript
 AppError GitError (Repository issues) OllamaError (AI service issues) ValidationError (Input validation) ConfigurationError (Setup issues)
```## integration architecture

 ### external system integrations

 #### ollama integration

 - protocol http rest api
 - endpoint http//localhost11434
 - authentication none local instance
 - model management automatic provisioning validation

 #### git integration

 - protocol shell commands
 - operations status diff commit log
 - repository access current working directory
 - error handling git exit code parsing

 #### editor integration

 - protocol shell environment variables
 - editors editor environment variable
 - workflow temporary file creation editor launch file read cleanup

 ### security architecture

 #### privacy protection

 - local processing ai processing happens locally
 - external apis network calls external services
 - data persistence user data stored transmitted

 #### command security

 - input validation strict parameter validation
 - shell injection prevention parameterized shell commands
 - file system access limited current repository

 ## development architecture

 ### testing architecture```
Testing Pyramid │ E2E Tests │ │ (3 tests - complete workflows) │ │ Integration Tests │ │ (1 test - setup validation) │ │ Unit Tests │ │ (70+ tests - individual components) │
```### test infrastructure

 - mock adapters isolated testing predictable behavior
 - git harness temporary git repositories testing
 - performance tracking test execution time monitoring
 - coverage requirements 80 minimum coverage

 ### build architecture```
Build Pipeline Source (TypeScript) → tsup → Bundle (ESM) → Executable │ │ │ Type Checking Minification Node.js Shebang Error Prevention Size Reduction CLI Ready
```## deployment architecture

 ### distribution model

 - package npm package`devai-cli`- installation`npm install devai-cli`- binary generated javascript executable
 - dependencies runtime dependencies included

 ### runtime requirements

 - node.js v20 es2022 module support
 - ollama local instance compatible model
 - vram 2gb ai model loading
 - operating system cross-platform macos linux windows

 ## performance architecture

 ### ai model optimization

 - model selection qwen2.5-coder1.5b optimized code analysis
 - context management efficient git diff processing
 - memory management proper model lifecycle management
 - response time target 2s typical commits

 ### git operation optimization

 - diff processing streaming large repositories
 - caching smart caching git operations
 - error recovery graceful handling git repository issues

 ### cli performance

 - startup time fast module loading es modules
 - memory usage efficient memory management
 - user feedback progress indicators long operations

 ## quality assurance architecture

 ### code quality metrics

 - test coverage 80 across layers
 - typescript strictness full strict mode enabled
 - lint rules comprehensive eslint configuration
 - code complexity maximum 10 per function

 ### continuous integration

 - automated testing unit integration e2e tests
 - code quality linting formatting checks
 - type safety typescript compilation validation
 - build verification production build testing

 architecture ensures maintainability testability reliability providing fast private user-friendly cli experience ai-powered commit message generation.
````
