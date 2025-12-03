# source tree analysis - devai-cli

## project overview

project devai-cli - ai-powered git commit message generator
architecture clean architecture ports adapters
type cli tool typescript/node.js
entry point`src/index.ts``src/main.ts`## directory structure```
project-root/ src/ # Main source code (Clean Architecture) │ main.ts # Application composition root and CLI setup │ index.ts # Executable entry point with shebang │ core/ # Core business logic and ports │ │ index.ts # Core exports │ │ ports/ # Interface definitions (Hexagon) │ │ │ index.ts # Port exports │ │ │ commit-ui-port.ts # UI interface for commit operations │ │ │ editor-port.ts # External editor interface │ │ │ git-port.ts # Git operations interface │ │ │ llm-port.ts # LLM/AI interface │ │ │ setup-ui-port.ts # Setup UI interface │ │ types/ # Type definitions and domain models │ │ index.ts # Type exports │ │ commit.types.ts # Commit-related types │ │ errors.types.ts # Error handling types │ │ git-types.ts # Git operation types │ │ llm-types.ts # LLM interaction types │ │ prompt.types.ts # Prompt building types │ │ setup.types.ts # Setup configuration types │ features/ # Use cases organized by domain │ │ commit/ # Commit generation functionality │ │ │ controllers/ # Feature controllers (CLI command handlers) │ │ │ │ commit-controller.ts # Main commit command logic │ │ │ │ commit-controller.test.ts │ │ │ use-cases/ # Business logic use cases │ │ │ │ generate-commit.ts # Generate commit message │ │ │ │ validate-preconditions.ts # Validate git state │ │ │ │ [tests] # Unit tests for use cases │ │ │ utils/ # Commit-specific utilities │ │ │ format-validator.ts # Conventional commit validation │ │ │ message-normalizer.ts # Message formatting │ │ │ prompt-builder.ts # AI prompt construction │ │ │ type-enforcer.ts # Commit type enforcement │ │ setup/ # Initial setup functionality │ │ controllers/ # Setup command handlers │ │ │ setup-controller.ts │ │ use-cases/ # Setup business logic │ │ ensure-base-model.ts # Verify base model availability │ │ provision-custom-model.ts # Create custom model │ │ validate-ollama-connection.ts # Test Ollama connectivity │ infrastructure/ # External system adapters │ │ adapters/ # Implementation of ports │ │ │ editor/ # External editor integration │ │ │ │ shell-editor-adapter.ts # Shell command editor interface │ │ │ git/ # Git operations adapter │ │ │ │ shell-git-adapter.ts # Shell command git interface │ │ │ ollama/ # Ollama AI adapter │ │ │ ollama-adapter.ts # Ollama API client │ │ config/ # Configuration management │ │ │ conventional-commit-model.config.ts # AI model configuration │ │ logging/ # Debug logging setup │ │ debug-loggers.ts # Debug logger configuration │ ui/ # User interface adapters │ adapters/ # UI implementation │ │ commit-adapter.ts # CLI commit UI implementation │ commit/ # Commit UI components │ │ components/ # Reusable UI components │ │ action-selector/ # Commit action selection UI │ │ message-preview/ # Message preview UI │ │ type-selector/ # Commit type selection UI │ setup/ # Setup UI components │ console-setup-renderer.ts # Console-based setup UI tests/ # Integration and E2E tests │ e2e/ # End-to-end test scenarios │ │ commit-happy-path.test.ts # Full workflow tests │ │ commit-error-paths.test.ts # Error handling tests │ integration/ # Integration tests │ │ setup-auto-pull.test.ts # Setup integration tests │ helpers/ # Test utilities and mocks │ git-harness.ts # Git test environment setup │ mock-commit-ui.ts # UI component mocks │ mock-llm-provider.ts # LLM service mocks │ performance-tracker.ts # Test performance monitoring scripts/ # Build and utility scripts dist/ # Build output (generated) project-docs/ # Project documentation (empty) dev/ # Generated documentation and analysis

````## critical components analysis

 ### entry points

 -`src/index.ts`- shebang-enabled executable entry point
 -`src/main.ts`- composition root dependency injection setup

 ### core architecture layer

 - ports`src/core/ports/`define interfaces external dependencies
 - types`src/core/types/`domain models business logic types
 - follows hexagonal architecture pattern clean separation

 ### feature organization

 - commit feature complete commit generation workflow
 - setup feature ollama configuration model provisioning
 - feature follows controller use cases utils structure

 ### infrastructure layer

 - git adapter shell-based git operations
 - ollama adapter ai model communication
 - editor adapter external editor integration
 - configuration ai model settings parameters

 ### testing strategy

 - unit tests alongside source files`.test.ts`- integration tests real system integration
 - e2e tests complete user workflows
 - test helpers mocks utilities testing

 ### build quality tools

 - build tsup typescript bundling
 - testing vitest 80 coverage requirements
 - linting eslint strict typescript rules
 - formatting prettier import sorting

 ## integration points

 ### cli command flow```
CLI Input → Commander.js → Feature Controller → Use Cases → Adapters → External Systems
```### data flow

 1. setup cli setupcontroller ollamaadapter ollama api
 2. commit cli commitcontroller gitadapter ollamaadapter git ai

 ### external dependencies

 - ollama local ai model server
 - git version control system shell commands
 - editor system default editor shell commands

 ## architecture quality indicators

 clean architecture proper layer separation dependency inversion
 test coverage comprehensive unit integration e2e tests
 error handling custom error types remediation guidance
 configuration environment-based type safety
 build pipeline modern typescript tooling strict linting
 documentation well-structured code jsdoc comments
````
